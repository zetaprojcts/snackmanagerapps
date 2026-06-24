import DateTimePicker from "@react-native-community/datetimepicker";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Calendar } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

import EmptyState from "../../components/ui/EmptyState";
import { fetchPayments } from "../../features/payment/api";
import { COLORS, SHADOW } from "../../theme";

const BRAND_IMAGES: Record<string, any> = {
  Samsung: require("../../../assets/devices/samsung.png"),
  Oppo: require("../../../assets/devices/oppo.png"),
  Vivo: require("../../../assets/devices/vivo.png"),
  Xiaomi: require("../../../assets/devices/xiaomi.png"),
  Realme: require("../../../assets/devices/realme.png"),
  Infinix: require("../../../assets/devices/infinix.png"),
};

const DEFAULT_IMAGE = require("../../../assets/devices/default.png");

export default function PaymentScreen() {
  const router = useRouter();

  // State Filter
  const [filter, setFilter] = useState<
    "this_month" | "last_month" | "all" | "custom"
  >("this_month");

  // State Custom Date
  const [showCustomDateModal, setShowCustomDateModal] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<Date>(new Date());
  const [customEndDate, setCustomEndDate] = useState<Date>(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const { data: allPayments, isLoading } = useQuery({
    queryKey: ["payment"],
    queryFn: fetchPayments,
  });

  // Logika Filter Data
  const filteredPayments = useMemo(() => {
    const dataList = (allPayments as any[]) || [];
    if (dataList.length === 0) return [];

    const now = new Date();

    return dataList
      .filter((item: any) => {
        if (!item.trx_date) return false;
        const itemDate = new Date(item.trx_date);

        if (filter === "all") return true;

        if (filter === "this_month") {
          return (
            itemDate.getMonth() === now.getMonth() &&
            itemDate.getFullYear() === now.getFullYear()
          );
        }

        if (filter === "last_month") {
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          return (
            itemDate.getMonth() === lastMonth.getMonth() &&
            itemDate.getFullYear() === lastMonth.getFullYear()
          );
        }

        if (filter === "custom") {
          const start = new Date(customStartDate);
          start.setHours(0, 0, 0, 0);
          const end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999);
          return itemDate >= start && itemDate <= end;
        }

        return true;
      })
      .sort(
        (a: any, b: any) =>
          new Date(b.trx_date).getTime() - new Date(a.trx_date).getTime(),
      );
  }, [allPayments, filter, customStartDate, customEndDate]);

  const totalPayment = useMemo(() => {
    return filteredPayments.reduce(
      (sum: number, item: any) => sum + Number(item.gross_amount || 0),
      0,
    );
  }, [filteredPayments]);

  // Format Tanggal
  const formatFullDate = (date: Date) =>
    date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  const formatShortDate = (date: Date) =>
    date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });

  const getCustomLabel = () => {
    if (filter === "custom")
      return `${formatShortDate(customStartDate)} - ${formatShortDate(customEndDate)}`;
    return "Tanggal...";
  };

  return (
    <>
      <View style={styles.container}>
        <Animated.View entering={FadeInDown} style={styles.header}>
          <Text style={styles.screenTitle}>Riwayat Penarikan</Text>
        </Animated.View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Card Total */}
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Total Penarikan</Text>
            <Text style={styles.totalValue}>
              Rp {totalPayment.toLocaleString("id-ID")}
            </Text>
          </View>

          {/* Filter Tab Horizontal */}
          <View style={styles.filterWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScroll}
            >
              {[
                { id: "this_month", label: "Bulan Ini" },
                { id: "last_month", label: "Bulan Lalu" },
                { id: "all", label: "Semua" },
                { id: "custom", label: getCustomLabel(), isCustom: true },
              ].map((item) => {
                const isActive = filter === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.filterTab,
                      isActive && styles.filterTabActive,
                    ]}
                    onPress={() => {
                      if (item.isCustom) {
                        setShowCustomDateModal(true);
                      } else {
                        setFilter(item.id as any);
                      }
                    }}
                  >
                    {item.isCustom && (
                      <Calendar
                        size={14}
                        color={isActive ? COLORS.primary : COLORS.textMuted}
                        style={{ marginRight: 6 }}
                      />
                    )}
                    <Text
                      style={[
                        styles.filterTabText,
                        isActive && styles.filterTabTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* List Data */}
          <View style={styles.listContainer}>
            {filteredPayments.length === 0 && !isLoading ? (
              <EmptyState
                title="Tidak Ada Data"
                subtitle="Belum ada riwayat penarikan di periode ini."
              />
            ) : (
              filteredPayments.map((item: any, index: number) => {
                const device = item.devices;
                const imageSource =
                  BRAND_IMAGES[device?.brand || ""] || DEFAULT_IMAGE;

                return (
                  <Animated.View
                    key={item.id || index}
                    entering={FadeInUp.delay(index * 50)}
                    style={styles.listItem}
                  >
                    <Image
                      source={imageSource}
                      style={styles.deviceImage}
                      resizeMode="contain"
                    />
                    <View style={styles.itemInfo}>
                      <Text style={styles.deviceName}>
                        {device?.device_name || "Unknown Device"}
                      </Text>
                      <Text style={styles.itemDate}>
                        {new Date(item.trx_date).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </Text>
                    </View>
                    <Text style={styles.itemAmount}>
                      - Rp {Number(item.gross_amount).toLocaleString("id-ID")}
                    </Text>
                  </Animated.View>
                );
              })
            )}
          </View>
        </ScrollView>
      </View>

      {/* Modal Custom Date */}
      <Modal visible={showCustomDateModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Pilih Rentang Tanggal</Text>

            <Text style={styles.modalLabel}>Dari Tanggal</Text>
            <TouchableOpacity
              style={styles.modalInputBox}
              onPress={() => setShowStartPicker(true)}
            >
              <Text style={styles.modalInputText}>
                {formatFullDate(customStartDate)}
              </Text>
            </TouchableOpacity>

            <Text style={styles.modalLabel}>Sampai Tanggal</Text>
            <TouchableOpacity
              style={styles.modalInputBox}
              onPress={() => setShowEndPicker(true)}
            >
              <Text style={styles.modalInputText}>
                {formatFullDate(customEndDate)}
              </Text>
            </TouchableOpacity>

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.modalBtnCancel}
                onPress={() => setShowCustomDateModal(false)}
              >
                <Text style={styles.modalBtnCancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalBtnSave}
                onPress={() => {
                  setFilter("custom");
                  setShowCustomDateModal(false);
                }}
              >
                <Text style={styles.modalBtnSaveText}>Terapkan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {showStartPicker && (
        <DateTimePicker
          value={customStartDate}
          mode="date"
          display="default"
          onChange={(e, date) => {
            setShowStartPicker(false);
            if (date) setCustomStartDate(date);
          }}
        />
      )}
      {showEndPicker && (
        <DateTimePicker
          value={customEndDate}
          mode="date"
          display="default"
          onChange={(e, date) => {
            setShowEndPicker(false);
            if (date) setCustomEndDate(date);
          }}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.text,
  },
  scrollContent: { paddingBottom: 100 },

  totalCard: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 20,
    padding: 24,
    borderRadius: 24,
    ...SHADOW.card,
  },
  totalLabel: { color: "rgba(255,255,255,0.8)", fontSize: 14, marginBottom: 6 },
  totalValue: { color: "#FFFFFF", fontSize: 32, fontWeight: "800" },

  filterWrapper: { marginTop: 20, marginBottom: 10 },
  filterScroll: { paddingHorizontal: 20, gap: 12, alignItems: "center" },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  filterTabActive: { borderBottomColor: COLORS.primary },
  filterTabText: { fontSize: 14, fontWeight: "600", color: COLORS.textMuted },
  filterTabTextActive: { color: COLORS.primary, fontWeight: "700" },

  listContainer: { paddingHorizontal: 20, marginTop: 10 },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    ...SHADOW.card,
  },
  deviceImage: { width: 32, height: 48, marginRight: 16 },
  itemInfo: { flex: 1 },
  deviceName: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
  },
  itemDate: { fontSize: 12, color: COLORS.textMuted },
  itemAmount: { fontSize: 15, fontWeight: "700", color: COLORS.warning },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    ...SHADOW.card,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  modalInputBox: {
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
  },
  modalInputText: { color: COLORS.text, fontSize: 14, fontWeight: "500" },
  modalActionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 10,
  },
  modalBtnCancel: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
  },
  modalBtnCancelText: { color: COLORS.textMuted, fontWeight: "700" },
  modalBtnSave: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
  },
  modalBtnSaveText: { color: "#FFFFFF", fontWeight: "700" },
});
