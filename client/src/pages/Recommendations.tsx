import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import http, { API_BASE_URL } from "../api/http";
import type { MlRecommendation, MlRecommendationApiResponse } from "../types/models";
import { formatCurrency, formatNumber, formatSignedCurrency } from "../utils/currency";

type LoadingState = "idle" | "loading" | "success" | "error";

type ApiErrorResponse = {
    message?: string;
    error?: string;
    details?: string;
};

type RecommendationPreferences = {
    budgetFrom: string;
    budgetTo: string;
    fuelType: string;
    transmission: string;
    carType: string;
};

const INITIAL_PREFERENCES: RecommendationPreferences = {
    budgetFrom: "",
    budgetTo: "",
    fuelType: "",
    transmission: "",
    carType: ""
};

function toRecommendation(car: MlRecommendationApiResponse): MlRecommendation {
    return {
        carId: car.car_id ?? undefined,
        listingId: car.listing_id ?? undefined,
        listingStatus: car.listing_status ?? undefined,
        listingDescription: car.listing_description ?? undefined,
        imageUrl: car.image_url ?? undefined,
        recommendationSource: car.recommendation_source ?? "ML",
        year: car.Year,
        engineSize: car.Engine_Size,
        fuelType: car.Fuel_Type,
        transmission: car.Transmission,
        mileage: car.Mileage,
        doors: car.Doors,
        ownerCount: car.Owner_Count,
        brand: car.Brand,
        model: car.Model,
        price: car.price,
        predictedPrice: car.predicted_price,
        score: car.score,
        valueScore: car.value_score,
        goodDeal: car.good_deal,
        anomalyRatio: car.anomaly_ratio,
        anomalyLabel: car.anomaly_label,
        carType: car.car_type,
        confidence: car.confidence,
        explanation: car.explanation
    };
}

function getErrorMessage(error: unknown): string {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        const status = error.response?.status;
        const responseData = error.response?.data;

        if (status === 503) {
            return responseData?.message
                ?? "The ML recommendation service is currently unavailable. Please make sure the ML service is running and the model is trained.";
        }

        return responseData?.message
            ?? responseData?.error
            ?? error.message
            ?? "Failed to load recommendations.";
    }

    if (error instanceof Error) {
        return error.message;
    }

    return "Failed to load recommendations.";
}

function resolveImageUrl(imageUrl?: string): string | null {
    if (!imageUrl) {
        return null;
    }

    return imageUrl.startsWith("http") ? imageUrl : `${API_BASE_URL}${imageUrl}`;
}

function getPriceDifference(car: MlRecommendation): number | null {
    if (car.price === undefined || car.price === null || car.predictedPrice === undefined || car.predictedPrice === null) {
        return null;
    }

    return car.predictedPrice - car.price;
}

function getDealBadgeClass(car: MlRecommendation): string {
    if (car.anomalyLabel === "UNDERVALUED") {
        return "text-bg-success";
    }

    if (car.anomalyLabel === "OVERPRICED") {
        return "text-bg-danger";
    }

    if (car.anomalyLabel === "FAIR") {
        return "text-bg-primary";
    }

    return "text-bg-secondary";
}

function getDealLabel(car: MlRecommendation): string {
    if (car.goodDeal && car.anomalyLabel === "UNDERVALUED") {
        return "Great deal";
    }

    if (car.goodDeal) {
        return "Good deal";
    }

    if (car.anomalyLabel === "OVERPRICED") {
        return "Above market";
    }

    if (car.anomalyLabel === "FAIR") {
        return "Fair price";
    }

    return "Market estimate";
}

function getConfidenceLabel(confidence: number): string {
    if (confidence >= 0.75) {
        return "High confidence";
    }

    if (confidence >= 0.5) {
        return "Medium confidence";
    }

    return "Low confidence";
}

function buildMarketMessage(car: MlRecommendation): string {
    const difference = getPriceDifference(car);

    if (difference === null) {
        return "Market estimate is currently unavailable.";
    }

    if (difference > 0) {
        return `${formatCurrency(difference)} below estimated market value.`;
    }

    if (difference < 0) {
        return `${formatCurrency(Math.abs(difference))} above estimated market value.`;
    }

    return "Listed close to the estimated market value.";
}

function matchesPreferences(car: MlRecommendation, preferences: RecommendationPreferences): boolean {
    const budgetFrom = preferences.budgetFrom ? Number(preferences.budgetFrom) : null;
    const budgetTo = preferences.budgetTo ? Number(preferences.budgetTo) : null;
    const price = car.price ?? 0;

    if (budgetFrom !== null && price < budgetFrom) {
        return false;
    }

    if (budgetTo !== null && price > budgetTo) {
        return false;
    }

    if (preferences.fuelType && car.fuelType !== preferences.fuelType) {
        return false;
    }

    if (preferences.transmission && car.transmission !== preferences.transmission) {
        return false;
    }

    if (preferences.carType && car.carType !== preferences.carType) {
        return false;
    }

    return true;
}

