export type SelectOption = {
    value: string | number;
    label: string;
};

export const BRAND_MODELS: Record<string, string[]> = {
    BMW: ["X1", "X2", "X3", "X4", "X5", "X6", "M3"],
    Audi: ["A1", "A2", "A3", "A4", "A5", "A6", "Q7"],
    Mercedes: ["A-Class", "B-Class", "C-Class", "E-Class", "S-Class", "GLC"],
    Peugeot: ["208", "2008", "308", "3008", "5008", "408", "Rifter"],
    Fiat: ["500", "500X", "Panda", "Tipo", "Doblo", "Ducato", "600"],
    VW: ["Polo", "Golf", "Passat", "Tiguan", "Touareg", "T-Roc", "ID.4"],
    Citroen: ["C3", "C4", "C5 Aircross", "C3 Aircross", "Berlingo", "C4 X", "SpaceTourer"],
    Opel: ["Corsa", "Astra", "Insignia", "Mokka", "Crossland", "Grandland", "Zafira"],
    Ford: ["Fiesta", "Focus", "Mondeo", "Kuga", "Puma", "EcoSport", "Explorer"],
    Toyota: ["Yaris", "Corolla", "Camry", "RAV4", "C-HR", "Hilux", "Land Cruiser"],
    Hyundai: ["i10", "i20", "i30", "Elantra", "Tucson", "Santa Fe", "Kona"],
    Kia: ["Picanto", "Rio", "Ceed", "Sportage", "Sorento", "Stonic", "Niro"],
    Skoda: ["Fabia", "Octavia", "Superb", "Karoq", "Kodiaq", "Kamiq", "Scala"],
    Seat: ["Ibiza", "Leon", "Ateca", "Arona", "Tarraco", "Toledo", "Alhambra"],
    Renault: ["Clio", "Megane", "Talisman", "Captur", "Kadjar", "Austral", "Espace"],
    Nissan: ["Micra", "Juke", "Qashqai", "X-Trail", "Navara", "Leaf", "Ariya"],
    Mazda: ["Mazda2", "Mazda3", "Mazda6", "CX-3", "CX-5", "CX-30", "MX-5"],
    Honda: ["Jazz", "Civic", "Accord", "CR-V", "HR-V", "ZR-V", "CR-Z"],
    Volvo: ["S60", "S90", "V60", "V90", "XC40", "XC60", "XC90"]
};

export const BRAND_OPTIONS: SelectOption[] = Object.keys(BRAND_MODELS).map(brand => ({
    value: brand,
    label: brand
}));

export const MAKE_OPTIONS = BRAND_OPTIONS.map(option => option.label);

export const TRANSMISSION_OPTIONS = ["Manual", "Automatic", "Semi-automatic", "CVT"];
export const FUEL_TYPE_OPTIONS = ["Petrol", "Diesel", "Hybrid", "Electric", "LPG"];

export const TRANSMISSION_SELECT_OPTIONS: SelectOption[] = TRANSMISSION_OPTIONS.map(option => ({
    value: option,
    label: option
}));

export const FUEL_TYPE_SELECT_OPTIONS: SelectOption[] = FUEL_TYPE_OPTIONS.map(option => ({
    value: option,
    label: option
}));

export function getModelOptions(make: string): SelectOption[] {
    const models = BRAND_MODELS[make] ?? [];

    return models.map(model => ({
        value: model,
        label: model
    }));
}

export function getYearOptions(startYear: number = new Date().getFullYear(), count: number = 85): SelectOption[] {
    return Array.from({ length: count }, (_, index) => {
        const year = startYear - index;

        return {
            value: year,
            label: year.toString()
        };
    });
}