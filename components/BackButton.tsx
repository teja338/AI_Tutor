import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function BackButton() {
  const router = useRouter();

  return (
    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
      <Ionicons name="arrow-back" size={26} color="white" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    position: "absolute",
    top: 45,
    left: 18,
    zIndex: 999,
    backgroundColor: "rgba(0,0,0,0.35)",
    padding: 8,
    borderRadius: 14,
  },
});
