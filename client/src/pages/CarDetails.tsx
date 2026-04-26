import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import http from "../api/http";
import { InquiryRequest, InquiryResponse, Listing } from "../types/models";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

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

        loadListing();
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
        return <p>Loading...</p>;
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
    const imageSrc = car.imageUrl
        ? car.imageUrl.startsWith("http")
            ? car.imageUrl
            : `${API_BASE_URL}${car.imageUrl}`
        : null;

    return (
        <div className="container mt-4">
            <div className="row g-4">
                <div className="col-md-7">
                    {imageSrc ? (
                        <img
                            className="img-fluid rounded mb-3"
                            src={imageSrc}
                            alt={`${car.make} ${car.model}`}
                        />
                    ) : (
                        <div className="border rounded p-5 text-center text-muted">
                            No image available
                        </div>
                    )}

                    {listing.description && (
                        <div className="card mt-3">
                            <div className="card-body">
                                <h5 className="card-title">Listing description</h5>
                                <p className="card-text mb-0">{listing.description}</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="col-md-5">
                    <h2>
                        {car.make} {car.model}
                    </h2>

                    <p>Status: <strong>{listing.status}</strong></p>
                    <p>Year: {car.year}</p>
                    <p>Mileage: {car.mileage?.toLocaleString() ?? "N/A"} km</p>
                    <p>Fuel type: {car.fuelType || "N/A"}</p>
                    <p>Transmission: {car.transmission || "N/A"}</p>
                    <p>Engine size: {car.engineSize ?? "N/A"} L</p>
                    <p>Doors: {car.doors ?? "N/A"}</p>
                    <p>Owner count: {car.ownerCount ?? "N/A"}</p>

                    <h4 className="text-success">{car.price.toLocaleString()} €</h4>

                    <div className="card mt-4">
                        <div className="card-body">
                            <h5 className="card-title">Send inquiry</h5>

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

                                <button className="btn btn-primary w-100" type="submit" disabled={submitting}>
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