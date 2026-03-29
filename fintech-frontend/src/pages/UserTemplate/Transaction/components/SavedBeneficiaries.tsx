import { useState } from "react";
import type { Beneficiary } from "../../../../types/beneficiary";

interface SavedBeneficiariesProps {
    beneficiaries: Beneficiary[];
    isLoading: boolean;
    onSelectBeneficiary: (accountNumber: string) => void;
}

export default function SavedBeneficiaries({
    beneficiaries,
    isLoading,
    onSelectBeneficiary,
}: SavedBeneficiariesProps) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredBeneficiaries = beneficiaries.filter(
        (b) =>
            b.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.bankName.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    return (
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm h-fit">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-semibold text-slate-900">Saved Beneficiaries</h3>
                <button className="text-slate-400 hover:text-slate-900 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 4v16m8-8H4"
                        />
                    </svg>
                </button>
            </div>

            <div className="relative mb-6">
                <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                </svg>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 text-sm text-slate-700 placeholder-slate-400"
                    placeholder="Search saved..."
                />
            </div>

            <div className="flex flex-col gap-2 max-h-100 overflow-y-auto pr-2">
                {isLoading ? (
                    <p className="text-sm text-slate-500 text-center py-4">Loading...</p>
                ) : filteredBeneficiaries.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">
                        No beneficiaries found.
                    </p>
                ) : (
                    filteredBeneficiaries.map((ben) => {
                        const initials = ben.nickname.substring(0, 2).toUpperCase();
                        return (
                            <button
                                key={ben.id}
                                type="button"
                                onClick={() => onSelectBeneficiary(ben.accountNumber)}
                                className="flex items-center text-left p-3 hover:bg-slate-50 rounded-xl transition-colors group border border-transparent hover:border-slate-100 w-full"
                            >
                                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 font-semibold flex items-center justify-center text-xs shrink-0 group-hover:bg-white border border-slate-200">
                                    {initials}
                                </div>
                                <div className="ml-3 overflow-hidden">
                                    <p className="text-sm font-medium text-slate-900 truncate">
                                        {ben.nickname}
                                    </p>
                                    <p className="text-xs text-slate-500 truncate">
                                        **** {ben.accountNumber.slice(-4)} • {ben.bankName}
                                    </p>
                                </div>
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
}
