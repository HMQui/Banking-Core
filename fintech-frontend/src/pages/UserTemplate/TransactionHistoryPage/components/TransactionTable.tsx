import type { Transaction, TransactionStatus } from "../../../../types/transaction";

interface TransactionTableProps {
    transactions: Transaction[];
    total: number;
    page: number;
    limit: number;
    userAccountIds: string[]; // FIX: Array of Account IDs owned by the user
    selectedAccountId?: string; // If filtered by a specific account
    onPageChange: (page: number) => void;
}

export default function TransactionTable({
    transactions,
    total,
    page,
    limit,
    userAccountIds,
    selectedAccountId,
    onPageChange,
}: TransactionTableProps) {
    const formatCurrency = (amount: number, currency: string, isCredit: boolean) => {
        const formatted = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency,
        }).format(amount);
        return isCredit ? `+${formatted}` : `-${formatted}`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            }),
            time: date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        };
    };

    const getStatusPill = (status: TransactionStatus) => {
        switch (status) {
            case "SUCCESS":
                return (
                    <span className="px-2.5 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                        Success
                    </span>
                );
            case "PENDING":
                return (
                    <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                        Pending
                    </span>
                );
            case "FAILED":
                return (
                    <span className="px-2.5 py-1 bg-red-100 text-red-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                        Failed
                    </span>
                );
            case "CANCELLED":
                return (
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
                        Cancelled
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50">
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                Date & Time
                            </th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                Ref ID
                            </th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                Description
                            </th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">
                                Amount
                            </th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {transactions.map((tx) => {
                            const { date, time } = formatDate(tx.createdAt);

                            // FIX: Correctly determine if it's money coming IN to the targeted account
                            const isCredit = selectedAccountId
                                ? tx.receiverId === selectedAccountId
                                : userAccountIds.includes(tx.receiverId || "");

                            // Find the counterparty name if the relations exist
                            const counterparty = isCredit
                                ? tx.sender?.accountName || "External Transfer"
                                : tx.receiver?.accountName || "External Transfer";

                            return (
                                <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-slate-900">
                                            {date}
                                        </div>
                                        <div className="text-xs text-slate-400 mt-0.5">{time}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-xs text-slate-500 font-mono bg-slate-100 px-2 py-1 rounded">
                                            TX_{tx.id.substring(0, 6).toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-slate-900 truncate max-w-xs">
                                            {tx.description ||
                                                (isCredit
                                                    ? `From: ${counterparty}`
                                                    : `To: ${counterparty}`)}
                                        </div>
                                        <div className="text-xs text-slate-400 mt-0.5">
                                            {isCredit ? "Deposit" : "Withdrawal"}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div
                                            className={`text-sm font-bold ${isCredit ? "text-green-600" : "text-slate-900"}`}
                                        >
                                            {formatCurrency(tx.amount, tx.currency, isCredit)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        {getStatusPill(tx.status)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-white">
                <span className="text-xs text-slate-500">
                    Showing{" "}
                    <span className="font-semibold text-slate-800">{(page - 1) * limit + 1}</span>-
                    <span className="font-semibold text-slate-800">
                        {Math.min(page * limit, total)}
                    </span>{" "}
                    of <span className="font-semibold text-slate-800">{total}</span> transactions
                </span>
                <div className="flex space-x-2">
                    <button
                        onClick={() => onPageChange(page - 1)}
                        disabled={page === 1}
                        className="p-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                    </button>
                    <button
                        onClick={() => onPageChange(page + 1)}
                        disabled={page * limit >= total}
                        className="p-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
