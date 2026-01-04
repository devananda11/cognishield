const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const GEMINI_API_KEY = "AIzaSyA1l_X-bfJAPJmVashcSUNOacocuWXsDlQ"; // Replace with your real key

window.simplifyTextWithAI = async function (text) {
  if (!text || text.length > 1000) return null;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          { parts: [{ text: `Rewrite this in simpler language:\n${text}` }] },
        ],
      }),
    });

    if (!response.ok) {
      console.warn("Gemini API failed:", response.status);
      return null;
    }

    const data = await response.json();
    // Gemini's response structure:
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (err) {
    console.warn("AI error:", err);
    return null;
  }
};
