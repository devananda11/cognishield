// features/semanticDecanter.js

const SemanticDecanter = (() => {
  console.log("[SemanticDecanter] Module loaded");

  // Listen for message from background.js
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === "COGNI_SHIELD_DECANT_SELECTION" && msg.text) {
      simplifyAndOverlay(msg.text);
    }
  });

  async function simplifyAndOverlay(selectedText) {
    if (!selectedText) return;

    // Show loader overlay first
    const loaderHtml = `
      <div style='display:flex;align-items:center;justify-content:center;height:48px;'>
        <span class='semantic-loader' style='width:24px;height:24px;border:4px solid #f7c873;border-top:4px solid #fffbe7;border-radius:50%;display:inline-block;animation:semantic-spin 1s linear infinite;'></span> 
        <span style='margin-left:12px; font-family:Lexend, sans-serif;'>Decanting...</span>
      </div>`;
    
    const overlay = overlaySimplifiedText(loaderHtml, true, true);

    if (!document.getElementById("semanticDecanterLoaderStyle")) {
      const style = document.createElement("style");
      style.id = "semanticDecanterLoaderStyle";
      style.textContent = `@keyframes semantic-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
      document.head.appendChild(style);
    }

    let result = null;
    try {
      const response = await fetch("http://localhost:3001/ai/simplify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: selectedText }),
      });
      const data = await response.json();
      result = data.result;
    } catch (err) {
      console.error("[SemanticDecanter] AI error", err);
      result = "Error: Could not reach the AI server. Make sure your backend is running at localhost:3001.";
    }

    // Process result into nice HTML
    if (result) {
      let html = result
        .replace(/\*\*(.*?)\*\*/g, '<div style="font-weight:bold;margin:10px 0 5px 0;">$1</div>')
        .replace(/(\d+)\.\s([^\n]+)/g, '<li><span style="font-weight:bold;color:#a88a2c;">$1.</span> $2</li>')
        .replace(/^[ \t]*[\*-] (.+)$/gm, "<li>$1</li>");

      overlay.querySelector(".semanticDecanter-content").innerHTML = html;
    }
  }

  function overlaySimplifiedText(html, isHtml = false, returnOverlay = false) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const rect = selection.getRangeAt(0).getBoundingClientRect();

    const overlay = document.createElement("div");
    overlay.className = "cogni-decanter-box";
    Object.assign(overlay.style, {
      position: "absolute",
      left: `${window.scrollX + rect.left}px`,
      top: `${window.scrollY + rect.bottom + 10}px`,
      minWidth: "250px",
      maxWidth: "400px",
      background: "#fffbe7",
      color: "#222",
      padding: "15px",
      border: "2px solid #f7c873",
      borderRadius: "10px",
      zIndex: "2147483647",
      boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
      fontFamily: 'Lexend, sans-serif'
    });

    // Close Button
    const closeBtn = document.createElement("span");
    closeBtn.innerHTML = "&times;";
    closeBtn.style = "position:absolute; top:5px; right:10px; cursor:pointer; font-weight:bold; color:#a88a2c; font-size:20px;";
    closeBtn.onclick = () => overlay.remove();
    overlay.appendChild(closeBtn);

    const contentDiv = document.createElement("div");
    contentDiv.className = "semanticDecanter-content";
    contentDiv.innerHTML = isHtml ? html : `<div>${html}</div>`;
    overlay.appendChild(contentDiv);

    document.body.appendChild(overlay);
    if (returnOverlay) return overlay;
  }

  return {
    enable: () => console.log("Decanter service active"),
    disable: () => {
       document.querySelectorAll(".cogni-decanter-box").forEach(el => el.remove());
    }
  };
})();

window.SemanticDecanter = SemanticDecanter;