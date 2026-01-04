// main.js - UNIFIED CONTENT SCRIPT
console.log("Cogni-Shield: Content script active.");

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type !== "COGNI_SHIELD_SETTINGS_CHANGED") return;

  console.log("Received settings:", msg.settings);

  // Existing Visual Guard
  if (window.applyVisualGuard) {
    window.applyVisualGuard(msg.settings);
  }

  // ✅ ADD THIS — Readability Mode
  if (msg.settings.enabled && msg.settings.readabilityMode) {
    window.CogniShield?.enableReadability();
  } else {
    window.CogniShield?.disableReadability();
  }

  // 2. Readability Mode (Text/Font adjustments)
  if (msg.settings.enabled && msg.settings.readabilityMode) {
    window.CogniShield?.enableReadability?.();
  } else {
    window.CogniShield?.disableReadability?.();
  }

  // 3. Focus Mode (Hiding distractions)
  if (msg.settings.enabled && msg.settings.focusMode) {
    window.FocusMode?.enable?.();
  } else {
    window.FocusMode?.disable?.();
  }

  // 4. Cursor Spotlight
  if (
    msg.settings.enabled &&
    msg.settings.cursorSpotlight &&
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
