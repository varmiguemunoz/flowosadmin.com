/**
 * Pure, side-effect-free auth helpers shared by the auth API client and the
 * NextAuth callbacks. No `server-only`, no network — safe to unit test.
 */

/** Default access-token lifetime (ms) used when the API omits an expiry. */
export const DEFAULT_ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes

/** Refresh a little before actual expiry to avoid edge races. */
export const REFRESH_SKEW_MS = 30 * 1000;

/** Normalized auth result shared across login / google / refresh. */
export interface AuthResult {
  user: {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    role?: string | null;
  };
  accessToken: string;
  refreshToken: string;
  /** Epoch milliseconds. */
  accessTokenExpires: number;
}

/**
 * Best-effort normalization of an API auth payload into {@link AuthResult}.
 * Accepts common field-name variants so a minor API difference doesn't break
 * auth silently. Returns null when the essential fields are missing.
 *
 * @param now injectable clock for deterministic tests (defaults to Date.now).
 */
export function normalizeAuthPayload(
  data: Record<string, unknown> | null | undefined,
  now: number = Date.now(),
): AuthResult | null {
  if (!data) return null;

  const accessToken =
    (data.accessToken as string) ??
    (data.access_token as string) ??
    (data.token as string);
  const refreshToken =
    (data.refreshToken as string) ?? (data.refresh_token as string) ?? "";

  const rawUser = (data.user ?? data.profile ?? {}) as Record<string, unknown>;
  const id =
    (rawUser.id as string) ??
    (rawUser.userId as string) ??
    (rawUser.sub as string) ??
    (data.userId as string) ??
    "";
  const email = (rawUser.email as string) ?? (data.email as string) ?? "";

  if (!accessToken || !id) {
    return null;
  }

  const expiresInSeconds =
    (data.expiresIn as number) ?? (data.expires_in as number) ?? undefined;
  const accessTokenExpires =
    typeof expiresInSeconds === "number"
      ? now + expiresInSeconds * 1000
      : now + DEFAULT_ACCESS_TOKEN_TTL_MS;

  return {
    user: {
      id,
      email,
      name: (rawUser.name as string) ?? (rawUser.fullName as string) ?? null,
      image: (rawUser.image as string) ?? (rawUser.avatarUrl as string) ?? null,
      role: (rawUser.role as string) ?? null,
    },
    accessToken,
    refreshToken,
    accessTokenExpires,
  };
}

/**
 * Decide whether an access token is still usable (not within the refresh skew
 * of its expiry). A missing/zero expiry is treated as needing refresh.
 */
export function isAccessTokenValid(
  accessTokenExpires: number | undefined,
  now: number = Date.now(),
): boolean {
  if (!accessTokenExpires) return false;
  return now < accessTokenExpires - REFRESH_SKEW_MS;
}
