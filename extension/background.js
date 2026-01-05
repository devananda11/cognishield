// background.js

// Create the context menu item on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "cogniShieldDecant",
    title: "Decant (Simplify Text)",
    contexts: ["selection"],
  });
});

// Listen for clicks on the context menu
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "cogniShieldDecant" && info.selectionText) {
    // Send the selected text to the content script (semanticDecanter.js)
    chrome.tabs.sendMessage(tab.id, {
      type: "COGNI_SHIELD_DECANT_SELECTION",
      text: info.selectionText,
    });
  }
});