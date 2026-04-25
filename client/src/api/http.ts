import axios from "axios";

export const API_BASE_URL =
    import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:8080";

const http = axios.create({
    baseURL: `${API_BASE_URL}/api/v1`,
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