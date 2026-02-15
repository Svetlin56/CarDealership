import { useState } from "react";
import http from "../api/http";
import FormField from "../components/FormField";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [form, setForm] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const navigate = useNavigate();

    const onChange = (e: any) => {
        setForm({ ...form, [e.target.name]: e.target.value });

        setErrors(prev => ({ ...prev, [e.target.name]: "" }));
    };

    const onSubmit = async (e: any) => {
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
            const res = await http.post("/auth/login", form);

            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data));

            if (res.data.role === "ADMIN") {
                navigate("/dashboard");
            } else {
                navigate("/cars");
            }

        } catch (err) {
            alert("Wrong email or password!");
        }
    };

    const googleLogin = () => {
        window.location.href = "http://localhost:8080/oauth2/authorization/google";
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
                    required
                    error={errors.email}
                />

                <FormField
                    label="Password"
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={onChange}
                    required
                    error={errors.password}
                />
                {/* From Uiverse.io by cssbuttons-io */}
                <div className="login-wrapper">
                    <button className="login-button">
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
