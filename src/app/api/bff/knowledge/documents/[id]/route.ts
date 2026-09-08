import { apiProxy } from "@/lib/api-server";

/** Single document, including the API's signed download URL. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  return apiProxy({ path: `/knowledge/documents/${encodeURIComponent(id)}` });
}

/** Deletes the stored PDF, its row, and the cascaded chunks. */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  return apiProxy({
    path: `/knowledge/documents/${encodeURIComponent(id)}`,
    method: "DELETE",
  });
}
