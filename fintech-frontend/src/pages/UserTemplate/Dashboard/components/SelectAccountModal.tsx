import { X, CheckCircle, Plus } from "lucide-react";
import type { AccountData } from "../../../../types/account";

interface SelectAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    accounts: AccountData[];
    activeAccountId: string | null;
    onSelect: (id: string) => void;
}

export default function SelectAccountModal({
    isOpen,
    onClose,
    accounts,
    activeAccountId,
    onSelect,
}: SelectAccountModalProps) {
    if (!isOpen) return null;

    const handleSelect = (id: string) => {
        onSelect(id);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-2xl relative animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-900">Select Account</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body List */}
                <div className="flex flex-col gap-3 mt-4 max-h-[60vh] overflow-y-auto pr-1">
                    {accounts.map((acc) => {
                        const isActive = acc.id === activeAccountId;
                        return (
                            <div
                                key={acc.id}
                                onClick={() => handleSelect(acc.id)}
                                className={`relative p-4 rounded-lg cursor-pointer transition-colors ${
                                    isActive
                                        ? "border-2 border-blue-900 bg-blue-50"
                                        : "border border-slate-200 bg-white hover:bg-slate-50"
                                }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold text-slate-900">
                                                {acc.accountName}
                                            </span>
                                            {acc.isPrimary && (
                                                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold uppercase rounded-full tracking-wide">
                                                    Primary
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-500 mb-2">
                                            No: {acc.accountNumber}
                                        </p>
                                        <p className="font-semibold text-slate-900">
                                            {acc.balance} USD
                                        </p>
                                    </div>

                                    {isActive && (
                                        <CheckCircle className="w-5 h-5 text-blue-900 absolute top-4 right-4" />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <button className="w-full mt-6 flex items-center justify-center gap-2 py-3 px-4 border border-slate-300 rounded-lg text-sm font-medium text-blue-900 hover:bg-slate-50 transition-colors">
                    <Plus className="w-4 h-4" />
                    Add New Account
                </button>
            </div>
        </div>
    );
}
