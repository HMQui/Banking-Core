import { useState, useMemo } from "react";
import { Plus, Search } from "lucide-react";
import BeneficiaryCard from "./components/BeneficiaryCard";
import { useBeneficiaries } from "../../../hooks/apiHooks/beneficiaries/useBeneficiaries";
import Loading from "../../../components/common/Loading";
import CreateBeneficiaryModal from "../../../components/Beneficiaries/CreateBeneficiaryModal";
import DeleteBeneficiaryModal from "../../../components/Beneficiaries/DeleteBeneficiaryModal";
import EditBeneficiaryModal from "../../../components/Beneficiaries/EditBeneficiaryModal";

export default function BeneficiaryManagement() {
    const { beneficiaries, isLoading, refetch } = useBeneficiaries();

    const [searchQuery, setSearchQuery] = useState("");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingBeneficiaryId, setEditingBeneficiaryId] = useState<string | null>(null);
    const [deletingBeneficiaryId, setDeletingBeneficiaryId] = useState<string | null>(null);

    // Client-side filtering
    const filteredBeneficiaries = useMemo(() => {
        if (!beneficiaries) return [];
        return beneficiaries.filter(
            (b) =>
                b.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
                b.accountNumber.includes(searchQuery),
        );
    }, [beneficiaries, searchQuery]);

    const handleCreateSuccess = async () => {
        await refetch();
        setIsCreateModalOpen(false);
    };

    const handleEditSuccess = async () => {
        await refetch();
        setEditingBeneficiaryId(null);
    };

    const handleDeleteSuccess = async () => {
        await refetch();
        setDeletingBeneficiaryId(null);
    };

    const editingBeneficiary = beneficiaries?.find((b) => b.id === editingBeneficiaryId) ?? null;

    if (isLoading) {
        return <Loading />;
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Beneficiaries</h1>
                        <p className="text-slate-500 text-sm mt-1">
                            Manage your saved payment contacts
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search contacts..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full md:w-64 pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-sm text-slate-800 bg-white shadow-sm"
                            />
                        </div>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 whitespace-nowrap shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Add Beneficiary
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBeneficiaries.map((beneficiary) => (
                        <BeneficiaryCard
                            key={beneficiary.id}
                            beneficiary={beneficiary}
                            onEdit={(id) => setEditingBeneficiaryId(id)}
                            onDelete={(id) => setDeletingBeneficiaryId(id)}
                        />
                    ))}

                    {filteredBeneficiaries.length === 0 && (
                        <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200 border-dashed">
                            No beneficiaries found.
                        </div>
                    )}
                </div>
            </div>

            <CreateBeneficiaryModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={handleCreateSuccess}
            />

            {editingBeneficiary && (
                <EditBeneficiaryModal
                    isOpen={!!editingBeneficiaryId}
                    beneficiary={editingBeneficiary}
                    onClose={() => setEditingBeneficiaryId(null)}
                    onSuccess={handleEditSuccess}
                />
            )}

            <DeleteBeneficiaryModal
                isOpen={!!deletingBeneficiaryId}
                beneficiaryId={deletingBeneficiaryId}
                onClose={() => setDeletingBeneficiaryId(null)}
                onSuccess={handleDeleteSuccess}
            />
        </div>
    );
}
