export type Car = {
    id?: number;
    make: string;
    model: string;
    year: number;
    mileage?: number;
    vin?: string;
    price: number;
    imageUrl?: string;
    engineSize?: number;
    fuelType?: string;
    transmission?: string;
    doors?: number;
    ownerCount?: number;
};

export type CarPageResponse = {
    content: Car[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
    sortBy: string;
    sortDir: string;
};

export type MlRecommendationApiResponse = {
    Year: number;
    Engine_Size: number;
    Fuel_Type: string;
    Transmission: string;
    Mileage: number;
    Doors: number;
    Owner_Count: number;
    Brand: string;
    Model: string;
    price?: number;
    predicted_price: number;
    score: number;
    value_score: number;
    good_deal: boolean;
    anomaly_ratio: number;
    anomaly_label: "OVERPRICED" | "UNDERVALUED" | "FAIR" | "UNKNOWN";
    car_type: string;
    confidence: number;
    explanation: string;
};

export type MlRecommendation = {
    year: number;
    engineSize: number;
    fuelType: string;
    transmission: string;
    mileage: number;
    doors: number;
    ownerCount: number;
    brand: string;
    model: string;
    price?: number;
    predictedPrice: number;
    score: number;
    valueScore: number;
    goodDeal: boolean;
    anomalyRatio: number;
    anomalyLabel: "OVERPRICED" | "UNDERVALUED" | "FAIR" | "UNKNOWN";
    carType: string;
    confidence: number;
    explanation: string;
};

export type MlPredictionResponse = {
    predicted_price: number;
};