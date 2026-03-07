import { Navigate } from "react-router-dom";
import { useAppSelector } from "../../hooks/redux";
import PublicLandingPage from "../../pages/AuthPage/PublicLandingPage";

export default function HomeRedirect() {
    const { isAuthenticated } = useAppSelector((state) => state.auth);

    if (!isAuthenticated) {
        return <PublicLandingPage />;
    }

    return <Navigate to="/dashboard" replace />;
}
