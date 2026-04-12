import { describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import ProtectedRoute from "../components/ProtectedRoute";

vi.mock("../contexts/AuthContext", () => ({
    useAuth: vi.fn()
}));

import { useAuth } from "../contexts/AuthContext";

const mockedUseAuth = vi.mocked(useAuth);

describe("ProtectedRoute", () => {
    it("redirects unauthenticated users to login", () => {
        mockedUseAuth.mockReturnValue({
            isAuthenticated: false,
            isInitializing: false
        } as any);

        render(
            <MemoryRouter initialEntries={["/cars"]}>
                <Routes>
                    <Route path="/login" element={<div>Login Page</div>} />
                    <Route element={<ProtectedRoute />}>
                        <Route path="/cars" element={<div>Cars Page</div>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText("Login Page")).toBeInTheDocument();
    });

    it("renders nested route for authenticated users", () => {
        mockedUseAuth.mockReturnValue({
            isAuthenticated: true,
            isInitializing: false
        } as any);

        render(
            <MemoryRouter initialEntries={["/cars"]}>
                <Routes>
                    <Route element={<ProtectedRoute />}>
                        <Route path="/cars" element={<div>Cars Page</div>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText("Cars Page")).toBeInTheDocument();
    });
});