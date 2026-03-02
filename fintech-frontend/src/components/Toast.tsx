import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
    type: ToastType;
    title: string;
    message: string;
    onClose: () => void;
}

export default function Toast({ type, title, message, onClose }: ToastProps) {
    const styles = {
        success: {
            border: "border-green-500",
            icon: <CheckCircle className="w-5 h-5 text-green-500" />,
        },
        error: {
            border: "border-red-500",
            icon: <AlertCircle className="w-5 h-5 text-red-500" />,
        },
        info: {
            border: "border-blue-500",
            icon: <Info className="w-5 h-5 text-blue-600" />,
        },
    };

    const { border, icon } = styles[type];

    return (
        <div
            className={`bg-white shadow-lg rounded-lg border-l-4 ${border} p-4 pr-10 relative flex items-start gap-3 w-full max-w-sm pointer-events-auto`}
        >
            <div className="shrink-0 mt-0.5">{icon}</div>
            <div>
                <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
                <p className="text-sm text-slate-500 mt-1">{message}</p>
            </div>
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
