// Default settings
const DEFAULT_SETTINGS = {
  enabled: true,
  focusMode: false,
  readabilityMode: false,
  semanticDecanter: false,
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

  // Intensity slider
  elements.intensitySlider.value = settings.intensity;
  elements.intensityValue.textContent = INTENSITY_LABELS[settings.intensity];

  // Status text
  updateStatusText();

  // Disable features if master toggle is off
  updateDisabledState();
}

// Update status text
function updateStatusText() {
  if (settings.enabled) {
    const activeFeatures = [
      settings.focusMode && "Focus",
      settings.readabilityMode && "Readability",
      settings.semanticDecanter && "AI",
    ].filter(Boolean);

    if (activeFeatures.length > 0) {
      elements.statusText.textContent = `Active: ${activeFeatures.join(", ")}`;
    } else {
      elements.statusText.textContent = "Cogni-Shield is active";
    }
  } else {
    elements.statusText.textContent = "Cogni-Shield is inactive";
  }
}

// Update disabled state of features and intensity
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

// Save settings to chrome.storage.local
function saveSettings(key, value) {
  settings[key] = value;
  chrome.storage.local.set({ [key]: value }, () => {
    updateStatusText();
    updateDisabledState();
    notifyContentScript();
  });
}

// Send message to content scripts
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
        intensity: settings.intensity,
      },
    });
  });
}


// Apply theme
function applyTheme(theme) {
  if (theme === "dark") {
    document.body.classList.add("dark-theme");
  } else {
    document.body.classList.remove("dark-theme");
  }
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
  // Master toggle
  elements.masterToggle.addEventListener("change", (e) => {
    saveSettings("enabled", e.target.checked);
  });

  // Feature toggles
  elements.focusMode.addEventListener("change", (e) => {
    saveSettings("focusMode", e.target.checked);
  });

  elements.readabilityMode.addEventListener("change", (e) => {
    saveSettings("readabilityMode", e.target.checked);
  });

  elements.semanticDecanter.addEventListener("change", (e) => {
    saveSettings("semanticDecanter", e.target.checked);
  });

  // Intensity slider
  elements.intensitySlider.addEventListener("input", (e) => {
    const value = parseInt(e.target.value);
    elements.intensityValue.textContent = INTENSITY_LABELS[value];
  });

  elements.intensitySlider.addEventListener("change", (e) => {
    const value = parseInt(e.target.value);
    saveSettings("intensity", value);
  });

  // Theme toggle
  elements.themeToggle.addEventListener("click", toggleTheme);
}

// Initialize on load
document.addEventListener("DOMContentLoaded", init);
