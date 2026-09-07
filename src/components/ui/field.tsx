import type { InputHTMLAttributes } from "react";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  error?: string;
}

export function Field({ label, name, error, id, ...props }: FieldProps) {
  const fieldId = id ?? name;
  const errorId = `${fieldId}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={fieldId} className="microlabel">
        {label}
      </label>
      <input
        id={fieldId}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={
          "peer h-10 w-full border-b bg-transparent px-0.5 text-[0.9375rem] text-ink " +
          "placeholder:text-ink-faint focus:outline-none " +
          "transition-colors duration-150 " +
          (error
            ? "border-danger focus:border-danger"
            : "border-line-strong focus:border-signal")
        }
        {...props}
      />
      {error ? (
        <p id={errorId} className="text-xs text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
