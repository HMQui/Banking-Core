import { useState, useRef, useEffect } from "react";
import { MoreVertical, Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import type { Beneficiary } from "../../../../types/beneficiary";

interface BeneficiaryCardProps {
    beneficiary: Beneficiary;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
}

export default function BeneficiaryCard({ beneficiary, onEdit, onDelete }: BeneficiaryCardProps) {
    const [showFullNumber, setShowFullNumber] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const initials = beneficiary.nickname
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();

    const maskedNumber =
        "*".repeat(Math.max(beneficiary.accountNumber.length - 4, 0)) +
        beneficiary.accountNumber.slice(-4);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-start gap-4 relative">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-semibold text-lg shrink-0 mt-1">
                {initials}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-slate-900 truncate pr-2">
                        {beneficiary.nickname}
                    </h3>

                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-slate-400 hover:text-slate-600 transition-colors p-1 -mr-2 -mt-1 rounded-md hover:bg-slate-50"
                        >
                            <MoreVertical className="w-4 h-4" />
                        </button>

                        {isMenuOpen && (
                            <div className="absolute top-full right-0 mt-1 w-32 bg-white border border-slate-200 shadow-lg rounded-lg z-10 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                <button
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        onEdit(beneficiary.id);
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"
                                >
                                    <Pencil className="w-4 h-4" />
                                    Edit
                                </button>
                                <button
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        onDelete(beneficiary.id);
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left font-medium"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <p className="text-sm text-slate-500 truncate mb-2">{beneficiary.bankName}</p>

                <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 mt-1">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                        Account Number
                    </p>
                    <div className="flex items-center justify-between gap-2">
                        <p className="text-slate-700 font-mono text-xs tracking-wider truncate">
                            {showFullNumber ? beneficiary.accountNumber : maskedNumber}
                        </p>
                        <button
                            onClick={() => setShowFullNumber(!showFullNumber)}
                            className="text-slate-400 hover:text-slate-600 transition-colors shrink-0"
                        >
                            {showFullNumber ? (
                                <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                                <Eye className="w-3.5 h-3.5" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
