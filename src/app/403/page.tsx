import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Access restricted · TaoFlow Admin",
  robots: { index: false, follow: false },
};

export default function ForbiddenPage() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 text-center">
      <BackdropMotif />

      <div className="relative flex max-w-md flex-col items-center gap-6">
        <span className="flex size-12 items-center justify-center rounded-full border border-danger/30 text-danger">
          <ShieldGlyph />
        </span>

        <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Access restricted
        </h1>

        <p className="max-w-sm text-sm leading-relaxed text-ink-muted">
          This console is only available from authorized locations. Your
          connection is not on the allowlist.
        </p>

        <div className="mt-2 flex items-center gap-2 font-mono text-xs tracking-wide text-ink-faint">
          <span>TaoFlow Admin · Private console · 403</span>
        </div>
      </div>
    </main>
  );
}

function ShieldGlyph() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8 1.5 13 3.3v4.2c0 3.1-2.1 5.6-5 6.5-2.9-.9-5-3.4-5-6.5V3.3L8 1.5Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="m5.9 8 1.5 1.5L10.4 6.5"
        stroke="var(--color-danger)"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Faint concentric rings behind the message — geometry only. */
function BackdropMotif() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-1/2 h-[720px] w-[720px] -translate-x-1/2 -translate-y-1/2 text-line opacity-50"
      viewBox="0 0 720 720"
      fill="none"
    >
      {[120, 200, 280, 360].map((r) => (
        <circle key={r} cx="360" cy="360" r={r} stroke="currentColor" />
      ))}
    </svg>
  );
}
