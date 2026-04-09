export type TransactionStatus = "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED" | string;

export type Currency = "USD" | "VND";

export type EntryType = "DEBIT" | "CREDIT";

export interface TransactionAccount {
    id: string;
    userId: string;
    accountName: string;
    accountNumber: string;
}

export interface Transaction {
    id: string;
    senderId?: string;
    receiverId?: string;
    amount: number;
    currency: Currency;
    status: TransactionStatus;
    description?: string;
    idempotencyKey: string;
    createdAt: string;
    updatedAt: string;
    sender?: TransactionAccount;
    receiver?: TransactionAccount;
}

export interface TransferPayload {
    senderAccountId: string;
    receiverAccountNumber: string;
    amount: number;
    currency: Currency;
    description?: string;
}

export interface GetHistoryQuery {
    page?: number;
    limit?: number;
    accountId?: string;
    startDate?: string; // ISO string (YYYY-MM-DD)
    endDate?: string; // ISO string (YYYY-MM-DD)
    type?: EntryType;
    description?: string;
}

export interface PaginatedTransactions {
    data: Transaction[];
    total: number;
    page: number;
    limit: number;
}

export interface LedgerEntry {
    id: string;
    transactionId: string;
    accountId: string;
    type: EntryType;
    amount: number;
    createdAt: string;
    transaction?: Transaction;
}

export interface PaginatedStatement {
    data: LedgerEntry[];
    total: number;
    page: number;
    limit: number;
}
