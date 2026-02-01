type Option = {
    value: string | number;
    label: string;
};

type Props = {
    label: string;
    type?: string;
    name: string;
    value: string | number | undefined;
    onChange: (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => void;
    required?: boolean;
    pattern?: string;
    as?: "input" | "textarea" | "select";
    placeholder?: string;
    options?: Option[];
    min?: number;
    error?: string;
};

export default function FormField({
                                      label,
                                      type = "text",
                                      name,
                                      value,
                                      onChange,
                                      required,
                                      pattern,
                                      as = "input",
                                      placeholder,
                                      options,
                                      min,
                                      error
                                  }: Props) {

    if (as === "select") {
        return (
            <div className="mb-3">
                <label className="form-label">{label}</label>

                <select
                    className={`form-select ${error ? "is-invalid" : ""}`}
                    name={name}
                    value={value ?? ""}
                    onChange={onChange}
                    required={required}
                >
                    <option value="">
                        {placeholder ?? `Select ${label}`}
                    </option>

                    {options?.map(o => (
                        <option key={o.value} value={o.value}>
                            {o.label}
                        </option>
                    ))}
                </select>

                {error && (
                    <div className="invalid-feedback">
                        {error}
                    </div>
                )}
            </div>
        );
    }

    const Cmp: any = as === "textarea" ? "textarea" : "input";

    return (
        <div className="mb-3">
            <label className="form-label">{label}</label>

            <Cmp
                className={`form-control ${error ? "is-invalid" : ""}`}
                type={as === "input" ? type : undefined}
                name={name}
                value={value as any}
                onChange={onChange}
                required={required}
                pattern={pattern}
                placeholder={placeholder}
                min={type === "number" ? min : undefined}
            />

            {error && (
                <div className="invalid-feedback">
                    {error}
                </div>
            )}
        </div>
    );
}
