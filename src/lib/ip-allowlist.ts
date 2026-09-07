/**
 * Pure IP allowlist helpers for the Proxy layer. No framework imports so the
 * logic is unit-testable in isolation.
 *
 * On Vercel the client IP arrives in the `x-forwarded-for` header (a
 * comma-separated chain; the left-most entry is the original client), with
 * `x-real-ip` as a fallback. `request.ip` was removed from NextRequest.
 */

/** Parse a comma-separated allowlist env value into a normalized set. */
export function parseAllowedIps(raw: string | undefined | null): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((ip) => normalizeIp(ip))
    .filter((ip) => ip.length > 0);
}

/**
 * Normalize an IP for comparison: trim, lowercase (for IPv6 hex), and strip an
 * IPv4-mapped IPv6 prefix (`::ffff:203.0.113.1` → `203.0.113.1`).
 */
export function normalizeIp(ip: string): string {
  let out = ip.trim().toLowerCase();
  if (out.startsWith("::ffff:")) {
    out = out.slice("::ffff:".length);
  }
  return out;
}

/**
 * Extract the client IP from request headers, preferring the left-most entry
 * of `x-forwarded-for` and falling back to `x-real-ip`. Returns "" if neither
 * is present.
 */
export function clientIpFromHeaders(headers: {
  get(name: string): string | null;
}): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0];
    if (first) return normalizeIp(first);
  }
  const realIp = headers.get("x-real-ip");
  if (realIp) return normalizeIp(realIp);
  return "";
}

/**
 * Decide whether a request is allowed by the IP allowlist.
 *
 * Fail-open ONLY when the allowlist is empty (development convenience — see
 * `.env.example`). When the allowlist is non-empty, an unknown/empty client IP
 * is denied (fail-closed).
 */
export function isIpAllowed(clientIp: string, allowedIps: string[]): boolean {
  if (allowedIps.length === 0) return true; // no allowlist configured → open
  if (!clientIp) return false; // allowlist set but IP unknown → deny
  return allowedIps.includes(normalizeIp(clientIp));
}
