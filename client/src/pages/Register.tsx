import { useState } from "react";
import http from "../api/http";
import FormField from "../components/FormField";
import { useNavigate } from "react-router-dom";

export default function Register() {
    const [form, setForm] = useState({ email: "", password: "" });
    const navigate = useNavigate();

    const onChange = (e:any) => setForm({...form, [e.target.name]: e.target.value});

    const onSubmit = async (e:any) => {
        e.preventDefault();
        const res = await http.post("/auth/register", form);
        localStorage.setItem("token", res.data.token);
        navigate("/dashboard");
    };

    return (
        <form className="col-md-6 mx-auto needs-validation" noValidate onSubmit={onSubmit}>
            <h3>Registration</h3>
            <FormField label="Email" type="email" name="email" value={form.email} onChange={onChange} required />
            <FormField label="password (min. 6 symbols)" type="password" name="password" value={form.password} onChange={onChange} required />
            <button className="btn-success">Create profile</button>
        </form>
    );
}
