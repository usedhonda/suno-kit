import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { cliMain } from "../src/cli.js";
import { createCommand } from "../src/commands/create.js";
import { buildCreateBody } from "../src/create/body.js";
import { LedgerStore } from "../src/ledger/store.js";

const LIVE_CLIP_ID = "329414b4-1234-4567-8abc-1234567890ab";

test("buildCreateBody maps R6 create fields", () => {
  const body = buildCreateBody({
    title: "verify probe",
    style: "lo-fi piano, mellow",
    exclude: "brass",
    lyrics: "hello",
    model: "v5.5",
    vocalGender: "m",
    transactionUuid: "tx-1",
    token: "captcha-secret",
    tokenProvider: 1
  });
  assert.equal(body.tags, "lo-fi piano, mellow");
  assert.equal(body.negative_tags, "brass");
  assert.equal(body.prompt, "hello");
  assert.equal(body.mv, "chirp-fenix");
  assert.equal(body.transaction_uuid, "tx-1");
  assert.equal(body.token, "captcha-secret");
  assert.equal(body.token_provider, 1);
  assert.deepEqual(body.override_fields, []);
  assert.equal(body.persona_id, null);
  const metadata = body.metadata;
  assert.equal(metadata.vocal_gender, "m");
  assert.equal(metadata.disable_volume_normalization, false);
  assert.equal(metadata.web_client_pathname, "/create");
  assert(!("control_sliders" in metadata));
});

test("buildCreateBody can send explicit null captcha fields", () => {
  const body = buildCreateBody({
    title: "verify probe",
    style: "lo-fi piano",
    transactionUuid: "tx-null-captcha",
    token: null,
    tokenProvider: null
  });
  assert.equal(body.token, null);
  assert.equal(body.token_provider, null);
});

test("create dry-run maps persona id to top-level persona_id", async () => {
  const tempDir = await fsTempDir();
  const output = await captureStdout(() => cliMain([
    ...baseCreateArgs(tempDir, "run_persona"),
    "--persona-id", "abc123"
  ]));
  assert.equal(output.code, 0);
  assert.equal(output.json.body.persona_id, "abc123");
  assert(!("persona_id" in output.json.body.metadata));
});

test("create dry-run maps cover clip id to live capture cover shape", async () => {
  const tempDir = await fsTempDir();
  const output = await captureStdout(() => cliMain([
    ...baseCreateArgs(tempDir, "run_cover"),
    "--cover-clip-id", "CLIP123"
  ]));
  const metadata = output.json.body.metadata;
  assert.equal(output.code, 0);
  assert.equal(output.json.body.cover_clip_id, "CLIP123");
  assert(!("cover_start_s" in output.json.body));
  assert(!("cover_end_s" in output.json.body));
  assert.equal(output.json.body.task, "cover");
  assert.equal(metadata.create_mode, "custom");
  assert.equal(metadata.is_remix, true);
});

test("create dry-run maps cover start and end seconds", async () => {
  const tempDir = await fsTempDir();
  const output = await captureStdout(() => cliMain([
    ...baseCreateArgs(tempDir, "run_cover_range"),
    "--cover-clip-id", "CLIP123",
    "--cover-start-s", "10",
    "--cover-end-s", "30.5"
  ]));
  assert.equal(output.code, 0);
  assert.equal(output.json.body.cover_clip_id, "CLIP123");
  assert.equal(output.json.body.cover_start_s, 10);
  assert.equal(output.json.body.cover_end_s, 30.5);
});

test("create dry-run rejects cover range without cover clip id", async () => {
  const tempDir = await fsTempDir();
  const output = await captureStdout(() => cliMain([
    ...baseCreateArgs(tempDir, "run_cover_missing"),
    "--cover-start-s", "10"
  ]));
  assert.equal(output.code, 2);
  assert.match(output.json.error, /cover-clip-id/);
});

test("create dry-run rejects invalid cover values", async () => {
  const tempDir = await fsTempDir();
  const emptyClip = await captureStdout(() => cliMain([
    ...baseCreateArgs(tempDir, "run_cover_empty"),
    "--cover-clip-id", ""
  ]));
  const negativeStart = await captureStdout(() => cliMain([
    ...baseCreateArgs(tempDir, "run_cover_negative"),
    "--cover-clip-id", "CLIP123",
    "--cover-start-s", "-1"
  ]));
  assert.equal(emptyClip.code, 2);
  assert.match(emptyClip.json.error, /--cover-clip-id/);
  assert.equal(negativeStart.code, 2);
  assert.match(negativeStart.json.error, /--cover-start-s/);
});

