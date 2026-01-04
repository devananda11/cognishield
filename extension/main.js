console.log("Cogni-Shield content script loaded");

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "COGNI_SHIELD_SETTINGS_CHANGED") {
    console.log("Received settings:", msg.settings);

    if (window.applyVisualGuard) {
      window.applyVisualGuard(msg.settings);
    }
  }
});
console.log("Gemini AI available?", typeof window.simplifyTextWithAI);

window
  .simplifyTextWithAI?.(
    `The Eiffel Tower, located in Paris, France, was constructed between 1887 and 1889 as the entrance arch for the 1889 World's Fair. Standing at 324 meters tall, it was the tallest man-made structure in the world for 41 years. Today, it is one of the most recognizable structures globally and attracts millions of visitors each year, serving as a symbol of French art, culture, and engineering prowess.`
  )
  .then((result) => {
    console.log("GEMINI TEST RESULT:", result);
  });
