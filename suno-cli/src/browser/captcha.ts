import fs from "node:fs/promises";

export interface BrowserCaptchaMintOptions {
  profileDir: string;
  headless?: boolean;
  timeoutMs?: number;
  createUrl?: string;
  // Raw `document.cookie` string from a logged-in Suno session. When present it is
  // injected into the mint profile so suno.com/create opens logged-in and renders
  // hCaptcha instead of redirecting to the login page.
  cookieHeader?: string;
}

export interface CookieParam {
  name: string;
  value: string;
  domain: string;
  path: string;
}

export interface BrowserCaptchaMintInput {
  title: string;
  style: string;
  tokenProvider?: string | number;
}

export interface BrowserCaptchaMintResult {
  token: string;
  tokenProvider: number;
}

export interface RecoveryHint {
  next_command: string;
}

export class BrowserCaptchaMintError extends Error {
  constructor(
    public readonly status: "browser_required" | "captcha_required" | "captcha_mint_failed",
    message: string,
    public readonly recovery: RecoveryHint,
    public readonly exitCode = 50
  ) {
    super(message);
  }
}

export interface BrowserCaptchaMinter {
  mint(input: BrowserCaptchaMintInput): Promise<BrowserCaptchaMintResult>;
}

interface PlaywrightModule {
  chromium: {
    launchPersistentContext(userDataDir: string, options: Record<string, unknown>): Promise<BrowserContext>;
  };
}

export interface BrowserContext {
  newPage(): Promise<Page>;
  addCookies(cookies: CookieParam[]): Promise<void>;
  close(): Promise<void>;
}

export interface BrowserLaunchOptions {
  profileDir: string;
  headless?: boolean;
  viewport?: { width: number; height: number };
}

interface Page {
  route(pattern: string, handler: (route: Route, request: BrowserRequest) => Promise<void> | void): Promise<void>;
  exposeBinding(name: string, callback: (source: unknown, payload: unknown) => void): Promise<void>;
  addInitScript(script: string): Promise<void>;
  goto(url: string, options: Record<string, unknown>): Promise<unknown>;
  evaluate<T>(callback: () => T | Promise<T>): Promise<T>;
  evaluate<T, A>(callback: (arg: A) => T | Promise<T>, arg: A): Promise<T>;
  waitForTimeout(ms: number): Promise<void>;
}

interface Route {
  abort(errorCode?: string): Promise<void>;
}

interface BrowserRequest {
  postData(): string | null;
}

const DEFAULT_CREATE_URL = "https://suno.com/create";
// Generous window: the browser is headful, so if Suno shows an hCaptcha
// challenge the user solves it by hand before Suno fires the generate request
// we capture the token from. Invisible passes finish in a few seconds.
const DEFAULT_TIMEOUT_MS = 180_000;
const INSTALL_RECOVERY = {
  next_command: "npm install && npx playwright install chromium"
};

export function createBrowserCaptchaMinter(options: BrowserCaptchaMintOptions): BrowserCaptchaMinter {
  return {
    mint: (input) => mintBrowserCaptcha(input, options)
  };
}

export async function launchPersistentBrowser(options: BrowserLaunchOptions): Promise<BrowserContext> {
  const playwright = await loadPlaywright();
  await fs.mkdir(options.profileDir, { recursive: true });
  return playwright.chromium.launchPersistentContext(options.profileDir, {
    headless: options.headless ?? true,
    viewport: options.viewport ?? { width: 1280, height: 900 },
    // Force English UI so the form/button selectors are deterministic.
    locale: "en-US",
    // Chrome auto-adds --enable-automation, which flags the session to
    // hCaptcha's risk scoring. Suppress it (artist-runtime diff review,
    // 2026-07-09): reported by the peer suno-cli consumer as the delta vs.
    // the prior browser-worker driver that saw captcha far less often.
    ignoreDefaultArgs: ["--enable-automation"]
  });
}

// Machine-readable progress for consumers (e.g. an autopilot that must prompt a
// human to solve a challenge on a headless gateway). One JSON object per line on
// stderr; stdout keeps carrying only the final result JSON, so the contract is
// unchanged for callers that read stdout.
function emitProgress(event: string, extra?: Record<string, unknown>): void {
  try {
    process.stderr.write(`${JSON.stringify({ event, ...extra })}\n`);
  } catch {
    // best-effort; never break the mint on a progress write error
  }
}