test("create dry-run keeps persona_id null when unspecified", async () => {
  const tempDir = await fsTempDir();
  const output = await captureStdout(() => cliMain(baseCreateArgs(tempDir, "run_no_persona")));
  assert.equal(output.code, 0);
  assert.equal(output.json.body.persona_id, null);
});

test("create dry-run rejects empty persona id", async () => {
  const tempDir = await fsTempDir();
  const output = await captureStdout(() => cliMain([
    ...baseCreateArgs(tempDir, "run_empty_persona"),
    "--persona-id", ""
  ]));
  assert.equal(output.code, 2);
  assert.equal(output.json.status, "error");
  assert.match(output.json.error, /--persona-id/);
});

test("create dry-run maps weirdness and style influence to metadata control_sliders", async () => {
  const tempDir = await fsTempDir();
  const output = await captureStdout(() => cliMain([
    ...baseCreateArgs(tempDir, "run_sliders"),
    "--weirdness", "45",
    "--style-influence", "70"
  ]));
  const metadata = output.json.body.metadata;
  assert.equal(output.code, 0);
  assert.equal(metadata.control_sliders.weirdness_constraint, 0.45);
  assert.equal(metadata.control_sliders.style_weight, 0.7);
  assert.deepEqual(output.json.body.override_fields, []);
});

test("create dry-run maps audio influence to metadata control_sliders", async () => {
  const tempDir = await fsTempDir();
  const output = await captureStdout(() => cliMain([
    ...baseCreateArgs(tempDir, "run_audio_influence"),
    "--audio-influence", "25"
  ]));
  const sliders = output.json.body.metadata.control_sliders;
  assert.equal(output.code, 0);
  assert.equal(sliders.audio_weight, 0.25);
  assert.deepEqual(output.json.body.override_fields, []);
});

test("create dry-run combines weirdness style and audio sliders", async () => {
  const tempDir = await fsTempDir();
  const output = await captureStdout(() => cliMain([
    ...baseCreateArgs(tempDir, "run_all_sliders"),
    "--weirdness", "45",
    "--style-influence", "70",
    "--audio-influence", "25"
  ]));
  const sliders = output.json.body.metadata.control_sliders;
  assert.equal(output.code, 0);
  assert.equal(sliders.weirdness_constraint, 0.45);
  assert.equal(sliders.style_weight, 0.7);
  assert.equal(sliders.audio_weight, 0.25);
});

test("create body omits control_sliders when sliders are unspecified", () => {
  const body = buildCreateBody({
    title: "verify probe",
    style: "lo-fi piano",
    lyrics: "rain",
    transactionUuid: "tx-omit"
  });
  const metadata = body.metadata;
  assert(!("control_sliders" in metadata));
  assert.equal(metadata.create_mode, "custom");
  assert.equal(metadata.disable_volume_normalization, false);
  assert.equal(metadata.web_client_pathname, "/create");
  assert.equal(body.cover_clip_id, null);
  assert(!("task" in body));
  assert.deepEqual(body.override_fields, []);
});

test("create body includes only specified slider key", () => {
  const body = buildCreateBody({
    title: "verify probe",
    style: "lo-fi piano",
    lyrics: "rain",
    transactionUuid: "tx-one",
    weirdness: 0.33
  });
  const sliders = body.metadata.control_sliders as Record<string, number>;
  assert.equal(sliders.weirdness_constraint, 0.33);
  assert(!("style_weight" in sliders));
  assert.deepEqual(body.override_fields, []);
});

test("create body includes optional session metadata only when supplied", () => {
  const withoutSession = buildCreateBody({
    title: "verify probe",
    style: "lo-fi piano",
    transactionUuid: "tx-no-session"
  });
  const withoutMetadata = withoutSession.metadata;
  assert(!("create_session_token" in withoutMetadata));
  assert(!("user_tier" in withoutMetadata));

  const withSession = buildCreateBody({
    title: "verify probe",
    style: "lo-fi piano",
    transactionUuid: "tx-session",
    sessionToken: "session-secret",
    userTier: "tier-uuid"
  });
  const withMetadata = withSession.metadata;
  assert.equal(withMetadata.create_session_token, "session-secret");
  assert.equal(withMetadata.user_tier, "tier-uuid");
});

