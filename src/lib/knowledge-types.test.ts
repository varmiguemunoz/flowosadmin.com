import assert from "node:assert/strict";
import { test } from "node:test";

import {
  formatBytes,
  formatDate,
  toDocumentItem,
  validateUploadFile,
  MAX_UPLOAD_BYTES,
  MAX_UPLOAD_MB,
  type ApiKnowledgeDocument,
} from "./knowledge-types.ts";

// All date assertions pin the time zone so they hold in CI regardless of the
// runner's locale.
const UTC = { timeZone: "UTC" };

test("formatBytes renders whole KB below a megabyte", () => {
  assert.equal(formatBytes(839680), "820 KB");
  assert.equal(formatBytes(552960), "540 KB");
});

test("formatBytes renders one decimal at megabyte scale", () => {
  assert.equal(formatBytes(1258291), "1.2 MB");
  assert.equal(formatBytes(4718592), "4.5 MB");
});

test("formatBytes renders bytes below a kilobyte", () => {
  assert.equal(formatBytes(512), "512 B");
  assert.equal(formatBytes(0), "0 B");
});

test("formatBytes degrades rather than printing NaN", () => {
  assert.equal(formatBytes(undefined), "Unknown size");
  assert.equal(formatBytes(null), "Unknown size");
  assert.equal(formatBytes(Number.NaN), "Unknown size");
  assert.equal(formatBytes(-1), "Unknown size");
});

test("formatDate omits the year within the current year", () => {
  const now = new Date("2026-09-07T12:00:00.000Z");
  assert.equal(
    formatDate("2026-09-02T09:30:00.000Z", { now, ...UTC }),
    "Sep 2",
  );
});

test("formatDate shows the year once it is ambiguous", () => {
  const now = new Date("2026-09-07T12:00:00.000Z");
  assert.equal(
    formatDate("2025-12-31T09:30:00.000Z", { now, ...UTC }),
    "Dec 31, 2025",
  );
});

test("formatDate degrades on missing or unparseable input", () => {
  assert.equal(formatDate(undefined), "Unknown date");
  assert.equal(formatDate(null), "Unknown date");
  assert.equal(formatDate(""), "Unknown date");
  assert.equal(formatDate("not a date"), "Unknown date");
});

function row(overrides: Partial<ApiKnowledgeDocument> = {}): ApiKnowledgeDocument {
  return {
    id: "doc-1",
    title: "Meditation fundamentals",
    original_filename: "meditation-fundamentals.pdf",
    file_size_bytes: 1258291,
    status: "indexed",
    created_at: "2026-09-02T12:00:00.000Z",
    ...overrides,
  };
}

test("toDocumentItem prefers the title", () => {
  const now = new Date("2026-09-07T12:00:00.000Z");
  const item = toDocumentItem(row(), { now, ...UTC });

  assert.deepEqual(item, {
    id: "doc-1",
    name: "Meditation fundamentals",
    size: "1.2 MB",
    uploadedAt: "Sep 2",
    status: "indexed",
    statusMessage: undefined,
  });
});

test("toDocumentItem falls back to the filename when the title is blank", () => {
  const item = toDocumentItem(row({ title: "   " }), UTC);
  assert.equal(item.name, "meditation-fundamentals.pdf");
});

test("toDocumentItem falls back again when both are missing", () => {
  const item = toDocumentItem(
    row({ title: null, original_filename: null }),
    UTC,
  );
  assert.equal(item.name, "Untitled document");
});

test("toDocumentItem carries a failure message through", () => {
  const item = toDocumentItem(
    row({ status: "failed", status_message: "Password protected PDF." }),
    UTC,
  );

  assert.equal(item.status, "failed");
  assert.equal(item.statusMessage, "Password protected PDF.");
});

test("toDocumentItem treats a blank status message as absent", () => {
  const item = toDocumentItem(row({ status_message: "  " }), UTC);
  assert.equal(item.statusMessage, undefined);
});

test("toDocumentItem preserves the pending state", () => {
  // A document sits in `pending` until the background indexer starts on it.
  // Reporting that as `processing` would overstate what the API is doing.
  const item = toDocumentItem(row({ status: "pending" }), UTC);
  assert.equal(item.status, "pending");
});

test("validateUploadFile accepts a normal PDF", () => {
  assert.equal(
    validateUploadFile({ name: "book.pdf", size: 1024, type: "application/pdf" }),
    null,
  );
});

test("validateUploadFile accepts a PDF by extension when type is blank", () => {
  // Some browsers/OSes hand over an empty MIME type for dragged files.
  assert.equal(
    validateUploadFile({ name: "book.PDF", size: 1024, type: "" }),
    null,
  );
});

test("validateUploadFile rejects non-PDF files", () => {
  assert.equal(
    validateUploadFile({ name: "notes.txt", size: 1024, type: "text/plain" }),
    "Only PDF files are allowed.",
  );
});

test("validateUploadFile rejects files over the size limit", () => {
  // Derived from the constant, not restated. Hardcoding the number here is
  // what let the message and the limit disagree the last time it changed.
  assert.equal(
    validateUploadFile({
      name: "big.pdf",
      size: MAX_UPLOAD_BYTES + 1,
      type: "application/pdf",
    }),
    `File exceeds the ${MAX_UPLOAD_MB} MB limit.`,
  );
});

test("validateUploadFile accepts a file exactly at the limit", () => {
  assert.equal(
    validateUploadFile({
      name: "exact.pdf",
      size: MAX_UPLOAD_BYTES,
      type: "application/pdf",
    }),
    null,
  );
});

test("validateUploadFile rejects an empty file", () => {
  assert.equal(
    validateUploadFile({ name: "empty.pdf", size: 0, type: "application/pdf" }),
    "File is empty.",
  );
});
