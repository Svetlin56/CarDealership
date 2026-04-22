import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import http from "../api/http";
import FormField from "../components/FormField";
import { useAuth } from "../contexts/AuthContext";
import type { AuthResponse } from "../types/auth";

export default function Register() {
    const [form, setForm] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const navigate = useNavigate();
    const { login } = useAuth();

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
        setErrors({});

        try {
            const res = await http.post<AuthResponse>("/auth/register", form);

            login(res.data);

            if (res.data.role === "ADMIN") {
                navigate("/dashboard", { replace: true });
            } else {
                navigate("/cars", { replace: true });
            }
        } catch (err: any) {
            if (err.response?.status === 400) {
                const apiErrors =
                    err.response?.data?.fieldErrors ||
                    err.response?.data?.errors;

                if (apiErrors) {
                    setErrors(apiErrors);
                }
            }
        }
    };

    return (
        <form
            className="col-md-6 mx-auto needs-validation"
            noValidate
            onSubmit={onSubmit}
        >
            <h3>Registration</h3>

            <FormField
                label="Email"
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                required
                error={errors.email}
            />

            <FormField
                label="Password (min. 6 symbols)"
                type="password"
                name="password"
                value={form.password}
                onChange={onChange}
                required
                error={errors.password}
            />
            {/* From Uiverse.io by cssbuttons-io */}
            <div className="btn-wrapper">
                <button className="btn-success">
                    Create profile
                </button>
            </div>
        </form>
    );
}