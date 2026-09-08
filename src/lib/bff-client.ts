/**
 * Browser-side fetch client for TanStack Query.
 *
 * IMPORTANT: this talks ONLY to our own Next.js BFF Route Handlers under
 * `/api/bff/*` (same origin). Those handlers attach the JWT and the
 * `x-admin-api-key` server-side before forwarding to the NestJS API, so no
 * secret is ever exposed to the browser. Never point this at the external API.
 */

export class BffError extends Error {
  // Declared and assigned explicitly rather than as a constructor parameter
  // property: `node --experimental-strip-types` runs the test suite and cannot
  // compile parameter properties, which would make this module untestable.
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "BffError";
    this.status = status;
  }
}

const BFF_BASE = "/api/bff";

export async function bffFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  // FormData must set its own Content-Type so the multipart boundary survives.
  // Forcing application/json here would corrupt file uploads.
  const isFormData =
    typeof FormData !== "undefined" && init?.body instanceof FormData;

  const res = await fetch(`${BFF_BASE}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body && !isFormData
        ? { "Content-Type": "application/json" }
        : {}),
      ...init?.headers,
    },
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const data = (await res.json()) as { message?: string };
      if (data?.message) message = data.message;
    } catch {
      // non-JSON error body — keep statusText
    }
    throw new BffError(res.status, message);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  // A 200 carrying HTML means something upstream answered instead of our route
  // — a redirect that `fetch` followed to a page, or a dev error overlay.
  // Parsing it would throw "Unexpected token '<'", which tells nobody anything;
  // `res.url` names the page we actually landed on.
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new BffError(
      res.status,
      res.redirected
        ? `Request was redirected to ${res.url} instead of returning data. You may need to sign in again.`
        : `Expected JSON from the server but received ${contentType || "an unknown content type"}.`,
    );
  }

  return (await res.json()) as T;
}
