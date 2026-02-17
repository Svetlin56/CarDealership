import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function OAuthSuccess() {
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        const token = params.get("token");
        const email = params.get("email");
        const picture = params.get("picture");

        if (token) {
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify({ email, picture }));
        }

        navigate("/");
    }, []);

    return <p>Signing in...</p>;
}
