import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import CreateAccountModal from "../../../components/Accounts/CreateAccountModal";
import EditAccountModal from "../../../components/Accounts/EditAccountModal";
import { useAccounts } from "../../../hooks/apiHooks/accounts/useAccounts";
import Loading from "../../../components/common/Loading";
import AccountCard from "./components/AccountCard";

export default function AccountManagement() {
    const { accounts, isLoading: isLoadingAccounts, refetch } = useAccounts();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingAccountId, setEditingAccountId] = useState<string | null>(null);

    const totalBalance = useMemo(() => {
        if (!accounts) return 0;
        return accounts.reduce((sum, acc) => sum + acc.balance, 0);
    }, [accounts]);

    if (isLoadingAccounts) {
        return <Loading />;
    }

    const handleOpenEditModal = (id: string) => {
        setEditingAccountId(id);
        setIsEditModalOpen(true);
    };

    const handleEditSuccess = async () => {
        await refetch();
        setIsEditModalOpen(false);
        setEditingAccountId(null);
    };

    const editingAccount = accounts?.find((acc) => acc.id === editingAccountId) ?? null;

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-900">Account Management</h1>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                        + Create Account
                    </button>
                </div>

                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm w-fit mb-8">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        Total Estimated Balance
                    </p>
                    <h2 className="text-2xl font-bold text-slate-900">
                        {new Intl.NumberFormat("en-US").format(totalBalance)}
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {accounts?.map((account) => (
                        <AccountCard
                            key={account.id}
                            id={account.id}
                            accountName={account.accountName}
                            accountNumber={account.accountNumber}
                            balance={account.balance}
                            currency={account.currency}
                            isPrimary={account.isPrimary}
                            onEdit={handleOpenEditModal}
                        />
                    ))}

                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-transparent rounded-xl p-6 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-3 hover:bg-slate-100/50 hover:border-slate-400 transition-all min-h-45"
                    >
                        <div className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-600">
                            <Plus className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-semibold text-slate-600">
                            Add New Account
                        </span>
                    </button>
                </div>
            </div>

            <CreateAccountModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={async () => {
                    await refetch();
                    setIsCreateModalOpen(false);
                }}
            />

            {editingAccount && (
                <EditAccountModal
                    id={editingAccount.id}
                    isOpen={isEditModalOpen}
                    currentAlias={editingAccount.accountName}
                    currentIsPrimary={editingAccount.isPrimary}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setEditingAccountId(null);
                    }}
                    onSuccess={handleEditSuccess}
                />
            )}
        </div>
    );
}
