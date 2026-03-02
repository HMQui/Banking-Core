import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../../hooks/redux";

export default function GuestGuard() {
    const { isAuthenticated } = useAppSelector((state) => state.auth);

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}
