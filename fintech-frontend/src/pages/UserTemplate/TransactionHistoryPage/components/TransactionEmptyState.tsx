import { useNavigate } from "react-router-dom";

export default function TransactionEmptyState() {
    const navigate = useNavigate();

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-12 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-5">
                <svg
                    className="w-10 h-10 text-slate-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                </svg>
            </div>

            <h3 className="text-lg font-semibold text-slate-900">No transactions found</h3>
            <p className="text-slate-500 mt-2 text-sm max-w-sm leading-relaxed">
                It looks like you haven't made any transactions during this period. Start by adding
                funds or making a transfer.
            </p>

            <button
                onClick={() => navigate("/transfer")}
                className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-lg mt-8 font-medium text-sm transition-colors shadow-sm flex items-center gap-2"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                    />
                </svg>
                Make a Transfer
            </button>
        </div>
    );
}
