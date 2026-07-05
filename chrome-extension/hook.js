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
  var CAPTCHA_CHECK_MARKER = "/api/c/check";

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

  function describeShape(value) {
    if (value === null) return "null";
    if (Array.isArray(value)) return "array";
    return typeof value;
  }

  function logJsonShape(label, value) {
    try {
      if (!value || typeof value !== "object" || Array.isArray(value)) {
        console.log("[stg] hook: " + label + " shape=" + describeShape(value));
        return;
      }
      var keys = Object.keys(value);
      var types = [];
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        types.push(key + ":" + describeShape(value[key]));
      }
      console.log("[stg] hook: " + label + " keys=" + keys.join(","));
      console.log("[stg] hook: " + label + " types=" + types.join(","));
    } catch (e) {}
  }

  function reportCaptchaCheck(stage, rawBody) {
    try {
      var parsed = parseBody(rawBody);
      if (!parsed) {
        console.log("[stg] hook: /api/c/check " + stage + " parse failed; body type=" + typeof rawBody);
        return;
      }
      logJsonShape("/api/c/check " + stage, parsed);
    } catch (e) {}
  }

  function report(url, method, rawBody, authHeader) {
    try {
      if (!url || String(url).indexOf(CREATE_MARKER) === -1) return;
      if (String(method).toUpperCase() !== "POST") return;
      console.log("[stg] hook: CREATE request seen; url=" + url);
      var parsed = parseBody(rawBody);
      if (!parsed) {
        var isStr = typeof rawBody === "string";
        console.log(
          "[stg] hook: parse failed; isString=" + isStr +
          " len=" + (isStr ? rawBody.length : "-") +
          " firstChar=" + (isStr ? JSON.stringify(rawBody.charAt(0)) : "-")
        );
        return;
      }
      console.log("[stg] hook: parsed OK; keys=" + Object.keys(parsed).join(","));
      var payload = extractPayload(parsed);
      if (!payload) {
        console.log("[stg] hook: no token; token type=" + typeof parsed.token);
        console.log("[stg] hook: token is null=" + (parsed.token === null));
        if (parsed.token && typeof parsed.token === "object") {
          try {
            console.log("[stg] hook: token object keys=" + Object.keys(parsed.token).join(","));
          } catch (e) {}
        }
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
        var url = "";
        var method = "GET";
        try {
          url =
            typeof input === "string"
              ? input
              : input && input.url
              ? input.url
              : "";
          method =
            (init && init.method) ||
            (input && input.method) ||
            "GET";
          if (String(url).indexOf("/api/") !== -1) {
            console.log("[stg] fetch passed hook: " + method + " " + url);
          }
          var body = init && init.body;
          if (String(url).indexOf(CAPTCHA_CHECK_MARKER) !== -1) {
            console.log("[stg] hook: /api/c/check fetch request seen; method=" + method);
            if (body !== undefined && body !== null) {
              reportCaptchaCheck("request", body);
            } else if (
              input &&
              typeof input === "object" &&
              typeof input.clone === "function"
            ) {
              try {
                input
                  .clone()
                  .text()
                  .then(
                    function (text) {
                      reportCaptchaCheck("request", text);
                    },
                    function () {}
                  );
              } catch (e) {}
            } else {
              reportCaptchaCheck("request", body);
            }
          }
          // Authorization can live in init.headers or, when input is a
          // Request object, in input.headers. Prefer init, fall back to input.
          var auth = findAuthHeader(init && init.headers);
          if (!auth && input && typeof input === "object" && input.headers) {
            auth = findAuthHeader(input.headers);
          }
          if (body !== undefined && body !== null) {
            report(url, method, body, auth);
          } else if (
            input &&
            typeof input === "object" &&
            typeof input.clone === "function"
          ) {
            // Suno sends fetch(new Request(url, { body, headers })): the token
            // lives on the Request object, not init.body. Read it async from a
            // clone so we never disturb the real request stream.
            try {
              input
                .clone()
                .text()
                .then(
                  function (text) {
                    report(url, method, text, auth);
                  },
                  function () {}
                );
            } catch (e) {}
          } else {
            report(url, method, body, auth);
          }
        } catch (e) {
          // Observation only — swallow and fall through.
        }
        // Always call the real fetch with the untouched arguments.
        var responsePromise = originalFetch.apply(this, arguments);
        try {
          if (String(url).indexOf(CAPTCHA_CHECK_MARKER) !== -1) {
            responsePromise.then(
              function (response) {
                try {
                  response
                    .clone()
                    .text()
                    .then(
                      function (text) {
                        reportCaptchaCheck("response", text);
                      },
                      function () {}
                    );
                } catch (e) {}
              },
              function () {}
            );
          }
        } catch (e) {}
        return responsePromise;
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
          if (String(this.__stgUrl).indexOf(CAPTCHA_CHECK_MARKER) !== -1) {
            console.log("[stg] hook: /api/c/check xhr request seen; method=" + this.__stgMethod);
            reportCaptchaCheck("request", body);
            this.addEventListener("loadend", function () {
              try {
                reportCaptchaCheck("response", this.responseText);
              } catch (e) {}
            });
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
