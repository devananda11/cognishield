// background.js for CogniShield
// Handles context menu for Decant

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "cogniShieldDecant",
    title: "Decant (Simplify Text)",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "cogniShieldDecant" && info.selectionText) {
    chrome.tabs.sendMessage(tab.id, {
      type: "COGNI_SHIELD_DECANT_SELECTION",
      text: info.selectionText,
    });
  }
});
