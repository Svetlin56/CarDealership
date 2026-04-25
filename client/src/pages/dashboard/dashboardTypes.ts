export type CarFormValues = {
    make: string;
    model: string;
    year: number;
    mileage: number;
    vin: string;
    price: number;
    imageUrl: string;
    transmission: string;
    fuelType: string;
    engineSize: string;
    doors: string;
    ownerCount: string;
};

export type DashboardErrors = Record<string, string>;