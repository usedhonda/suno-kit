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

  console.log("[stg] hook.js loaded (MAIN world)");

  var CREATE_MARKER = "/api/generate/v2-web/";

  // Pull the raw JWT out of an Authorization header value ("Bearer <jwt>").
  function stripBearer(value) {
    if (typeof value !== "string" || value.length === 0) return null;
    var m = value.match(/^\s*Bearer\s+(.+)\s*$/i);
    return m ? m[1] : value;
  }

  // Find the Authorization header across the shapes fetch/XHR can hand us:
  // a Headers instance, a plain object, or an array of [key, value] pairs.
  function findAuthHeader(headers) {
    try {
      if (!headers) return null;
      // Headers instance (has a .get method).
      if (typeof headers.get === "function") {
        return headers.get("authorization");
      }
      // Array of [key, value] pairs.
      if (Array.isArray(headers)) {
        for (var i = 0; i < headers.length; i++) {
          var pair = headers[i];
          if (pair && String(pair[0]).toLowerCase() === "authorization") {
            return pair[1];
          }
        }
        return null;
      }
      // Plain object — case-insensitive key lookup.
      if (typeof headers === "object") {
        for (var k in headers) {
          if (
            Object.prototype.hasOwnProperty.call(headers, k) &&
            k.toLowerCase() === "authorization"
          ) {
            return headers[k];
          }
        }
      }
    } catch (e) {}
    return null;
  }

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

  function report(url, method, rawBody, authHeader) {
    try {
      if (!url || String(url).indexOf(CREATE_MARKER) === -1) return;
      if (String(method).toUpperCase() !== "POST") return;
      console.log("[stg] hook: CREATE request seen; url=" + url);
      var parsed = parseBody(rawBody);
      var payload = extractPayload(parsed);
      if (!payload) {
        console.log("[stg] hook: body not parseable or no token; typeof body=" + typeof rawBody);
        return;
      }
      console.log("[stg] hook: payload extracted, posting message");
      // Best-effort: attach the auth JWT if we found an Authorization header.
      var jwt = stripBearer(authHeader);
      if (jwt) payload.authJwt = jwt;
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
          if (String(url).indexOf("/api/") !== -1) {
            console.log("[stg] fetch passed hook: " + method + " " + url);
          }
          var body = init && init.body;
          // Authorization can live in init.headers or, when input is a
          // Request object, in input.headers. Prefer init, fall back to input.
          var auth = findAuthHeader(init && init.headers);
          if (!auth && input && typeof input === "object" && input.headers) {
            auth = findAuthHeader(input.headers);
          }
          report(url, method, body, auth);
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
      var originalSetHeader = XHR.prototype.setRequestHeader;

      XHR.prototype.open = function (method, url) {
        try {
          this.__stgMethod = method;
          this.__stgUrl = url;
          this.__stgHeaders = {}; // reset per request
        } catch (e) {}
        return originalOpen.apply(this, arguments);
      };

      // Stash every header the page sets, so send() can read Authorization.
      XHR.prototype.setRequestHeader = function (name, value) {
        try {
          if (!this.__stgHeaders) this.__stgHeaders = {};
          this.__stgHeaders[name] = value;
        } catch (e) {}
        return originalSetHeader.apply(this, arguments);
      };

      XHR.prototype.send = function (body) {
        try {
          if (String(this.__stgUrl).indexOf("/api/") !== -1) {
            console.log("[stg] xhr passed hook: " + this.__stgMethod + " " + this.__stgUrl);
          }
          var auth = findAuthHeader(this.__stgHeaders);
          report(this.__stgUrl, this.__stgMethod, body, auth);
        } catch (e) {}
        // Always forward to the real send with the original body.
        return originalSend.apply(this, arguments);
      };
    }
  } catch (e) {
    // Leave XHR untouched on failure.
  }
})();
