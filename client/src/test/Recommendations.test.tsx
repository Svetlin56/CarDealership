import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import Recommendations from "../pages/Recommendations";
import http from "../api/http";

vi.mock("../api/http", () => ({
    default: {
        get: vi.fn()
    }
}));

const mockedHttpGet = vi.mocked(http.get);

const recommendation = {
    Year: 2021,
    Engine_Size: 2.0,
    Fuel_Type: "Petrol",
    Transmission: "Automatic",
    Mileage: 42000,
    Doors: 4,
    Owner_Count: 1,
    Brand: "BMW",
    Model: "320i",
    price: 26000,
    predicted_price: 27500,
    score: 15.5,
    value_score: 18.75,
    good_deal: true,
    anomaly_ratio: -0.0545,
    anomaly_label: "FAIR",
    car_type: "FAMILY",
    confidence: 0.95,
    explanation: "Good price vs market"
};

describe("Recommendations", () => {
    beforeEach(() => {
        mockedHttpGet.mockReset();
    });

    it("renders recommendations returned by the API", async () => {
        mockedHttpGet.mockResolvedValueOnce({ data: [recommendation] });

        render(<Recommendations />);

        expect(await screen.findByText("BMW 320i")).toBeInTheDocument();
        expect(screen.getByText("Good deal")).toBeInTheDocument();
        expect(screen.getByText("Good price vs market")).toBeInTheDocument();
    });

    it("shows an empty state when there are no recommendations", async () => {
        mockedHttpGet.mockResolvedValueOnce({ data: [] });

        render(<Recommendations />);

        expect(await screen.findByText("No recommendations are available at the moment.")).toBeInTheDocument();
    });

    it("shows a graceful message when the ML model is unavailable", async () => {
        mockedHttpGet.mockRejectedValueOnce({
            isAxiosError: true,
            response: {
                status: 503,
                data: {
                    message: "ML model is not loaded. Run python train.py first."
                }
            }
        });

        render(<Recommendations />);

        expect(await screen.findByText("Recommendations could not be loaded")).toBeInTheDocument();
        expect(screen.getByText("ML model is not loaded. Run python train.py first.")).toBeInTheDocument();
    });

    it("reloads recommendations when the refresh button is clicked", async () => {
        mockedHttpGet
            .mockResolvedValueOnce({ data: [] })
            .mockResolvedValueOnce({ data: [recommendation] });

        render(<Recommendations />);

        expect(await screen.findByText("No recommendations are available at the moment.")).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: "Refresh" }));

        expect(await screen.findByText("BMW 320i")).toBeInTheDocument();
        expect(mockedHttpGet).toHaveBeenCalledTimes(2);
    });
});