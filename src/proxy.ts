import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  parseAllowedIps,
  clientIpFromHeaders,
  isIpAllowed,
} from "@/lib/ip-allowlist";

/**
 * Next.js 16 Proxy (formerly middleware). A single file composes two gates:
 *
 *   1. IP allowlist — runs first. An unauthorized client IP is rewritten to the
 *      dedicated 403 "Acceso restringido" page and never sees the app.
 *   2. Auth session — for allowed IPs, unauthenticated users hitting a private
 *      route are redirected to /auth/login. Auth.js also refreshes the session
 *      here (via the jwt callback).
 *
 * `auth()` gives us the resolved session on `req.auth`.
 */

const PUBLIC_PREFIXES = ["/auth", "/403"];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export const proxy = auth((req) => {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  // --- Gate 1: IP allowlist -------------------------------------------------
  const allowed = parseAllowedIps(process.env.ALLOWED_IPS);
  const clientIp = clientIpFromHeaders(req.headers);
  if (!isIpAllowed(clientIp, allowed)) {
    // Rewrite (not redirect) so the URL stays put and the app is never exposed.
    // Avoid a rewrite loop if the 403 page itself is being requested.
    if (pathname !== "/403") {
      const url = nextUrl.clone();
      url.pathname = "/403";
      return NextResponse.rewrite(url, { status: 403 });
    }
    return NextResponse.next();
  }

  // A blocked IP must never reach the real 403 route content as a normal 200.
  // For allowed IPs visiting /403 directly, let it render normally.

  // --- Gate 2: Auth session -------------------------------------------------
  const isLoggedIn = Boolean(req.auth);

  // Session refresh failed → force re-auth.
  const hasRefreshError = req.auth?.error === "RefreshTokenError";

  if (isPublicPath(pathname)) {
    // Already authenticated users landing on /auth/* go to the app.
    if (isLoggedIn && !hasRefreshError && pathname.startsWith("/auth")) {
      const url = nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Private route: require a valid session.
  if (!isLoggedIn || hasRefreshError) {
    const url = nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  /*
   * Run on every request except Next internals and common static assets. Must
   * be a static literal — Next parses this at build time (a variable reference
   * is rejected). Keep in sync with src/lib/proxy-matcher.ts (tested there).
   */
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js)$).*)",
  ],
};
