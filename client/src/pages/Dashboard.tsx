import { useEffect, useState } from "react";
import http from "../api/http.js";
import FormField from "../components/FormField.js";
import { Car } from "../types/models.js";
import React from "react";

export default function Dashboard() {
    const [cars, setCars] = useState<Car[]>([]);
    const [form, setForm] = useState<any>({
        make:"",
        model:"",
        year:2019,
        mileage:0,
        vin:"",
        price:0,
        imageUrl:""
    });

    const load = () => http.get("/cars").then(r => setCars(r.data));
    useEffect(() => { load(); }, []);

    const onChange = (e:any)=> setForm({...form, [e.target.name]: e.target.value});

    const addCar = async (e:any) => {
        e.preventDefault();
        await http.post("/cars", {
            ...form,
            year:Number(form.year),
            mileage:Number(form.mileage),
            price:Number(form.price)
        });
        setForm({ make:"", model:"", year:2020, mileage:0, vin:"", price:10000, imageUrl:"" });
        load();
    };

    const remove = async (id:number) => {
        await http.delete(`/cars/${id}`);
        load();
    };

    return (
        <div className="row g-4">
            <div className="col-md-5">
                <h4>Add cars</h4>
                <form className="needs-validation" noValidate onSubmit={addCar}>
                    <FormField label="Brand" name="make" value={form.make} onChange={onChange} required />
                    <FormField label="Model" name="model" value={form.model} onChange={onChange} required />
                    <FormField label="Year" type="number" name="year" value={form.year} onChange={onChange} required />
                    <FormField label="Mileage" type="number" name="mileage" value={form.mileage} onChange={onChange} />
                    <FormField label="VIN" name="vin" value={form.vin} onChange={onChange} />
                    <FormField label="Price" type="number" name="price" value={form.price} onChange={onChange} required />
                    <FormField label="Image (URL)" name="imageUrl" value={form.imageUrl} onChange={onChange} />
                    <button className="btn btn-primary">Save</button>
                </form>
            </div>

            <div className="col-md-7">
                <h4>List</h4>
                <div className="table-responsive">
                    <table className="table table-striped align-middle">
                        <thead>
                        <tr>
                            <th>№</th><th>Car</th><th>Year</th><th>Mileage</th><th>Price</th><th></th>
                        </tr>
                        </thead>
                        <tbody>
                        {cars.map(c => (
                            <tr key={c.id}>
                                <td>{c.id}</td>
                                <td>{c.make} {c.model}</td>
                                <td>{c.prodYear}</td>
                                <td>{c.mileage?.toLocaleString()}</td>
                                <td>{c.price.toLocaleString()} €</td>
                                <td>
                                    <button
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => remove(c.id!)}
                                    >
                                        Delete
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
