import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { COLORS, SHADOW } from "../../theme";

type Props = {
  title: string;
  subtitle: string;
};

export default function EmptyState({ title, subtitle }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 40,
    alignItems: "center",
    ...SHADOW.card,
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: "center",
  },
});
