import React from "react";
import {
    LayoutDashboard,
    ArrowLeftRight,
    Users,
    CreditCard,
    FileText,
    Settings,
    HelpCircle,
    Landmark,
    X,
} from "lucide-react";
import { useSelector } from "react-redux";
import type { RootReduxState } from "../../../store";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const user = useSelector((state: RootReduxState) => state.auth.user);
    const navItems = [
        { name: "Dashboard", icon: LayoutDashboard, active: true },
        { name: "Transfer", icon: ArrowLeftRight, active: false },
        { name: "Beneficiaries", icon: Users, active: false },
        { name: "Cards", icon: CreditCard, active: false },
        { name: "Statements", icon: FileText, active: false },
    ];

    const systemItems = [
        { name: "Settings", icon: Settings, active: false },
        { name: "Support", icon: HelpCircle, active: false },
    ];

    return (
        <>
            {/* Mobile Sidebar Overlay */}
            {isOpen && (
                <div className="fixed inset-0 bg-slate-900/50 z-40 md:hidden" onClick={onClose} />
            )}

            {/* Sidebar Content */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
                    isOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                {/* Sidebar Header / Logo */}
                <div className="h-16 flex items-center px-6 border-b border-slate-800">
                    <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center mr-3">
                        <Landmark className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-white font-semibold text-sm leading-tight">
                            Global Finance
                        </h1>
                        <p className="text-xs text-slate-400">Core Banking</p>
                    </div>
                    <button
                        className="ml-auto md:hidden text-slate-400 hover:text-white"
                        onClick={onClose}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Sidebar Navigation */}
                <nav className="flex-1 overflow-y-auto py-4">
                    <ul className="px-3 space-y-1">
                        {navItems.map((item) => (
                            <li key={item.name}>
                                <a
                                    href={`#${item.name.toLowerCase()}`}
                                    className={`flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                                        item.active
                                            ? "bg-blue-900/50 text-blue-400"
                                            : "hover:text-white hover:bg-slate-800"
                                    }`}
                                >
                                    <item.icon
                                        className={`w-5 h-5 mr-3 ${item.active ? "text-blue-500" : "text-slate-400"}`}
                                    />
                                    {item.name}
                                </a>
                            </li>
                        ))}
                    </ul>

                    <div className="mt-8 px-6 mb-2">
                        <p className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
                            System
                        </p>
                    </div>
                    <ul className="px-3 space-y-1">
                        {systemItems.map((item) => (
                            <li key={item.name}>
                                <a
                                    href={`#${item.name.toLowerCase()}`}
                                    className="flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors hover:text-white hover:bg-slate-800"
                                >
                                    <item.icon className="w-5 h-5 mr-3 text-slate-400" />
                                    {item.name}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* User Profile Info */}
                {user ? (
                    <div className="p-4 border-t border-slate-800">
                        <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-medium text-white mr-3">
                                {user.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white">
                                    {user ? user.fullName : "Unknown User"}
                                </p>
                                <p className="text-xs text-slate-400">
                                    {user.role === "USER" ? "Personal Account" : "Admin Account"}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-4 border-t border-slate-800">
                        <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-medium text-white mr-3">
                                B
                            </div>
                            <div>
                                LogIn to see profile
                            </div>
                        </div>
                    </div>
                )}
            </aside>
        </>
    );
};

export default Sidebar;
