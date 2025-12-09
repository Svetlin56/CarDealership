type Props = {
    label: string;
    type?: string;
    name: string;
    value: string | number | undefined;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    required?: boolean;
    pattern?: string;
    as?: "input" | "textarea";
    placeholder?: string;
};

export default function FormField({label, type="text", name, value, onChange, required, pattern, as="input", placeholder}: Props) {
    const Cmp:any = as === "textarea" ? "textarea" : "input";
    return (
        <div className="mb-3">
            <label className="form-label">{label}</label>
            <Cmp
                className="form-control"
                type={as==="input" ? type : undefined}
                name={name}
                value={value as any}
                onChange={onChange}
                required={required}
                pattern={pattern}
                placeholder={placeholder}
            />
            <div className="invalid-feedback">Please fix the field.</div>
        </div>
    );
}
