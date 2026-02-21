 const express = require("express");
const router = express.Router();

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

 
const OLLAMA_URL = "http://127.0.0.1:11434/api/generate";
const MODEL = "llama3.2:3b";

 
async function callOllama(prompt, maxTokens = 500, temperature = 0.3) {
  const response = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      prompt,
      stream: false,
      options: {
        temperature,
        num_predict: maxTokens,
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text);
  }

  const data = await response.json();
  return data.response || "";
}
 
router.post("/notes", async (req, res) => {
  try {
    const { topic } = req.body;

    if (!topic || !topic.trim()) {
      return res.status(400).json({ error: "Topic required" });
    }

    const cleanTopic = topic.trim();

    
    const isSimpleMath = /^[0-9+\-*/().\s=]+$/.test(cleanTopic);

    if (isSimpleMath) {
      const mathPrompt = `
Solve and return ONLY the final numeric answer.
Expression: ${cleanTopic}
`;
      const answer = await callOllama(mathPrompt, 50, 0);
      const match = answer.match(/-?\d+(\.\d+)?/);
      return res.json({ notes: match ? match[0] : "Invalid expression" });
    }

    const notesPrompt = `
You are an experienced college professor.

Task:
Explain the topic below in a CLEAR, DETAILED, and WELL-STRUCTURED way.

Topic: "${cleanTopic}"

Guidelines:
- Explain the concept fully so a student can understand without external reference
- Use simple, student-friendly language
- Avoid history, origin, or unnecessary background
- Do NOT over-shorten or over-expand
- Each idea must be COMPLETE (no cut sentences)
- Length should be medium: not short notes, not textbook

Format strictly as:

# Notes

## Explanation
Write 2–3 short paragraphs explaining the concept clearly.
Each paragraph must be complete and meaningful.

## Key Points
- 4 to 6 important points only
- Each point should be clear and exam-relevant

## Example (if applicable)
Give one simple example ONLY if it improves understanding.

## Summary
Write 2 clear lines summarizing the topic.

Important:
- Do not add extra sections
- Do not use tables
- Do not repeat points
`;


    const notes = await callOllama(notesPrompt, 600, 0.35);

    return res.json({ notes: notes.trim() });
  } catch (err) {
    console.error("❌ Ollama error:", err.message);
    return res.status(500).json({
      error: "Notes generation failed",
      details: err.message,
    });
  }
});

module.exports = router;
