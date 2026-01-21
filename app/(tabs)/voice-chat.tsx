import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Voice from "react-native-voice";
import * as Speech from "expo-speech";

import RobotAvatar from "../../components/Robotavatar";

export default function VoiceChatScreen() {
  const [isListening, setIsListening] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [userText, setUserText] = useState("");
  const [robotReply, setRobotReply] = useState("");

  // ✅ Start Listening
  const startListening = async () => {
    try {
      setUserText("");
      setRobotReply("");
      setIsListening(true);
      await Voice.start("en-US");
    } catch (e) {
      console.log("Voice start error:", e);
      setIsListening(false);
    }
  };

  // ✅ Stop Listening
  const stopListening = async () => {
    try {
      await Voice.stop();
      setIsListening(false);
    } catch (e) {
      console.log("Voice stop error:", e);
    }
  };

  // ✅ Robot Speak
  const robotSpeak = (text: string) => {
    Speech.stop();
    Speech.speak(text, {
      language: "en",
      rate: 0.9,
      pitch: 1,
      onStart: () => setIsTalking(true),
      onDone: () => setIsTalking(false),
      onStopped: () => setIsTalking(false),
      onError: () => setIsTalking(false),
    });
  };

  // ✅ Voice Events
  useEffect(() => {
    Voice.onSpeechResults = (event) => {
      const text = event.value?.[0] || "";
      setUserText(text);
      setIsListening(false);

      // ✅ For now test reply directly
      const reply = `You said: ${text}`;
      setRobotReply(reply);
      robotSpeak(reply);
    };

    Voice.onSpeechError = (event) => {
      console.log("Speech error:", event.error);
      setIsListening(false);
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  return (
    <View style={styles.container}>
      <RobotAvatar width={260} height={260} isTalking={isTalking} />

      <Text style={styles.heading}>🎤 Talk to your Robot</Text>

      <Text style={styles.label}>You said:</Text>
      <Text style={styles.textBox}>{userText || "..."}</Text>

      <Text style={styles.label}>Robot reply:</Text>
      <Text style={styles.textBox}>{robotReply || "..."}</Text>

      <TouchableOpacity
        style={[styles.btn, isListening && styles.btnStop]}
        onPress={isListening ? stopListening : startListening}
        activeOpacity={0.85}
      >
        <Text style={styles.btnText}>
          {isListening ? "Stop Listening ❌" : "Start Listening 🎙️"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    gap: 10,
  },
  heading: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 10,
  },
  label: {
    color: "#cbd5e1",
    marginTop: 10,
    fontSize: 14,
  },
  textBox: {
    color: "white",
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 12,
    width: "100%",
    borderRadius: 14,
    minHeight: 45,
  },
  btn: {
    backgroundColor: "#a78bfa",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginTop: 16,
  },
  btnStop: {
    backgroundColor: "#ef4444",
  },
  btnText: {
    color: "#020617",
    fontWeight: "700",
  },
});
