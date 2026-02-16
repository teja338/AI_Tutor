import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Speech from "expo-speech";
import * as ScreenOrientation from "expo-screen-orientation";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";

import StarsBackground from "../../components/StarsBackground";
import RobotAvatar from "../../components/Robotavatar";

const BASE_URL = "http://10.68.127.36:5000";
const LESSON_API = `${BASE_URL}/api/ollama/lesson`;

export default function LessonTeachScreen() {
  const { topic } = useLocalSearchParams<{ topic: string }>();
  const router = useRouter();

  const [steps, setSteps] = useState<string[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [currentStepTitle, setCurrentStepTitle] = useState("");
  const [lessonText, setLessonText] = useState("Starting lesson...");
  const [loading, setLoading] = useState(false);
  const [isTalking, setIsTalking] = useState(false);


  const [mode, setMode] = useState<"teaching" | "doubt" | "answering">("teaching");
  const [doubtText, setDoubtText] = useState("");

  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const isScreenActive = useRef(true);

  /* ---------------- SPEECH ---------------- */

  const speak = useCallback((text: string) => {
    Speech.stop();
    setTimeout(() => {
      Speech.speak(text, {
        language: "en",
        rate: 0.9,
        pitch: 1,
        onStart: () => setIsTalking(true),
        onDone: () => setIsTalking(false),
        onStopped: () => setIsTalking(false),
        onError: () => setIsTalking(false),
      });
    }, 150);
  }, []);

  /* ---------------- ORIENTATION ---------------- */

  useFocusEffect(
    useCallback(() => {
      isScreenActive.current = true;

      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

       return () => {
  isScreenActive.current = false;
  Speech.stop();
  setIsTalking(false);
  ScreenOrientation.unlockAsync();
};

    }, [])
  );

  /* ---------------- LESSON START ---------------- */

  const startLesson = useCallback(async () => {
    if (!topic) return;

    try {
      setLoading(true);
      setLessonText("Generating lesson steps...");

      const res = await fetch(LESSON_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "start", topic }),
      });

      const data = await res.json();
      setSteps(data.steps);
      setStepIndex(0);

      setTimeout(() => teachStep(data.steps, 0), 300);
    } catch {
      setLessonText("⚠️ Network error.");
    } finally {
      setLoading(false);
    }
  }, [topic]);

  /* ---------------- TEACH STEP ---------------- */

  const teachStep = async (stepList: string[], index: number) => {
    try {
      setLoading(true);
      setMode("teaching");

      const stepTitle = stepList[index];
      setCurrentStepTitle(stepTitle);
      setLessonText("Teaching...");

      const res = await fetch(LESSON_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
  mode: "teach",
  topic,
  step: stepTitle,  
}),

      });

      const data = await res.json();
      if (!isScreenActive.current) return;

      setLessonText(data.reply);
      speak(data.reply);
    } catch {
      setLessonText("⚠️ Teaching failed.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- CONTINUE ---------------- */

  const handleContinue = () => {
    Speech.stop();

    const nextIndex = stepIndex + 1;
    if (nextIndex >= steps.length) {
      setLessonText("✅ Lesson completed!");
      speak("Lesson completed! Great job!");
      return;
    }

    setStepIndex(nextIndex);
    teachStep(steps, nextIndex);
  };

  /* ---------------- DOUBT MODE ---------------- */

  const handleDoubtPress = () => {
    Speech.stop();
    setMode("doubt");
    speak("Tell me your doubt. You can type or speak.");
  };

  /* ---------------- RECORD VOICE ---------------- */

  const startRecording = async () => {
    Speech.stop();

    const permission = await Audio.requestPermissionsAsync();
    if (!permission.granted) return;

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );

    setRecording(recording);
    setIsRecording(true);
  };

  const stopRecording = async () => {
    if (!recording) return;

    setIsRecording(false);
    await recording.stopAndUnloadAsync();

    const uri = recording.getURI();
    setRecording(null);

    if (uri) {
      const text = await uploadAudio(uri);
      setDoubtText(text);
    }
  };
  
  /* ---------------- ASK DOUBT ---------------- */

const askDoubt = async () => {
  if (!doubtText.trim()) {
    speak("Please tell me your doubt first");
    return;
  }

  Speech.stop();
  setLoading(true);

  try {
    const res = await fetch(LESSON_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "doubt",
        topic: topic,
        currentStep: currentStepTitle,
        question: doubtText,
      }),
    });

    
    let data;
    try {
      const text = await res.text();
      data = JSON.parse(text);
    } catch {
      setLessonText("Server error. Please try again.");
      return;
    }

    setLessonText(data.reply);
    speak(data.reply);
    setMode("teaching");

  } catch (err) {
    setLessonText("Network error while answering doubt.");
  } finally {
    setLoading(false);
  }
};

  /* ---------------- WHISPER API ---------------- */

  const uploadAudio = async (uri: string) => {
    const formData = new FormData();
    formData.append("audio", {
      uri,
      name: "speech.m4a",
      type: "audio/m4a",
    } as any);

    const res = await fetch(`${BASE_URL}/api/speech/speech-to-text`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    return data.text || "";
  };

  /* ---------------- SEND DOUBT TO AI ---------------- */

  const sendDoubt = async () => {
    if (!doubtText.trim()) return;

    setMode("answering");
    setLessonText("Thinking about your doubt...");

    const res = await fetch(`${BASE_URL}/api/ollama/doubt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topic,
        step: currentStepTitle,
        doubt: doubtText,
      }),
    });

    const data = await res.json();

    setLessonText(data.answer);
    speak(data.answer);

    setMode("teaching");
    setDoubtText("");
  };

   const handleExit = async () => {
  try {
    
    Speech.stop();
    setIsTalking(false);
  
    isScreenActive.current = false;
    setLoading(false);


    await new Promise(resolve => setTimeout(resolve, 250));

    await ScreenOrientation.unlockAsync();

    router.replace("/(tabs)");
    
  } catch (e) {
    console.log("Exit error:", e);
  }
};


  useEffect(() => {
    startLesson();
  }, [startLesson]);

  /* ---------------- UI ---------------- */

  return (
    <LinearGradient colors={["#020617", "#030712", "#1e1b4b"]} style={styles.container}>
      <StarsBackground />

      <TouchableOpacity style={styles.exitBtn} onPress={handleExit}>
        <Text style={styles.exitText}>✖ Exit</Text>
      </TouchableOpacity>

      <View style={styles.splitContainer}>

        {/* LEFT ROBOT */}
        <View style={styles.leftHalf}>
          <RobotAvatar width={320} height={260} isTalking={isTalking} />
        </View>

        {/* RIGHT PANEL */}
        <View style={styles.rightHalf}>
          <Text style={styles.topic}>{topic}</Text>
          <Text style={styles.stepTitle}>📌 {currentStepTitle}</Text>

          <ScrollView style={styles.textBox}>
            <Text style={styles.text}>{lessonText}</Text>
          </ScrollView>

          {/* DOUBT INPUT */}
          {mode === "doubt" && (
            <View style={styles.doubtBox}>
              <TextInput
                value={doubtText}
                onChangeText={setDoubtText}
                placeholder="Ask your doubt..."
                placeholderTextColor="#94a3b8"
                style={styles.input}
              />

              <TouchableOpacity
                style={[styles.micBtn, { backgroundColor: isRecording ? "#ef4444" : "#22c55e" }]}
                onPress={isRecording ? stopRecording : startRecording}
              >
                <Ionicons name={isRecording ? "stop" : "mic"} size={18} color="white" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.askBtn} onPress={askDoubt}>
                <Text style={{ fontWeight: "800" }}>Ask</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* CONTROLS */}
          <View style={styles.controls}>
            <TouchableOpacity style={styles.button} onPress={handleContinue}>
              <Text style={styles.buttonText}>Continue ▶</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.doubtBtn]} onPress={handleDoubtPress}>
              <Text style={[styles.buttonText, { color: "white" }]}>Doubt ❓</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: { flex: 1 },

  splitContainer: { flex: 1, flexDirection: "row", paddingTop: 20 },
  leftHalf: { flex: 1, justifyContent: "center", alignItems: "center" },
  rightHalf: { flex: 1, paddingHorizontal: 20 },

  topic: { color: "white", fontSize: 20, fontWeight: "700" },
  stepTitle: { color: "#c4b5fd", marginBottom: 10 },

  textBox: { flex: 1, backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 16, padding: 14 },
  text: { color: "#e5e7eb", fontSize: 15, lineHeight: 24 },

  controls: { flexDirection: "row", gap: 10, marginTop: 10 },

  button: { flex: 1, backgroundColor: "#a78bfa", padding: 12, borderRadius: 14, alignItems: "center" },
  doubtBtn: { backgroundColor: "#475569" },

  buttonText: { fontWeight: "800" },

  doubtBox: { flexDirection: "row", gap: 8, marginBottom: 10 },
  input: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", color: "white", borderRadius: 12, paddingHorizontal: 10 },

  micBtn: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  askBtn: { backgroundColor: "#facc15", paddingHorizontal: 12, justifyContent: "center", borderRadius: 12 },

  exitBtn: {
  position: "absolute",
  top: 40,
  right: 20,
  zIndex: 9999,
  elevation: 9999, 
  backgroundColor: "rgba(0,0,0,0.55)",
  paddingVertical: 10,
  paddingHorizontal: 16,
  borderRadius: 14,
},

  exitText: { color: "white", fontWeight: "700" },
});