// Poll for a visible hCaptcha challenge and announce it once so a headless
// consumer can notify a human to solve it. Returns a stop function.
function startChallengeDetector(page: Page, timeoutMs: number): () => void {
  let stopped = false;
  let announced = false;
  void (async () => {
    while (!stopped) {
      const visible = await page
        .evaluate(() =>
          Array.from(document.querySelectorAll("iframe")).some(
            (frame) => /hcaptcha/i.test(frame.src || "") && frame.getBoundingClientRect().width > 100
          )
        )
        .catch(() => false);
      if (visible && !announced) {
        announced = true;
        emitProgress("challenge_detected");
        emitProgress("awaiting_human_solve", { timeoutMs });
      }
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  })();
  return () => {
    stopped = true;
  };
}

export async function mintBrowserCaptcha(
  input: BrowserCaptchaMintInput,
  options: BrowserCaptchaMintOptions
): Promise<BrowserCaptchaMintResult> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const tokenProviderFallback = safeInteger(input.tokenProvider);
  let context: BrowserContext | undefined;
  try {
    emitProgress("mint_started");
    context = await launchPersistentBrowser({
      profileDir: options.profileDir,
      headless: options.headless ?? true
    });
    if (options.cookieHeader) {
      const cookies = parseCookieHeader(options.cookieHeader);
      if (cookies.length > 0) {
        await context.addCookies(cookies);
      }
    }
    const page = await context.newPage();
    const capture = createCaptureWaiter(timeoutMs, tokenProviderFallback);
    await page.exposeBinding("__sunoCliCaptureCaptcha", (_source, payload) => {
      capture.accept(payload);
    });
    // Match any generate sub-path (not just v2-web) so a paid create can never
    // slip through un-aborted while we only wanted to mint the token from it.
    await page.route("**/api/generate/**", async (route, request) => {
      capture.accept(parseMaybeJson(request.postData()));
      await route.abort("blockedbyclient");
    });
    await page.addInitScript(CAPTURE_INIT_SCRIPT);
    await page.goto(options.createUrl ?? DEFAULT_CREATE_URL, {
      waitUntil: "domcontentloaded",
      timeout: timeoutMs
    });
    // Trigger Suno's real generate flow instead of calling hcaptcha.execute()
    // directly ("No hCaptcha exists" — the widget is only rendered mid-flow).
    // Filling the style field and clicking "曲を作成" makes Suno render + solve
    // hCaptcha and fire the create request, which the route hook aborts (no
    // credits spent) while the init-script capture reads token + token_provider.
    await triggerGenerateFlow(page, input.style);
    const stopDetector = startChallengeDetector(page, timeoutMs);
    try {
      const result = await capture.promise;
      emitProgress("solved");
      return result;
    } catch (waitError) {
      if (waitError instanceof BrowserCaptchaMintError && waitError.status === "captcha_required") {
        emitProgress("mint_timeout");
      }
      throw waitError;
    } finally {
      stopDetector();
    }
  } catch (error) {
    if (error instanceof BrowserCaptchaMintError) throw error;
    const message = error instanceof Error ? error.message : String(error);
    if (/Executable doesn't exist|browserType\.launch|install chromium|playwright install/i.test(message)) {
      throw new BrowserCaptchaMintError(
        "browser_required",
        `Playwright Chromium is not installed: ${message}`,
        { next_command: "npx playwright install chromium" }
      );
    }
    throw new BrowserCaptchaMintError(
      "captcha_mint_failed",
      `Browser captcha mint failed: ${message}`,
      INSTALL_RECOVERY
    );
  } finally {
    await context?.close().catch(() => undefined);
  }
}

