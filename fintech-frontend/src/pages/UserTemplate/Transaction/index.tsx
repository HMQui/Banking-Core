import { useState, type FormEvent } from "react";
import { isAxiosError } from "axios";
import { useTransfer } from "../../../hooks/apiHooks/transactions/useTransfer";
import { useAccounts } from "../../../hooks/apiHooks/accounts/useAccounts";
import { useBeneficiaries } from "../../../hooks/apiHooks/beneficiaries/useBeneficiaries";
import type { TransferFormData } from "./components/TransferForm";
import type { TransferPayload } from "../../../types/transaction";
import { toast } from "../../../components/common/Toast/toastManager";
import SavedBeneficiaries from "./components/SavedBeneficiaries";
import TransferForm from "./components/TransferForm";

export default function TransactionPage() {
    const { executeTransfer, isLoading: isTransferring } = useTransfer();
    const { accounts, isLoading: isLoadingAccounts } = useAccounts();
    const { beneficiaries, isLoading: isLoadingBeneficiaries } = useBeneficiaries();

    const [formData, setFormData] = useState<TransferFormData>({
        senderAccountId: "",
        receiverAccountNumber: "",
        amount: "",
        currency: "VND",
        description: "",
    });

    const [idempotencyKey, setIdempotencyKey] = useState<string>(crypto.randomUUID());
    const [fieldError, setFieldError] = useState<string>("");

    const activeAccount =
        accounts.find((a) => a.id === formData.senderAccountId) ||
        accounts.find((a) => a.isPrimary) ||
        accounts[0];

    const currentSenderId = formData.senderAccountId || activeAccount?.id || "";
    const currentCurrency = activeAccount?.currency || "VND";

    const handleFormChange = (field: keyof TransferFormData, value: string | number) => {
        setFieldError("");
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSelectBeneficiary = (accountNumber: string) => {
        setFieldError("");
        setFormData((prev) => ({ ...prev, receiverAccountNumber: accountNumber }));
    };

    const validateForm = (): boolean => {
        if (!currentSenderId) {
            setFieldError("Please select a source account.");
            return false;
        }
        if (!formData.receiverAccountNumber.trim()) {
            setFieldError("Receiver account number is required.");
            return false;
        }
        if (!formData.amount || formData.amount <= 0) {
            setFieldError("Amount must be greater than zero.");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        const payload: TransferPayload = {
            senderAccountId: currentSenderId,
            receiverAccountNumber: formData.receiverAccountNumber.trim(),
            amount: Number(formData.amount),
            currency: currentCurrency,
            description: formData.description.trim() || undefined,
        };

        try {
            await executeTransfer(payload, idempotencyKey);
            toast.success(
                "Transfer Successful",
                `Successfully transferred ${formData.amount} ${currentCurrency}.`,
            );

            // reset form and key on success
            setFormData((prev) => ({
                ...prev,
                receiverAccountNumber: "",
                amount: "",
                description: "",
            }));
            setIdempotencyKey(crypto.randomUUID());
        } catch (err: unknown) {
            console.error("Transfer error:", err);

            if (isAxiosError(err) && err.response) {
                const status = err.response.status;
                const serverMessage = err.response.data?.message;

                switch (status) {
                    case 409:
                        // do NOT reset UUID on conflict
                        toast.error(
                            "Transaction in Progress",
                            "Your transaction is currently being processed.",
                        );
                        break;
                    case 400:
                        toast.error("Transfer Failed", serverMessage || "Invalid details.");
                        setFieldError(serverMessage || "Please check your balance and try again.");
                        setIdempotencyKey(crypto.randomUUID());
                        break;
                    case 404:
                        toast.error("Not Found", "Account not found.");
                        setFieldError("Sender or receiver account does not exist.");
                        setIdempotencyKey(crypto.randomUUID());
                        break;
                    default:
                        toast.error("Action Failed", serverMessage || "An error occurred.");
                }
            } else {
                // do NOT reset UUID on network error
                toast.error("Network Error", "Could not connect to the server.");
            }
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <TransferForm
                formData={{
                    ...formData,
                    senderAccountId: currentSenderId,
                    currency: currentCurrency,
                }}
                accounts={accounts}
                isLoadingAccounts={isLoadingAccounts}
                isTransferring={isTransferring}
                fieldError={fieldError}
                onChange={handleFormChange}
                onSubmit={handleSubmit}
            />
            <SavedBeneficiaries
                beneficiaries={beneficiaries}
                isLoading={isLoadingBeneficiaries}
                onSelectBeneficiary={handleSelectBeneficiary}
            />
        </div>
    );
}
