import { Car } from "../types/models";
import { Link } from "react-router-dom";

export default function CarCard({ car }: { car: Car }) {
    return (
        <div className="card h-100">
            {car.imageUrl && <img className="card-img-top" src={car.imageUrl} alt={`${car.make} ${car.model}`} />}
            <div className="card-body d-flex flex-column">
                <h5 className="card-title">{car.make} {car.model}</h5>
                <p className="card-text">{car.prodYear} • {car.mileage?.toLocaleString()} km</p>
                <div className="mt-auto d-flex justify-content-between align-items-center">
                    <strong>{car.price.toLocaleString()} €</strong>
                    <Link to={`/cars/${car.id}`} className="btn btn-primary">Details</Link>
                </div>
            </div>
        </div>
    );
}