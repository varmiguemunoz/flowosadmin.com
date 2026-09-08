import type { NextRequest } from "next/server";

import { apiProxy } from "@/lib/api-server";

export async function GET(request: NextRequest) {
  return apiProxy({
    path: "/knowledge/documents",
    search: request.nextUrl.searchParams.toString() || undefined,
  });
}

/**
 * PDF upload. The multipart body is forwarded untouched so the boundary in the
 * incoming Content-Type still matches the payload; re-encoding it here would
 * break the file. The API responds immediately with `status: "pending"` and
 * indexes in the background.
 */
export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.includes("multipart/form-data")) {
    return Response.json(
      { message: "Expected a multipart/form-data upload." },
      { status: 415 },
    );
  }

  const formData = await request.formData();

  return apiProxy({
    path: "/knowledge/documents",
    method: "POST",
    rawBody: formData,
  });
}
