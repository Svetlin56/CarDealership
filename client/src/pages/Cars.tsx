import { useEffect, useState } from "react";
import http from "../api/http";
import CarCard from "../components/CarCard";
import { Car } from "../types/models";

export default function Cars() {
    const [cars, setCars] = useState<Car[]>([]);

    useEffect(() => {
        http.get("/cars").then(res => setCars(res.data));
    }, []);

    return (
        <div className="row g-3">
            {cars.map(c => (
                <div className="col-12 col-sm-6 col-lg-4" key={c.id}>
                    <CarCard car={c}/>
                </div>
            ))}
        </div>
    );

}