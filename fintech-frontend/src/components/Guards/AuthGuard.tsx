import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../../hooks/redux";

interface AuthGuardProps {
    role?: string;
    redirectPath?: string;
}

export default function AuthGuard({ role, redirectPath = "/auth" }: AuthGuardProps) {
    const { isAuthenticated, user } = useAppSelector((state) => state.auth);

    // 1. Unauthenticated users are redirected to login
    if (!isAuthenticated) {
        return <Navigate to={redirectPath} replace />;
    }

    // 2. Role-based Access Control (RBAC) validation
    if (role && user?.role !== role) {
        // Redirect to the appropriate dashboard based on their actual role
        const fallbackPath = user?.role === "ADMIN" ? "/admin" : "/";
        return <Navigate to={fallbackPath} replace />;
    }

    // 3. Authorized access granted
    return <Outlet />;
}
