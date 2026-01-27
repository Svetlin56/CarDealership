import { useEffect, useState } from "react";
import http from "../api/http.js";
import FormField from "../components/FormField.js";
import { Car } from "../types/models.js";
import React from "react";

export default function Dashboard() {
    const [cars, setCars] = useState<Car[]>([]);
    const [form, setForm] = useState<any>({
        make: "",
        model: "",
        year: 2019,
        mileage: 0,
        vin: "",
        price: 0,
        imageUrl: ""
    });

    const brands: Record<string, string[]> = {
        BMW: ["X1","X2","X3","X4","X5","X6","M3"],
        Audi: ["A1","A2","A3","A4","A5","A6","Q7"],
        Mercedes: ["A-Class","B-Class","C-Class","E-Class","S-Class","GLC"],
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

    const brandOptions = Object.keys(brands).map(b => ({
        value: b,
        label: b
    }));

    const modelOptions =
        form.make && brands[form.make]
            ? brands[form.make].map(m => ({
                value: m,
                label: m
            }))
            : [];

    const yearOptions = Array.from({ length: 85 }, (_, i) => {
        const y = 2026 - i;
        return { value: y, label: y.toString() };
    });

    const load = () =>
        http.get("/cars").then(r => setCars(r.data));

    useEffect(() => {
        load();
    }, []);

    const onChange = (e: any) => {
        const { name, value } = e.target;
        setForm((prev: any) => ({
            ...prev,
            [name]: value,
            ...(name === "make" ? { model: "" } : {})
        }));
    };

    const addCar = async (e: any) => {
        e.preventDefault();
        await http.post("/cars", {
            ...form,
            year: Number(form.year),
            mileage: Number(form.mileage),
            price: Number(form.price)
        });
        setForm({
            make: "",
            model: "",
            year: 2020,
            mileage: 0,
            vin: "",
            price: 10000,
            imageUrl: ""
        });
        load();
    };

    const remove = async (id: number) => {
        await http.delete(`/cars/${id}`);
        load();
    };

    return (
        <div className="row g-4">
            <div className="col-md-5">
                <h4>Add cars</h4>
                <form
                    className="needs-validation"
                    noValidate
                    onSubmit={addCar}
                >
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
                        placeholder={
                            form.make
                                ? "Select Model"
                                : "Select Brand first"
                        }
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
                        label="Image (URL)"
                        name="imageUrl"
                        value={form.imageUrl}
                        onChange={onChange}
                    />

                    {/* From Uiverse.io by cssbuttons-io */}
                    <button className="save-button">
                        Save
                    </button>
                </form>
            </div>

            <div className="col-md-7">
                <h4>List</h4>
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
                        {cars.map(c => (
                            <tr key={c.id}>
                                <td>{c.id}</td>
                                <td>
                                    {c.make} {c.model}
                                </td>
                                <td>{c.prodYear}</td>
                                <td>
                                    {c.mileage?.toLocaleString()}
                                </td>
                                <td>
                                    {c.price.toLocaleString()} €
                                </td>
                                <td>
                                    {/* From Uiverse.io by vinodjangid07 */}
                                    <button className="delete-button" onClick={() => remove(c.id)}>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 69 14"
                                            className="svgIcon bin-top"
                                        >
                                            <g clip-path="url(#clip0_35_24)">
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
                                            <g clip-path="url(#clip0_35_22)">
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
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
