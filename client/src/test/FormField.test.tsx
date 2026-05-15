import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import FormField from "../components/FormField";

describe("FormField", () => {
    it("renders an input field and forwards changes", () => {
        const onChange = vi.fn();

        render(
            <FormField
                label="Email"
                name="email"
                value=""
                onChange={onChange}
                placeholder="Enter email"
            />
        );

        const input = screen.getByPlaceholderText("Enter email");
        fireEvent.change(input, { target: { value: "user@example.com" } });

        expect(input).toBeInTheDocument();
        expect(onChange).toHaveBeenCalledTimes(1);
    });

    it("renders select options", () => {
        render(
            <FormField
                label="Fuel Type"
                name="fuelType"
                value="Petrol"
                onChange={vi.fn()}
                as="select"
                options={[
                    { value: "Petrol", label: "Petrol" },
                    { value: "Diesel", label: "Diesel" }
                ]}
            />
        );

        expect(screen.getByRole("combobox")).toHaveValue("Petrol");
        expect(screen.getByRole("option", { name: "Diesel" })).toBeInTheDocument();
    });

    it("shows validation errors", () => {
        render(
            <FormField
                label="VIN"
                name="vin"
                value=""
                onChange={vi.fn()}
                error="VIN is required"
            />
        );

        expect(screen.getByText("VIN is required")).toBeInTheDocument();
        expect(screen.getByRole("textbox")).toHaveClass("is-invalid");
    });
});