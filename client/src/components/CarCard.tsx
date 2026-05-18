import { Link } from "react-router-dom";
import { API_BASE_URL } from "../api/http";
import { Car } from "../types/models";
import { formatCurrency, formatNumber } from "../utils/currency";

type CarCardProps = {
    car: Car;
    detailsPath?: string;
};

function resolveImageUrl(imageUrl?: string): string | null {
    if (!imageUrl) {
        return null;
    }

    return imageUrl.startsWith("http") ? imageUrl : `${API_BASE_URL}${imageUrl}`;
}

export default function CarCard({ car, detailsPath }: CarCardProps) {
    const imageSrc = resolveImageUrl(car.imageUrl);
    const carTitle = `${car.make} ${car.model}`;

    return (
        <article className="card car-card h-100 border-0 shadow-sm">
            <div className="car-card-image-wrapper bg-light">
                {imageSrc ? (
                    <img
                        className="card-img-top car-card-image"
                        src={imageSrc}
                        alt={carTitle}
                    />
                ) : (
                    <div className="car-card-placeholder text-muted">
                        No image available
                    </div>
                )}
            </div>

            <div className="card-body d-flex flex-column">
                <div className="d-flex justify-content-between gap-3 mb-2">
                    <div>
                        <h5 className="card-title mb-1">{carTitle}</h5>
                        <p className="text-muted small mb-0">
                            {car.year} · {car.fuelType || "N/A"} · {car.transmission || "N/A"}
                        </p>
                    </div>

                    <span className="badge text-bg-success align-self-start">Available</span>
                </div>

                <div className="car-spec-grid my-3">
                    <div>
                        <span className="text-muted small d-block">Mileage</span>
                        <strong>{formatNumber(car.mileage)} km</strong>
                    </div>
                    <div>
                        <span className="text-muted small d-block">Engine</span>
                        <strong>{car.engineSize ?? "N/A"} L</strong>
                    </div>
                </div>

                <div className="mt-auto d-flex justify-content-between align-items-center gap-3">
                    <div>
                        <span className="text-muted small d-block">Price</span>
                        <strong className="fs-5">{formatCurrency(car.price)}</strong>
                    </div>

                    <Link to={detailsPath ?? `/cars/${car.id}`} className="btn btn-primary">
                        View details
                    </Link>
                </div>
            </div>
        </article>
    );
}