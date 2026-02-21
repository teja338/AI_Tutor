 const express = require("express");
const router = express.Router();
const multer = require("multer");
const FormData = require("form-data");
const fs = require("fs");
const axios = require("axios");

const upload = multer({ dest: "uploads/" });

router.post("/speech-to-text", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file received" });
    }

    const formData = new FormData();
    formData.append("audio", fs.createReadStream(req.file.path));

    const whisperResponse = await axios.post(
      "http://127.0.0.1:7000/stt",
      formData,
      { headers: formData.getHeaders() }
    );

    fs.unlinkSync(req.file.path);

    res.json({ text: whisperResponse.data.text });

  } catch (error) {
    console.error("Whisper error:", error.response?.data || error.message);
    res.status(500).json({ error: "Speech recognition failed" });
  }
});

module.exports = router;
