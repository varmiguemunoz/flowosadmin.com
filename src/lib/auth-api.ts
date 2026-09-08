import "server-only";

import { apiBaseUrlFromEnv, buildApiUrl } from "@/lib/api-url";
import { normalizeAuthPayload, type AuthResult } from "@/lib/auth-normalize";

/**
 * Thin client for the TaoFlow NestJS auth API (`${API_BASE_URL}/api/v1/auth/*`).
 *
 * This module is the single place that knows how to reach the API's auth
 * endpoints. Response shaping lives in `auth-normalize.ts`; if the real
 * contract differs (field names, envelope shape, token expiry units), change
 * it in those two files and nothing else in the auth layer needs to move.
 */

export type { AuthResult };

/** Outcome of an auth call, carrying the API's own message when it fails. */
export type AuthApiResult =
  | { ok: true; data: Record<string, unknown> | null }
  | { ok: false; status: number; message: string };

/**
 * Pull a human-readable message out of an API error body. NestJS returns
 * `message` as either a string or an array of validation strings, so both are
 * handled; anything else falls back to the HTTP status text.
 */
function extractApiMessage(body: unknown, fallback: string): string {
  if (!body || typeof body !== "object") {
    return fallback;
  }

  const message = (body as { message?: unknown }).message;

  if (typeof message === "string" && message.trim()) {
    return message;
  }

  if (Array.isArray(message)) {
    const joined = message.filter((m) => typeof m === "string").join(" ");
    if (joined.trim()) return joined;
  }

  const error = (body as { error?: unknown }).error;
  if (typeof error === "string" && error.trim()) {
    return error;
  }

  return fallback;
}

async function postJson(
  path: string,
  body: Record<string, unknown>,
): Promise<AuthApiResult> {
  const url = buildApiUrl(apiBaseUrlFromEnv(), path);

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      // Auth requests must never be cached.
      cache: "no-store",
    });
  } catch (cause) {
    // DNS failure, refused connection, TLS error — the API was never reached.
    console.error(`[auth-api] Could not reach ${url}`, cause);
    return {
      ok: false,
      status: 0,
      message: "Could not reach the authentication service.",
    };
  }

  const payload = (await res.json().catch(() => null)) as
    | Record<string, unknown>
    | null;

  if (!res.ok) {
    const message = extractApiMessage(
      payload,
      res.statusText || `Request failed with status ${res.status}`,
    );

    // Logged server-side so a routing mistake is visible in the terminal
    // instead of surfacing as a generic credentials error.
    console.error(`[auth-api] ${res.status} from ${url}: ${message}`);

    return { ok: false, status: res.status, message };
  }

  return { ok: true, data: payload };
}

/**
 * Email/password login.
 *
 * Returns the API's own error message on failure so the caller can show the
 * real reason rather than a blanket "invalid credentials".
 */
export async function loginWithCredentials(
  email: string,
  password: string,
): Promise<
  { ok: true; result: AuthResult } | { ok: false; status: number; message: string }
> {
  const response = await postJson("/auth/login", { email, password });

  if (!response.ok) {
    return response;
  }

  const result = normalizeAuthPayload(response.data);

  if (!result) {
    // 2xx but the payload was not shaped as expected — a contract drift, not a
    // credentials problem. Surface it plainly instead of blaming the password.
    console.error(
      "[auth-api] Login succeeded but the response could not be normalized.",
      response.data,
    );
    return {
      ok: false,
      status: 200,
      message: "The authentication service returned an unexpected response.",
    };
  }

  return { ok: true, result };
}

/**
 * Refresh an expired access token. Returns null when refresh is rejected.
 *
 * The API's `RefreshTokenDto` requires the snake_case `refresh_token` field;
 * sending camelCase fails validation with a 400.
 */
export async function refreshAccessToken(
  refreshToken: string,
): Promise<AuthResult | null> {
  if (!refreshToken) return null;

  const response = await postJson("/auth/refresh-token", {
    refresh_token: refreshToken,
  });

  if (!response.ok) {
    return null;
  }

  const normalized = normalizeAuthPayload(response.data);
  // Some refresh endpoints don't re-send the refresh token; carry the old one
  // forward if a new one wasn't issued.
  if (normalized && !normalized.refreshToken) {
    normalized.refreshToken = refreshToken;
  }
  return normalized;
}

/** Request a password reset email. Returns true on a 2xx response. */
export async function requestPasswordReset(email: string): Promise<boolean> {
  const response = await postJson("/auth/forgot-password", { email });
  return response.ok;
}

/**
 * Complete a password reset. The API's `ResetPasswordDto` requires all three
 * fields, with the new password as snake_case `new_password`.
 *
 * Returns a message from the API when it rejects the request so the user can
 * tell an expired link apart from a weak password.
 */
export async function resetPassword(input: {
  email: string;
  token: string;
  newPassword: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const response = await postJson("/auth/reset-password", {
    email: input.email,
    token: input.token,
    new_password: input.newPassword,
  });

  if (response.ok) {
    return { ok: true };
  }

  return { ok: false, message: response.message };
}
