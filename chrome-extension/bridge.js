// bridge.js — runs in the ISOLATED world.
//
// The MAIN-world hook (hook.js) cannot touch chrome.storage. This bridge can.
// It listens for the window.postMessage the hook emits and persists the token
// into chrome.storage.local so the popup can read it later.

(function () {
  "use strict";

  window.addEventListener("message", function (event) {
    // Only accept messages from this same window (the page), and only ours.
    if (event.source !== window) return;
    var data = event.data;
    if (!data || data.source !== "suno-token-grabber" || !data.payload) return;

    var record = {
      capturedAt: Date.now(),
      pageUrl: location.href,
      payload: data.payload
    };

    try {
      chrome.storage.local.set({ latestToken: record });
    } catch (e) {
      // Extension context may be invalidated (e.g. after reload) — ignore.
    }
  });
})();
