import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { apiBaseUrlFromEnv, buildApiUrl } from "@/lib/api-url";
import { buildApiHeaders } from "@/lib/bff-headers";
import { withDownloadParam } from "@/lib/download-url";
import type {
  ApiEnvelope,
  ApiKnowledgeDocumentDetail,
} from "@/lib/knowledge-types";

/**
 * Download a knowledge PDF.
 *
 * The API has no download endpoint; `GET /knowledge/documents/:id` attaches a
 * short-lived Supabase signed URL, so this route resolves that and redirects.
 *
 * It must NOT stream the file back. Vercel caps a function's *response* body at
 * 4.5 MB just as it caps the request, so proxying the bytes would fail on
 * exactly the large documents this exists to serve. Redirecting sends the
 * browser straight to storage, which has no such limit.
 *
 * Supabase's `download` query parameter is what turns the response into an
 * attachment rather than an inline render — it is precisely what the SDK's
 * `{ download }` option appends, so setting it here is equivalent and needs no
 * backend change.
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

  const filename = document?.original_filename?.trim() || `${id}.pdf`;

  return NextResponse.redirect(withDownloadParam(downloadUrl, filename), {
    status: 302,
    // The URL is signed and time-limited; never let it sit in a shared cache.
    headers: { "Cache-Control": "no-store" },
  });
}

/**
 * The URL comes from our own API rather than from user input, but this route
 * would otherwise redirect to whatever that field contained — so constrain it
 * to HTTPS rather than trusting the value outright.
 */
function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}
