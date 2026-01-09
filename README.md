🛡️ Cogni-Shield

Cogni-Shield is a browser extension that reduces sensory overload caused by visually aggressive websites. It acts as a preventative accessibility layer, adapting web pages in real time to make browsing calmer, safer, and more accessible—especially for neurodivergent and sensory-sensitive users.

🚩 Problem

Modern websites rely heavily on:

fast animations and carousels

autoplay videos

flashing banners and high-contrast layouts

dense, cluttered interfaces

While effective for engagement, these design patterns can cause:

sensory overload

eye strain and fatigue

difficulty focusing or reading

anxiety or discomfort

Existing solutions are mostly reactive or global (OS-level settings), offering limited, blunt control.

💡 Solution

Cogni-Shield introduces preventative, user-controlled accessibility by regulating visual intensity before overload occurs.

Instead of blocking content, it adapts it—preserving functionality while reducing harm.

✨ Core Features
🛡️ Visual Guard (Non-AI Core)

Pre-emptively slows or freezes fast CSS animations

Pauses autoplay videos before playback

Normalizes extreme brightness and contrast

Applies protections at document start (before the page renders)

Continuously enforces changes on dynamically loaded content

🎛️ User Control Panel

Master ON/OFF toggle

Adjustable intensity levels (Low → High)

Feature-level control (nothing is forced)

🧠 Optional AI Assistance

Semantic Decanter: simplifies dense or complex text into plain language

AI runs only when manually triggered

Designed to reduce cognitive load without altering meaning

🧩 How It Works (High Level)

Runs as a Chrome extension using content scripts

Injects rendering constraints at page load to cap motion and brightness

Uses DOM observation to handle infinite scroll and injected content

Keeps AI features fully opt-in and user-controlled

🔐 Why It’s Different

Preventative, not reactive – stops overload before it happens

Local and fast – no heavy processing for core features

User-first – full control, reversible at any time

Accessibility-focused – adapts the web to human limits

🛠️ Tech Stack

Chrome Extension (Manifest V3)

JavaScript (content scripts, DOM manipulation)

CSS injection for real-time visual control

Chrome Storage API for settings

Optional AI via external APIs (manual trigger only)

🚀 Getting Started

Clone the repository

Open Chrome → chrome://extensions

Enable Developer Mode

Click Load unpacked and select the extension folder

Open any website and toggle Cogni-Shield from the popup

⚠️ Disclaimer

Cogni-Shield is an accessibility and usability tool.
It is not a medical device and does not provide clinical diagnosis or treatment.

📌 Future Scope

Smarter distraction detection

Per-site intensity profiles

Enhanced readability customization

Broader browser support

🤝 Contributors

Built as a hackathon project by a team focused on accessibility-first design and inclusive technology.
