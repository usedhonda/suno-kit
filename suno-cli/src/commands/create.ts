import { randomUUID } from "node:crypto";
import { ClerkAuthOptions } from "../auth/clerk.js";
import { buildCreateBody, CreateInput, hashCreateBody } from "../create/body.js";
import { GENERATE_ENDPOINT, GenerateHttpError, GenerateSubmitter, HttpGenerateSubmitter } from "../http/generate.js";
import { BudgetPolicy, LedgerStore, RunRecord } from "../ledger/store.js";
import { commandError, ExitCode, recoveryForStatus, writeJson } from "./output.js";

export interface CreateCommandOptions extends CreateInput {
  dryRun: boolean;
  live?: boolean;
  runId?: string;
  ledger: LedgerStore;
  policy: BudgetPolicy;
  authOptions?: ClerkAuthOptions;
  submitter?: GenerateSubmitter;
  captchaMinter?: CaptchaMinter;
  now?: Date;
}

export interface CaptchaMintInput extends CreateInput {}

export interface CaptchaMintResult {
  token: string;
  tokenProvider: number;
}

export interface CaptchaMinter {
  mint(input: CaptchaMintInput): Promise<CaptchaMintResult>;
}

export async function createCommand(options: CreateCommandOptions): Promise<number> {
  if (!options.dryRun && !options.live) {
    writeJson({
      ok: false,
      status: "manual_gate_required",
      error: "Live create submit is disabled in this build. Re-run with --dry-run; live-fire requires explicit owner GO."
    });
    return ExitCode.blockedPaymentOrQuota;
  }
  let completedOptions: CreateCommandOptions;
  try {
    completedOptions = await withLiveCaptcha(options);
  } catch (error) {
    if (error instanceof CommandExit) return error.code;
    throw error;
  }
  if (completedOptions.live && completedOptions.tokenProvider === undefined) {
    writeJson(commandError("usage", "Usage: create --live requires --token-provider <integer>."));
    return ExitCode.usage;
  }
  if (completedOptions.live && !Number.isSafeInteger(completedOptions.tokenProvider)) {
    writeJson(commandError("usage", "Usage: --token-provider must be an integer for --live."));
    return ExitCode.usage;
  }
  const provisionalBody = buildCreateBody(completedOptions);
  const requestHash = hashCreateBody(provisionalBody);
  const runId = completedOptions.runId ?? `run_${randomUUID()}`;
  const reserved = await completedOptions.ledger.reserveCreateRun({
    runId,
    transactionUuid: provisionalBody.transaction_uuid,
    requestHash,
    creditsReserved: 10,
    policy: completedOptions.policy,
    now: completedOptions.now ?? new Date()
  });
  const transactionUuid = reserved.transactionUuid ?? provisionalBody.transaction_uuid;
  const bodyInput: CreateInput = {
    title: completedOptions.title,
    style: completedOptions.style,
    transactionUuid
  };
  if (completedOptions.exclude) bodyInput.exclude = completedOptions.exclude;
  if (completedOptions.lyrics) bodyInput.lyrics = completedOptions.lyrics;
  if (completedOptions.instrumental !== undefined) bodyInput.instrumental = completedOptions.instrumental;
  if (completedOptions.model) bodyInput.model = completedOptions.model;
  if (completedOptions.vocalGender) bodyInput.vocalGender = completedOptions.vocalGender;
  if (completedOptions.token) bodyInput.token = completedOptions.token;
  if (completedOptions.tokenProvider !== undefined) bodyInput.tokenProvider = completedOptions.tokenProvider;
  if (completedOptions.weirdness !== undefined) bodyInput.weirdness = completedOptions.weirdness;
  if (completedOptions.styleInfluence !== undefined) bodyInput.styleInfluence = completedOptions.styleInfluence;
  if (completedOptions.personaId) bodyInput.personaId = completedOptions.personaId;
  if (completedOptions.coverClipId) bodyInput.coverClipId = completedOptions.coverClipId;
  if (completedOptions.coverStartS !== undefined) bodyInput.coverStartS = completedOptions.coverStartS;
  if (completedOptions.coverEndS !== undefined) bodyInput.coverEndS = completedOptions.coverEndS;
  if (completedOptions.audioInfluence !== undefined) bodyInput.audioInfluence = completedOptions.audioInfluence;
  if (completedOptions.sessionToken) bodyInput.sessionToken = completedOptions.sessionToken;
  if (completedOptions.userTier) bodyInput.userTier = completedOptions.userTier;
  const body = buildCreateBody(bodyInput);
  const finalRequestHash = hashCreateBody(body);
  if (completedOptions.live) {
    const submitter = completedOptions.submitter ?? new HttpGenerateSubmitter(completedOptions.authOptions ?? {});
    try {
      const result = await submitter.submit(body);
      const updated: RunRecord = {
        ...reserved,
        clipIds: result.clipIds,
        songUrls: result.songUrls,
        status: "submitted",
        updatedAt: (completedOptions.now ?? new Date()).toISOString()
      };
      if (result.batchId) updated.batchId = result.batchId;
      await options.ledger.upsertRun(updated);
      writeJson({
        ok: true,
        status: "submitted",
        endpoint: GENERATE_ENDPOINT,
        method: "POST",
        runId: reserved.runId,
        transactionUuid: reserved.transactionUuid,
        requestHash: finalRequestHash,
        creditsReserved: reserved.creditsReserved ?? 10,
        liveFire: true,
        clips: result.clipIds.map((clipId, index) => ({
          clipId,
          songUrl: result.songUrls[index] ?? `https://suno.com/song/${clipId}`
        })),
        response: result.response
      });
      return ExitCode.ok;
    } catch (error) {
      if (error instanceof GenerateHttpError) {
        const recovery = recoveryForStatus(error.status);
        writeJson({
          ...commandError(error.status, error.message, error.details),
          ...(recovery ? { recovery } : {})
        });
        return error.exitCode;
      }
      throw error;
    }
  }
  writeJson({
    ok: true,
    status: "dry_run",
    endpoint: GENERATE_ENDPOINT,
    method: "POST",
    runId: reserved.runId,
    transactionUuid: reserved.transactionUuid,
    requestHash: finalRequestHash,
    creditsReserved: reserved.creditsReserved ?? 10,
    liveFire: false,
    body
  });
  return ExitCode.ok;
}

