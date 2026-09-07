export function FullscreenLoader({
  label = "Cargando",
}: {
  label?: string;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4">
      <SignalPulse />
      <span className="microlabel">{label}</span>
    </div>
  );
}

/** Concentric ring with a sweeping teal arc. */
function SignalPulse() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      className="animate-spin [animation-duration:1.1s]"
    >
      <circle cx="20" cy="20" r="15" stroke="var(--color-line-strong)" />
      <path
        d="M20 5a15 15 0 0 1 15 15"
        stroke="var(--color-signal)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
