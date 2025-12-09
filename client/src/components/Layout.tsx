import { PropsWithChildren } from "react";
import NavBar from "./NavBar";

export default function Layout({ children }: PropsWithChildren) {
    return (
        <div className="d-flex flex-column min-vh-100">
            <NavBar />
            <main className="container my-4">{children}</main>
            <footer className="mt-auto py-3 bg-light">
                <div className="container text-center">
                    <small>© {new Date().getFullYear()} Car Dealership</small>
                </div>
            </footer>
        </div>
    );
}
