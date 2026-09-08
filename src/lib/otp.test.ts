import test from "node:test";
import assert from "node:assert/strict";

import { normalizeOtp, isValidOtp, OTP_LENGTH } from "./otp.ts";

test("OTP_LENGTH is 8", () => {
  assert.equal(OTP_LENGTH, 8);
});

test("normalizeOtp keeps a clean code unchanged", () => {
  assert.equal(normalizeOtp("88168564"), "88168564");
});

test("normalizeOtp strips spaces from a pasted code", () => {
  assert.equal(normalizeOtp("8816 8564"), "88168564");
});

test("normalizeOtp strips dashes", () => {
  assert.equal(normalizeOtp("8816-8564"), "88168564");
});

test("normalizeOtp strips surrounding whitespace and newlines", () => {
  assert.equal(normalizeOtp("  88168564\n"), "88168564");
});

test("normalizeOtp strips non-breaking spaces from HTML email copy", () => {
  assert.equal(normalizeOtp("8816 8564"), "88168564");
});

test("normalizeOtp drops letters entirely", () => {
  assert.equal(normalizeOtp("code: 88168564"), "88168564");
});

test("isValidOtp accepts exactly eight digits", () => {
  assert.equal(isValidOtp("88168564"), true);
});

test("isValidOtp accepts a spaced code", () => {
  assert.equal(isValidOtp("8816 8564"), true);
});

test("isValidOtp rejects seven digits", () => {
  assert.equal(isValidOtp("8816856"), false);
});

test("isValidOtp rejects nine digits", () => {
  assert.equal(isValidOtp("881685641"), false);
});

test("isValidOtp rejects an empty string", () => {
  assert.equal(isValidOtp(""), false);
});

test("isValidOtp rejects a purely alphabetic value", () => {
  assert.equal(isValidOtp("abcdefgh"), false);
});

test("normalizeOtp preserves leading zeros", () => {
  assert.equal(normalizeOtp("00168564"), "00168564");
  assert.equal(isValidOtp("00168564"), true);
});
