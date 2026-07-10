import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  extractCaptchaMint,
  installGenerateAbortRoute,
  normalizeLoopbackCdpEndpoint,
  openBrowserMintSession,
  parseCookieHeader
} from "../src/browser/captcha.js";

test("parseCookieHeader expands each cookie across .suno.com and suno.com", () => {
  const cookies = parseCookieHeader("__session=abc; __client_uat=1; suno_auth=xyz");
  assert.equal(cookies.length, 6);
  assert.deepEqual(cookies[0], { name: "__session", value: "abc", domain: ".suno.com", path: "/" });
  assert.deepEqual(cookies[1], { name: "__session", value: "abc", domain: "suno.com", path: "/" });
  const names = new Set(cookies.map((cookie) => cookie.name));
  assert.deepEqual([...names], ["__session", "__client_uat", "suno_auth"]);
});

test("parseCookieHeader skips malformed pairs and preserves values with '='", () => {
  const cookies = parseCookieHeader("=orphan; noequals; ok=a=b; empty=");
  // Only ok=a=b survives -> 2 domain entries.
  assert.equal(cookies.length, 2);
  assert.equal(cookies[0]?.name, "ok");
  assert.equal(cookies[0]?.value, "a=b");
});

test("extractCaptchaMint reads token and integer provider from captured generate body", () => {
  const result = extractCaptchaMint({
    token: "captcha-secret",
    token_provider: 1
  }, undefined);
  assert.deepEqual(result, {
    token: "captcha-secret",
    tokenProvider: 1
  });
});

test("extractCaptchaMint uses provider fallback for hcaptcha execute string result", () => {
  const result = extractCaptchaMint("captcha-secret", 1);
  assert.deepEqual(result, {
    token: "captcha-secret",
    tokenProvider: 1
  });
});

test("extractCaptchaMint rejects token without integer provider", () => {
  const result = extractCaptchaMint({
    token: "captcha-secret",
    token_provider: "hcaptcha"
  }, undefined);
  assert.equal(result, undefined);
});

test("normalizeLoopbackCdpEndpoint accepts loopback HTTP origins", () => {
  assert.equal(normalizeLoopbackCdpEndpoint("http://127.0.0.1:9222/"), "http://127.0.0.1:9222");
  assert.equal(normalizeLoopbackCdpEndpoint("http://localhost:9333"), "http://localhost:9333");
  assert.equal(normalizeLoopbackCdpEndpoint("https://[::1]:9443"), "https://[::1]:9443");
});

test("normalizeLoopbackCdpEndpoint rejects remote and non-HTTP endpoints", () => {
  for (const endpoint of [
    "http://192.168.1.20:9222",
    "https://example.com:9222",
    "ws://127.0.0.1:9222/devtools/browser/id",
    "http://user:pass@127.0.0.1:9222",
    "http://127.0.0.1:9222/json/version"
  ]) {
    assert.throws(() => normalizeLoopbackCdpEndpoint(endpoint), /Usage: --cdp-endpoint/);
  }
});

test("openBrowserMintSession selects CDP without launching or closing the attached context", async () => {
  const existingPage = fakePage("https://suno.com/create");
  const context = fakeContext([existingPage]);
  let connectedEndpoint = "";
  let disconnects = 0;
  let launches = 0;
  const session = await openBrowserMintSession({
    profileDir: "/unused",
    cdpEndpoint: "http://127.0.0.1:9222"
  }, {
    chromium: {
      connectOverCDP: async (endpoint) => {
        connectedEndpoint = endpoint;
        return {
          contexts: () => [context],
          close: async () => { disconnects += 1; }
        };
      },
      launchPersistentContext: async () => {
        launches += 1;
        return context;
      }
    }
  });
  assert.equal(session.mode, "cdp");
  assert.equal(session.page, existingPage);
  assert.equal(connectedEndpoint, "http://127.0.0.1:9222");
  assert.equal(launches, 0);
  await session.close();
  assert.equal(context.closeCalls, 0);
  assert.equal(existingPage.closeCalls, 0);
  assert.equal(disconnects, 1);
});

