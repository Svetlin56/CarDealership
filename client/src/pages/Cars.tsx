import { useEffect, useState } from "react";
import http from "../api/http";
import CarCard from "../components/CarCard";
import { Car } from "../types/models";

export default function Cars() {
    const [cars, setCars] = useState<Car[]>([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        http.get("/cars").then(res => setCars(res.data));
    }, []);

    const filteredCars = cars.filter(c => {
        const q = search.toLowerCase();

        return (
            c.make.toLowerCase().includes(q) ||
            c.model.toLowerCase().includes(q) ||
            c.prodYear?.toString().includes(q) ||
            c.vin?.toLowerCase().includes(q)
        );
    });

    return (
        <div className="container mt-4">

            <div className="row mb-4 justify-content-center">
                <div className="col-md-8">
                    <input
                        type="text"
                        className="form-control form-control-lg"
                        placeholder="Search by brand, model, year or VIN..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="row g-3">
                {filteredCars.map(c => (
                    <div className="col-12 col-sm-6 col-lg-4" key={c.id}>
                        <CarCard car={c} />
                    </div>
                ))}
            </div>

        </div>
    );
}
