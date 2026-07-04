import assert from "node:assert/strict";
import test from "node:test";
import { extractCaptchaMint } from "../src/browser/captcha.js";

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