function uniqueSorted(values: string[]): string[] {
    return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

export default function Recommendations() {
    const [cars, setCars] = useState<MlRecommendation[]>([]);
    const [preferences, setPreferences] = useState<RecommendationPreferences>(INITIAL_PREFERENCES);
    const [loadingState, setLoadingState] = useState<LoadingState>("idle");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const loadRecommendations = useCallback(async () => {
        setLoadingState("loading");
        setErrorMessage(null);

        try {
            const response = await http.get<MlRecommendationApiResponse[]>("/ml/recommendations");
            const recommendations = response.data.map(toRecommendation);

            setCars(recommendations);
            setLoadingState("success");
        } catch (error: unknown) {
            setCars([]);
            setErrorMessage(getErrorMessage(error));
            setLoadingState("error");
        }
    }, []);

    useEffect(() => {
        void loadRecommendations();
    }, [loadRecommendations]);

    const fuelOptions = useMemo(() => uniqueSorted(cars.map(car => car.fuelType)), [cars]);
    const transmissionOptions = useMemo(() => uniqueSorted(cars.map(car => car.transmission)), [cars]);
    const carTypeOptions = useMemo(() => uniqueSorted(cars.map(car => car.carType)), [cars]);
    const isFallbackResult = cars.some(car => car.recommendationSource === "FALLBACK");

    const filteredCars = useMemo(
        () => cars.filter(car => matchesPreferences(car, preferences)),
        [cars, preferences]
    );

    const updatePreference = (field: keyof RecommendationPreferences, value: string) => {
        setPreferences(prev => ({ ...prev, [field]: value }));
    };

    const clearPreferences = () => {
        setPreferences(INITIAL_PREFERENCES);
    };

    return (
        <div className="container mt-4 recommendations-page">
            <section className="recommendation-hero mb-4">
                <div>
                    <span className="text-uppercase text-primary fw-semibold small">Personalized inventory</span>
                    <h2 className="mb-2">Recommended for you</h2>
                    <p className="text-muted mb-0">
                        Cars selected from active listings based on budget, vehicle characteristics and estimated market value.
                    </p>
                </div>

                <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={loadRecommendations}
                    disabled={loadingState === "loading"}
                >
                    {loadingState === "loading" ? "Refreshing..." : "Refresh"}
                </button>
            </section>

            {loadingState === "loading" && (
                <div className="alert alert-info" role="status">
                    Loading recommendations...
                </div>
            )}

            {loadingState === "error" && (
                <div className="alert alert-danger" role="alert">
                    <h5 className="alert-heading">Recommendations could not be loaded</h5>
                    <p className="mb-3">{errorMessage}</p>

                    <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={loadRecommendations}
                    >
                        Try again
                    </button>
                </div>
            )}

            {loadingState === "success" && isFallbackResult && cars.length > 0 && (
                <div className="alert alert-warning" role="status">
                    Personalized ML scoring is temporarily unavailable. Showing active listings ordered by practical fallback criteria.
                </div>
            )}

            {loadingState === "success" && cars.length > 0 && (
                <section className="card border-0 shadow-sm mb-4">
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
                            <div>
                                <h5 className="mb-1">Refine recommendations</h5>
                                <p className="text-muted mb-0 small">
                                    These filters are applied over the recommendation result returned by the system.
                                </p>
                            </div>

                            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={clearPreferences}>
                                Clear filters
                            </button>
                        </div>

                        <div className="row g-3">
                            <div className="col-6 col-lg-2">
                                <input
                                    type="number"
                                    min="0"
                                    className="form-control"
                                    placeholder="Budget from"
                                    value={preferences.budgetFrom}
                                    onChange={event => updatePreference("budgetFrom", event.target.value)}
                                />
                            </div>

                            <div className="col-6 col-lg-2">
                                <input
                                    type="number"
                                    min="0"
                                    className="form-control"
                                    placeholder="Budget to"
                                    value={preferences.budgetTo}
                                    onChange={event => updatePreference("budgetTo", event.target.value)}
                                />
                            </div>

                            <div className="col-12 col-md-4 col-lg-2">
                                <select
                                    className="form-select"
                                    value={preferences.fuelType}
                                    onChange={event => updatePreference("fuelType", event.target.value)}
                                >
                                    <option value="">All fuel types</option>
                                    {fuelOptions.map(option => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-12 col-md-4 col-lg-3">
                                <select
                                    className="form-select"
                                    value={preferences.transmission}
                                    onChange={event => updatePreference("transmission", event.target.value)}
                                >
                                    <option value="">All transmissions</option>
                                    {transmissionOptions.map(option => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-12 col-md-4 col-lg-3">
                                <select
                                    className="form-select"
                                    value={preferences.carType}
                                    onChange={event => updatePreference("carType", event.target.value)}
                                >
                                    <option value="">All car types</option>
                                    {carTypeOptions.map(option => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {loadingState === "success" && cars.length === 0 && (
                <div className="alert alert-secondary" role="status">
                    No recommendations are available at the moment.
                </div>
            )}

            {loadingState === "success" && cars.length > 0 && filteredCars.length === 0 && (
                <div className="alert alert-light border" role="status">
                    No cars match the selected recommendation filters.
                </div>
            )}

            {loadingState === "success" && filteredCars.length > 0 && (
                <div className="row g-4">
                    {filteredCars.map((car, index) => {
                        const imageSrc = resolveImageUrl(car.imageUrl);
                        const carTitle = `${car.brand} ${car.model}`;
                        const detailsPath = car.carId ? `/cars/${car.carId}` : null;

                        return (
                            <div key={`${car.carId ?? car.brand}-${car.model}-${index}`} className="col-12 col-md-6 col-xl-4">
                                <article className="card recommendation-card h-100 border-0 shadow-sm">
                                    <div className="recommendation-image-wrapper bg-light">
                                        {imageSrc ? (
                                            <img
                                                className="card-img-top recommendation-image"
                                                src={imageSrc}
                                                alt={carTitle}
                                            />
                                        ) : (
                                            <div className="recommendation-placeholder text-muted">
                                                No image available
                                            </div>
                                        )}
                                    </div>

                                    <div className="card-body d-flex flex-column">
                                        <div className="d-flex justify-content-between gap-3 mb-2">
                                            <div>
                                                <h5 className="card-title mb-1">{carTitle}</h5>
                                                <p className="text-muted small mb-0">
                                                    {car.year} · {car.fuelType} · {car.transmission}
                                                </p>
                                            </div>

                                            <span className={`badge ${getDealBadgeClass(car)} align-self-start`}>
                                                {getDealLabel(car)}
                                            </span>
                                        </div>

                                        <div className="recommendation-spec-grid my-3">
                                            <div>
                                                <span className="text-muted small d-block">Mileage</span>
                                                <strong>{formatNumber(car.mileage)} km</strong>
                                            </div>
                                            <div>
                                                <span className="text-muted small d-block">Engine</span>
                                                <strong>{car.engineSize} L</strong>
                                            </div>
                                            <div>
                                                <span className="text-muted small d-block">Doors</span>
                                                <strong>{car.doors}</strong>
                                            </div>
                                            <div>
                                                <span className="text-muted small d-block">Owners</span>
                                                <strong>{car.ownerCount}</strong>
                                            </div>
                                        </div>

                                        <div className="market-box rounded border p-3 mb-3">
                                            <div className="d-flex justify-content-between gap-3 mb-2">
                                                <span className="text-muted">Listed price</span>
                                                <strong>{formatCurrency(car.price)}</strong>
                                            </div>
                                            <div className="d-flex justify-content-between gap-3 mb-2">
                                                <span className="text-muted">Estimated market price</span>
                                                <strong>{formatCurrency(car.predictedPrice)}</strong>
                                            </div>
                                            <div className="d-flex justify-content-between gap-3">
                                                <span className="text-muted">Market difference</span>
                                                <strong>{formatSignedCurrency(getPriceDifference(car))}</strong>
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <p className="fw-semibold mb-1">Why this car?</p>
                                            <p className="text-muted small mb-1">{buildMarketMessage(car)}</p>
                                            <p className="text-muted small mb-0">{car.explanation}</p>
                                        </div>

                                        <div className="d-flex flex-wrap gap-2 mb-3">
                                            <span className="badge text-bg-light border">{car.carType}</span>
                                            <span className="badge text-bg-light border">{getConfidenceLabel(car.confidence)}</span>
                                            {car.recommendationSource === "ML" && (
                                                <span className="badge text-bg-light border">ML scored</span>
                                            )}
                                            {car.goodDeal && (
                                                <span className="badge text-bg-success">Below estimate</span>
                                            )}
                                        </div>

                                        <div className="mt-auto d-flex gap-2">
                                            {detailsPath ? (
                                                <>
                                                    <Link to={detailsPath} className="btn btn-primary flex-fill">
                                                        View details
                                                    </Link>
                                                    <Link to={`${detailsPath}#inquiry`} className="btn btn-outline-primary flex-fill">
                                                        Send inquiry
                                                    </Link>
                                                </>
                                            ) : (
                                                <button type="button" className="btn btn-outline-secondary w-100" disabled>
                                                    Listing details unavailable
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </article>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}