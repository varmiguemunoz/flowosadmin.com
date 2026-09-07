"use client";

import { FiLogOut } from "react-icons/fi";

/**
 * Admin top bar — persists across the whole /admin area.
 *
 * DESIGN-ONLY for now: the user identity is a placeholder and the logout
 * button has no handler yet. Wire `user` from the session and `onLogout` to
 * NextAuth `signOut` later.
 */
export interface AdminUser {
  name: string;
}

const PLACEHOLDER_USER: AdminUser = { name: "Ada Lovelace" };

function initialOf(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
}

export function AdminNavbar({ user = PLACEHOLDER_USER }: { user?: AdminUser }) {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-canvas/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <div className="flex items-center gap-2.5">
          <FlowMark />
          <span className="text-sm font-semibold tracking-tight text-ink">
            TaoFlow <span className="font-normal text-ink-muted">Admin</span>
          </span>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="grid size-8 place-items-center rounded-full bg-signal text-sm font-semibold text-on-signal"
            >
              {initialOf(user.name)}
            </span>
            <span className="hidden text-sm text-ink sm:inline">
              {user.name}
            </span>
          </div>

          <span aria-hidden="true" className="h-5 w-px bg-line" />

          <button
            type="button"
            aria-label="Log out"
            className="inline-flex h-9 items-center gap-2 rounded-[var(--radius-control)] px-2.5 text-sm text-ink-muted transition-colors hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/70 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas sm:px-3"
          >
            <FiLogOut className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </div>
      </div>
    </header>
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
