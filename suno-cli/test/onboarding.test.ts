import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { cliMain } from "../src/cli.js";

test("README documents install, login, create, and a dedicated captcha section", async () => {
  // Captcha minting is now part of every live create (a browser opens), so the
  // Quick Start mentions it briefly and a dedicated "How Captcha Works" section
  // carries the full detail after it.
  const readme = await fs.readFile(path.join(process.cwd(), "README.md"), "utf8");
  const quickStart = readme.indexOf("## Quick Start");
  const captchaSection = readme.indexOf("## How Captcha Works");
  assert(quickStart >= 0);
  assert(captchaSection > quickStart);
  assert(readme.includes("npm install -g @usedhonda/suno-cli"));
  assert(readme.includes("npx playwright install chromium"));
  assert(readme.includes("suno-cli login"));
  assert(readme.includes("suno-cli create --live"));
  assert(readme.includes("create --mint-check"));
});

test("help shows the basic create path before advanced captcha options", async () => {
  const output = await captureStdout(() => cliMain(["--help"]));
  const usage = output.json.usage as string[];
  const basicCreateIndex = usage.findIndex((line) => line.startsWith("suno-cli create --live"));
  const advancedIndex = usage.findIndex((line) => line.startsWith("advanced auth/live"));
  assert(basicCreateIndex >= 0);
  assert(advancedIndex > basicCreateIndex);
  assert.equal(usage.slice(0, advancedIndex).join("\n").includes("--captcha-token"), false);
  assert(usage[advancedIndex]?.includes("--cdp-endpoint <loopback-url>"));
});

test("create rejects non-loopback CDP endpoints before browser attach", async () => {
  const args = [
    path.join(process.cwd(), "dist", "src", "cli.js"),
    "create",
    "--mint-check",
    "--title", "test",
    "--style", "lo-fi piano",
    "--cdp-endpoint", "http://192.168.1.20:9222"
  ];
  const result = spawnSync(process.execPath, args, { encoding: "utf8" });
  assert.equal(result.status, 2);
  assert.match(JSON.parse(result.stdout).error, /loopback HTTP origin/);

  const envResult = spawnSync(process.execPath, args.slice(0, -2), {
    encoding: "utf8",
    env: { ...process.env, SUNO_KIT_CDP_ENDPOINT: "http://example.com:9222" }
  });
  assert.equal(envResult.status, 2);
  assert.match(JSON.parse(envResult.stdout).error, /loopback HTTP origin/);
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
