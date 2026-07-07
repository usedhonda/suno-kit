#!/usr/bin/env node
import { realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createCommandContext } from "./commands/context.js";
import { createCommand, CreateCommandOptions } from "./commands/create.js";
import { downloadCommand } from "./commands/download.js";
import { loginCommand, LoginCommandOptions } from "./commands/login.js";
import { logoutCommand } from "./commands/logout.js";
import { commandError, ExitCode, classifyError, recoveryForStatus, statusForExitCode, writeJson } from "./commands/output.js";
import { resolveTarget } from "./commands/resolve-target.js";
import { statusCommand } from "./commands/status.js";
import { urlsCommand } from "./commands/urls.js";
import { resolvePathConfig } from "./config/paths.js";
import { LedgerStore } from "./ledger/store.js";
import { redactString } from "./safety/redact.js";

interface ParsedArgs {
  help?: boolean | undefined;
  command?: string | undefined;
  target?: string | undefined;
  dataDir?: string | undefined;
  cookieFile?: string | undefined;
  jwt?: string | undefined;
  jwtPaste?: string | undefined;
  cookiePaste?: string | undefined;
  outDir?: string | undefined;
  pollMs?: number | undefined;
  timeoutMs?: number | undefined;
  dryRun?: boolean | undefined;
  live?: boolean | undefined;
  title?: string | undefined;
  style?: string | undefined;
  exclude?: string | undefined;
  lyrics?: string | undefined;
  instrumental?: boolean | undefined;
  model?: string | undefined;
  vocalGender?: string | undefined;
  captchaToken?: string | undefined;
  tokenProvider?: string | number | undefined;
  weirdness?: number | undefined;
  styleInfluence?: number | undefined;
  personaId?: string | undefined;
  coverClipId?: string | undefined;
  coverStartS?: number | undefined;
  coverEndS?: number | undefined;
  audioInfluence?: number | undefined;
  sessionToken?: string | undefined;
  userTier?: string | undefined;
  runId?: string | undefined;
  maxGenerationsPerDay?: number | undefined;
  minMinutesBetweenCreates?: number | undefined;
}

export async function cliMain(argv: string[]): Promise<number> {
  try {
    return await runCli(argv);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    const code = classifyError(error);
    const recovery = recoveryForStatus(statusForExitCode(code));
    const payload = commandError("error", redactString(message));
    writeJson(recovery ? { ...payload, recovery } : payload);
    return code;
  }
}

async function runCli(argv: string[]): Promise<number> {
  const args = parseArgs(argv);
  if (args.help || !args.command) {
    usage();
    return ExitCode.ok;
  }
  if (!["status", "urls", "download", "create", "login", "logout"].includes(args.command)) {
    writeJson(commandError("usage", `Unsupported command: ${args.command}`));
    return ExitCode.usage;
  }
  if (args.command === "create") {
    return runCreate(args);
  }
  if (args.command === "login") {
    return runLogin(args);
  }
  if (args.command === "logout") {
    return runLogout(args);
  }
  if (!args.target) {
    writeJson(commandError("usage", `${args.command} requires <run-id|clip-id|song-url>.`));
    return ExitCode.usage;
  }
  const paths = resolvePathConfig(compactPathOptions(args));
  const ledgerOnly = new LedgerStore(paths.ledgerPath);
  const resolved = await resolveTarget(args.target, ledgerOnly);
  if (resolved.clipIds.length === 0) {
    writeJson(commandError("not_found", `No ledger run or clip id matched: ${args.target}`));
    return ExitCode.usage;
  }
  const contextOptions: { dataDir?: string; cookieFile?: string; jwt?: string } = {};
  if (args.dataDir) contextOptions.dataDir = args.dataDir;
  if (args.cookieFile) contextOptions.cookieFile = args.cookieFile;
  if (args.jwt) contextOptions.jwt = args.jwt;
  const context = await createCommandContext(contextOptions);
  if (args.command === "status") return statusCommand(args.target, context);
  if (args.command === "urls") return urlsCommand(args.target, context);
  if (!args.outDir) {
    writeJson(commandError("usage", "download requires --out <dir>."));
    return ExitCode.usage;
  }
  return downloadCommand(args.target, {
    outDir: args.outDir,
    pollMs: args.pollMs ?? 5000,
    timeoutMs: args.timeoutMs ?? 0
  }, context);
}

