const express = require("express");
const router = express.Router();

const OLLAMA_URL = "http://127.0.0.1:11434/api/generate";

async function callOllama(prompt, maxTokens = 400) {
  const res = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3.2:3b",
      prompt,
      stream: false,
      options: {
        temperature: 0.7,
        num_predict: maxTokens,
      },
    }),
  });

  const data = await res.json();
  return data.response || "I couldn't understand. Please repeat.";
}

/* 🧠 Casual Conversation */
router.post("/talk", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message required" });
    }

    const prompt = `
You are a friendly AI robot talking to a student.
Talk casually like a friend but be helpful.

User: ${message}
Robot:
`;

    const reply = await callOllama(prompt);

    res.json({ reply });
  } catch (err) {
    console.error("Talk error:", err.message);
    res.status(500).json({ error: "Talk failed" });
  }
});

module.exports = router;
