// popup.js — reads the last captured token from chrome.storage.local and
// renders it, with copy buttons for the raw token and a ready suno-cli command.

(function () {
  "use strict";

  var statusEl = document.getElementById("status");
  var contentEl = document.getElementById("content");
  var tokenEl = document.getElementById("token");
  var fieldsEl = document.getElementById("fields");
  var copyTokenBtn = document.getElementById("copyToken");
  var copyCmdBtn = document.getElementById("copyCmd");

  var current = null; // the loaded record

  function ago(ts) {
    var s = Math.max(0, Math.round((Date.now() - ts) / 1000));
    if (s < 60) return s + "s ago";
    var m = Math.round(s / 60);
    if (m < 60) return m + "m ago";
    var h = Math.round(m / 60);
    return h + "h ago";
  }

  function esc(v) {
    return String(v == null ? "" : v);
  }

  // buildSunoCliCommand() comes from command.js (loaded before this script).

  function copy(text, btn, label) {
    navigator.clipboard.writeText(text).then(
      function () {
        var old = btn.textContent;
        btn.textContent = "Copied!";
        setTimeout(function () {
          btn.textContent = old;
        }, 1200);
      },
      function () {
        btn.textContent = "Copy failed";
      }
    );
  }

  function render(record) {
    current = record;
    var p = record.payload;

    statusEl.textContent = "Token captured " + ago(record.capturedAt);
    statusEl.className = "status ok";

    tokenEl.value = p.token;

    var rows = [];
    if (p.token_provider !== undefined && p.token_provider !== null) {
      rows.push("<div>token_provider: <b>" + esc(p.token_provider) + "</b></div>");
    }
    if (p.title) rows.push("<div>title: <b>" + esc(p.title) + "</b></div>");
    if (p.tags) rows.push("<div>tags: <b>" + esc(p.tags) + "</b></div>");
    if (p.make_instrumental !== undefined) {
      rows.push("<div>instrumental: <b>" + esc(p.make_instrumental) + "</b></div>");
    }
    fieldsEl.innerHTML = rows.join("");

    contentEl.classList.remove("hidden");

    copyTokenBtn.onclick = function () {
      copy(p.token, copyTokenBtn);
    };
    copyCmdBtn.onclick = function () {
      copy(buildSunoCliCommand(p), copyCmdBtn);
    };
  }

  function showEmpty() {
    statusEl.textContent =
      "No token captured yet. Go to suno.com/create and press Create.";
    statusEl.className = "status none";
    contentEl.classList.add("hidden");
  }

  try {
    chrome.storage.local.get("latestToken", function (res) {
      var record = res && res.latestToken;
      if (record && record.payload && record.payload.token) {
        render(record);
      } else {
        showEmpty();
      }
    });
  } catch (e) {
    statusEl.textContent = "Could not read storage.";
    statusEl.className = "status none";
  }
})();
