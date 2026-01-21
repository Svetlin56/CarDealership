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
                                      options
                                  }: Props) {

    if (as === "select") {
        return (
            <div className="mb-3">
                <label className="form-label">{label}</label>
                <select
                    className="form-select"
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
                <div className="invalid-feedback">
                    Please fix the field.
                </div>
            </div>
        );
    }

    const Cmp: any = as === "textarea" ? "textarea" : "input";

    return (
        <div className="mb-3">
            <label className="form-label">{label}</label>
            <Cmp
                className="form-control"
                type={as === "input" ? type : undefined}
                name={name}
                value={value as any}
                onChange={onChange}
                required={required}
                pattern={pattern}
                placeholder={placeholder}
            />
            <div className="invalid-feedback">
                Please fix the field.
            </div>
        </div>
    );
}
