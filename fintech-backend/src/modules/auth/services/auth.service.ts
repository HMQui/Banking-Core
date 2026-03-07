import {
    Injectable,
    UnauthorizedException,
    ForbiddenException,
    ConflictException,
    NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes, createHash } from 'crypto';
import { decodeProtectedHeader, JWK } from 'jose';

import { LoginRequestDto } from '../dto/login-request.dto';
import { RefreshTokenRequestDto } from '../dto/refresh-token-request.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { User, UserStatus } from '../../users/entities/user.entity';
import { Device } from '../entities/device.entity';
import { DevicesService } from './devices.service';
import { SessionsService } from './sessions.service';
import { PasswordUtil } from '../utils/password.util';
import { DPoPUtil } from '../utils/dpop.util';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { MailService } from '../../mail/mail.service';
import { OtpService } from './otp.service';
import { RegisterInitRequestDto } from '../dto/register-init-request.dto';
import { RegisterVerifyRequestDto } from '../dto/register-verify-request.dto';
import { UsersService } from '../../users/users.service';
import { ResetPasswordVerifyRequestDto } from '../dto/reset-password-verify-request.dto';
import { ResetPasswordInitRequestDto } from '../dto/reset-password-init-request.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly devicesService: DevicesService,
        private readonly sessionsService: SessionsService,
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly otpService: OtpService,
        private readonly mailService: MailService,
    ) {}

    // Core Login Logic: Validates credentials, binds device, issues tokens
    async login(dto: LoginRequestDto): Promise<AuthResponseDto> {
        try {
            // 1. Validate User
            const user = await this.userRepository.findOne({
                where: { email: dto.email },
            });

            if (!user || user.status === UserStatus.LOCKED) {
                throw new UnauthorizedException(
                    'Invalid credentials or account locked',
                );
            }

            // 2. Verify Password
            const isPasswordValid = await PasswordUtil.compare(
                dto.password,
                user.passwordHash,
            );
            if (!isPasswordValid) {
                throw new UnauthorizedException('Invalid credentials');
            }

            // 3. Process JWK to generate Thumbprint (jkt)
            const jkt = await DPoPUtil.generateJwkThumbprint(dto.publicKey);

            // 4. Device Binding: Find existing or create new device
            let device = await this.devicesService.findByThumbprint(jkt);
            if (!device) {
                device = await this.devicesService.create({
                    userId: user.id,
                    deviceName: dto.deviceName,
                    userAgent: dto.userAgent,
                    publicKeyThumbprint: jkt,
                    lastActiveAt: new Date(),
                });
            } else {
                device = await this.devicesService.updateLastActive(device.id);
            }

            // 5. Revoke all existing sessions for this device to enforce single active session per device
            await this.sessionsService.revokeAllForDevice(device.id);

            // 6. Generate and return tokens
            return this.generateTokens(user, device);
        } catch (error) {
            if (
                error instanceof UnauthorizedException ||
                error instanceof ConflictException
            ) {
                throw error;
            }
            throw new UnauthorizedException(
                'Login failed. Please try again later.',
            );
        }
    }

    // Refresh Token Rotation Logic with DPoP Anti-MitM and Reuse Detection
    async refresh(
        dto: RefreshTokenRequestDto,
        dpopHeader: string,
        expectedMethod: string,
        expectedUrl: string,
    ): Promise<AuthResponseDto> {
        if (!dpopHeader) {
            throw new UnauthorizedException('Missing DPoP header');
        }

        // 1. Hash the incoming RT to find the session
        const tokenHash = createHash('sha256')
            .update(dto.refreshToken)
            .digest('base64url');
        const session = await this.sessionsService.findByTokenHash(tokenHash);

        if (!session || !session.device || !session.device.user) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        // 2. REUSE DETECTION
        if (session.isRevoked) {
            await this.sessionsService.revokeTokenFamily(session.id);
            throw new ForbiddenException(
                'Security breach detected. Token family revoked.',
            );
        }

        // 3. Verify Expiration
        if (new Date() > session.expiresAt) {
            throw new UnauthorizedException('Refresh token expired');
        }

        // 4. DPoP Verification for the Refresh Request (Anti-MitM)
        const protectedHeader = decodeProtectedHeader(dpopHeader);
        if (!protectedHeader.jwk) {
            throw new UnauthorizedException('Missing JWK in DPoP header');
        }

        await DPoPUtil.verifyDPoPProof(
            dpopHeader,
            protectedHeader.jwk,
            expectedMethod,
            expectedUrl,
        );

        // Cross-check: Ensure the sender holds the same private key as the original device
        const jkt = await DPoPUtil.generateJwkThumbprint(
            protectedHeader.jwk as JWK,
        );
        if (jkt !== session.device.publicKeyThumbprint) {
            throw new ForbiddenException('DPoP thumbprint mismatch');
        }

        // 5. ROTATION: Revoke old session and issue new tokens linked via parent_id
        await this.sessionsService.revokeSession(session.id);
        return this.generateTokens(
            session.device.user,
            session.device,
            session.id,
        );
    }

    // Logout: Revoke the current active session
    async logout(sessionId: string): Promise<void> {
        await this.sessionsService.revokeSession(sessionId);
    }

    // Private helper to issue AT and RT uniformly
    private async generateTokens(
        user: User,
        device: Device,
        parentSessionId?: string,
    ): Promise<AuthResponseDto> {
        // 1. Generate Opaque Refresh Token (64 bytes -> base64url)
        const refreshToken = randomBytes(64).toString('base64url');
        const tokenHash = createHash('sha256')
            .update(refreshToken)
            .digest('base64url');

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // RT valid for 30 days

        // 2. Create Session (Stateful Anchor)
        const session = await this.sessionsService.create({
            deviceId: device.id,
            tokenHash: tokenHash,
            expiresAt: expiresAt,
            parentId: parentSessionId || null,
            isRevoked: false,
        });

        // 3. Generate Access Token JWT bound to Device Thumbprint
        const payload: JwtPayload = {
            sub: user.id,
            sid: session.id,
            deviceId: device.id,
            cnf: { jkt: device.publicKeyThumbprint },
        };

        // AT valid for 15 mins
        const accessToken: string = this.jwtService.sign(payload, {
            expiresIn: '15m',
        });

        return {
            accessToken,
            refreshToken,
            expiresIn: 15 * 60,
            user,
        };
    }

    async registerInit(
        dto: RegisterInitRequestDto,
    ): Promise<{ message: string }> {
        // 1. Validate email uniqueness
        const existingUser = await this.userRepository.findOne({
            where: { email: dto.email },
        });
        if (existingUser) {
            throw new ConflictException('Email is already registered.');
        }

        // 2. Remove existing pending OTP in Redis (if any)
        const existingPending = await this.otpService.getRegistrationData(
            dto.email,
        );
        if (existingPending) {
            await this.otpService.deleteRegistrationData(dto.email);
        }

        // 3. Hash the password securely
        const passwordHash = await PasswordUtil.hash(dto.password);

        // 4. Generate a secure 6-digit OTP
        const otp = this.otpService.generateOtp();

        // 5. Cache the pending registration data in Redis (TTL: 5 minutes)
        await this.otpService.saveRegistrationData(dto.email, {
            email: dto.email,
            passwordHash,
            fullName: dto.fullName,
            otp,
        });

        // 6. Dispatch the OTP email
        await this.mailService.sendOtpEmail(dto.email, otp, dto.fullName);

        return {
            message:
                'OTP has been sent to your email. Please verify within 5 minutes.',
        };
    }

    async registerVerify(
        dto: RegisterVerifyRequestDto,
    ): Promise<{ message: string }> {
        // 1. Verify OTP and extract the cached payload from Redis
        const pendingData = await this.otpService.verifyAndRetrieveData(
            dto.email,
            dto.otp,
        );

        // 2. Prevent race conditions (ensure the email wasn't registered during the OTP window)
        const existingUser = await this.userRepository.findOne({
            where: { email: pendingData.email },
        });
        if (existingUser) {
            throw new ConflictException('User already exists.');
        }

        // 3. Persist the new user to the primary database via UsersService
        await this.usersService.create({
            email: pendingData.email,
            passwordHash: pendingData.passwordHash,
            fullName: pendingData.fullName,
        });

        return { message: 'Registration successful. You can now log in.' };
    }

    async resetPasswordInit(
        dto: ResetPasswordInitRequestDto,
    ): Promise<{ message: string }> {
        // 1. Verify user exists
        const user = await this.userRepository.findOne({
            where: { email: dto.email },
        });

        if (!user) {
            // Anti-enumeration: Return generic message even if user doesn't exist
            return {
                message:
                    'If the information is correct, an OTP has been sent to the email.',
            };
        }

        if (user.status === UserStatus.LOCKED) {
            throw new ForbiddenException('Account is locked.');
        }

        // 2. Verify current password
        const isPasswordValid = await PasswordUtil.compare(
            dto.currentPassword,
            user.passwordHash,
        );

        if (!isPasswordValid) {
            // To prevent brute-force, you might want to throw an error or handle it securely
            throw new UnauthorizedException('Invalid current password.');
        }

        // 3. Remove existing pending reset OTP in Redis (if any)
        const existingPending = await this.otpService.getResetData(dto.email);
        if (existingPending) {
            await this.otpService.deleteResetData(dto.email);
        }

        // 4. Generate a secure 6-digit OTP
        const otp = this.otpService.generateOtp();

        // 5. Cache the pending reset data in Redis (TTL: 5 minutes)
        await this.otpService.saveResetData(dto.email, {
            email: dto.email,
            otp,
        });

        // 6. Dispatch the Reset OTP email
        await this.mailService.sendResetOtpEmail(dto.email, otp, user.fullName);

        return {
            message:
                'If the information is correct, an OTP has been sent to the email.',
        };
    }

    async resetPasswordVerify(
        dto: ResetPasswordVerifyRequestDto,
    ): Promise<{ message: string }> {
        // 1. Verify OTP and extract the cached payload from Redis
        const pendingData = await this.otpService.verifyAndRetrieveResetData(
            dto.email,
            dto.otp,
        );

        // 2. Find the user
        const user = await this.userRepository.findOne({
            where: { email: pendingData.email },
        });

        if (!user) {
            throw new NotFoundException('User not found.');
        }

        // 3. Hash the new password securely
        const newPasswordHash = await PasswordUtil.hash(dto.newPassword);

        // 4. Update the password in database
        user.passwordHash = newPasswordHash;
        await this.userRepository.save(user);

        // 5. Security measure: Revoke all active sessions and devices
        // Forces the user to log in again with the new password on all devices
        const userDevices = await this.devicesService.findAllByUserId(user.id);
        for (const device of userDevices) {
            await this.sessionsService.revokeAllForDevice(device.id);
        }

        return {
            message:
                'Password has been reset successfully. You can now log in.',
        };
    }
}