test("create dry-run rejects slider values outside 0-100", async () => {
  const tempDir = await fsTempDir();
  const low = await captureStdout(() => cliMain([
    ...baseCreateArgs(tempDir, "run_low"),
    "--weirdness", "-1"
  ]));
  const high = await captureStdout(() => cliMain([
    ...baseCreateArgs(tempDir, "run_high"),
    "--style-influence", "101"
  ]));
  const nonNumeric = await captureStdout(() => cliMain([
    ...baseCreateArgs(tempDir, "run_nan"),
    "--weirdness", "nope"
  ]));
  assert.equal(low.code, 2);
  assert.equal(low.json.status, "error");
  assert.match(low.json.error, /--weirdness/);
  assert.equal(high.code, 2);
  assert.match(high.json.error, /--style-influence/);
  assert.equal(nonNumeric.code, 2);
  assert.match(nonNumeric.json.error, /--weirdness/);
});

test("create dry-run rejects audio influence outside 0-100", async () => {
  const tempDir = await fsTempDir();
  const output = await captureStdout(() => cliMain([
    ...baseCreateArgs(tempDir, "run_audio_bad"),
    "--audio-influence", "101"
  ]));
  assert.equal(output.code, 2);
  assert.match(output.json.error, /--audio-influence/);
});

test("create --dry-run emits redacted body without live network", async () => {
  const tempDir = await fsTempDir();
  const output = await captureStdout(() => cliMain([
    "create",
    "--dry-run",
    "--data-dir", tempDir,
    "--title", "verify probe",
    "--style", "lo-fi piano",
    "--lyrics", "rain",
    "--captcha-token", "captcha-secret",
    "--token-provider", "hcaptcha",
    "--run-id", "run_dry"
  ]));
  assert.equal(output.code, 0);
  assert.equal(output.json.status, "dry_run");
  assert.equal(output.json.endpoint, "https://studio-api-prod.suno.com/api/generate/v2-web/");
  assert.equal(output.json.body.tags, "lo-fi piano");
  assert.equal(output.json.body.token, "[REDACTED]");
  assert.equal(output.json.liveFire, false);
});

test("create dry-run reuses transaction_uuid for same run id", async () => {
  const tempDir = await fsTempDir();
  const first = await captureStdout(() => cliMain(baseCreateArgs(tempDir, "run_same")));
  const second = await captureStdout(() => cliMain(baseCreateArgs(tempDir, "run_same")));
  assert.equal(first.code, 0);
  assert.equal(second.code, 0);
  assert.equal(second.json.transactionUuid, first.json.transactionUuid);
});

test("create dry-run blocks same run id with different request", async () => {
  const tempDir = await fsTempDir();
  const first = await captureStdout(() => cliMain(baseCreateArgs(tempDir, "run_mismatch")));
  const second = await captureStdout(() => cliMain([
    "create",
    "--dry-run",
    "--data-dir", tempDir,
    "--title", "different",
    "--style", "lo-fi piano",
    "--lyrics", "rain",
    "--run-id", "run_mismatch",
    "--min-minutes-between-creates", "0"
  ]));
  assert.equal(first.code, 0);
  assert.equal(second.code, 32);
});

test("create budget gate fails closed", async () => {
  const tempDir = await fsTempDir();
  const ledger = new LedgerStore(path.join(tempDir, "runs.json"));
  const now = new Date().toISOString();
  await ledger.upsertRun({
    runId: "prior",
    transactionUuid: "prior-tx",
    clipIds: [],
    songUrls: [],
    status: "reserved",
    createdAt: now,
    updatedAt: now
  });
  const output = await captureStdout(() => cliMain([
    ...baseCreateArgs(tempDir, "run_block"),
    "--max-generations-per-day", "1",
    "--min-minutes-between-creates", "0"
  ]));
  assert.equal(output.code, 32);
  assert.equal(output.json.ok, false);
});

test("ledger reserve writes atomically without temp leftovers", async () => {
  const tempDir = await fsTempDir();
  const ledger = new LedgerStore(path.join(tempDir, "runs.json"));
  await ledger.reserveCreateRun({
    runId: "atomic_run",
    transactionUuid: "atomic-tx",
    requestHash: "hash",
    creditsReserved: 10,
    policy: { maxGenerationsPerDay: 4, minMinutesBetweenCreates: 0 },
    now: new Date()
  });
  const stored = await ledger.findRun("atomic_run");
  const files = await fs.readdir(tempDir);
  assert.equal(stored?.transactionUuid, "atomic-tx");
  assert(!files.some((file) => file.endsWith(".tmp")));
});

