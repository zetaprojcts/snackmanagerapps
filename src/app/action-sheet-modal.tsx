import React, { useState } from "react";

import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { ArrowDownToLine, Smartphone, Wallet, X } from "lucide-react-native";

import { useRouter } from "expo-router";

import AddDeviceSheet from "../components/bottom-sheet/AddDeviceSheet";
import AddIncomeSheet from "../components/bottom-sheet/AddIncomeSheet";
import AddPaymentSheet from "../components/bottom-sheet/AddPaymentSheet";

import { COLORS } from "../theme";

export default function ActionSheetModal() {
  const router = useRouter();

  const [showAddDevice, setShowAddDevice] = useState(false);

  const [showAddIncome, setShowAddIncome] = useState(false);

  const [showAddPayment, setShowAddPayment] = useState(false);

  const handleClose = () => {
    router.back();
  };

  return (
    <>
      <View style={styles.container}>
        <Pressable style={styles.backdrop} onPress={handleClose} />

        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.title}>Pilih Tindakan</Text>

            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <X color={COLORS.textMuted} size={20} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setShowAddDevice(true)}
          >
            <View
              style={[
                styles.iconBox,
                {
                  backgroundColor: "#EEF2FF",
                },
              ]}
            >
              <Smartphone color={COLORS.primary} size={24} />
            </View>

            <View>
              <Text style={styles.menuTitle}>Tambah Perangkat</Text>

              <Text style={styles.menuSubtitle}>Tambah perangkat baru</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setShowAddIncome(true)}
          >
            <View
              style={[
                styles.iconBox,
                {
                  backgroundColor: "#D1FAE5",
                },
              ]}
            >
              <ArrowDownToLine color={COLORS.success} size={24} />
            </View>

            <View>
              <Text style={styles.menuTitle}>Catat Pendapatan</Text>

              <Text style={styles.menuSubtitle}>Input pemasukan harian</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setShowAddPayment(true)}
          >
            <View
              style={[
                styles.iconBox,
                {
                  backgroundColor: "#FEF3C7",
                },
              ]}
            >
              <Wallet color={COLORS.warning} size={24} />
            </View>

            <View>
              <Text style={styles.menuTitle}>Catat Penarikan</Text>

              <Text style={styles.menuSubtitle}>Input pencairan saldo</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <AddDeviceSheet
        visible={showAddDevice}
        onClose={() => setShowAddDevice(false)}
      />

      <AddIncomeSheet
        visible={showAddIncome}
        onClose={() => setShowAddIncome(false)}
      />

      <AddPaymentSheet
        visible={showAddPayment}
        onClose={() => setShowAddPayment(false)}
      />
    </>
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
  },

  handle: {
    width: 48,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#CBD5E1",
    alignSelf: "center",
    marginBottom: 20,
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

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  menuTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 2,
  },

  menuSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
});
