import test from "node:test";
import assert from "node:assert/strict";

import { buildApiUrl, normalizeApiBase } from "./api-url.ts";

const EXPECTED = "https://api.prod.taoofflow.ai/api/v1/auth/login";

test("buildApiUrl: bare origin", () => {
  assert.equal(
    buildApiUrl("https://api.prod.taoofflow.ai", "/auth/login"),
    EXPECTED,
  );
});

test("buildApiUrl: origin with trailing slash", () => {
  assert.equal(
    buildApiUrl("https://api.prod.taoofflow.ai/", "/auth/login"),
    EXPECTED,
  );
});

test("buildApiUrl: origin already ending in /api (the production value)", () => {
  assert.equal(
    buildApiUrl("https://api.prod.taoofflow.ai/api", "/auth/login"),
    EXPECTED,
  );
});

test("buildApiUrl: origin ending in /api/", () => {
  assert.equal(
    buildApiUrl("https://api.prod.taoofflow.ai/api/", "/auth/login"),
    EXPECTED,
  );
});

test("buildApiUrl: origin already ending in /api/v1", () => {
  assert.equal(
    buildApiUrl("https://api.prod.taoofflow.ai/api/v1", "/auth/login"),
    EXPECTED,
  );
});

test("buildApiUrl: surrounding whitespace is tolerated", () => {
  assert.equal(
    buildApiUrl("  https://api.prod.taoofflow.ai/api  ", "/auth/login"),
    EXPECTED,
  );
});

test("buildApiUrl: never produces a doubled /api segment", () => {
  const url = buildApiUrl("https://api.prod.taoofflow.ai/api", "/auth/login");
  assert.equal(url.includes("/api/api"), false);
});

test("buildApiUrl: path without a leading slash still works", () => {
  assert.equal(
    buildApiUrl("https://api.prod.taoofflow.ai/api", "auth/login"),
    EXPECTED,
  );
});

test("buildApiUrl: appends a query string", () => {
  assert.equal(
    buildApiUrl("https://api.prod.taoofflow.ai/api", "/knowledge/documents", "page=1&limit=20"),
    "https://api.prod.taoofflow.ai/api/v1/knowledge/documents?page=1&limit=20",
  );
});

test("buildApiUrl: omits the question mark when there is no query", () => {
  assert.equal(
    buildApiUrl("https://api.prod.taoofflow.ai/api", "/knowledge/documents"),
    "https://api.prod.taoofflow.ai/api/v1/knowledge/documents",
  );
});

test("buildApiUrl: localhost with a port", () => {
  assert.equal(
    buildApiUrl("http://localhost:3000", "/auth/login"),
    "http://localhost:3000/api/v1/auth/login",
  );
});

test("normalizeApiBase: keeps a genuine sub-path that is not /api", () => {
  assert.equal(
    normalizeApiBase("https://example.com/taoflow"),
    "https://example.com/taoflow",
  );
});

test("normalizeApiBase: only strips /api at the end, not in the middle", () => {
  assert.equal(
    normalizeApiBase("https://api.prod.taoofflow.ai"),
    "https://api.prod.taoofflow.ai",
  );
});
