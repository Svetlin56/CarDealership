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
        http.defaults.headers.common.Authorization = `Bearer ${normalizedToken}`;
    } else {
        delete http.defaults.headers.common.Authorization;
    }
}

http.interceptors.request.use(config => {
    const token = localStorage.getItem("token");

    if (token && token.trim()) {
        config.headers.Authorization = `Bearer ${token.trim()}`;
    }

    return config;
});

export default http;