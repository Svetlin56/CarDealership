import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setAuthToken } from "../api/http";

export default function OAuthSuccess() {
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.hash.substring(1));

        const token = params.get("token");
        const email = params.get("email");
        const picture = params.get("picture");
        const role = params.get("role");

        if (token) {
            localStorage.setItem("token", token);
            localStorage.setItem(
                "user",
                JSON.stringify({ email, picture, role })
            );

            setAuthToken(token);
        }

        if (role === "ADMIN") {
            navigate("/dashboard");
        } else {
            navigate("/cars");
        }
    }, [navigate]);

    return <p>Signing in...</p>;
}