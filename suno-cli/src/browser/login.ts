import { clerkTokenFromJwt } from "../auth/clerk.js";
import { BrowserContext, launchPersistentBrowser } from "./captcha.js";

export interface CapturedSession {
  jwt?: string;
  cookie?: string;
  sessionId?: string;
  expiresAt?: string;
}

export interface CaptureBrowserSessionInput {
  profileDir: string;
  loginUrl: string;
  timeoutMs: number;
}

export class LoginTimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LoginTimeoutError";
  }
}

interface CookieRecord {
  name: string;
  value: string;
  domain: string;
}

interface LoginBrowserContext extends BrowserContext {
  cookies(): Promise<CookieRecord[]>;
}

interface LoginPage {
  goto(url: string, options: Record<string, unknown>): Promise<unknown>;
  evaluate<T>(callback: () => T | Promise<T>): Promise<T>;
}

const SUNO_DOMAIN_RE = /(^|\.)suno\.(com|ai)$/i;
const POLL_INTERVAL_MS = 1000;

// Minimal login state capture: headed browser -> user logs in manually -> we read the
// authenticated Clerk cookies. Advanced flows (MFA, social login, Cloudflare interstitial,
// payment modal) are intentionally left for a later phase.
// TODO(phase-2c): detect and surface MFA / social-login / Cloudflare / payment states.
export async function captureBrowserSession(input: CaptureBrowserSessionInput): Promise<CapturedSession> {
  const context = (await launchPersistentBrowser({
    profileDir: input.profileDir,
    headless: false
  })) as LoginBrowserContext;
  try {
    const page = (await context.newPage()) as unknown as LoginPage;
    await page.goto(input.loginUrl, { waitUntil: "domcontentloaded", timeout: input.timeoutMs });
    const deadline = Date.now() + input.timeoutMs;
    while (Date.now() < deadline) {
      const captured = await readSunoSession(context, page);
      if (captured) return captured;
      await delay(POLL_INTERVAL_MS);
    }
    throw new LoginTimeoutError("Timed out waiting for Suno login in the browser.");
  } finally {
    await context.close().catch(() => undefined);
  }
}

async function readSunoSession(context: LoginBrowserContext, page: LoginPage): Promise<CapturedSession | undefined> {
  const cookies = (await context.cookies().catch(() => [])) as CookieRecord[];
  const sunoCookies = cookies.filter((cookie) => SUNO_DOMAIN_RE.test(cookie.domain.replace(/^\./, "")));
  const hasSession = sunoCookies.some((cookie) => cookie.name === "__session");
  if (!hasSession) return undefined;
  const cookieHeader = sunoCookies.map((cookie) => `${cookie.name}=${cookie.value}`).join("; ");
  const jwt = await readClerkJwt(page);
  if (jwt) {
    const token = clerkTokenFromJwt(jwt);
    return {
      jwt,
      cookie: cookieHeader,
      ...(token.sessionId ? { sessionId: token.sessionId } : {}),
      ...(token.expiresAt ? { expiresAt: token.expiresAt } : {})
    };
  }
  return { cookie: cookieHeader };
}

async function readClerkJwt(page: LoginPage): Promise<string | undefined> {
  const jwt = await page
    .evaluate(async () => {
      const clerk = (globalThis as { Clerk?: { session?: { getToken?: () => Promise<string> } } }).Clerk;
      const getToken = clerk?.session?.getToken;
      if (typeof getToken !== "function") return "";
      try {
        return (await getToken.call(clerk?.session)) ?? "";
      } catch {
        return "";
      }
    })
    .catch(() => "");
  return typeof jwt === "string" && jwt.length > 0 ? jwt : undefined;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
