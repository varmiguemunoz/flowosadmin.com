import test from "node:test";
import assert from "node:assert/strict";

import {
  buildApiHeaders,
  safeResponseHeaders,
  SENSITIVE_RESPONSE_HEADERS,
} from "./bff-headers.ts";

test("buildApiHeaders sets Bearer token and admin key", () => {
  const h = buildApiHeaders({
    accessToken: "tok123",
    adminApiKey: "secret-key",
  });
  assert.equal(h.get("authorization"), "Bearer tok123");
  assert.equal(h.get("x-admin-api-key"), "secret-key");
  assert.equal(h.get("accept"), "application/json");
});

test("buildApiHeaders omits admin key header when key is undefined", () => {
  const h = buildApiHeaders({ accessToken: "tok", adminApiKey: undefined });
  assert.equal(h.has("x-admin-api-key"), false);
  assert.equal(h.get("authorization"), "Bearer tok");
});

test("buildApiHeaders merges extra headers", () => {
  const h = buildApiHeaders({
    accessToken: "tok",
    adminApiKey: "k",
    extra: { "x-request-id": "abc" },
  });
  assert.equal(h.get("x-request-id"), "abc");
});

test("safeResponseHeaders strips all sensitive headers", () => {
  const entries: [string, string][] = [
    ["content-type", "application/json"],
    ["x-admin-api-key", "secret-key"],
    ["Authorization", "Bearer leak"],
    ["Set-Cookie", "session=leak"],
    ["x-total-count", "42"],
  ];
  const safe = safeResponseHeaders(entries);
  assert.equal(safe["content-type"], "application/json");
  assert.equal(safe["x-total-count"], "42");
  // No secret survives, regardless of casing.
  for (const key of Object.keys(safe)) {
    assert.ok(
      !SENSITIVE_RESPONSE_HEADERS.includes(key.toLowerCase()),
      `leaked ${key}`,
    );
  }
  assert.equal(JSON.stringify(safe).includes("secret-key"), false);
  assert.equal(JSON.stringify(safe).includes("leak"), false);
});
