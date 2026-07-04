# suno-cli

`suno-cli` is the execution helper for `suno-kit`.

Current status:

- Phase1 retrieval is implemented: `status`, `urls`, and `download`.
- Phase2 create supports safe `--dry-run` body inspection and gated `--live` HTTP submit.
- Live create can spend credits. When `--captcha-token` is omitted, it starts a dedicated Playwright browser profile to mint hCaptcha itself.

## Install And Build

Requirements:

- Node.js 22 or newer
- A logged-in Suno account in your browser

```bash
cd suno-cli
npm install
npm run build
node dist/src/cli.js --help
```

`npm install` does not download a browser binary for you. The browser path is only needed for `create --live` without a supplied captcha token:

```bash
npx playwright install chromium
```

## Data Directory

Runtime state is stored outside the repository. The default path is:

```text
~/.local/share/suno-kit/
```

The ledger file is `~/.local/share/suno-kit/runs.json`. The live captcha browser profile is `~/.local/share/suno-kit/browser-profile/`. It is dedicated to `suno-cli` and must not be shared with any artist-runtime browser profile. The ledger is written with a per-ledger lock and atomic temp-file rename. If the ledger is corrupt, the CLI fails closed instead of silently resetting state.

Override the data directory when testing:

```bash
node dist/src/cli.js status <clip-id> --data-dir /tmp/suno-kit-test
```

## Clerk Cookie Or Direct JWT

Retrieval commands call Suno's private HTTP API with a Clerk session token. The CLI derives that token from your browser cookie.

### Alternative Auth: `SUNO_KIT_JWT` Or `--jwt`

If you already have the Suno `__session` value, pass it directly as the Bearer JWT:

```bash
export SUNO_KIT_JWT='<copied-__session-value>'
node dist/src/cli.js status <clip-id>
```

Per command:

```bash
node dist/src/cli.js status <clip-id> --jwt '<copied-__session-value>'
node dist/src/cli.js create --live --jwt '<copied-__session-value>' --title "probe" --style "lo-fi piano"
```

When `SUNO_KIT_JWT` or `--jwt` is provided, the CLI skips `https://auth.suno.com/v1/client` and uses that JWT directly as `Authorization: Bearer <jwt>`. This avoids the HttpOnly `__client` cookie requirement in the Clerk client endpoint.

The older cookie flow below needs the full Clerk browser cookie context. A `__session` cookie string alone is not enough for the `/v1/client` session discovery request, because that request can require HttpOnly `__client` state that DevTools cannot expose as a simple copied `__session` value.

### Get `__session` From Browser DevTools

1. Open `https://suno.com/create` in a browser where you are logged in.
2. Open DevTools.
3. Go to `Application` -> `Storage` -> `Cookies` -> `https://suno.com`.
4. Find the cookie named `__session`.
5. Copy only its value.
6. Build the cookie string locally by joining the cookie name, an equals sign, and the copied value.

Do not paste cookies into chat, issues, logs, or commit history.

### Environment Variable

Use this for quick local runs:

```bash
SUNO_SESSION_VALUE='<copied-value>'
export SUNO_KIT_COOKIE="$(printf '%s%s' '__session' "=${SUNO_SESSION_VALUE}")"
node dist/src/cli.js status <clip-id>
```

### Cookie File

Use this when you do not want the cookie in shell history:

```bash
mkdir -p ~/.local/share/suno-kit
SUNO_SESSION_VALUE='<copied-value>'
printf '%s%s\n' '__session' "=${SUNO_SESSION_VALUE}" > ~/.local/share/suno-kit/cookie.txt
chmod 600 ~/.local/share/suno-kit/cookie.txt

export SUNO_KIT_COOKIE_FILE=~/.local/share/suno-kit/cookie.txt
node dist/src/cli.js status <clip-id>
```

`SUNO_KIT_COOKIE` wins over `SUNO_KIT_COOKIE_FILE`. The `--cookie-file <file>` flag can also be used per command.

