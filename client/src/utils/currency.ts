const DEFAULT_LOCALE = "en-US";
const DEFAULT_CURRENCY = "EUR";

export function formatCurrency(
    value?: number | null,
    options: { maximumFractionDigits?: number; minimumFractionDigits?: number } = {}
): string {
    if (value === undefined || value === null || Number.isNaN(value)) {
        return "N/A";
    }

    return new Intl.NumberFormat(DEFAULT_LOCALE, {
        style: "currency",
        currency: DEFAULT_CURRENCY,
        minimumFractionDigits: options.minimumFractionDigits ?? 0,
        maximumFractionDigits: options.maximumFractionDigits ?? 0
    }).format(value);
}

export function formatSignedCurrency(value?: number | null): string {
    if (value === undefined || value === null || Number.isNaN(value)) {
        return "N/A";
    }

    const formatted = formatCurrency(Math.abs(value));

    if (value > 0) {
        return `+${formatted}`;
    }

    if (value < 0) {
        return `-${formatted}`;
    }

    return formatted;
}

export function formatNumber(value?: number | null): string {
    if (value === undefined || value === null || Number.isNaN(value)) {
        return "N/A";
    }

    return new Intl.NumberFormat(DEFAULT_LOCALE).format(value);
}