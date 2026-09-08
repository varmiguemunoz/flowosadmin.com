import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  parseAllowedIps,
  clientIpFromHeaders,
  isIpAllowed,
} from "@/lib/ip-allowlist";

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
    if (pathname !== "/403") {
      const url = nextUrl.clone();
      url.pathname = "/403";
      return NextResponse.rewrite(url, { status: 403 });
    }
    return NextResponse.next();
  }

  // --- Gate 2: Auth session -------------------------------------------------
  const isLoggedIn = Boolean(req.auth);

  // Session refresh failed → force re-auth.
  const hasRefreshError = req.auth?.error === "RefreshTokenError";

  if (isPublicPath(pathname)) {
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
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js)$).*)",
  ],
};
