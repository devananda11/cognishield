// Add context menu for 'Decant' on text selection
chrome.runtime.onInstalled?.addListener(() => {
  chrome.contextMenus.create({
    id: "cogniShieldDecant",
    title: "Decant (Simplify Text)",
    contexts: ["selection"],
  });
});

chrome.contextMenus?.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "cogniShieldDecant" && info.selectionText) {
    // Always send message to content script to decant
    chrome.tabs.sendMessage(tab.id, {
      type: "COGNI_SHIELD_DECANT_SELECTION",
      text: info.selectionText,
    });
  }
});

// Content script part: Listen for decant message and overlay simplified text
if (typeof window !== "undefined" && window === window.top) {
  console.log("[SemanticDecanter] Content script loaded");
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    console.log("[SemanticDecanter] Received message", msg);
    if (msg.type === "COGNI_SHIELD_DECANT_SELECTION" && msg.text) {
      simplifyAndOverlay(msg.text);
    }
  });

  async function simplifyAndOverlay(selectedText) {
    console.log(
      "[SemanticDecanter] simplifyAndOverlay called with:",
      selectedText
    );
    if (!selectedText || typeof selectedText !== "string") {
      console.warn("[SemanticDecanter] No valid selectedText");
      return;
    }
    // Show loader overlay first
    const loaderHtml = `<div style='display:flex;align-items:center;justify-content:center;height:48px;'><span class='semantic-loader' style='width:24px;height:24px;border:4px solid #f7c873;border-top:4px solid #fffbe7;border-radius:50%;display:inline-block;animation:semantic-spin 1s linear infinite;'></span> <span style='margin-left:12px;'>Simplifying...</span></div>`;
    const overlay = overlaySimplifiedText(loaderHtml, true, true);

    // Add loader animation CSS
    if (!document.getElementById("semanticDecanterLoaderStyle")) {
      const style = document.createElement("style");
      style.id = "semanticDecanterLoaderStyle";
      style.textContent = `@keyframes semantic-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
      document.head.appendChild(style);
    }

    // Check localStorage cache first
    let cacheKey =
      "cogniShieldSimplified_" +
      btoa(unescape(encodeURIComponent(selectedText))).slice(0, 64);
    let result = null;
    try {
      let cached = localStorage.getItem(cacheKey);
      if (cached) {
        console.log("[SemanticDecanter] Using cached result");
        result = cached;
      } else {
        console.log("[SemanticDecanter] Calling backend /ai/simplify");
        const response = await fetch("http://localhost:3001/ai/simplify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: selectedText }),
        });
        if (!response.ok) {
          throw new Error("Backend returned status " + response.status);
        }
        const data = await response.json();
        result = data.result;
        if (result) {
          localStorage.setItem(cacheKey, result);
        }
        console.log("[SemanticDecanter] Backend AI result:", result);
      }
    } catch (err) {
      result = null;
      console.warn("[SemanticDecanter] Backend AI error", err);
    }

    // Replace loader with result
    if (result) {
      // Structure the result for readability
      let html = result;
      // Section headings: bold and spaced (double asterisks)
      html = html.replace(
        /\*\*(.*?)\*\*/g,
        '<div style="font-weight:bold;font-size:1.08em;margin:12px 0 6px 0;">$1</div>'
      );
      // Italics: single asterisks (not inside bold)
      html = html.replace(
        /(^|[^*])\*([^*]+)\*([^*]|$)/g,
        '$1<span style="font-style:italic;">$2</span>$3'
      );
      // Numbered points: 1. ... 2. ...
      html = html.replace(
        /(\d+)\.\s([^\n]+)/g,
        '<li><span style="font-weight:bold;color:#a88a2c;">$1.</span> $2</li>'
      );
      // Unordered bullets: lines starting with * or -
      html = html.replace(/^[ \t]*[\*-] (.+)$/gm, "<li>$1</li>");
      // Group consecutive <li> into <ol> or <ul>
      // First, group numbered <li> into <ol>
      html = html.replace(
        /(<li><span style=\"font-weight:bold;color:#a88a2c;\">\d+\.<\/span>.*?<\/li>)+/gs,
        (match) => `<ol style="margin:0 0 0 1.2em;padding:0;">${match}</ol>`
      );
      // Then, group other <li> into <ul>
      html = html.replace(
        /(<li>(?!<span style=\"font-weight:bold;color:#a88a2c;\">\d+\.<\/span>).+?<\/li>)+/gs,
        (match) => `<ul style="margin:0 0 0 1.2em;padding:0;">${match}</ul>`
      );
      // Remove excessive <br>
      html = html.replace(/(<br>\s*){2,}/g, "<br>");
      overlay.querySelector(".semanticDecanter-content").innerHTML = html;
    } else {
      overlay.querySelector(
        ".semanticDecanter-content"
      ).innerHTML = `<div style='color:#b00;'>Failed to simplify text.</div>`;
    }
  }

  function overlaySimplifiedText(html, isHtml = false, returnOverlay = false) {
    console.log("[SemanticDecanter] overlaySimplifiedText called", {
      html,
      isHtml,
    });
    const selection = window.getSelection();
    if (!selection.rangeCount) {
      console.warn("[SemanticDecanter] No selection range");
      return;
    }
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    console.log("[SemanticDecanter] Overlay position", rect);
    const overlay = document.createElement("div");
    overlay.style.position = "absolute";
    overlay.style.left = `${window.scrollX + rect.left}px`;
    overlay.style.top = `${window.scrollY + rect.top}px`;
    overlay.style.width = `${rect.width}px`;
    overlay.style.minWidth = "120px";
    overlay.style.maxWidth = "100vw";
    overlay.style.background = "#fffbe7";
    overlay.style.color = "#222";
    overlay.style.padding = "10px 18px 10px 18px";
    overlay.style.border = "2px solid #f7c873";
    overlay.style.borderRadius = "10px";
    overlay.style.zIndex = 999999;
    overlay.style.fontSize = "1.1em";
    overlay.style.boxShadow = "0 2px 12px rgba(0,0,0,0.15)";
    overlay.style.cursor = "default";
    overlay.title = "Click the X to dismiss";
    overlay.style.fontFamily =
      'Lexend, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';
    // Inject Lexend font if not present
    if (!document.getElementById("semanticDecanterLexendFont")) {
      const link = document.createElement("link");
      link.id = "semanticDecanterLexendFont";
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Lexend:wght@100..900&display=swap";
      document.head.appendChild(link);
    }

    // Add close button
    const closeBtn = document.createElement("span");
    closeBtn.textContent = "×";
    closeBtn.style.position = "absolute";
    closeBtn.style.top = "6px";
    closeBtn.style.right = "12px";
    closeBtn.style.fontSize = "1.3em";
    closeBtn.style.fontWeight = "bold";
    closeBtn.style.color = "#a88a2c";
    closeBtn.style.cursor = "pointer";
    closeBtn.style.userSelect = "none";
    closeBtn.title = "Close";
    closeBtn.addEventListener("click", () => overlay.remove());
    overlay.appendChild(closeBtn);

    // Add content
    const contentDiv = document.createElement("div");
    contentDiv.className = "semanticDecanter-content";
    contentDiv.innerHTML = isHtml ? html : `<div>${html}</div>`;
    overlay.appendChild(contentDiv);

    document.body.appendChild(overlay);
    console.log("[SemanticDecanter] Overlay appended to body");
    if (returnOverlay) return overlay;
  }
}
