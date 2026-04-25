export type AuthUser = {
    email: string | null;
    role: string | null;
    picture?: string | null;
};

export type AuthResponse = {
    token?: string | null;
    email: string | null;
    role: string | null;
    picture?: string | null;
};