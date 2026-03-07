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
import { ResetPasswordInitRequestDto } from './dto/reset-password-init-request.dto';
import { ResetPasswordVerifyRequestDto } from './dto/reset-password-verify-request.dto';
import { plainToInstance } from 'class-transformer';

interface RequestWithUser extends Request {
    user?: JwtPayload;
}

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register/init')
    @HttpCode(HttpStatus.OK)
    async registerInit(
        @Body() dto: RegisterInitRequestDto,
    ): Promise<{ message: string }> {
        return this.authService.registerInit(dto);
    }

    @Post('register/verify')
    @HttpCode(HttpStatus.OK)
    async registerVerify(
        @Body() dto: RegisterVerifyRequestDto,
    ): Promise<{ message: string }> {
        return this.authService.registerVerify(dto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() dto: LoginRequestDto): Promise<AuthResponseDto> {
        const authResponse = await this.authService.login(dto);

        return plainToInstance(AuthResponseDto, authResponse, {
            excludeExtraneousValues: true,
        });
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(
        @Body() dto: RefreshTokenRequestDto,
        @Headers('dpop') dpopHeader: string,
        @Req() request: Request,
    ): Promise<AuthResponseDto> {
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

    @UseGuards(JwtAuthGuard, DPoPGuard)
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(
        @Req() request: RequestWithUser,
    ): Promise<{ message: string }> {
        const sessionId = request.user!.sid;
        await this.authService.logout(sessionId);

        return { message: 'Session successfully revoked.' };
    }

    @UseGuards(JwtAuthGuard, DPoPGuard)
    @Post('reset-password/init')
    @HttpCode(HttpStatus.OK)
    async resetPasswordInit(
        @Body() dto: ResetPasswordInitRequestDto,
    ): Promise<{ message: string }> {
        return this.authService.resetPasswordInit(dto);
    }

    @UseGuards(JwtAuthGuard, DPoPGuard)
    @Post('reset-password/verify')
    @HttpCode(HttpStatus.OK)
    async resetPasswordVerify(
        @Body() dto: ResetPasswordVerifyRequestDto,
    ): Promise<{ message: string }> {
        return this.authService.resetPasswordVerify(dto);
    }
}
