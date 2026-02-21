const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const aiRoutes = require("./routes/ai.routes"); 
const ollamaLessonRoutes = require("./routes/ollamaLesson.routes"); 
const speechRoutes = require("./routes/speech.routes");
const chatRoutes = require("./routes/chat.routes");
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes); 
app.use("/api/ollama", ollamaLessonRoutes);
app.use("/api/speech", speechRoutes);
app.use("/api/chat", chatRoutes);

app.get("/", (req, res) => {
  res.json({ message: "backend server is running" });
});

module.exports = app;
