import React, { useMemo } from "react";
import FormField from "../../components/FormField";
import type { DashboardErrors, CarFormValues } from "./dashboardTypes";
import { BRANDS, FUEL_TYPE_OPTIONS, TRANSMISSION_OPTIONS } from "./carOptions";
import { buildYearOptions, sanitizeVin } from "./carFormUtils";

type Props = {
    form: CarFormValues;
    errors: DashboardErrors;
    selectedImage: File | null;
    uploadingImage: boolean;
    editing: boolean;
    hasCurrentImage: boolean;
    onChange: (nextForm: CarFormValues) => void;
    onImageChange: (file: File | null) => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    onCancelEdit: () => void;
};

export default function CarForm({
                                    form,
                                    errors,
                                    selectedImage,
                                    uploadingImage,
                                    editing,
                                    hasCurrentImage,
                                    onChange,
                                    onImageChange,
                                    onSubmit,
                                    onCancelEdit
                                }: Props) {
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

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        const normalizedValue = name === "vin" ? sanitizeVin(value) : value;

        onChange({
            ...form,
            [name]: normalizedValue,
            ...(name === "make" ? { model: "" } : {})
        });
    };

    return (
        <form className="needs-validation" noValidate onSubmit={onSubmit}>
            <FormField
                label="Brand"
                name="make"
                value={form.make}
                onChange={handleChange}
                required
                as="select"
                options={brandOptions}
                error={errors.make}
            />

            <FormField
                label="Model"
                name="model"
                value={form.model}
                onChange={handleChange}
                required
                as="select"
                options={modelOptions}
                placeholder={form.make ? "Select Model" : "Select Brand first"}
                error={errors.model}
            />

            <FormField
                label="Year"
                name="year"
                value={form.year}
                onChange={handleChange}
                required
                as="select"
                options={yearOptions}
                error={errors.year}
            />

            <FormField
                label="Mileage"
                type="number"
                name="mileage"
                value={form.mileage}
                onChange={handleChange}
                required
                min={0}
                error={errors.mileage}
            />

            <FormField
                label="VIN"
                name="vin"
                value={form.vin}
                onChange={handleChange}
                required
                error={errors.vin}
                maxLength={17}
            />

            <FormField
                label="Price"
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                required
                min={0.01}
                error={errors.price}
            />

            <FormField
                label="Transmission"
                name="transmission"
                value={form.transmission}
                onChange={handleChange}
                required
                as="select"
                options={TRANSMISSION_OPTIONS}
                placeholder="Select Transmission"
                error={errors.transmission}
            />

            <FormField
                label="Fuel Type"
                name="fuelType"
                value={form.fuelType}
                onChange={handleChange}
                required
                as="select"
                options={FUEL_TYPE_OPTIONS}
                placeholder="Select Fuel Type"
                error={errors.fuelType}
            />

            <FormField
                label="Engine Size"
                type="number"
                name="engineSize"
                value={form.engineSize}
                onChange={handleChange}
                required
                min={0.9}
                placeholder="e.g. 2.0"
                error={errors.engineSize}
            />

            <FormField
                label="Doors"
                type="number"
                name="doors"
                value={form.doors}
                onChange={handleChange}
                required
                min={2}
                placeholder="e.g. 4"
                error={errors.doors}
            />

            <FormField
                label="Owner Count"
                type="number"
                name="ownerCount"
                value={form.ownerCount}
                onChange={handleChange}
                required
                min={0}
                placeholder="e.g. 1"
                error={errors.ownerCount}
            />

            <div className="mb-3">
                <label className="form-label">Image file</label>
                <input
                    type="file"
                    className={`form-control ${errors.imageUrl ? "is-invalid" : ""}`}
                    accept=".jpg,.jpeg,.png,.webp"
                    required={!editing || !hasCurrentImage}
                    onChange={e => onImageChange(e.target.files?.[0] ?? null)}
                />
                <div className="form-text">
                    Allowed: JPG, JPEG, PNG, WEBP. Max size: 5 MB.
                </div>

                {selectedImage && (
                    <div className="form-text">
                        Selected: {selectedImage.name}
                    </div>
                )}

                {editing && hasCurrentImage && !selectedImage && (
                    <div className="form-text">
                        Existing image will be kept unless a new file is selected.
                    </div>
                )}

                {errors.imageUrl && (
                    <div className="invalid-feedback">
                        {errors.imageUrl}
                    </div>
                )}
            </div>

            {errors.general && (
                <div className="alert alert-danger py-2">{errors.general}</div>
            )}
            {/* From Uiverse.io by cssbuttons-io */}
            <div className="d-flex gap-2 align-items-center">
                <button className="save-button" disabled={uploadingImage}>
                    {uploadingImage ? "Uploading..." : editing ? "Update" : "Save"}
                </button>

                {editing && (
                    <button type="button" className="btn btn-outline-secondary" onClick={onCancelEdit}>
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );
}
