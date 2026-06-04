import { useEffect, useState } from "react";
import http from "../api/http";
import type { InquiryMessage, UserInquiry } from "../types/models";

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

            {loading && (
                <div className="alert alert-info">
                    Loading your inquiries...
                </div>
            )}

            {!loading && inquiries.length === 0 && (
                <div className="alert alert-secondary">
                    You have not sent any inquiries yet.
                </div>
            )}

            <div className="row g-3">
                {!loading && inquiries.map(inquiry => {
                    const hasReply = Boolean(inquiry.adminReplyMessage) || inquiry.unreadAdminMessagesCount > 0;
                    const hasUnreadReply = inquiry.unreadAdminMessagesCount > 0;

                    return (
                        <div className="col-12" key={inquiry.id}>
                            <div className={`card shadow-sm ${hasUnreadReply ? "border-primary" : ""}`}>
                                <div className="card-body">
                                    <div className="d-flex justify-content-between gap-3 align-items-start">
                                        <div>
                                            <h5 className="card-title mb-1">
                                                {inquiry.carTitle}
                                            </h5>

                                            <div className="text-muted small">
                                                Listing #{inquiry.listingId} • Sent at {formatDate(inquiry.createdAt)}
                                            </div>
                                        </div>

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
                                    </div>

                                    <div className="mt-3">
                                        <span className="text-muted small d-block mb-1">
                                            Your message
                                        </span>
                                        <p className="mb-0 inquiry-user-message-preview">
                                            {inquiry.message || "No message"}
                                        </p>
                                    </div>

                                    <div className="mt-3">
                                        <button
                                            type="button"
                                            className="btn btn-outline-primary"
                                            onClick={() => openInquiry(inquiry)}
                                        >
                                            Open conversation
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
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