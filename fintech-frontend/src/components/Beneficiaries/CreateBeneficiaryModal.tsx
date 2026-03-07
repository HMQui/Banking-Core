import { useState } from "react";
import { X } from "lucide-react";
import { AxiosError } from "axios";
import type { CreateBeneficiaryPayload } from "../../types/beneficiary";
import { beneficiaryService } from "../../api/beneficiaryService";
import { toast } from "../common/Toast/toastManager";

interface CreateBeneficiaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateBeneficiaryModal({
    isOpen,
    onClose,
    onSuccess,
}: CreateBeneficiaryModalProps) {
    const [nickname, setNickname] = useState("");
    const [bankName, setBankName] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [helperText, setHelperText] = useState("");

    const resetForm = () => {
        setNickname("");
        setBankName("");
        setAccountNumber("");
        setHelperText("");
    };

    const handleClose = () => {
        onClose();
        resetForm();
    };

    const handleCreate = async () => {
        if (!nickname.trim() || !bankName.trim() || !accountNumber.trim()) {
            setHelperText("All fields are required.");
            return;
        }

        const payload: CreateBeneficiaryPayload = {
            nickname,
            bankName,
            accountNumber,
        };

        try {
            await beneficiaryService.createBeneficiary(payload);

            toast.success("Create Beneficiary", "Beneficiary added successfully.");

            onSuccess();
            resetForm();
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                const status = error.response?.status;

                if (status === 404) {
                    setHelperText("The account number does not exist.");
                } else if (status === 400) {
                    setHelperText("You cannot add this account as a beneficiary.");
                } else if (status === 409) {
                    setHelperText("This beneficiary already exists in your list.");
                } else {
                    setHelperText("Unexpected error occurred. Please try again later.");
                }

                toast.error("Create Beneficiary", "Failed to add beneficiary.");
            }
            else {
                setHelperText("Unexpected error occurred. Please try again later.");
                toast.error("Create Beneficiary", "Failed to add beneficiary.");
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white rounded-xl shadow-2xl relative animate-in zoom-in-95 duration-200 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-900">Beneficiary Details</h3>
                    <button onClick={handleClose} className="text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Nickname / Full Name
                        </label>
                        <input
                            type="text"
                            maxLength={100}
                            value={nickname}
                            onChange={(e) => {
                                setNickname(e.target.value);
                                setHelperText("");
                            }}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-sm text-slate-800"
                            placeholder="e.g. James Danielson"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Bank Name
                        </label>
                        <input
                            type="text"
                            maxLength={150}
                            value={bankName}
                            onChange={(e) => {
                                setBankName(e.target.value);
                                setHelperText("");
                            }}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-sm text-slate-800"
                            placeholder="e.g. Citibank International"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Account Number
                        </label>
                        <input
                            type="text"
                            maxLength={30}
                            value={accountNumber}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, "");
                                setAccountNumber(val);
                                setHelperText("");
                            }}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-sm text-slate-800 font-mono"
                            placeholder="e.g. 8240001234567890"
                        />
                    </div>
                </div>

                {helperText && (
                    <div className="mt-4 text-sm text-red-500 text-right">{helperText}</div>
                )}

                <div className="flex justify-end gap-3 mt-8">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreate}
                        className="px-4 py-2 bg-slate-900 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-slate-800 transition-colors"
                    >
                        Save Beneficiary
                    </button>
                </div>
            </div>
        </div>
    );
}
