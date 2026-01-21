import React, { useEffect, useState } from "react";
import { View, Image, StyleSheet } from "react-native";
 

export default function RobotAvatar({
  width = 350,
  height = 350,
  isTalking = false,
}: {
  width?: number;
  height?: number;
  isTalking?: boolean;
}) {
  const [patternIndex, setPatternIndex] = useState(0);

  const frames = [
    require("../assets/robot_mouth_0.png"),
    require("../assets/robot_mouth_1.png"),
    require("../assets/robot_mouth_2.png"),
    require("../assets/robot_mouth_3.png"),
  ];
  
  // ✅ Natural speaking pattern
  const talkPattern = [0, 1, 2, 1, 2, 1, 0, 1, 2, 1, 0];

  useEffect(() => {
    let interval: any;

    if (isTalking) {
      interval = setInterval(() => {
        setPatternIndex((prev) => (prev + 1) % talkPattern.length);
      }, 95);
    } else {
      setPatternIndex(0);
    }

    return () => clearInterval(interval);
  }, [isTalking]);

  const currentFrame = isTalking ? talkPattern[patternIndex] : 0;

  return (
    <View style={[styles.container, { width, height }]}>
      <Image source={frames[currentFrame]} style={styles.robotImage} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#020617",
    justifyContent: "center",
    alignItems: "center",
  },
  robotImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
});
