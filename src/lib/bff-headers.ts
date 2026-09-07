/**
 * Pure header-building for the BFF layer. No framework imports so it's unit
 * testable. Builds the outbound headers for a server-to-server call to the
 * NestJS API: the user's JWT plus the static admin API key.
 *
 * SECURITY: `x-admin-api-key` is server-only. It is added here, on the server,
 * and must never be echoed back to the browser.
 */
export function buildApiHeaders(input: {
  accessToken: string;
  adminApiKey: string | undefined;
  extra?: Record<string, string>;
}): Headers {
  const headers = new Headers(input.extra);
  headers.set("Authorization", `Bearer ${input.accessToken}`);
  headers.set("Accept", "application/json");
  if (input.adminApiKey) {
    headers.set("x-admin-api-key", input.adminApiKey);
  }
  return headers;
}

/** Header names that must never be forwarded from the API back to the client. */
export const SENSITIVE_RESPONSE_HEADERS = [
  "x-admin-api-key",
  "authorization",
  "set-cookie",
];

/**
 * Filter a response header set so no secret leaks back to the browser. Returns
 * a plain object of the headers that are safe to forward.
 */
export function safeResponseHeaders(
  headers: Iterable<[string, string]>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of headers) {
    if (!SENSITIVE_RESPONSE_HEADERS.includes(key.toLowerCase())) {
      out[key] = value;
    }
  }
  return out;
}
