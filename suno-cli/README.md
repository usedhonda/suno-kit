# suno-cli

Command-line Suno helper for creating songs and retrieving finished audio.

## Quick Start

**1. Install the CLI.**

```bash
npm install -g @usedhonda/suno-cli
```

**2. Log in once.** A browser window opens — sign in to Suno normally.

```bash
suno-cli login
```

**3. Create a song.**

```bash
suno-cli create --live \
  --title "rain window" \
  --style "lo-fi piano, mellow, rain" \
  --lyrics "rain on the window"
```

The command prints JSON with Suno clip ids and `https://suno.com/song/<clip-id>` URLs. A successful create spends credits. If Suno requires a captcha, the CLI stops with `blocked_captcha` rather than opening or retrying a browser automatically.

## Retrieve Results

Check a run or clip:

```bash
suno-cli status <run-id|clip-id|song-url>
```

Print song URLs:

```bash
suno-cli urls <run-id|clip-id|song-url>
```

Download ready MP3 files:

```bash
suno-cli download <run-id|clip-id|song-url> --out ./downloads
```

`status`, `urls`, and `download` all print JSON. `download` waits for real audio readiness and does not treat Suno's silent placeholder file as success.

## Requirements

- Node.js 22 or newer
- Your own Suno account
- Enough Suno credits for live create requests

`suno-cli login` opens a browser window and stores a local session under:

```text
~/.local/share/suno-kit/
```

Runtime files stay outside the repository. The saved session is written with owner-only permissions where the OS supports them. To clear saved auth and the browser profile:

```bash
suno-cli logout
```

## Dry Run

Use `--dry-run` to inspect the request shape without spending credits:

```bash
suno-cli create --dry-run \
  --title "rain window" \
  --style "lo-fi piano, mellow, rain" \
  --lyrics "rain on the window"
```

Dry-run also reserves a local `transaction_uuid` for the same `--run-id`, so retries can reuse the same idempotency key.

## Common Create Options

```bash
suno-cli create --live \
  --title "track title" \
  --style "genre, mood, instruments" \
  --lyrics "lyrics text"
```

Use instrumental mode instead of lyrics:

```bash
suno-cli create --live \
  --title "night drive" \
  --style "synthwave, instrumental" \
  --instrumental
```

Useful optional controls:

| Flag | Meaning |
|---|---|
| `--exclude <text>` | Styles or sounds to avoid |
| `--vocal-gender m|f` | Vocal gender hint |
| `--weirdness <0-100>` | Suno weirdness slider |
| `--style-influence <0-100>` | Suno style influence slider |
| `--audio-influence <0-100>` | Suno audio influence slider |
| `--persona-id <id>` | Use an existing Suno persona |
| `--cover-clip-id <id>` | Cover an existing Suno clip |
| `--cover-start-s <sec>` / `--cover-end-s <sec>` | Cover range in seconds; requires `--cover-clip-id` |

Cover mode uses an existing Suno clip id. Uploading external audio is not implemented.

## Headless Login

If you are on SSH, VPS, WSL, or another environment without a browser UI, paste the Suno `__session` JWT from a machine where you are already logged in:

```bash
suno-cli login --jwt-paste '<copied-__session-value>'
```

The value is not printed back. Do not paste it into chat, issues, screenshots, logs, or commit history.

## Advanced Auth

Prefer `suno-cli login`. Use these only when debugging or running in automation you control.

Pass a direct JWT for one command:

```bash
suno-cli status <clip-id> --jwt '<copied-__session-value>'
suno-cli create --live --jwt '<copied-__session-value>' --title "probe" --style "lo-fi piano"
```

Or via environment:

```bash
export SUNO_KIT_JWT='<copied-__session-value>'
suno-cli status <clip-id>
```

The older cookie flow needs full Clerk browser context. A copied `__session` cookie string alone may not be enough for Clerk's client endpoint.

Cookie escape hatches:

```bash
export SUNO_KIT_COOKIE='<full-cookie-header>'
export SUNO_KIT_COOKIE_FILE=~/.local/share/suno-kit/cookie.txt
```

`SUNO_KIT_COOKIE` wins over `SUNO_KIT_COOKIE_FILE`. The per-command `--cookie-file <file>` flag is also available.

## Advanced Live Metadata

