import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import http from "../api/http";
import type { MlRecommendation, MlRecommendationApiResponse } from "../types/models";

type LoadingState = "idle" | "loading" | "success" | "error";

type ApiErrorResponse = {
    message?: string;
    error?: string;
    details?: string;
};

function toRecommendation(car: MlRecommendationApiResponse): MlRecommendation {
    return {
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

function formatPrice(value?: number): string {
    if (value === undefined || value === null) {
        return "N/A";
    }

    return `${value.toLocaleString()} €`;
}

export default function Recommendations() {
    const [cars, setCars] = useState<MlRecommendation[]>([]);
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

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <h2 className="mb-1">Recommended Cars</h2>
                    <p className="text-muted mb-0">
                        Car suggestions generated through the ML recommendation service.
                    </p>
                </div>

                <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={loadRecommendations}
                    disabled={loadingState === "loading"}
                >
                    Refresh
                </button>
            </div>

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

            {loadingState === "success" && cars.length === 0 && (
                <div className="alert alert-secondary" role="status">
                    No recommendations are available at the moment.
                </div>
            )}

            {loadingState === "success" && cars.length > 0 && (
                <div className="row">
                    {cars.map((car, index) => (
                        <div key={`${car.brand}-${car.model}-${index}`} className="col-md-4">
                            <div className="card p-3 mb-3 h-100">
                                <h5>{car.brand} {car.model}</h5>

                                <p className="mb-1"><b>Year:</b> {car.year}</p>
                                <p className="mb-1"><b>Mileage:</b> {car.mileage.toLocaleString()} km</p>
                                <p className="mb-1"><b>Engine:</b> {car.engineSize} L</p>
                                <p className="mb-1"><b>Fuel:</b> {car.fuelType}</p>
                                <p className="mb-1"><b>Transmission:</b> {car.transmission}</p>

                                <hr />

                                <p className="mb-1"><b>Real price:</b> {formatPrice(car.price)}</p>
                                <p className="mb-1"><b>Predicted price:</b> {formatPrice(car.predictedPrice)}</p>
                                <p className="mb-1"><b>Type:</b> {car.carType}</p>
                                <p className="mb-1"><b>Confidence:</b> {(car.confidence * 100).toFixed(1)}%</p>

                                <p className="mb-1"><b>Explanation:</b></p>
                                <small className="text-muted">{car.explanation}</small>

                                <div className="mt-3">
                                    <span className="badge bg-info me-2">
                                        {car.anomalyLabel}
                                    </span>

                                    {car.goodDeal && (
                                        <span className="badge bg-success me-2">
                                            Good deal
                                        </span>
                                    )}

                                    <span className="badge bg-secondary">
                                        Score: {car.valueScore.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}