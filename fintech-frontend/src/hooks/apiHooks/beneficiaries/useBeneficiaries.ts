import { useState, useEffect, useCallback } from "react";
import { beneficiaryService } from "../../../api/beneficiaryService";
import type { Beneficiary } from "../../../types/beneficiary";

export const useBeneficiaries = () => {
    const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchBeneficiaries = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await beneficiaryService.getBeneficiaries();
            setBeneficiaries(data);
        } catch (err) {
            setError(err instanceof Error ? err : new Error("Failed to fetch beneficiaries"));
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Auto-fetch on mount
    useEffect(() => {
        fetchBeneficiaries();
    }, [fetchBeneficiaries]);

    return { beneficiaries, isLoading, error, refetch: fetchBeneficiaries };
};
