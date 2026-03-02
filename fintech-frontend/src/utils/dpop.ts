import { exportJWK, generateKeyPair, SignJWT, type JWK, type KeyObject } from "jose";

let privateKey: KeyObject | null = null;
let publicKeyJwk: JWK | null = null;

const DB_NAME = "CoreBankDB";
const STORE_NAME = "security_store";
const KEY_ID = "dpop_keypair";

interface StoredKeyPair {
    privateKey: KeyObject;
    publicKeyJwk: JWK;
}

// Initialize IndexedDB
const getDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

// Save keys securely
const saveKeysToDB = async (privKey: KeyObject, pubKeyJwk: JWK): Promise<void> => {
    const db = await getDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).put({ privateKey: privKey, publicKeyJwk: pubKeyJwk }, KEY_ID);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
};

// Load keys after page reload
const loadKeysFromDB = async (): Promise<StoredKeyPair | null> => {
    const db = await getDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const request = tx.objectStore(STORE_NAME).get(KEY_ID);
        request.onsuccess = () => resolve(request.result as StoredKeyPair | null);
        request.onerror = () => reject(tx.error);
    });
};

// Revoke keys on logout
export const clearDPoPKeys = async (): Promise<void> => {
    privateKey = null;
    publicKeyJwk = null;
    const db = await getDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).delete(KEY_ID);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
};

export const initDPoPKeys = async (forceNew: boolean = false): Promise<JWK> => {
    if (!forceNew) {
        if (privateKey && publicKeyJwk) return publicKeyJwk;

        const stored = await loadKeysFromDB();
        if (stored) {
            privateKey = stored.privateKey;
            publicKeyJwk = stored.publicKeyJwk;
            return publicKeyJwk;
        }
    }

    const { publicKey, privateKey: generatedPrivateKey } = await generateKeyPair("RS256", {
        extractable: true,
    });
    privateKey = generatedPrivateKey;
    publicKeyJwk = await exportJWK(publicKey);

    await saveKeysToDB(privateKey, publicKeyJwk);
    return publicKeyJwk;
};

export const calculateHashBase64Url = async (input: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const base64 = btoa(String.fromCharCode.apply(null, hashArray));
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

interface DPoPProofOptions {
    url: string;
    method: string;
    accessToken?: string;
    payloadString?: string;
}

export const createDPoPProof = async ({
    url,
    method,
    accessToken,
    payloadString,
}: DPoPProofOptions): Promise<string> => {
    if (!privateKey) await initDPoPKeys();
    if (!privateKey || !publicKeyJwk) throw new Error("DPoP keys not found. Please login.");

    const payload: Record<string, string> = {
        htu: url,
        htm: method.toUpperCase(),
        jti: crypto.randomUUID(),
    };
    
    if (accessToken) {
        payload.ath = await calculateHashBase64Url(accessToken);
    }

    if (payloadString && ["POST", "PUT", "PATCH"].includes(payload.htm)) {
        payload.ph = await calculateHashBase64Url(payloadString);
    }

    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "RS256", typ: "dpop+jwt", jwk: publicKeyJwk })
        .setIssuedAt()
        .sign(privateKey);
};
