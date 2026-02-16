import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import React, { useState } from "react";
import { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import StarsBackground from "../../components/StarsBackground";
import { signupApi } from "../../services/api";

WebBrowser.maybeCompleteAuthSession();

export default function SignupScreen() {
  const router = useRouter();
  const [request, response, promptAsync] = Google.useAuthRequest({
  clientId: "485547745326-vc0ula7e16egs9flruul39epfcag73p7.apps.googleusercontent.com",
  });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  if (response?.type === "success") {
    const { authentication } = response;

    alert("Google login successful 🎉");

  }
}, [response]);

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      alert("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      await signupApi({
        name,
        email,
        password,
        confirmPassword,
      });

      alert("Signup successful 🎉");
      router.replace("/login");
    } catch (error: any) {
      alert(error?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[
        "#020617",
        "#030712",
        "#020617",
        "#312e81",
        "#1e1b4b",
      ]}
      style={styles.container}
    >
      <StarsBackground />

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.title}>
          Let's Dive into the World Of Knowledge
        </Text>

        <TextInput
          placeholder="Enter your name"
          placeholderTextColor="#9ca3af"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />

        <TextInput
          placeholder="Enter your email"
          placeholderTextColor="#9ca3af"
          style={styles.input}
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          placeholder="Enter your password"
          placeholderTextColor="#9ca3af"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />

        <TextInput
          placeholder="Confirm your password"
          placeholderTextColor="#9ca3af"
          secureTextEntry
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        
        <TouchableOpacity
          style={styles.signupButton}
          onPress={handleSignup}
          disabled={loading}
        >
          <Text style={styles.signupText}>
            {loading ? "Signing up..." : "Sign Up"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.orText}>OR</Text>

        <View style={styles.socialRow}>
           <TouchableOpacity
              style={styles.socialButton}
              onPress={() => promptAsync()}
            >
            <Text style={styles.socialText}>G</Text>
            </TouchableOpacity>

          <View style={styles.socialButton}>
            <Text style={styles.socialText}></Text>
          </View>
        </View>

        <Text style={styles.footerText}>
          Already have an Account?{" "}
          <Text
            style={styles.loginText}
            onPress={() => router.push("/login")}
          >
            Login
          </Text>
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 20,
  },

  card: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },

  title: {
    color: "white",
    fontSize: 22,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 24,
  },

  input: {
    height: 48,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.3)",
    color: "white",
    marginBottom: 20,
    fontSize: 15,
  },

  signupButton: {
    backgroundColor: "#a78bfa",
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 10,
  },

  signupText: {
    color: "#020617",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },

  orText: {
    color: "#cbd5e1",
    textAlign: "center",
    marginVertical: 14,
  },

  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginBottom: 16,
  },

  socialButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },

  socialText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },

  footerText: {
    color: "#cbd5e1",
    textAlign: "center",
    marginTop: 10,
    fontSize: 13,
  },

  loginText: {
    color: "#a78bfa",
    fontWeight: "600",
  },
});
