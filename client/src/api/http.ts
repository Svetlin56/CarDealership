import axios from "axios";

export const API_BASE_URL =
    import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:8080";

const http = axios.create({
    baseURL: `${API_BASE_URL}/api/v1`,
    headers: { "Content-Type": "application/json" },
    withCredentials: true
});

export function setAuthToken(token: string | null) {
    if (token && token.trim()) {
        const normalizedToken = token.trim();
        localStorage.setItem("token", normalizedToken);
        http.defaults.headers.common.Authorization = `Bearer ${normalizedToken}`;
    } else {
        localStorage.removeItem("token");
        delete http.defaults.headers.common.Authorization;
    }
}

const token = localStorage.getItem("token");
if (token) {
    setAuthToken(token);
}

http.interceptors.request.use(config => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default http;