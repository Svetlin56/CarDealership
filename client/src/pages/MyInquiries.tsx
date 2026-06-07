import { useEffect, useState } from "react";
import http from "../api/http";
import type { InquiryMessage, UserInquiry } from "../types/models";

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

export default function MyInquiries() {
    const [inquiries, setInquiries] = useState<UserInquiry[]>([]);
    const [messages, setMessages] = useState<InquiryMessage[]>([]);
    const [selectedInquiry, setSelectedInquiry] = useState<UserInquiry | null>(null);
    const [loading, setLoading] = useState(true);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [error, setError] = useState("");
    const [replyMessage, setReplyMessage] = useState("");
    const [replySaving, setReplySaving] = useState(false);
    const [replyError, setReplyError] = useState("");
    const [replySuccess, setReplySuccess] = useState("");
    const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
    const [editingMessageText, setEditingMessageText] = useState("");
    const [messageActionError, setMessageActionError] = useState("");
    const [messageActionLoadingId, setMessageActionLoadingId] = useState<number | null>(null);
    const [deletingInquiryId, setDeletingInquiryId] = useState<number | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function loadInquiries() {
            try {
                const response = await http.get<UserInquiry[]>("/inquiries/my");

                if (isMounted) {
                    setInquiries(response.data);
                    setError("");
                }
            } catch {
                if (isMounted) {
                    setError("Could not load your inquiries.");
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

    async function openInquiry(inquiry: UserInquiry) {
        setSelectedInquiry(inquiry);
        setMessages([]);
        setReplyMessage("");
        setReplyError("");
        setReplySuccess("");
        clearMessageEditing();
        setMessagesLoading(true);

        try {
            const response = await http.get<InquiryMessage[]>(`/inquiries/${inquiry.id}/messages`);

            await http.patch(`/inquiries/${inquiry.id}/messages/read`);

            setMessages(response.data.map(message =>
                message.senderType === "ADMIN"
                    ? { ...message, readByUser: true }
                    : message
            ));

            setInquiries(currentInquiries =>
                currentInquiries.map(current =>
                    current.id === inquiry.id
                        ? {
                            ...current,
                            unreadAdminMessagesCount: 0,
                            adminReplyReadByUser: true
                        }
                        : current
                )
            );

            setSelectedInquiry(current =>
                current
                    ? {
                        ...current,
                        unreadAdminMessagesCount: 0,
                        adminReplyReadByUser: true
                    }
                    : current
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
        clearMessageEditing();
    }

    function clearMessageEditing() {
        setEditingMessageId(null);
        setEditingMessageText("");
        setMessageActionError("");
        setMessageActionLoadingId(null);
    }

    function syncUserInquirySummary(inquiryId: number, updatedMessages: InquiryMessage[]) {
        const latestMessage = updatedMessages.length > 0
            ? updatedMessages[updatedMessages.length - 1]
            : undefined;
        const firstUserMessage = updatedMessages.find(message => message.senderType === "USER");
        const latestAdminMessage = [...updatedMessages]
            .reverse()
            .find(message => message.senderType === "ADMIN");

        const applySummary = (inquiry: UserInquiry): UserInquiry => ({
            ...inquiry,
            message: firstUserMessage?.message ?? null,
            adminReplyMessage: latestAdminMessage?.message ?? null,
            adminRepliedAt: latestAdminMessage?.createdAt ?? null,
            adminReplyReadByUser: latestAdminMessage?.readByUser ?? false,
            latestMessageAt: latestMessage?.createdAt ?? null
        });

        setInquiries(currentInquiries =>
            currentInquiries.map(inquiry =>
                inquiry.id === inquiryId ? applySummary(inquiry) : inquiry
            )
        );

        setSelectedInquiry(current =>
            current && current.id === inquiryId ? applySummary(current) : current
        );
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
            const updatedMessages = [...messages, newMessage];

            setMessages(updatedMessages);
            syncUserInquirySummary(selectedInquiry.id, updatedMessages);
            setReplyMessage("");
            setReplySuccess("Reply was sent to the admin.");
        } catch {
            setReplyError("Could not send reply.");
        } finally {
            setReplySaving(false);
        }
    }

    function startEditingMessage(message: InquiryMessage) {
        setEditingMessageId(message.id);
        setEditingMessageText(message.message);
        setMessageActionError("");
        setReplySuccess("");
    }

    async function handleSaveEditedMessage(messageId: number) {
        if (!selectedInquiry) {
            return;
        }

        const trimmedMessage = editingMessageText.trim();

        if (!trimmedMessage) {
            setMessageActionError("Message is required.");
            return;
        }

        if (trimmedMessage.length > 2000) {
            setMessageActionError("Message must be up to 2000 characters.");
            return;
        }

        setMessageActionLoadingId(messageId);
        setMessageActionError("");

        try {
            const response = await http.put<InquiryMessage>(
                `/inquiries/${selectedInquiry.id}/messages/${messageId}`,
                { message: trimmedMessage }
            );

            const updatedMessages = messages.map(message =>
                message.id === messageId ? response.data : message
            );

            setMessages(updatedMessages);
            syncUserInquirySummary(selectedInquiry.id, updatedMessages);
            setEditingMessageId(null);
            setEditingMessageText("");
            setReplySuccess("Message was updated.");
        } catch {
            setMessageActionError("Could not update message.");
        } finally {
            setMessageActionLoadingId(null);
        }
    }

    async function handleDeleteMessage(messageId: number) {
        if (!selectedInquiry) {
            return;
        }

        if (!window.confirm("Delete this message?")) {
            return;
        }

        setMessageActionLoadingId(messageId);
        setMessageActionError("");
        setReplySuccess("");

        try {
            await http.delete(`/inquiries/${selectedInquiry.id}/messages/${messageId}`);

            const updatedMessages = messages.filter(message => message.id !== messageId);

            setMessages(updatedMessages);
            syncUserInquirySummary(selectedInquiry.id, updatedMessages);

            if (editingMessageId === messageId) {
                setEditingMessageId(null);
                setEditingMessageText("");
            }

            setReplySuccess("Message was deleted.");
        } catch {
            setMessageActionError("Could not delete message.");
        } finally {
            setMessageActionLoadingId(null);
        }
    }

    async function handleDeleteInquiry(id: number) {
        if (!window.confirm("Delete this conversation?")) {
            return;
        }

        setDeletingInquiryId(id);
        setError("");

        try {
            await http.delete(`/inquiries/my/${id}`);

            setInquiries(currentInquiries =>
                currentInquiries.filter(inquiry => inquiry.id !== id)
            );

            if (selectedInquiry?.id === id) {
                closeModal();
            }

            window.dispatchEvent(new Event(INQUIRY_MESSAGES_UPDATED_EVENT));
        } catch {
            setError("Could not delete this conversation.");
        } finally {
            setDeletingInquiryId(null);
        }
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <h2 className="mb-1">My inquiries</h2>
                    <p className="text-muted mb-0">
                        Here you can read and reply to admin messages.
                    </p>
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
                        <th>Message</th>
                        <th>Status</th>
                        <th>Created at</th>
                        <th>Actions</th>
                    </tr>
                    </thead>

                    <tbody>
                    {loading && (
                        <tr>
                            <td colSpan={7} className="text-center py-4">
                                Loading your inquiries...
                            </td>
                        </tr>
                    )}

                    {!loading && inquiries.length === 0 && (
                        <tr>
                            <td colSpan={7} className="text-center py-4 text-muted">
                                You have not sent any inquiries yet.
                            </td>
                        </tr>
                    )}

                    {!loading && inquiries.map(inquiry => {
                        const message = normalizeMessage(inquiry.message);
                        const hasReply = Boolean(inquiry.adminReplyMessage) || inquiry.unreadAdminMessagesCount > 0;
                        const hasUnreadReply = inquiry.unreadAdminMessagesCount > 0;

                        return (
                            <tr key={inquiry.id}>
                                <td>{inquiry.id}</td>
                                <td>{inquiry.listingId}</td>
                                <td>{inquiry.carTitle}</td>

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
                                    {hasUnreadReply && (
                                        <span className="badge text-bg-primary">
                                            New admin reply
                                        </span>
                                    )}

                                    {!hasUnreadReply && hasReply && (
                                        <span className="badge text-bg-success">
                                            Has reply
                                        </span>
                                    )}

                                    {!hasReply && (
                                        <span className="badge text-bg-secondary">
                                            Waiting for reply
                                        </span>
                                    )}
                                </td>
                                <td>{formatDate(inquiry.createdAt)}</td>

                                {/*From Uiverse.io by vinodjangid07 */}
                                <td>
                                    <button
                                        type="button"
                                        className="delete-button-inq"
                                        aria-label={`Delete inquiry ${inquiry.id}`}
                                        title="Delete conversation"
                                        disabled={deletingInquiryId === inquiry.id}
                                        onClick={() => handleDeleteInquiry(inquiry.id)}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 69 14"
                                            className="svgIcon bin-top"
                                        >
                                            <g clipPath={`url(#clip0_35_24_my_inquiry_${inquiry.id})`}>
                                                <path
                                                    fill="black"
                                                    d="M20.8232 2.62734L19.9948 4.21304C19.8224 4.54309 19.4808 4.75 19.1085 4.75H4.92857C2.20246 4.75 0 6.87266 0 9.5C0 12.1273 2.20246 14.25 4.92857 14.25H64.0714C66.7975 14.25 69 12.1273 69 9.5C69 6.87266 66.7975 4.75 64.0714 4.75H49.8915C49.5192 4.75 49.1776 4.54309 49.0052 4.21305L48.1768 2.62734C47.3451 1.00938 45.6355 0 43.7719 0H25.2281C23.3645 0 21.6549 1.00938 20.8232 2.62734ZM64.0023 20.0648C64.0397 19.4882 63.5822 19 63.0044 19H5.99556C5.4178 19 4.96025 19.4882 4.99766 20.0648L8.19375 69.3203C8.44018 73.0758 11.6746 76 15.5712 76H53.4288C57.3254 76 60.5598 73.0758 60.8062 69.3203L64.0023 20.0648Z"
                                                />
                                            </g>

                                            <defs>
                                                <clipPath id={`clip0_35_24_my_inquiry_${inquiry.id}`}>
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
                                            <g clipPath={`url(#clip0_35_22_my_inquiry_${inquiry.id})`}>
                                                <path
                                                    fill="black"
                                                    d="M20.8232 -16.3727L19.9948 -14.787C19.8224 -14.4569 19.4808 -14.25 19.1085 -14.25H4.92857C2.20246 -14.25 0 -12.1273 0 -9.5C0 -6.8727 2.20246 -4.75 4.92857 -4.75H64.0714C66.7975 -4.75 69 -6.8727 69 -9.5C69 -12.1273 66.7975 -14.25 64.0714 -14.25H49.8915C49.5192 -14.25 49.1776 -14.4569 49.0052 -14.787L48.1768 -16.3727C47.3451 -17.9906 45.6355 -19 43.7719 -19H25.2281C23.3645 -19 21.6549 -17.9906 20.8232 -16.3727ZM64.0023 1.0648C64.0397 0.4882 63.5822 0 63.0044 0H5.99556C5.4178 0 4.96025 0.4882 4.99766 1.0648L8.19375 50.3203C8.44018 54.0758 11.6746 57 15.5712 57H53.4288C57.3254 57 60.5598 54.0758 60.8062 50.3203L64.0023 1.0648Z"
                                                />
                                            </g>

                                            <defs>
                                                <clipPath id={`clip0_35_22_my_inquiry_${inquiry.id}`}>
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
                                            Conversation
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
                                    <div className="inquiry-conversation-box">
                                        {messagesLoading && (
                                            <div className="text-muted">Loading messages...</div>
                                        )}

                                        {!messagesLoading && messages.length === 0 && (
                                            <div className="text-muted">No messages in this conversation.</div>
                                        )}

                                        {!messagesLoading && messages.map(message => {
                                            const canManageMessage = message.senderType === "USER";
                                            const isEditing = editingMessageId === message.id;
                                            const isMessageLoading = messageActionLoadingId === message.id;

                                            return (
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
                                                            {message.senderType === "ADMIN" ? "Admin" : "You"}
                                                            <span className="inquiry-chat-date">
                                                                {formatDate(message.createdAt)}
                                                            </span>
                                                        </div>

                                                        {isEditing ? (
                                                            <div>
                                                                <textarea
                                                                    className="form-control form-control-sm inquiry-message-edit-textarea"
                                                                    value={editingMessageText}
                                                                    maxLength={2000}
                                                                    disabled={isMessageLoading}
                                                                    onChange={event => {
                                                                        setEditingMessageText(event.target.value);
                                                                        setMessageActionError("");
                                                                    }}
                                                                />

                                                                <div className="inquiry-chat-actions">
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-primary"
                                                                        disabled={isMessageLoading}
                                                                        onClick={() => handleSaveEditedMessage(message.id)}
                                                                    >
                                                                        {isMessageLoading ? "Saving..." : "Save"}
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-outline-secondary"
                                                                        disabled={isMessageLoading}
                                                                        onClick={() => {
                                                                            setEditingMessageId(null);
                                                                            setEditingMessageText("");
                                                                            setMessageActionError("");
                                                                        }}
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div>{message.message}</div>

                                                                {canManageMessage && (
                                                                    <div className="inquiry-chat-actions">
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-sm btn-outline-primary"
                                                                            disabled={isMessageLoading}
                                                                            onClick={() => startEditingMessage(message)}
                                                                        >
                                                                            Edit
                                                                        </button>

                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-sm btn-outline-danger"
                                                                            disabled={isMessageLoading}
                                                                            onClick={() => handleDeleteMessage(message.id)}
                                                                        >
                                                                            {isMessageLoading ? "Deleting..." : "Delete"}
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {messageActionError && (
                                        <div className="alert alert-danger mt-3 mb-0">
                                            {messageActionError}
                                        </div>
                                    )}

                                    {replySuccess && (
                                        <div className="alert alert-success mt-3 mb-0">
                                            {replySuccess}
                                        </div>
                                    )}

                                    <div className="inquiry-reply-form mt-4">
                                        <label htmlFor="user-reply-message" className="form-label">
                                            Reply to admin
                                        </label>

                                        <textarea
                                            id="user-reply-message"
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
                                        className="btn btn-outline-danger me-auto"
                                        disabled={deletingInquiryId === selectedInquiry.id}
                                        onClick={() => handleDeleteInquiry(selectedInquiry.id)}
                                    >
                                        {deletingInquiryId === selectedInquiry.id ? "Deleting..." : "Delete conversation"}
                                    </button>

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