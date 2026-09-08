import type { NextRequest } from "next/server";

import { apiProxy } from "@/lib/api-server";

/**
 * Vector search over the indexed knowledge. Returns matched chunks with
 * similarity scores — useful for confirming what the agent can actually see.
 */
export async function GET(request: NextRequest) {
  return apiProxy({
    path: "/knowledge/search",
    search: request.nextUrl.searchParams.toString() || undefined,
  });
}
