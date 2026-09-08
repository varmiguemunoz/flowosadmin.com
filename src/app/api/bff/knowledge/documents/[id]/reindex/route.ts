import { apiProxy } from "@/lib/api-server";

/**
 * Re-runs ingestion from the already-stored PDF. The API returns 202 and
 * reindexes in the background, deleting existing chunks first so counts do
 * not double.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  return apiProxy({
    path: `/knowledge/documents/${encodeURIComponent(id)}/reindex`,
    method: "POST",
  });
}
