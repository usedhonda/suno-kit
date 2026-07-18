import { CreateBody } from "../create/body.js";
import { ClerkAuthOptions, getClerkToken } from "../auth/clerk.js";
import { ExitCode } from "../commands/output.js";
import { toSongUrl } from "./feed.js";

export const GENERATE_ENDPOINT = "https://studio-api-prod.suno.com/api/generate/v2-web/";

export interface GenerateSubmitResult {
  response: unknown;
  clipIds: string[];
  songUrls: string[];
  batchId?: string;
}

export interface GenerateSubmitter {
  submit(body: CreateBody): Promise<GenerateSubmitResult>;
}

export class GenerateHttpError extends Error {
  constructor(
    public readonly status: string,
    message: string,
    public readonly exitCode: number,
    public readonly details?: unknown
  ) {
    super(message);
  }
}

export class HttpGenerateSubmitter implements GenerateSubmitter {
  constructor(private readonly options: ClerkAuthOptions = {}) {}

  async submit(body: CreateBody): Promise<GenerateSubmitResult> {
    const fetcher = this.options.fetcher ?? fetch;
    try {
      const token = await getClerkToken(this.options);
      const response = await fetcher(GENERATE_ENDPOINT, {
        method: "POST",
        headers: {
          authorization: `Bearer ${token.jwt}`,
          accept: "application/json",
          "content-type": "application/json"
        },
        body: JSON.stringify(body)
      });
      if (!response.ok) {
        throw await toGenerateHttpError(response);
      }
      const payload = await response.json().catch(() => {
        throw new GenerateHttpError("schema_drift", "Generate response was not JSON.", ExitCode.schemaDrift);
      });
      const clipIds = extractClipIds(payload);
      const result: GenerateSubmitResult = {
        response: payload,
        clipIds,
        songUrls: clipIds.map((clipId) => toSongUrl(clipId))
      };
      const batchId = extractBatchId(payload);
      if (batchId) result.batchId = batchId;
      return result;
    } catch (error) {
      if (error instanceof GenerateHttpError) throw error;
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("cookie is required") || /Clerk .*HTTP (401|403)/.test(message)) {
        throw new GenerateHttpError("blocked_login", message, ExitCode.blockedLogin);
      }
      throw new GenerateHttpError(
        "retryable_unknown",
        `Generate request failed: ${message}`,
        ExitCode.retryableUnknown
      );
    }
  }
}

async function toGenerateHttpError(response: Response): Promise<GenerateHttpError> {
  const text = await response.text().catch(() => "");
  const details = text ? { httpStatus: response.status, body: text.slice(0, 1000) } : { httpStatus: response.status };
  if (isCaptchaRequired(text)) {
    return new GenerateHttpError("blocked_captcha", `Generate request blocked by captcha: HTTP ${response.status}.`, ExitCode.blockedCaptcha, details);
  }
  if (response.status === 401 || response.status === 403) {
    return new GenerateHttpError("blocked_login", `Generate request blocked by login: HTTP ${response.status}.`, ExitCode.blockedLogin, details);
  }
  if (response.status === 402 || /quota|credit|payment/i.test(text)) {
    return new GenerateHttpError("blocked_payment_or_quota", `Generate request blocked by payment or quota: HTTP ${response.status}.`, ExitCode.blockedPaymentOrQuota, details);
  }
  if (response.status >= 400 && response.status < 500) {
    return new GenerateHttpError("schema_drift", `Generate request rejected: HTTP ${response.status}.`, ExitCode.schemaDrift, details);
  }
  return new GenerateHttpError("retryable_unknown", `Generate request failed: HTTP ${response.status}.`, ExitCode.retryableUnknown, details);
}

function isCaptchaRequired(text: string): boolean {
  return /captcha|hcaptcha|turnstile|challenge|token_validation_failed|verify your request/i.test(text);
}

function extractClipIds(payload: unknown): string[] {
  const root = asRecord(payload);
  const clips = asArray(root.clips);
  const clipIds = clips
    .map((clip) => asRecord(clip).id)
    .filter((id): id is string => typeof id === "string" && id.length > 0);
  if (clipIds.length > 0) return clipIds;
  const ids = asArray(root.ids);
  return ids.filter((id): id is string => typeof id === "string" && id.length > 0);
}

function extractBatchId(payload: unknown): string | undefined {
  const root = asRecord(payload);
  for (const key of ["id", "batch_id", "batchId"]) {
    const value = root[key];
    if (typeof value === "string" && value.length > 0) return value;
  }
  return undefined;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}
