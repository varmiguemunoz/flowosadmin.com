import "server-only";

import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { apiBaseUrlFromEnv, buildApiUrl } from "@/lib/api-url";
import { buildApiHeaders, safeResponseHeaders } from "@/lib/bff-headers";

/**
 * Server-side helper for BFF Route Handlers. Validates the NextAuth session,
 * then forwards a request to the NestJS API with the user's JWT and the
 * server-only `x-admin-api-key`. Fails closed: no session → 401, and the admin
 * key is never included in the response returned to the browser.
 */

export interface ApiProxyOptions {
  /** API path under `/api/v1`, e.g. "/knowledge/documents". */
  path: string;
  method?: string;
  /** Query string to append (without leading `?`). */
  search?: string;
  /** JSON body for write methods. Serialized with JSON.stringify. */
  body?: unknown;
  /**
   * Pre-encoded body forwarded untouched (multipart uploads, streams). Use
   * this instead of `body` so the multipart boundary is preserved.
   */
  rawBody?: BodyInit;
  /** Extra request headers (e.g. forwarded content-type for uploads). */
  headers?: Record<string, string>;
}

/**
 * Proxy an authenticated request to the NestJS API and return a NextResponse
 * safe to send to the browser.
 */
export async function apiProxy(
  options: ApiProxyOptions,
): Promise<NextResponse> {
  const session = await auth();

  // Fail closed: require a valid session with an access token.
  if (!session?.accessToken || session.error === "RefreshTokenError") {
    return NextResponse.json(
      { message: "Unauthorized." },
      { status: 401 },
    );
  }

  const url = buildApiUrl(
    apiBaseUrlFromEnv(),
    options.path,
    options.search,
  );

  const headers = buildApiHeaders({
    accessToken: session.accessToken,
    adminApiKey: process.env.ADMIN_API_KEY,
    extra: options.headers,
  });

  const hasJsonBody = options.body !== undefined;
  const hasRawBody = options.rawBody !== undefined;

  if (hasJsonBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const outboundBody = hasRawBody
    ? options.rawBody
    : hasJsonBody
      ? JSON.stringify(options.body)
      : undefined;

  let upstream: Response;
  try {
    upstream = await fetch(url, {
      method: options.method ?? "GET",
      headers,
      body: outboundBody,
      // Node's fetch requires this when streaming a request body.
      ...(hasRawBody ? { duplex: "half" } : {}),
      cache: "no-store",
    } as RequestInit);
  } catch (cause) {
    console.error(`[bff] Could not reach ${url}`, cause);
    return NextResponse.json(
      { message: "Could not reach the service." },
      { status: 502 },
    );
  }

  if (!upstream.ok) {
    console.error(`[bff] ${upstream.status} from ${url}`);
  }

  // Pass through the body, stripping any sensitive headers.
  const safeHeaders = safeResponseHeaders(upstream.headers.entries());
  const contentType = upstream.headers.get("content-type") ?? "";

  if (upstream.status === 204) {
    return new NextResponse(null, { status: 204, headers: safeHeaders });
  }

  if (contentType.includes("application/json")) {
    const data = await upstream.json().catch(() => null);
    return NextResponse.json(data, {
      status: upstream.status,
      headers: safeHeaders,
    });
  }

  const text = await upstream.text().catch(() => "");
  return new NextResponse(text, {
    status: upstream.status,
    headers: safeHeaders,
  });
}
