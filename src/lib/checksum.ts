/**
 * SHA-256 of a file, as lowercase hex.
 *
 * Under direct-to-storage upload the API never sees the bytes, so the duplicate
 * check on `knowledge_documents.checksum` depends on the browser computing this
 * and sending it with the ticket request. The digest must match what the server
 * used to compute with Node's `createHash('sha256')`, which this does.
 *
 * `crypto.subtle` requires a secure context. That covers https and localhost,
 * so both the deployed console and local development work; a plain-http host
 * would not, and would surface as `crypto.subtle` being undefined.
 */

export function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function sha256Hex(file: Blob): Promise<string> {
  if (typeof crypto === "undefined" || !crypto.subtle) {
    throw new Error(
      "Secure context required to hash the file. Use https or localhost.",
    );
  }

  // Reads the whole file into memory. Acceptable at our 50 MB ceiling, and the
  // alternative (a streaming hash) would mean shipping a hashing library.
  const bytes = await file.arrayBuffer();

  return toHex(await crypto.subtle.digest("SHA-256", bytes));
}
