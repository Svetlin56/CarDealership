import { FormEvent, useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import http, { API_BASE_URL } from "../api/http";
import { useAuth } from "../contexts/AuthContext";
import { InquiryRequest, InquiryResponse, Listing } from "../types/models";
import { formatCurrency, formatNumber } from "../utils/currency";

const MIN_PHONE_DIGITS = 7;
const MAX_PHONE_DIGITS = 15;

const PHONE_CODE_OPTIONS = [
    { value: "+1", label: "+1 US/CA" },
    { value: "+30", label: "+30 GR" },
    { value: "+31", label: "+31 NL" },
    { value: "+32", label: "+32 BE" },
    { value: "+33", label: "+33 FR" },
    { value: "+34", label: "+34 ES" },
    { value: "+36", label: "+36 HU" },
    { value: "+39", label: "+39 IT" },
    { value: "+40", label: "+40 RO" },
    { value: "+41", label: "+41 CH" },
    { value: "+43", label: "+43 AT" },
    { value: "+44", label: "+44 UK" },
    { value: "+45", label: "+45 DK" },
    { value: "+46", label: "+46 SE" },
    { value: "+47", label: "+47 NO" },
    { value: "+48", label: "+48 PL" },
    { value: "+49", label: "+49 DE" },
    { value: "+51", label: "+51 PE" },
    { value: "+52", label: "+52 MX" },
    { value: "+54", label: "+54 AR" },
    { value: "+55", label: "+55 BR" },
    { value: "+56", label: "+56 CL" },
    { value: "+57", label: "+57 CO" },
    { value: "+90", label: "+90 TR" },
    { value: "+351", label: "+351 PT" },
    { value: "+352", label: "+352 LU" },
    { value: "+353", label: "+353 IE" },
    { value: "+354", label: "+354 IS" },
    { value: "+355", label: "+355 AL" },
    { value: "+358", label: "+358 FI" },
    { value: "+359", label: "+359 BG" },
    { value: "+370", label: "+370 LT" },
    { value: "+371", label: "+371 LV" },
    { value: "+372", label: "+372 EE" },
    { value: "+381", label: "+381 RS" },
    { value: "+382", label: "+382 ME" },
    { value: "+383", label: "+383 XK" },
    { value: "+385", label: "+385 HR" },
    { value: "+386", label: "+386 SI" },
    { value: "+387", label: "+387 BA" },
    { value: "+389", label: "+389 MK" },
    { value: "+420", label: "+420 CZ" },
    { value: "+421", label: "+421 SK" }
];

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

function countDigits(value: string): number {
    return (value.match(/\d/g) ?? []).length;
}

function formatVinForRole(vin?: string | null, isAdmin?: boolean): string {
    if (!vin) {
        return "N/A";
    }

    if (isAdmin) {
        return vin;
    }

    if (vin.includes("*")) {
        return vin;
    }

    const visibleChars = vin.slice(-4);
    const hiddenChars = "*".repeat(Math.max(vin.length - 4, 0));

    return `${hiddenChars}${visibleChars}`;
}

function validateInquiry(inquiry: InquiryRequest): Record<string, string> {
    const errors: Record<string, string> = {};

    const name = inquiry.name.trim();
    const email = inquiry.email.trim();
    const phone = inquiry.phone.trim();
    const message = inquiry.message.trim();

    if (!name) {
        errors.name = "Name is required";
    } else if (name.length < 2 || name.length > 80) {
        errors.name = "Name must be between 2 and 80 characters";
    } else if (!/^[\p{L}]+(?:[ '-][\p{L}]+)*$/u.test(name)) {
        errors.name = "Name must contain only letters, spaces, - or '";
    }

    if (!email) {
        errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = "Email must be valid";
    }

    const phoneDigits = countDigits(phone);

    if (!phone) {
        errors.phone = "Phone is required";
    } else if (!/^\+?[0-9][0-9\- ]*$/.test(phone)) {
        errors.phone = "Phone must contain only digits, spaces, + or -";
    } else if (phoneDigits < MIN_PHONE_DIGITS || phoneDigits > MAX_PHONE_DIGITS) {
        errors.phone = `Phone must contain between ${MIN_PHONE_DIGITS} and ${MAX_PHONE_DIGITS} digits including the country code`;
    }

    if (message.length > 2000) {
        errors.message = "Message must be up to 2000 characters";
    }

    return errors;
}

export default function CarDetails() {
    const { id } = useParams();
    const location = useLocation();
    const { isAdmin } = useAuth();

    const [listing, setListing] = useState<Listing | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [inquiry, setInquiry] = useState<InquiryRequest>(INITIAL_INQUIRY);
    const [phoneCode, setPhoneCode] = useState("+359");
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

    useEffect(() => {
        if (!listing || location.hash !== "#inquiry") {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            const inquiryElement = document.getElementById("inquiry");

            if (inquiryElement) {
                inquiryElement.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        }, 150);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [listing, location.hash]);

    const updateInquiry = (field: keyof InquiryRequest, value: string) => {
        setInquiry(prev => ({ ...prev, [field]: value }));
        setFieldErrors(prev => ({ ...prev, [field]: "" }));
        setSubmitError("");
        setSubmitSuccess("");
    };

    const updatePhoneCode = (value: string) => {
        setPhoneCode(value);
        setFieldErrors(prev => ({ ...prev, phone: "" }));
        setSubmitError("");
        setSubmitSuccess("");
    };

    const submitInquiry = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!listing) {
            return;
        }

        const normalizedInquiry: InquiryRequest = {
            name: inquiry.name.trim(),
            email: inquiry.email.trim(),
            phone: `${phoneCode} ${inquiry.phone.trim()}`.trim(),
            message: inquiry.message.trim()
        };

        const validationErrors = validateInquiry(normalizedInquiry);
        if (Object.keys(validationErrors).length > 0) {
            setFieldErrors(validationErrors);
            setSubmitError("Validation failed");
            return;
        }

        setSubmitting(true);
        setFieldErrors({});
        setSubmitError("");
        setSubmitSuccess("");

        try {
            await http.post<InquiryResponse>(`/inquiries/${listing.id}`, normalizedInquiry);
            setInquiry(INITIAL_INQUIRY);
            setPhoneCode("+359");
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
                <div className="alert alert-info" role="status">
                    Loading listing details...
                </div>
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
                                    <strong>{formatVinForRole(car.vin, isAdmin)}</strong>
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
                                    <label className="form-label" htmlFor="inquiry-name">
                                        Name
                                    </label>
                                    <input
                                        id="inquiry-name"
                                        className={`form-control ${fieldErrors.name ? "is-invalid" : ""}`}
                                        value={inquiry.name}
                                        required
                                        onChange={e => updateInquiry("name", e.target.value)}
                                    />
                                    {fieldErrors.name && (
                                        <div className="invalid-feedback">{fieldErrors.name}</div>
                                    )}
                                </div>

                                <div className="mb-3">
                                    <label className="form-label" htmlFor="inquiry-email">
                                        Email
                                    </label>
                                    <input
                                        id="inquiry-email"
                                        type="email"
                                        className={`form-control ${fieldErrors.email ? "is-invalid" : ""}`}
                                        value={inquiry.email}
                                        required
                                        onChange={e => updateInquiry("email", e.target.value)}
                                    />
                                    {fieldErrors.email && (
                                        <div className="invalid-feedback">{fieldErrors.email}</div>
                                    )}
                                </div>

                                <div className="mb-3">
                                    <label className="form-label" htmlFor="inquiry-phone">
                                        Phone
                                    </label>

                                    <div className="input-group">
                                        <select
                                            className={`form-select phone-code-select ${fieldErrors.phone ? "is-invalid" : ""}`}
                                            value={phoneCode}
                                            onChange={e => updatePhoneCode(e.target.value)}
                                            aria-label="Phone country code"
                                        >
                                            {PHONE_CODE_OPTIONS.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>

                                        <input
                                            id="inquiry-phone"
                                            type="tel"
                                            inputMode="tel"
                                            className={`form-control ${fieldErrors.phone ? "is-invalid" : ""}`}
                                            value={inquiry.phone}
                                            placeholder="888 123 456"
                                            required
                                            onChange={e => updateInquiry("phone", e.target.value)}
                                        />

                                        {fieldErrors.phone && (
                                            <div className="invalid-feedback">
                                                {fieldErrors.phone}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label" htmlFor="inquiry-message">
                                        Message
                                    </label>
                                    <textarea
                                        id="inquiry-message"
                                        rows={4}
                                        maxLength={2000}
                                        className={`form-control ${fieldErrors.message ? "is-invalid" : ""}`}
                                        value={inquiry.message}
                                        onChange={e => updateInquiry("message", e.target.value)}
                                    />
                                    {fieldErrors.message && (
                                        <div className="invalid-feedback">{fieldErrors.message}</div>
                                    )}
                                </div>

                                <button
                                    className="btn btn-primary w-100"
                                    type="submit"
                                    disabled={submitting || listing.status !== "ACTIVE"}
                                >
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