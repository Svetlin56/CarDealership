import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState
} from "react";
import { API_BASE_URL } from "../api/http";
import type { AuthResponse, AuthUser } from "../types/auth";

type AuthContextType = {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isInitializing: boolean;
    login: (authData: AuthResponse) => void;
    logout: () => Promise<void>;
    completeOAuthLogin: (authData: AuthResponse) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = "user";

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

function persistUser(user: AuthUser) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

function clearPersistedAuth() {
    localStorage.removeItem(USER_STORAGE_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() => {
        setUser(getStoredUser());
        setIsInitializing(false);
    }, []);

    const login = useCallback((authData: AuthResponse) => {
        const normalizedUser: AuthUser = {
            email: authData.email ?? null,
            role: authData.role ?? null,
            picture: authData.picture ?? null
        };

        persistUser(normalizedUser);
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
            setUser(null);
        }
    }, []);

    const value = useMemo<AuthContextType>(() => {
        const isAuthenticated = Boolean(user);
        const isAdmin = user?.role === "ADMIN";

        return {
            user,
            isAuthenticated,
            isAdmin,
            isInitializing,
            login,
            logout,
            completeOAuthLogin
        };
    }, [user, isInitializing, login, logout, completeOAuthLogin]);

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