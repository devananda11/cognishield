// observer.js
let pageMutationObserver = null; // RENAMED to stop clash

function initPageObserver() {
  if (pageMutationObserver) return;
  
  pageMutationObserver = new MutationObserver((mutations) => {
    // Your specific observation logic for Cogni-Shield
    console.log("Page change detected by Cogni-Shield");
  });

  pageMutationObserver.observe(document.body, { childList: true, subtree: true });
}

window.initPageObserver = initPageObserver;