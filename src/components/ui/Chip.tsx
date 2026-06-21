import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { COLORS } from "../../theme";

export const Chip = ({ label, isActive, onPress }: any) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.chip, isActive && styles.active]}
  >
    <Text style={[styles.text, isActive && styles.activeText]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  active: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  text: { color: COLORS.textMuted },
  activeText: { color: "#FFF" },
});
