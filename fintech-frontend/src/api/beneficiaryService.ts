import type {
    Beneficiary,
    CreateBeneficiaryPayload,
    UpdateBeneficiaryPayload,
} from "../types/beneficiary";
import axiosClient from "./axiosClient";

export const beneficiaryService = {
    getBeneficiaries: async (): Promise<Beneficiary[]> => {
        return await axiosClient.get("/accounts/me/beneficiaries");
    },

    createBeneficiary: async (payload: CreateBeneficiaryPayload): Promise<Beneficiary> => {
        return await axiosClient.post("/accounts/me/beneficiaries", payload);
    },

    updateBeneficiary: async (
        id: string,
        payload: UpdateBeneficiaryPayload,
    ): Promise<Beneficiary> => {
        return await axiosClient.patch(`/accounts/me/beneficiaries/${id}`, payload);
    },

    deleteBeneficiary: async (id: string): Promise<void> => {
        return await axiosClient.delete(`/accounts/me/beneficiaries/${id}`);
    },
};
