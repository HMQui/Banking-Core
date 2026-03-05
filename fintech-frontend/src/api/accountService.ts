import type { AccountData, CreateAccountPayload, UpdateAccountPayload } from "../types/account";
import axiosClient from "./axiosClient";


export const accountService = {
    // Accounts
    getAccounts: async (): Promise<AccountData[]> => {
        return await axiosClient.get("/accounts/me");
    },

    createAccount: async (payload: CreateAccountPayload): Promise<AccountData> => {
        return await axiosClient.post("/accounts/me", payload);
    },

    updateAccount: async (payload: UpdateAccountPayload): Promise<AccountData> => {
        // Assuming backend will be fixed to use PATCH for updates
        return await axiosClient.patch("/accounts/me", payload);
    },
};
