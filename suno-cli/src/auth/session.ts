import fs from "node:fs/promises";
import path from "node:path";

export interface SavedSession {
  jwt?: string;
  cookie?: string;
  sessionId?: string;
  expiresAt?: string;
  savedAt: string;
}

export async function saveSession(sessionFile: string, session: SavedSession): Promise<void> {
  await fs.mkdir(path.dirname(sessionFile), { recursive: true });
  await fs.writeFile(sessionFile, `${JSON.stringify(session, null, 2)}\n`, { mode: 0o600 });
  await fs.chmod(sessionFile, 0o600).catch(() => undefined);
}

export async function loadSession(sessionFile: string): Promise<SavedSession | undefined> {
  let raw: string;
  try {
    raw = await fs.readFile(sessionFile, "utf8");
  } catch {
    return undefined;
  }
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as SavedSession;
    }
    return undefined;
  } catch {
    return undefined;
  }
}

export async function clearSession(sessionFile: string): Promise<boolean> {
  try {
    await fs.unlink(sessionFile);
    return true;
  } catch {
    return false;
  }
}
