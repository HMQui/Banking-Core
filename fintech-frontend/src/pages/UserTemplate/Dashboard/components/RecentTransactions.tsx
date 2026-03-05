import { FileText, ArrowRight, ExternalLink } from "lucide-react";

interface Transaction {
    id: string | number;
    date: string;
    desc: string;
    amount: string;
    status: string;
}

interface RecentTransactionsProps {
    transactions?: Transaction[];
}

export default function RecentTransactions({ transactions = [] }: RecentTransactionsProps) {
    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case "success":
                return (
                    <span className="px-2.5 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        Success
                    </span>
                );
            case "pending":
                return (
                    <span className="px-2.5 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                        Pending
                    </span>
                );
            default:
                return (
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-medium">
                        {status}
                    </span>
                );
        }
    };

    return (
        <div className="md:col-span-3 bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-4">
                <h3 className="text-lg font-bold text-slate-900">Recent Transactions</h3>
                <button className="text-sm font-medium text-blue-900 hover:text-blue-700 flex items-center gap-1">
                    View Statement <ExternalLink className="w-4 h-4" />
                </button>
            </div>

            {transactions.length === 0 ? (
                // Empty State
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <FileText className="w-8 h-8 text-slate-300" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 mb-2">No transactions yet</h4>
                    <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
                        Your financial activity will appear here once you start using your account
                        for transfers or payments.
                    </p>
                    <button className="text-sm font-semibold text-blue-900 flex items-center gap-1 hover:gap-2 transition-all">
                        Make your first transfer <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                // Table State
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider">
                                <th className="pb-3 pr-4 font-medium">Date</th>
                                <th className="pb-3 pr-4 font-medium">Description</th>
                                <th className="pb-3 pr-4 font-medium">Amount</th>
                                <th className="pb-3 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {transactions.map((tx) => (
                                <tr
                                    key={tx.id}
                                    className="border-b border-slate-100 last:border-none"
                                >
                                    <td className="py-4 pr-4 text-slate-500 whitespace-nowrap">
                                        {tx.date}
                                    </td>
                                    <td className="py-4 pr-4 text-slate-900 font-medium">
                                        {tx.desc}
                                    </td>
                                    <td
                                        className={`py-4 pr-4 font-semibold whitespace-nowrap ${tx.amount.startsWith("+") ? "text-green-600" : "text-slate-900"}`}
                                    >
                                        {tx.amount}
                                    </td>
                                    <td className="py-4">{getStatusBadge(tx.status)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
