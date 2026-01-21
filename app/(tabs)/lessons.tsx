import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Speech from "expo-speech";
import { useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { useFocusEffect } from "@react-navigation/native";

import StarsBackground from "../../components/StarsBackground";
import RobotAvatar from "../../components/Robotavatar";

export default function LessonsIntroScreen() {
  const router = useRouter();
  const [isTalking, setIsTalking] = useState(false);

  // ✅ Always keep Intro screen in Portrait
  useFocusEffect(
    useCallback(() => {
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      );
    }, [])
  );

  const speak = (text: string) => {
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

  // ✅ Greeting on load (with lips)
  useEffect(() => {
    speak("Hey! What would you like to learn today?");
  }, []);

  const handleStartLesson = () => {
    Speech.stop();
    setIsTalking(false);

    router.push({
      pathname: "/(tabs)/lesson-teach",
      params: { topic: "Deadlock in Operating Systems" },
    });
  };

  return (
    <LinearGradient
      colors={["#020617", "#030712", "#1e1b4b"]}
      style={styles.container}
    >
      <StarsBackground />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.inner}
      >
        {/* 🤖 ROBOT AVATAR */}
        <View style={styles.avatarWrapper}>
          <View style={styles.avatarBox}>
            <RobotAvatar width={170} height={170} isTalking={isTalking} />
          </View>

          <Text style={styles.greetingText}>Hey 👋</Text>

          <Text style={styles.subText}>
            What would you like to learn today?
          </Text>
        </View>

        {/* 🎯 ACTION BUTTON */}
        <View style={styles.inputBox}>
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartLesson}
            activeOpacity={0.8}
          >
            <Text style={styles.startText}>Let’s Learn 🚀</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  inner: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  avatarWrapper: {
    alignItems: "center",
    marginBottom: 40,
  },

  avatarBox: {
    width: 180,
    height: 180,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#a78bfa",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#a78bfa",
    shadowOpacity: 0.4,
    shadowRadius: 20,
    marginBottom: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
  },

  greetingText: {
    color: "white",
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 6,
  },

  subText: {
    color: "#cbd5e1",
    fontSize: 15,
    textAlign: "center",
  },

  inputBox: {
    marginTop: 20,
  },

  startButton: {
    backgroundColor: "#a78bfa",
    paddingVertical: 14,
    borderRadius: 16,
  },

  startText: {
    color: "#020617",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
});
