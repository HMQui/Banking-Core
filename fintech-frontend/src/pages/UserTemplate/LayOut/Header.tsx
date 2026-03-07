import React from "react";
import { Menu, Bell, LogOut, LogIn } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootReduxState } from "../../../store";
import { logoutThunk } from "../../../store/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../../hooks/redux";

interface HeaderProps {
    toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
    const user = useSelector((state: RootReduxState) => state.auth.user);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await dispatch(logoutThunk()).unwrap();
            navigate("/");
        } catch (error) {
            if (error instanceof Error) {
                console.error("Logout failed:", error.message);
            } else {
                console.error("Logout failed:", error);
            }
        }
    };

    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-30">
            <div className="flex items-center">
                <button
                    className="mr-4 text-slate-500 hover:text-slate-700 md:hidden"
                    onClick={toggleSidebar}
                >
                    <Menu className="w-6 h-6" />
                </button>{" "}
                <h2 className="text-lg font-semibold text-slate-900 hidden sm:block">Dashboard</h2>
            </div>

            <div className="flex items-center space-x-4 sm:space-x-6">
                {/* Notifications */}
                <button className="text-slate-400 hover:text-slate-500 relative">
                    <span className="sr-only">View notifications</span>
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                </button>

                {user ? (
                    <div className="hidden sm:flex items-center text-sm">
                        <span className="text-slate-500 mr-1">Welcome back,</span>
                        <span className="font-semibold text-slate-900">{user.fullName}</span>
                    </div>
                ) : (
                    <div className="hidden sm:flex items-center text-sm">
                        <span className="text-slate-500 mr-1">Welcome to </span>
                        <span className="font-semibold text-slate-900">FinTech</span>
                    </div>
                )}

                <div className="h-6 w-px bg-slate-200 hidden sm:block" />

                {/* Logout/LogIn Button */}
                {user ? (
                    <button
                        className="flex items-center justify-center px-3 py-1.5 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        onClick={handleLogout}
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                    </button>
                ) : (
                    <button
                        className="flex items-center justify-center px-3 py-1.5 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        onClick={() => navigate("/auth")}
                    >
                        <LogIn className="w-4 h-4 mr-2" />
                        Login
                    </button>
                )}
            </div>
        </header>
    );
};

export default Header;
