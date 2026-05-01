import { Link } from "react-router-dom";
import { API_BASE_URL } from "../api/http";
import { Car } from "../types/models";

type CarCardProps = {
    car: Car;
    detailsPath?: string;
};

export default function CarCard({ car, detailsPath }: CarCardProps) {
    const imageSrc = car.imageUrl
        ? car.imageUrl.startsWith("http")
            ? car.imageUrl
            : `${API_BASE_URL}${car.imageUrl}`
        : null;

    return (
        <div className="card h-100">
            {imageSrc && (
                <img
                    className="card-img-top"
                    src={imageSrc}
                    alt={`${car.make} ${car.model}`}
                />
            )}

            <div className="card-body d-flex flex-column">
                <h5 className="card-title">{car.make} {car.model}</h5>
                <p className="card-text">{car.year} • {car.mileage?.toLocaleString()} km</p>
                <div className="mt-auto d-flex justify-content-between align-items-center">
                    <strong>{car.price.toLocaleString()} €</strong>
                    <Link to={detailsPath ?? `/cars/${car.id}`} className="btn btn-primary">
                        Details
                    </Link>
                </div>
            </div>
        </div>
    );
}