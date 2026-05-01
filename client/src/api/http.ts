import axios from "axios";

const rawApiUrl = import.meta.env.VITE_API_URL ?? "";

export const API_BASE_URL = rawApiUrl.replace(/\/+$/, "");
export const API_V1_BASE_URL = `${API_BASE_URL}/api/v1`;

const http = axios.create({
    baseURL: API_V1_BASE_URL,
    headers: {
        "Content-Type": "application/json"
    },
    withCredentials: true
});

http.interceptors.response.use(
    response => response,
    error => {
        const status = error?.response?.status;

        if (status === 401 || status === 403) {
            const currentPath = window.location.pathname;
            const isAuthPage = currentPath === "/login" || currentPath === "/register";

            if (!isAuthPage) {
                localStorage.removeItem("user");
            }
        }

        return Promise.reject(error);
    }
);

export default http;