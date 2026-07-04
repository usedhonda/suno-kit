import { clerkTokenFromJwt } from "../auth/clerk.js";
import { SavedSession, saveSession } from "../auth/session.js";
import { commandError, ExitCode, writeJson } from "./output.js";

export interface CapturedSession {
  jwt?: string;
  cookie?: string;
  sessionId?: string;
  expiresAt?: string;
}

export interface BrowserSessionCapturer {
  capture(input: { profileDir: string; loginUrl: string; timeoutMs: number }): Promise<CapturedSession>;
}

export interface LoginCommandOptions {
  sessionFile: string;
  profileDir: string;
  jwtPaste?: string;
  cookiePaste?: string;
  loginUrl?: string;
  timeoutMs?: number;
  capturer?: BrowserSessionCapturer;
  now?: Date;
}

const DEFAULT_LOGIN_URL = "https://suno.com/";
const DEFAULT_TIMEOUT_MS = 120_000;
const INSTALL_RECOVERY = {
  next_command: "npm install playwright && npx playwright install chromium"
};

export async function loginCommand(options: LoginCommandOptions): Promise<number> {
  const now = options.now ?? new Date();

  if (options.cookiePaste !== undefined) {
    const cookie = options.cookiePaste.trim();
    if (!cookie) {
      writeJson(commandError("usage", "Usage: --cookie-paste requires a non-empty cookie value."));
      return ExitCode.usage;
    }
    const session: SavedSession = { cookie, savedAt: now.toISOString() };
    await saveSession(options.sessionFile, session);
    writeJson({ ok: true, status: "login_success", method: "cookie_paste", stored: true });
    return ExitCode.ok;
  }

  if (options.jwtPaste !== undefined) {
    const jwt = options.jwtPaste.trim();
    if (!jwt) {
      writeJson(commandError("usage", "Usage: --jwt-paste requires a non-empty JWT value."));
      return ExitCode.usage;
    }
    const token = clerkTokenFromJwt(jwt);
    const session: SavedSession = { jwt, savedAt: now.toISOString() };
    if (token.sessionId) session.sessionId = token.sessionId;
    if (token.expiresAt) session.expiresAt = token.expiresAt;
    await saveSession(options.sessionFile, session);
    writeJson({
      ok: true,
      status: "login_success",
      method: "jwt_paste",
      stored: true,
      ...(token.expiresAt ? { expiresAt: token.expiresAt } : {})
    });
    return ExitCode.ok;
  }

  if (!options.capturer) {
    writeJson({
      ok: false,
      status: "browser_required",
      error: "Browser login requires Playwright. Install it or re-run with --jwt-paste <jwt>.",
      recovery: INSTALL_RECOVERY
    });
    return ExitCode.usage;
  }

  try {
    const captured = await options.capturer.capture({
      profileDir: options.profileDir,
      loginUrl: options.loginUrl ?? DEFAULT_LOGIN_URL,
      timeoutMs: options.timeoutMs ?? DEFAULT_TIMEOUT_MS
    });
    if (!captured.jwt && !captured.cookie) {
      writeJson({
        ok: false,
        status: "not_logged_in",
        error: "No Suno session was detected before the browser closed.",
        recovery: { next_command: "suno-cli login" }
      });
      return ExitCode.blockedLogin;
    }
    const session: SavedSession = { savedAt: now.toISOString() };
    if (captured.jwt) session.jwt = captured.jwt;
    if (captured.cookie) session.cookie = captured.cookie;
    if (captured.sessionId) session.sessionId = captured.sessionId;
    if (captured.expiresAt) session.expiresAt = captured.expiresAt;
    await saveSession(options.sessionFile, session);
    writeJson({
      ok: true,
      status: "login_success",
      method: "browser",
      stored: true,
      ...(captured.expiresAt ? { expiresAt: captured.expiresAt } : {})
    });
    return ExitCode.ok;
  } catch (error) {
    if (isLoginTimeout(error)) {
      writeJson({
        ok: false,
        status: "login_timeout",
        error: "Timed out waiting for Suno login.",
        recovery: { next_command: "suno-cli login --jwt-paste <jwt>" }
      });
      return ExitCode.blockedLogin;
    }
    if (isBrowserRequired(error)) {
      writeJson({
        ok: false,
        status: "browser_required",
        error: error instanceof Error ? error.message : String(error),
        recovery: { next_command: "npx playwright install chromium" }
      });
      return ExitCode.usage;
    }
    throw error;
  }
}

function isLoginTimeout(error: unknown): boolean {
  return error instanceof Error && error.name === "LoginTimeoutError";
}

function isBrowserRequired(error: unknown): boolean {
  return Boolean(error) && (error as { status?: unknown }).status === "browser_required";
}
