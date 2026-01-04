// main.js - UNIFIED CONTENT SCRIPT
console.log("Cogni-Shield: Content script active.");

/**
 * Unified Runner: Handles all feature toggles based on settings
 */
window.runShield = function(settings) {
  if (!settings) return;
  
  console.log("Applying Cogni-Shield settings:", settings);

  // 1. Visual Guard (Flash/Luminance Protection)
  if (window.applyVisualGuard) {
    window.applyVisualGuard(settings);
  }

  // 2. Readability Mode (Font/Text adjustments)
  if (settings.enabled && settings.readabilityMode) {
    window.CogniShield?.enableReadability?.();
  } else {
    window.CogniShield?.disableReadability?.();
  }

  // 3. Focus Mode (Hiding distractions)
  if (settings.enabled && settings.focusMode) {
    window.FocusMode?.enable?.();
  } else {
    window.FocusMode?.disable?.();
  }
  
  // 4. Cursor Spotlight
  if (settings.enabled && settings.cursorSpotlight && window.enableCursorSpotlight) {
    window.enableCursorSpotlight();
  } else if (window.disableCursorSpotlight) {
    window.disableCursorSpotlight();
  }
};

// --- INITIALIZATION ---

// 1. Initial Load from Storage
chrome.storage.local.get(null, (settings) => {
  window.runShield(settings);
});

// 2. Listen for Live Popup Updates
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "COGNI_SHIELD_SETTINGS_CHANGED") {
    // Pass the settings object from the message to the runner
    window.runShield(msg.settings);
    if (sendResponse) sendResponse({status: "ok"});
  }
  return true; // Keeps the message channel open for async responses
});

// 3. AI Helper Status Check
console.log("Gemini AI Integration:", typeof window.simplifyTextWithAI !== "undefined" ? "READY" : "OFFLINE");