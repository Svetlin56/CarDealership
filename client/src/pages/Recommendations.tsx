import { useEffect, useState } from "react";
import http from "../api/http";
import type { RecommendationCar } from "../types/models";

export default function Recommendations() {
    const [cars, setCars] = useState<RecommendationCar[]>([]);

    useEffect(() => {
        http.get("/ml/recommendations")
            .then(res => setCars(res.data));
    }, []);

    return (
        <div className="container mt-4">
            <h2>Recommended Cars</h2>

            <div className="row">
                {cars.map((car, i) => (
                    <div key={i} className="col-md-4">
                        <div className="card p-3 mb-3">

                            <h5>{car.Brand} {car.Model}</h5>

                            <p>Year: {car.Year}</p>
                            <p>Mileage: {car.Mileage}</p>

                            <p>Real: {car.price} €</p>
                            <p>Predicted: {car.predicted_price} €</p>

                            <p><b>Type:</b> {car.car_type}</p>

                            <p><b>Confidence:</b> {(car.confidence * 100).toFixed(1)}%</p>

                            <p><b>Explanation:</b></p>
                            <small>{car.explanation}</small>

                            <div className="mt-2">
                                <span className="badge bg-info me-2">
                                    {car.anomaly_label}
                                </span>

                                <span className="badge bg-success">
                                    Score: {car.value_score.toFixed(2)}
                                </span>
                            </div>

                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}