## Commands

All commands print JSON. `--json` is accepted for readability, but JSON is already the default.

### status

```bash
node dist/src/cli.js status <clip-id>
node dist/src/cli.js status https://suno.com/song/<clip-id>
node dist/src/cli.js status <run-id>
```

Returns URL-ready vs audio-ready state. `sil-100.mp3` is treated as not audio-ready.

### urls

```bash
node dist/src/cli.js urls <run-id>
node dist/src/cli.js urls <clip-id>
```

Returns canonical song URLs:

```text
https://suno.com/song/<clip-id>
```

### download

```bash
node dist/src/cli.js download <run-id> --out ./downloads
node dist/src/cli.js download <clip-id> --out ./downloads --timeout-ms 600000 --poll-ms 10000
```

Downloads ready MP3 files. If audio is not ready, the command returns a retryable JSON error and does not treat `sil-100.mp3` as success.

### create `--dry-run`

```bash
node dist/src/cli.js create --dry-run \
  --title "verify probe" \
  --style "lo-fi piano, mellow, rain, tape hiss" \
  --exclude "brass, aggressive" \
  --lyrics "rain on the window" \
  --vocal-gender m \
  --persona-id abc123 \
  --cover-clip-id CLIP123 \
  --cover-start-s 10 \
  --cover-end-s 30 \
  --weirdness 45 \
  --style-influence 70 \
  --audio-influence 25
```

Dry-run builds the verified request shape for:

```text
POST https://studio-api-prod.suno.com/api/generate/v2-web/
```

It also reserves a local `transaction_uuid` in the ledger so retries for the same `--run-id` reuse the same UUID.

Useful retry check:

```bash
node dist/src/cli.js create --dry-run --run-id test-run --title "probe" --style "lo-fi piano" --lyrics "rain"
node dist/src/cli.js create --dry-run --run-id test-run --title "probe" --style "lo-fi piano" --lyrics "rain"
```

Both outputs should use the same `transactionUuid`.

Optional create controls:

| Flag | Input | Request field | Omitted behavior |
|---|---:|---|---|
| `--weirdness <n>` | 0-100 | `metadata.control_sliders.weirdness_constraint` as `n / 100` | key omitted |
| `--style-influence <n>` | 0-100 | `metadata.control_sliders.style_weight` as `n / 100` | key omitted |
| `--audio-influence <n>` | 0-100 | `metadata.control_sliders.audio_weight` as `n / 100` | key omitted |
| `--persona-id <id>` | Suno persona id string | top-level `persona_id` | `null` |
| `--cover-clip-id <id>` | existing Suno clip id | top-level `cover_clip_id` + top-level `task="cover"` + `metadata.is_remix=true` | `null`, no `task`, no `is_remix` |
| `--cover-start-s <sec>` / `--cover-end-s <sec>` | non-negative seconds | top-level `cover_start_s` / `cover_end_s` | `null` |

When no slider flags are provided, `metadata.control_sliders` is omitted entirely. `override_fields` remains `[]`.

Cover mode uses an existing Suno clip id that you already know. External audio upload is not implemented in this package. `--cover-start-s` and `--cover-end-s` require `--cover-clip-id`. Captured live requests keep `metadata.create_mode="custom"` and express cover via top-level `task="cover"` plus `metadata.is_remix=true`.

`audio_weight` is confirmed by live capture: UI 65 maps to `metadata.control_sliders.audio_weight: 0.65`. Dry-run output is safe and does not spend credits.

### create `--live`

Live submit posts the generated body to:

```text
POST https://studio-api-prod.suno.com/api/generate/v2-web/
```

It requires:

- a direct JWT via `SUNO_KIT_JWT` / `--jwt`, or a Clerk cookie via `SUNO_KIT_COOKIE`, `SUNO_KIT_COOKIE_FILE`, or `--cookie-file`
- `--live`
- Playwright Chromium installed when `--captcha-token` is omitted
- explicit owner awareness, because a successful request can spend Suno credits

