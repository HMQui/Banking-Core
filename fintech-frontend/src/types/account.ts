export const Currency = {
    VND: "VND",
    USD: "USD",
} as const;

export type Currency = (typeof Currency)[keyof typeof Currency];

export interface AccountData {
    id: string;
    userId: string;
    accountNumber: string;
    accountName: string;
    isPrimary: boolean;
    currency: Currency;
    balance: number;
    version: number;
    createdAt: string | Date;
    updatedAt: string | Date;
}

export interface CreateAccountPayload {
    currency: Currency;
    accountName: string;
    isPrimary?: boolean;
}

export interface UpdateAccountPayload {
    id: string;
    accountName?: string;
    isPrimary?: boolean;
}
