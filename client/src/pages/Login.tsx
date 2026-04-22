import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import http, { API_BASE_URL } from "../api/http";
import FormField from "../components/FormField";
import { useAuth } from "../contexts/AuthContext";
import type { AuthResponse } from "../types/auth";

export default function Login() {
    const [form, setForm] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;

    const onChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        setForm(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));

        setErrors(prev => ({
            ...prev,
            [e.target.name]: ""
        }));
    };

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const newErrors: Record<string, string> = {};

        if (!form.email.trim()) {
            newErrors.email = "Can't be empty!";
        }

        if (!form.password.trim()) {
            newErrors.password = "Can't be empty!";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            const res = await http.post<AuthResponse>("/auth/login", form);

            login(res.data);

            const targetPath =
                res.data.role === "ADMIN"
                    ? "/dashboard"
                    : from || "/cars";

            navigate(targetPath, { replace: true });
        } catch (err: any) {
            if (err.response?.status === 400 && err.response?.data?.fieldErrors) {
                setErrors(err.response.data.fieldErrors);
                return;
            }

            alert("Wrong email or password!");
        }
    };

    const googleLogin = () => {
        window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
    };

    return (
        <div className="col-md-6 mx-auto mt-4">
            <h3 className="mb-3">Login</h3>

            <form className="needs-validation" noValidate onSubmit={onSubmit}>
                <FormField
                    label="Email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={onChange}
                    required={true}
                    error={errors.email}
                />

                <FormField
                    label="Password"
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={onChange}
                    required={true}
                    error={errors.password}
                />
                {/* From Uiverse.io by cssbuttons-io */}
                <div className="login-wrapper">
                    <button type="submit" className="login-button">
                        Login
                    </button>
                </div>
            </form>

            <div className="text-center my-3">
                <span>or</span>
            </div>
            {/* From Uiverse.io by cssbuttons-io */}
            <div className="buttonGoogle-wrapper">
                <button
                    type="button"
                    className="google-button"
                    onClick={googleLogin}
                >
                    <img
                        className="google-img"
                        src="https://developers.google.com/identity/images/g-logo.png"
                        alt="Google logo"
                        style={{ width: "24px" }}
                    />
                    Login with Google
                </button>
            </div>
        </div>
    );
}