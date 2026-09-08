/**
 * Single source of truth for building TaoFlow API URLs.
 *
 * `API_BASE_URL` is set by hand across several environments, so it arrives in
 * inconsistent shapes. All of these must resolve to the same endpoint:
 *
 *   https://api.prod.taoofflow.ai
 *   https://api.prod.taoofflow.ai/
 *   https://api.prod.taoofflow.ai/api
 *   https://api.prod.taoofflow.ai/api/
 *   https://api.prod.taoofflow.ai/api/v1
 *
 * We strip any trailing `/api` or `/api/v1` the value already carries, then
 * append the canonical `/api/v1` exactly once. Getting this wrong produces a
 * doubled `/api/api/v1` path, which the API answers with a 404 — and a 404 on
 * login is indistinguishable from a wrong password unless you inspect the URL.
 */

/** Normalize a raw base URL to its origin (plus any real sub-path). */
export function normalizeApiBase(rawBaseUrl: string): string {
  return rawBaseUrl
    .trim()
    .replace(/\/+$/, "")
    .replace(/\/api\/v1$/i, "")
    .replace(/\/api$/i, "");
}

/**
 * Build a full versioned API URL.
 *
 * @param rawBaseUrl the configured `API_BASE_URL`, in any accepted shape
 * @param path       endpoint path under `/api/v1`, e.g. "/auth/login"
 * @param search     optional query string, without the leading "?"
 */
export function buildApiUrl(
  rawBaseUrl: string,
  path: string,
  search?: string,
): string {
  const base = normalizeApiBase(rawBaseUrl);
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const query = search ? `?${search}` : "";

  return `${base}/api/v1${normalizedPath}${query}`;
}

/** Read and validate `API_BASE_URL` from the environment. */
export function apiBaseUrlFromEnv(): string {
  const base = process.env.API_BASE_URL;

  if (!base || !base.trim()) {
    throw new Error(
      "API_BASE_URL is not set. Point it at the TaoFlow API origin, e.g. https://api.prod.taoofflow.ai",
    );
  }

  return base;
}
