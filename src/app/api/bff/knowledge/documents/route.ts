import type { NextRequest } from "next/server";

import { apiProxy } from "@/lib/api-server";

export async function GET(request: NextRequest) {
  return apiProxy({
    path: "/knowledge/documents",
    search: request.nextUrl.searchParams.toString() || undefined,
  });
}
