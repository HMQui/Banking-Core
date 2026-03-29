/* eslint-disable @typescript-eslint/no-unsafe-argument */
// src/auth/guards/dpop.guard.ts
import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
    Inject,
    Logger,
} from '@nestjs/common';
import { Request } from 'express';
import Redis from 'ioredis';
import { decodeProtectedHeader, JWK } from 'jose';
import { DPoPUtil } from '../utils/dpop.util';
import { DPoPProofPayload } from '../interfaces/dpop-proof.interface';

@Injectable()
export class DPoPGuard implements CanActivate {
    private readonly logger = new Logger(DPoPGuard.name);

    constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const dpopHeader = request.headers['dpop'];
        const authorizationHeader = request.headers['authorization'];

        // Validate type to prevent runtime TypeError
        if (!dpopHeader || typeof dpopHeader !== 'string') {
            throw new UnauthorizedException('Missing or invalid DPoP header');
        }

        let accessToken = '';
        if (
            authorizationHeader &&
            typeof authorizationHeader === 'string' &&
            authorizationHeader.toLowerCase().startsWith('dpop ')
        ) {
            accessToken = authorizationHeader.substring(5);
        }

        try {
            const protectedHeader = decodeProtectedHeader(dpopHeader);

            if (!protectedHeader.jwk) {
                throw new UnauthorizedException(
                    'Missing JWK in DPoP protected header',
                );
            }

            const path = request.originalUrl.split('?')[0];

            const originalUrl = `${request.protocol}://${request.get('host')}${path}`;
            const method = request.method;

            const payload: DPoPProofPayload = await DPoPUtil.verifyDPoPProof(
                dpopHeader,
                protectedHeader.jwk as JWK,
                method,
                originalUrl,
                accessToken,
            );

            if (!payload.jti) {
                throw new UnauthorizedException(
                    'Missing JWT ID (jti) in DPoP proof',
                );
            }

            const jtiKey = `dpop:jti:${payload.jti}`;
            const isReplayed = await this.redisClient.get(jtiKey);

            if (isReplayed) {
                throw new UnauthorizedException(
                    'Replay attack detected. DPoP Proof already used.',
                );
            }

            await this.redisClient.set(jtiKey, '1', 'EX', 300);

            const methodsWithBody = ['POST', 'PUT', 'PATCH'];

            if (
                methodsWithBody.includes(method) &&
                request.body &&
                Object.keys(request.body).length > 0
            ) {
                if (!payload.ph) {
                    throw new UnauthorizedException(
                        'Missing payload hash (ph) claim in DPoP proof for mutating request',
                    );
                }

                const expectedPh = DPoPUtil.calculatePayloadHash(request.body);

                if (expectedPh !== payload.ph) {
                    throw new UnauthorizedException(
                        'Payload tampered or invalid payload hash',
                    );
                }
            }

            return true;
        } catch (error: any) {
            // Force log the exact error for debugging
            if (error instanceof Error) {
                this.logger.error(
                    `DPoP Validation Failed: ${error.message}`,
                    error.stack,
                );

                if (error instanceof UnauthorizedException) {
                    throw error;
                }
                // Throw exception instead of returning false to avoid silent 403
                throw new UnauthorizedException('Invalid DPoP proof');
            }
            return false;
        }
    }
}
