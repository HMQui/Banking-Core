/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import type Redis from 'ioredis';
import { randomInt } from 'crypto';

export interface PendingRegistrationData {
    email: string;
    passwordHash: string;
    fullName: string;
    otp: string;
}

export interface PendingResetData {
    email: string;
    otp: string;
}

@Injectable()
export class OtpService {
    private readonly OTP_TTL_SECONDS = 300;
    private readonly REDIS_PREFIX = 'register:otp:';

    // Separate prefix to prevent key collision with registration
    private readonly RESET_REDIS_PREFIX = 'reset:otp:';

    constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}

    /**
     * Generates a 6-digit OTP code.
     * @returns A 6-digit string.
     */
    generateOtp(): string {
        return randomInt(100000, 999999).toString();
    }

    /**
     * Stores the user's registration payload and OTP in Redis with a TTL.
     * @param email The user's email, used as the Redis key suffix.
     * @param data The payload containing password hash, full name, and the OTP.
     */
    async saveRegistrationData(
        email: string,
        data: PendingRegistrationData,
    ): Promise<void> {
        const key = `${this.REDIS_PREFIX}${email}`;
        const payload = JSON.stringify(data);

        await this.redisClient.set(key, payload, 'EX', this.OTP_TTL_SECONDS);
    }

    /**
     * Retrieves pending registration data without validating OTP.
     * @param email The user's email.
     * @returns The stored registration payload or null if not found.
     */
    async getRegistrationData(
        email: string,
    ): Promise<PendingRegistrationData | null> {
        const key = `${this.REDIS_PREFIX}${email}`;
        const storedDataString = await this.redisClient.get(key);

        if (!storedDataString) return null;

        return JSON.parse(storedDataString) as PendingRegistrationData;
    }

    /**
     * Deletes pending registration data from Redis.
     * @param email The user's email.
     */
    async deleteRegistrationData(email: string): Promise<void> {
        const key = `${this.REDIS_PREFIX}${email}`;
        await this.redisClient.del(key);
    }

    /**
     * Verifies the OTP and retrieves the pending registration data.
     * Automatically deletes the Redis key upon successful validation to prevent reuse.
     * @param email The user's email.
     * @param providedOtp The OTP submitted by the user.
     * @returns The user data required to finalize database insertion.
     */
    async verifyAndRetrieveData(
        email: string,
        providedOtp: string,
    ): Promise<Omit<PendingRegistrationData, 'otp'>> {
        const key = `${this.REDIS_PREFIX}${email}`;
        const storedDataString = await this.redisClient.get(key);

        if (!storedDataString) {
            throw new BadRequestException('OTP has expired or does not exist.');
        }

        const storedData: PendingRegistrationData = JSON.parse(
            storedDataString,
        ) as PendingRegistrationData;

        if (storedData.otp !== providedOtp) {
            throw new BadRequestException('Invalid OTP.');
        }

        await this.redisClient.del(key);

        const { otp, ...userData } = storedData;
        return userData;
    }

    async saveResetData(email: string, data: PendingResetData): Promise<void> {
        const key = `${this.RESET_REDIS_PREFIX}${email}`;
        const payload = JSON.stringify(data);

        await this.redisClient.set(key, payload, 'EX', this.OTP_TTL_SECONDS);
    }

    async getResetData(email: string): Promise<PendingResetData | null> {
        const key = `${this.RESET_REDIS_PREFIX}${email}`;
        const storedDataString = await this.redisClient.get(key);

        if (!storedDataString) return null;

        return JSON.parse(storedDataString) as PendingResetData;
    }

    async deleteResetData(email: string): Promise<void> {
        const key = `${this.RESET_REDIS_PREFIX}${email}`;
        await this.redisClient.del(key);
    }

    async verifyAndRetrieveResetData(
        email: string,
        providedOtp: string,
    ): Promise<Omit<PendingResetData, 'otp'>> {
        const key = `${this.RESET_REDIS_PREFIX}${email}`;
        const storedDataString = await this.redisClient.get(key);

        if (!storedDataString) {
            throw new BadRequestException('OTP has expired or does not exist.');
        }

        const storedData: PendingResetData = JSON.parse(
            storedDataString,
        ) as PendingResetData;

        if (storedData.otp !== providedOtp) {
            throw new BadRequestException('Invalid OTP.');
        }

        await this.redisClient.del(key);

        const { otp, ...userData } = storedData;
        return userData;
    }
}
