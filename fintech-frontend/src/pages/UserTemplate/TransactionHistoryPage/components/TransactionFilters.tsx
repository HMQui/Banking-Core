import { useState } from "react";
import type { GetHistoryQuery, EntryType } from "../../../../types/transaction";
import type { AccountData } from "../../../../types/account";

interface TransactionFiltersProps {
    query: GetHistoryQuery;
    updateFilters: (filters: Partial<GetHistoryQuery>) => void;
    accounts: AccountData[];
}

export default function TransactionFilters({
    query,
    updateFilters,
    accounts,
}: TransactionFiltersProps) {
    const [localSearch, setLocalSearch] = useState(query.description || "");

    const handleSearchSubmit = () => {
        updateFilters({ description: localSearch.trim() || undefined });
    };

    const handleClearAll = () => {
        // Clear local state immediately
        setLocalSearch("");

        // Clear parent query state
        updateFilters({
            accountId: undefined,
            type: undefined,
            startDate: undefined,
            endDate: undefined,
            description: undefined,
        });
    };

    return (
        <div className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 mb-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Account Dropdown */}
                <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Account
                    </label>
                    <select
                        value={query.accountId || ""}
                        onChange={(e) => updateFilters({ accountId: e.target.value || undefined })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 bg-slate-50 text-slate-800 appearance-none"
                    >
                        <option value="">All Accounts</option>
                        {accounts.map((acc) => (
                            <option key={acc.id} value={acc.id}>
                                {acc.accountName} (...{acc.accountNumber.slice(-4)})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Start Date */}
                <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Start Date
                    </label>
                    <input
                        type="date"
                        value={query.startDate || ""}
                        onChange={(e) => updateFilters({ startDate: e.target.value || undefined })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 bg-slate-50 text-slate-800"
                    />
                </div>

                {/* End Date */}
                <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        End Date
                    </label>
                    <input
                        type="date"
                        value={query.endDate || ""}
                        onChange={(e) => updateFilters({ endDate: e.target.value || undefined })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 bg-slate-50 text-slate-800"
                    />
                </div>

                {/* Type Dropdown */}
                <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Type
                    </label>
                    <select
                        value={query.type || ""}
                        onChange={(e) =>
                            updateFilters({ type: (e.target.value as EntryType) || undefined })
                        }
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 bg-slate-50 text-slate-800 appearance-none"
                    >
                        <option value="">All Transactions</option>
                        <option value="CREDIT">Money In (Credits)</option>
                        <option value="DEBIT">Money Out (Debits)</option>
                    </select>
                </div>

                {/* Search */}
                <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Search
                    </label>
                    <div className="relative flex gap-2">
                        <div className="relative flex-1">
                            <svg
                                className="w-4 h-4 absolute left-3 top-2.5 text-slate-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                            <input
                                type="text"
                                value={localSearch}
                                onChange={(e) => setLocalSearch(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
                                placeholder="Description..."
                                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 bg-slate-50 text-slate-800 placeholder:text-slate-400"
                            />
                        </div>
                        <button
                            onClick={handleSearchSubmit}
                            className="bg-slate-900 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
                        >
                            Go
                        </button>
                    </div>
                </div>
            </div>

            {/* Clear Filters Button */}
            <div className="flex justify-end mt-4 pt-4 border-t border-slate-100">
                <button
                    onClick={handleClearAll}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                >
                    Clear All Filters
                </button>
            </div>
        </div>
    );
}
