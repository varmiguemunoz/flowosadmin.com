import test from "node:test";
import assert from "node:assert/strict";

import {
  parseAllowedIps,
  normalizeIp,
  clientIpFromHeaders,
  isIpAllowed,
} from "./ip-allowlist.ts";

function headers(map: Record<string, string>) {
  return {
    get(name: string): string | null {
      return map[name.toLowerCase()] ?? null;
    },
  };
}

test("parseAllowedIps splits, trims, and drops empties", () => {
  assert.deepEqual(parseAllowedIps(" 1.2.3.4 , 5.6.7.8 ,,"), [
    "1.2.3.4",
    "5.6.7.8",
  ]);
});

test("parseAllowedIps handles empty/undefined", () => {
  assert.deepEqual(parseAllowedIps(undefined), []);
  assert.deepEqual(parseAllowedIps(""), []);
  assert.deepEqual(parseAllowedIps(null), []);
});

test("normalizeIp strips IPv4-mapped IPv6 prefix and lowercases", () => {
  assert.equal(normalizeIp("::ffff:203.0.113.1"), "203.0.113.1");
  assert.equal(normalizeIp("2001:DB8::1"), "2001:db8::1");
});

test("clientIpFromHeaders prefers first x-forwarded-for entry", () => {
  const ip = clientIpFromHeaders(
    headers({ "x-forwarded-for": "203.0.113.9, 70.41.3.18, 150.172.238.178" }),
  );
  assert.equal(ip, "203.0.113.9");
});

test("clientIpFromHeaders falls back to x-real-ip", () => {
  assert.equal(
    clientIpFromHeaders(headers({ "x-real-ip": "198.51.100.4" })),
    "198.51.100.4",
  );
});

test("clientIpFromHeaders returns empty when no headers", () => {
  assert.equal(clientIpFromHeaders(headers({})), "");
});

test("isIpAllowed: empty allowlist is open (fail-open)", () => {
  assert.equal(isIpAllowed("1.2.3.4", []), true);
  assert.equal(isIpAllowed("", []), true);
});

test("isIpAllowed: allowed IP passes", () => {
  assert.equal(isIpAllowed("1.2.3.4", ["1.2.3.4", "5.6.7.8"]), true);
});

test("isIpAllowed: disallowed IP blocked", () => {
  assert.equal(isIpAllowed("9.9.9.9", ["1.2.3.4"]), false);
});

test("isIpAllowed: allowlist set but unknown IP is denied (fail-closed)", () => {
  assert.equal(isIpAllowed("", ["1.2.3.4"]), false);
});

test("isIpAllowed: IPv6 matched after normalization", () => {
  assert.equal(isIpAllowed("::ffff:1.2.3.4", ["1.2.3.4"]), true);
  assert.equal(isIpAllowed("2001:DB8::1", ["2001:db8::1"]), true);
});
