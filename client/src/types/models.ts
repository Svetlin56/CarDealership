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