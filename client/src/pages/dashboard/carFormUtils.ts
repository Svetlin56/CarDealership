import type { Car } from "../../types/models";
import type { CarFormValues } from "./dashboardTypes";

export const INITIAL_CAR_FORM: CarFormValues = {
    make: "",
    model: "",
    year: new Date().getFullYear(),
    mileage: 0,
    vin: "",
    price: 10000,
    imageUrl: "",
    transmission: "",
    fuelType: "",
    engineSize: "",
    doors: "",
    ownerCount: ""
};

export function sanitizeVin(value: string): string {
    return value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, "").slice(0, 17);
}

export function buildYearOptions() {
    const currentYear = new Date().getFullYear();

    return Array.from({ length: 85 }, (_, index) => {
        const year = currentYear - index;

        return {
            value: year,
            label: year.toString()
        };
    });
}

export function toCarFormValues(car: Car): CarFormValues {
    return {
        make: car.make ?? "",
        model: car.model ?? "",
        year: car.year ?? new Date().getFullYear(),
        mileage: car.mileage ?? 0,
        vin: car.vin ?? "",
        price: car.price ?? 0,
        imageUrl: car.imageUrl ?? "",
        transmission: car.transmission ?? "",
        fuelType: car.fuelType ?? "",
        engineSize: car.engineSize != null ? String(car.engineSize) : "",
        doors: car.doors != null ? String(car.doors) : "",
        ownerCount: car.ownerCount != null ? String(car.ownerCount) : ""
    };
}

export function toCarPayload(form: CarFormValues, imageUrl: string | null) {
    return {
        make: form.make,
        model: form.model,
        year: Number(form.year),
        mileage: Number(form.mileage),
        vin: form.vin,
        price: Number(form.price),
        imageUrl,
        transmission: form.transmission || null,
        fuelType: form.fuelType || null,
        engineSize: form.engineSize ? Number(form.engineSize) : null,
        doors: form.doors ? Number(form.doors) : null,
        ownerCount: form.ownerCount ? Number(form.ownerCount) : null
    };
}

export function getApiErrors(error: unknown): Record<string, string> {
    if (typeof error !== "object" || error === null || !("response" in error)) {
        return { general: "Unexpected error." };
    }

    const response = (error as {
        response?: {
            data?: {
                errors?: Record<string, string>;
                fieldErrors?: Record<string, string>;
                message?: string;
            };
        };
    }).response;

    return (
        response?.data?.errors ||
        response?.data?.fieldErrors ||
        { general: response?.data?.message || "Request failed." }
    );
}