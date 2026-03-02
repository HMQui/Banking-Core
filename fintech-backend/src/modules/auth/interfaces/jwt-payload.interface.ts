export interface JwtPayload {
    // Subject (User ID)
    sub: string;

    // Session ID to track the specific login session
    sid: string;

    // Device ID bound to this token
    deviceId: string;

    // JWK SHA-256 Thumbprint for DPoP verification
    cnf: {
        jkt: string;
    };

    // Issued at
    iat?: number;

    // Expiration time
    exp?: number;
}
