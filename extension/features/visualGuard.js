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
    /* 🛡️ THE INSTANT LOCK: Force everything to zero visibility immediately */
    video.html5-main-video {
      opacity: 0 !important;
      visibility: hidden !important;
    }

    /* ONLY reveal when specifically marked as safe */
    video.html5-main-video[data-safe="true"] {
      opacity: 1 !important;
      visibility: visible !important;
      transition: opacity 0.4s ease-in;
    }

    img[src$=".gif"], img[src*="giphy"], video, canvas { animation-duration: ${anim} !important; }
    img, video, iframe, canvas { filter: brightness(${brightness}) contrast(${contrast}) !important; }
    
    html::after {
      content: ""; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: ${tint}; pointer-events: none; z-index: 999999; mix-blend-mode: multiply; 
    }

    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .cogni-spinner {
      border: 4px solid rgba(255,255,255,0.05); border-top: 4px solid #4a6fa5;
      border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite;
    }
  `;
  // Using prepend to ensure this is the first style block in the head
  document.documentElement.prepend(preemptiveStyle);
}

function applyYoutubeShield() {
  if (!window.location.href.includes("youtube.com")) return;
  const playerContainer = document.querySelector(".html5-video-player") || document.querySelector("#movie_player");
  const videoElement = document.querySelector("video");
  
  if (!playerContainer || !videoElement || videoElement.dataset.shielded === "true") return;

  showShieldOverlay(playerContainer, videoElement);
  
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  let checksPerformed = 0;
  const bufferLimit = 6; 

  // BACKGROUND SCANNING
  videoElement.muted = true;
  videoElement.play().catch(() => {});

  const analysisInterval = setInterval(() => {
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
    
    if (avgLuminance > 130) {
      clearInterval(analysisInterval);
      videoElement.pause(); 
      updateShieldToHazard(videoElement);
      return;
    }

    checksPerformed++;
    if (checksPerformed >= bufferLimit) {
      clearInterval(analysisInterval);
      document.getElementById("cogni-shield-warning")?.remove();
      
      // THIS TRIGGER REVEALS THE VIDEO
      videoElement.setAttribute('data-safe', 'true');
      videoElement.dataset.shielded = "true";
      videoElement.muted = false;
      videoElement.play(); 
    }
  }, 200); // Slightly faster sampling to reduce the "wait" time
}

function showShieldOverlay(container, video) {
  if (document.getElementById("cogni-shield-warning")) return;
  const overlay = document.createElement("div");
  overlay.id = "cogni-shield-warning";
  Object.assign(overlay.style, {
    position: "absolute", top: "0", left: "0", width: "100%", height: "100%",
    background: "#0d1117", zIndex: "9999", display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", color: "#58a6ff", textAlign: "center"
  });
  overlay.innerHTML = `
    <div class="cogni-spinner"></div>
    <h3 id="cogni-title" style="margin-top: 20px; color: #4a6fa5; font-weight: normal;">CALIBRATING...</h3>
    <p id="cogni-body" style="margin: 10px 20px; font-size: 14px; color: #506680;">Checking for sensory hazards.</p>
    <button id="cogni-proceed-btn" style="display: none; margin-top: 15px; padding: 12px 28px; background: #161b22; color: #58a6ff; border: 1px solid #30363d; border-radius: 5px; cursor: pointer;">Proceed Anyway</button>
  `;
  container.appendChild(overlay);
}

function updateShieldToHazard(video) {
  const title = document.getElementById("cogni-title");
  const body = document.getElementById("cogni-body");
  const btn = document.getElementById("cogni-proceed-btn");
  const spinner = document.querySelector(".cogni-spinner");
  if (spinner) spinner.style.display = "none";
  if (title) { title.innerText = "SENSORY HAZARD"; title.style.color = "#79c0ff"; }
  if (body) body.innerText = "High-luminance detected. Blocked for safety.";
  if (btn) {
    btn.style.display = "block";
    btn.onclick = (e) => {
      e.preventDefault();
      video.setAttribute('data-safe', 'true');
      video.dataset.shielded = "true";
      video.muted = false;
      document.getElementById("cogni-shield-warning").remove();
      video.play();
    };
  }
}

function enforceSlowMotion(intensity = 3) {
  if (window.location.href.includes("youtube.com")) return;
  const targetSpeed = { 1: 0.85, 2: 0.75, 3: 0.6, 4: 0.4, 5: 0.2 }[intensity] || 0.6;
  document.querySelectorAll("video").forEach(v => {
    v.playbackRate = targetSpeed;
  });
}

window.applyVisualGuard = function(settings) {
  if (!settings || !settings.enabled) {
    document.getElementById("cogni-preemptive-guard")?.remove();
    document.getElementById("cogni-shield-warning")?.remove();
    document.querySelectorAll("video").forEach(v => { v.removeAttribute('data-safe'); delete v.dataset.shielded; });
    return;
  }
  injectPreemptiveCSS(settings.intensity);
  enforceSlowMotion(settings.intensity);
  applyYoutubeShield();
  if (!visualGuardObserver) {
    visualGuardObserver = new MutationObserver(() => { applyYoutubeShield(); });
    visualGuardObserver.observe(document.documentElement, { childList: true, subtree: true });
  }
};