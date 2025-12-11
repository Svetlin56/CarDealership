import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import http from "../api/http";
import { Car } from "../types/models";

export default function CarDetails() {
    const { id } = useParams();
    const [car, setCar] = useState<Car | null>(null);

    useEffect(() => {
        http.get(`/cars/${id}`).then(r => setCar(r.data));
    }, [id]);

    if (!car) return <p>Loading...</p>;

    return (
        <div className="row">
            <div className="col-md-7">
                {car.imageUrl && <img className="img-fluid rounded mb-3" src={car.imageUrl} />}
            </div>
            <div className="col-md-5">
                <h2>{car.make} {car.model}</h2>
                <p>Year: {car.prodYear}</p>
                <p>Mileage: {car.mileage?.toLocaleString()} km</p>
                <p>VIN: {car.vin}</p>
                <h4 className="text-success">{car.price.toLocaleString()} €</h4>
            </div>
        </div>
    );
}
