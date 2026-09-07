import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "signal" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  children: ReactNode;
}

const base =
  "inline-flex h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-control)] px-4 text-sm font-medium " +
  "transition-[background,color,border-color,opacity] duration-150 ease-out " +
  "focus-visible:ring-2 focus-visible:ring-signal/70 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas focus-visible:outline-none " +
  "disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<Variant, string> = {
  signal:
    "bg-signal text-on-signal hover:bg-signal-strong active:bg-signal-strong",
  ghost:
    "border border-line-strong bg-transparent text-ink hover:border-signal/60 hover:text-ink",
};

export function Button({
  variant = "signal",
  loading = false,
  disabled,
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
}

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
    />
  );
}
