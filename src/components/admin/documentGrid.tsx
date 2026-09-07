"use client";

import { FiFileText, FiX, FiInbox } from "react-icons/fi";

/**
 * Document grid — DESIGN-ONLY. Renders placeholder documents in operator-world
 * cards. Each card downloads on click and reveals a delete affordance on hover
 * or keyboard focus. No real download or delete happens yet; wire to the BFF
 * later.
 */
export interface DocumentItem {
  id: string;
  name: string;
  /** Human-readable size, e.g. "1.2 MB". */
  size: string;
  /** ISO date or preformatted label. */
  uploadedAt: string;
  status?: "indexed" | "processing" | "failed";
}

const statusTone: Record<
  NonNullable<DocumentItem["status"]>,
  { label: string; dot: string; text: string }
> = {
  indexed: { label: "Indexed", dot: "bg-signal", text: "text-ink-muted" },
  processing: {
    label: "Processing",
    dot: "bg-warning",
    text: "text-ink-muted",
  },
  failed: { label: "Failed", dot: "bg-danger", text: "text-danger" },
};

export function DocumentGrid({ documents }: { documents: DocumentItem[] }) {
  if (documents.length === 0) {
    return <EmptyState />;
  }

  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {documents.map((doc) => (
        <li key={doc.id} className="min-w-0">
          <DocumentCard doc={doc} />
        </li>
      ))}
    </ul>
  );
}

function DocumentCard({ doc }: { doc: DocumentItem }) {
  const status = doc.status ? statusTone[doc.status] : null;

  return (
    <div className="group relative min-w-0">
      {/* Delete affordance — hidden until hover or keyboard focus. */}
      <button
        type="button"
        aria-label={`Delete ${doc.name}`}
        className="absolute right-2 top-2 z-10 grid size-7 place-items-center rounded-full border border-line-strong bg-surface-raised text-ink-muted opacity-0 transition-[opacity,color,border-color] duration-150 hover:border-danger/50 hover:text-danger focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/70 group-hover:opacity-100"
        onClick={(e) => {
          e.stopPropagation();
          // Design-only: delete is not wired yet.
        }}
      >
        <FiX className="size-4" aria-hidden="true" />
      </button>

      {/* Card body — click downloads (design-only). A real link/handler wires
          the download later; button keeps it keyboard-operable now. */}
      <button
        type="button"
        aria-label={`Download ${doc.name}`}
        className="flex w-full min-w-0 flex-col gap-4 rounded-2xl border border-line bg-surface p-4 text-left transition-colors duration-150 hover:border-line-strong hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/70 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
      >
        <span
          aria-hidden="true"
          className="grid size-10 place-items-center rounded-xl border border-line-strong text-ink-muted transition-colors duration-150 group-hover:text-signal"
        >
          <FiFileText className="size-5" />
        </span>

        <div className="flex w-full min-w-0 flex-col gap-1">
          <span
            className="line-clamp-2 w-full pr-6 text-sm font-medium break-words text-ink"
            title={doc.name}
          >
            {doc.name}
          </span>
          <span className="font-mono text-[0.6875rem] tracking-wide text-ink-faint tabular">
            {doc.size} · {doc.uploadedAt}
          </span>
        </div>

        {status ? (
          <span
            className={`flex w-fit items-center gap-2 text-xs ${status.text}`}
          >
            <span
              aria-hidden="true"
              className={`size-1.5 shrink-0 rounded-full ${status.dot}`}
            />
            {status.label}
          </span>
        ) : null}
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-line py-16 text-center">
      <span
        aria-hidden="true"
        className="grid size-11 place-items-center rounded-full border border-line-strong text-ink-faint"
      >
        <FiInbox className="size-5" />
      </span>
      <p className="text-sm text-ink-muted">No documents yet</p>
      <p className="max-w-xs text-xs text-ink-faint">
        Uploaded documents will appear here once you add them above.
      </p>
    </div>
  );
}
