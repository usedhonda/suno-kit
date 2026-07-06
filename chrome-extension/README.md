# Suno Captcha Helper

Experimental Chrome extension for `suno-cli` troubleshooting when Suno returns `blocked_captcha` (exit code 31).

Most users should not install this extension. The normal `suno-cli` flow is:

```bash
suno-cli login
suno-cli create --live --title "song" --style "lo-fi piano"
```

Use this extension only when the CLI explicitly reports that Suno requires a captcha token and you want to inspect the browser request path.

## What It Does

- Runs on `https://suno.com/*`.
- Watches the page's own `fetch` and XHR calls for `POST /api/generate/v2-web/`.
- If that request contains a string captcha `token`, it stores the token payload in `chrome.storage.local`.
- Shows a small on-page banner and popup with copy buttons.

The extension does not solve captcha challenges. It only observes a token that Suno's own page already placed in the create request.

## Install

1. Open `chrome://extensions`.
2. Turn on Developer mode.
3. Click Load unpacked.
4. Select this `chrome-extension/` folder.

## Usage

1. Keep using Suno normally in Chrome.
2. If the CLI reports `blocked_captcha`, open `https://suno.com/create`.
3. Trigger one owner-approved browser Create attempt.
4. If Suno's request contains a usable captcha token, the extension shows a banner.
5. Use the copied token only for an advanced `suno-cli create --live --captcha-token ... --token-provider ...` retry.

Captcha tokens are short-lived and may be single-use. The browser Create attempt may already consume the token.

## Security Warning

The advanced command can include your Suno auth JWT and captcha token. Treat both as secrets. Only paste them into your own local terminal. Never paste them into chat, issues, logs, screenshots, gists, or public places.

## Permissions

- `storage`: keep the most recent captured payload for the popup.
- `clipboardWrite`: support copy buttons.

No external requests, no CDN, no build step. Everything is plain JS/HTML/CSS.
