require("dotenv").config();
const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/ai/simplify", async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "No text provided" });

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Rewrite the following text as a single, well-structured, clear answer. Do not provide options or alternatives. Use simple language, short sentences, and break down complex ideas. Present the information in a logical, easy-to-read format, suitable for people with ADHD and cognitive disabilities.\n\nText:\n${text}`,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      return res
        .status(500)
        .json({ error: "Gemini API failed", status: response.status });
    }
    const data = await response.json();
    res.json({
      result: data?.candidates?.[0]?.content?.parts?.[0]?.text || null,
    });
  } catch (err) {
    res.status(500).json({ error: "AI error", details: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`AI backend running on port ${PORT}`));
