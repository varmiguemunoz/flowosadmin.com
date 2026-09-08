import assert from "node:assert/strict";
import { test } from "node:test";

import { contentDispositionAttachment } from "./content-disposition.ts";

test("plain ASCII names appear in both forms", () => {
  assert.equal(
    contentDispositionAttachment("meditation.pdf"),
    `attachment; filename="meditation.pdf"; filename*=UTF-8''meditation.pdf`,
  );
});

test("spaces survive in the quoted form and are encoded in the extended one", () => {
  assert.equal(
    contentDispositionAttachment("Anxiety coaching playbook.pdf"),
    `attachment; filename="Anxiety coaching playbook.pdf"; filename*=UTF-8''Anxiety%20coaching%20playbook.pdf`,
  );
});

test("accented names fall back to ASCII and encode in full", () => {
  const value = contentDispositionAttachment("meditación guiada.pdf");

  assert.ok(value.includes(`filename="meditaci_n guiada.pdf"`));
  assert.ok(value.includes(`filename*=UTF-8''meditaci%C3%B3n%20guiada.pdf`));
});

test("quotes cannot break out of the quoted form", () => {
  // An unescaped quote would terminate the filename early and let the rest of
  // the name be read as header parameters.
  const value = contentDispositionAttachment('eviland".pdf');

  assert.ok(!value.includes('"eviland".pdf"'));
  assert.ok(value.includes('filename="eviland_.pdf"'));
});

test("control characters are stripped from the ASCII fallback", () => {
  // A raw CR/LF in a header value is a response-splitting vector.
  const value = contentDispositionAttachment("bad\r\nname.pdf");

  assert.ok(!value.includes("\r"));
  assert.ok(!value.includes("\n"));
});

test("empty or whitespace names get a usable default", () => {
  assert.equal(
    contentDispositionAttachment("   "),
    `attachment; filename="document.pdf"; filename*=UTF-8''document.pdf`,
  );
});

test("RFC 5987 reserved characters are percent-encoded", () => {
  const value = contentDispositionAttachment("notes(1)!.pdf");

  assert.ok(value.includes("filename*=UTF-8''notes%281%29%21.pdf"));
});
