/**
 * Build a `Content-Disposition` value that makes a browser save a file under
 * its original name.
 *
 * Filenames come from whatever the operator uploaded, so they routinely contain
 * accents, spaces, quotes, and occasionally a stray control character. A bare
 * `filename="…"` only safely carries ASCII, so we emit both forms allowed by
 * RFC 6266: a sanitized ASCII fallback for old clients, and `filename*` with
 * RFC 5987 percent-encoding for everything current. Browsers prefer the latter.
 */

/** Replace anything outside printable ASCII, plus quotes and backslashes. */
function toAsciiFallback(filename: string): string {
  const ascii = filename.replace(/[^\x20-\x7e]/g, "_").replace(/["\\]/g, "_");

  return ascii.trim() || "document.pdf";
}

export function contentDispositionAttachment(filename: string): string {
  const name = filename?.trim() ? filename.trim() : "document.pdf";

  // encodeURIComponent leaves !'()* alone; RFC 5987 wants them encoded too.
  const encoded = encodeURIComponent(name).replace(
    /['()!*]/g,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  );

  return `attachment; filename="${toAsciiFallback(name)}"; filename*=UTF-8''${encoded}`;
}
