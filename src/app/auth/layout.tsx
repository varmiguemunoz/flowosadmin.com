import type { ReactNode } from "react";

/**
 * Operator control-desk shell for the /auth/* surface. A narrow signal rail on
 * the left (slate, wordmark + status + ambient signal motif), the sign-in panel
 * on the right, left-aligned. On mobile the rail collapses to a slim top bar.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh grid-rows-[auto_1fr] lg:grid-cols-[minmax(320px,38%)_1fr] lg:grid-rows-1">
      <SignalRail />
      <main className="flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}

function SignalRail() {
  return (
    <aside className="relative overflow-hidden border-line bg-surface max-lg:border-b lg:border-r">
      {/* Ambient signal motif — hairline flow lines, decorative but derived
          from the "flow" in TaoFlow. Hidden from assistive tech. */}
      <SignalMotif />

      <div className="relative flex h-full flex-col justify-between gap-8 p-6 sm:p-8 lg:p-10">
        <div className="flex items-center gap-2.5">
          <FlowMark />
          <span className="text-sm font-semibold tracking-tight text-ink">
            TaoFlow{" "}
            <span className="font-normal text-ink-muted">Admin</span>
          </span>
        </div>

        <div className="hidden lg:block">
          <p className="microlabel mb-2">Consola restringida</p>
          <p className="max-w-[24ch] text-sm leading-relaxed text-ink-muted">
            Panel de administración de TaoFlow. Acceso limitado al equipo
            autorizado.
          </p>
        </div>
      </div>
    </aside>
  );
}

/** Small drawn wordmark glyph — concentric flow arc, one teal signal stroke. */
function FlowMark() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <circle cx="11" cy="11" r="9.25" stroke="var(--color-line-strong)" />
      <path
        d="M4.5 13.2c2.4-3.6 4.6-3.6 6.5 0s4.1 3.6 6.5 0"
        stroke="var(--color-signal)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Faint concentric flow lines low on the rail. Decorative geometry only. */
function SignalMotif() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute -bottom-24 -left-16 h-[420px] w-[420px] text-line lg:opacity-100 opacity-40"
      viewBox="0 0 420 420"
      fill="none"
    >
      {[70, 120, 170, 220].map((r) => (
        <circle key={r} cx="120" cy="300" r={r} stroke="currentColor" />
      ))}
      <path
        d="M-20 300c80-70 160-70 240 0s160 70 240 0"
        stroke="var(--color-signal-dim)"
        strokeWidth="1"
        opacity="0.5"
      />
    </svg>
  );
}
