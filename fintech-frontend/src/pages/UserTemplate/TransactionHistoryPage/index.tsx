import { useState, useEffect } from "react";
import Loading from "../../../components/common/Loading";
import type { GetHistoryQuery } from "../../../types/transaction";
import { useAppSelector } from "../../../hooks/redux"; // Giả sử bạn có hook lấy current user
import TransactionFilters from "./components/TransactionFilters";
import TransactionTable from "./components/TransactionTable";
import TransactionEmptyState from "./components/TransactionEmptyState";
import { useTransactionHistory } from "../../../hooks/apiHooks/transactions/useTransactionHistory";

export default function TransactionHistoryPage() {
    const currentUser = useAppSelector((state) => state.auth.user);

    const [queryParams, setQueryParams] = useState<GetHistoryQuery>({ page: 1, limit: 10 });
    const { history, isLoading, error, refetch } = useTransactionHistory(queryParams);

    useEffect(() => {
        refetch(queryParams);
    }, [queryParams, refetch]);

    if (isLoading && !history) {
        return <Loading />;
    }

    const hasTransactions = history && history.data && history.data.length > 0;

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Transaction History</h1>
                        <p className="text-slate-500 text-sm mt-1">
                            Review and manage your recent financial activities.
                        </p>
                    </div>
                    <button className="mt-4 md:mt-0 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 shadow-sm">
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
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                        </svg>
                        Download Statement
                    </button>
                </div>

                {/* Filters Section */}
                <TransactionFilters />

                {/* Main Content Area */}
                {error ? (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-center text-sm">
                        Failed to load transactions. Please try again.
                    </div>
                ) : hasTransactions ? (
                    <TransactionTable
                        transactions={history.data}
                        total={history.total}
                        page={history.page}
                        limit={history.limit}
                        currentUserId={currentUser?.id}
                        onPageChange={(newPage) =>
                            setQueryParams({ ...queryParams, page: newPage })
                        }
                    />
                ) : (
                    <TransactionEmptyState />
                )}
            </div>
        </div>
    );
}
