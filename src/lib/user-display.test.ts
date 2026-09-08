import assert from "node:assert/strict";
import { test } from "node:test";

import { displayName, initialOf } from "./user-display.ts";

test("displayName prefers the full name", () => {
  assert.equal(
    displayName({ name: "Miguel Munoz", email: "miguel@taoflow.com" }),
    "Miguel Munoz",
  );
});

test("displayName falls back to the email local part", () => {
  // The API's full_name is optional, so a null name is a normal state, not a
  // bug — the navbar still has to identify who is signed in.
  assert.equal(
    displayName({ name: null, email: "miguel@taoflow.com" }),
    "miguel",
  );
});

test("displayName treats a whitespace-only name as absent", () => {
  assert.equal(displayName({ name: "   ", email: "ops@taoflow.com" }), "ops");
});

test("displayName has a last resort", () => {
  assert.equal(displayName({}), "Admin");
  assert.equal(displayName(null), "Admin");
  assert.equal(displayName(undefined), "Admin");
  assert.equal(displayName({ name: null, email: null }), "Admin");
});

test("displayName survives a malformed email", () => {
  assert.equal(displayName({ email: "@taoflow.com" }), "Admin");
});

test("initialOf uppercases the first character", () => {
  assert.equal(initialOf("miguel"), "M");
  assert.equal(initialOf("Ada Lovelace"), "A");
  assert.equal(initialOf("  spaced"), "S");
});

test("initialOf degrades on an empty name", () => {
  assert.equal(initialOf(""), "?");
  assert.equal(initialOf("   "), "?");
});
