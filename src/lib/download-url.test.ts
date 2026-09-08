import assert from "node:assert/strict";
import { test } from "node:test";

import { withDownloadParam } from "./download-url.ts";

const SIGNED =
  "https://proj.supabase.co/storage/v1/object/sign/knowledge/documents/abc/book.pdf?token=eyJhbGc";

test("adds the download parameter", () => {
  const url = new URL(withDownloadParam(SIGNED, "book.pdf"));
  assert.equal(url.searchParams.get("download"), "book.pdf");
});

test("preserves the signing token", () => {
  // Dropping the token would turn every download into a 401 from storage.
  const url = new URL(withDownloadParam(SIGNED, "book.pdf"));
  assert.equal(url.searchParams.get("token"), "eyJhbGc");
});

test("escapes spaces and accents in the filename", () => {
  const url = withDownloadParam(SIGNED, "meditación guiada.pdf");

  assert.ok(url.includes("download=medita"));
  assert.ok(!url.includes(" "));
  // Round-trips back to the original name.
  assert.equal(
    new URL(url).searchParams.get("download"),
    "meditación guiada.pdf",
  );
});

test("overwrites an existing download parameter rather than duplicating it", () => {
  const withExisting = `${SIGNED}&download=old.pdf`;
  const url = new URL(withDownloadParam(withExisting, "new.pdf"));

  assert.deepEqual(url.searchParams.getAll("download"), ["new.pdf"]);
});

test("throws on a value that is not a URL", () => {
  assert.throws(() => withDownloadParam("not a url", "book.pdf"));
});
