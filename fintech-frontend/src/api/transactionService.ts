import axiosClient from "./axiosClient";
import type {
    TransferPayload,
    GetHistoryQuery,
    Transaction,
    PaginatedTransactions,
    PaginatedStatement,
} from "../types/transaction";

export const transactionService = {
    // Perform a fund transfer with idempotency key
    transfer: async (payload: TransferPayload, idempotencyKey: string): Promise<Transaction> => {
        return await axiosClient.post("/transactions/transfer", payload, {
            headers: {
                "x-idempotency-key": idempotencyKey,
            },
        });
    },

    // Fetch paginated transaction history
    getHistory: async (params?: GetHistoryQuery): Promise<PaginatedTransactions> => {
        return await axiosClient.get("/transactions/me", { params });
    },

    // Fetch double-entry ledger statement
    getStatement: async (params?: GetHistoryQuery): Promise<PaginatedStatement> => {
        return await axiosClient.get("/transactions/statement", { params });
    },
};