// Parse a raw `document.cookie` string into Playwright cookie params, expanded
// across both `.suno.com` and `suno.com` so the mint profile is treated as
// logged-in on suno.com/create (verified on-device).
export function parseCookieHeader(cookieHeader: string): CookieParam[] {
  return cookieHeader
    .split(";")
    .map((pair) => {
      const eq = pair.indexOf("=");
      if (eq === -1) return undefined;
      const name = pair.slice(0, eq).trim();
      const value = pair.slice(eq + 1).trim();
      if (!name || !value) return undefined;
      return { name, value };
    })
    .filter((entry): entry is { name: string; value: string } => entry !== undefined)
    .flatMap((entry) => [
      { ...entry, domain: ".suno.com", path: "/" },
      { ...entry, domain: "suno.com", path: "/" }
    ]);
}

// Drive the create form so Suno renders and runs hCaptcha itself. rebrowser
// disables Playwright's selector engine (native fill/click/locators hang), so
// every DOM step is a short synchronous page.evaluate with waits driven from
// here. React can drop a single programmatic value set, so we refill on each
// poll until the "Create song" button enables, then click it. If Suno shows a
// visible hCaptcha challenge, the user solves it in the headful window; the
// generate request (and its captcha token) is captured by the route hook.
async function triggerGenerateFlow(page: Page, style: string): Promise<void> {
  const evalSafe = async <T>(fn: (arg: string) => T, arg = ""): Promise<T | undefined> => {
    for (let i = 0; i < 8; i += 1) {
      try {
        return await page.evaluate(fn, arg);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (/destroyed|navigation|Target closed/i.test(message)) {
          await page.waitForTimeout(1200);
          continue;
        }
        return undefined;
      }
    }
    return undefined;
  };

  // Wait for the create form to render.
  for (let i = 0; i < 20; i += 1) {
    const count = await evalSafe(() => document.querySelectorAll("textarea").length);
    if (typeof count === "number" && count >= 2) break;
    await page.waitForTimeout(1000);
  }

  // Refill each poll until the "Create song" button enables (React can drop a
  // single set; the style field is the one with a comma-list placeholder).
  for (let i = 0; i < 20; i += 1) {
    const state = await evalSafe((styleText) => {
      const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set;
      const areas = Array.from(document.querySelectorAll("textarea")) as HTMLTextAreaElement[];
      areas.forEach((el, index) => {
        if ((el.getAttribute("aria-label") ?? "") === "Cowriter prompt") return;
        const value = (el.placeholder ?? "").includes(",") || index === 1 ? styleText : "an instrumental track";
        if (setter) setter.call(el, value);
        else el.value = value;
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      });
      const button = Array.from(document.querySelectorAll("button")).find((b) =>
        /create song/i.test(b.getAttribute("aria-label") ?? "")
      ) as HTMLButtonElement | undefined;
      if (!button) return "no_button";
      return button.disabled ? "disabled" : "enabled";
    }, style);
    if (state === "enabled") break;
    await page.waitForTimeout(1000);
  }

  // Click Create so Suno runs hCaptcha and fires the generate request.
  await evalSafe(() => {
    const button = Array.from(document.querySelectorAll("button")).find((b) =>
      /create song/i.test(b.getAttribute("aria-label") ?? "")
    ) as HTMLButtonElement | undefined;
    if (button && !button.disabled) button.click();
    return "clicked";
  });
}

function createCaptureWaiter(timeoutMs: number, tokenProviderFallback: number | undefined): {
  promise: Promise<BrowserCaptchaMintResult>;
  accept: (payload: unknown) => void;
} {
  let done = false;
  let resolvePromise: (value: BrowserCaptchaMintResult) => void = () => undefined;
  let rejectPromise: (error: BrowserCaptchaMintError) => void = () => undefined;
  const timer = setTimeout(() => {
    if (done) return;
    done = true;
    rejectPromise(new BrowserCaptchaMintError(
      "captcha_required",
      "Captcha token was not observed before the browser mint timeout.",
      INSTALL_RECOVERY
    ));
  }, timeoutMs);
  const promise = new Promise<BrowserCaptchaMintResult>((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  }).finally(() => clearTimeout(timer));
  return {
    promise,
    accept: (payload) => {
      if (done) return;
      const result = extractCaptchaMint(payload, tokenProviderFallback);
      if (!result) return;
      done = true;
      resolvePromise(result);
    }
  };
}

