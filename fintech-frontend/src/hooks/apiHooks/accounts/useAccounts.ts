import { useState, useEffect, useCallback } from "react";
import { accountService } from "../../../api/accountService";
import type { AccountData } from "../../../types/account";

export const useAccounts = () => {
    const [accounts, setAccounts] = useState<AccountData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchAccounts = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await accountService.getAccounts();
            setAccounts(data);
        } catch (err) {
            setError(err instanceof Error ? err : new Error("Failed to fetch accounts"));
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Auto-fetch on mount
    useEffect(() => {
        fetchAccounts();
    }, [fetchAccounts]);

    return { accounts, isLoading, error, refetch: fetchAccounts };
};
