import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    private readonly logger = new Logger(JwtStrategy.name);

    constructor(private readonly configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: Request) => {
                    if (!request) {
                        console.log('[JWT] No request object');
                        return null;
                    }

                    const authHeader = request.headers['authorization'];

                    if (
                        authHeader &&
                        typeof authHeader === 'string' &&
                        authHeader.toLowerCase().startsWith('dpop ')
                    ) {
                        const token = authHeader.split(' ')[1];
                        console.log('[JWT] Extract token success');
                        return token;
                    }

                    console.log('[JWT] Token not found or invalid format');
                    return null;
                },
            ]),
            ignoreExpiration: false,
            // Ensure ConfigService is used to get the dynamic env variable
            secretOrKey:
                configService.get<string>('SECRET_KEY') || 'default_secret_key',
        });

        this.logger.log('JwtStrategy initialized');
    }

    validate(payload: JwtPayload) {
        this.logger.log('Validate function called');

        // Check for required DPoP and standard JWT claims
        if (!payload.sub || !payload.cnf) {
            this.logger.error('Payload missing sub or cnf claim');
            throw new UnauthorizedException('Invalid token payload structure');
        }

        this.logger.log('Payload validation success');

        return payload;
    }
}
