"use client";

import { useState } from "react";
import { FiFileText, FiX, FiInbox } from "react-icons/fi";

import { documentDownloadHref } from "@/lib/knowledge-api";
import type { DocumentItem, DocumentStatus } from "@/lib/knowledge-types";

export type { DocumentItem } from "@/lib/knowledge-types";

/**
 * Document grid. Each card is an anchor to the BFF download route, and reveals
 * a delete affordance on hover or keyboard focus.
 *
 * Delete is irreversible and cascades the document's indexed chunks, so the X
 * arms an inline confirmation inside the card rather than firing immediately.
 * That state is local to the card: the parent only needs to know which id is
 * currently being deleted.
 */

const statusTone: Record<
  DocumentStatus,
  { label: string; dot: string; text: string }
> = {
  indexed: { label: "Indexed", dot: "bg-signal", text: "text-ink-muted" },
  processing: {
    label: "Processing",
    dot: "bg-warning",
    text: "text-ink-muted",
  },
  // The API parks a document here until the background indexer starts on it.
  pending: { label: "Pending", dot: "bg-warning", text: "text-ink-muted" },
  failed: { label: "Failed", dot: "bg-danger", text: "text-danger" },
};

export interface DocumentGridProps {
  documents: DocumentItem[];
  onDelete: (id: string) => void;
  /** Id of the document whose delete request is in flight, if any. */
  deletingId?: string | null;
}

export function DocumentGrid({
  documents,
  onDelete,
  deletingId,
}: DocumentGridProps) {
  if (documents.length === 0) {
    return <EmptyState />;
  }

  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {documents.map((doc) => (
        <li key={doc.id} className="min-w-0">
          <DocumentCard
            doc={doc}
            onDelete={onDelete}
            deleting={deletingId === doc.id}
          />
        </li>
      ))}
    </ul>
  );
}

function DocumentCard({
  doc,
  onDelete,
  deleting,
}: {
  doc: DocumentItem;
  onDelete: (id: string) => void;
  deleting: boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  const status = statusTone[doc.status] ?? null;

  function confirmDelete() {
    setConfirming(false);
    onDelete(doc.id);
  }

  return (
    <div className="group relative min-w-0">
      {/* Delete affordance — hidden until hover or keyboard focus. */}
      {!confirming && !deleting ? (
        <button
          type="button"
          aria-label={`Delete ${doc.name}`}
          className="absolute right-2 top-2 z-10 grid size-7 place-items-center rounded-full border border-line-strong bg-surface-raised text-ink-muted opacity-0 transition-[opacity,color,border-color] duration-150 hover:border-danger/50 hover:text-danger focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/70 group-hover:opacity-100"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setConfirming(true);
          }}
        >
          <FiX className="size-4" aria-hidden="true" />
        </button>
      ) : null}

      {/* Card body — a real anchor, so the download is keyboard operable and
          right-click-saveable without any JavaScript. */}
      <a
        href={documentDownloadHref(doc.id)}
        download
        aria-label={`Download ${doc.name}`}
        className={
          "flex w-full min-w-0 flex-col gap-4 rounded-2xl border border-line bg-surface p-4 text-left transition-colors duration-150 hover:border-line-strong hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/70 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas " +
          (deleting ? "pointer-events-none opacity-50" : "")
        }
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
            title={doc.statusMessage}
          >
            <span
              aria-hidden="true"
              className={`size-1.5 shrink-0 rounded-full ${status.dot}`}
            />
            {deleting ? "Deleting…" : status.label}
          </span>
        ) : null}
      </a>

      {confirming ? (
        <ConfirmDeleteOverlay
          name={doc.name}
          onConfirm={confirmDelete}
          onCancel={() => setConfirming(false)}
        />
      ) : null}
    </div>
  );
}

/**
 * Covers the card while the operator decides. Deleting a document also destroys
 * its embeddings, and re-uploading means re-indexing, so a stray click on a
 * small X should not be enough to trigger it.
 */
function ConfirmDeleteOverlay({
  name,
  onConfirm,
  onCancel,
}: {
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      role="group"
      aria-label={`Confirm deleting ${name}`}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          onCancel();
        }
      }}
      className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 rounded-2xl border border-danger/40 bg-surface-raised p-4 text-center"
    >
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-ink">Delete this document?</p>
        <p className="text-xs text-ink-faint">
          Its indexed chunks are removed too.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="h-8 rounded-[var(--radius-control)] border border-line-strong px-3 text-xs text-ink-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/70"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          autoFocus
          className="h-8 rounded-[var(--radius-control)] border border-danger/50 px-3 text-xs text-danger transition-colors hover:bg-danger/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/70"
        >
          Delete
        </button>
      </div>
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
