import React, { useEffect, useMemo, useState } from "react";
import http from "../api/http";
import FormField from "../components/FormField";
import { Car, CarPageResponse } from "../types/models";

type CreateCarForm = {
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
};

const INITIAL_FORM: CreateCarForm = {
    make: "",
    model: "",
    year: 2020,
    mileage: 0,
    vin: "",
    price: 10000,
    imageUrl: "",
    transmission: "",
    fuelType: "",
    engineSize: ""
};

const BRANDS: Record<string, string[]> = {
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

const TRANSMISSION_OPTIONS = [
    { value: "Manual", label: "Manual" },
    { value: "Automatic", label: "Automatic" },
    { value: "Semi-automatic", label: "Semi-automatic" },
    { value: "CVT", label: "CVT" }
];

const FUEL_TYPE_OPTIONS = [
    { value: "Petrol", label: "Petrol" },
    { value: "Diesel", label: "Diesel" },
    { value: "Hybrid", label: "Hybrid" },
    { value: "Electric", label: "Electric" },
    { value: "LPG", label: "LPG" }
];

function sanitizeVin(value: string): string {
    return value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 17);
}

function buildYearOptions() {
    const currentYear = new Date().getFullYear();

    return Array.from({ length: 85 }, (_, index) => {
        const year = currentYear - index;

        return {
            value: year,
            label: year.toString()
        };
    });
}

