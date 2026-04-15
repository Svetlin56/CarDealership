import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { sanitizeNonNegativeInput } from "../utils/filterUtils";

export type CarFilters = {
    search: string;
    make: string;
    fuelType: string;
    transmission: string;
    yearFrom: string;
    yearTo: string;
    priceFrom: string;
    priceTo: string;
    page: number;
    size: number;
    sortBy: string;
    sortDir: string;
};

const DEFAULT_FILTERS = {
    page: "0",
    size: "9",
    sortBy: "id",
    sortDir: "desc"
} as const;

export function useCarFilters() {
    const [searchParams, setSearchParams] = useSearchParams();

    const filters: CarFilters = useMemo(() => ({
        search: searchParams.get("search") ?? "",
        make: searchParams.get("make") ?? "",
        fuelType: searchParams.get("fuelType") ?? "",
        transmission: searchParams.get("transmission") ?? "",
        yearFrom: searchParams.get("yearFrom") ?? "",
        yearTo: searchParams.get("yearTo") ?? "",
        priceFrom: searchParams.get("priceFrom") ?? "",
        priceTo: searchParams.get("priceTo") ?? "",
        page: Number(searchParams.get("page") ?? DEFAULT_FILTERS.page),
        size: Number(searchParams.get("size") ?? DEFAULT_FILTERS.size),
        sortBy: searchParams.get("sortBy") ?? DEFAULT_FILTERS.sortBy,
        sortDir: searchParams.get("sortDir") ?? DEFAULT_FILTERS.sortDir
    }), [searchParams]);

    const updateFilter = (key: keyof CarFilters, value: string) => {
        const next = new URLSearchParams(searchParams);

        if (value.trim()) {
            next.set(key, value);
        } else {
            next.delete(key);
        }

        next.set("page", DEFAULT_FILTERS.page);
        setSearchParams(next);
    };

    const updateNonNegativeFilter = (key: keyof CarFilters, value: string) => {
        updateFilter(key, sanitizeNonNegativeInput(value));
    };

    const changePage = (page: number) => {
        const next = new URLSearchParams(searchParams);
        next.set("page", page.toString());
        setSearchParams(next);
    };

    const clearFilters = () => {
        setSearchParams(new URLSearchParams(DEFAULT_FILTERS));
    };

    return {
        filters,
        updateFilter,
        updateNonNegativeFilter,
        changePage,
        clearFilters
    };
}