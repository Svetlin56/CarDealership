import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function PublicOnlyRoute() {
    const { isAuthenticated, isAdmin, isInitializing } = useAuth();

    if (isInitializing) {
        return <p>Loading...</p>;
    }

    if (isAuthenticated) {
        return <Navigate to={isAdmin ? "/dashboard" : "/cars"} replace />;
    }

    return <Outlet />;
}