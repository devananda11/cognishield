// features/focusMode.js
const FocusMode = (() => {
  // Selectors for elements that cause sensory overload or distraction
  const HIDE_SELECTORS = [
    "[role='dialog']", ".modal", ".popup", ".cookie", ".consent", ".newsletter",
    "header", "footer", "aside", "#sidebar", ".sidebar", "#secondary", 
    "#related", "#comments", "ytd-live-chat-frame", "ytd-guide-renderer",
    "nav", ".ads", ".sidebar-container"
  ];

  let styleNode = null;

  /**
   * injectFocusStyles: Creates the 'Tunnel Vision' layout.
   * It centers the content and masks the peripheral area with black.
   */
  function injectFocusStyles() {
    if (document.getElementById("focus-tunnel-style")) return;
    styleNode = document.createElement("style");
    styleNode.id = "focus-tunnel-style";
    styleNode.textContent = `
      /* 1. Force the background behind the tunnel to be black */
      html, body {
        background-color: #000000 !important;
        background-image: none !important;
        overflow-x: hidden !important;
      }

      /* 2. Hide all distracting UI elements */
      ${HIDE_SELECTORS.join(", ")} {
        display: none !important;
      }

      /* 3. The TUNNEL: Isolate and center the primary content area */
      main, article, #content, .main-content, #center-col, #primary, .article-body {
        margin-left: auto !important;
        margin-right: auto !important;
        float: none !important;
        width: 100% !important;
        max-width: 800px !important; /* Ideal width for reading focus */
        padding: 60px !important;
        background: #ffffff !important; /* White 'paper' content */
        color: #1a1a1a !important;      /* Sharp text contrast */
        position: relative !important;
        z-index: 1000 !important;
        
        /* 🛡️ This massive shadow blacks out everything to the left and right */
        box-shadow: 0 0 0 5000px #000000 !important; 
        border-radius: 4px !important;
      }

      /* 4. Ensure images and videos fit inside the tunnel */
      main img, article img, video {
        max-width: 100% !important;
        height: auto !important;
      }

      /* 5. Disable all animations/transitions */
      * {
        animation: none !important;
        transition: none !important;
      }

      /* 6. Fix scrolling in case a popup disabled it */
      html {
        overflow-y: scroll !important;
      }
    `;
    document.head.appendChild(styleNode);
  }

  return {
    enable() {
      console.log("Focus Mode: Tunnel Vision Enabled.");
      injectFocusStyles();
      
      // Secondary pass to hide any fixed/sticky elements that float over the tunnel
      document.querySelectorAll("*").forEach(el => {
        const s = window.getComputedStyle(el);
        // Hide fixed elements (like sticky headers) unless they are inside our content tunnel
        if (s.position === "fixed" && !el.closest("main, article, #content, #primary")) {
           el.style.setProperty("display", "none", "important");
        }
      });
    },
    disable() {
      console.log("Focus Mode: Restoring original layout.");
      const node = document.getElementById("focus-tunnel-style");
      if (node) node.remove();
      styleNode = null;
      
      // Force a layout refresh
      window.dispatchEvent(new Event('resize'));
    }
  };
})();

// Expose the module to the global window object for main.js to call
window.FocusMode = FocusMode;