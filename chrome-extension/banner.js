// banner.js — on-page floating toast shown when a token is captured.
//
// Runs in the ISOLATED world (registered before bridge.js). It has full DOM
// access. Everything lives inside a Shadow DOM host so Suno's page styles can
// never leak in and ours never leak out. Relies on buildSunoCliCommand() from
// command.js (same ISOLATED-world global scope).

(function () {
  "use strict";

  var HOST_ID = "suno-token-grabber-banner";
  var AUTO_DISMISS_MS = 12000;

  var state = { host: null, timer: null };

  // --- clipboard with execCommand fallback ------------------------------
  function copyText(text, onDone) {
    function fallback() {
      try {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        onDone(true);
      } catch (e) {
        onDone(false);
      }
    }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(
          function () { onDone(true); },
          function () { fallback(); }
        );
      } else {
        fallback();
      }
    } catch (e) {
      fallback();
    }
  }

  function flash(btn, ok) {
    var old = btn.textContent;
    btn.textContent = ok ? "Copied!" : "Copy failed";
    setTimeout(function () { btn.textContent = old; }, 1200);
  }

  function dismiss() {
    if (state.timer) { clearTimeout(state.timer); state.timer = null; }
    var host = state.host;
    if (!host) return;
    state.host = null;
    host.style.opacity = "0";
    host.style.transform = "translateY(8px)";
    setTimeout(function () {
      if (host && host.parentNode) host.parentNode.removeChild(host);
    }, 300);
  }

  // Remove any existing banner so a fresh token always replaces the old one.
  function clearExisting() {
    if (state.timer) { clearTimeout(state.timer); state.timer = null; }
    if (state.host && state.host.parentNode) {
      state.host.parentNode.removeChild(state.host);
    }
    state.host = null;
    var stray = document.getElementById(HOST_ID);
    if (stray && stray.parentNode) stray.parentNode.removeChild(stray);
  }

  function truncate(token) {
    var s = String(token || "");
    return s.length > 16 ? s.slice(0, 16) + "…" : s;
  }

  function whenBodyReady(fn) {
    if (document.body) {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn, { once: true });
  }

  function show(payload) {
    console.log("[stg] banner show() called; token=" + (payload && payload.token) + " bodyReady=" + !!document.body);
    if (!payload || !payload.token) return;
    if (!document.body) {
      whenBodyReady(function () { show(payload); });
      return;
    }

    clearExisting();

    // Host lives in the page; its inline styles are hard to override and it
    // only carries positioning. All real UI is inside the shadow root.
    var host = document.createElement("div");
    host.id = HOST_ID;
    host.style.cssText =
      "position:fixed;right:16px;bottom:16px;z-index:2147483647;" +
      "opacity:0;transform:translateY(8px);" +
      "transition:opacity .3s ease,transform .3s ease;";
    var shadow = host.attachShadow({ mode: "open" });

    var tp =
      payload.token_provider !== undefined && payload.token_provider !== null
        ? String(payload.token_provider)
        : "—";

    shadow.innerHTML =
      '<style>' +
      ':host,*{box-sizing:border-box;}' +
      '.card{width:280px;font:13px/1.4 -apple-system,BlinkMacSystemFont,' +
      '"Segoe UI",sans-serif;color:#e8e8ec;background:rgba(20,21,26,.92);' +
      'backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,.1);' +
      'border-radius:10px;padding:12px 12px 10px;' +
      'box-shadow:0 8px 28px rgba(0,0,0,.4);}' +
      '.head{display:flex;align-items:center;justify-content:space-between;' +
      'margin-bottom:6px;}' +
      '.label{font-weight:600;font-size:13px;color:#57d38c;}' +
      '.x{cursor:pointer;background:transparent;border:0;color:#9aa0aa;' +
      'font-size:16px;line-height:1;padding:0 2px;}' +
      '.x:hover{color:#e8e8ec;}' +
      '.mono{font-family:ui-monospace,monospace;font-size:12px;' +
      'color:#c3c8d2;word-break:break-all;}' +
      '.meta{font-size:11px;color:#8a909a;margin:2px 0 8px;}' +
      '.row{display:flex;gap:6px;}' +
      'button.act{flex:1;cursor:pointer;font-size:11px;font-weight:600;' +
      'border:0;border-radius:6px;padding:6px;color:#fff;background:#3b6ef5;}' +
      'button.act.sec{background:#2e313c;color:#e8e8ec;}' +
      '</style>' +
      '<div class="card">' +
      '<div class="head"><span class="label">✓ Suno token captured</span>' +
      '<button class="x" title="Dismiss">×</button></div>' +
      '<div class="mono" id="tok"></div>' +
      '<div class="meta">token_provider: <b id="tp"></b>' +
      '<span id="auth"></span></div>' +
      '<div class="row">' +
      '<button class="act" id="copyTok">Copy token</button>' +
      '<button class="act sec" id="copyCmd">Copy suno-cli command</button>' +
      '</div></div>';

    shadow.getElementById("tok").textContent = truncate(payload.token);
    shadow.getElementById("tp").textContent = tp;
    if (payload.authJwt) {
      shadow.getElementById("auth").textContent = "  ·  incl. auth";
    }

    shadow.querySelector(".x").addEventListener("click", dismiss);

    shadow.getElementById("copyTok").addEventListener("click", function () {
      var btn = this;
      copyText(payload.token, function (ok) { flash(btn, ok); });
    });

    shadow.getElementById("copyCmd").addEventListener("click", function () {
      var btn = this;
      var cmd =
        typeof buildSunoCliCommand === "function"
          ? buildSunoCliCommand(payload)
          : payload.token;
      copyText(cmd, function (ok) { flash(btn, ok); });
    });

    document.body.appendChild(host);
    console.log("[stg] banner appended to DOM");
    state.host = host;

    // Trigger the fade-in on the next frame.
    requestAnimationFrame(function () {
      host.style.opacity = "1";
      host.style.transform = "translateY(0)";
    });

    state.timer = setTimeout(dismiss, AUTO_DISMISS_MS);
  }

  // Expose for bridge.js (same ISOLATED-world global scope).
  window.__sunoTokenGrabberShowBanner = show;
})();
