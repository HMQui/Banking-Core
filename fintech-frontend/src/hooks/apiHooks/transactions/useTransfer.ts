import { useState } from "react";
import { transactionService } from "../../../api/transactionService";
import type { TransferPayload, Transaction } from "../../../types/transaction";

export const useTransfer = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const executeTransfer = async (
        payload: TransferPayload,
        idempotencyKey: string,
    ): Promise<Transaction> => {
        setIsLoading(true);
        setError(null);
        try {
            const transaction = await transactionService.transfer(payload, idempotencyKey);
            return transaction;
        } catch (err) {
            setError(err instanceof Error ? err : new Error("Transfer failed"));
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { executeTransfer, isLoading, error };
};
