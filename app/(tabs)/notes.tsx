import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import Markdown from "react-native-markdown-display";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import StarsBackground from "../../components/StarsBackground";

/* 🔹 CHAT MESSAGE TYPE */
type ChatMessage = {
  role: "user" | "bot";
  text: string;
};

/* ✅ BACKEND BASE URL (CHANGE THIS) */
const BASE_URL = "http://10.42.241.36:5000";

/* ✅ NOTES ENDPOINT */
const API_URL = `${BASE_URL}/api/ai/notes`;

export default function NotesScreen() {
  const [topic, setTopic] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const generateNotes = async () => {
    if (!topic.trim() || loading) return;

    const userText = topic.trim();

    const userMessage: ChatMessage = {
      role: "user",
      text: userText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setTopic("");

    try {
      setLoading(true);

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: userText }),
      });

      const rawText = await res.text();

      // ✅ If backend returns HTML / Not Found etc
      let data: any = null;
      try {
        data = JSON.parse(rawText);
      } catch (err) {
        throw new Error("Backend is not returning JSON. Check API URL.");
      }

      if (!res.ok) {
        throw new Error(data?.error || "Failed to generate notes");
      }

      const botMessage: ChatMessage = {
        role: "bot",
        text: data.notes || "⚠️ No notes generated",
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text:
            "⚠️ Notes generation failed.\n\n" +
            (err?.message || "Unknown error"),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#020617", "#030712", "#020617", "#312e81", "#1e1b4b"]}
      style={styles.container}
    >
      <StarsBackground />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>AI Notes</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* CHAT AREA */}
      <ScrollView
        contentContainerStyle={styles.chatArea}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg, index) => (
          <View
            key={index}
            style={[
              styles.messageBubble,
              msg.role === "user" ? styles.userBubble : styles.botBubble,
            ]}
          >
            {msg.role === "bot" ? (
              <Markdown style={markdownStyles}>{msg.text}</Markdown>
            ) : (
              <Text style={[styles.messageText, { color: "#020617" }]}>
                {msg.text}
              </Text>
            )}
          </View>
        ))}

        {loading && (
          <View style={[styles.messageBubble, styles.botBubble]}>
            <ActivityIndicator color="#a78bfa" />
          </View>
        )}
      </ScrollView>

      {/* INPUT BAR */}
      <View style={styles.inputBar}>
        <TextInput
          placeholder="Ask a topic..."
          placeholderTextColor="#9ca3af"
          value={topic}
          onChangeText={setTopic}
          style={styles.input}
        />

        <TouchableOpacity onPress={generateNotes} disabled={loading}>
          <Ionicons name="send" size={22} color="#a78bfa" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

/* 🔹 STYLES */
const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    height: 100,
    paddingTop: 40,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },

  chatArea: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },

  messageBubble: {
    maxWidth: "85%",
    padding: 14,
    borderRadius: 16,
    marginVertical: 6,
  },

  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#a78bfa",
  },

  botBubble: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.12)",
  },

  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },

  inputBar: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  input: {
    flex: 1,
    color: "white",
    fontSize: 15,
  },
});

/* 🔹 MARKDOWN STYLES */
const markdownStyles = {
  body: {
    color: "#e5e7eb",
    fontSize: 14,
    lineHeight: 22,
  },
  heading1: {
    color: "#a78bfa",
    fontSize: 22,
    marginVertical: 8,
  },
  heading2: {
    color: "#c4b5fd",
    fontSize: 18,
    marginVertical: 6,
  },
  heading3: {
    color: "#ddd6fe",
    fontSize: 16,
    marginVertical: 4,
  },
  bullet_list: {
    marginVertical: 6,
  },
  table: {
    borderWidth: 1,
    borderColor: "#334155",
  },
  th: {
    backgroundColor: "#1e293b",
    padding: 4,
  },
  td: {
    padding: 4,
  },
};
