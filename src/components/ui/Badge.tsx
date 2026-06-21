import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface BadgeProps {
  status: "active" | "inactive";
}

export const Badge = ({ status }: BadgeProps) => {
  const isActive = status === "active";

  return (
    <View
      style={[
        styles.badgeContainer,
        isActive ? styles.activeBg : styles.inactiveBg,
      ]}
    >
      <View
        style={[styles.dot, isActive ? styles.activeDot : styles.inactiveDot]}
      />
      <Text style={isActive ? styles.activeText : styles.inactiveText}>
        {isActive ? "Aktif" : "Tidak Aktif"}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  // Warna untuk status AKTIF (Hijau)
  activeBg: { backgroundColor: "#E8F5E9" },
  activeDot: { backgroundColor: "#4CAF50" },
  activeText: { color: "#2E7D32", fontWeight: "600", fontSize: 12 },

  // Warna untuk status TIDAK AKTIF (Merah/Abu-abu)
  inactiveBg: { backgroundColor: "#FFEBEE" },
  inactiveDot: { backgroundColor: "#F44336" },
  inactiveText: { color: "#C62828", fontWeight: "600", fontSize: 12 },
});