test("openBrowserMintSession fails closed when explicit CDP attach fails", async () => {
  let launches = 0;
  await assert.rejects(() => openBrowserMintSession({
    profileDir: "/unused",
    cdpEndpoint: "http://127.0.0.1:9222"
  }, {
    chromium: {
      connectOverCDP: async () => {
        throw new Error("connection refused");
      },
      launchPersistentContext: async () => {
        launches += 1;
        return fakeContext([]);
      }
    }
  }), /CDP attach failed/);
  assert.equal(launches, 0);
});

test("openBrowserMintSession opens and closes only its own CDP page", async () => {
  const otherPage = fakePage("https://example.com");
  const openedPage = fakePage("about:blank");
  const context = fakeContext([otherPage], openedPage);
  let disconnects = 0;
  const session = await openBrowserMintSession({
    profileDir: "/unused",
    cdpEndpoint: "http://127.0.0.1:9222"
  }, {
    chromium: {
      connectOverCDP: async () => ({
        contexts: () => [context],
        close: async () => { disconnects += 1; }
      }),
      launchPersistentContext: async () => context
    }
  });
  assert.equal(session.page, openedPage);
  await session.close();
  assert.equal(openedPage.closeCalls, 1);
  assert.equal(otherPage.closeCalls, 0);
  assert.equal(context.closeCalls, 0);
  assert.equal(disconnects, 1);
});

test("openBrowserMintSession keeps persistent profile launch as the default", async (t) => {
  const profileDir = await fs.mkdtemp(path.join(os.tmpdir(), "suno-cli-cdp-test-"));
  t.after(() => fs.rm(profileDir, { recursive: true, force: true }));
  const page = fakePage("about:blank");
  const context = fakeContext([], page);
  let connects = 0;
  let launches = 0;
  const session = await openBrowserMintSession({ profileDir }, {
    chromium: {
      connectOverCDP: async () => {
        connects += 1;
        return { contexts: () => [context], close: async () => undefined };
      },
      launchPersistentContext: async (profileDir) => {
        launches += 1;
        assert.match(profileDir, /suno-cli-cdp-test-/);
        return context;
      }
    }
  });
  assert.equal(session.mode, "profile");
  assert.equal(connects, 0);
  assert.equal(launches, 1);
  await session.close();
  assert.equal(context.closeCalls, 1);
});

test("installGenerateAbortRoute always aborts the captured generate request", async () => {
  const page = fakePage("https://suno.com/create");
  let captured: unknown;
  await installGenerateAbortRoute(page, (payload) => {
    captured = payload;
  });
  assert.equal(page.routePattern, "**/api/generate/**");
  await page.routeHandler?.({ abort: async (reason?: string) => {
    page.abortReason = reason;
  } }, { postData: () => JSON.stringify({ token: "secret", token_provider: 1 }) });
  assert.deepEqual(captured, { token: "secret", token_provider: 1 });
  assert.equal(page.abortReason, "blockedbyclient");
});

function fakePage(url: string) {
  return {
    closeCalls: 0,
    routePattern: "",
    routeHandler: undefined as ((route: { abort(reason?: string): Promise<void> }, request: { postData(): string | null }) => Promise<void> | void) | undefined,
    abortReason: undefined as string | undefined,
    url: () => url,
    close: async function () { this.closeCalls += 1; },
    route: async function (pattern: string, handler: typeof this.routeHandler) {
      this.routePattern = pattern;
      this.routeHandler = handler;
    },
    exposeBinding: async () => undefined,
    addInitScript: async () => undefined,
    goto: async () => undefined,
    evaluate: async () => undefined,
    waitForTimeout: async () => undefined
  };
}

function fakeContext(pages: ReturnType<typeof fakePage>[], newPage = fakePage("about:blank")) {
  return {
    closeCalls: 0,
    pages: () => pages,
    newPage: async () => newPage,
    addCookies: async () => undefined,
    close: async function () { this.closeCalls += 1; }
  };
}
