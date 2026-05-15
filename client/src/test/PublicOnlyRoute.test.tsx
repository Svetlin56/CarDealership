import { describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import PublicOnlyRoute from "../components/PublicOnlyRoute";

vi.mock("../contexts/AuthContext", () => ({
    useAuth: vi.fn()
}));

import { useAuth } from "../contexts/AuthContext";

const mockedUseAuth = vi.mocked(useAuth);

describe("PublicOnlyRoute", () => {
    it("renders loading state while authentication is initializing", () => {
        mockedUseAuth.mockReturnValue({
            isAuthenticated: false,
            isAdmin: false,
            isInitializing: true
        } as any);

        render(
            <MemoryRouter initialEntries={["/login"]}>
                <Routes>
                    <Route element={<PublicOnlyRoute />}>
                        <Route path="/login" element={<div>Login Page</div>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("renders public pages for guests", () => {
        mockedUseAuth.mockReturnValue({
            isAuthenticated: false,
            isAdmin: false,
            isInitializing: false
        } as any);

        render(
            <MemoryRouter initialEntries={["/login"]}>
                <Routes>
                    <Route element={<PublicOnlyRoute />}>
                        <Route path="/login" element={<div>Login Page</div>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText("Login Page")).toBeInTheDocument();
    });

    it("redirects authenticated users to cars", () => {
        mockedUseAuth.mockReturnValue({
            isAuthenticated: true,
            isAdmin: false,
            isInitializing: false
        } as any);

        render(
            <MemoryRouter initialEntries={["/login"]}>
                <Routes>
                    <Route path="/cars" element={<div>Cars Page</div>} />
                    <Route element={<PublicOnlyRoute />}>
                        <Route path="/login" element={<div>Login Page</div>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText("Cars Page")).toBeInTheDocument();
    });

    it("redirects authenticated admin users to dashboard", () => {
        mockedUseAuth.mockReturnValue({
            isAuthenticated: true,
            isAdmin: true,
            isInitializing: false
        } as any);

        render(
            <MemoryRouter initialEntries={["/login"]}>
                <Routes>
                    <Route path="/dashboard" element={<div>Dashboard Page</div>} />
                    <Route element={<PublicOnlyRoute />}>
                        <Route path="/login" element={<div>Login Page</div>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText("Dashboard Page")).toBeInTheDocument();
    });
});