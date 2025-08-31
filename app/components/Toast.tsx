import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface ToastProps {
  message: string;
  visible: boolean;
  success?: boolean; // true pour vert, false pour rouge
}

export default function Toast({ message, visible, success = true }: ToastProps) {
  if (!visible) return null;

  return (
    <View style={[styles.container, { backgroundColor: success ? "green" : "red" }]}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    zIndex: 1000,
  },
  text: { color: "#fff", fontSize: 16 },
});
