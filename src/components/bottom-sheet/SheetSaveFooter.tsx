import {
  BottomSheetFooter,
  type BottomSheetFooterProps,
} from "@gorhom/bottom-sheet";
import { Save } from "lucide-react-native";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { COLORS, RADIUS } from "../../theme";

type Props = BottomSheetFooterProps & {
  deleteLabel?: string;
  deletePending?: boolean;
  label: string;
  pending: boolean;
  onDelete?: () => void;
  onPress: () => void;
};

export default function SheetSaveFooter({
  animatedFooterPosition,
  deleteLabel,
  deletePending = false,
  label,
  pending,
  onDelete,
  onPress,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <BottomSheetFooter
      animatedFooterPosition={animatedFooterPosition}
      bottomInset={insets.bottom}
    >
      <View style={styles.container}>
        {deleteLabel && onDelete ? (
          <TouchableOpacity
            disabled={pending || deletePending}
            onPress={onDelete}
            style={styles.deleteButton}
          >
            <Text style={styles.deleteLabel}>
              {deletePending ? "Menghapus..." : deleteLabel}
            </Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity
          activeOpacity={0.85}
          disabled={pending || deletePending}
          onPress={onPress}
          style={[styles.button, pending && styles.buttonPending]}
        >
          {pending ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Save color="#FFFFFF" size={18} />
          )}
          <Text style={styles.label}>{pending ? "Menyimpan..." : label}</Text>
        </TouchableOpacity>
      </View>
    </BottomSheetFooter>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  button: {
    height: 56,
    borderRadius: RADIUS.control,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  deleteButton: {
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  deleteLabel: {
    color: COLORS.danger,
    fontSize: 14,
    fontWeight: "700",
  },
  buttonPending: {
    opacity: 0.7,
  },
  label: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
