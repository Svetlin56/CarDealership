import axios, { AxiosHeaders } from "axios";

const rawApiUrl = import.meta.env.VITE_API_URL ?? "";

export const API_BASE_URL = rawApiUrl.replace(/\/+$/, "");
export const API_V1_BASE_URL = `${API_BASE_URL}/api/v1`;

const CSRF_COOKIE_NAME = "XSRF-TOKEN";
const CSRF_HEADER_NAME = "X-XSRF-TOKEN";

type CsrfResponse = {
    token?: string;
    headerName?: string;
    parameterName?: string;
};

const http = axios.create({
    baseURL: API_V1_BASE_URL,
    headers: {
        "Content-Type": "application/json"
    },
    withCredentials: true,
    xsrfCookieName: CSRF_COOKIE_NAME,
    xsrfHeaderName: CSRF_HEADER_NAME
});

function readCookie(name: string): string | null {
    const cookie = document.cookie
        .split(";")
        .map(value => value.trim())
        .find(value => value.startsWith(`${name}=`));

    if (!cookie) {
        return null;
    }

    return decodeURIComponent(cookie.substring(name.length + 1));
}

function requiresCsrfToken(method?: string): boolean {
    const normalizedMethod = method?.toUpperCase() ?? "GET";

    return !["GET", "HEAD", "OPTIONS", "TRACE"].includes(normalizedMethod);
}

let csrfTokenRequest: Promise<string | null> | null = null;
let csrfTokenValue: string | null = null;

async function fetchCsrfToken(): Promise<string | null> {
    const response = await axios.get<CsrfResponse>(`${API_V1_BASE_URL}/csrf`, {
        withCredentials: true
    });

    const tokenFromBody = response.data?.token ?? null;
    const tokenFromCookie = readCookie(CSRF_COOKIE_NAME);

    csrfTokenValue = tokenFromCookie ?? tokenFromBody;

    return csrfTokenValue;
}

async function ensureCsrfToken(): Promise<string | null> {
    const existingCookieToken = readCookie(CSRF_COOKIE_NAME);

    if (existingCookieToken) {
        csrfTokenValue = existingCookieToken;
        return existingCookieToken;
    }

    if (csrfTokenValue) {
        return csrfTokenValue;
    }

    csrfTokenRequest ??= fetchCsrfToken().finally(() => {
        csrfTokenRequest = null;
    });

    return csrfTokenRequest;
}

http.interceptors.request.use(async config => {
    if (requiresCsrfToken(config.method)) {
        const csrfToken = await ensureCsrfToken();

        if (csrfToken) {
            const headers = AxiosHeaders.from(config.headers);
            headers.set(CSRF_HEADER_NAME, csrfToken);
            config.headers = headers;
        }
    }

    return config;
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