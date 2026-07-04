import { safeJson } from "../safety/redact.js";

export const ExitCode = {
  ok: 0,
  usage: 2,
  blockedLogin: 30,
  blockedPaymentOrQuota: 32,
  schemaDrift: 40,
  retryableUnknown: 50,
  internal: 70
} as const;

export function writeJson(value: unknown): void {
  process.stdout.write(safeJson(value));
}

export function commandError(status: string, message: string, details?: unknown): { ok: false; status: string; error: string; details?: unknown } {
  return {
    ok: false,
    status,
    error: message,
    ...(details === undefined ? {} : { details })
  };
}

// Single source of truth for recovery hints. Keeps blocked_login / captcha /
// quota / network errors pointing at one actionable next_command.
export function recoveryForStatus(status: string): { next_command: string } | undefined {
  switch (status) {
    case "blocked_login":
    case "blocked_captcha":
    case "captcha_required":
      return { next_command: "suno-cli login" };
    case "browser_required":
      return { next_command: "npm install playwright && npx playwright install chromium" };
    case "blocked_payment_or_quota":
      return { next_command: "# check your Suno plan and credit balance, then re-run" };
    case "retryable_unknown":
    case "network":
      return { next_command: "# transient error: wait, then re-run the same command" };
    default:
      return undefined;
  }
}

export function statusForExitCode(code: number): string {
  switch (code) {
    case ExitCode.blockedLogin:
      return "blocked_login";
    case ExitCode.blockedPaymentOrQuota:
      return "blocked_payment_or_quota";
    case ExitCode.retryableUnknown:
      return "retryable_unknown";
    default:
      return "unknown";
  }
}

export function classifyError(error: unknown): number {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("cookie is required")) return ExitCode.blockedLogin;
  if (message.startsWith("Usage:")) return ExitCode.usage;
  if (message.includes("Ledger is corrupt")) return ExitCode.schemaDrift;
  if (message.includes("Budget gate blocked")) return ExitCode.blockedPaymentOrQuota;
  if (message.includes("fetch") || message.includes("network") || message.includes("request failed")) return ExitCode.retryableUnknown;
  return ExitCode.internal;
}
