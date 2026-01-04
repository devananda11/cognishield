// focusMode.js
// Owner: Focus Mode (Person B)

const FocusMode = (() => {

  const HIDE_SELECTORS = [
    "[role='dialog']",
    ".modal",
    ".popup",
    ".cookie",
    ".consent",
    ".newsletter"
  ];

  // ⚠️ ONLY ad/promotional blocks (no layout containers)
  const DIM_SELECTORS = [
    ".ad",
    ".ads",
    ".advertisement",
    ".promo",
    ".promotion",
    ".sponsored",
    "[class^='ad-']",
    "[id^='ad-']"
  ];

  let styleNode = null;

  /* ---------- POPUPS ---------- */
  function hideElements() {
    HIDE_SELECTORS.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        el.dataset.focusHidden = "true";
        el.style.display = "none";
      });
    });
  }

  /* ---------- OVERLAY BACKDROPS ---------- */
  function removeOverlayBackdrops() {
    document.querySelectorAll("*").forEach(el => {
      const style = window.getComputedStyle(el);

      const isOverlay =
        (style.position === "fixed" || style.position === "absolute") &&
        Number(style.zIndex) > 1000 &&
        el.offsetWidth >= window.innerWidth * 0.9 &&
        el.offsetHeight >= window.innerHeight * 0.9 &&
        el.innerText.length < 500; // 🔒 protect content blocks

      if (isOverlay) {
        el.dataset.focusOverlay = "true";
        el.style.display = "none";
      }
    });

    // restore scroll
    document.body.style.overflow = "auto";
    document.documentElement.style.overflow = "auto";
  }

  /* ---------- ADS ONLY ---------- */
  function dimAdsOnly() {
    DIM_SELECTORS.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        // ❌ NEVER dim main content
        if (el.closest("main, article")) return;

        el.dataset.focusDimmed = "true";
        el.style.opacity = "0.25";
        el.style.pointerEvents = "none";
      });
    });
  }

  /* ---------- MOTION ---------- */
  function stopAnimations() {
    if (styleNode) return;

    styleNode = document.createElement("style");
    styleNode.textContent = `
      * {
        animation: none !important;
        transition: none !important;
      }
    `;
    document.head.appendChild(styleNode);
  }

  function pauseVideos() {
    document.querySelectorAll("video").forEach(v => v.pause());
  }

  /* ---------- RESTORE ---------- */
  function restoreAll() {
    document.querySelectorAll(
      "[data-focus-hidden], [data-focus-dimmed], [data-focus-overlay]"
    ).forEach(el => {
      el.style.display = "";
      el.style.opacity = "";
      el.style.pointerEvents = "";
      delete el.dataset.focusHidden;
      delete el.dataset.focusDimmed;
      delete el.dataset.focusOverlay;
    });

    if (styleNode) styleNode.remove();
    styleNode = null;
  }

  return {
    enable() {
      hideElements();
      removeOverlayBackdrops(); // 🔥 MUST RUN FIRST
      dimAdsOnly();
      stopAnimations();
      pauseVideos();
    },
    disable() {
      restoreAll();
    }
  };

})();

window.FocusMode = FocusMode;
