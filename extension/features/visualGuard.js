// features/visualGuard.js
let preemptiveStyle = null;
let visualGuardObserver = null;

function injectPreemptiveCSS(intensity = 3) {
  const existingStyle = document.getElementById("cogni-preemptive-guard");
  if (existingStyle) existingStyle.remove();

  // Mapping Intensity (1-5) to slow durations and brightness
  const intensityMap = {
    1: { anim: "1s", brightness: "0.9" },
    2: { anim: "2s", brightness: "0.8" },
    3: { anim: "5s", brightness: "0.7" },
    4: { anim: "10s", brightness: "0.6" },
    5: { anim: "20s", brightness: "0.5" },
  };

  const { anim, brightness } = intensityMap[intensity] || intensityMap[3];
  preemptiveStyle = document.createElement("style");
  preemptiveStyle.id = "cogni-preemptive-guard";
  preemptiveStyle.textContent = `
    /* Slow down all CSS animations/transitions */
    *, *::before, *::after { 
      animation-duration: ${anim} !important; 
      transition-duration: ${anim} !important; 
    }
    /* Dim visual media */
    img, video, iframe, canvas { 
      filter: brightness(${brightness}) !important; 
    }
  `;
  document.documentElement.appendChild(preemptiveStyle);
}

function enforceSlowMotion(intensity = 3) {
  // Speed mapping: 1 is slightly slow (0.8x), 5 is super slow (0.05x)
  const speedMap = { 1: 0.8, 2: 0.6, 3: 0.4, 4: 0.2, 5: 0.05 };
  const targetSpeed = speedMap[intensity] || 0.4;

  const videos = document.querySelectorAll("video");
  videos.forEach(v => {
    try {
      v.playbackRate = targetSpeed;
      v.autoplay = false; 
      // Lock the speed so the website can't change it back
      v.onratechange = () => {
        if (v.playbackRate !== targetSpeed) v.playbackRate = targetSpeed;
      };
    } catch (e) {}
  });
}

window.applyVisualGuard = function(settings) {
  // Cleanup if disabled
  if (!settings || settings.enabled === false) {
    const s = document.getElementById("cogni-preemptive-guard");
    if (s) s.remove();
    if (visualGuardObserver) visualGuardObserver.disconnect();
    visualGuardObserver = null;
    document.querySelectorAll("video").forEach(v => v.playbackRate = 1.0);
    return;
  }

  injectPreemptiveCSS(settings.intensity);
  enforceSlowMotion(settings.intensity);

  // Watch for new videos added dynamically
  if (!visualGuardObserver) {
    visualGuardObserver = new MutationObserver(() => enforceSlowMotion(settings.intensity));
    visualGuardObserver.observe(document.documentElement, { childList: true, subtree: true });
  }
};