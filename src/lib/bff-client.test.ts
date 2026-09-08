import assert from "node:assert/strict";
import { afterEach, test } from "node:test";

import { BffError, bffFetch } from "./bff-client.ts";

const realFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = realFetch;
});

function stubFetch(response: Response) {
  globalThis.fetch = (() => Promise.resolve(response)) as typeof fetch;
}

function json(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
    ...init,
  });
}

test("returns the parsed JSON body", async () => {
  stubFetch(json({ status: 200, message: "ok", data: { items: [] } }));

  const result = await bffFetch<{ message: string }>("/knowledge/documents");
  assert.equal(result.message, "ok");
});

test("returns undefined for 204", async () => {
  stubFetch(new Response(null, { status: 204 }));

  assert.equal(await bffFetch("/knowledge/documents/x", { method: "DELETE" }), undefined);
});

test("surfaces the API's message on an error status", async () => {
  stubFetch(
    json({ message: "This document was already uploaded." }, { status: 400 }),
  );

  await assert.rejects(bffFetch("/knowledge/documents/upload-url"), (error) => {
    assert.ok(error instanceof BffError);
    assert.equal(error.status, 400);
    assert.equal(error.message, "This document was already uploaded.");
    return true;
  });
});

test("falls back to statusText when the error body is not JSON", async () => {
  stubFetch(
    new Response("<!DOCTYPE html><p>nope</p>", {
      status: 500,
      statusText: "Internal Server Error",
      headers: { "content-type": "text/html" },
    }),
  );

  await assert.rejects(bffFetch("/knowledge/documents"), (error) => {
    assert.ok(error instanceof BffError);
    assert.equal(error.message, "Internal Server Error");
    return true;
  });
});

test("a 200 carrying HTML raises a readable error, not a JSON parse error", async () => {
  // The regression this guards: the proxy redirected API calls to /auth/login,
  // fetch followed it, and the login page arrived as 200 HTML. res.ok was true,
  // so we parsed it and threw "Unexpected token '<'" — which named neither the
  // redirect nor the auth problem that actually caused it.
  const html = new Response("<!DOCTYPE html><html></html>", {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
  Object.defineProperty(html, "redirected", { value: true });
  Object.defineProperty(html, "url", {
    value: "http://localhost:3000/auth/login",
  });
  stubFetch(html);

  await assert.rejects(bffFetch("/knowledge/documents"), (error) => {
    assert.ok(error instanceof BffError);
    assert.match(error.message, /redirected/i);
    assert.match(error.message, /auth\/login/);
    assert.doesNotMatch(error.message, /Unexpected token/);
    return true;
  });
});

test("a 200 with no content type at all is rejected clearly", async () => {
  stubFetch(new Response("plain", { status: 200, headers: {} }));

  await assert.rejects(bffFetch("/knowledge/documents"), (error) => {
    assert.ok(error instanceof BffError);
    assert.match(error.message, /Expected JSON/);
    return true;
  });
});
