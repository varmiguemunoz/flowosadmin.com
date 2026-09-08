import type { NextRequest } from "next/server";

import { apiProxy } from "@/lib/api-server";

/**
 * Mint a direct-to-storage upload credential.
 *
 * The body is a few hundred bytes of JSON, so unlike the multipart upload route
 * this one is nowhere near the platform's 4.5 MB request body limit. That is
 * the entire point: the file itself never passes through here.
 */
export async function POST(request: NextRequest) {
  const body: unknown = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return Response.json(
      { message: "Expected a JSON body." },
      { status: 400 },
    );
  }

  return apiProxy({
    path: "/knowledge/documents/upload-url",
    method: "POST",
    body,
  });
}
