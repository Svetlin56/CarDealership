import { useCallback, useEffect, useState } from "react";
import http from "../../api/http";
import type { Car, CarPageResponse } from "../../types/models";

export function useAdminCars(search: string) {
    const [cars, setCars] = useState<Car[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadCars = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await http.get<CarPageResponse>("/cars", {
                params: {
                    page: 0,
                    size: 100,
                    sortBy: "id",
                    sortDir: "asc",
                    search: search || undefined
                }
            });

            setCars(res.data.content);
        } catch {
            setError("Could not load cars.");
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            void loadCars();
        }, 250);

        return () => window.clearTimeout(timeout);
    }, [loadCars]);

    return {
        cars,
        loading,
        error,
        reload: loadCars
    };
}