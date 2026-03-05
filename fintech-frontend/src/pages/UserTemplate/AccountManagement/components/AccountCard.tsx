import { useState } from "react";
import { Pencil, Eye, EyeOff } from "lucide-react";

interface AccountCardProps {
    id: string;
    accountName: string;
    accountNumber: string;
    balance: number;
    currency: string;
    isPrimary: boolean;
    onEdit: (id: string, name: string) => void;
}

export default function AccountCard({
    id,
    accountName,
    accountNumber,
    balance,
    currency,
    isPrimary,
    onEdit,
}: AccountCardProps) {
    const [showFullNumber, setShowFullNumber] = useState(false);

    const maskedNumber =
        "*".repeat(Math.max(accountNumber.length - 4, 0)) + accountNumber.slice(-4);

    return (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                        {isPrimary && (
                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                                Primary
                            </span>
                        )}
                    </div>

                    <button
                        onClick={() => onEdit(id, accountName)}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                </div>

                <h3 className="font-semibold text-slate-800 mt-2">{accountName}</h3>

                <div className="flex items-center gap-2 mt-1">
                    <p className="text-slate-400 font-mono text-xs tracking-wider w-27.5">
                        {showFullNumber ? accountNumber : maskedNumber}
                    </p>

                    <button
                        onClick={() => setShowFullNumber(!showFullNumber)}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        {showFullNumber ? (
                            <EyeOff className="w-4 h-4" />
                        ) : (
                            <Eye className="w-4 h-4" />
                        )}
                    </button>
                </div>
            </div>

            <div className="mt-8">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Available Balance
                </p>
                <p className="text-xl font-bold text-slate-900 mt-1">
                    {new Intl.NumberFormat("en-US").format(balance)}{" "}
                    <span className="text-sm font-medium text-slate-500">{currency}</span>
                </p>
            </div>
        </div>
    );
}