async function runCreate(args: ParsedArgs): Promise<number> {
  const paths = resolvePathConfig(compactPathOptions(args));
  const ledger = new LedgerStore(paths.ledgerPath);
  const createOptions: CreateCommandOptions = {
    dryRun: Boolean(args.dryRun),
    live: Boolean(args.live),
    title: args.title ?? "",
    style: args.style ?? "",
    ledger,
    policy: {
      maxGenerationsPerDay: args.maxGenerationsPerDay ?? 4,
      minMinutesBetweenCreates: args.minMinutesBetweenCreates ?? 20
    },
    authOptions: { ...compactAuthOptions(args), sessionFile: paths.sessionFile }
  };
  if (args.exclude) Object.assign(createOptions, { exclude: args.exclude });
  if (args.lyrics) Object.assign(createOptions, { lyrics: args.lyrics });
  if (args.instrumental !== undefined) Object.assign(createOptions, { instrumental: args.instrumental });
  if (args.model) Object.assign(createOptions, { model: args.model });
  if (args.vocalGender) Object.assign(createOptions, { vocalGender: args.vocalGender });
  if (args.captchaToken) Object.assign(createOptions, { token: args.captchaToken });
  if (args.tokenProvider !== undefined) Object.assign(createOptions, { tokenProvider: args.tokenProvider });
  if (args.weirdness !== undefined) Object.assign(createOptions, { weirdness: args.weirdness });
  if (args.styleInfluence !== undefined) Object.assign(createOptions, { styleInfluence: args.styleInfluence });
  if (args.personaId) Object.assign(createOptions, { personaId: args.personaId });
  if (args.coverClipId) Object.assign(createOptions, { coverClipId: args.coverClipId });
  if (args.coverStartS !== undefined) Object.assign(createOptions, { coverStartS: args.coverStartS });
  if (args.coverEndS !== undefined) Object.assign(createOptions, { coverEndS: args.coverEndS });
  if (args.audioInfluence !== undefined) Object.assign(createOptions, { audioInfluence: args.audioInfluence });
  const sessionToken = args.sessionToken ?? process.env.SUNO_CREATE_SESSION_TOKEN;
  const userTier = args.userTier ?? process.env.SUNO_USER_TIER;
  if (sessionToken) Object.assign(createOptions, { sessionToken });
  if (userTier) Object.assign(createOptions, { userTier });
  if (args.runId) Object.assign(createOptions, { runId: args.runId });
  // Auto-mint captcha for live create. When no --captcha-token is supplied we drive
  // the logged-in browser profile from `suno-cli login` so Suno's own invisible
  // hCaptcha mints a token. rebrowser-playwright (loaded in captcha.ts) avoids the
  // CDP automation leak; the mint aborts the real generate request so no credits
  // are spent while capturing token + token_provider.
  if (createOptions.live && !args.captchaToken) {
    const { createBrowserCaptchaMinter } = await import("./browser/captcha.js");
    Object.assign(createOptions, {
      captchaMinter: createBrowserCaptchaMinter({
        profileDir: paths.browserProfileDir,
        headless: false
      })
    });
  }
  return createCommand(createOptions);
}

async function runLogin(args: ParsedArgs): Promise<number> {
  const paths = resolvePathConfig(compactPathOptions(args));
  const loginOptions: LoginCommandOptions = {
    sessionFile: paths.sessionFile,
    profileDir: paths.browserProfileDir
  };
  if (args.timeoutMs) loginOptions.timeoutMs = args.timeoutMs;
  if (args.jwtPaste !== undefined) {
    loginOptions.jwtPaste = args.jwtPaste;
  } else if (args.cookiePaste !== undefined) {
    loginOptions.cookiePaste = args.cookiePaste;
  } else {
    const login = await import("./browser/login.js");
    loginOptions.capturer = {
      capture: (input) => login.captureBrowserSession(input)
    };
  }
  return loginCommand(loginOptions);
}

