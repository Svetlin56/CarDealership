import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function NavBar() {
    const navigate = useNavigate();
    const { user, isAuthenticated, isAdmin, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container">
                <Link to="/" className="navbar-brand">
                    Car Dealership
                </Link>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#nav"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div id="nav" className="collapse navbar-collapse">
                    <ul className="navbar-nav me-auto">
                        {isAuthenticated && (
                            <li className="nav-item">
                                <NavLink to="/cars" className="nav-link">
                                    Cars
                                </NavLink>
                            </li>
                        )}

                        {isAuthenticated && (
                            <li className="nav-item">
                                <NavLink to="/recommendations" className="nav-link">
                                    Recommendations
                                </NavLink>
                            </li>
                        )}

                        {isAuthenticated && isAdmin && (
                            <li className="nav-item">
                                <NavLink to="/dashboard" className="nav-link">
                                    Admin
                                </NavLink>
                            </li>
                        )}
                    </ul>

                    <ul className="navbar-nav align-items-center">
                        {isAuthenticated && user?.picture && (
                            <li className="nav-item me-3 d-flex align-items-center">
                                <img
                                    src={user.picture}
                                    alt="avatar"
                                    className="nav-avatar"
                                />
                            </li>
                        )}

                        {isAuthenticated ? (
                            <li className="nav-item">
                                <button
                                    className="btn btn-outline-light"
                                    onClick={handleLogout}
                                >
                                    Sign out
                                </button>
                            </li>
                        ) : (
                            <>
                                <li className="nav-item">
                                    <NavLink to="/login" className="nav-link">
                                        Login
                                    </NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink to="/register" className="nav-link">
                                        Registration
                                    </NavLink>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
}