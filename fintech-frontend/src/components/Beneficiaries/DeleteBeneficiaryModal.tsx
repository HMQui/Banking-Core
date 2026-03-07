import { AlertCircle } from "lucide-react";
import { beneficiaryService } from "../../api/beneficiaryService";
import { toast } from "../common/Toast/toastManager";

interface DeleteBeneficiaryModalProps {
    isOpen: boolean;
    beneficiaryId: string | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function DeleteBeneficiaryModal({
    isOpen,
    beneficiaryId,
    onClose,
    onSuccess,
}: DeleteBeneficiaryModalProps) {
    if (!isOpen || !beneficiaryId) return null;

    const handleConfirm = async () => {
        try {
            await beneficiaryService.deleteBeneficiary(beneficiaryId);
            toast.success("Delete Beneficiary", "Beneficiary removed successfully.");
            onSuccess();
        } catch (error) {
            console.error(error);
            toast.error("Delete Beneficiary", "Failed to remove beneficiary.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl relative animate-in zoom-in-95 duration-200 p-6 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                </div>

                <h3 className="text-lg font-bold text-slate-900">Remove Beneficiary?</h3>
                <p className="text-sm text-slate-500 mt-2 mb-6">
                    Are you sure you want to remove this contact? This action cannot be undone.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="flex-1 px-4 py-2 bg-red-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-red-700 transition-colors"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}
