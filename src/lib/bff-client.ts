/**
 * Browser-side fetch client for TanStack Query.
 *
 * IMPORTANT: this talks ONLY to our own Next.js BFF Route Handlers under
 * `/api/bff/*` (same origin). Those handlers attach the JWT and the
 * `x-admin-api-key` server-side before forwarding to the NestJS API, so no
 * secret is ever exposed to the browser. Never point this at the external API.
 */

export class BffError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "BffError";
  }
}

const BFF_BASE = "/api/bff";

export async function bffFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${BFF_BASE}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
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
  return (await res.json()) as T;
}
