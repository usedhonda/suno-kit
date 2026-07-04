// hook.js — runs in the MAIN world at document_start.
//
// Why MAIN world: to read a request's JSON BODY we must wrap the page's own
// window.fetch / XMLHttpRequest before the page uses them. Content scripts in
// the default ISOLATED world get a separate `window`, so their fetch override
// would never see the page's calls. "world": "MAIN" injects us into the page's
// real JS context.
//
// Why not webRequest / declarativeNetRequest: in Manifest V3 those APIs cannot
// read request bodies (raw body access was removed). Hooking fetch/XHR is the
// only way to see the `token` field the page sends.
//
// Golden rule: never break the page. We always call through to the original
// implementation and return exactly what it returns; all our own logic is
// wrapped in try/catch so a parsing hiccup can never affect Suno.

(function () {
  "use strict";

  var CREATE_MARKER = "/api/generate/v2-web/";

  // Pull the fields suno-cli cares about out of the parsed request body.
  function extractPayload(body) {
    if (!body || typeof body !== "object") return null;
    if (typeof body.token !== "string" || body.token.length === 0) return null;
    return {
      token: body.token,
      token_provider: body.token_provider,
      transaction_uuid: body.transaction_uuid,
      tags: body.tags,
      title: body.title,
      make_instrumental: body.make_instrumental
    };
  }

  // Best-effort: turn whatever was passed as a request body into an object.
  // Only strings are realistically JSON here; anything else we ignore.
  function parseBody(rawBody) {
    try {
      if (typeof rawBody === "string") {
        return JSON.parse(rawBody);
      }
    } catch (e) {
      // Not JSON, or truncated — silently give up, never throw.
    }
    return null;
  }

  function report(url, method, rawBody) {
    try {
      if (!url || String(url).indexOf(CREATE_MARKER) === -1) return;
      if (String(method).toUpperCase() !== "POST") return;
      var parsed = parseBody(rawBody);
      var payload = extractPayload(parsed);
      if (!payload) return;
      window.postMessage(
        { source: "suno-token-grabber", payload: payload },
        "*"
      );
    } catch (e) {
      // Never let our observation break the page's request flow.
    }
  }

  // --- Hook window.fetch -------------------------------------------------
  try {
    var originalFetch = window.fetch;
    if (typeof originalFetch === "function") {
      window.fetch = function (input, init) {
        try {
          var url =
            typeof input === "string"
              ? input
              : input && input.url
              ? input.url
              : "";
          var method =
            (init && init.method) ||
            (input && input.method) ||
            "GET";
          var body = init && init.body;
          report(url, method, body);
        } catch (e) {
          // Observation only — swallow and fall through.
        }
        // Always call the real fetch with the untouched arguments.
        return originalFetch.apply(this, arguments);
      };
    }
  } catch (e) {
    // If wrapping fails, the page keeps its original fetch. Fine.
  }

  // --- Hook XMLHttpRequest ----------------------------------------------
  // open() stashes url/method on the instance; send() sees the body.
  try {
    var XHR = window.XMLHttpRequest;
    if (XHR && XHR.prototype) {
      var originalOpen = XHR.prototype.open;
      var originalSend = XHR.prototype.send;

      XHR.prototype.open = function (method, url) {
        try {
          this.__stgMethod = method;
          this.__stgUrl = url;
        } catch (e) {}
        return originalOpen.apply(this, arguments);
      };

      XHR.prototype.send = function (body) {
        try {
          report(this.__stgUrl, this.__stgMethod, body);
        } catch (e) {}
        // Always forward to the real send with the original body.
        return originalSend.apply(this, arguments);
      };
    }
  } catch (e) {
    // Leave XHR untouched on failure.
  }
})();
