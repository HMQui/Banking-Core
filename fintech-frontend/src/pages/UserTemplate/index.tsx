import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import Sidebar from "./LayOut/SideBar";
import Header from "./LayOut/Header";
import { toast } from "../../components/common/Toast/toastManager";
import { socketService, type NotificationPayload } from "../../utils/socketService";
import type { RootState } from "../../store/index";

const UserTemplate: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Extract auth state from Redux
    const { user, accessToken, isAuthenticated } = useSelector((state: RootState) => state.auth);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    useEffect(() => {
        if (isAuthenticated && user?.id && accessToken) {
            socketService.connect(user.id, accessToken);

            socketService.onNotification((payload: NotificationPayload) => {
                if (payload.type === "TRANSACTION_RECEIVED") {
                    const { amount, currency, senderName, description } = payload.data;

                    toast.success(
                        `${senderName} just sent you a transaction!`,
                        `${amount.toLocaleString()} ${currency} - ${description}.`,
                        5000
                    );
                }
            });

            // Cleanup function runs on unmount or when auth state changes (e.g., logout)
            return () => {
                socketService.offNotification();
                socketService.disconnect();
            };
        }
    }, [isAuthenticated, user?.id, accessToken]);

    return (
        <div className="min-h-screen flex bg-slate-50 font-sans text-slate-800">
            <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

            <div className="flex-1 flex flex-col min-h-screen md:pl-64 w-full">
                {/* Header */}
                <Header toggleSidebar={toggleSidebar} />

                {/* Main Content Area */}
                <main className="flex-1 p-4 md:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default UserTemplate;
