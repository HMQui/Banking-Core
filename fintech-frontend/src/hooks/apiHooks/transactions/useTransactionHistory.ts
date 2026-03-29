import { useState, useEffect, useCallback } from "react";
import { transactionService } from "../../../api/transactionService";
import type { PaginatedTransactions, GetHistoryQuery } from "../../../types/transaction";

export const useTransactionHistory = (initialQuery?: GetHistoryQuery) => {
    const [history, setHistory] = useState<PaginatedTransactions | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchHistory = useCallback(async (query?: GetHistoryQuery) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await transactionService.getHistory(query);
            setHistory(data);
        } catch (err) {
            setError(err instanceof Error ? err : new Error("Failed to fetch transaction history"));
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Auto-fetch on mount
    useEffect(() => {
        fetchHistory(initialQuery);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchHistory]);

    return { history, isLoading, error, refetch: fetchHistory };
};
