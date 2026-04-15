export function sanitizeNonNegativeInput(value: string): string {
    if (!value.trim()) {
        return "";
    }

    const parsed = Number(value);

    if (Number.isNaN(parsed)) {
        return "";
    }

    return parsed < 0 ? "0" : value;
}