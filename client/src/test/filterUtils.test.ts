import { describe, expect, it } from "vitest";
import { sanitizeNonNegativeInput } from "../utils/filterUtils";

describe("sanitizeNonNegativeInput", () => {
    it("returns an empty string for blank input", () => {
        expect(sanitizeNonNegativeInput("   ")).toBe("");
    });

    it("returns an empty string for non-numeric input", () => {
        expect(sanitizeNonNegativeInput("abc")).toBe("");
    });

    it("converts negative values to zero", () => {
        expect(sanitizeNonNegativeInput("-15")).toBe("0");
    });

    it("keeps valid non-negative numeric values", () => {
        expect(sanitizeNonNegativeInput("15000")).toBe("15000");
    });
});