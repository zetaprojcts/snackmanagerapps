import React from "react";

import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { X } from "lucide-react-native";

import { COLORS } from "../../theme";

const FILTER_BRANDS = [
  "Semua",
  "Samsung",
  "Oppo",
  "Vivo",
  "Xiaomi",
  "Realme",
  "Infinix",
];

type Props = {
  visible: boolean;
  selectedBrand: string;
  onClose: () => void;
  onSelect: (brand: string) => void;
};

export default function BrandFilterSheet({
  visible,
  selectedBrand,
  onClose,
  onSelect,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Filter Brand</Text>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {FILTER_BRANDS.map((brand) => (
            <TouchableOpacity
              key={brand}
              style={[
                styles.item,
                selectedBrand === brand && styles.itemActive,
              ]}
              onPress={() => onSelect(brand)}
            >
              <Text
                style={[
                  styles.itemText,
                  selectedBrand === brand && styles.itemTextActive,
                ]}
              >
                {brand}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },

  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
  },

  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 20,
    paddingBottom: 40,
    minHeight: 420,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
  },

  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },

  item: {
    height: 54,
    borderRadius: 16,
    paddingHorizontal: 16,
    justifyContent: "center",
    marginBottom: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  itemActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  itemText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
  },

  itemTextActive: {
    color: "#FFFFFF",
  },
});
