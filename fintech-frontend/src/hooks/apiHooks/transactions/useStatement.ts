import { useState, useEffect, useCallback } from "react";
import { transactionService } from "../../../api/transactionService";
import type { PaginatedStatement, GetHistoryQuery } from "../../../types/transaction";

export const useStatement = (initialQuery?: GetHistoryQuery) => {
    const [statement, setStatement] = useState<PaginatedStatement | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchStatement = useCallback(async (query?: GetHistoryQuery) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await transactionService.getStatement(query);
            setStatement(data);
        } catch (err) {
            setError(err instanceof Error ? err : new Error("Failed to fetch statement"));
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Auto-fetch on mount
    useEffect(() => {
        fetchStatement(initialQuery);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchStatement]);

    return { statement, isLoading, error, refetch: fetchStatement };
};
