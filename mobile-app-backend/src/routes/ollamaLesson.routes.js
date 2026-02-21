 const express = require("express");
const router = express.Router();

const OLLAMA_URL = "http://127.0.0.1:11434/api/generate";

/* ---------------- CALL OLLAMA ---------------- */

async function callOllama(prompt, maxTokens = 600) {
  const res = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3.2:3b",
      prompt,
      stream: false,
      options: {
        num_predict: maxTokens,
        temperature: 0.5,
      },
    }),
  });

  const data = await res.json();
  return data.response || "";
}

/* ---------------- VERSION ---------------- */

router.get("/version", (req, res) => {
  res.json({ message: "✅ Ollama Lesson API running" });
});

/* ---------------- MAIN LESSON API ---------------- */

router.post("/lesson", async (req, res) => {
  try {
    const { mode, topic, step, question, currentStep } = req.body;

    if (!mode || !topic) {
      return res.status(400).json({ error: "mode and topic required" });
    }

    /* ----------- START LESSON ----------- */
    if (mode === "start") {
      const prompt = `
Return ONLY a valid JSON array of exactly 5 teaching step titles for:
"${topic}"

Rules:
- Only JSON array
- Exactly 5 items
- No explanation
Example:
["Introduction","Core Concepts","Working","Examples","Summary"]
`;

      const text = await callOllama(prompt, 250);

      const cleaned = (text || "")
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      try {
        const match = cleaned.match(/\[.*\]/s);
        const jsonText = match ? match[0] : cleaned;
        const stepList = JSON.parse(jsonText);

        return res.json({ steps: stepList.slice(0, 5) });
      } catch {
        return res.json({
          steps: [
            `Introduction to ${topic}`,
            `Core Concepts of ${topic}`,
            `Working of ${topic}`,
            `Examples of ${topic}`,
            `Summary of ${topic}`,
          ],
          fallback: true,
        });
      }
    }

    /* ----------- TEACH STEP ----------- */
    if (mode === "teach") {
      if (!step) {
        return res.status(400).json({ error: "step required" });
      }

      const prompt = `
You are a friendly professor teaching the topic: "${topic}"

Explain ONLY this specific part:
"${step}"

Rules:
- Stay strictly inside this topic
- Do not talk about previous lessons
- Simple English
- 8 to 12 lines
- Give 1 example
- End with: "Do you have any doubts?"
`;

      const reply = await callOllama(prompt, 700);
      return res.json({ reply });
    }

    /* ----------- DOUBT MODE ----------- */
    if (mode === "doubt") {
      if (!question || !currentStep) {
        return res.status(400).json({ error: "question and currentStep required" });
      }

      const prompt = `
You are a patient AI teacher.

Topic: "${topic}"
Current part: "${currentStep}"
Student doubt: "${question}"

Rules:
- Answer only the doubt
- Simple explanation
- Do not restart the lesson
- End with: "Shall we continue?"
`;

      const reply = await callOllama(prompt, 650);
      return res.json({ reply });
    }

    return res.status(400).json({ error: "Invalid mode" });

  } catch (err) {
    console.error("Ollama Lesson Error:", err.message);
    return res.status(500).json({ error: "Ollama lesson failed" });
  }
});

module.exports = router;
