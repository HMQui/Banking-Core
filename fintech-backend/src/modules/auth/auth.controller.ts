import {
    Controller,
    Post,
    Body,
    Headers,
    Req,
    HttpCode,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './services/auth.service';
import { LoginRequestDto } from './dto/login-request.dto';
import { RefreshTokenRequestDto } from './dto/refresh-token-request.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { DPoPGuard } from './guards/dpop.guard';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { RegisterInitRequestDto } from './dto/register-init-request.dto';
import { RegisterVerifyRequestDto } from './dto/register-verify-request.dto';
import { plainToInstance } from 'class-transformer';

interface RequestWithUser extends Request {
    user?: JwtPayload;
}

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    /**
     * Initializes the registration process.
     * Caches user data in Redis and sends a 6-digit OTP via email.
     */
    @Post('register/init')
    @HttpCode(HttpStatus.OK)
    async registerInit(
        @Body() dto: RegisterInitRequestDto,
    ): Promise<{ message: string }> {
        return this.authService.registerInit(dto);
    }

    /**
     * Verifies the provided OTP.
     * If valid, persists the user to the database and completes registration.
     */
    @Post('register/verify')
    @HttpCode(HttpStatus.OK)
    async registerVerify(
        @Body() dto: RegisterVerifyRequestDto,
    ): Promise<{ message: string }> {
        return this.authService.registerVerify(dto);
    }

    /**
     * Authenticates the user and issues access/refresh tokens bound to the provided JWK.
     * This route is intentionally unprotected to establish the initial session.
     */
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() dto: LoginRequestDto): Promise<AuthResponseDto> {
        const authResponse = await this.authService.login(dto);

        return plainToInstance(AuthResponseDto, authResponse, {
            excludeExtraneousValues: true,
        });
    }

    /**
     * Rotates the refresh token and issues a new DPoP-bound access token.
     * Requires DPoP header validation to prevent MitM interception.
     * Note: JwtAuthGuard is omitted here as the provided access token might already be expired.
     */
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(
        @Body() dto: RefreshTokenRequestDto,
        @Headers('dpop') dpopHeader: string,
        @Req() request: Request,
    ): Promise<AuthResponseDto> {
        // Reconstruct the full original URL required for DPoP signature verification
        const originalUrl = `${request.protocol}://${request.get('host')}${request.originalUrl}`;

        const authResponse = await this.authService.refresh(
            dto,
            dpopHeader,
            request.method,
            originalUrl,
        );

        return plainToInstance(AuthResponseDto, authResponse, {
            excludeExtraneousValues: true,
        });
    }

    /**
     * Revokes the current active session.
     * Strictly protected by both JWT and DPoP guards to enforce Zero Trust architecture.
     */
    @UseGuards(JwtAuthGuard, DPoPGuard)
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(
        @Req() request: RequestWithUser,
    ): Promise<{ message: string }> {
        // Extract the session ID (sid) from the validated JWT payload
        const sessionId = request.user!.sid;
        await this.authService.logout(sessionId);

        return { message: 'Session successfully revoked.' };
    }
}
