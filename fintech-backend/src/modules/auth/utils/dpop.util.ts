// src/auth/utils/dpop.util.ts
import * as crypto from 'crypto';
import { jwtVerify, importJWK, JWK, calculateJwkThumbprint } from 'jose';
import { DPoPProofPayload } from '../interfaces/dpop-proof.interface';

export class DPoPUtil {
    /**
     * Verifies the DPoP proof JWT signature and core claims (htu, htm, ath).
     */
    static async verifyDPoPProof(
        dpopHeader: string,
        jwk: JWK,
        method: string,
        url: string,
        accessToken?: string,
    ): Promise<DPoPProofPayload> {
        const publicKey = await importJWK(jwk, 'RS256');

        const { payload } = await jwtVerify<DPoPProofPayload>(
            dpopHeader,
            publicKey,
            {
                algorithms: ['RS256'],
                typ: 'dpop+jwt',
            },
        );

        if (
            typeof payload.jti !== 'string' ||
            typeof payload.htm !== 'string' ||
            typeof payload.htu !== 'string' ||
            typeof payload.iat !== 'number'
        ) {
            throw new Error('Invalid DPoP payload structure');
        }

        if (payload.htm !== method) {
            throw new Error('HTTP Method (htm) mismatch');
        }

        if (payload.htu !== url) {
            throw new Error('HTTP URL (htu) mismatch');
        }

        if (accessToken) {
            const expectedAth = crypto
                .createHash('sha256')
                .update(accessToken)
                .digest('base64url');

            if (payload.ath !== expectedAth) {
                throw new Error('Access Token Hash (ath) mismatch');
            }
        }

        return payload as DPoPProofPayload;
    }

    /**
     * Generates the JWK Thumbprint (jkt) used for device binding.
     */
    static async generateJwkThumbprint(jwk: JWK): Promise<string> {
        return await calculateJwkThumbprint(jwk, 'sha256');
    }

    /**
     * Calculates the SHA-256 hash of the payload and encodes it as Base64URL.
     * Used for the 'ph' (Payload Hash) claim to prevent data tampering.
     * Using JSON.stringify on a parsed object requires the Client and Server to serialize
     * the JSON with the exact same key order and formatting.
     */
    static calculatePayloadHash(payload: any): string {
        const payloadString =
            typeof payload === 'string' ? payload : JSON.stringify(payload);

        return crypto
            .createHash('sha256')
            .update(payloadString, 'utf8')
            .digest('base64url');
    }
}
