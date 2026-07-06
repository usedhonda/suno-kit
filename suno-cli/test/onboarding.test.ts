import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { cliMain } from "../src/cli.js";

test("README keeps captcha details out of the quick-start path", async () => {
  const readme = await fs.readFile(path.join(process.cwd(), "README.md"), "utf8");
  const quickStart = readme.indexOf("## Quick Start");
  const captchaTroubleshooting = readme.indexOf("## Captcha Troubleshooting");
  assert(quickStart >= 0);
  assert(captchaTroubleshooting > quickStart);
  assert.equal(readme.slice(0, captchaTroubleshooting).toLowerCase().includes("captcha"), false);
  assert(readme.includes("npm install -g @usedhonda/suno-cli"));
  assert(readme.includes("suno-cli login"));
  assert(readme.includes("suno-cli create --live"));
});

test("help shows the basic create path before advanced captcha options", async () => {
  const output = await captureStdout(() => cliMain(["--help"]));
  const usage = output.json.usage as string[];
  const basicCreateIndex = usage.findIndex((line) => line.startsWith("suno-cli create --live"));
  const advancedIndex = usage.findIndex((line) => line.startsWith("advanced auth/live"));
  assert(basicCreateIndex >= 0);
  assert(advancedIndex > basicCreateIndex);
  assert.equal(usage.slice(0, advancedIndex).join("\n").includes("--captcha-token"), false);
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
