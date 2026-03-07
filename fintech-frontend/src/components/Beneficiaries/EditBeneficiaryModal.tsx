/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { Beneficiary, UpdateBeneficiaryPayload } from "../../types/beneficiary";
import { beneficiaryService } from "../../api/beneficiaryService";
import { toast } from "../common/Toast/toastManager";

interface EditBeneficiaryModalProps {
    isOpen: boolean;
    beneficiary: Beneficiary | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function EditBeneficiaryModal({
    isOpen,
    beneficiary,
    onClose,
    onSuccess,
}: EditBeneficiaryModalProps) {
    const [nickname, setNickname] = useState("");
    const [bankName, setBankName] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [helperText, setHelperText] = useState("");

    useEffect(() => {
        if (beneficiary) {
            setNickname(beneficiary.nickname);
            setBankName(beneficiary.bankName);
            setAccountNumber(beneficiary.accountNumber);
        }
    }, [beneficiary]);

    const resetForm = () => {
        setHelperText("");
        if (beneficiary) {
            setNickname(beneficiary.nickname);
            setBankName(beneficiary.bankName);
            setAccountNumber(beneficiary.accountNumber);
        }
    };

    const handleClose = () => {
        onClose();
        resetForm();
    };

    const handleUpdate = async () => {
        if (!nickname.trim() || !bankName.trim() || !accountNumber.trim()) {
            setHelperText("All fields are required.");
            return;
        }

        if (!beneficiary) return;

        const payload: UpdateBeneficiaryPayload = {
            nickname,
            bankName,
            accountNumber,
        };

        try {
            await beneficiaryService.updateBeneficiary(beneficiary.id, payload);
            toast.success("Update Beneficiary", "Beneficiary updated successfully.");

            onSuccess();
        } catch (error) {
            console.error(error);
            toast.error("Update Beneficiary", "Failed to update beneficiary.");
            setHelperText("Please try again or contact support if the issue persists.");
        }
    };

    if (!isOpen || !beneficiary) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white rounded-xl shadow-2xl relative animate-in zoom-in-95 duration-200 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-900">Edit Beneficiary</h3>
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
