import { useEffect, useState } from "react";
import http from "../api/http";
import type { MlRecommendation, MlRecommendationApiResponse } from "../types/models";

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

export default function Recommendations() {
    const [cars, setCars] = useState<MlRecommendation[]>([]);

    useEffect(() => {
        http.get<MlRecommendationApiResponse[]>("/ml/recommendations")
            .then(res => setCars(res.data.map(toRecommendation)));
    }, []);

    return (
        <div className="container mt-4">
            <h2>Recommended Cars</h2>

            <div className="row">
                {cars.map((car, index) => (
                    <div key={`${car.brand}-${car.model}-${index}`} className="col-md-4">
                        <div className="card p-3 mb-3">
                            <h5>{car.brand} {car.model}</h5>

                            <p>Year: {car.year}</p>
                            <p>Mileage: {car.mileage}</p>

                            <p>Real: {car.price} €</p>
                            <p>Predicted: {car.predictedPrice} €</p>

                            <p><b>Type:</b> {car.carType}</p>

                            <p><b>Confidence:</b> {(car.confidence * 100).toFixed(1)}%</p>

                            <p><b>Explanation:</b></p>
                            <small>{car.explanation}</small>

                            <div className="mt-2">
                                <span className="badge bg-info me-2">
                                    {car.anomalyLabel}
                                </span>

                                <span className="badge bg-success">
                                    Score: {car.valueScore.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}