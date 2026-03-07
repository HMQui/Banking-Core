export interface Beneficiary {
    id: string;
    nickname: string;
    accountNumber: string;
    bankName: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CreateBeneficiaryPayload {
    nickname: string;
    accountNumber: string;
    bankName: string;
}

export interface UpdateBeneficiaryPayload {
    nickname?: string;
    accountNumber?: string;
    bankName?: string;
}
