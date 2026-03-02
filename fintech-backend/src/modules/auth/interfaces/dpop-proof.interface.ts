export interface DPoPProofHeader {
    // Token type, must be 'dpop+jwt'
    typ: string;

    // Algorithm used for signature
    alg: string;

    // The public key in JWK format
    jwk: Record<string, any>;
}

export interface DPoPProofPayload {
    // Unique identifier for the DPoP proof to prevent replay attacks
    jti: string;

    // The HTTP method of the request
    htm: string;

    // The HTTP URL of the request
    htu: string;

    // Issued at timestamp
    iat: number;

    // Optional: Hash of the request payload (required for requests with a body)
    ph?: string;

    // Optional: Hash of the access token (required for requests presenting an access token)
    ath?: string;
}
