import test from "node:test";
import assert from "node:assert/strict";

import { PROXY_MATCHER, proxyMatches } from "./proxy-matcher.ts";

/**
 * The comment in proxy-matcher.ts says the constant is a hand-kept mirror of
 * the real matcher. Nothing enforced that, so this compiles the pattern and
 * checks the helper agrees with it — otherwise the mirror can drift and every
 * assertion below becomes meaningless.
 */
test("the helper agrees with the compiled matcher pattern", () => {
  const compiled = new RegExp(`^${PROXY_MATCHER}$`);
  const paths = [
    "/",
    "/admin",
    "/admin/dashboard",
    "/auth/login",
    "/403",
    "/apiary",
    "/api",
    "/api/auth/session",
    "/api/bff/knowledge/documents",
    "/_next/static/chunk.js",
    "/favicon.ico",
    "/logo.png",
  ];

  for (const path of paths) {
    assert.equal(
      compiled.test(path),
      proxyMatches(path),
      `mirror disagrees with the real pattern for ${path}`,
    );
  }
});

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

test("proxy never runs on API routes", () => {
  // The proxy answers an unauthenticated request with a redirect to
  // /auth/login. `fetch` follows redirects, so an API caller would get the
  // login page as 200 HTML and die on res.json() with "Unexpected token '<'".
  assert.equal(proxyMatches("/api/bff/knowledge/documents"), false);
  assert.equal(proxyMatches("/api"), false);
});

test("proxy never runs on the Auth.js session endpoint", () => {
  // Especially not this one: /api/auth/session is how the client discovers
  // whether it has a session. Gating it behind having one deadlocks the client,
  // which then never resolves its own auth state.
  assert.equal(proxyMatches("/api/auth/session"), false);
  assert.equal(proxyMatches("/api/auth/callback/credentials"), false);
});

test("a path merely starting with the letters 'api' is not excluded", () => {
  // The exclusion is the `/api` segment, not the prefix — /apiary is a page.
  assert.equal(proxyMatches("/apiary"), true);
});
