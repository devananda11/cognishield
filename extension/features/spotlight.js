// features/spotlight.js

let spotlightOverlay = null;
let mouseMoveHandler = null;

function createOverlay() {
  const overlay = document.createElement("div");
  overlay.id = "cogni-spotlight-overlay"; // Added ID for easier tracking
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100vw";
  overlay.style.height = "100vh";
  overlay.style.pointerEvents = "none"; 
  overlay.style.zIndex = "999999";
  overlay.style.transition = "background 0.1s ease";

  document.body.appendChild(overlay);
  return overlay;
}

function updateSpotlight(x, y) {
  if (!spotlightOverlay) return; 
  const radius = 120; 
  spotlightOverlay.style.background = `
    radial-gradient(
      circle ${radius}px at ${x}px ${y}px,
      transparent 0%,
      rgba(0, 0, 0, 0.6) 80%
    )
  `;
}

function enableCursorSpotlight() {
  if (spotlightOverlay) return; 
  spotlightOverlay = createOverlay();
  
  mouseMoveHandler = (event) => {
    updateSpotlight(event.clientX, event.clientY);
  };
  document.addEventListener("mousemove", mouseMoveHandler);
}

function disableCursorSpotlight() {
  if (!spotlightOverlay) return;
  document.removeEventListener("mousemove", mouseMoveHandler);
  spotlightOverlay.remove();
  spotlightOverlay = null;
  mouseMoveHandler = null;
}

// ✅ FIX: Added a check for 'elements' to prevent crash if UI isn't loaded
function initListeners() {
  // If 'elements' is defined (usually in your popup/options script)
  if (typeof elements !== 'undefined') {
    elements.semanticDecanter?.addEventListener("change", (e) =>
      saveSettings("semanticDecanter", e.target.checked)
    );

    elements.cursorSpotlight?.addEventListener("change", (e) =>
      saveSettings("cursorSpotlight", e.target.checked)
    );

    elements.intensitySlider?.addEventListener("input", (e) => {
      const value = parseInt(e.target.value);
      if (elements.intensityValue && typeof INTENSITY_LABELS !== 'undefined') {
          elements.intensityValue.textContent = INTENSITY_LABELS[value];
      }
    });

    elements.intensitySlider?.addEventListener("change", (e) =>
      saveSettings("intensity", parseInt(e.target.value))
    );

    elements.themeToggle?.addEventListener("click", toggleTheme);
  }
}

// Ensure the DOM is fully ready before attaching listeners
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initListeners);
} else {
  initListeners();
}

// ✅ EXPOSE GLOBALLY: This replaces the 'export' keywords
window.enableCursorSpotlight = enableCursorSpotlight;
window.disableCursorSpotlight = disableCursorSpotlight;

console.log("CURSOR SPOTLIGHT SCRIPT LOADED");