async function runLogout(args: ParsedArgs): Promise<number> {
  const paths = resolvePathConfig(compactPathOptions(args));
  return logoutCommand({
    sessionFile: paths.sessionFile,
    profileDir: paths.browserProfileDir
  });
}

function parseArgs(argv: string[]): ParsedArgs {
  const result: ParsedArgs = {};
  const rest: string[] = [];
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--data-dir") {
      result.dataDir = argv[index + 1];
      index += 1;
    } else if (arg === "--cookie-file") {
      result.cookieFile = argv[index + 1];
      index += 1;
    } else if (arg === "--jwt") {
      result.jwt = parseNonEmptyStringFlag("--jwt", argv[index + 1]);
      index += 1;
    } else if (arg === "--jwt-paste") {
      result.jwtPaste = argv[index + 1] ?? "";
      index += 1;
    } else if (arg === "--cookie-paste") {
      result.cookiePaste = argv[index + 1] ?? "";
      index += 1;
    } else if (arg === "--out") {
      result.outDir = argv[index + 1];
      index += 1;
    } else if (arg === "--poll-ms") {
      result.pollMs = Number(argv[index + 1]);
      index += 1;
    } else if (arg === "--timeout-ms") {
      result.timeoutMs = Number(argv[index + 1]);
      index += 1;
    } else if (arg === "--dry-run") {
      result.dryRun = true;
    } else if (arg === "--live") {
      result.live = true;
    } else if (arg === "--title") {
      result.title = argv[index + 1];
      index += 1;
    } else if (arg === "--style") {
      result.style = argv[index + 1];
      index += 1;
    } else if (arg === "--exclude") {
      result.exclude = argv[index + 1];
      index += 1;
    } else if (arg === "--lyrics") {
      result.lyrics = argv[index + 1];
      index += 1;
    } else if (arg === "--instrumental") {
      result.instrumental = true;
    } else if (arg === "--model") {
      result.model = argv[index + 1];
      index += 1;
    } else if (arg === "--vocal-gender") {
      result.vocalGender = argv[index + 1];
      index += 1;
    } else if (arg === "--captcha-token") {
      result.captchaToken = argv[index + 1];
      index += 1;
    } else if (arg === "--token-provider") {
      result.tokenProvider = parseTokenProviderFlag(argv[index + 1]);
      index += 1;
    } else if (arg === "--weirdness") {
      result.weirdness = parsePercentFlag("--weirdness", argv[index + 1]);
      index += 1;
    } else if (arg === "--style-influence") {
      result.styleInfluence = parsePercentFlag("--style-influence", argv[index + 1]);
      index += 1;
    } else if (arg === "--persona-id") {
      result.personaId = parseNonEmptyStringFlag("--persona-id", argv[index + 1]);
      index += 1;
    } else if (arg === "--cover-clip-id") {
      result.coverClipId = parseNonEmptyStringFlag("--cover-clip-id", argv[index + 1]);
      index += 1;
    } else if (arg === "--cover-start-s") {
      result.coverStartS = parseNonNegativeNumberFlag("--cover-start-s", argv[index + 1]);
      index += 1;
    } else if (arg === "--cover-end-s") {
      result.coverEndS = parseNonNegativeNumberFlag("--cover-end-s", argv[index + 1]);
      index += 1;
    } else if (arg === "--audio-influence") {
      result.audioInfluence = parsePercentFlag("--audio-influence", argv[index + 1]);
      index += 1;
    } else if (arg === "--session-token") {
      result.sessionToken = parseNonEmptyStringFlag("--session-token", argv[index + 1]);
      index += 1;
    } else if (arg === "--user-tier") {
      result.userTier = parseNonEmptyStringFlag("--user-tier", argv[index + 1]);
      index += 1;
    } else if (arg === "--run-id") {
      result.runId = argv[index + 1];
      index += 1;
    } else if (arg === "--max-generations-per-day") {
      result.maxGenerationsPerDay = Number(argv[index + 1]);
      index += 1;
    } else if (arg === "--min-minutes-between-creates") {
      result.minMinutesBetweenCreates = Number(argv[index + 1]);
      index += 1;
    } else if (arg === "--json") {
      continue;
    } else if (arg === "--help" || arg === "-h") {
      result.help = true;
    } else if (arg?.startsWith("--")) {
      throw new Error(`Unknown option: ${arg}`);
    } else if (arg) {
      rest.push(arg);
    }
  }
  result.command = rest[0];
  result.target = rest[1];
  validateCoverArgs(result);
  return result;
}

