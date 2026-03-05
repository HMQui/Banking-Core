/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { ChevronDown, Edit2, Plus } from "lucide-react";
import QuickActionsCard from "./components/QuickActionsCard";
import RecentTransactions from "./components/RecentTransactions";
import EditAccountModal from "../../../components/Accounts/EditAccountModal";
import SelectAccountModal from "./components/SelectAccountModal";
import { useAccounts } from "../../../hooks/apiHooks/accounts/useAccounts";
import Loading from "../../../components/Loading";

export default function Dashboard() {
    const { accounts = [], isLoading: isLoadingAccounts, refetch } = useAccounts();

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
    const [activeAccountId, setActiveAccountId] = useState<string | null>(null);

    const activeAccount = accounts.find((acc) => acc.id === activeAccountId) ?? null;

    // Initialize active account when accounts are loaded
    useEffect(() => {
        if (accounts.length > 0 && !activeAccountId) {
            setActiveAccountId(accounts[0].id);
        }
    }, [accounts]);

    if (isLoadingAccounts) {
        return <Loading />;
    }

    const handleEditSuccess = async () => {
        await refetch();
        setIsEditModalOpen(false);
    };

    return (
        <div className="bg-slate-50 min-h-full font-sans p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div className="md:col-span-2 flex flex-col">
                    {activeAccount ? (
                        <div className="bg-blue-900 text-white rounded-xl p-6 shadow-md flex flex-col justify-between relative overflow-hidden h-full min-h-75">
                            <div className="absolute -top-24 -right-12 w-64 h-64 rounded-full bg-white/5 blur-2xl pointer-events-none" />

                            <div className="flex justify-between items-start z-10">
                                <div>
                                    <h2 className="text-blue-200 text-sm font-medium mb-1">
                                        {activeAccount.accountName}
                                    </h2>
                                    <p className="text-blue-200/80 text-xs tracking-wider">
                                        •••• {activeAccount.accountNumber.slice(-4)}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setIsEditModalOpen(true)}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>

                                    <button
                                        onClick={() => setIsSelectModalOpen(true)}
                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors"
                                    >
                                        Switch <ChevronDown className="w-4 h-4 ml-1" />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-8 z-10">
                                <p className="text-blue-200 text-sm mb-1">Total Balance</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl sm:text-5xl font-bold tracking-tight">
                                        {new Intl.NumberFormat("en-US").format(
                                            activeAccount.balance,
                                        )}
                                    </span>
                                    <span className="text-xl font-medium text-blue-200">
                                        {activeAccount.currency}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-8 z-10">
                                <button className="bg-white hover:bg-slate-100 text-blue-900 px-5 py-2.5 rounded-lg font-medium inline-flex items-center gap-2 transition-colors shadow-sm">
                                    <Plus className="w-4 h-4" />
                                    New Transfer
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center h-full min-h-75">
                            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                <Plus className="w-6 h-6 text-slate-400" />
                            </div>

                            <h3 className="text-base font-semibold text-slate-900 mb-1">
                                No account available
                            </h3>

                            <p className="text-sm text-slate-500 mb-5 max-w-xs">
                                You don’t have any account yet. Create one to start managing your
                                finances.
                            </p>

                            <a
                                href="/accounts-management"
                                className="bg-blue-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors"
                            >
                                Create Account
                            </a>
                        </div>
                    )}
                </div>

                <div className="md:col-span-1 flex flex-col gap-4 md:gap-6">
                    <QuickActionsCard />
                </div>

                <div className="md:col-span-3">
                    <RecentTransactions />
                </div>
            </div>

            {activeAccount && (
                <EditAccountModal
                    id={activeAccount.id}
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSuccess={handleEditSuccess}
                    currentAlias={activeAccount.accountName}
                    currentIsPrimary={activeAccount.isPrimary}
                />
            )}

            <SelectAccountModal
                isOpen={isSelectModalOpen}
                onClose={() => setIsSelectModalOpen(false)}
                accounts={accounts}
                activeAccountId={activeAccountId}
                onSelect={(id) => setActiveAccountId(id)}
            />
        </div>
    );
}
