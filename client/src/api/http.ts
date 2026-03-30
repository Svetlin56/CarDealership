import axios from "axios";

export const API_BASE_URL =
    import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:8080";

const http = axios.create({
    baseURL: `${API_BASE_URL}/api/v1`,
    headers: { "Content-Type": "application/json" }
});

http.interceptors.request.use(config => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default http;