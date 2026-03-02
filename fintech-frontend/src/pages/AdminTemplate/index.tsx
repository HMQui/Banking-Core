import { Outlet } from "react-router-dom";
export default function AdminTemplate() {
    return (
        <div className="flex min-h-screen bg-zinc-900 text-white">
            <aside className="w-64 border-r border-zinc-700 p-4 font-bold">ADMIN SIDEBAR</aside>
            <main className="flex-1 p-6">
                <Outlet />
            </main>
        </div>
    );
}
