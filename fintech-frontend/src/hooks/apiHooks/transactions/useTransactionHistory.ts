import { useState, useEffect, useCallback } from "react";
import { transactionService } from "../../../api/transactionService";
import type { PaginatedTransactions, GetHistoryQuery } from "../../../types/transaction";

export const useTransactionHistory = (initialQuery?: GetHistoryQuery) => {
    const [history, setHistory] = useState<PaginatedTransactions | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    // Manage current query state inside the hook
    const [query, setQuery] = useState<GetHistoryQuery>({
        page: 1,
        limit: 10,
        ...initialQuery,
    });

    const fetchHistory = useCallback(async (currentQuery: GetHistoryQuery) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await transactionService.getHistory(currentQuery);
            setHistory(data);
        } catch (err) {
            setError(err instanceof Error ? err : new Error("Failed to fetch transaction history"));
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Auto-fetch when query state changes
    useEffect(() => {
        fetchHistory(query);
    }, [query, fetchHistory]);

    // Helper to update specific filters and reset to page 1
    const updateFilters = (newFilters: Partial<GetHistoryQuery>) => {
        setQuery((prev) => ({ ...prev, ...newFilters, page: 1 }));
    };

    // Helper for pagination
    const changePage = (newPage: number) => {
        setQuery((prev) => ({ ...prev, page: newPage }));
    };

    return {
        history,
        isLoading,
        error,
        query,
        updateFilters,
        changePage,
        refetch: () => fetchHistory(query),
    };
};
