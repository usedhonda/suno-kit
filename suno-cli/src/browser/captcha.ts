import fs from "node:fs/promises";

export interface BrowserCaptchaMintOptions {
  profileDir: string;
  headless?: boolean;
  timeoutMs?: number;
  createUrl?: string;
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
}

interface Route {
  abort(errorCode?: string): Promise<void>;
}

interface BrowserRequest {
  postData(): string | null;
}

const DEFAULT_CREATE_URL = "https://suno.com/create";
const DEFAULT_TIMEOUT_MS = 45_000;
const INSTALL_RECOVERY = {
  next_command: "npm install playwright && npx playwright install chromium"
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
    viewport: options.viewport ?? { width: 1280, height: 900 }
  });
}

export async function mintBrowserCaptcha(
  input: BrowserCaptchaMintInput,
  options: BrowserCaptchaMintOptions
): Promise<BrowserCaptchaMintResult> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const tokenProviderFallback = safeInteger(input.tokenProvider);
  let context: BrowserContext | undefined;
  try {
    context = await launchPersistentBrowser({
      profileDir: options.profileDir,
      headless: options.headless ?? true
    });
    const page = await context.newPage();
    const capture = createCaptureWaiter(timeoutMs, tokenProviderFallback);
    await page.exposeBinding("__sunoCliCaptureCaptcha", (_source, payload) => {
      capture.accept(payload);
    });
    await page.route("**/api/generate/v2-web/**", async (route, request) => {
      capture.accept(parseMaybeJson(request.postData()));
      await route.abort("blockedbyclient");
    });
    await page.addInitScript(CAPTURE_INIT_SCRIPT);
    await page.goto(options.createUrl ?? DEFAULT_CREATE_URL, {
      waitUntil: "domcontentloaded",
      timeout: timeoutMs
    });
    await page.evaluate(async () => {
      const root = globalThis as typeof globalThis & {
        hcaptcha?: { execute?: (...args: unknown[]) => unknown };
        __sunoCliCaptureCaptcha?: (payload: unknown) => void;
      };
      const execute = root.hcaptcha?.execute;
      if (typeof execute !== "function") return;
      const result = await execute();
      root.__sunoCliCaptureCaptcha?.(result);
    }).catch(() => undefined);
    return await capture.promise;
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
  try {
    const dynamicImport = new Function("specifier", "return import(specifier)") as (specifier: string) => Promise<PlaywrightModule>;
    return await dynamicImport("playwright");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new BrowserCaptchaMintError(
      "browser_required",
      `Playwright is not installed or cannot be loaded: ${message}`,
      INSTALL_RECOVERY
    );
  }
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
