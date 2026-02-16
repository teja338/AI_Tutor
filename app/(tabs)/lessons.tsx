import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Speech from "expo-speech";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import StarsBackground from "../../components/StarsBackground";
import RobotAvatar from "../../components/Robotavatar";
import BackButton from "../../components/BackButton";

const setPlaybackMode = async () => {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
    interruptionModeIOS: 1,
    interruptionModeAndroid: 1,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
  });
};

const setRecordingMode = async () => {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
    interruptionModeIOS: 1,
    interruptionModeAndroid: 1,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
  });
};


export default function LessonsIntroScreen() {
  const router = useRouter();

  const [topic, setTopic] = useState("");
  const [isTalking, setIsTalking] = useState(false);

  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
 
  const startRecording = async () => {
  try {
    Speech.stop();
    setIsTalking(false);

    await setRecordingMode();    

    const permission = await Audio.requestPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Microphone access is needed");
      return;
    }

    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );

    setRecording(recording);
    setIsRecording(true);
  } catch (err) {
    console.error("Failed to start recording", err);
  }
};


  const stopRecording = async () => {
  try {
    if (!recording) return;

    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    await setPlaybackMode(); 
    
    const uri = recording.getURI();
    if (uri) {
      await uploadAudio(uri);
    }

  } catch (err) {
    console.error("Failed to stop recording", err);
  }
};

   const uploadAudio = async (uri: string) => {
  try {
    const formData = new FormData();

    formData.append("audio", {
      uri: uri,
      name: "speech.m4a",
      type: "audio/m4a",
    } as any);

    const response = await fetch("http://10.68.127.36:5000/api/speech/speech-to-text", {
      method: "POST",
      body: formData,
    });

    const textResponse = await response.text();
    console.log(" Raw backend response:", textResponse);

    const data = JSON.parse(textResponse);

    console.log(" Whisper text:", data.text);

    if (data.text) {
      setTopic(data.text);     
      speak(`You said ${data.text}`);
    } else {
      Alert.alert("Speech Error", "Could not understand speech");
    }

  } catch (err) {
    console.error(" Upload failed:", err);
    Alert.alert("Network Error", "Check backend & WiFi connection");
  }
};


  const speak = useCallback(async (text: string) => {
  await setPlaybackMode();
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


  useFocusEffect(
    useCallback(() => {
      speak("Hey! What would you like to learn today? Speak or type a topic.");
      return () => {
        Speech.stop();
        setIsTalking(false);
      };
    }, [speak])
  );

  const handleStartLesson = (finalTopic?: string) => {
    const selectedTopic = (finalTopic || topic).trim();

    if (!selectedTopic) {
      speak("Please enter a topic or use the microphone.");
      Alert.alert("Topic Required", "Please type a topic or use microphone 🎤");
      return;
    }

    Speech.stop();
    router.push({
      pathname: "/(tabs)/lesson-teach",
      params: { topic: selectedTopic },
    });
  };

  return (
    <LinearGradient
      colors={["#020617", "#030712", "#1e1b4b"]}
      style={styles.container}
    >
      <StarsBackground />
      <BackButton />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.inner}
      >
        <View style={styles.topArea}>
          <View style={styles.robotBox}>
            <RobotAvatar width={220} height={220} isTalking={isTalking} />
          </View>

          <Text style={styles.title}>Virtual Teaching Robot</Text>
          <Text style={styles.subTitle}>
            Speak a topic 🎤 or type it ✍️ to start learning
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Enter Topic</Text>

          <View style={styles.inputRow}>
            <TextInput
              value={topic}
              onChangeText={setTopic}
              placeholder="Eg: Deadlock in OS"
              placeholderTextColor="#94a3b8"
              style={styles.input}
            />

             <TouchableOpacity
  style={[
    styles.micBtn,
    { backgroundColor: isRecording ? "#ef4444" : "#22c55e" },
  ]}
  onPress={isRecording ? stopRecording : startRecording}
  activeOpacity={0.8}
>
  <Ionicons
    name={isRecording ? "stop" : "mic"}
    size={20}
    color="white"
  />
</TouchableOpacity>

          </View>

          <TouchableOpacity
            style={styles.startBtn}
            onPress={() => handleStartLesson()}
          >
            <Text style={styles.startText}>Start Lesson 🚀</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickBtn}
            onPress={() =>
              handleStartLesson("Deadlock in Operating Systems")
            }
          >
            <Text style={styles.quickText}>Try Demo Topic ⚡</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

/* Styles */
const styles = StyleSheet.create({
  container: { flex: 1 },

  inner: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 22,
  },

  topArea: {
    alignItems: "center",
    marginBottom: 18,
  },

  robotBox: {
    width: 240,
    height: 240,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "rgba(167,139,250,0.75)",
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  title: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 5,
  },

  subTitle: {
    color: "#cbd5e1",
    fontSize: 13,
    textAlign: "center",
  },

  card: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.15)",
  },

  label: {
    color: "#c4b5fd",
    fontWeight: "700",
    marginBottom: 8,
    fontSize: 14,
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  input: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: "rgba(0,0,0,0.35)",
    color: "white",
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.25)",
  },

  micBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#475569",
    alignItems: "center",
    justifyContent: "center",
  },

  startBtn: {
    marginTop: 14,
    backgroundColor: "#a78bfa",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },

  startText: {
    color: "#020617",
    fontSize: 15,
    fontWeight: "800",
  },

  quickBtn: {
    marginTop: 10,
    backgroundColor: "rgba(255,255,255,0.10)",
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center",
  },

  quickText: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
  },
});
