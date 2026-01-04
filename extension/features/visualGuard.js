window.applyVisualGuard = function (settings) {
  if (!settings.enabled) return;

  const videos = document.querySelectorAll("video");

  videos.forEach((video) => {
    if (!video.paused) {
      video.pause();
    }
  });
};

// Register with observer so it reapplies on DOM changes
window.registerFeature?.(() => {
  chrome.storage.local.get({ enabled: true }, (settings) => {
    window.applyVisualGuard(settings);
  });
});
