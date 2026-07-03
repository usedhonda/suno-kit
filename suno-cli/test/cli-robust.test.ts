import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { cliMain } from "../src/cli.js";

const CLIP_ID = "129414b4-1234-4567-8abc-1234567890ab";

test("cookie missing returns JSON blocked_login without stack trace", async () => {
  const tempDir = await fsTempDir();
  const originalCookie = process.env.SUNO_KIT_COOKIE;
  const originalJwt = process.env.SUNO_KIT_JWT;
  delete process.env.SUNO_KIT_COOKIE;
  delete process.env.SUNO_KIT_JWT;
  try {
    const result = await captureStdout(() => cliMain(["status", CLIP_ID, "--data-dir", tempDir]));
    assert.equal(result.code, 30);
    assert.equal(result.json.ok, false);
    assert.equal(result.json.status, "error");
    assert(!result.text.includes("at "));
  } finally {
    restoreEnv("SUNO_KIT_COOKIE", originalCookie);
    restoreEnv("SUNO_KIT_JWT", originalJwt);
  }
});

test("invalid id returns usage before auth", async () => {
  const tempDir = await fsTempDir();
  const result = await captureStdout(() => cliMain(["status", "not-a-valid-id", "--data-dir", tempDir]));
  assert.equal(result.code, 2);
  assert.equal(result.json.status, "not_found");
});

test("fetch reject returns stable retryable exit code and redacted output", async () => {
  const tempDir = await fsTempDir();
  const originalCookie = process.env.SUNO_KIT_COOKIE;
  const originalFetch = globalThis.fetch;
  process.env.SUNO_KIT_COOKIE = "session-cookie-value";
  globalThis.fetch = (async () => {
    throw new Error("network failed with __clerk_handshake=secret-value");
  }) as typeof fetch;
  try {
    const result = await captureStdout(() => cliMain(["status", CLIP_ID, "--data-dir", tempDir]));
    assert.equal(result.code, 50);
    assert(!result.text.includes("secret"));
    assert(!result.text.includes("__clerk_handshake=secret-value"));
  } finally {
    globalThis.fetch = originalFetch;
    restoreEnv("SUNO_KIT_COOKIE", originalCookie);
  }
});

test("SUNO_KIT_JWT status skips Clerk client and uses direct bearer", async () => {
  const tempDir = await fsTempDir();
  const jwt = makeJwt({ sid: "sess_direct" });
  const originalJwt = process.env.SUNO_KIT_JWT;
  const originalCookie = process.env.SUNO_KIT_COOKIE;
  const originalCookieFile = process.env.SUNO_KIT_COOKIE_FILE;
  const originalFetch = globalThis.fetch;
  let feedCalls = 0;
  process.env.SUNO_KIT_JWT = jwt;
  delete process.env.SUNO_KIT_COOKIE;
  delete process.env.SUNO_KIT_COOKIE_FILE;
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    assert(!url.includes("auth.suno.com"));
    assert.equal((init?.headers as Record<string, string>).authorization, `Bearer ${jwt}`);
    feedCalls += 1;
    return new Response(JSON.stringify({
      clips: [{ id: CLIP_ID, status: "complete", audio_url: "https://cdn.suno.ai/sil-100.mp3" }]
    }), { status: 200, headers: { "content-type": "application/json" } });
  }) as typeof fetch;
  try {
    const result = await captureStdout(() => cliMain(["status", CLIP_ID, "--data-dir", tempDir]));
    assert.equal(result.code, 0);
    assert.equal(result.json.status, "url_ready");
    assert.equal(feedCalls, 1);
    assert(!result.text.includes(jwt));
  } finally {
    globalThis.fetch = originalFetch;
    restoreEnv("SUNO_KIT_JWT", originalJwt);
    restoreEnv("SUNO_KIT_COOKIE", originalCookie);
    restoreEnv("SUNO_KIT_COOKIE_FILE", originalCookieFile);
  }
});

test("--jwt rejects empty values as usage", async () => {
  const tempDir = await fsTempDir();
  const result = await captureStdout(() => cliMain(["status", CLIP_ID, "--data-dir", tempDir, "--jwt", ""]));
  assert.equal(result.code, 2);
  assert.match(result.json.error, /--jwt/);
});

test("corrupt ledger returns stable schema-drift exit code", async () => {
  const tempDir = await fsTempDir();
  await fs.writeFile(path.join(tempDir, "runs.json"), "{not-json");
  const result = await captureStdout(() => cliMain(["status", CLIP_ID, "--data-dir", tempDir]));
  assert.equal(result.code, 40);
  assert.equal(result.json.ok, false);
});

async function captureStdout(fn: () => Promise<number>): Promise<{ code: number; json: any; text: string }> {
  const writes: string[] = [];
  const originalWrite = process.stdout.write;
  process.stdout.write = ((chunk: string | Uint8Array) => {
    writes.push(String(chunk));
    return true;
  }) as typeof process.stdout.write;
  try {
    const code = await fn().catch((error) => {
      throw error;
    });
    const text = writes.join("");
    return { code, json: JSON.parse(text), text };
  } catch (error) {
    const text = writes.join("");
    return { code: 70, json: text ? JSON.parse(text) : { ok: false }, text };
  } finally {
    process.stdout.write = originalWrite;
  }
}

async function fsTempDir(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), "suno-cli-test-"));
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
