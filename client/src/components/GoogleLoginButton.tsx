import React from "react";

export default function GoogleLoginButton() {

    const handleLogin = () => {
        window.location.href = "http://localhost:8080/oauth2/authorization/google";
    };

    return (
        <button
            onClick={handleLogin}
            style={{
                padding: "10px 20px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                backgroundColor: "white",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: 500
            }}
        >
            <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                width="20"
                height="20"
            />
            Enter with Google
        </button>
    );
}
