export default function TransactionFilters() {
    return (
        <div className="bg-white p-4 rounded-xl border border-slate-200 mb-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Account Dropdown */}
                <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Account
                    </label>
                    <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 bg-slate-50 text-slate-800 appearance-none">
                        <option>Main Checking (...4492)</option>
                        <option>Savings Account (...8810)</option>
                    </select>
                </div>

                {/* Date Range */}
                <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Date Range
                    </label>
                    <input
                        type="date"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 bg-slate-50 text-slate-500"
                    />
                </div>

                {/* Type Dropdown */}
                <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Type
                    </label>
                    <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 bg-slate-50 text-slate-800 appearance-none">
                        <option>All Transactions</option>
                        <option>Money In (Credits)</option>
                        <option>Money Out (Debits)</option>
                    </select>
                </div>

                {/* Search */}
                <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Search
                    </label>
                    <div className="relative">
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
                            placeholder="Search description..."
                            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 bg-slate-50 text-slate-800 placeholder:text-slate-400"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
