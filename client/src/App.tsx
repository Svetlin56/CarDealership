import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Cars from "./pages/Cars";
import CarDetails from "./pages/CarDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import OAuthSuccess from "./pages/OAuthSuccess";

export default function App() {
    return (
        <Layout>
            <Routes>
                <Route path="/" element={<Home/>} />
                <Route path="/cars" element={<Cars/>} />
                <Route path="/cars/:id" element={<CarDetails/>} />
                <Route path="/login" element={<Login/>} />
                <Route path="/register" element={<Register/>} />
                <Route path="/dashboard" element={<Dashboard/>} />
                <Route path="/oauth-success" element={<OAuthSuccess />} />
            </Routes>
        </Layout>
    );
}
