// popup.js
const DEFAULT_SETTINGS = {
  enabled: true,
  focusMode: false,
  readabilityMode: false,
  semanticDecanter: false,
  cursorSpotlight: false, // ✅ ADDED
  theme: "light",
};

const elements = {
  masterToggle: document.getElementById("masterToggle"),
  focusMode: document.getElementById("focusMode"),
  readabilityMode: document.getElementById("readabilityMode"),
  semanticDecanter: document.getElementById("semanticDecanter"),
  cursorSpotlight: document.getElementById("cursorSpotlight"),
  statusText: document.getElementById("statusText"), // ✅ FIXED
  featuresSection: document.getElementById("featuresSection"), // ✅ ADDED
  themeToggle: document.getElementById("themeToggle"),
};

let settings = { ...DEFAULT_SETTINGS };

document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get(DEFAULT_SETTINGS, (result) => {
    settings = result;
    applyTheme(settings.theme);
    updateUI();
    attachEventListeners();
  });
});

function updateUI() {
  // Master toggle
  if (elements.masterToggle) elements.masterToggle.checked = settings.enabled;

  // Feature toggles
  if (elements.focusMode) elements.focusMode.checked = settings.focusMode;
  if (elements.readabilityMode)
    elements.readabilityMode.checked = settings.readabilityMode;
  if (elements.semanticDecanter)
    elements.semanticDecanter.checked = settings.semanticDecanter;
  if (elements.cursorSpotlight)
    elements.cursorSpotlight.checked = settings.cursorSpotlight; // ✅ ADDED

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
  if (elements.focusMode) elements.focusMode.checked = settings.focusMode;
  if (elements.cursorSpotlight)
    elements.cursorSpotlight.checked = settings.cursorSpotlight;
}

// Disable feature controls if master toggle is off
function updateDisabledState() {
  if (!elements.featuresSection) return;
  if (settings.enabled) {
    elements.featuresSection.classList.remove("disabled");
  } else {
    elements.featuresSection.classList.add("disabled");
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
  if (elements.masterToggle) {
    elements.masterToggle.addEventListener("change", (e) =>
      saveSettings("enabled", e.target.checked)
    );
  }

  if (elements.focusMode) {
    elements.focusMode.addEventListener("change", (e) =>
      saveSettings("focusMode", e.target.checked)
    );
  }

  if (elements.readabilityMode) {
    elements.readabilityMode.addEventListener("change", (e) =>
      saveSettings("readabilityMode", e.target.checked)
    );
  }

  if (elements.semanticDecanter) {
    elements.semanticDecanter.addEventListener("change", (e) =>
      saveSettings("semanticDecanter", e.target.checked)
    );
  }

  if (elements.cursorSpotlight) {
    elements.cursorSpotlight.addEventListener("change", (e) =>
      saveSettings("cursorSpotlight", e.target.checked)
    );
  }

  if (elements.themeToggle) {
    elements.themeToggle.addEventListener("click", toggleTheme);
  }
}

// Init
// Removed duplicate/unnecessary init call (already handled above)
