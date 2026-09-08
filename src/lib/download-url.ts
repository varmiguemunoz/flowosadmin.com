/**
 * Turn a Supabase signed URL into one that downloads rather than renders.
 *
 * Supabase serves a signed URL with the object's own content type, so a PDF
 * opens in the browser's viewer instead of saving. Its `download` query
 * parameter sets `Content-Disposition: attachment` and names the file; this is
 * exactly what the SDK's `createSignedUrl(..., { download })` option appends,
 * so doing it here is equivalent and needs no change on the API side.
 */
export function withDownloadParam(signedUrl: string, filename: string): string {
  // URL handles the escaping and preserves the `token` already in the query.
  const url = new URL(signedUrl);
  url.searchParams.set("download", filename);

  return url.toString();
}
