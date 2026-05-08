import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState
} from "react";
import http from "../api/http";
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

function getPersistedUser(): AuthUser | null {
    const rawUser = localStorage.getItem(USER_STORAGE_KEY);

    if (!rawUser) {
        return null;
    }

    try {
        return JSON.parse(rawUser) as AuthUser;
    } catch {
        localStorage.removeItem(USER_STORAGE_KEY);
        return null;
    }
}

function persistUser(user: AuthUser) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

function clearPersistedAuth() {
    localStorage.removeItem(USER_STORAGE_KEY);
}

function normalizePicture(picture?: string | null) {
    if (!picture) {
        return null;
    }

    const trimmedPicture = picture.trim();

    return trimmedPicture.length > 0 ? trimmedPicture : null;
}

function mapAuthResponseToUser(
    authData: AuthResponse,
    fallbackUser: AuthUser | null = null
): AuthUser {
    const normalizedPicture = normalizePicture(authData.picture);

    return {
        email: authData.email ?? fallbackUser?.email ?? null,
        role: authData.role ?? fallbackUser?.role ?? null,
        picture: normalizedPicture ?? fallbackUser?.picture ?? null
    };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(() => getPersistedUser());
    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() => {
        let isMounted = true;

        async function loadCurrentUser() {
            try {
                const persistedUser = getPersistedUser();
                const response = await http.get<AuthResponse>("/auth/me");
                const currentUser = mapAuthResponseToUser(response.data, persistedUser);

                if (isMounted) {
                    persistUser(currentUser);
                    setUser(currentUser);
                }
            } catch {
                if (isMounted) {
                    clearPersistedAuth();
                    setUser(null);
                }
            } finally {
                if (isMounted) {
                    setIsInitializing(false);
                }
            }
        }

        loadCurrentUser();

        return () => {
            isMounted = false;
        };
    }, []);

    const login = useCallback((authData: AuthResponse) => {
        const persistedUser = getPersistedUser();
        const normalizedUser = mapAuthResponseToUser(authData, persistedUser);

        persistUser(normalizedUser);
        setUser(normalizedUser);
    }, []);

    const completeOAuthLogin = useCallback((authData: AuthResponse) => {
        login(authData);
    }, [login]);

    const logout = useCallback(async () => {
        try {
            await http.post("/auth/logout");
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