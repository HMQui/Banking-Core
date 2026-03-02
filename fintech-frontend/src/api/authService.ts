import axiosClient from "./axiosClient";
import { initDPoPKeys, clearDPoPKeys } from "../utils/dpop";
import type { UserProfile } from "../types/user";

export interface LoginPayload {
    email: string;
    password: string;
    deviceName: string;
    userAgent: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: UserProfile;
}

export const authService = {
    login: async (credentials: LoginPayload): Promise<AuthResponse> => {
        // Force new ephemeral keys per session
        const jwk = await initDPoPKeys(true);

        return await axiosClient.post("/auth/login", {
            ...credentials,
            publicKey: jwk,
        });
    },

    logout: async (): Promise<void> => {
        await axiosClient.post("/auth/logout");
        await clearDPoPKeys();
    },

    registerInit: async (email: string, password: string, fullName: string): Promise<void> => {
        await axiosClient.post("/auth/register/init", { email, password, fullName });
    },

    registerVerify: async (email: string, otp: string): Promise<void> => {
        await axiosClient.post("/auth/register/verify", { email, otp });
    },

    refresh: async (refreshToken: string): Promise<AuthResponse> => {
        return await axiosClient.post("/auth/refresh", {
            refreshToken,
        });
    },

    getProfile: async (): Promise<UserProfile> => {
        return await axiosClient.get("/users/me");
    },
};
