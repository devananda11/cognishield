// popup.js
const DEFAULT_SETTINGS = {
  enabled: true,
  focusMode: false,
  readabilityMode: false,
  semanticDecanter: false,
  cursorSpotlight: false,
  intensity: 3,
  theme: "light",
};

const INTENSITY_LABELS = {
  1: "Very Low", 2: "Low", 3: "Medium", 4: "High", 5: "Very High"
};

const elements = {
  masterToggle: document.getElementById("masterToggle"),
  intensitySlider: document.getElementById("intensitySlider"),
  intensityValue: document.getElementById("intensityValue"),
  focusMode: document.getElementById("focusMode"),
  readabilityMode: document.getElementById("readabilityMode"),
  cursorSpotlight: document.getElementById("cursorSpotlight"),
};

let settings = { ...DEFAULT_SETTINGS };

document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get(DEFAULT_SETTINGS, (result) => {
    settings = result;
    updateUI();
    attachListeners();
  });
});

function updateUI() {
  if (elements.masterToggle) elements.masterToggle.checked = settings.enabled;
  if (elements.intensitySlider) {
    elements.intensitySlider.value = settings.intensity;
    elements.intensityValue.textContent = INTENSITY_LABELS[settings.intensity];
  }
  if (elements.focusMode) elements.focusMode.checked = settings.focusMode;
  if (elements.cursorSpotlight) elements.cursorSpotlight.checked = settings.cursorSpotlight;
}

function saveAndNotify(key, value) {
  settings[key] = value;
  chrome.storage.local.set({ [key]: value }, () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: "COGNI_SHIELD_SETTINGS_CHANGED",
          settings: settings
        });
      }
    });
  });
}

function attachListeners() {
  elements.masterToggle?.addEventListener("change", (e) => saveAndNotify("enabled", e.target.checked));
  
  elements.intensitySlider?.addEventListener("input", (e) => {
    const val = parseInt(e.target.value);
    elements.intensityValue.textContent = INTENSITY_LABELS[val];
  });

  elements.intensitySlider?.addEventListener("change", (e) => {
    saveAndNotify("intensity", parseInt(e.target.value));
  });

  elements.focusMode?.addEventListener("change", (e) => saveAndNotify("focusMode", e.target.checked));
  elements.cursorSpotlight?.addEventListener("change", (e) => saveAndNotify("cursorSpotlight", e.target.checked));
}