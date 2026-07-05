// command.js — shared helper used by both the popup and the on-page banner.
//
// Content scripts in the same world (ISOLATED) share one global scope, so this
// file just defines a global function. The popup loads it via a <script> tag
// before popup.js. (MV3 content scripts can't use ES `import`, hence globals.)

// Wrap a value in double quotes, escaping embedded quotes/backslashes.
function stgShellQuote(v) {
  return '"' + String(v == null ? "" : v).replace(/(["\\])/g, "\\$1") + '"';
}

// Build the ready-to-paste suno-cli command from a captured payload.
function buildSunoCliCommand(p) {
  var title = p.title && String(p.title).trim() ? p.title : "song";
  var style = p.tags != null ? p.tags : "";
  // Target distributed users: npx fetches + runs the published npm package
  // with zero prior install (--yes skips the install prompt).
  var parts = ["npx --yes @usedhonda/suno-cli create --live"];
  // When the auth JWT was captured, include it so one paste sets up auth too.
  // Absent => command omits --jwt and the CLI falls back to a saved session.
  if (p.authJwt) {
    parts.push("--jwt " + stgShellQuote(p.authJwt));
  }
  parts.push("--title " + stgShellQuote(title));
  parts.push("--style " + stgShellQuote(style));
  parts.push("--captcha-token " + stgShellQuote(p.token));
  if (p.token_provider !== undefined && p.token_provider !== null) {
    parts.push("--token-provider " + String(p.token_provider));
  }
  return parts.join(" ");
}
