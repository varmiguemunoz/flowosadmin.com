import { bffFetch } from "@/lib/bff-client";
import type {
  ApiEnvelope,
  ApiKnowledgeDocumentPage,
} from "@/lib/knowledge-types";

export const knowledgeKeys = {
  all: ["knowledge"] as const,
  documents: () => [...knowledgeKeys.all, "documents"] as const,
};

/** The API caps `limit` at 100. Pagination is not worth its weight yet. */
const LIST_LIMIT = 100;

const EMPTY_PAGE: ApiKnowledgeDocumentPage = {
  items: [],
  total: 0,
  page: 1,
  limit: LIST_LIMIT,
};

export async function listDocuments(): Promise<ApiKnowledgeDocumentPage> {
  const response = await bffFetch<ApiEnvelope<ApiKnowledgeDocumentPage>>(
    `/knowledge/documents?page=1&limit=${LIST_LIMIT}`,
  );

  return response?.data?.items ? response.data : EMPTY_PAGE;
}

export async function deleteDocument(id: string): Promise<void> {
  await bffFetch(`/knowledge/documents/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function uploadDocument(file: File): Promise<void> {
  const formData = new FormData();
  formData.append("file", file, file.name);

  await bffFetch(`/knowledge/documents`, {
    method: "POST",
    body: formData,
  });
}

export function documentDownloadHref(id: string): string {
  return `/api/bff/knowledge/documents/${encodeURIComponent(id)}/download`;
}
