// main.js - UNIFIED CONTENT SCRIPT
console.log("Cogni-Shield: Content script active.");

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type !== "COGNI_SHIELD_SETTINGS_CHANGED") return;

  const settings = msg.settings;
  console.log("Received settings:", settings);

  // Existing Visual Guard
  if (window.applyVisualGuard) {
    window.applyVisualGuard(settings);
  }

  // Readability Mode
  if (settings.enabled && settings.readabilityMode) {
    window.CogniShield?.enableReadability?.();
  } else {
    window.CogniShield?.disableReadability?.();
  }

  // Focus Mode (Hiding distractions)
  if (settings.enabled && settings.focusMode) {
    window.FocusMode?.enable?.();
  } else {
    window.FocusMode?.disable?.();
  }

  // Cursor Spotlight
  if (
    settings.enabled &&
    settings.cursorSpotlight &&
    window.enableCursorSpotlight
  ) {
    window.enableCursorSpotlight();
  } else if (window.disableCursorSpotlight) {
    window.disableCursorSpotlight();
  }
});

// --- INITIALIZATION ---

// 1. Initial Load from Storage
chrome.storage.local.get(null, (settings) => {
  window.runShield(settings);
});

// 2. Listen for Live Popup Updates
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "COGNI_SHIELD_SETTINGS_CHANGED") {
    window.runShield(msg.settings);
    if (sendResponse) sendResponse({ status: "ok" });
  }
  return true; // Keeps the message channel open
});

// 3. AI Helper (Available for features to call)
console.log(
  "Gemini AI Integration:",
  typeof window.simplifyTextWithAI !== "undefined" ? "READY" : "OFFLINE"
);
