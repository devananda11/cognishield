// Default settings
const DEFAULT_SETTINGS = {
  enabled: true,
  focusMode: false,
  readabilityMode: false,
  semanticDecanter: false,
  cursorSpotlight: false, // ✅ ADDED
  intensity: 3,
  theme: "light",
};

// Intensity labels
const INTENSITY_LABELS = {
  1: "Very Low",
  2: "Low",
  3: "Medium",
  4: "High",
  5: "Very High",
};

// DOM Elements
const elements = {
  masterToggle: document.getElementById("masterToggle"),
  focusMode: document.getElementById("focusMode"),
  readabilityMode: document.getElementById("readabilityMode"),
  semanticDecanter: document.getElementById("semanticDecanter"),
  cursorSpotlight: document.getElementById("cursorSpotlight"), // ✅ ADDED
  intensitySlider: document.getElementById("intensitySlider"),
  intensityValue: document.getElementById("intensityValue"),
  statusText: document.getElementById("statusText"),
  themeToggle: document.getElementById("themeToggle"),
  featuresSection: document.getElementById("featuresSection"),
  intensitySection: document.getElementById("intensitySection"),
};

// Current settings
let settings = { ...DEFAULT_SETTINGS };

// Initialize popup
function init() {
  loadSettings();
  attachEventListeners();
}

// Load settings from chrome.storage.local
function loadSettings() {
  chrome.storage.local.get(DEFAULT_SETTINGS, (result) => {
    settings = result;
    updateUI();
    applyTheme(settings.theme);
  });
}

// Update UI based on current settings
function updateUI() {
  // Master toggle
  elements.masterToggle.checked = settings.enabled;

  // Feature toggles
  elements.focusMode.checked = settings.focusMode;
  elements.readabilityMode.checked = settings.readabilityMode;
  elements.semanticDecanter.checked = settings.semanticDecanter;
  elements.cursorSpotlight.checked = settings.cursorSpotlight; // ✅ ADDED

  // Intensity slider
  elements.intensitySlider.value = settings.intensity;
  elements.intensityValue.textContent = INTENSITY_LABELS[settings.intensity];

  updateStatusText();
  updateDisabledState();
}

// Update status text
function updateStatusText() {
  if (settings.enabled) {
    const activeFeatures = [
      settings.focusMode && "Focus",
      settings.readabilityMode && "Readability",
      settings.semanticDecanter && "AI",
      settings.cursorSpotlight && "Spotlight", // ✅ ADDED
    ].filter(Boolean);

    elements.statusText.textContent =
      activeFeatures.length > 0
        ? `Active: ${activeFeatures.join(", ")}`
        : "Cogni-Shield is active";
  } else {
    elements.statusText.textContent = "Cogni-Shield is inactive";
  }
}

// Disable feature controls if master toggle is off
function updateDisabledState() {
  if (settings.enabled) {
    elements.featuresSection.classList.remove("disabled");
    elements.intensitySection.classList.remove("disabled");
    elements.intensitySlider.disabled = false;
  } else {
    elements.featuresSection.classList.add("disabled");
    elements.intensitySection.classList.add("disabled");
    elements.intensitySlider.disabled = true;
  }
}

// Save settings
function saveSettings(key, value) {
  settings[key] = value;
  chrome.storage.local.set({ [key]: value }, () => {
    updateStatusText();
    updateDisabledState();
    notifyContentScript();
  });
}

// Notify content script
function notifyContentScript() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]) return;

    chrome.tabs.sendMessage(tabs[0].id, {
      type: "COGNI_SHIELD_SETTINGS_CHANGED",
      settings: {
        enabled: settings.enabled,
        focusMode: settings.focusMode,
        readabilityMode: settings.readabilityMode,
        semanticDecanter: settings.semanticDecanter,
        cursorSpotlight: settings.cursorSpotlight, // ✅ ADDED
        intensity: settings.intensity,
      },
    });
  });
}

// Apply theme
function applyTheme(theme) {
  document.body.classList.toggle("dark-theme", theme === "dark");
}

// Toggle theme
function toggleTheme() {
  const newTheme = settings.theme === "light" ? "dark" : "light";
  settings.theme = newTheme;
  chrome.storage.local.set({ theme: newTheme });
  applyTheme(newTheme);
}

// Attach event listeners
function attachEventListeners() {
  elements.masterToggle.addEventListener("change", (e) =>
    saveSettings("enabled", e.target.checked)
  );

  elements.focusMode.addEventListener("change", (e) =>
    saveSettings("focusMode", e.target.checked)
  );

  elements.readabilityMode.addEventListener("change", (e) =>
    saveSettings("readabilityMode", e.target.checked)
  );

  elements.semanticDecanter.addEventListener("change", (e) =>
    saveSettings("semanticDecanter", e.target.checked)
  );

  elements.cursorSpotlight.addEventListener("change", (e) =>
    saveSettings("cursorSpotlight", e.target.checked)
  ); // ✅ ADDED

  elements.intensitySlider.addEventListener("input", (e) => {
    const value = parseInt(e.target.value);
    elements.intensityValue.textContent = INTENSITY_LABELS[value];
  });

  elements.intensitySlider.addEventListener("change", (e) =>
    saveSettings("intensity", parseInt(e.target.value))
  );

  elements.themeToggle.addEventListener("click", toggleTheme);
}

// Init
document.addEventListener("DOMContentLoaded", init);