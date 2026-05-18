import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import http, { API_BASE_URL } from "../api/http";
import { InquiryRequest, InquiryResponse, Listing } from "../types/models";
import { formatCurrency, formatNumber } from "../utils/currency";

const INITIAL_INQUIRY: InquiryRequest = {
    name: "",
    email: "",
    phone: "",
    message: ""
};

type ApiErrorResponse = {
    message?: string;
    fieldErrors?: Record<string, string>;
};

function resolveImageUrl(imageUrl?: string): string | null {
    if (!imageUrl) {
        return null;
    }

    return imageUrl.startsWith("http") ? imageUrl : `${API_BASE_URL}${imageUrl}`;
}

function getStatusBadgeClass(status: string): string {
    switch (status) {
        case "ACTIVE":
            return "text-bg-success";
        case "SOLD":
            return "text-bg-danger";
        case "HIDDEN":
            return "text-bg-secondary";
        default:
            return "text-bg-light";
    }
}

export default function CarDetails() {
    const { id } = useParams();
    const [listing, setListing] = useState<Listing | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [inquiry, setInquiry] = useState<InquiryRequest>(INITIAL_INQUIRY);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [submitError, setSubmitError] = useState("");
    const [submitSuccess, setSubmitSuccess] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const loadListing = async () => {
            if (!id) {
                setError("Invalid car id.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");

                const response = await http.get<Listing>(`/listings/by-car/${id}`);
                setListing(response.data);
            } catch (err: any) {
                const apiError = err?.response?.data as ApiErrorResponse | undefined;

                if (err?.response?.status === 404) {
                    setError(apiError?.message || "Active listing not found for this car.");
                } else if (err?.response?.status === 401) {
                    setError(apiError?.message || "You need to sign in again.");
                } else if (err?.response?.status === 403) {
                    setError(apiError?.message || "You do not have access to this listing.");
                } else {
                    setError(apiError?.message || "Failed to load listing details.");
                }
            } finally {
                setLoading(false);
            }
        };

        void loadListing();
    }, [id]);

    const updateInquiry = (field: keyof InquiryRequest, value: string) => {
        setInquiry(prev => ({ ...prev, [field]: value }));
        setFieldErrors(prev => ({ ...prev, [field]: "" }));
        setSubmitError("");
        setSubmitSuccess("");
    };

    const submitInquiry = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!listing) {
            return;
        }

        setSubmitting(true);
        setFieldErrors({});
        setSubmitError("");
        setSubmitSuccess("");

        try {
            await http.post<InquiryResponse>(`/inquiries/${listing.id}`, inquiry);
            setInquiry(INITIAL_INQUIRY);
            setSubmitSuccess("Your inquiry was sent successfully.");
        } catch (err: any) {
            const apiError = err?.response?.data as ApiErrorResponse | undefined;
            setFieldErrors(apiError?.fieldErrors ?? {});
            setSubmitError(apiError?.message || "Failed to send inquiry.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="container mt-4">
                <div className="alert alert-info" role="status">Loading listing details...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-4">
                <div className="alert alert-danger">{error}</div>
                <Link to="/cars" className="btn btn-outline-primary">
                    Back to cars
                </Link>
            </div>
        );
    }

    if (!listing) {
        return (
            <div className="container mt-4">
                <div className="alert alert-warning">No listing data available.</div>
                <Link to="/cars" className="btn btn-outline-primary">
                    Back to cars
                </Link>
            </div>
        );
    }

    const car = listing.car;
    const imageSrc = resolveImageUrl(car.imageUrl);
    const carTitle = `${car.make} ${car.model}`;

    return (
        <div className="container mt-4 car-details-page">
            <div className="row g-4">
                <div className="col-lg-7">
                    <div className="car-details-image-wrapper bg-light rounded border">
                        {imageSrc ? (
                            <img
                                className="img-fluid rounded car-details-image"
                                src={imageSrc}
                                alt={carTitle}
                            />
                        ) : (
                            <div className="car-details-placeholder text-muted">
                                No image available
                            </div>
                        )}
                    </div>

                    {listing.description && (
                        <div className="card border-0 shadow-sm mt-3">
                            <div className="card-body">
                                <h5 className="card-title">Listing description</h5>
                                <p className="card-text mb-0">{listing.description}</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="col-lg-5">
                    <div className="card border-0 shadow-sm mb-3">
                        <div className="card-body">
                            <div className="d-flex justify-content-between gap-3 align-items-start mb-3">
                                <div>
                                    <h2 className="mb-1">{carTitle}</h2>
                                    <p className="text-muted mb-0">
                                        {car.year} · {car.fuelType || "N/A"} · {car.transmission || "N/A"}
                                    </p>
                                </div>

                                <span className={`badge ${getStatusBadgeClass(listing.status)}`}>
                                    {listing.status}
                                </span>
                            </div>

                            <h3 className="text-success mb-4">{formatCurrency(car.price)}</h3>

                            <div className="car-details-spec-grid">
                                <div>
                                    <span className="text-muted small d-block">Mileage</span>
                                    <strong>{formatNumber(car.mileage)} km</strong>
                                </div>
                                <div>
                                    <span className="text-muted small d-block">Engine</span>
                                    <strong>{car.engineSize ?? "N/A"} L</strong>
                                </div>
                                <div>
                                    <span className="text-muted small d-block">Doors</span>
                                    <strong>{car.doors ?? "N/A"}</strong>
                                </div>
                                <div>
                                    <span className="text-muted small d-block">Owner count</span>
                                    <strong>{car.ownerCount ?? "N/A"}</strong>
                                </div>
                                <div>
                                    <span className="text-muted small d-block">VIN</span>
                                    <strong>{car.vin || "N/A"}</strong>
                                </div>
                                <div>
                                    <span className="text-muted small d-block">Listing created</span>
                                    <strong>{new Date(listing.createdAt).toLocaleDateString()}</strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card border-0 shadow-sm" id="inquiry">
                        <div className="card-body">
                            <h5 className="card-title">Send inquiry</h5>
                            <p className="text-muted small">
                                Ask the dealership about availability, inspection history or test-drive options.
                            </p>

                            {submitSuccess && (
                                <div className="alert alert-success py-2">{submitSuccess}</div>
                            )}

                            {submitError && (
                                <div className="alert alert-danger py-2">{submitError}</div>
                            )}

                            <form onSubmit={submitInquiry} noValidate>
                                <div className="mb-3">
                                    <label className="form-label" htmlFor="inquiry-name">Name</label>
                                    <input
                                        id="inquiry-name"
                                        className={`form-control ${fieldErrors.name ? "is-invalid" : ""}`}
                                        value={inquiry.name}
                                        onChange={e => updateInquiry("name", e.target.value)}
                                    />
                                    {fieldErrors.name && (
                                        <div className="invalid-feedback">{fieldErrors.name}</div>
                                    )}
                                </div>

                                <div className="mb-3">
                                    <label className="form-label" htmlFor="inquiry-email">Email</label>
                                    <input
                                        id="inquiry-email"
                                        type="email"
                                        className={`form-control ${fieldErrors.email ? "is-invalid" : ""}`}
                                        value={inquiry.email}
                                        onChange={e => updateInquiry("email", e.target.value)}
                                    />
                                    {fieldErrors.email && (
                                        <div className="invalid-feedback">{fieldErrors.email}</div>
                                    )}
                                </div>

                                <div className="mb-3">
                                    <label className="form-label" htmlFor="inquiry-phone">Phone</label>
                                    <input
                                        id="inquiry-phone"
                                        className={`form-control ${fieldErrors.phone ? "is-invalid" : ""}`}
                                        value={inquiry.phone}
                                        onChange={e => updateInquiry("phone", e.target.value)}
                                    />
                                    {fieldErrors.phone && (
                                        <div className="invalid-feedback">{fieldErrors.phone}</div>
                                    )}
                                </div>

                                <div className="mb-3">
                                    <label className="form-label" htmlFor="inquiry-message">Message</label>
                                    <textarea
                                        id="inquiry-message"
                                        rows={4}
                                        className={`form-control ${fieldErrors.message ? "is-invalid" : ""}`}
                                        value={inquiry.message}
                                        onChange={e => updateInquiry("message", e.target.value)}
                                    />
                                    {fieldErrors.message && (
                                        <div className="invalid-feedback">{fieldErrors.message}</div>
                                    )}
                                </div>

                                <button className="btn btn-primary w-100" type="submit" disabled={submitting || listing.status !== "ACTIVE"}>
                                    {submitting ? "Sending..." : "Send inquiry"}
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="mt-3">
                        <Link to="/cars" className="btn btn-outline-primary">
                            Back to cars
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}