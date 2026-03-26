import { useEffect, useState } from "react";
import http from "../api/http";
import type { RecommendationCar } from "../types/models";

function getCarTypeText(type: string) {
    switch (type) {
        case "FAMILY":
            return "Family Car";
        case "SPORT":
            return "Sport Car";
        case "LUXURY":
            return "Luxury Car";
        case "CITY":
            return "City Car";
        default:
            return "Unknown";
    }
}

function getCarTypeBadge(type: string) {
    switch (type) {
        case "FAMILY":
            return "bg-primary";
        case "SPORT":
            return "bg-danger";
        case "LUXURY":
            return "bg-dark";
        case "CITY":
            return "bg-info";
        default:
            return "bg-secondary";
    }
}

function getAnomalyBadgeClass(label: RecommendationCar["anomaly_label"]) {
    switch (label) {
        case "OVERPRICED":
            return "bg-danger";
        case "UNDERVALUED":
            return "bg-success";
        case "FAIR":
            return "bg-warning text-dark";
        default:
            return "bg-secondary";
    }
}

function getAnomalyText(label: RecommendationCar["anomaly_label"]) {
    switch (label) {
        case "OVERPRICED":
            return "Overpriced";
        case "UNDERVALUED":
            return "Undervalued";
        case "FAIR":
            return "Fair Price";
        default:
            return "Unknown";
    }
}

export default function Recommendations() {
    const [cars, setCars] = useState<RecommendationCar[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        http.get("/ml/recommendations")
            .then(res => setCars(res.data))
            .catch(() => setError("Could not load recommendations"))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="container mt-4">Loading recommendations...</div>;
    }

    if (error) {
        return <div className="container mt-4 alert alert-danger">{error}</div>;
    }

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Recommended Cars</h2>

            <div className="row g-3">
                {cars.map((car, index) => (
                    <div className="col-md-6 col-lg-4" key={index}>
                        <div className="card shadow-sm h-100">
                            <div className="card-body">
                                <h5 className="card-title">
                                    {car.Brand} {car.Model || ""} #{index + 1}
                                </h5>

                                <p className="mb-1"><strong>Year:</strong> {car.Year}</p>
                                <p className="mb-1"><strong>Fuel:</strong> {car.Fuel_Type}</p>
                                <p className="mb-1"><strong>Transmission:</strong> {car.Transmission}</p>
                                <p className="mb-1"><strong>Mileage:</strong> {car.Mileage?.toLocaleString()} km</p>
                                <p className="mb-1"><strong>Engine Size:</strong> {car.Engine_Size}</p>
                                <p className="mb-1"><strong>Doors:</strong> {car.Doors}</p>
                                <p className="mb-1"><strong>Owners:</strong> {car.Owner_Count}</p>

                                {car.price !== undefined && (
                                    <p className="mb-1">
                                        <strong>Real Price:</strong> {Number(car.price).toLocaleString()} €
                                    </p>
                                )}

                                <p className="mb-1">
                                    <strong>Predicted Price:</strong> {Number(car.predicted_price || 0).toFixed(2)} €
                                </p>

                                <p className="mb-1">
                                    <strong>Score:</strong> {car.score?.toFixed(2)}
                                </p>

                                <p className="mb-1">
                                    <strong>Value Score:</strong> {car.value_score?.toFixed(2)}
                                </p>

                                <p className="mb-2">
                                    <strong>Anomaly Ratio:</strong> {(car.anomaly_ratio * 100).toFixed(2)}%
                                </p>

                                <div className="d-flex gap-2 flex-wrap mt-3">

                                    <span className={`badge ${car.good_deal ? "bg-success" : "bg-secondary"}`}>
                                        {car.good_deal ? "Good Deal" : "Average Deal"}
                                    </span>

                                    <span className={`badge ${getAnomalyBadgeClass(car.anomaly_label)}`}>
                                        {getAnomalyText(car.anomaly_label)}
                                    </span>

                                    <span className={`badge ${getCarTypeBadge(car.car_type)}`}>
                                        {getCarTypeText(car.car_type)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}