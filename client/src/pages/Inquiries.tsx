import { useEffect, useState } from "react";
import http from "../api/http";
import type { AdminInquiry } from "../types/models";

function formatDate(value: string) {
    return new Intl.DateTimeFormat("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
    }).format(new Date(value));
}

export default function Inquiries() {
    const [inquiries, setInquiries] = useState<AdminInquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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

        loadInquiries();

        return () => {
            isMounted = false;
        };
    }, []);

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
                        <th>Created at</th>
                    </tr>
                    </thead>

                    <tbody>
                    {loading && (
                        <tr>
                            <td colSpan={8} className="text-center py-4">
                                Loading inquiries...
                            </td>
                        </tr>
                    )}

                    {!loading && inquiries.length === 0 && (
                        <tr>
                            <td colSpan={8} className="text-center py-4 text-muted">
                                No inquiries yet.
                            </td>
                        </tr>
                    )}

                    {!loading && inquiries.map(inquiry => (
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
                                {inquiry.message || <span className="text-muted">No message</span>}
                            </td>
                            <td>{formatDate(inquiry.createdAt)}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}