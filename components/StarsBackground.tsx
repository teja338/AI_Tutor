import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

const STAR_COUNT = 60;

export default function StarsBackground() {
  return (
    <View style={StyleSheet.absoluteFill}>
      {Array.from({ length: STAR_COUNT }).map((_, index) => {
        const size = Math.random() * 2 + 1; // small stars
        const top = Math.random() * height;
        const left = Math.random() * width;
        const opacity = Math.random() * 0.6 + 0.2;

        return (
          <View
            key={index}
            style={[
              styles.star,
              {
                width: size,
                height: size,
                top,
                left,
                opacity,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  star: {
    position: "absolute",
    backgroundColor: "white",
    borderRadius: 10,
  },
});
