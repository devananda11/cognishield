let lexendLoaded = false;

function loadLexendFont() {
  if (lexendLoaded) return;

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Lexend&display=swap";

  (document.head || document.documentElement).appendChild(link);
  lexendLoaded = true;
}


let readabilityStyle = null;

function applyReadabilityStyles() {
  if (readabilityStyle) return;

  readabilityStyle = document.createElement("style");
  readabilityStyle.id = "cs-readability-style";

  readabilityStyle.textContent = `
  body {
    font-family: "Lexend", system-ui, sans-serif !important;
    font-size: 1.05em !important;
    line-height: 1.7 !important;
    letter-spacing: 0.01em !important;
    background-color: #FAFAF7 !important;
    color: #1F2937 !important;

  }

  p, li {
    font-size: 1.02em !important;
    max-width: 68ch !important;
    margin-left: auto !important;
    margin-right: auto !important;
  }

  p {
    margin-top: 0.75rem !important;
    margin-bottom: 1.25rem !important;
  }

  li {
    line-height: 1.6 !important;
  }

  h1, h2, h3,span {
    font-family: "Lexend", system-ui, sans-serif !important;
    font-size: 1.02em !important;
    line-height: 1.5 !important;
    margin-top: 1.5rem !important;
    margin-bottom: 0.75rem !important;
  }
`;


  (document.head || document.documentElement).appendChild(readabilityStyle);
}

function removeReadabilityStyles() {
  if (!readabilityStyle) return;

  readabilityStyle.remove();
  readabilityStyle = null;
}

let modifiedParagraphs = [];

function splitLongParagraphs() {
  const paragraphs = document.querySelectorAll("p");

  paragraphs.forEach((p) => {
    // Skip if already processed
    if (p.dataset.csSplit) return;

    // Skip unsafe areas (code, inputs, editors)
    if (p.closest("pre, code, textarea, input")) return;

    const text = p.innerText.trim();

    // Only split long paragraphs
    if (text.length < 300) return;

    // Split into sentences
    const sentences = text.match(/[^.!?]+[.!?]+/g);
    if (!sentences || sentences.length < 3) return;

    // Create wrapper
    const wrapper = document.createElement("div");
    wrapper.dataset.csWrapper = "true";

    // Group 2 sentences per paragraph
    for (let i = 0; i < sentences.length; i += 2) {
      const newP = document.createElement("p");
      newP.innerText = sentences.slice(i, i + 2).join(" ");
      newP.dataset.csSplit = "true";
      wrapper.appendChild(newP);
    }

    // Save for undo
    modifiedParagraphs.push({
      original: p,
      replacement: wrapper,
    });

    // Replace original paragraph
    p.replaceWith(wrapper);
  });
}

function restoreParagraphs() {
  modifiedParagraphs.forEach(({ original, replacement }) => {
    replacement.replaceWith(original);
  });
  modifiedParagraphs = [];
}



// Public Readability API
window.CogniShield = window.CogniShield || {};

window.CogniShield.enableReadability = function () {
  applyReadabilityStyles();
  loadLexendFont();  
  splitLongParagraphs();
};

window.CogniShield.disableReadability = function () {
     restoreParagraphs();
    removeReadabilityStyles();
};
