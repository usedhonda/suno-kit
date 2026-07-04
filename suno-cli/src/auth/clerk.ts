import fs from "node:fs/promises";
import { loadSession } from "./session.js";

export interface ClerkAuthOptions {
  cookie?: string;
  cookieFile?: string;
  jwt?: string;
  sessionFile?: string;
  fetcher?: typeof fetch;
  clientUrl?: string;
}

export interface ClerkToken {
  jwt: string;
  sessionId: string;
  expiresAt?: string;
}

const DEFAULT_CLIENT_URL = "https://auth.suno.com/v1/client";

export async function readCookie(options: ClerkAuthOptions): Promise<string> {
  if (options.cookie) return options.cookie;
  if (process.env.SUNO_KIT_COOKIE) return process.env.SUNO_KIT_COOKIE;
  if (options.cookieFile) {
    return (await fs.readFile(options.cookieFile, "utf8")).trim();
  }
  throw new Error("Suno Clerk cookie is required. Set SUNO_KIT_COOKIE or SUNO_KIT_COOKIE_FILE.");
}

export async function getClerkToken(options: ClerkAuthOptions = {}): Promise<ClerkToken> {
  const directJwt = options.jwt ?? process.env.SUNO_KIT_JWT;
  if (directJwt) return clerkTokenFromJwt(directJwt);
  // Priority: explicit --cookie / env cookie / cookie-file > saved session.
  const explicitCookie = options.cookie ?? process.env.SUNO_KIT_COOKIE;
  const hasExplicitCookieSource = Boolean(explicitCookie) || Boolean(options.cookieFile);
  if (!hasExplicitCookieSource && options.sessionFile) {
    const saved = await loadSession(options.sessionFile);
    if (saved?.jwt) return clerkTokenFromJwt(saved.jwt);
    if (saved?.cookie) return exchangeCookieForToken(saved.cookie, options);
  }
  const cookie = await readCookie(options);
  return exchangeCookieForToken(cookie, options);
}

async function exchangeCookieForToken(cookie: string, options: ClerkAuthOptions): Promise<ClerkToken> {
  const fetcher = options.fetcher ?? fetch;
  const clientUrl = options.clientUrl ?? DEFAULT_CLIENT_URL;
  const clientResponse = await fetcher(clientUrl, {
    method: "GET",
    headers: {
      cookie,
      accept: "application/json"
    }
  });
  if (!clientResponse.ok) {
    throw new Error(`Clerk client request failed: HTTP ${clientResponse.status}`);
  }
  const clientJson = await clientResponse.json();
  const sessionId = extractSessionId(clientJson);
  if (!sessionId) {
    throw new Error("Clerk client response did not contain an active session_id.");
  }

  const tokenUrl = `${clientUrl.replace(/\/$/, "")}/sessions/${encodeURIComponent(sessionId)}/tokens`;
  const tokenResponse = await fetcher(tokenUrl, {
    method: "POST",
    headers: {
      cookie,
      accept: "application/json",
      "content-type": "application/json"
    },
    body: "{}"
  });
  if (!tokenResponse.ok) {
    throw new Error(`Clerk token request failed: HTTP ${tokenResponse.status}`);
  }
  const tokenJson = await tokenResponse.json();
  const jwt = extractJwt(tokenJson);
  if (!jwt) {
    throw new Error("Clerk token response did not contain a JWT.");
  }
  return {
    jwt,
    sessionId,
    ...(typeof tokenJson.expire_at === "string" ? { expiresAt: tokenJson.expire_at } : {})
  };
}

export async function keepAliveToken(options: ClerkAuthOptions = {}): Promise<ClerkToken> {
  return getClerkToken(options);
}

export function extractSessionId(payload: unknown): string | undefined {
  const root = asRecord(payload);
  const direct = firstString(root, ["last_active_session_id", "session_id", "id"]);
  if (direct && direct.startsWith("sess_")) return direct;
  const response = asRecord(root.response);
  const responseDirect = firstString(response, ["last_active_session_id", "session_id"]);
  if (responseDirect) return responseDirect;
  const sessions = asArray(response.sessions ?? root.sessions);
  for (const item of sessions) {
    const session = asRecord(item);
    const id = firstString(session, ["id", "session_id"]);
    if (id) return id;
  }
  return undefined;
}

export function extractJwt(payload: unknown): string | undefined {
  const root = asRecord(payload);
  return firstString(root, ["jwt", "token"]) ?? firstString(asRecord(root.response), ["jwt", "token"]);
}

export function clerkTokenFromJwt(jwt: string): ClerkToken {
  const payload = decodeJwtPayload(jwt);
  const sessionId = typeof payload.sid === "string" ? payload.sid : "";
  const exp = payload.exp;
  return {
    jwt,
    sessionId,
    ...(typeof exp === "number" && Number.isFinite(exp) ? { expiresAt: new Date(exp * 1000).toISOString() } : {})
  };
}

function decodeJwtPayload(jwt: string): Record<string, unknown> {
  try {
    const payload = jwt.split(".")[1];
    if (!payload) return {};
    const json = Buffer.from(payload, "base64url").toString("utf8");
    return asRecord(JSON.parse(json));
  } catch {
    return {};
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function firstString(record: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.length > 0) return value;
  }
  return undefined;
}
