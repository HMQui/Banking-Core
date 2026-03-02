import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./LayOut/SideBar";
import Header from "./LayOut/Header";

const UserTemplate: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

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
