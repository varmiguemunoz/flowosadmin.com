/**
 * Documentation copy of the Proxy matcher pattern for testing/reasoning.
 *
 * NOTE: Next.js requires the real `config.matcher` in src/proxy.ts to be an
 * inline static string literal (a variable reference is rejected at build
 * time), so this constant is a mirror kept in sync by hand, not the source of
 * truth. `proxyMatches` below verifies the exclusion logic.
 */
export const PROXY_MATCHER =
  "/((?!api(?:/|$)|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js)$).*)";

/**
 * Approximate whether the matcher would run for a given pathname. Mirrors the
 * negative-lookahead exclusions in {@link PROXY_MATCHER}. Used for tests and
 * reasoning, not by Next itself (Next compiles the matcher string).
 */
export function proxyMatches(pathname: string): boolean {
  // API routes authenticate themselves and must never be redirected: `fetch`
  // follows the redirect and receives the login page as 200 HTML, which then
  // fails JSON parsing. See the note on `config.matcher` in src/proxy.ts.
  if (pathname === "/api" || pathname.startsWith("/api/")) {
    return false;
  }
  if (
    pathname.startsWith("/_next/static") ||
    pathname.startsWith("/_next/image")
  ) {
    return false;
  }
  if (["/favicon.ico", "/robots.txt", "/sitemap.xml"].includes(pathname)) {
    return false;
  }
  if (/\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js)$/.test(pathname)) {
    return false;
  }
  return true;
}
