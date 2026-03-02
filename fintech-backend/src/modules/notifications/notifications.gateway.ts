/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { decodeProtectedHeader, JWK } from 'jose';
import { DPoPUtil } from '../auth/utils/dpop.util';
import { DPoPProofPayload } from '../auth/interfaces/dpop-proof.interface';

// Extended payload to match jwt.strategy.ts requirements
interface JwtPayload {
    sub?: string;
    cnf?: { jkt: string };
    [key: string]: any;
}

// Client must send both token and dpop proof in the socket auth payload
type AuthPayload = { token?: string; dpop?: string } | undefined;

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class NotificationsGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
    @WebSocketServer()
    public server!: Server;

    private readonly logger = new Logger(NotificationsGateway.name);

    constructor(private readonly jwtService: JwtService) {}

    public afterInit(_server: Server): void {
        this.logger.log('WebSocket gateway initialized');
    }

    public async handleConnection(client: Socket): Promise<void> {
        try {
            const authPayload = client.handshake.auth as AuthPayload;
            const token = authPayload?.token;
            const dpopProof = authPayload?.dpop;

            if (!token || !dpopProof) {
                this.logger.warn(
                    `Client ${client.id} disconnected: missing credentials`,
                );
                client.disconnect();
                return;
            }

            const payload = await this.jwtService.verifyAsync<JwtPayload>(
                token,
                {
                    secret: process.env.SECRET_KEY ?? 'default_secret',
                },
            );

            if (!payload?.sub || !payload.cnf?.jkt) {
                this.logger.warn(
                    `Client ${client.id} disconnected: invalid token structure`,
                );
                client.disconnect();
                return;
            }

            const userId = String(payload.sub);

            const protectedHeader = decodeProtectedHeader(dpopProof) as {
                jwk?: unknown;
            };
            if (!protectedHeader.jwk) {
                this.logger.warn(
                    `Client ${client.id} disconnected: missing JWK in DPoP header`,
                );
                client.disconnect();
                return;
            }

            const headers = client.request.headers as Record<string, unknown>;
            const proto = (headers['x-forwarded-proto'] as string) ?? 'http';
            const host = (headers.host as string) ?? '';
            const requestUrl = client.request.url ?? '';
            const originalUrl = `${proto}://${host}${requestUrl}`;
            const method = 'GET';

            const _verifiedDpopPayload: DPoPProofPayload =
                await DPoPUtil.verifyDPoPProof(
                    dpopProof,
                    protectedHeader.jwk as JWK,
                    method,
                    originalUrl,
                    token,
                );

            await client.join(String(userId));

            this.logger.log(
                `Client ${client.id} authenticated and joined ${userId}`,
            );
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            this.logger.error(
                `Authentication error for client ${client.id}: ${message}`,
            );
            client.disconnect();
        }
    }

    public handleDisconnect(client: Socket): void {
        this.logger.log(`Client disconnected: ${client.id}`);
    }
}
