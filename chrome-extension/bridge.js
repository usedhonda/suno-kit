// bridge.js — runs in the ISOLATED world.
//
// The MAIN-world hook (hook.js) cannot touch chrome.storage. This bridge can.
// It listens for the window.postMessage the hook emits, shows the on-page
// banner (primary UX), and persists the token into chrome.storage.local so the
// popup can look it up later (secondary path).
//
// banner.js runs before this file (see manifest content_scripts order) and
// exposes window.__sunoTokenGrabberShowBanner in the same ISOLATED scope.

(function () {
  "use strict";

  function isAllowedMessage(event) {
    // Across Chrome extension MAIN/ISOLATED worlds, WindowProxy identity can
    // fail a strict `event.source === window` check even for same page messages.
    // Keep cross-origin frames out, but accept Suno same-origin page messages.
    if (event.source === window) return true;
    return event.origin === window.location.origin;
  }

  console.log("[stg] bridge.js loaded (ISOLATED world)");

  window.addEventListener("message", function (event) {
    var d = event.data;
    if (d && d.source === "suno-token-grabber") {
      console.log("[stg] bridge saw our message; allowed=" + isAllowedMessage(event) + " origin=" + event.origin);
    }
    // Only accept same-page/same-origin messages, and only ours.
    if (!isAllowedMessage(event)) return;
    var data = event.data;
    if (!data || data.source !== "suno-token-grabber" || !data.payload) return;
    console.log("[stg] bridge accepted; calling banner");

    var record = {
      capturedAt: Date.now(),
      pageUrl: location.href,
      payload: data.payload
    };

    // Primary UX: show the floating banner immediately.
    try {
      if (typeof window.__sunoTokenGrabberShowBanner === "function") {
        window.__sunoTokenGrabberShowBanner(data.payload);
      }
    } catch (e) {
      // Banner is best-effort; never let it block the storage save.
    }

    // Secondary: persist for the popup "look it up later" path.
    try {
      chrome.storage.local.set({ latestToken: record });
    } catch (e) {
      // Extension context may be invalidated (e.g. after reload) — ignore.
    }
  });
})();
