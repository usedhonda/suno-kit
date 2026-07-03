import assert from "node:assert/strict";
import test from "node:test";
import { getClerkToken } from "../src/auth/clerk.js";

test("getClerkToken returns direct JWT without Clerk client fetch", async () => {
  const jwt = makeJwt({ sid: "sess_direct", exp: 2000000000 });
  const token = await getClerkToken({
    jwt,
    fetcher: failFetch
  });
  assert.equal(token.jwt, jwt);
  assert.equal(token.sessionId, "sess_direct");
  assert.equal(token.expiresAt, "2033-05-18T03:33:20.000Z");
});

test("getClerkToken accepts malformed direct JWT without local validation", async () => {
  const token = await getClerkToken({
    jwt: "not-a-jwt",
    fetcher: failFetch
  });
  assert.equal(token.jwt, "not-a-jwt");
  assert.equal(token.sessionId, "");
  assert.equal(token.expiresAt, undefined);
});

test("getClerkToken reads SUNO_KIT_JWT without Clerk client fetch", async () => {
  const originalJwt = process.env.SUNO_KIT_JWT;
  const jwt = makeJwt({ sid: "sess_env" });
  process.env.SUNO_KIT_JWT = jwt;
  try {
    const token = await getClerkToken({ fetcher: failFetch });
    assert.equal(token.jwt, jwt);
    assert.equal(token.sessionId, "sess_env");
  } finally {
    restoreEnv("SUNO_KIT_JWT", originalJwt);
  }
});

const failFetch = (async () => {
  throw new Error("fetch should not be called");
}) as typeof fetch;

function makeJwt(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: "none" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${header}.${body}.signature`;
}

function restoreEnv(key: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
}
