import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import PublicOnlyRoute from "./components/PublicOnlyRoute";
import Home from "./pages/Home";
import Cars from "./pages/Cars";
import CarDetails from "./pages/CarDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import OAuthSuccess from "./pages/OAuthSuccess";
import Recommendations from "./pages/Recommendations";

export default function App() {
    return (
        <Layout>
            <Routes>
                <Route path="/" element={<Home />} />

                <Route element={<PublicOnlyRoute />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                </Route>

                <Route path="/oauth-success" element={<OAuthSuccess />} />

                <Route element={<ProtectedRoute />}>
                    <Route path="/cars" element={<Cars />} />
                    <Route path="/cars/:id" element={<CarDetails />} />
                    <Route path="/recommendations" element={<Recommendations />} />
                </Route>

                <Route element={<AdminRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                </Route>
            </Routes>
        </Layout>
    );
}