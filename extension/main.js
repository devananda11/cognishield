// main.js - UNIFIED CONTENT SCRIPT
console.log("Cogni-Shield: Content script active.");

window.runShield = function(settings) {
  if (!settings) return;
  
  console.log("Applying Cogni-Shield settings:", settings);

  // 1. Visual Guard (MVP) - Independent check
  // We call this first so it always protects the user
  if (window.applyVisualGuard) {
    window.applyVisualGuard(settings);
  }

  // 2. Readability Mode
  if (settings.enabled && settings.readabilityMode) {
    window.CogniShield?.enableReadability?.();
  } else {
    window.CogniShield?.disableReadability?.();
  }

  // 3. Focus Mode
  if (settings.enabled && settings.focusMode) {
    window.FocusMode?.enable?.();
  } else {
    window.FocusMode?.disable?.();
  }
  
  // 4. Cursor Spotlight
  if (settings.enabled && settings.cursorSpotlight && window.enableCursorSpotlight) {
    window.enableCursorSpotlight();
  } else {
    window.disableCursorSpotlight?.();
  }

  // 5. Semantic Decanter
  if (settings.enabled && settings.semanticMode) {
    window.SemanticDecanter?.enable?.();
  } else {
    window.SemanticDecanter?.disable?.();
  }
};

// Initial Load
chrome.storage.local.get(null, (settings) => {
  window.runShield(settings);
});

// Live Updates
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "COGNI_SHIELD_SETTINGS_CHANGED") {
    window.runShield(msg.settings);
    if (sendResponse) sendResponse({status: "ok"});
  }
  return true; 
});