async function withLiveCaptcha(options: CreateCommandOptions): Promise<CreateCommandOptions> {
  if (!options.live || options.token) return options;
  if (!options.captchaMinter) {
    writeJson({
      ok: false,
      status: "captcha_required",
      error: "Usage: create --live requires browser captcha minting or --captcha-token.",
      recovery: {
        next_command: "npm install playwright && npx playwright install chromium"
      }
    });
    throw new CommandExit(ExitCode.usage);
  }
  try {
    const minted = await options.captchaMinter.mint(options);
    return {
      ...options,
      token: minted.token,
      tokenProvider: minted.tokenProvider
    };
  } catch (error) {
    if (isCaptchaMintFailure(error)) {
      writeJson({
        ok: false,
        status: error.status,
        error: error.message,
        recovery: recoveryForStatus(error.status) ?? error.recovery
      });
      throw new CommandExit(error.exitCode);
    }
    throw error;
  }
}

class CommandExit extends Error {
  constructor(public readonly code: number) {
    super(`Command exited with code ${code}`);
  }
}

function isCaptchaMintFailure(error: unknown): error is {
  status: string;
  message: string;
  recovery?: unknown;
  exitCode: number;
} {
  const item = error as { status?: unknown; message?: unknown; exitCode?: unknown };
  return typeof item.status === "string" && typeof item.message === "string" && typeof item.exitCode === "number";
}
