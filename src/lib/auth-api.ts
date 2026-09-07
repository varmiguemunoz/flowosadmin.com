import "server-only";

import { normalizeAuthPayload, type AuthResult } from "@/lib/auth-normalize";

/**
 * Thin client for the TaoFlow NestJS auth API (`${API_BASE_URL}/api/v1/auth/*`).
 *
 * This module is the single place that knows how to reach the API's auth
 * endpoints. Response shaping lives in `auth-normalize.ts`; if the real
 * contract differs (field names, the Google exchange payload, token expiry
 * units), change it in those two files and nothing else in the auth layer
 * needs to move.
 */

export type { AuthResult };

function apiBaseUrl(): string {
  const base = process.env.API_BASE_URL;
  if (!base) {
    throw new Error("API_BASE_URL is not set");
  }
  return base.replace(/\/$/, "");
}

async function postJson(
  path: string,
  body: Record<string, unknown>,
): Promise<Record<string, unknown> | null> {
  const res = await fetch(`${apiBaseUrl()}/api/v1${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
    // Auth requests must never be cached.
    cache: "no-store",
  });

  if (!res.ok) {
    return null;
  }
  return (await res.json().catch(() => null)) as Record<string, unknown> | null;
}

/** Email/password login → normalized tokens + user, or null on failure. */
export async function loginWithCredentials(
  email: string,
  password: string,
): Promise<AuthResult | null> {
  const data = await postJson("/auth/login", { email, password });
  return normalizeAuthPayload(data);
}

/**
 * Exchange a Google identity for the API's own tokens.
 *
 * ISOLATED EXCHANGE POINT: we send Google's `idToken` (and `accessToken` when
 * present) to `POST /api/v1/auth/google`. If the API expects a different
 * payload, adjust the body below only.
 */
export async function exchangeGoogleToken(input: {
  idToken?: string;
  accessToken?: string;
  email?: string | null;
}): Promise<AuthResult | null> {
  const data = await postJson("/auth/google", {
    idToken: input.idToken,
    accessToken: input.accessToken,
    email: input.email ?? undefined,
  });
  return normalizeAuthPayload(data);
}

/** Refresh an expired access token. Returns null when refresh is rejected. */
export async function refreshAccessToken(
  refreshToken: string,
): Promise<AuthResult | null> {
  if (!refreshToken) return null;
  const data = await postJson("/auth/refresh-token", { refreshToken });
  const normalized = normalizeAuthPayload(data);
  // Some refresh endpoints don't re-send the refresh token; carry the old one
  // forward if a new one wasn't issued.
  if (normalized && !normalized.refreshToken) {
    normalized.refreshToken = refreshToken;
  }
  return normalized;
}

/** Request a password reset email. Returns true on a 2xx response. */
export async function requestPasswordReset(email: string): Promise<boolean> {
  const res = await fetch(`${apiBaseUrl()}/api/v1/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
    cache: "no-store",
  });
  return res.ok;
}
