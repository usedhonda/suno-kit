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
  var parts = [
    "node dist/src/cli.js create --live",
    "--title " + stgShellQuote(title),
    "--style " + stgShellQuote(style),
    "--captcha-token " + stgShellQuote(p.token)
  ];
  if (p.token_provider !== undefined && p.token_provider !== null) {
    parts.push("--token-provider " + String(p.token_provider));
  }
  return parts.join(" ");
}
