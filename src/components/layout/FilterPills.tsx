import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../theme";

type FilterPillsProps = {
  activeFilter: string;
  setFilter: (filter: string) => void;
};

const FILTERS = ["7 Hari Terakhir", "Bulan Ini", "3 Bulan Terakhir"];

export const FilterPills = ({ activeFilter, setFilter }: FilterPillsProps) => {
  return (
    <View style={styles.container}>
      {FILTERS.map((filter) => (
        <TouchableOpacity
          key={filter}
          onPress={() => setFilter(filter)}
          style={[styles.pill, activeFilter === filter && styles.pillActive]}
        >
          <Text
            style={[styles.text, activeFilter === filter && styles.textActive]}
          >
            {filter}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: "row", gap: 8, marginBottom: 15 },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pillActive: { backgroundColor: "#EEF2FF", borderColor: COLORS.primary },
  text: { fontSize: 12, color: COLORS.textMuted, fontWeight: "500" },
  textActive: { color: COLORS.primary, fontWeight: "700" },
});
