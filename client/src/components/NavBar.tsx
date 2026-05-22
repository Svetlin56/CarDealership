import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import http from "../api/http";
import { useAuth } from "../contexts/AuthContext";
import type { UnreadInquiryRepliesResponse } from "../types/models";

const INQUIRY_MESSAGES_UPDATED_EVENT = "inquiry-messages-updated";

export default function NavBar() {
    const navigate = useNavigate();
    const { user, isAuthenticated, isAdmin, logout } = useAuth();
    const [unreadInquiryMessages, setUnreadInquiryMessages] = useState(0);

    useEffect(() => {
        if (!isAuthenticated) {
            setUnreadInquiryMessages(0);
            return;
        }

        let isMounted = true;

        async function loadUnreadInquiryMessages() {
            try {
                const endpoint = isAdmin
                    ? "/inquiries/unread-user-count"
                    : "/inquiries/my/unread-count";

                const response = await http.get<UnreadInquiryRepliesResponse>(endpoint);

                if (isMounted) {
                    setUnreadInquiryMessages(response.data.count);
                }
            } catch {
                if (isMounted) {
                    setUnreadInquiryMessages(0);
                }
            }
        }

        void loadUnreadInquiryMessages();

        window.addEventListener(INQUIRY_MESSAGES_UPDATED_EVENT, loadUnreadInquiryMessages);

        return () => {
            isMounted = false;
            window.removeEventListener(INQUIRY_MESSAGES_UPDATED_EVENT, loadUnreadInquiryMessages);
        };
    }, [isAuthenticated, isAdmin]);

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

                        {isAuthenticated && !isAdmin && (
                            <li className="nav-item">
                                <NavLink to="/my-inquiries" className="nav-link d-flex align-items-center gap-2">
                                    Inquiry

                                    {unreadInquiryMessages > 0 && (
                                        <span className="badge rounded-pill text-bg-danger">
                                            {unreadInquiryMessages}
                                        </span>
                                    )}
                                </NavLink>
                            </li>
                        )}

                        {isAuthenticated && isAdmin && (
                            <>
                                <li className="nav-item">
                                    <NavLink to="/dashboard" className="nav-link">
                                        Admin
                                    </NavLink>
                                </li>

                                <li className="nav-item">
                                    <NavLink to="/inquiries" className="nav-link d-flex align-items-center gap-2">
                                        Inquiry

                                        {unreadInquiryMessages > 0 && (
                                            <span className="badge rounded-pill text-bg-danger">
                                                {unreadInquiryMessages}
                                            </span>
                                        )}
                                    </NavLink>
                                </li>
                            </>
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