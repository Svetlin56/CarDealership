export type Car = {
    id?: number;
    make: string;
    model: string;
    prodYear: number;
    mileage?: number;
    vin?: string;
    price: number;
    imageUrl?: string;
}

export type RecommendationCar = {
    year: number;
    engineSize: number;
    fuelType: string;
    transmission: string;
    mileage: number;
    doors: number;
    ownerCount: number;
    predictedPrice: number;
    score: number;
    valueScore: number;
    goodDeal: boolean;
    price?: number;
};