test("create live-fire path is blocked without manual gate", async () => {
  const tempDir = await fsTempDir();
  const output = await captureStdout(() => cliMain([
    "create",
    "--data-dir", tempDir,
    "--title", "verify probe",
    "--style", "lo-fi piano"
  ]));
  assert.equal(output.code, 32);
  assert.equal(output.json.status, "manual_gate_required");
});

test("create --live submits null captcha fields when captcha token is omitted", async () => {
  const tempDir = await fsTempDir();
  const { restore, getGenerateBody } = mockLiveFetch(200, {
    id: "batch_null_captcha",
    clips: [{ id: LIVE_CLIP_ID }]
  });
  try {
    const output = await captureStdout(() => cliMain([
      "create",
      "--live",
      "--data-dir", tempDir,
      "--title", "verify probe",
      "--style", "lo-fi piano",
      "--run-id", "run_live_null_captcha",
      "--min-minutes-between-creates", "0"
    ]));
    const submittedBody = getGenerateBody();
    assert.equal(output.code, 0);
    assert.equal(output.json.status, "submitted");
    assert.equal(submittedBody.token, null);
    assert.equal(submittedBody.token_provider, null);
  } finally {
    restore();
  }
});

test("create --live injects mocked browser captcha mint before submit", async () => {
  const tempDir = await fsTempDir();
  const ledger = new LedgerStore(path.join(tempDir, "runs.json"));
  let submittedBody: any;
  const output = await captureStdout(() => createCommand({
    dryRun: false,
    live: true,
    title: "verify probe",
    style: "lo-fi piano",
    ledger,
    policy: { maxGenerationsPerDay: 4, minMinutesBetweenCreates: 0 },
    runId: "run_minted",
    captchaMinter: {
      mint: async (input) => {
        assert.equal(input.title, "verify probe");
        assert.equal(input.style, "lo-fi piano");
        return { token: "minted-captcha-secret", tokenProvider: 1 };
      }
    },
    submitter: {
      submit: async (body) => {
        submittedBody = body;
        return {
          response: { clips: [{ id: LIVE_CLIP_ID }] },
          clipIds: [LIVE_CLIP_ID],
          songUrls: [`https://suno.com/song/${LIVE_CLIP_ID}`]
        };
      }
    }
  }));
  assert.equal(output.code, 0);
  assert.equal(output.json.status, "submitted");
  assert.equal(submittedBody.token, "minted-captcha-secret");
  assert.equal(submittedBody.token_provider, 1);
  assert.equal(output.text.includes("minted-captcha-secret"), false);
});

test("create --live returns blocked login when cookie is missing", async () => {
  const tempDir = await fsTempDir();
  const originalCookie = process.env.SUNO_KIT_COOKIE;
  const originalCookieFile = process.env.SUNO_KIT_COOKIE_FILE;
  const originalJwt = process.env.SUNO_KIT_JWT;
  delete process.env.SUNO_KIT_COOKIE;
  delete process.env.SUNO_KIT_COOKIE_FILE;
  delete process.env.SUNO_KIT_JWT;
  try {
    const output = await captureStdout(() => cliMain([
      "create",
      "--live",
      "--data-dir", tempDir,
      "--title", "verify probe",
      "--style", "lo-fi piano",
      "--captcha-token", "captcha-secret",
      "--token-provider", "1",
      "--run-id", "run_live_missing_cookie",
      "--min-minutes-between-creates", "0"
    ]));
    assert.equal(output.code, 30);
    assert.equal(output.json.status, "blocked_login");
    assert.equal(output.json.recovery.next_command, "suno-cli login");
  } finally {
    restoreEnv("SUNO_KIT_COOKIE", originalCookie);
    restoreEnv("SUNO_KIT_COOKIE_FILE", originalCookieFile);
    restoreEnv("SUNO_KIT_JWT", originalJwt);
  }
});

test("create --live requires integer token provider before submit", async () => {
  const tempDir = await fsTempDir();
  const missing = await captureStdout(() => cliMain([
    "create",
    "--live",
    "--data-dir", tempDir,
    "--title", "verify probe",
    "--style", "lo-fi piano",
    "--captcha-token", "captcha-secret"
  ]));
  const nonInteger = await captureStdout(() => cliMain([
    "create",
    "--live",
    "--data-dir", tempDir,
    "--title", "verify probe",
    "--style", "lo-fi piano",
    "--captcha-token", "captcha-secret",
    "--token-provider", "hcaptcha"
  ]));
  assert.equal(missing.code, 2);
  assert.match(missing.json.error, /token-provider/);
  assert.equal(nonInteger.code, 2);
  assert.match(nonInteger.json.error, /integer/);
});

