import { describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import AdminRoute from "../components/AdminRoute";

vi.mock("../contexts/AuthContext", () => ({
    useAuth: vi.fn()
}));

import { useAuth } from "../contexts/AuthContext";

const mockedUseAuth = vi.mocked(useAuth);

describe("AdminRoute", () => {
    it("redirects authenticated non-admin users to cars", () => {
        mockedUseAuth.mockReturnValue({
            isAuthenticated: true,
            isAdmin: false,
            isInitializing: false
        } as any);

        render(
            <MemoryRouter initialEntries={["/dashboard"]}>
                <Routes>
                    <Route path="/cars" element={<div>Cars Page</div>} />
                    <Route element={<AdminRoute />}>
                        <Route path="/dashboard" element={<div>Dashboard Page</div>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText("Cars Page")).toBeInTheDocument();
    });

    it("renders dashboard for admin users", () => {
        mockedUseAuth.mockReturnValue({
            isAuthenticated: true,
            isAdmin: true,
            isInitializing: false
        } as any);

        render(
            <MemoryRouter initialEntries={["/dashboard"]}>
                <Routes>
                    <Route element={<AdminRoute />}>
                        <Route path="/dashboard" element={<div>Dashboard Page</div>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText("Dashboard Page")).toBeInTheDocument();
    });
});