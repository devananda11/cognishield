// features/spotlight.js
let spotlightOverlay = null;
let mouseMoveHandler = null;

function createOverlay() {
  const overlay = document.createElement("div");
  overlay.id = "cogni-spotlight-overlay";
  Object.assign(overlay.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100vw",
    height: "100vh",
    pointerEvents: "none",
    zIndex: "999999",
    background: "rgba(0, 0, 0, 0.8)", // Slightly darker for better contrast
    transition: "clip-path 0.05s ease-out"
  });

  document.body.appendChild(overlay);
  return overlay;
}

function updateSpotlight(x, y) {
  if (!spotlightOverlay) return; 
  
  const width = 160;  // Full width
  const height = 60;  // Half-height (creating a rectangle reading slot)
  
  const hWidth = width / 2;
  const hHeight = height / 2;

  // Create a rectangle "hole" using clip-path polygon
  spotlightOverlay.style.clipPath = `polygon(
    0% 0%, 0% 100%, 100% 100%, 100% 0%, 0% 0%,
    ${x - hWidth}px ${y - hHeight}px, 
    ${x + hWidth}px ${y - hHeight}px, 
    ${x + hWidth}px ${y + hHeight}px, 
    ${x - hWidth}px ${y + hHeight}px, 
    ${x - hWidth}px ${y - hHeight}px
  )`;
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

window.enableCursorSpotlight = enableCursorSpotlight;
window.disableCursorSpotlight = disableCursorSpotlight;