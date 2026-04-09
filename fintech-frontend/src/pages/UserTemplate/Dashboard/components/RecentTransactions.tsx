import { FileText, ArrowRight, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import type { Transaction } from "../../../../types/transaction";
import type { RootState } from "../../../../store";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

interface RecentTransactionsProps {
    transactions?: Transaction[];
}

export default function RecentTransactions({ transactions = [] }: RecentTransactionsProps) {
    const { user } = useSelector((state: RootState) => state.auth);
    const navigate = useNavigate();
    const getStatusBadge = (status: string) => {
        switch (status.toUpperCase()) {
            case "SUCCESS":
                return (
                    <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
                        Success
                    </span>
                );
            case "PENDING":
                return (
                    <span className="text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
                        Pending
                    </span>
                );
            case "FAILED":
                return (
                    <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
                        Failed
                    </span>
                );
            default:
                return (
                    <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
                        {status}
                    </span>
                );
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    };

    // Determine direction and UI details for each transaction
    const getTransactionContext = (tx: Transaction) => {
        const isOutgoing = user?.id === tx.sender?.userId || user?.id === tx.senderId;

        if (isOutgoing) {
            return {
                title: tx.receiver?.accountName
                    ? `To: ${tx.receiver.accountName}`
                    : "Outgoing Transfer",
                icon: <ArrowUpRight className="w-5 h-5 text-slate-600" />,
                iconBg: "bg-slate-100",
                amountColor: "text-slate-900",
                sign: "-",
            };
        } else {
            return {
                title: tx.sender?.accountName
                    ? `From: ${tx.sender.accountName}`
                    : "Incoming Transfer",
                icon: <ArrowDownLeft className="w-5 h-5 text-green-600" />,
                iconBg: "bg-green-50",
                amountColor: "text-green-600",
                sign: "+",
            };
        }
    };

    return (
        <div className="md:col-span-3 bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-900">Recent Transactions</h3>
                <button className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1" onClick={() => navigate('/statements')}>
                    View All <ArrowRight className="w-4 h-4" />
                </button>
            </div>

            {transactions.length === 0 ? (
                // Empty State
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100">
                        <FileText className="w-6 h-6 text-slate-400" />
                    </div>
                    <h4 className="text-base font-bold text-slate-900 mb-1">No recent activity</h4>
                    <p className="text-sm text-slate-500 max-w-xs mb-5">
                        Your latest transfers and payments will show up here.
                    </p>
                    <button className="text-sm font-semibold text-slate-900 bg-white border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                        Make a transfer
                    </button>
                </div>
            ) : (
                // List State
                <div className="flex flex-col gap-4">
                    {transactions.map((tx) => {
                        const context = getTransactionContext(tx);

                        return (
                            <div
                                key={tx.id}
                                className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-colors group"
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${context.iconBg}`}
                                    >
                                        {context.icon}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-900 group-hover:text-blue-900 transition-colors">
                                            {context.title}
                                        </span>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-xs text-slate-500">
                                                {formatDate(tx.createdAt)}
                                            </span>
                                            <span className="text-slate-300 text-[10px]">•</span>
                                            <span className="text-xs text-slate-500 truncate max-w-30 sm:max-w-50">
                                                {tx.description || "Transfer"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-1 shrink-0">
                                    <span className={`text-sm font-bold ${context.amountColor}`}>
                                        {context.sign}
                                        {Number(tx.amount).toLocaleString()} {tx.currency}
                                    </span>
                                    {getStatusBadge(tx.status)}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
