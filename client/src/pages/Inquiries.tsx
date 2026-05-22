import { useEffect, useState } from "react";
import http from "../api/http";
import type { AdminInquiry, InquiryMessage } from "../types/models";

const MESSAGE_PREVIEW_LENGTH = 180;
const INQUIRY_MESSAGES_UPDATED_EVENT = "inquiry-messages-updated";

function formatDate(value: string) {
    return new Intl.DateTimeFormat("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
    }).format(new Date(value));
}

function normalizeMessage(message?: string | null) {
    return message?.trim() ?? "";
}

function getMessagePreview(message?: string | null) {
    const trimmedMessage = normalizeMessage(message);

    if (trimmedMessage.length <= MESSAGE_PREVIEW_LENGTH) {
        return trimmedMessage;
    }

    return `${trimmedMessage.slice(0, MESSAGE_PREVIEW_LENGTH).trimEnd()}...`;
}

function isLongMessage(message?: string | null) {
    return normalizeMessage(message).length > MESSAGE_PREVIEW_LENGTH;
}

export default function Inquiries() {
    const [inquiries, setInquiries] = useState<AdminInquiry[]>([]);
    const [messages, setMessages] = useState<InquiryMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [error, setError] = useState("");
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [selectedInquiry, setSelectedInquiry] = useState<AdminInquiry | null>(null);
    const [replyMessage, setReplyMessage] = useState("");
    const [replySaving, setReplySaving] = useState(false);
    const [replyError, setReplyError] = useState("");
    const [replySuccess, setReplySuccess] = useState("");

    useEffect(() => {
        let isMounted = true;

        async function loadInquiries() {
            try {
                const response = await http.get<AdminInquiry[]>("/inquiries");

                if (isMounted) {
                    setInquiries(response.data);
                    setError("");
                }
            } catch {
                if (isMounted) {
                    setError("Could not load inquiries.");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        void loadInquiries();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        if (!selectedInquiry) {
            return;
        }

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        function handleEscape(event: KeyboardEvent) {
            if (event.key === "Escape") {
                closeModal();
            }
        }

        window.addEventListener("keydown", handleEscape);

        return () => {
            document.body.style.overflow = originalOverflow;
            window.removeEventListener("keydown", handleEscape);
        };
    }, [selectedInquiry]);

    async function openInquiry(inquiry: AdminInquiry) {
        setSelectedInquiry(inquiry);
        setMessages([]);
        setReplyMessage("");
        setReplyError("");
        setReplySuccess("");
        setMessagesLoading(true);

        try {
            const response = await http.get<InquiryMessage[]>(`/inquiries/${inquiry.id}/messages`);
            setMessages(response.data);

            await http.patch(`/inquiries/${inquiry.id}/messages/read`);

            setInquiries(currentInquiries =>
                currentInquiries.map(current =>
                    current.id === inquiry.id
                        ? { ...current, unreadUserMessagesCount: 0 }
                        : current
                )
            );

            window.dispatchEvent(new Event(INQUIRY_MESSAGES_UPDATED_EVENT));
        } catch {
            setError("Could not load inquiry messages.");
        } finally {
            setMessagesLoading(false);
        }
    }

    function closeModal() {
        setSelectedInquiry(null);
        setMessages([]);
        setReplyMessage("");
        setReplyError("");
        setReplySuccess("");
    }

    async function handleSendReply() {
        if (!selectedInquiry) {
            return;
        }

        const trimmedReply = replyMessage.trim();

        if (!trimmedReply) {
            setReplyError("Reply message is required.");
            return;
        }

        if (trimmedReply.length > 2000) {
            setReplyError("Reply message must be up to 2000 characters.");
            return;
        }

        setReplySaving(true);
        setReplyError("");
        setReplySuccess("");

        try {
            const response = await http.post<InquiryMessage>(
                `/inquiries/${selectedInquiry.id}/messages`,
                { message: trimmedReply }
            );

            const newMessage = response.data;
            setMessages(currentMessages => [...currentMessages, newMessage]);
            setReplyMessage("");
            setReplySuccess("Reply was sent to the user.");

            setInquiries(currentInquiries =>
                currentInquiries.map(inquiry =>
                    inquiry.id === selectedInquiry.id
                        ? {
                            ...inquiry,
                            adminReplyMessage: newMessage.message,
                            adminRepliedAt: newMessage.createdAt,
                            adminReplyReadByUser: false,
                            latestMessageAt: newMessage.createdAt
                        }
                        : inquiry
                )
            );

            setSelectedInquiry(current =>
                current
                    ? {
                        ...current,
                        adminReplyMessage: newMessage.message,
                        adminRepliedAt: newMessage.createdAt,
                        adminReplyReadByUser: false,
                        latestMessageAt: newMessage.createdAt
                    }
                    : current
            );
        } catch {
            setReplyError("Could not send reply.");
        } finally {
            setReplySaving(false);
        }
    }

    async function handleDeleteInquiry(id: number) {
        setDeletingId(id);
        setError("");

        try {
            await http.delete(`/inquiries/${id}`);

            setInquiries(currentInquiries =>
                currentInquiries.filter(inquiry => inquiry.id !== id)
            );

            if (selectedInquiry?.id === id) {
                closeModal();
            }
        } catch {
            setError("Could not delete inquiry.");
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <h2 className="mb-1">Inquiries</h2>
                    <p className="text-muted mb-0">Messages sent from listing detail pages.</p>
                </div>

                <span className="badge text-bg-primary fs-6">
                    Total: {inquiries.length}
                </span>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="table-responsive inquiry-table-wrapper">
                <table className="table table-striped table-hover align-middle mb-0">
                    <thead className="table-dark">
                    <tr>
                        <th>ID</th>
                        <th>Listing ID</th>
                        <th>Car</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Message</th>
                        <th>Status</th>
                        <th>Created at</th>
                        <th>Actions</th>
                    </tr>
                    </thead>

                    <tbody>
                    {loading && (
                        <tr>
                            <td colSpan={10} className="text-center py-4">
                                Loading inquiries...
                            </td>
                        </tr>
                    )}

                    {!loading && inquiries.length === 0 && (
                        <tr>
                            <td colSpan={10} className="text-center py-4 text-muted">
                                No inquiries yet.
                            </td>
                        </tr>
                    )}

                    {!loading && inquiries.map(inquiry => {
                        const message = normalizeMessage(inquiry.message);

                        return (
                            <tr key={inquiry.id}>
                                <td>{inquiry.id}</td>
                                <td>{inquiry.listingId}</td>
                                <td>{inquiry.carTitle}</td>
                                <td>{inquiry.name}</td>
                                <td>
                                    <a href={`mailto:${inquiry.email}`}>{inquiry.email}</a>
                                </td>
                                <td>{inquiry.phone}</td>
                                <td className="inquiry-message-cell">
                                    {message ? (
                                        <button
                                            type="button"
                                            className="inquiry-message-preview"
                                            title="Open conversation"
                                            onClick={() => openInquiry(inquiry)}
                                        >
                                            <span className="inquiry-message-preview-text">
                                                {getMessagePreview(inquiry.message)}
                                            </span>

                                            {isLongMessage(inquiry.message) && (
                                                <span className="inquiry-read-more">
                                                    View conversation
                                                </span>
                                            )}
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={() => openInquiry(inquiry)}
                                        >
                                            Open conversation
                                        </button>
                                    )}
                                </td>
                                <td>
                                    {inquiry.unreadUserMessagesCount > 0 ? (
                                        <span className="badge text-bg-danger">
                                            New user message
                                        </span>
                                    ) : inquiry.adminReplyMessage ? (
                                        <span className="badge text-bg-success">
                                            Replied
                                        </span>
                                    ) : (
                                        <span className="badge text-bg-secondary">
                                            No reply
                                        </span>
                                    )}
                                </td>
                                <td>{formatDate(inquiry.createdAt)}</td>
                                <td>
                                    {/* From Uiverse.io by vinodjangid07 */}
                                    <button
                                        type="button"
                                        className="delete-button-inq"
                                        aria-label={`Delete inquiry ${inquiry.id}`}
                                        title="Delete inquiry"
                                        disabled={deletingId === inquiry.id}
                                        onClick={() => handleDeleteInquiry(inquiry.id)}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 69 14"
                                            className="svgIcon bin-top"
                                        >
                                            <g clipPath={`url(#clip0_35_24_inquiry_${inquiry.id})`}>
                                                <path
                                                    fill="black"
                                                    d="M20.8232 2.62734L19.9948 4.21304C19.8224 4.54309 19.4808 4.75 19.1085 4.75H4.92857C2.20246 4.75 0 6.87266 0 9.5C0 12.1273 2.20246 14.25 4.92857 14.25H64.0714C66.7975 14.25 69 12.1273 69 9.5C69 6.87266 66.7975 4.75 64.0714 4.75H49.8915C49.5192 4.75 49.1776 4.54309 49.0052 4.21305L48.1768 2.62734C47.3451 1.00938 45.6355 0 43.7719 0H25.2281C23.3645 0 21.6549 1.00938 20.8232 2.62734ZM64.0023 20.0648C64.0397 19.4882 63.5822 19 63.0044 19H5.99556C5.4178 19 4.96025 19.4882 4.99766 20.0648L8.19375 69.3203C8.44018 73.0758 11.6746 76 15.5712 76H53.4288C57.3254 76 60.5598 73.0758 60.8062 69.3203L64.0023 20.0648Z"
                                                />
                                            </g>

                                            <defs>
                                                <clipPath id={`clip0_35_24_inquiry_${inquiry.id}`}>
                                                    <rect fill="white" height="14" width="69" />
                                                </clipPath>
                                            </defs>
                                        </svg>

                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 69 57"
                                            className="svgIcon bin-bottom"
                                        >
                                            <g clipPath={`url(#clip0_35_22_inquiry_${inquiry.id})`}>
                                                <path
                                                    fill="black"
                                                    d="M20.8232 -16.3727L19.9948 -14.787C19.8224 -14.4569 19.4808 -14.25 19.1085 -14.25H4.92857C2.20246 -14.25 0 -12.1273 0 -9.5C0 -6.8727 2.20246 -4.75 4.92857 -4.75H64.0714C66.7975 -4.75 69 -6.8727 69 -9.5C69 -12.1273 66.7975 -14.25 64.0714 -14.25H49.8915C49.5192 -14.25 49.1776 -14.4569 49.0052 -14.787L48.1768 -16.3727C47.3451 -17.9906 45.6355 -19 43.7719 -19H25.2281C23.3645 -19 21.6549 -17.9906 20.8232 -16.3727ZM64.0023 1.0648C64.0397 0.4882 63.5822 0 63.0044 0H5.99556C5.4178 0 4.96025 0.4882 4.99766 1.0648L8.19375 50.3203C8.44018 54.0758 11.6746 57 15.5712 57H53.4288C57.3254 57 60.5598 54.0758 60.8062 50.3203L64.0023 1.0648Z"
                                                />
                                            </g>

                                            <defs>
                                                <clipPath id={`clip0_35_22_inquiry_${inquiry.id}`}>
                                                    <rect fill="white" height="57" width="69" />
                                                </clipPath>
                                            </defs>
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>

            {selectedInquiry && (
                <>
                    <div
                        className="modal fade show d-block"
                        tabIndex={-1}
                        role="dialog"
                        aria-modal="true"
                    >
                        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <div>
                                        <h5 className="modal-title mb-1">
                                            Inquiry #{selectedInquiry.id}
                                        </h5>
                                        <div className="text-muted small">
                                            {selectedInquiry.carTitle} • Listing #{selectedInquiry.listingId}
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        className="btn-close"
                                        aria-label="Close"
                                        onClick={closeModal}
                                    />
                                </div>

                                <div className="modal-body">
                                    <div className="inquiry-modal-meta mb-3">
                                        <div>
                                            <span className="text-muted small d-block">Name</span>
                                            <strong>{selectedInquiry.name}</strong>
                                        </div>

                                        <div>
                                            <span className="text-muted small d-block">Created at</span>
                                            <strong>{formatDate(selectedInquiry.createdAt)}</strong>
                                        </div>

                                        <div>
                                            <span className="text-muted small d-block">Email</span>
                                            <a href={`mailto:${selectedInquiry.email}`}>
                                                {selectedInquiry.email}
                                            </a>
                                        </div>

                                        <div>
                                            <span className="text-muted small d-block">Phone</span>
                                            <strong>{selectedInquiry.phone}</strong>
                                        </div>
                                    </div>

                                    <span className="text-muted small d-block mb-2">
                                        Conversation
                                    </span>

                                    <div className="inquiry-conversation-box">
                                        {messagesLoading && (
                                            <div className="text-muted">Loading messages...</div>
                                        )}

                                        {!messagesLoading && messages.length === 0 && (
                                            <div className="inquiry-chat-message inquiry-chat-message-user">
                                                <div className="inquiry-chat-bubble">
                                                    <div className="inquiry-chat-sender">User</div>
                                                    <div>{selectedInquiry.message || "No message"}</div>
                                                </div>
                                            </div>
                                        )}

                                        {!messagesLoading && messages.map(message => (
                                            <div
                                                key={message.id}
                                                className={`inquiry-chat-message ${
                                                    message.senderType === "ADMIN"
                                                        ? "inquiry-chat-message-admin"
                                                        : "inquiry-chat-message-user"
                                                }`}
                                            >
                                                <div className="inquiry-chat-bubble">
                                                    <div className="inquiry-chat-sender">
                                                        {message.senderType === "ADMIN" ? "Admin" : "User"}
                                                        <span className="inquiry-chat-date">
                                                            {formatDate(message.createdAt)}
                                                        </span>
                                                    </div>
                                                    <div>{message.message}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {replySuccess && (
                                        <div className="alert alert-success mt-3 mb-0">
                                            {replySuccess}
                                        </div>
                                    )}

                                    <div className="inquiry-reply-form mt-4">
                                        <label htmlFor="admin-reply-message" className="form-label">
                                            Reply to user
                                        </label>

                                        <textarea
                                            id="admin-reply-message"
                                            className={`form-control ${replyError ? "is-invalid" : ""}`}
                                            rows={5}
                                            value={replyMessage}
                                            maxLength={2000}
                                            placeholder="Write your reply here..."
                                            onChange={event => {
                                                setReplyMessage(event.target.value);
                                                setReplyError("");
                                                setReplySuccess("");
                                            }}
                                        />

                                        <div className="d-flex justify-content-between align-items-center mt-2">
                                            <div>
                                                {replyError && (
                                                    <div className="text-danger small">
                                                        {replyError}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="text-muted small">
                                                {replyMessage.length}/2000
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={closeModal}
                                    >
                                        Close
                                    </button>

                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        disabled={replySaving}
                                        onClick={handleSendReply}
                                    >
                                        {replySaving ? "Sending..." : "Send reply"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        className="modal-backdrop fade show"
                        onClick={closeModal}
                    />
                </>
            )}
        </div>
    );
}