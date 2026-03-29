import type { FormEvent } from "react";
import type { AccountData } from "../../../../types/account";
import type { Currency } from "../../../../types/transaction";

export interface TransferFormData {
    senderAccountId: string;
    receiverAccountNumber: string;
    amount: number | "";
    currency: Currency;
    description: string;
}

interface TransferFormProps {
    formData: TransferFormData;
    accounts: AccountData[];
    isLoadingAccounts: boolean;
    isTransferring: boolean;
    fieldError: string;
    onChange: (field: keyof TransferFormData, value: string | number) => void;
    onSubmit: (e: FormEvent) => void;
}

export default function TransferForm({
    formData,
    accounts,
    isLoadingAccounts,
    isTransferring,
    fieldError,
    onChange,
    onSubmit,
}: TransferFormProps) {
    return (
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm">
            <form onSubmit={onSubmit} className="flex flex-col gap-6">
                <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        From Account
                    </label>
                    <select
                        value={formData.senderAccountId}
                        onChange={(e) => onChange("senderAccountId", e.target.value)}
                        disabled={isLoadingAccounts}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm text-slate-800 bg-slate-50 disabled:opacity-50 appearance-none"
                    >
                        {isLoadingAccounts ? (
                            <option>Loading accounts...</option>
                        ) : accounts.length === 0 ? (
                            <option>No accounts available</option>
                        ) : (
                            accounts.map((acc) => (
                                <option key={acc.id} value={acc.id}>
                                    {acc.accountName} (**** {acc.accountNumber.slice(-4)}) -{" "}
                                    {acc.balance.toLocaleString()} {acc.currency}
                                </option>
                            ))
                        )}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Transfer To
                    </label>
                    <input
                        type="text"
                        value={formData.receiverAccountNumber}
                        onChange={(e) => onChange("receiverAccountNumber", e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm text-slate-800 placeholder-slate-400"
                        placeholder="Account Number or IBAN"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-3">
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                            Amount
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                                $
                            </span>
                            <input
                                type="number"
                                min="1"
                                value={formData.amount}
                                onChange={(e) => onChange("amount", Number(e.target.value))}
                                className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-lg font-medium text-slate-800 placeholder-slate-300"
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                            Currency
                        </label>
                        <select
                            value={formData.currency}
                            disabled // tied to the selected account's currency
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-500 text-sm appearance-none"
                        >
                            <option value="VND">VND</option>
                            <option value="USD">USD</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Message (Optional)
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => onChange("description", e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm text-slate-800 resize-none placeholder-slate-400"
                        placeholder="Add a reference note..."
                    />
                </div>

                {fieldError && (
                    <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">
                        {fieldError}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isTransferring || isLoadingAccounts}
                    className="mt-2 w-full bg-slate-900 hover:bg-slate-800 text-white px-6 py-3.5 rounded-xl font-medium text-sm transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                    {isTransferring ? "Processing..." : "Review Transfer"}
                </button>
            </form>
        </div>
    );
}
