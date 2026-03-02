import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { Request } from 'express';

const SK = process.env.SECRET_KEY || 'default_secret_key';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    private readonly logger = new Logger(JwtStrategy.name);

    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: Request) => {
                    if (!request) {
                        console.log('[JWT] No request object');
                        return null;
                    }
                    console.log(request.headers);

                    const authHeader = request.headers['authorization'];
                    console.log('[JWT] Authorization Header:', authHeader);

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
            secretOrKey: SK,
        });

        this.logger.log('JwtStrategy initialized');
    }

    validate(payload: JwtPayload) {
        this.logger.log('Validate function called');
        this.logger.debug(`Payload received: ${JSON.stringify(payload)}`);

        if (!payload.sub) {
            this.logger.error('Payload missing sub');
            throw new UnauthorizedException('Invalid token payload structure');
        }

        if (!payload.cnf) {
            this.logger.error('Payload missing cnf');
            throw new UnauthorizedException('Invalid token payload structure');
        }

        this.logger.log('Payload validation success');

        return payload;
    }
}