export function extractCaptchaMint(payload: unknown, tokenProviderFallback: number | undefined): BrowserCaptchaMintResult | undefined {
  if (typeof payload === "string" && payload.length > 0 && tokenProviderFallback !== undefined) {
    return { token: payload, tokenProvider: tokenProviderFallback };
  }
  const root = asRecord(payload);
  const token = firstString(root, ["token", "captcha_token", "captchaToken", "hcaptcha_token", "hcaptchaToken"]);
  const provider = safeInteger(root.token_provider ?? root.tokenProvider) ?? tokenProviderFallback;
  if (token && provider !== undefined) {
    return { token, tokenProvider: provider };
  }
  for (const value of Object.values(root)) {
    const nested = extractCaptchaMint(value, tokenProviderFallback);
    if (nested) return nested;
  }
  return undefined;
}

function parseMaybeJson(value: string | null): unknown {
  if (!value) return undefined;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function safeInteger(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isSafeInteger(value)) return value;
  if (typeof value === "string" && /^-?\d+$/.test(value)) {
    const parsed = Number(value);
    if (Number.isSafeInteger(parsed)) return parsed;
  }
  return undefined;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function firstString(record: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.length > 0) return value;
  }
  return undefined;
}

async function loadPlaywright(): Promise<PlaywrightModule> {
  // rebrowser's addBinding runtime-fix mode keeps page.evaluate working while
  // still suppressing the CDP Runtime.enable automation leak. Without it,
  // evaluate/route calls hang against Suno's app.
  if (!process.env.REBROWSER_PATCHES_RUNTIME_FIX_MODE) {
    process.env.REBROWSER_PATCHES_RUNTIME_FIX_MODE = "addBinding";
  }
  const dynamicImport = new Function("specifier", "return import(specifier)") as (specifier: string) => Promise<PlaywrightModule>;
  // Prefer rebrowser-playwright: it patches the CDP `Runtime.enable` leak that
  // Suno's invisible hCaptcha uses to flag automation. Stock playwright is
  // detected and yields an invalid token (HTTP 422). Fall back to stock only if
  // the patched build is not installed.
  const candidates = ["rebrowser-playwright", "playwright"];
  let lastError: unknown;
  for (const specifier of candidates) {
    try {
      return await dynamicImport(specifier);
    } catch (error) {
      lastError = error;
    }
  }
  const message = lastError instanceof Error ? lastError.message : String(lastError);
  throw new BrowserCaptchaMintError(
    "browser_required",
    `Playwright is not installed or cannot be loaded: ${message}`,
    INSTALL_RECOVERY
  );
}

const CAPTURE_INIT_SCRIPT = `
(() => {
  const publish = (payload) => {
    try {
      globalThis.__sunoCliCaptureCaptcha?.(payload);
    } catch {}
  };
  const inspectBody = (body) => {
    if (typeof body !== "string") return;
    try {
      const parsed = JSON.parse(body);
      if (parsed && (parsed.token || parsed.token_provider !== undefined || parsed.tokenProvider !== undefined)) {
        publish(parsed);
      }
    } catch {}
  };
  const originalFetch = globalThis.fetch;
  if (typeof originalFetch === "function") {
    globalThis.fetch = async (...args) => {
      const init = args[1] || {};
      inspectBody(init.body);
      const response = await originalFetch(...args);
      try {
        const clone = response.clone();
        clone.json().then(publish).catch(() => {});
      } catch {}
      return response;
    };
  }
  const installHcaptchaHook = () => {
    const hcaptcha = globalThis.hcaptcha;
    if (!hcaptcha || typeof hcaptcha.execute !== "function" || hcaptcha.__sunoCliHooked) return false;
    const originalExecute = hcaptcha.execute.bind(hcaptcha);
    hcaptcha.execute = async (...args) => {
      const result = await originalExecute(...args);
      publish(result);
      return result;
    };
    hcaptcha.__sunoCliHooked = true;
    return true;
  };
  if (!installHcaptchaHook()) {
    const timer = setInterval(() => {
      if (installHcaptchaHook()) clearInterval(timer);
    }, 250);
    setTimeout(() => clearInterval(timer), 30000);
  }
})();
`;
