export type AuthUser = {
    email: string | null;
    role: string | null;
    picture?: string | null;
};

export type AuthResponse = {
    token: string;
    email: string | null;
    role: string | null;
    picture?: string | null;
};