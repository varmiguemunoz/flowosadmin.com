import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { apiBaseUrlFromEnv, buildApiUrl } from "@/lib/api-url";
import { buildApiHeaders } from "@/lib/bff-headers";
import { contentDispositionAttachment } from "@/lib/content-disposition";
import type {
  ApiEnvelope,
  ApiKnowledgeDocumentDetail,
} from "@/lib/knowledge-types";

/**
 * Download a knowledge PDF.
 *
 * The API has no download endpoint. `GET /knowledge/documents/:id` attaches a
 * short-lived Supabase signed URL, so this route resolves that first and then
 * streams the object back.
 *
 * Two reasons it does not go through `apiProxy`: that helper reads non-JSON
 * responses with `.text()`, which would corrupt a PDF, and the signed URL would
 * otherwise reach the browser. The backend creates it without Supabase's
 * `download` flag, so a browser opening it directly would render the PDF inline
 * instead of saving it. Streaming here lets us set our own
 * `Content-Disposition` and keep the original filename, without touching the
 * API.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();

  // Fail closed, exactly as `apiProxy` does.
  if (!session?.accessToken || session.error === "RefreshTokenError") {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const detailUrl = buildApiUrl(
    apiBaseUrlFromEnv(),
    `/knowledge/documents/${encodeURIComponent(id)}`,
  );

  const headers = buildApiHeaders({
    accessToken: session.accessToken,
    adminApiKey: process.env.ADMIN_API_KEY,
  });

  let detailResponse: Response;
  try {
    detailResponse = await fetch(detailUrl, { headers, cache: "no-store" });
  } catch (cause) {
    console.error(`[bff] Could not reach ${detailUrl}`, cause);
    return NextResponse.json(
      { message: "Could not reach the service." },
      { status: 502 },
    );
  }

  if (!detailResponse.ok) {
    console.error(`[bff] ${detailResponse.status} from ${detailUrl}`);
    const body = (await detailResponse.json().catch(() => null)) as {
      message?: string;
    } | null;

    return NextResponse.json(
      { message: body?.message ?? "Could not load this document." },
      { status: detailResponse.status },
    );
  }

  const envelope = (await detailResponse
    .json()
    .catch(() => null)) as ApiEnvelope<ApiKnowledgeDocumentDetail> | null;
  const document = envelope?.data;
  const downloadUrl = document?.download_url;

  // The API logs a warning and omits `download_url` when signing fails, so a
  // 200 does not guarantee the link is there.
  if (!downloadUrl || !isHttpsUrl(downloadUrl)) {
    console.error(`[bff] No usable download URL for document ${id}`);
    return NextResponse.json(
      { message: "This document has no downloadable file." },
      { status: 502 },
    );
  }

  let fileResponse: Response;
  try {
    // The URL is already signed; sending our own credentials would be wrong.
    fileResponse = await fetch(downloadUrl, { cache: "no-store" });
  } catch (cause) {
    console.error(`[bff] Could not fetch stored file for ${id}`, cause);
    return NextResponse.json(
      { message: "Could not reach the file storage." },
      { status: 502 },
    );
  }

  if (!fileResponse.ok || !fileResponse.body) {
    console.error(`[bff] Storage returned ${fileResponse.status} for ${id}`);
    return NextResponse.json(
      { message: "The stored file could not be read." },
      { status: 502 },
    );
  }

  const filename = document?.original_filename?.trim() || `${id}.pdf`;
  const outboundHeaders = new Headers({
    "Content-Type": fileResponse.headers.get("content-type") ?? "application/pdf",
    "Content-Disposition": contentDispositionAttachment(filename),
    "Cache-Control": "no-store",
  });

  const contentLength = fileResponse.headers.get("content-length");
  if (contentLength) {
    outboundHeaders.set("Content-Length", contentLength);
  }

  return new NextResponse(fileResponse.body, {
    status: 200,
    headers: outboundHeaders,
  });
}

/**
 * The URL comes from our own API rather than from user input, but this route
 * would otherwise fetch whatever that field contained — so constrain it to
 * HTTPS rather than trusting the value outright.
 */
function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}
