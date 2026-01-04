// observer.js
const callbacks = [];

// Features register themselves here
window.registerFeature = function (fn) {
  if (typeof fn === "function") {
    callbacks.push(fn);
  }
};

// One shared MutationObserver
const observer = new MutationObserver(() => {
  callbacks.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.warn("Cogni-Shield feature failed:", e);
    }
  });
});

// Start observing once DOM is ready
if (document.body) {
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}
