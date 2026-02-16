import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useRouter,Href } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import StarsBackground from "../../components/StarsBackground";

export default function HomeScreen() {
  const router = useRouter();
  const { isAuthenticated, loading } = useContext(AuthContext);

  const openProtected = (path: Href) => {
  if (loading) return;

  if (!isAuthenticated) {
    router.push("/login");
  } else {
    router.push(path);
  }
};


  return (
    <LinearGradient
      colors={["#020617", "#030712", "#020617", "#312e81", "#1e1b4b"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <StarsBackground />

      <View style={styles.header}>
        <Text style={styles.logo}>Smart V1</Text>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.push("/signup")}
        >
          <Text style={styles.headerButtonText}>
            {isAuthenticated ? "Profile" : "Sign Up"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.hero}>
        <Text style={styles.title}>
          Learn Smarter With {"\n"} AI Teaching Robot
        </Text>

        <Text style={styles.subTitle}>
          Ask doubts. Understand Concepts. Learn anytime.
        </Text>

        <View style={styles.orbitWrapper}>

          <View style={styles.centerCircle}>
            <Text style={styles.centerText}>AI</Text>
          </View>

          
          <View style={styles.innerOrbit}>

            
            <TouchableOpacity
              style={[styles.orbitItem, styles.notes]}
              onPress={() => openProtected("/(tabs)/notes")}
              activeOpacity={0.7}
            >
              <Text style={styles.orbitIcon}>📝</Text>
              <Text style={styles.orbitLabel}>Notes</Text>
            </TouchableOpacity>

            
            <TouchableOpacity
              style={[styles.orbitItem, styles.talk]}
              onPress={() => openProtected("/(tabs)/talk")}
              activeOpacity={0.7}
            >
              <Text style={styles.orbitIcon}>💬</Text>
              <Text style={styles.orbitLabel}>Talk</Text>
            </TouchableOpacity>

          </View>

        
          <View style={styles.outerOrbit}>
            <TouchableOpacity
              style={[styles.orbitItem, styles.lesson]}
              onPress={() => openProtected("/(tabs)/lessons")}
              activeOpacity={0.7}
            >
              <Text style={styles.orbitIcon}>🎓</Text>
              <Text style={styles.orbitLabel}>Lessons</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </LinearGradient>
  );
}

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  header: {
    height: 160,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 30,
  },

  logo: { color: "white", fontSize: 32, fontWeight: "bold" },

  headerButton: {
    backgroundColor: "#312e81",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },

  headerButtonText: { color: "white", fontSize: 14 },

  hero: { flex: 1, paddingHorizontal: 20 },

  title: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },

  subTitle: { color: "#cbd5e1", fontSize: 16, marginBottom: 30 },

  orbitWrapper: { marginTop: 140, alignItems: "center", justifyContent: "center" },

  centerCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#020617",
    borderWidth: 2,
    borderColor: "#a855f7",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
    pointerEvents: "none",
  },

  centerText: { color: "white", fontSize: 20, fontWeight: "bold" },

  innerOrbit: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    pointerEvents: "box-none",
  },

  outerOrbit: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    pointerEvents: "box-none",
  },

  orbitItem: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#1e293b",
    alignItems: "center",
    justifyContent: "center",
  },

  orbitIcon: { fontSize: 18 },
  orbitLabel: { color: "white", fontSize: 10, marginTop: 2 },

  lesson: { top: -20, left: 100 },
  notes: { right: -40, top: 60, zIndex: 5, elevation: 5 },
  talk: { bottom: -30, left: 10 },
});