Most users do not need these fields. They are included for parity with observed Suno browser requests:

```bash
suno-cli create --live \
  --title "probe" \
  --style "lo-fi piano" \
  --session-token "$SUNO_CREATE_SESSION_TOKEN" \
  --user-tier "$SUNO_USER_TIER"
```

`SUNO_CREATE_SESSION_TOKEN` and `SUNO_USER_TIER` are also read from the environment. If omitted, the metadata keys are not sent.

## Captcha Diagnostics And Fallback

Normal `create --live` sends null captcha fields through the authenticated HTTP path. It never opens a browser or retries automatically. If Suno requires a captcha, it returns `blocked_captcha` with exit code `31`.

### Verify captcha for free

`--mint-check` is an explicit browser diagnostic. It captures a token and stops before create submission, so it does not spend credits:

```bash
suno-cli create --mint-check --title "test" --style "lo-fi piano"
```

`"status": "captcha_mint_ok"` means the diagnostic captured a token. It is not run by normal live create.

### Requirements for the browser mint

- `npx playwright install chromium` must have been run once (installs the browser).
- You must be logged in (`suno-cli login`).
- The mint uses a visible browser window, so run it on a machine with a display.

### Advanced: attach to an existing Chromium session

The default remains the dedicated `suno-cli` browser profile. Operators may
explicitly attach to an already visible, logged-in Chromium session that was
started with a loopback CDP port:

```bash
suno-cli create --mint-check \
  --title "test" \
  --style "lo-fi piano" \
  --cdp-endpoint http://127.0.0.1:9222
```

`SUNO_KIT_CDP_ENDPOINT=http://127.0.0.1:9222` provides the same opt-in for
managed runtimes. Only loopback HTTP origins are accepted. When explicitly
configured, the CLI reuses an existing Suno tab or opens one in that browser,
does not close the attached browser, and fails without falling back to the
dedicated profile if attachment fails. The generate request remains intercepted
and aborted during `--mint-check`, so the check does not submit or spend credits.

### Advanced: supply your own token

Skip the browser entirely by passing a fresh token from a logged-in Suno tab:

```bash
suno-cli create --live \
  --title "probe" \
  --style "lo-fi piano" \
  --captcha-token '<fresh-token>' \
  --token-provider <integer>
```

Captcha tokens are short-lived and may be single-use. Do not log them, paste them into chat, or commit them. If Suno blocks the create, the CLI returns status `blocked_captcha` and exit code `31`.

## Exit Codes

| Code | Name | Meaning |
|---:|---|---|
| 0 | `ok` | Success |
| 2 | `usage` | Bad arguments, missing target, or unknown id |
| 30 | `blockedLogin` | Missing or unusable login/session |
| 31 | `blockedCaptcha` | Suno requires a captcha token for this create request |
| 32 | `blockedPaymentOrQuota` | Quota, payment, budget, or manual live gate |
| 40 | `schemaDrift` | Corrupt ledger, incompatible local state, or unexpected 4xx |
| 50 | `retryableUnknown` | Network failure, 5xx, or audio not ready |
| 70 | `internal` | Unexpected internal error |

Errors are JSON and are redacted before output.

## Safety And Scope

- This is an unofficial community tool, not affiliated with or endorsed by Suno.
- Use your own account and understand that automated access can violate Suno's Terms of Service.
- Live create can spend credits.
- The CLI surfaces login, captcha, payment/quota, and network blocks instead of retrying around them.
- Cookies, JWTs, bearer tokens, Clerk tokens, captcha tokens, and `create_session_token` are redacted from JSON output.
- Runtime state is stored outside the repository by default.

## Manual Live-Fire Checklist

Do not run a paid live-fire test without explicit owner GO.

1. Confirm the owner approved one paid Suno create test in the current conversation.
2. Confirm the current credit balance and expected credit cost.
3. Confirm `npm test` is green.
4. Confirm `create --dry-run` emits the expected shape.
5. Confirm `suno-cli login` succeeds.
6. Submit exactly one request with `create --live`.
7. If Suno returns `blocked_captcha`, stop and use the advanced captcha path only with explicit approval.
8. Record returned `clips[].id` values only. Do not log secrets.
9. Use `status`, `urls`, and `download` to retrieve results.
