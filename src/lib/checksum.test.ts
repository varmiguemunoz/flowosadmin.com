import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";

import { sha256Hex, toHex } from "./checksum.ts";

test("toHex zero-pads single-digit bytes", () => {
  // Without padStart, byte 0x0a would render as "a" and shift every following
  // character, producing a digest the server would never match.
  const buffer = new Uint8Array([0, 10, 15, 255]).buffer;
  assert.equal(toHex(buffer), "000a0fff");
});

test("sha256Hex matches Node's own digest of the same bytes", async () => {
  // The API computes the checksum with createHash('sha256') on the buffer, so
  // the browser digest has to agree byte for byte or dedupe silently breaks.
  const content = "the body settles before the mind does";
  const expected = createHash("sha256").update(content).digest("hex");

  assert.equal(await sha256Hex(new Blob([content])), expected);
});

test("sha256Hex handles binary content", async () => {
  const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37]);
  const expected = createHash("sha256").update(bytes).digest("hex");

  assert.equal(await sha256Hex(new Blob([bytes])), expected);
});

test("sha256Hex handles an empty file", async () => {
  const expected = createHash("sha256").update("").digest("hex");
  assert.equal(await sha256Hex(new Blob([])), expected);
});

test("sha256Hex returns 64 lowercase hex characters", async () => {
  // The API validates the field against /^[a-f0-9]{64}$/, so an uppercase or
  // truncated digest would be rejected before it reached the dedupe check.
  const digest = await sha256Hex(new Blob(["anything"]));

  assert.match(digest, /^[a-f0-9]{64}$/);
});
