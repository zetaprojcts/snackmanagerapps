import React from "react";
import {
  type StyleProp,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";

import { COLORS, RADIUS, SHADOW } from "../../theme";

type Props = {
  title: string;
  subtitle: string;
  style?: StyleProp<ViewStyle>;
};

export default function EmptyState({ title, subtitle, style }: Props) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>

      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: RADIUS.card,
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
