import { Headset, Landmark } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AuthHeader() {
    const navigate = useNavigate();
    return (
        <header className="w-full bg-white border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center" onClick={() => navigate("/")}>
                {/* Logo + Brand */}
                <div className="flex items-center gap-3 cursor-pointer">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Landmark className="w-5 h-5 text-white" />
                    </div>

                    <div>
                        <h1 className="text-slate-900 font-semibold text-sm leading-tight">
                            Global Finance
                        </h1>
                        <p className="text-xs text-slate-500">Core Banking</p>
                    </div>
                </div>

                {/* Support Button */}
                <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                    <Headset className="w-4 h-4" />
                    Support
                </button>
            </div>
        </header>
    );
}
