import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import type { AuthResponse } from "../types/auth";

export default function OAuthSuccess() {
    const navigate = useNavigate();
    const { completeOAuthLogin } = useAuth();

    useEffect(() => {
        const params = new URLSearchParams(window.location.hash.substring(1));

        const token = params.get("token");
        const email = params.get("email");
        const picture = params.get("picture");
        const role = params.get("role");

        if (!token) {
            navigate("/login", { replace: true });
            return;
        }

        const authData: AuthResponse = {
            token,
            email,
            picture,
            role
        };

        completeOAuthLogin(authData);

        if (role === "ADMIN") {
            navigate("/dashboard", { replace: true });
        } else {
            navigate("/cars", { replace: true });
        }
    }, [completeOAuthLogin, navigate]);

    return <p>Signing in...</p>;
}