import { useState } from "react";
import { X } from "lucide-react";
import type { UpdateAccountPayload } from "../../types/account";
import { accountService } from "../../api/accountService";
import { toast } from "../common/Toast/toastManager";

interface EditAccountModalProps {
    id: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    currentAlias: string;
    currentIsPrimary: boolean;
}

export default function EditAccountModal({
    id,
    isOpen,
    onClose,
    onSuccess,
    currentAlias,
    currentIsPrimary,
}: EditAccountModalProps) {
    const [accountName, setAccountName] = useState(currentAlias);
    const [isPrimary, setIsPrimary] = useState(currentIsPrimary);
    const [helperText, setHelperText] = useState("");

    // Reset form state when modal closes or after successful update
    const resetForm = () => {
        setAccountName(currentAlias);
        setIsPrimary(currentIsPrimary);
        setHelperText("");
    };

    const handleClose = () => {
        onClose();
        resetForm();
    };

    const handleSuccess = () => {
        onSuccess();
        resetForm();
    };

    if (!isOpen) return null;

    const handleUpdate = async () => {
        if (!accountName.trim()) {
            setHelperText("Account name is required.");
            return;
        }

        const payload: UpdateAccountPayload = {
            id,
            accountName,
            isPrimary,
        };

        try {
            await accountService.updateAccount(payload);
            toast.success("Update Account", "Account updated successfully.");
            handleSuccess();
        } catch (error) {
            if (error instanceof Error) {
                console.error("Update Account Error:", error.message);
            }
            toast.error("Update Account", "Failed to update account.");
            setHelperText("Please try again or contact support if the issue persists.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="w-full max-w-sm p-6 bg-white rounded-xl shadow-2xl relative animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-900">Edit Account Details</h3>
                    <button onClick={handleClose} className="text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Account Alias / Name
                        </label>
                        <input
                            type="text"
                            value={accountName}
                            onChange={(e) => {
                                setAccountName(e.target.value);
                                if (e.target.value.trim()) {
                                    setHelperText("");
                                }
                            }}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 sm:text-sm text-slate-800"
                            placeholder="e.g. Salary Checking"
                        />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-800">
                                Set as primary account
                            </span>
                            <span className="text-xs text-slate-500">
                                This account will be used as default.
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsPrimary(!isPrimary)}
                            className={`${
                                isPrimary ? "bg-slate-900" : "bg-slate-200"
                            } relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
                        >
                            <span
                                aria-hidden="true"
                                className={`${
                                    isPrimary ? "translate-x-5" : "translate-x-0"
                                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                            />
                        </button>
                    </div>
                </div>

                {helperText && (
                    <div className="mt-2 text-sm text-red-500 text-right">{helperText}</div>
                )}

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpdate}
                        className="px-4 py-2 bg-slate-900 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-slate-800 transition-colors"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
