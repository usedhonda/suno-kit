import assert from "node:assert/strict";
import test from "node:test";
import { extractCaptchaMint, parseCookieHeader } from "../src/browser/captcha.js";

test("parseCookieHeader expands each cookie across .suno.com and suno.com", () => {
  const cookies = parseCookieHeader("__session=abc; __client_uat=1; suno_auth=xyz");
  assert.equal(cookies.length, 6);
  assert.deepEqual(cookies[0], { name: "__session", value: "abc", domain: ".suno.com", path: "/" });
  assert.deepEqual(cookies[1], { name: "__session", value: "abc", domain: "suno.com", path: "/" });
  const names = new Set(cookies.map((cookie) => cookie.name));
  assert.deepEqual([...names], ["__session", "__client_uat", "suno_auth"]);
});

test("parseCookieHeader skips malformed pairs and preserves values with '='", () => {
  const cookies = parseCookieHeader("=orphan; noequals; ok=a=b; empty=");
  // Only ok=a=b survives -> 2 domain entries.
  assert.equal(cookies.length, 2);
  assert.equal(cookies[0]?.name, "ok");
  assert.equal(cookies[0]?.value, "a=b");
});

test("extractCaptchaMint reads token and integer provider from captured generate body", () => {
  const result = extractCaptchaMint({
    token: "captcha-secret",
    token_provider: 1
  }, undefined);
  assert.deepEqual(result, {
    token: "captcha-secret",
    tokenProvider: 1
  });
});

test("extractCaptchaMint uses provider fallback for hcaptcha execute string result", () => {
  const result = extractCaptchaMint("captcha-secret", 1);
  assert.deepEqual(result, {
    token: "captcha-secret",
    tokenProvider: 1
  });
});

test("extractCaptchaMint rejects token without integer provider", () => {
  const result = extractCaptchaMint({
    token: "captcha-secret",
    token_provider: "hcaptcha"
  }, undefined);
  assert.equal(result, undefined);
});
