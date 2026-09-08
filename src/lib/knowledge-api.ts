import { BffError, bffFetch } from "@/lib/bff-client";
import { sha256Hex } from "@/lib/checksum";
import type {
  ApiEnvelope,
  ApiKnowledgeDocumentPage,
  UploadTicket,
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

/**
 * Upload a PDF.
 *
 * The file does NOT travel through our BFF. Vercel caps a function's request
 * body at 4.5 MB and returns 413 above it, which no configuration can raise, so
 * anything larger has to bypass the server entirely. The flow is:
 *
 *   1. hash the file in the browser (the API dedupes on checksum and never
 *      sees the bytes on this path)
 *   2. ask the API for a signed upload credential
 *   3. PUT the file straight to Supabase Storage
 *   4. ask the API to index what is now in storage
 *
 * If step 3 or 4 fails the document row is deleted, otherwise a `pending` row
 * would linger pointing at an object that was never written.
 */
export async function uploadDocument(
  file: File,
  onProgress?: (fraction: number) => void,
): Promise<void> {
  const checksum = await sha256Hex(file);

  const ticket = await bffFetch<ApiEnvelope<UploadTicket>>(
    "/knowledge/documents/upload-url",
    {
      method: "POST",
      body: JSON.stringify({
        filename: file.name,
        checksum,
        fileSizeBytes: file.size,
      }),
    },
  );

  const { documentId, signedUrl } = ticket.data;

  try {
    await putToSignedUrl(signedUrl, file, onProgress);
    await bffFetch(
      `/knowledge/documents/${encodeURIComponent(documentId)}/reindex`,
      { method: "POST" },
    );
  } catch (error) {
    // Best effort: if this also fails the row stays and can be deleted by hand,
    // which is better than masking the original failure.
    await deleteDocument(documentId).catch(() => undefined);
    throw error;
  }
}

/**
 * PUT the file to the signed URL, reporting progress.
 *
 * XHR rather than fetch because fetch cannot report upload progress, and a
 * 50 MB upload with no feedback looks indistinguishable from a hung page.
 */
function putToSignedUrl(
  signedUrl: string,
  file: File,
  onProgress?: (fraction: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("PUT", signedUrl);
    request.setRequestHeader("content-type", file.type || "application/pdf");
    // Reindexing writes to the same path, so overwrites must be permitted.
    request.setRequestHeader("x-upsert", "true");

    request.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(event.loaded / event.total);
      }
    };

    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        onProgress?.(1);
        resolve();
        return;
      }
      reject(
        new BffError(
          request.status,
          extractStorageError(request.responseText) ??
            `Storage rejected the upload (${request.status}).`,
        ),
      );
    };

    request.onerror = () =>
      reject(new BffError(0, "The upload could not reach storage."));
    request.onabort = () => reject(new BffError(0, "Upload cancelled."));

    request.send(file);
  });
}

/** Supabase storage errors come back as `{ error, message, statusCode }`. */
function extractStorageError(body: string): string | null {
  try {
    const parsed = JSON.parse(body) as { message?: string; error?: string };
    return parsed.message ?? parsed.error ?? null;
  } catch {
    return null;
  }
}

export function documentDownloadHref(id: string): string {
  return `/api/bff/knowledge/documents/${encodeURIComponent(id)}/download`;
}