test("create --live submits mocked generate request and extracts song URLs", async () => {
  const tempDir = await fsTempDir();
  const { restore, getGenerateBody } = mockLiveFetch(200, {
    id: "batch_1",
    clips: [{ id: LIVE_CLIP_ID }]
  });
  try {
    const output = await captureStdout(() => cliMain([
      "create",
      "--live",
      "--data-dir", tempDir,
      "--title", "verify probe",
      "--style", "lo-fi piano",
      "--captcha-token", "captcha-secret",
      "--token-provider", "1",
      "--session-token", "session-secret",
      "--user-tier", "tier-uuid",
      "--run-id", "run_live_ok",
      "--min-minutes-between-creates", "0"
    ]));
    const submittedBody = getGenerateBody();
    const metadata = submittedBody.metadata;
    assert.equal(output.code, 0);
    assert.equal(output.json.status, "submitted");
    assert.equal(output.json.clips[0].clipId, LIVE_CLIP_ID);
    assert.equal(output.json.clips[0].songUrl, `https://suno.com/song/${LIVE_CLIP_ID}`);
    assert.deepEqual(submittedBody.override_fields, []);
    assert.equal(submittedBody.token_provider, 1);
    assert.equal(metadata.create_session_token, "session-secret");
    assert.equal(metadata.user_tier, "tier-uuid");
    assert.equal(output.text.includes("captcha-secret"), false);
    assert.equal(output.text.includes("session-secret"), false);
  } finally {
    restore();
  }
});

test("create --live maps mocked generate HTTP failures to stable exit codes", async () => {
  const cases = [
    { status: 401, expected: 30 },
    { status: 402, expected: 32 },
    { status: 500, expected: 50 }
  ];
  for (const item of cases) {
    const tempDir = await fsTempDir();
    const { restore } = mockLiveFetch(item.status, { error: "blocked" });
    try {
      const output = await captureStdout(() => cliMain([
        "create",
        "--live",
        "--data-dir", tempDir,
        "--title", "verify probe",
        "--style", "lo-fi piano",
        "--captcha-token", "captcha-secret",
        "--token-provider", "1",
        "--run-id", `run_live_${item.status}`,
        "--min-minutes-between-creates", "0"
      ]));
      assert.equal(output.code, item.expected);
    } finally {
      restore();
    }
  }
});

function baseCreateArgs(tempDir: string, runId: string): string[] {
  return [
    "create",
    "--dry-run",
    "--data-dir", tempDir,
    "--title", "verify probe",
    "--style", "lo-fi piano",
    "--lyrics", "rain",
    "--run-id", runId,
    "--min-minutes-between-creates", "0"
  ];
}

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
  return fs.mkdtemp(path.join(os.tmpdir(), "suno-cli-test-"));
}

function mockLiveFetch(generateStatus: number, generatePayload: unknown): {
  restore: () => void;
  getGenerateBody: () => any;
} {
  const originalFetch = globalThis.fetch;
  const originalCookie = process.env.SUNO_KIT_COOKIE;
  const originalCookieFile = process.env.SUNO_KIT_COOKIE_FILE;
  let generateBody: any;
  process.env.SUNO_KIT_COOKIE = "__session=session-cookie-value";
  delete process.env.SUNO_KIT_COOKIE_FILE;
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    if (url.includes("/tokens")) {
      return new Response(JSON.stringify({ jwt: "jwt-secret" }), { status: 200, headers: { "content-type": "application/json" } });
    }
    if (url.includes("auth.suno.com/v1/client")) {
      return new Response(JSON.stringify({ response: { sessions: [{ id: "sess_1" }] } }), { status: 200, headers: { "content-type": "application/json" } });
    }
    if (url.includes("/api/generate/v2-web/")) {
      const bodyText = typeof init?.body === "string" ? init.body : "";
      generateBody = JSON.parse(bodyText);
      return new Response(JSON.stringify(generatePayload), { status: generateStatus, headers: { "content-type": "application/json" } });
    }
    throw new Error(`unexpected fetch: ${url}`);
  }) as typeof fetch;
  return {
    restore: () => {
      globalThis.fetch = originalFetch;
      restoreEnv("SUNO_KIT_COOKIE", originalCookie);
      restoreEnv("SUNO_KIT_COOKIE_FILE", originalCookieFile);
    },
    getGenerateBody: () => generateBody
  };
}

function restoreEnv(key: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
}
