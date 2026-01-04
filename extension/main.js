console.log("Cogni-Shield content script loaded");

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "COGNI_SHIELD_SETTINGS_CHANGED") {
    console.log("Received settings:", msg.settings);

    if (window.applyVisualGuard) {
      window.applyVisualGuard(msg.settings);
    }
  }
});