Example:

```bash
node dist/src/cli.js create --live \
  --title "verify probe" \
  --style "lo-fi piano, mellow, rain, tape hiss" \
  --lyrics "rain on the window" \
  --run-id paid-probe-001
```

When `--captcha-token` is omitted, the CLI lazy-loads Playwright, opens headless Chromium with the dedicated `~/.local/share/suno-kit/browser-profile/`, installs a block-capture hook before loading `https://suno.com/create`, captures the hCaptcha `token` and integer `token_provider`, closes the browser, then submits the body with `Content-Type: application/json`. On success it records the run in the ledger and returns extracted `clips[].id` values plus `https://suno.com/song/<clip_id>` URLs.

If Playwright or Chromium is missing, the CLI returns a JSON error with `recovery.next_command`.

To supply optional live-only metadata, use:

```bash
node dist/src/cli.js create --live \
  --title "verify probe" \
  --style "lo-fi piano" \
  --session-token "$SUNO_CREATE_SESSION_TOKEN" \
  --user-tier "$SUNO_USER_TIER"
```

`SUNO_CREATE_SESSION_TOKEN` and `SUNO_USER_TIER` are also read from the environment. If they are not supplied, the corresponding metadata keys are omitted.

#### Captcha Minting And Escape Hatch

The default live path mints hCaptcha in the dedicated browser profile. If browser minting fails, the JSON error distinguishes setup failure (`browser_required`) from captcha timeout (`captcha_required`) and generic browser mint failure (`captcha_mint_failed`).

For debugging, you can still supply a fresh token manually. Supplied values always win over browser minting:

1. Open `https://suno.com/create` while logged in.
2. Open DevTools -> Network.
3. During an owner-approved browser create attempt, trigger the request.
4. Select the `/api/generate/v2-web/` request.
5. Copy the request body field named `token`.
6. Copy the request body field named `token_provider`; live submit requires it as an integer.
7. Use them once with `--captcha-token` and `--token-provider`.

The token has a short TTL. Do not log it, paste it into chat, or commit it. Dry-run keeps the legacy default `token_provider` placeholder. Manual `--live --captcha-token` still fails closed unless `--token-provider <integer>` is supplied.

## Exit Codes

| Code | Name | Meaning |
|---:|---|---|
| 0 | `ok` | Success |
| 2 | `usage` | Bad arguments, missing target, or unknown id |
| 30 | `blockedLogin` | Missing or unusable Clerk cookie |
| 32 | `blockedPaymentOrQuota` | Quota/payment/budget/manual gate |
| 40 | `schemaDrift` | Corrupt ledger, incompatible local state, or unexpected 4xx |
| 50 | `retryableUnknown` | Network failure, 5xx, or audio not ready |
| 70 | `internal` | Unexpected internal error |

Errors are JSON and are redacted before output.

## Safety

- Cookies, JWTs, bearer tokens, Clerk tokens, and `create_session_token` are redacted from JSON output.
- Runtime data is kept outside the repo by default.
- `node_modules/` and `dist/` are ignored in this package.
- Live create is behind `--live` and browser captcha minting because it can spend Suno credits.

## Manual Live-Fire Checklist

Do not run this checklist without explicit owner GO.

1. Confirm the owner approved one paid Suno create test in the current conversation.
2. Confirm the current credit balance and expected credit cost.
3. Confirm `npm test` is green.
4. Confirm `create --dry-run` emits the expected body and reuses `transactionUuid` for retry.
5. Confirm Playwright Chromium is installed with `npx playwright install chromium`.
6. Submit exactly one request with `create --live`.
7. If browser minting fails, use the manual `--captcha-token <token> --token-provider <integer>` escape hatch for one request only.
8. Record the returned `clips[].id` values only; do not log captcha token, Clerk JWT, cookie, or `create_session_token`.
9. Use `status`, `urls`, and `download` to retrieve results.

This repository task does not execute that live-fire step.
