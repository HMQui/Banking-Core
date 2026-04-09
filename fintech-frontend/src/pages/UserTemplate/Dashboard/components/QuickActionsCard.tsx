import { ArrowLeftRight, Settings, ChevronRight, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function QuickActionsCard() {
    const actions = [
        { name: "Transfer", icon: ArrowLeftRight, href: "/transactions" },
        { name: "Beneficiaries", icon: Users, href: "/beneficiaries" },
        { name: "Settings", icon: Settings, href: "/me" },
    ];
    const navigate = useNavigate();

    return (
        <div className="md:col-span-1 bg-white rounded-xl p-6 border border-slate-200 h-full">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
            <div className="flex flex-col gap-3">
                {actions.map((action, idx) => (
                    <button
                        key={idx}
                        className="flex items-center justify-between w-full p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors group"
                        onClick={() => navigate(action.href)}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 group-hover:text-blue-900 group-hover:bg-blue-100 transition-colors">
                                <action.icon className="w-4 h-4" />
                            </div>
                            <span className="font-medium text-slate-700 group-hover:text-blue-900">
                                {action.name}
                            </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-900" />
                    </button>
                ))}
            </div>
        </div>
    );
}
