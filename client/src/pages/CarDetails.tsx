import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import http from "../api/http";
import { Car } from "../types/models";

type ApiErrorResponse = {
    message?: string;
    fieldErrors?: Record<string, string>;
};

export default function CarDetails() {
    const { id } = useParams();
    const [car, setCar] = useState<Car | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadCar = async () => {
            if (!id) {
                setError("Invalid car id.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");

                const response = await http.get<Car>(`/cars/${id}`);
                setCar(response.data);
            } catch (err: any) {
                const apiError = err?.response?.data as ApiErrorResponse | undefined;

                if (err?.response?.status === 404) {
                    setError(apiError?.message || "Car not found.");
                } else if (err?.response?.status === 401) {
                    setError(apiError?.message || "You need to sign in again.");
                } else if (err?.response?.status === 403) {
                    setError(apiError?.message || "You do not have access to this car.");
                } else {
                    setError(apiError?.message || "Failed to load car details.");
                }
            } finally {
                setLoading(false);
            }
        };

        loadCar();
    }, [id]);

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

    if (!car) {
        return (
            <div className="container mt-4">
                <div className="alert alert-warning">No car data available.</div>
                <Link to="/cars" className="btn btn-outline-primary">
                    Back to cars
                </Link>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <div className="row g-4">
                <div className="col-md-7">
                    {car.imageUrl ? (
                        <img
                            className="img-fluid rounded mb-3"
                            src={car.imageUrl}
                            alt={`${car.make} ${car.model}`}
                        />
                    ) : (
                        <div className="border rounded p-5 text-center text-muted">
                            No image available
                        </div>
                    )}
                </div>

                <div className="col-md-5">
                    <h2>
                        {car.make} {car.model}
                    </h2>

                    <p>Year: {car.year}</p>
                    <p>Mileage: {car.mileage?.toLocaleString() ?? "N/A"} km</p>
                    <p>Fuel type: {car.fuelType || "N/A"}</p>
                    <p>Transmission: {car.transmission || "N/A"}</p>
                    <p>Engine size: {car.engineSize ?? "N/A"} L</p>
                    <p>Doors: {car.doors ?? "N/A"}</p>
                    <p>Owner count: {car.ownerCount ?? "N/A"}</p>

                    <h4 className="text-success">{car.price.toLocaleString()} €</h4>

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