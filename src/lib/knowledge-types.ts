/**
 * Shapes returned by the NestJS knowledge endpoints, plus the pure mappers that
 * turn an API row into what the grid renders.
 *
 * Deliberately free of React and of `fetch` so the formatting rules can be unit
 * tested on their own. The grid consumes `DocumentItem`; nothing in the UI ever
 * touches an API row directly.
 */

/** Every API response is wrapped in this envelope. */
export interface ApiEnvelope<T> {
  status: number;
  message: string;
  data: T;
}

/**
 * The API has four states. Note the grid originally styled only three — a
 * freshly uploaded document sits in `pending` until the background indexer
 * picks it up, and collapsing that into `processing` would misreport it.
 */
export type DocumentStatus = "pending" | "processing" | "indexed" | "failed";

export interface ApiKnowledgeDocument {
  id: string;
  title?: string | null;
  description?: string | null;
  original_filename?: string | null;
  file_size_bytes?: number | null;
  status: DocumentStatus;
  status_message?: string | null;
  page_count?: number | null;
  chunk_count?: number | null;
  created_at?: string | null;
  indexed_at?: string | null;
}

export interface ApiKnowledgeDocumentPage {
  items: ApiKnowledgeDocument[];
  total: number;
  page: number;
  limit: number;
}

/** `GET /knowledge/documents/:id` adds a short-lived signed storage URL. */
export interface ApiKnowledgeDocumentDetail extends ApiKnowledgeDocument {
  download_url?: string;
}

/** Credential for uploading a file straight to storage, bypassing our server. */
export interface UploadTicket {
  documentId: string;
  signedUrl: string;
  storagePath: string;
  token: string;
}

/** What a document card renders. Presentation-ready: no parsing left to do. */
export interface DocumentItem {
  id: string;
  name: string;
  /** Human-readable size, e.g. "1.2 MB". */
  size: string;
  /** Short date label, e.g. "Sep 2". */
  uploadedAt: string;
  status: DocumentStatus;
  /** Why indexing failed, when the API tells us. */
  statusMessage?: string;
}

const KB = 1024;
const MB = KB * KB;

/**
 * Upload constraints, matched to the API's `KNOWLEDGE_MAX_FILE_SIZE_MB`.
 * Keep the two in step; the API is the one that actually enforces it.
 */
export const MAX_UPLOAD_MB = 50;
export const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * MB;
export const ACCEPTED_UPLOAD_TYPE = "application/pdf";

export interface FileValidationInput {
  name: string;
  size: number;
  type: string;
}

/**
 * Client-side pre-check before uploading. The API remains the source of truth;
 * this just avoids obviously-doomed requests and gives immediate feedback.
 * Returns an error message, or null when the file is acceptable.
 */
export function validateUploadFile(file: FileValidationInput): string | null {
  const isPdf =
    file.type === ACCEPTED_UPLOAD_TYPE ||
    file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) {
    return "Only PDF files are allowed.";
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    // Derived, not hardcoded — the message and the constant drifted apart once
    // already when the limit changed.
    return `File exceeds the ${MAX_UPLOAD_MB} MB limit.`;
  }
  if (file.size === 0) {
    return "File is empty.";
  }
  return null;
}

/**
 * Format a byte count the way the grid displays it: whole KB below a megabyte,
 * one decimal above. Uploads are capped at 25 MB by the API, so there is no GB
 * branch to write.
 */
export function formatBytes(bytes?: number | null): string {
  if (typeof bytes !== "number" || !Number.isFinite(bytes) || bytes < 0) {
    return "Unknown size";
  }
  if (bytes < KB) {
    return `${Math.round(bytes)} B`;
  }
  if (bytes < MB) {
    return `${Math.round(bytes / KB)} KB`;
  }
  return `${(bytes / MB).toFixed(1)} MB`;
}

export interface FormatDateOptions {
  /** Injectable clock so "is this the current year?" is testable. */
  now?: Date;
  /**
   * Defaults to the viewer's local zone, which is what an operator expects.
   * Tests pass "UTC" to stay deterministic wherever they run.
   */
  timeZone?: string;
}

/**
 * "Sep 2" for the current year, "Sep 2, 2025" otherwise — the year only earns
 * its space once it is ambiguous.
 */
export function formatDate(
  iso?: string | null,
  { now = new Date(), timeZone }: FormatDateOptions = {},
): string {
  if (!iso) {
    return "Unknown date";
  }

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  const sameYear = date.getFullYear() === now.getFullYear();

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
    ...(timeZone ? { timeZone } : {}),
  }).format(date);
}

/**
 * Map one API row onto a card.
 *
 * `title` is what the uploader typed and `original_filename` is what the file
 * was called; the API defaults the former to the latter, but an empty string
 * would slip past a `??` check, so we fall through on any blank value.
 */
export function toDocumentItem(
  row: ApiKnowledgeDocument,
  options?: FormatDateOptions,
): DocumentItem {
  const name =
    row.title?.trim() || row.original_filename?.trim() || "Untitled document";

  return {
    id: row.id,
    name,
    size: formatBytes(row.file_size_bytes),
    uploadedAt: formatDate(row.created_at, options),
    status: row.status,
    statusMessage: row.status_message?.trim() || undefined,
  };
}
