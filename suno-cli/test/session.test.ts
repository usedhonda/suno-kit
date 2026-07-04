import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { clearSession, loadSession, saveSession } from "../src/auth/session.js";

test("saveSession writes 0600 file and loadSession round-trips", async () => {
  const dir = await fsTempDir();
  const file = path.join(dir, "nested", "session.json");
  await saveSession(file, { jwt: "eyJ.secret.sig", sessionId: "sess_1", savedAt: "2026-01-01T00:00:00.000Z" });
  const stat = await fs.stat(file);
  assert.equal(stat.mode & 0o777, 0o600);
  const loaded = await loadSession(file);
  assert.equal(loaded?.jwt, "eyJ.secret.sig");
  assert.equal(loaded?.sessionId, "sess_1");
});

test("loadSession returns undefined for missing file", async () => {
  const dir = await fsTempDir();
  const loaded = await loadSession(path.join(dir, "absent.json"));
  assert.equal(loaded, undefined);
});

test("loadSession returns undefined for corrupt json", async () => {
  const dir = await fsTempDir();
  const file = path.join(dir, "session.json");
  await fs.writeFile(file, "{not-json");
  assert.equal(await loadSession(file), undefined);
});

test("clearSession removes an existing session and reports missing", async () => {
  const dir = await fsTempDir();
  const file = path.join(dir, "session.json");
  await saveSession(file, { cookie: "__session=abc", savedAt: "2026-01-01T00:00:00.000Z" });
  assert.equal(await clearSession(file), true);
  assert.equal(await loadSession(file), undefined);
  assert.equal(await clearSession(file), false);
});

async function fsTempDir(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), "suno-cli-session-"));
}
