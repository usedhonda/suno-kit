import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { BrowserSessionCapturer, loginCommand } from "../src/commands/login.js";
import { loadSession } from "../src/auth/session.js";
import { logoutCommand } from "../src/commands/logout.js";

test("login --jwt-paste persists session and hides the secret in output", async () => {
  const dir = await fsTempDir();
  const sessionFile = path.join(dir, "session.json");
  const jwt = makeJwt({ sid: "sess_paste", exp: 2000000000 });
  const result = await captureStdout(() =>
    loginCommand({ sessionFile, profileDir: path.join(dir, "profile"), jwtPaste: jwt })
  );
  assert.equal(result.code, 0);
  assert.equal(result.json.status, "login_success");
  assert.equal(result.json.method, "jwt_paste");
  assert(!result.text.includes(jwt));
  const saved = await loadSession(sessionFile);
  assert.equal(saved?.jwt, jwt);
  assert.equal(saved?.sessionId, "sess_paste");
});

test("login --cookie-paste persists the full cookie for captcha injection", async () => {
  const dir = await fsTempDir();
  const sessionFile = path.join(dir, "session.json");
  const cookie = "__session=abc; __client_uat=1; suno_auth=xyz";
  const result = await captureStdout(() =>
    loginCommand({ sessionFile, profileDir: path.join(dir, "profile"), cookiePaste: cookie })
  );
  assert.equal(result.code, 0);
  assert.equal(result.json.status, "login_success");
  assert.equal(result.json.method, "cookie_paste");
  assert(!result.text.includes("suno_auth=xyz"));
  const saved = await loadSession(sessionFile);
  assert.equal(saved?.cookie, cookie);
});

test("login --cookie-paste with empty value is a usage error", async () => {
  const dir = await fsTempDir();
  const result = await captureStdout(() =>
    loginCommand({ sessionFile: path.join(dir, "session.json"), profileDir: path.join(dir, "profile"), cookiePaste: "   " })
  );
  assert.equal(result.code, 2);
  assert.match(result.json.error, /--cookie-paste/);
});

test("login --jwt-paste with empty value is a usage error", async () => {
  const dir = await fsTempDir();
  const result = await captureStdout(() =>
    loginCommand({ sessionFile: path.join(dir, "session.json"), profileDir: path.join(dir, "profile"), jwtPaste: "   " })
  );
  assert.equal(result.code, 2);
  assert.match(result.json.error, /--jwt-paste/);
});

test("login browser success saves the captured cookie session", async () => {
  const dir = await fsTempDir();
  const sessionFile = path.join(dir, "session.json");
  const capturer: BrowserSessionCapturer = {
    capture: async () => ({ cookie: "__session=abc; __client=def" })
  };
  const result = await captureStdout(() =>
    loginCommand({ sessionFile, profileDir: path.join(dir, "profile"), capturer })
  );
  assert.equal(result.code, 0);
  assert.equal(result.json.status, "login_success");
  assert.equal(result.json.method, "browser");
  const saved = await loadSession(sessionFile);
  assert.equal(saved?.cookie, "__session=abc; __client=def");
});

test("login browser timeout returns recovery next_command", async () => {
  const dir = await fsTempDir();
  const capturer: BrowserSessionCapturer = {
    capture: async () => {
      const error = new Error("timeout");
      error.name = "LoginTimeoutError";
      throw error;
    }
  };
  const result = await captureStdout(() =>
    loginCommand({ sessionFile: path.join(dir, "session.json"), profileDir: path.join(dir, "profile"), capturer })
  );
  assert.equal(result.code, 30);
  assert.equal(result.json.status, "login_timeout");
  assert.match(result.json.recovery.next_command, /--jwt-paste/);
});

test("login browser with no session detected returns not_logged_in", async () => {
  const dir = await fsTempDir();
  const capturer: BrowserSessionCapturer = { capture: async () => ({}) };
  const result = await captureStdout(() =>
    loginCommand({ sessionFile: path.join(dir, "session.json"), profileDir: path.join(dir, "profile"), capturer })
  );
  assert.equal(result.code, 30);
  assert.equal(result.json.status, "not_logged_in");
});

test("login without capturer or jwt-paste asks to install the browser", async () => {
  const dir = await fsTempDir();
  const result = await captureStdout(() =>
    loginCommand({ sessionFile: path.join(dir, "session.json"), profileDir: path.join(dir, "profile") })
  );
  assert.equal(result.code, 2);
  assert.equal(result.json.status, "browser_required");
});

test("logout clears the saved session and browser profile", async () => {
  const dir = await fsTempDir();
  const sessionFile = path.join(dir, "session.json");
  const profileDir = path.join(dir, "profile");
  await fs.mkdir(profileDir, { recursive: true });
  await fs.writeFile(sessionFile, "{}");
  const result = await captureStdout(() => logoutCommand({ sessionFile, profileDir }));
  assert.equal(result.code, 0);
  assert.equal(result.json.status, "logged_out");
  assert.equal(result.json.cleared.saved, true);
  assert.equal(result.json.cleared.profile, true);
  assert.equal(await loadSession(sessionFile), undefined);
  await assert.rejects(fs.access(profileDir));
});

async function captureStdout(fn: () => Promise<number>): Promise<{ code: number; json: any; text: string }> {
  const writes: string[] = [];
  const originalWrite = process.stdout.write;
  process.stdout.write = ((chunk: string | Uint8Array) => {
    writes.push(String(chunk));
    return true;
  }) as typeof process.stdout.write;
  try {
    const code = await fn();
    const text = writes.join("");
    return { code, json: JSON.parse(text), text };
  } finally {
    process.stdout.write = originalWrite;
  }
}

async function fsTempDir(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), "suno-cli-login-"));
}

function makeJwt(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: "none" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${header}.${body}.signature`;
}
