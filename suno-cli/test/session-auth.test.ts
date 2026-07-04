import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { getClerkToken } from "../src/auth/clerk.js";
import { saveSession } from "../src/auth/session.js";

test("saved session JWT is auto-loaded without any Clerk fetch", async () => {
  const sessionFile = await withSession({ jwt: makeJwt({ sid: "sess_saved", exp: 2000000000 }) });
  await withoutEnvAuth(async () => {
    const token = await getClerkToken({ sessionFile, fetcher: failFetch });
    assert.equal(token.sessionId, "sess_saved");
  });
});

test("saved session cookie is exchanged for a JWT via the Clerk flow", async () => {
  const sessionFile = await withSession({ cookie: "__session=abc" });
  const jwt = makeJwt({ sid: "sess_from_cookie" });
  await withoutEnvAuth(async () => {
    const token = await getClerkToken({ sessionFile, fetcher: cookieExchangeFetcher(jwt) });
    assert.equal(token.jwt, jwt);
  });
});

test("explicit --jwt beats a saved session", async () => {
  const sessionFile = await withSession({ jwt: makeJwt({ sid: "sess_saved" }) });
  const explicit = makeJwt({ sid: "sess_explicit" });
  await withoutEnvAuth(async () => {
    const token = await getClerkToken({ sessionFile, jwt: explicit, fetcher: failFetch });
    assert.equal(token.sessionId, "sess_explicit");
  });
});

test("env SUNO_KIT_JWT beats a saved session", async () => {
  const sessionFile = await withSession({ jwt: makeJwt({ sid: "sess_saved" }) });
  const original = process.env.SUNO_KIT_JWT;
  const envJwt = makeJwt({ sid: "sess_env" });
  process.env.SUNO_KIT_JWT = envJwt;
  delete process.env.SUNO_KIT_COOKIE;
  try {
    const token = await getClerkToken({ sessionFile, fetcher: failFetch });
    assert.equal(token.sessionId, "sess_env");
  } finally {
    restoreEnv("SUNO_KIT_JWT", original);
  }
});

test("env SUNO_KIT_COOKIE beats a saved session JWT", async () => {
  const sessionFile = await withSession({ jwt: makeJwt({ sid: "sess_saved" }) });
  const jwt = makeJwt({ sid: "sess_from_env_cookie" });
  const originalCookie = process.env.SUNO_KIT_COOKIE;
  const originalJwt = process.env.SUNO_KIT_JWT;
  process.env.SUNO_KIT_COOKIE = "__session=env";
  delete process.env.SUNO_KIT_JWT;
  try {
    // Saved session holds sess_saved; env cookie forces the exchange path instead.
    const token = await getClerkToken({ sessionFile, fetcher: cookieExchangeFetcher(jwt) });
    assert.equal(token.jwt, jwt);
    assert.notEqual(token.sessionId, "sess_saved");
  } finally {
    restoreEnv("SUNO_KIT_COOKIE", originalCookie);
    restoreEnv("SUNO_KIT_JWT", originalJwt);
  }
});

async function withSession(fields: { jwt?: string; cookie?: string }): Promise<string> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "suno-cli-auth-"));
  const sessionFile = path.join(dir, "session.json");
  await saveSession(sessionFile, { ...fields, savedAt: "2026-01-01T00:00:00.000Z" });
  return sessionFile;
}

async function withoutEnvAuth(fn: () => Promise<void>): Promise<void> {
  const originalJwt = process.env.SUNO_KIT_JWT;
  const originalCookie = process.env.SUNO_KIT_COOKIE;
  const originalCookieFile = process.env.SUNO_KIT_COOKIE_FILE;
  delete process.env.SUNO_KIT_JWT;
  delete process.env.SUNO_KIT_COOKIE;
  delete process.env.SUNO_KIT_COOKIE_FILE;
  try {
    await fn();
  } finally {
    restoreEnv("SUNO_KIT_JWT", originalJwt);
    restoreEnv("SUNO_KIT_COOKIE", originalCookie);
    restoreEnv("SUNO_KIT_COOKIE_FILE", originalCookieFile);
  }
}

const failFetch = (async () => {
  throw new Error("fetch should not be called");
}) as typeof fetch;

function cookieExchangeFetcher(jwt: string): typeof fetch {
  return (async (input: string | URL | Request) => {
    const url = String(input);
    if (url.endsWith("/client")) {
      return jsonResponse({ response: { last_active_session_id: "sess_from_cookie" } });
    }
    if (url.includes("/tokens")) {
      return jsonResponse({ jwt });
    }
    throw new Error(`unexpected url ${url}`);
  }) as typeof fetch;
}

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } });
}

function restoreEnv(key: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
}

function makeJwt(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: "none" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${header}.${body}.signature`;
}
