// features/visualGuard.js
let preemptiveStyle = null;
let visualGuardObserver = null;

function injectPreemptiveCSS(intensity = 3) {
  const existingStyle = document.getElementById("cogni-preemptive-guard");
  if (existingStyle) existingStyle.remove();

  const intensityMap = {
    1: { anim: "0.5s", brightness: "1.0", contrast: "1.0", tint: "rgba(255, 200, 50, 0.03)" }, 
    2: { anim: "1s", brightness: "0.95", contrast: "0.95", tint: "rgba(255, 180, 0, 0.08)" },   
    3: { anim: "2s", brightness: "0.9", contrast: "0.9", tint: "rgba(255, 150, 0, 0.15)" },  
    4: { anim: "4s", brightness: "0.8", contrast: "0.8", tint: "rgba(180, 100, 0, 0.25)" }, 
    5: { anim: "8s", brightness: "0.7", contrast: "0.7", tint: "rgba(120, 60, 0, 0.35)" },   
  };

  const { anim, brightness, contrast, tint } = intensityMap[intensity] || intensityMap[3];
  preemptiveStyle = document.createElement("style");
  preemptiveStyle.id = "cogni-preemptive-guard";
  
  preemptiveStyle.textContent = `
    img[src$=".gif"], img[src*="giphy"], video, canvas { 
      animation-duration: ${anim} !important; 
    }
    img, video, iframe, canvas { 
      filter: brightness(${brightness}) contrast(${contrast}) !important; 
    }
    html::after {
      content: ""; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: ${tint}; pointer-events: none; z-index: 999999; mix-blend-mode: multiply; 
    }

    /* 🛡️ THE BUFFER GATE: Enforced invisibility until data-safe="true" */
    video.html5-main-video:not([data-safe="true"]) {
      opacity: 0 !important;
      visibility: hidden !important;
    }

    video.html5-main-video[data-safe="true"] {
      opacity: 1 !important;
      visibility: visible !important;
      transition: opacity 0.5s ease-in;
    }

    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .cogni-spinner {
      border: 4px solid rgba(255,255,255,0.1);
      border-top: 4px solid #ff4d4d;
      border-radius: 50%;
      width: 40px; height: 40px;
      animation: spin 1s linear infinite;
    }
  `;
  document.documentElement.appendChild(preemptiveStyle);
}

function applyYoutubeShield() {
  if (!window.location.href.includes("youtube.com")) return;
  
  const playerContainer = document.querySelector(".html5-video-player") || document.querySelector("#movie_player");
  const videoElement = document.querySelector("video");
  
  if (!playerContainer || !videoElement || videoElement.dataset.shielded === "true") return;

  // 🛑 PHASE 1: INSTANT UI
  // Show scanning overlay immediately so user knows why the screen is black
  showShieldOverlay(playerContainer, videoElement);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  let checksPerformed = 0;
  const bufferLimit = 6; // Checks 1.5 seconds (6 * 250ms)

  const analysisInterval = setInterval(() => {
    // Ensure video is "playing" in the background so we can capture frames
    if (videoElement.readyState < 2) return; 

    canvas.width = videoElement.videoWidth / 10;
    canvas.height = videoElement.videoHeight / 10;
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let totalLuminance = 0;
    for (let i = 0; i < imageData.length; i += 4) {
      totalLuminance += (0.2126 * imageData[i] + 0.7152 * imageData[i+1] + 0.0722 * imageData[i+2]);
    }

    const avgLuminance = totalLuminance / (imageData.length / 4);
    
    // 🛑 PHASE 2: HAZARD DETECTED
    if (avgLuminance > 130) {
      clearInterval(analysisInterval);
      videoElement.pause(); // Stop audio and playback
      updateShieldToHazard(videoElement);
      return;
    }

    checksPerformed++;

    // ✅ PHASE 3: BUFFER CLEAR
    if (checksPerformed >= bufferLimit) {
      clearInterval(analysisInterval);
      const overlay = document.getElementById("cogni-shield-warning");
      if (overlay) overlay.remove();
      
      // Reveal the video
      videoElement.setAttribute('data-safe', 'true');
      videoElement.dataset.shielded = "true";
      videoElement.play(); 
    }
  }, 250); // High-speed sampling
}

function showShieldOverlay(container, video) {
  if (document.getElementById("cogni-shield-warning")) return;

  const overlay = document.createElement("div");
  overlay.id = "cogni-shield-warning";
  Object.assign(overlay.style, {
    position: "absolute", top: "0", left: "0", width: "100%", height: "100%",
    background: "#000", zIndex: "9999", display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", color: "#fff", 
    fontFamily: "sans-serif", textAlign: "center"
  });

  overlay.innerHTML = `
    <div class="cogni-spinner"></div>
    <h3 id="cogni-title" style="margin-top: 20px; color: #ff4d4d; letter-spacing: 1px;">PRE-SCREENING CONTENT...</h3>
    <p id="cogni-body" style="margin: 10px 20px; font-size: 14px; color: #888;">Analyzing visual luminance buffer.</p>
    <button id="cogni-proceed-btn" style="
      display: none; margin-top: 15px; padding: 12px 28px; background: #ff4d4d; color: white; border: none; 
      border-radius: 5px; font-weight: bold; cursor: pointer;
    ">Proceed Anyway</button>
  `;

  container.appendChild(overlay);
}

function updateShieldToHazard(video) {
  const title = document.getElementById("cogni-title");
  const body = document.getElementById("cogni-body");
  const btn = document.getElementById("cogni-proceed-btn");

  if (title) title.innerText = "SENSORY HAZARD DETECTED";
  if (body) body.innerText = "High-glare visuals blocked to prevent triggers.";
  if (btn) {
    btn.style.display = "block";
    btn.onclick = (e) => {
      e.preventDefault();
      video.setAttribute('data-safe', 'true');
      video.dataset.shielded = "true";
      document.getElementById("cogni-shield-warning").remove();
      video.play();
    };
  }
}

function enforceSlowMotion(intensity = 3) {
  if (window.location.href.includes("youtube.com")) return;
  const speedMap = { 1: 0.85, 2: 0.75, 3: 0.6, 4: 0.4, 5: 0.2 };
  const targetSpeed = speedMap[intensity] || 0.6;
  document.querySelectorAll("video").forEach(v => {
    v.playbackRate = targetSpeed;
    v.onratechange = () => { 
      if (!window.location.href.includes("youtube.com") && v.playbackRate !== targetSpeed) {
        v.playbackRate = targetSpeed;
      }
    };
  });
}

window.applyVisualGuard = function(settings) {
  if (!settings || !settings.enabled) {
    const s = document.getElementById("cogni-preemptive-guard");
    if (s) s.remove();
    const w = document.getElementById("cogni-shield-warning");
    if (w) w.remove();
    document.querySelectorAll("video").forEach(v => {
      v.playbackRate = 1.0;
      v.removeAttribute('data-safe');
      delete v.dataset.shielded;
    });
    return;
  }
  injectPreemptiveCSS(settings.intensity);
  enforceSlowMotion(settings.intensity);
  applyYoutubeShield();
  if (!visualGuardObserver) {
    visualGuardObserver = new MutationObserver(() => {
      enforceSlowMotion(settings.intensity);
      applyYoutubeShield();
    });
    visualGuardObserver.observe(document.documentElement, { childList: true, subtree: true });
  }
};