import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import http from "../api/http";
import CarCard from "../components/CarCard";
import { CarPageResponse } from "../types/models";

const makeOptions = [
    "BMW",
    "Audi",
    "Mercedes",
    "Peugeot",
    "Fiat",
    "VW",
    "Citroen",
    "Opel",
    "Ford",
    "Toyota",
    "Hyundai",
    "Kia",
    "Skoda",
    "Seat",
    "Renault",
    "Nissan",
    "Mazda",
    "Honda",
    "Volvo"
];

const transmissionOptions = ["Manual", "Automatic", "Semi-automatic", "CVT"];
const fuelTypeOptions = ["Petrol", "Diesel", "Hybrid", "Electric", "LPG"];

function sanitizeNonNegativeInput(value: string): string {
    if (!value.trim()) {
        return "";
    }

    const parsed = Number(value);

    if (Number.isNaN(parsed)) {
        return "";
    }

    return parsed < 0 ? "0" : value;
}

export default function Cars() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [data, setData] = useState<CarPageResponse | null>(null);
    const [loading, setLoading] = useState(true);

    const filters = useMemo(() => {
        return {
            search: searchParams.get("search") ?? "",
            make: searchParams.get("make") ?? "",
            fuelType: searchParams.get("fuelType") ?? "",
            transmission: searchParams.get("transmission") ?? "",
            yearFrom: searchParams.get("yearFrom") ?? "",
            yearTo: searchParams.get("yearTo") ?? "",
            priceFrom: searchParams.get("priceFrom") ?? "",
            priceTo: searchParams.get("priceTo") ?? "",
            page: Number(searchParams.get("page") ?? "0"),
            size: Number(searchParams.get("size") ?? "9"),
            sortBy: searchParams.get("sortBy") ?? "id",
            sortDir: searchParams.get("sortDir") ?? "desc"
        };
    }, [searchParams]);

    useEffect(() => {
        const loadCars = async () => {
            setLoading(true);

            try {
                const params: Record<string, string | number> = {
                    page: filters.page,
                    size: filters.size,
                    sortBy: filters.sortBy,
                    sortDir: filters.sortDir
                };

                if (filters.search) params.search = filters.search;
                if (filters.make) params.make = filters.make;
                if (filters.fuelType) params.fuelType = filters.fuelType;
                if (filters.transmission) params.transmission = filters.transmission;
                if (filters.yearFrom) params.yearFrom = filters.yearFrom;
                if (filters.yearTo) params.yearTo = filters.yearTo;
                if (filters.priceFrom) params.priceFrom = filters.priceFrom;
                if (filters.priceTo) params.priceTo = filters.priceTo;

                const res = await http.get<CarPageResponse>("/cars", { params });
                setData(res.data);
            } finally {
                setLoading(false);
            }
        };

        loadCars();
    }, [filters]);

    const updateFilter = (key: string, value: string) => {
        const next = new URLSearchParams(searchParams);

        if (value.trim()) {
            next.set(key, value);
        } else {
            next.delete(key);
        }

        next.set("page", "0");
        setSearchParams(next);
    };

    const updateNonNegativeFilter = (key: string, value: string) => {
        updateFilter(key, sanitizeNonNegativeInput(value));
    };

    const changePage = (page: number) => {
        const next = new URLSearchParams(searchParams);
        next.set("page", page.toString());
        setSearchParams(next);
    };

    const clearFilters = () => {
        setSearchParams({
            page: "0",
            size: "9",
            sortBy: "id",
            sortDir: "desc"
        });
    };

    return (
        <div className="container mt-4">
            <div className="row g-3 mb-4">
                <div className="col-12 col-lg-4">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search by brand, model or VIN..."
                        value={filters.search}
                        onChange={e => updateFilter("search", e.target.value)}
                    />
                </div>

                <div className="col-6 col-lg-2">
                    <select
                        className="form-select"
                        value={filters.make}
                        onChange={e => updateFilter("make", e.target.value)}
                    >
                        <option value="">All brands</option>
                        {makeOptions.map(make => (
                            <option key={make} value={make}>
                                {make}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="col-6 col-lg-2">
                    <select
                        className="form-select"
                        value={filters.fuelType}
                        onChange={e => updateFilter("fuelType", e.target.value)}
                    >
                        <option value="">All fuel types</option>
                        {fuelTypeOptions.map(option => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="col-6 col-lg-2">
                    <select
                        className="form-select"
                        value={filters.transmission}
                        onChange={e => updateFilter("transmission", e.target.value)}
                    >
                        <option value="">All transmissions</option>
                        {transmissionOptions.map(option => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="col-6 col-lg-2">
                    <button className="btn btn-outline-secondary w-100" onClick={clearFilters}>
                        Clear filters
                    </button>
                </div>

                <div className="col-6 col-lg-2">
                    <input
                        type="number"
                        min="0"
                        className="form-control"
                        placeholder="Year from"
                        value={filters.yearFrom}
                        onChange={e => updateNonNegativeFilter("yearFrom", e.target.value)}
                    />
                </div>

                <div className="col-6 col-lg-2">
                    <input
                        type="number"
                        min="0"
                        className="form-control"
                        placeholder="Year to"
                        value={filters.yearTo}
                        onChange={e => updateNonNegativeFilter("yearTo", e.target.value)}
                    />
                </div>

                <div className="col-6 col-lg-2">
                    <input
                        type="number"
                        min="0"
                        className="form-control"
                        placeholder="Price from"
                        value={filters.priceFrom}
                        onChange={e => updateNonNegativeFilter("priceFrom", e.target.value)}
                    />
                </div>

                <div className="col-6 col-lg-2">
                    <input
                        type="number"
                        min="0"
                        className="form-control"
                        placeholder="Price to"
                        value={filters.priceTo}
                        onChange={e => updateNonNegativeFilter("priceTo", e.target.value)}
                    />
                </div>

                <div className="col-6 col-lg-2">
                    <select
                        className="form-select"
                        value={filters.sortBy}
                        onChange={e => updateFilter("sortBy", e.target.value)}
                    >
                        <option value="id">Newest</option>
                        <option value="price">Price</option>
                        <option value="prodYear">Year</option>
                        <option value="mileage">Mileage</option>
                        <option value="make">Brand</option>
                        <option value="model">Model</option>
                    </select>
                </div>

                <div className="col-6 col-lg-2">
                    <select
                        className="form-select"
                        value={filters.sortDir}
                        onChange={e => updateFilter("sortDir", e.target.value)}
                    >
                        <option value="desc">Descending</option>
                        <option value="asc">Ascending</option>
                    </select>
                </div>
            </div>

            {loading && <p>Loading...</p>}

            {!loading && data && data.content.length === 0 && (
                <div className="alert alert-light border">
                    No cars found for the selected filters.
                </div>
            )}

            {!loading && data && data.content.length > 0 && (
                <>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <p className="mb-0">
                            Showing {data.content.length} of {data.totalElements} cars
                        </p>
                        <p className="mb-0">
                            Page {data.page + 1} of {Math.max(data.totalPages, 1)}
                        </p>
                    </div>

                    <div className="row g-3">
                        {data.content.map(c => (
                            <div className="col-12 col-sm-6 col-lg-4" key={c.id}>
                                <CarCard car={c} />
                            </div>
                        ))}
                    </div>

                    <div className="d-flex justify-content-center gap-2 mt-4">
                        <button
                            className="btn btn-outline-primary"
                            disabled={data.first}
                            onClick={() => changePage(data.page - 1)}
                        >
                            Previous
                        </button>

                        <button
                            className="btn btn-outline-primary"
                            disabled={data.last}
                            onClick={() => changePage(data.page + 1)}
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}