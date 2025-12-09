// import { useState } from "react";
// import http from "../api/http";
// import FormField from "../components/FormField";
// import { useNavigate } from "react-router-dom";
//
// export default function Login() {
//     const [form, setForm] = useState({ email: "", password: "" });
//     const navigate = useNavigate();
//
//     const onChange = (e: any) =>
//         setForm({ ...form, [e.target.name]: e.target.value });
//
//     const onSubmit = async (e: any) => {
//         e.preventDefault();
//         try {
//             const res = await http.post("/auth/login", form);
//             localStorage.setItem("token", res.data.token);
//             navigate("/dashboard");
//         } catch (err) {
//             alert("Wrong email or password");
//         }
//     };
//
//     const googleLogin = () => {
//         window.location.href = "http://localhost:8080/oauth2/authorization/google";
//     };
//
//     return (
//         <div className="col-md-6 mx-auto mt-4">
//             <h3 className="mb-3">Login</h3>
//
//             {/* Email / Password Form */}
//             <form className="needs-validation" noValidate onSubmit={onSubmit}>
//                 <FormField
//                     label="Email"
//                     type="email"
//                     name="email"
//                     value={form.email}
//                     onChange={onChange}
//                     required
//                 />
//
//                 <FormField
//                     label="Password"
//                     type="password"
//                     name="password"
//                     value={form.password}
//                     onChange={onChange}
//                     required
//                 />
//
//                 <button className="btn btn-primary w-100 mt-3">Login</button>
//             </form>
//
//             {/* Divider */}
//             <div className="text-center my-3">
//                 <span>or</span>
//             </div>
//
//             {/* GOOGLE LOGIN BUTTON */}
//             <button
//                 type="button"
//                 className="btn btn-light border w-100 d-flex align-items-center justify-content-center gap-2"
//                 onClick={googleLogin}
//             >
//                 <img
//                     src="https://developers.google.com/identity/images/g-logo.png"
//                     alt="Google logo"
//                     style={{ width: "20px" }}
//                 />
//                 Login with Google
//             </button>
//         </div>
//     );
// }


import { useState } from "react";
import http from "../api/http";
import FormField from "../components/FormField";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [form, setForm] = useState({ email: "", password: "" });
    const navigate = useNavigate();

    const onChange = (e: any) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const onSubmit = async (e: any) => {
        e.preventDefault();

        try {
            const res = await http.post("/auth/login", form);

            // Save token + user info
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data));

            // Redirection based on role
            if (res.data.role === "ADMIN") {
                navigate("/dashboard");
            } else {
                navigate("/cars");
            }

        } catch (err) {
            alert("Wrong email or password");
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
                />

                <FormField
                    label="Password"
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={onChange}
                    required
                />

                <button className="btn btn-primary w-100 mt-3">Login</button>
            </form>

            <div className="text-center my-3">
                <span>or</span>
            </div>

            <button
                type="button"
                className="btn btn-light border w-100 d-flex align-items-center justify-content-center gap-2"
                onClick={googleLogin}
            >
                <img
                    src="https://developers.google.com/identity/images/g-logo.png"
                    alt="Google logo"
                    style={{ width: "20px" }}
                />
                Login with Google
            </button>
        </div>
    );
}