export default function Dashboard() {
    const [cars, setCars] = useState<Car[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [search, setSearch] = useState("");
    const [form, setForm] = useState<CreateCarForm>(INITIAL_FORM);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    const brandOptions = useMemo(
        () =>
            Object.keys(BRANDS).map(brand => ({
                value: brand,
                label: brand
            })),
        []
    );

    const modelOptions = useMemo(() => {
        if (!form.make || !BRANDS[form.make]) {
            return [];
        }

        return BRANDS[form.make].map(model => ({
            value: model,
            label: model
        }));
    }, [form.make]);

    const yearOptions = useMemo(() => buildYearOptions(), []);

    const loadCars = async () => {
        const res = await http.get<CarPageResponse>("/cars", {
            params: {
                page: 0,
                size: 100,
                sortBy: "id",
                sortDir: "asc",
                search: search || undefined
            }
        });

        setCars(res.data.content);
    };

    useEffect(() => {
        loadCars();
    }, []);

    useEffect(() => {
        const timeout = setTimeout(() => {
            loadCars();
        }, 250);

        return () => clearTimeout(timeout);
    }, [search]);

    const onChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        const normalizedValue = name === "vin" ? sanitizeVin(value) : value;

        setForm(prev => ({
            ...prev,
            [name]: normalizedValue,
            ...(name === "make" ? { model: "" } : {})
        }));

        setErrors(prev => ({
            ...prev,
            [name]: ""
        }));
    };

    const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setSelectedImage(file);

        setErrors(prev => ({
            ...prev,
            imageUrl: ""
        }));
    };

    const resetForm = () => {
        setForm(INITIAL_FORM);
        setSelectedImage(null);
    };

    const uploadImage = async (): Promise<string | null> => {
        if (!selectedImage) {
            return form.imageUrl?.trim() || null;
        }

        const formData = new FormData();
        formData.append("file", selectedImage);

        setUploadingImage(true);

        try {
            const response = await http.post<{ imageUrl: string }>("/cars/upload-image", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            return response.data.imageUrl;
        } finally {
            setUploadingImage(false);
        }
    };

    const addCar = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrors({});

        try {
            const uploadedImageUrl = await uploadImage();

            await http.post("/cars", {
                ...form,
                year: Number(form.year),
                mileage: Number(form.mileage),
                price: Number(form.price),
                imageUrl: uploadedImageUrl,
                engineSize: form.engineSize ? Number(form.engineSize) : null
            });

            resetForm();
            await loadCars();
        } catch (err: any) {
            const apiErrors = err.response?.data?.errors || err.response?.data?.fieldErrors;

            if (apiErrors) {
                setErrors(apiErrors);
            } else if (err.response?.data?.message) {
                setErrors({ general: err.response.data.message });
            }
        }
    };

    const remove = async (id: number | undefined) => {
        await http.delete(`/cars/${id}`);
        await loadCars();
    };

    return (
        <div className="row g-4">
            <div className="col-md-5">
                <h4>Add cars</h4>
                <form className="needs-validation" noValidate onSubmit={addCar}>
                    <FormField
                        label="Brand"
                        name="make"
                        value={form.make}
                        onChange={onChange}
                        required
                        as="select"
                        options={brandOptions}
                    />

                    <FormField
                        label="Model"
                        name="model"
                        value={form.model}
                        onChange={onChange}
                        required
                        as="select"
                        options={modelOptions}
                        placeholder={form.make ? "Select Model" : "Select Brand first"}
                    />

                    <FormField
                        label="Year"
                        name="year"
                        value={form.year}
                        onChange={onChange}
                        required
                        as="select"
                        options={yearOptions}
                    />

                    <FormField
                        label="Mileage"
                        type="number"
                        name="mileage"
                        value={form.mileage}
                        onChange={onChange}
                        min={0}
                    />

                    <FormField
                        label="VIN"
                        name="vin"
                        value={form.vin}
                        onChange={onChange}
                        error={errors.vin}
                        maxLength={17}
                    />

                    <FormField
                        label="Price"
                        type="number"
                        name="price"
                        value={form.price}
                        onChange={onChange}
                        required
                        min={0}
                    />

                    <FormField
                        label="Transmission"
                        name="transmission"
                        value={form.transmission}
                        onChange={onChange}
                        as="select"
                        options={TRANSMISSION_OPTIONS}
                        placeholder="Select Transmission"
                    />

                    <FormField
                        label="Fuel Type"
                        name="fuelType"
                        value={form.fuelType}
                        onChange={onChange}
                        as="select"
                        options={FUEL_TYPE_OPTIONS}
                        placeholder="Select Fuel Type"
                    />

                    <FormField
                        label="Engine Size"
                        type="number"
                        name="engineSize"
                        value={form.engineSize}
                        onChange={onChange}
                        min={0.9}
                        placeholder="e.g. 2.0"
                    />

                    <div className="mb-3">
                        <label className="form-label">Image file</label>
                        <input
                            type="file"
                            className="form-control"
                            accept=".jpg,.jpeg,.png,.webp,.gif"
                            onChange={onImageChange}
                        />
                        <div className="form-text">
                            Allowed: JPG, JPEG, PNG, WEBP, GIF. Max size: 5 MB.
                        </div>
                        {selectedImage && (
                            <div className="form-text">
                                Selected: {selectedImage.name}
                            </div>
                        )}
                    </div>

                    <FormField
                        label="Image (URL)"
                        name="imageUrl"
                        value={form.imageUrl}
                        onChange={onChange}
                        error={errors.imageUrl}
                    />

                    {errors.general && (
                        <div className="alert alert-danger py-2">{errors.general}</div>
                    )}

                    {/* From Uiverse.io by cssbuttons-io */}
                    <button className="save-button" disabled={uploadingImage}>
                        {uploadingImage ? "Uploading..." : "Save"}
                    </button>
                </form>
            </div>

            <div className="col-md-7">
                <h4>List</h4>
                <input
                    type="text"
                    className="form-control mb-3"
                    placeholder="Search by brand, model or VIN..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />

                <div className="table-responsive">
                    <table className="table table-striped align-middle">
                        <thead>
                        <tr>
                            <th>№</th>
                            <th>Car</th>
                            <th>Year</th>
                            <th>Mileage</th>
                            <th>Price</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        {cars.map((c, index) => (
                            <tr key={c.id}>
                                <td>{index + 1}</td>
                                <td>
                                    {c.make} {c.model}
                                </td>
                                <td>{c.year}</td>
                                <td>{c.mileage?.toLocaleString()}</td>
                                <td>{c.price.toLocaleString()} €</td>

                                <td> {/* From Uiverse.io by vinodjangid07 */}
                                    <button className="delete-button" onClick={() => remove(c.id)}>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 69 14"
                                            className="svgIcon bin-top"
                                        >
                                            <g clipPath="url(#clip0_35_24)">
                                                <path
                                                    fill="black"
                                                    d="M20.8232 2.62734L19.9948 4.21304C19.8224 4.54309 19.4808 4.75 19.1085 4.75H4.92857C2.20246 4.75 0 6.87266 0 9.5C0 12.1273 2.20246 14.25 4.92857 14.25H64.0714C66.7975 14.25 69 12.1273 69 9.5C69 6.87266 66.7975 4.75 64.0714 4.75H49.8915C49.5192 4.75 49.1776 4.54309 49.0052 4.21305L48.1768 2.62734C47.3451 1.00938 45.6355 0 43.7719 0H25.2281C23.3645 0 21.6549 1.00938 20.8232 2.62734ZM64.0023 20.0648C64.0397 19.4882 63.5822 19 63.0044 19H5.99556C5.4178 19 4.96025 19.4882 4.99766 20.0648L8.19375 69.3203C8.44018 73.0758 11.6746 76 15.5712 76H53.4288C57.3254 76 60.5598 73.0758 60.8062 69.3203L64.0023 20.0648Z"
                                                ></path>
                                            </g>
                                            <defs>
                                                <clipPath id="clip0_35_24">
                                                    <rect fill="white" height="14" width="69"></rect>
                                                </clipPath>
                                            </defs>
                                        </svg>

                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 69 57"
                                            className="svgIcon bin-bottom"
                                        >
                                            <g clipPath="url(#clip0_35_22)">
                                                <path
                                                    fill="black"
                                                    d="M20.8232 -16.3727L19.9948 -14.787C19.8224 -14.4569 19.4808 -14.25 19.1085 -14.25H4.92857C2.20246 -14.25 0 -12.1273 0 -9.5C0 -6.8727 2.20246 -4.75 4.92857 -4.75H64.0714C66.7975 -4.75 69 -6.8727 69 -9.5C69 -12.1273 66.7975 -14.25 64.0714 -14.25H49.8915C49.5192 -14.25 49.1776 -14.4569 49.0052 -14.787L48.1768 -16.3727C47.3451 -17.9906 45.6355 -19 43.7719 -19H25.2281C23.3645 -19 21.6549 -17.9906 20.8232 -16.3727ZM64.0023 1.0648C64.0397 0.4882 63.5822 0 63.0044 0H5.99556C5.4178 0 4.96025 0.4882 4.99766 1.0648L8.19375 50.3203C8.44018 54.0758 11.6746 57 15.5712 57H53.4288C57.3254 57 60.5598 54.0758 60.8062 50.3203L64.0023 1.0648Z"
                                                ></path>
                                            </g>
                                            <defs>
                                                <clipPath id="clip0_35_22">
                                                    <rect fill="white" height="57" width="69"></rect>
                                                </clipPath>
                                            </defs>
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {cars.length === 0 && (
                            <tr>
                                <td colSpan={6} className="text-center text-muted py-4">
                                    No cars found.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}