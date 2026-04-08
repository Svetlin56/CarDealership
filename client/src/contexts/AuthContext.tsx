import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState
} from "react";
import { API_BASE_URL, setAuthToken } from "../api/http";
import type { AuthResponse, AuthUser } from "../types/auth";

type AuthContextType = {
    token: string | null;
    user: AuthUser | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isInitializing: boolean;
    login: (authData: AuthResponse) => void;
    logout: () => Promise<void>;
    completeOAuthLogin: (authData: AuthResponse) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_STORAGE_KEY = "token";
const USER_STORAGE_KEY = "user";

function getStoredToken(): string | null {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    return token && token.trim() ? token.trim() : null;
}

function getStoredUser(): AuthUser | null {
    const rawUser = localStorage.getItem(USER_STORAGE_KEY);

    if (!rawUser) {
        return null;
    }

    try {
        const parsed = JSON.parse(rawUser);

        return {
            email: parsed.email ?? null,
            role: parsed.role ?? null,
            picture: parsed.picture ?? null
        };
    } catch {
        return null;
    }
}

function persistAuth(token: string, user: AuthUser) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    setAuthToken(token);
}

function clearPersistedAuth() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setAuthToken(null);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() => {
        const storedToken = getStoredToken();
        const storedUser = getStoredUser();

        if (storedToken) {
            setAuthToken(storedToken);
            setToken(storedToken);
        }

        if (storedUser) {
            setUser(storedUser);
        }

        if (!storedToken || !storedUser) {
            if (!storedToken && storedUser) {
                localStorage.removeItem(USER_STORAGE_KEY);
            }

            if (storedToken && !storedUser) {
                localStorage.removeItem(TOKEN_STORAGE_KEY);
                setAuthToken(null);
                setToken(null);
            }
        }

        setIsInitializing(false);
    }, []);

    const login = useCallback((authData: AuthResponse) => {
        const normalizedUser: AuthUser = {
            email: authData.email ?? null,
            role: authData.role ?? null,
            picture: authData.picture ?? null
        };

        persistAuth(authData.token, normalizedUser);
        setToken(authData.token);
        setUser(normalizedUser);
    }, []);

    const completeOAuthLogin = useCallback((authData: AuthResponse) => {
        login(authData);
    }, [login]);

    const logout = useCallback(async () => {
        try {
            await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
                method: "POST",
                credentials: "include"
            });
        } catch (error) {
            console.error("Logout request failed:", error);
        } finally {
            clearPersistedAuth();
            setToken(null);
            setUser(null);
        }
    }, []);

    const value = useMemo<AuthContextType>(() => {
        const isAuthenticated = Boolean(token && user);
        const isAdmin = user?.role === "ADMIN";

        return {
            token,
            user,
            isAuthenticated,
            isAdmin,
            isInitializing,
            login,
            logout,
            completeOAuthLogin
        };
    }, [token, user, isInitializing, login, logout, completeOAuthLogin]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider.");
    }

    return context;
}