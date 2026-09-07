import test from "node:test";
import assert from "node:assert/strict";

import {
  normalizeAuthPayload,
  isAccessTokenValid,
  DEFAULT_ACCESS_TOKEN_TTL_MS,
  REFRESH_SKEW_MS,
} from "./auth-normalize.ts";

const NOW = 1_700_000_000_000;

test("normalizeAuthPayload maps camelCase login response", () => {
  const result = normalizeAuthPayload(
    {
      accessToken: "acc",
      refreshToken: "ref",
      expiresIn: 900,
      user: { id: "u1", email: "a@b.com", name: "Ada", role: "admin" },
    },
    NOW,
  );
  assert.ok(result);
  assert.equal(result.accessToken, "acc");
  assert.equal(result.refreshToken, "ref");
  assert.equal(result.user.id, "u1");
  assert.equal(result.user.email, "a@b.com");
  assert.equal(result.user.role, "admin");
  assert.equal(result.accessTokenExpires, NOW + 900 * 1000);
});

test("normalizeAuthPayload maps snake_case variants", () => {
  const result = normalizeAuthPayload(
    {
      access_token: "acc",
      refresh_token: "ref",
      expires_in: 60,
      profile: { userId: "u2", email: "c@d.com" },
    },
    NOW,
  );
  assert.ok(result);
  assert.equal(result.accessToken, "acc");
  assert.equal(result.user.id, "u2");
  assert.equal(result.accessTokenExpires, NOW + 60 * 1000);
});

test("normalizeAuthPayload uses default TTL when expiry omitted", () => {
  const result = normalizeAuthPayload(
    { token: "acc", user: { id: "u3", email: "e@f.com" } },
    NOW,
  );
  assert.ok(result);
  assert.equal(result.accessTokenExpires, NOW + DEFAULT_ACCESS_TOKEN_TTL_MS);
});

test("normalizeAuthPayload returns null without access token", () => {
  assert.equal(
    normalizeAuthPayload({ user: { id: "u4", email: "x@y.com" } }, NOW),
    null,
  );
});

test("normalizeAuthPayload returns null without user id", () => {
  assert.equal(normalizeAuthPayload({ accessToken: "acc" }, NOW), null);
});

test("normalizeAuthPayload returns null for null/undefined input", () => {
  assert.equal(normalizeAuthPayload(null, NOW), null);
  assert.equal(normalizeAuthPayload(undefined, NOW), null);
});

test("isAccessTokenValid: valid token far from expiry", () => {
  assert.equal(isAccessTokenValid(NOW + 10 * 60 * 1000, NOW), true);
});

test("isAccessTokenValid: token within skew window needs refresh", () => {
  assert.equal(isAccessTokenValid(NOW + REFRESH_SKEW_MS - 1, NOW), false);
});

test("isAccessTokenValid: expired token needs refresh", () => {
  assert.equal(isAccessTokenValid(NOW - 1000, NOW), false);
});

test("isAccessTokenValid: missing expiry needs refresh", () => {
  assert.equal(isAccessTokenValid(undefined, NOW), false);
  assert.equal(isAccessTokenValid(0, NOW), false);
});
