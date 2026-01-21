import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Speech from "expo-speech";
import * as ScreenOrientation from "expo-screen-orientation";
import { useFocusEffect } from "@react-navigation/native";

import StarsBackground from "../../components/StarsBackground";
import RobotAvatar from "../../components/Robotavatar";

// ✅ CHANGE this to your backend IP + PORT
const API_BASE_URL = "http://10.42.241.36:5000";

export default function LessonTeachScreen() {
  const { topic } = useLocalSearchParams<{ topic: string }>();
  const router = useRouter();

  const [steps, setSteps] = useState<string[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [reply, setReply] = useState("");

  const [isTalking, setIsTalking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { width, height } = Dimensions.get("window");
  const robotW = Math.min(width * 0.45, 420);
  const robotH = Math.min(height * 0.7, 250);

  // ✅ LOCK LANDSCAPE EVERY TIME SCREEN OPENS
  useFocusEffect(
    useCallback(() => {
      const lockLandscape = async () => {
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.LANDSCAPE
        );
      };

      lockLandscape();

      return () => {
        ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.PORTRAIT_UP
        );
      };
    }, [])
  );

  const stopAll = () => {
    Speech.stop();
    setIsTalking(false);
  };

  const handleExit = async () => {
    stopAll();

    await ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.PORTRAIT_UP
    );

    router.back();
  };

  // ✅ START LESSON (mode=start)
  const startLesson = async () => {
    try {
      setIsLoading(true);

      const res = await fetch(`${API_BASE_URL}/api/lesson/lesson`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "start",
          topic,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.log("Start Lesson Error:", data);
        return;
      }

      setSteps(data.steps || []);
      setStepIndex(0);
    } catch (err) {
      console.log("Start Lesson Failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ TEACH STEP (mode=teach)
  const teachStep = async (index: number) => {
    if (!steps.length) return;

    try {
      setIsLoading(true);

      const res = await fetch(`${API_BASE_URL}/api/lesson`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "teach",
          topic,
          steps,
          stepIndex: index,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.log("Teach Step Error:", data);
        return;
      }

      const explanation = data.reply || "Sorry, I couldn't explain that.";
      setReply(explanation);

      // ✅ Speak explanation WITH lip sync
      stopAll();

      Speech.speak(explanation, {
        language: "en",
        rate: 0.9,
        pitch: 1,

        onStart: () => setIsTalking(true),

        onDone: () => {
          // ✅ Keep lips moving for the next sentence too
          setIsTalking(true);

          Speech.speak("Do you have any doubts? Click Continue to proceed.", {
            language: "en",
            rate: 0.9,
            pitch: 1,

            onDone: () => {
              // ✅ Stop lips finally after BOTH speeches finish
              setIsTalking(false);
            },

            onStopped: () => setIsTalking(false),
            onError: () => setIsTalking(false),
          });
        },

        onStopped: () => setIsTalking(false),
        onError: () => setIsTalking(false),
      });
    } catch (err) {
      console.log("Teach Step Failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Start lesson once
  useEffect(() => {
    startLesson();
  }, []);

  // ✅ Teach when steps ready or step changes
  useEffect(() => {
    if (steps.length > 0) {
      teachStep(stepIndex);
    }
  }, [steps, stepIndex]);

  // ✅ Continue button = go next part
  const handleContinue = () => {
    stopAll();

    if (stepIndex < steps.length - 1) {
      setStepIndex((prev) => prev + 1);
    } else {
      Speech.speak("Lesson completed. Great job!", {
        language: "en",
        rate: 0.9,
        onStart: () => setIsTalking(true),
        onDone: () => setIsTalking(false),
      });
    }
  };

  return (
    <LinearGradient
      colors={["#020617", "#030712", "#1e1b4b"]}
      style={styles.container}
    >
      <StarsBackground />

      {/* ❌ EXIT BUTTON */}
      <TouchableOpacity
        style={styles.exitBtn}
        onPress={handleExit}
        activeOpacity={0.8}
      >
        <Text style={styles.exitText}>✖ Exit</Text>
      </TouchableOpacity>

      {/* ✅ SPLIT SCREEN */}
      <View style={styles.splitContainer}>
        {/* LEFT SIDE 🤖 */}
        <View style={styles.leftHalf}>
          <View style={styles.robotWrapper}>
            <RobotAvatar width={robotW} height={robotH} isTalking={isTalking} />
            <Text style={styles.robotText}>
              {isLoading ? "Thinking..." : isTalking ? "Speaking..." : "Teaching..."}
            </Text>
          </View>
        </View>

        {/* RIGHT SIDE 📄 */}
        <View style={styles.rightHalf}>
          <Text style={styles.topic}>{topic}</Text>

          <Text style={styles.stepTitle}>
            {steps.length > 0
              ? `Part ${stepIndex + 1} / ${steps.length}: ${steps[stepIndex]}`
              : "Preparing lesson..."}
          </Text>

          <ScrollView style={styles.textBox}>
            {isLoading && !reply ? (
              <View style={{ paddingTop: 20 }}>
                <ActivityIndicator size="large" color="#a78bfa" />
                <Text style={{ color: "#cbd5e1", marginTop: 10 }}>
                  Generating explanation...
                </Text>
              </View>
            ) : (
              <Text style={styles.text}>{reply}</Text>
            )}
          </ScrollView>

          {/* CONTROLS */}
          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.button}
              onPress={handleContinue}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Continue ▶</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.doubtButton]}
              onPress={() => {
                stopAll();
                Speech.speak("Sure. Please ask your doubt.", {
                  language: "en",
                  rate: 0.9,
                  onStart: () => setIsTalking(true),
                  onDone: () => setIsTalking(false),
                });
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Doubt ❓</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  splitContainer: {
    flex: 1,
    flexDirection: "row",
    paddingTop: 20,
  },

  leftHalf: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  robotWrapper: {
    width: "92%",
    height: "92%",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#a78bfa",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },

  robotText: {
    color: "#cbd5e1",
    marginTop: 12,
    fontSize: 14,
  },

  rightHalf: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
  },

  topic: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 6,
  },

  stepTitle: {
    color: "#cbd5e1",
    fontSize: 14,
    marginBottom: 10,
  },

  textBox: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 16,
    padding: 14,
    marginBottom: 15,
  },

  text: {
    color: "#e5e7eb",
    fontSize: 15,
    lineHeight: 24,
  },

  controls: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },

  button: {
    flex: 1,
    backgroundColor: "#a78bfa",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },

  doubtButton: {
    backgroundColor: "#475569",
  },

  buttonText: {
    color: "#020617",
    fontWeight: "700",
  },

  exitBtn: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    zIndex: 10,
  },

  exitText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});
