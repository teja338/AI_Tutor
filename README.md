 # 🤖 Smart V1 – Virtual AI Teaching Robot

Smart V1 is a Full-Stack AI Teaching Mobile Application built using **React Native (Expo)** and **Node.js + Express**, powered by a **local Large Language Model (Ollama)**.

It provides structured AI-generated notes, interactive teaching sessions, and conversational learning — all running offline using a local LLM.

---

## 🚀 Features

### 🔐 Authentication
- User Signup & Login
- JWT-based Authentication
- Persistent login using AsyncStorage

### 📝 AI Notes Generation
- Structured academic notes
- Markdown formatted output
- Optimized prompt engineering

### 🎓 AI Teaching Mode
- Step-by-step explanation
- Student-friendly structured content

### 💬 Conversational Mode
- AI-based discussion system
- Context-driven responses

### 🎙 Voice Features
- Speech-to-Text (Voice Input)
- Text-to-Speech (Voice Output)

### 🧠 AI Engine
- Local LLM via Ollama
- Offline inference
- No external API cost

---

## 🛠 Tech Stack

### 📱 Frontend
- React Native (Expo)
- Expo Router
- Context API
- AsyncStorage
- Markdown Renderer

### 🖥 Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- Ollama (Local LLM)
- node-fetch

---

## 📂 Project Structure
smart-v1/
│
├── mobile-app-frontend/
│ ├── app/
│ ├── context/
│ ├── components/
│
├── mobile-app-backend/
│ ├── src/
│ │ ├── routes/
│ │ ├── models/
│ │ ├── config/
│ │ └── server.js

---

# ⚙️ Setup Instructions

---

## 🖥 Backend Setup

### 1️⃣ Install Dependencies

```bash
cd mobile-app-backend
npm install
```
2️⃣ Install Ollama

Download from:

https://ollama.com

3️⃣ Pull AI Model

Recommended (Faster):

ollama pull phi3:mini

Alternative:

ollama pull llama3.2:3b
4️⃣ Start Backend Server
npm start

Backend runs at:

http://localhost:5000
📱 Frontend Setup
1️⃣ Install Dependencies
cd mobile-app-frontend
npm install
2️⃣ Update Backend URL

Inside:

notes.tsx

lessons.tsx

talk.tsx

Update:

const BASE_URL = "http://<your-ip-address>:5000";

Use your system IPv4 address (run ipconfig).

3️⃣ Start Frontend
npx expo start

Run on:

Android Emulator

Physical Device (Expo Go)

iOS Simulator

📡 API Endpoints
Authentication
POST /api/auth/signup
POST /api/auth/login
Notes Generation
POST /api/ai/notes

Request Body:

{
  "topic": "Photosynthesis"
}
🧠 System Architecture

User → Mobile App → Backend → Ollama (Local LLM) → Structured Response → Mobile Rendering

User enters topic

Backend builds structured prompt

Ollama generates formatted output

Response returned as Markdown

Frontend renders clean academic notes

🔒 Security

Password hashing

JWT authentication

Protected routes

No external AI API exposure

🎯 Optimization Highlights

Reduced token generation for faster response

Structured prompt engineering

Separated Notes & Talk modes

Local inference for privacy

🏆 Why This Project Is Unique

Fully Offline AI Integration

Mobile + Backend + LLM Integration

Structured Academic AI Output

Voice Enabled Teaching Assistant

Designed specifically for educational use
