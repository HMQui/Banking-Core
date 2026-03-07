import axiosClient from "./axiosClient";
import type { SecurityInfo, UpdateProfilePayload, UserProfile } from "../types/user";

export const userService = {
    getProfile: async (): Promise<UserProfile> => {
        return await axiosClient.get("/users/me");
    },

    updateProfile: async (data: UpdateProfilePayload): Promise<UserProfile> => {
        return await axiosClient.patch("/users/me", data);
    },

    getSecurityInfo: async (): Promise<SecurityInfo> => {
        return await axiosClient.get("/users/me/security");
    },
};
