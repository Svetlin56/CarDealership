import { useEffect, useState } from "react";
import http from "../api/http";
import { RecommendationCar } from "../types/models";

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
                                    Car #{index + 1}
                                </h5>

                                <p className="mb-1"><strong>Year:</strong> {car.year}</p>
                                <p className="mb-1"><strong>Fuel:</strong> {car.fuelType}</p>
                                <p className="mb-1"><strong>Transmission:</strong> {car.transmission}</p>
                                <p className="mb-1"><strong>Mileage:</strong> {car.mileage?.toLocaleString()} km</p>
                                <p className="mb-1"><strong>Engine Size:</strong> {car.engineSize}</p>
                                <p className="mb-1"><strong>Doors:</strong> {car.doors}</p>
                                <p className="mb-1"><strong>Owners:</strong> {car.ownerCount}</p>

                                {car.price !== undefined && (
                                    <p className="mb-1"><strong>Real Price:</strong> {car.price} €</p>
                                )}

                                <p className="mb-1"><strong>Predicted Price:</strong> {car.predictedPrice?.toFixed(2)} €</p>
                                <p className="mb-1"><strong>Score:</strong> {car.score?.toFixed(2)}</p>
                                <p className="mb-1"><strong>Value Score:</strong> {car.valueScore?.toFixed(2)}</p>

                                <div className={`mt-3 badge ${car.goodDeal ? "bg-success" : "bg-secondary"}`}>
                                    {car.goodDeal ? "Good Deal" : "Average Deal"}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}