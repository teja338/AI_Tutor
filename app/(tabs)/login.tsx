 import React, { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import StarsBackground from "../../components/StarsBackground";
import { loginApi } from "../../services/api";
import { AuthContext } from "../../context/AuthContext";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Email and password are required");
      return;
    }

    try {
      setLoading(true);

      const data = await loginApi(email, password);
      await login(data.token);

      router.replace("/(tabs)");
    } catch (error: any) {
      alert(error?.message || "Login failed");
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

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      {/* Card */}
      <View style={styles.card}>
        <Text style={styles.title}>Welcome Back 👋</Text>

        {/* Email */}
        <TextInput
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          placeholderTextColor="#9ca3af"
          autoCapitalize="none"
          style={styles.input}
        />

        {/* Password */}
        <TextInput
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          placeholderTextColor="#9ca3af"
          secureTextEntry
          style={styles.input}
        />

        {/* Login Button */}
        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.loginText}>
            {loading ? "Logging in..." : "Login"}
          </Text>
        </TouchableOpacity>

        {/* OR */}
        <Text style={styles.orText}>OR</Text>

        {/* Social */}
        <View style={styles.socialRow}>
          <View style={styles.socialButton}>
            <Text style={styles.socialText}>G</Text>
          </View>
          <View style={styles.socialButton}>
            <Text style={styles.socialText}></Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footerText}>
          Don’t have an account?{" "}
          <Text
            style={styles.signupText}
            onPress={() => router.push("/signup")}
          >
            Sign Up
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

  loginButton: {
    backgroundColor: "#a78bfa",
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 10,
  },

  loginText: {
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

  signupText: {
    color: "#a78bfa",
    fontWeight: "600",
  },
});