function usage(): void {
  writeJson({
    ok: true,
    usage: [
      "suno-cli login [--jwt-paste <jwt>] [--cookie-paste <document.cookie>] [--timeout-ms <ms>] [--data-dir <dir>]",
      "suno-cli logout [--data-dir <dir>]",
      "suno-cli create --live --title <title> --style <style> [--lyrics <text>|--instrumental]",
      "suno-cli create --dry-run --title <title> --style <style> [--lyrics <text>|--instrumental]",
      "suno-cli status <run-id|clip-id|song-url> [--json] [--data-dir <dir>] [--cookie-file <file>] [--jwt <token>]",
      "suno-cli urls <run-id|clip-id|song-url> [--json] [--data-dir <dir>] [--cookie-file <file>] [--jwt <token>]",
      "suno-cli download <run-id|clip-id|song-url> --out <dir> [--timeout-ms <ms>] [--poll-ms <ms>] [--jwt <token>]",
      "advanced create: [--exclude <text>] [--weirdness 0-100] [--style-influence 0-100] [--audio-influence 0-100] [--persona-id <id>] [--cover-clip-id <id> --cover-start-s <sec> --cover-end-s <sec>]",
      "advanced auth/live: [--jwt <token>] [--session-token <token>] [--user-tier <uuid>] [--captcha-token <token> --token-provider <integer>]"
    ]
  });
}

function parsePercentFlag(flag: string, value: string | undefined): number {
  const parsed = Number(value);
  if (value === undefined || !Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
    throw new Error(`Usage: ${flag} must be a number from 0 to 100.`);
  }
  return parsed / 100;
}

function parseNonEmptyStringFlag(flag: string, value: string | undefined): string {
  if (value === undefined || value.length === 0) {
    throw new Error(`Usage: ${flag} requires a non-empty value.`);
  }
  return value;
}

function parseTokenProviderFlag(value: string | undefined): string | number {
  const raw = parseNonEmptyStringFlag("--token-provider", value);
  if (/^-?\d+$/.test(raw)) return Number(raw);
  return raw;
}

function parseNonNegativeNumberFlag(flag: string, value: string | undefined): number {
  const parsed = Number(value);
  if (value === undefined || !Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`Usage: ${flag} must be a non-negative number.`);
  }
  return parsed;
}

function validateCoverArgs(args: ParsedArgs): void {
  if (!args.coverClipId && (args.coverStartS !== undefined || args.coverEndS !== undefined)) {
    throw new Error("Usage: --cover-start-s/--cover-end-s require --cover-clip-id.");
  }
}

function compactPathOptions(args: ParsedArgs): { dataDir?: string; cookieFile?: string } {
  const options: { dataDir?: string; cookieFile?: string } = {};
  if (args.dataDir) options.dataDir = args.dataDir;
  if (args.cookieFile) options.cookieFile = args.cookieFile;
  return options;
}

function compactAuthOptions(args: ParsedArgs): { dataDir?: string; cookieFile?: string; jwt?: string } {
  const options: { dataDir?: string; cookieFile?: string; jwt?: string } = compactPathOptions(args);
  if (args.jwt) options.jwt = args.jwt;
  return options;
}

if (isDirectRun()) {
  cliMain(process.argv.slice(2))
    .then((code) => {
      process.exitCode = code;
    });
}

// Detect direct execution even when invoked through a symlinked `bin` (npx / global
// install): argv[1] is the symlink path while import.meta.url is the realpath, so
// compare resolved realpaths rather than the raw invocation string.
function isDirectRun(): boolean {
  const invoked = process.argv[1];
  if (!invoked) return false;
  try {
    return realpathSync(invoked) === fileURLToPath(import.meta.url);
  } catch {
    return false;
  }
}
