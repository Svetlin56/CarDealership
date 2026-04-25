import React, { useState } from "react";
import http from "../api/http";
import type { Car } from "../types/models";
import CarAdminTable from "./dashboard/CarAdminTable";
import CarForm from "./dashboard/CarForm";
import type { CarFormValues, DashboardErrors } from "./dashboard/dashboardTypes";
import { getApiErrors, INITIAL_CAR_FORM, toCarFormValues, toCarPayload } from "./dashboard/carFormUtils";
import { useAdminCars } from "./dashboard/useAdminCars";

export default function Dashboard() {
    const [search, setSearch] = useState("");
    const [form, setForm] = useState<CarFormValues>(INITIAL_CAR_FORM);
    const [errors, setErrors] = useState<DashboardErrors>({});
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [editingCarId, setEditingCarId] = useState<number | null>(null);

    const { cars, loading, error, reload } = useAdminCars(search);

    const resetForm = () => {
        setForm(INITIAL_CAR_FORM);
        setSelectedImage(null);
        setEditingCarId(null);
        setErrors({});
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

    const submitCar = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrors({});

        try {
            const uploadedImageUrl = await uploadImage();
            const payload = toCarPayload(form, uploadedImageUrl);

            if (editingCarId) {
                await http.put(`/cars/${editingCarId}`, payload);
            } else {
                await http.post("/cars", payload);
            }

            resetForm();
            await reload();
        } catch (err: unknown) {
            setErrors(getApiErrors(err));
        }
    };

    const editCar = (car: Car) => {
        if (!car.id) {
            return;
        }

        setEditingCarId(car.id);
        setForm(toCarFormValues(car));
        setSelectedImage(null);
        setErrors({});
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const deleteCar = async (id: number | undefined) => {
        if (!id) {
            return;
        }

        const confirmed = window.confirm("Are you sure you want to delete this car?");
        if (!confirmed) {
            return;
        }

        await http.delete(`/cars/${id}`);
        await reload();
    };

    return (
        <div className="row g-4">
            <div className="col-md-5">
                <h4>{editingCarId ? "Edit car" : "Add car"}</h4>

                <CarForm
                    form={form}
                    errors={errors}
                    selectedImage={selectedImage}
                    uploadingImage={uploadingImage}
                    editing={Boolean(editingCarId)}
                    onChange={nextForm => {
                        setForm(nextForm);
                        setErrors(prev => ({ ...prev, general: "" }));
                    }}
                    onImageChange={file => {
                        setSelectedImage(file);
                        setErrors(prev => ({ ...prev, imageUrl: "" }));
                    }}
                    onSubmit={submitCar}
                    onCancelEdit={resetForm}
                />
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

                {error && <div className="alert alert-danger py-2">{error}</div>}

                <CarAdminTable
                    cars={cars}
                    loading={loading}
                    onEdit={editCar}
                    onDelete={deleteCar}
                />
            </div>
        </div>
    );
}