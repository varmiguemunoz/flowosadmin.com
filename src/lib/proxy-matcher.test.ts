import test from "node:test";
import assert from "node:assert/strict";

import { proxyMatches } from "./proxy-matcher.ts";

test("proxy runs on app pages", () => {
  assert.equal(proxyMatches("/"), true);
  assert.equal(proxyMatches("/auth/login"), true);
  assert.equal(proxyMatches("/admin/dashboard"), true);
  assert.equal(proxyMatches("/403"), true);
});

test("proxy skips Next internals", () => {
  assert.equal(proxyMatches("/_next/static/chunk.js"), false);
  assert.equal(proxyMatches("/_next/image"), false);
});

test("proxy skips metadata files", () => {
  assert.equal(proxyMatches("/favicon.ico"), false);
  assert.equal(proxyMatches("/robots.txt"), false);
  assert.equal(proxyMatches("/sitemap.xml"), false);
});

test("proxy skips static asset extensions", () => {
  assert.equal(proxyMatches("/logo.png"), false);
  assert.equal(proxyMatches("/styles/app.css"), false);
  assert.equal(proxyMatches("/assets/hero.webp"), false);
});

test("proxy still runs on API auth routes", () => {
  assert.equal(proxyMatches("/api/auth/session"), true);
});
