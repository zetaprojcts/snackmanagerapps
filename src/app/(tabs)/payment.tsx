import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Calendar, ChevronRight } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import EmptyState from "../../components/ui/EmptyState";
import AppDatePickerModal from "../../components/ui/AppDatePickerModal";
import { HistoryScreenSkeleton } from "../../components/ui/Skeleton";
import { useAuth } from "../../features/auth/AuthProvider";
import {
  fetchPaymentHistory,
  fetchPaymentHistorySummary,
} from "../../features/payment/api";
import {
  getHistoryDateRange,
  getHistoryRangeKey,
  HISTORY_PAGE_SIZE,
  type HistoryFilter,
} from "../../features/transactions/history";
import { COLORS, RADIUS, SHADOW } from "../../theme";

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
  const { user } = useAuth();
  const [filter, setFilter] = useState<HistoryFilter>("this_month");
  const [showCustomDateModal, setShowCustomDateModal] = useState(false);
  const [customStartDate, setCustomStartDate] = useState(new Date());
  const [customEndDate, setCustomEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const dateRange = useMemo(
    () => getHistoryDateRange(filter, customStartDate, customEndDate),
    [customEndDate, customStartDate, filter],
  );
  const rangeKey = getHistoryRangeKey(dateRange);

  const historyQuery = useInfiniteQuery({
    queryKey: ["tenant", user?.id, "payment", "history", rangeKey],
    queryFn: ({ pageParam }) =>
      fetchPaymentHistory({
        ...dateRange,
        page: pageParam,
        pageSize: HISTORY_PAGE_SIZE,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: Boolean(user),
  });

  const summaryQuery = useQuery({
    queryKey: ["tenant", user?.id, "payment", "summary", rangeKey],
    queryFn: () => fetchPaymentHistorySummary(dateRange),
    enabled: Boolean(user),
  });

  const payments = useMemo(
    () => historyQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [historyQuery.data],
  );
  const isInitialLoading = historyQuery.isLoading || summaryQuery.isLoading;

  const formatFullDate = (date: Date) =>
    date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const refresh = async () => {
    await Promise.all([historyQuery.refetch(), summaryQuery.refetch()]);
  };

  return (
    <>
      <View style={styles.container}>
        <Animated.View entering={FadeInDown} style={styles.header}>
          <Text style={styles.screenTitle}>Riwayat Penarikan</Text>
        </Animated.View>

        {isInitialLoading ? (
          <HistoryScreenSkeleton />
        ) : (
          <FlatList
            data={payments}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            initialNumToRender={8}
            maxToRenderPerBatch={8}
            windowSize={7}
            removeClippedSubviews
            onEndReached={() => {
              if (historyQuery.hasNextPage && !historyQuery.isFetchingNextPage) {
                void historyQuery.fetchNextPage();
              }
            }}
            onEndReachedThreshold={0.4}
            refreshControl={
              <RefreshControl
                refreshing={
                  (historyQuery.isRefetching &&
                    !historyQuery.isFetchingNextPage) ||
                  summaryQuery.isRefetching
                }
                onRefresh={() => void refresh()}
              />
            }
            ListHeaderComponent={
              <>
                <View style={styles.totalCard}>
                  <Text style={styles.totalLabel}>Total Penarikan</Text>
                  <Text style={styles.totalValue} numberOfLines={1}>
                    Rp {summaryQuery.data?.totalAmount.toLocaleString("id-ID")}
                  </Text>
                  <Text style={styles.totalCount}>
                    {summaryQuery.data?.rowCount.toLocaleString("id-ID")} transaksi
                  </Text>
                </View>
                <HistoryFilters
                  activeFilter={filter}
                  onCustom={() => setShowCustomDateModal(true)}
                  onSelect={setFilter}
                />
              </>
            }
            ListEmptyComponent={
              <EmptyState
                style={styles.emptyState}
                title="Tidak Ada Data"
                subtitle="Belum ada riwayat penarikan di periode ini."
              />
            }
            ListFooterComponent={
              historyQuery.isFetchingNextPage ? (
                <ActivityIndicator
                  color={COLORS.primary}
                  style={styles.pageLoader}
                />
              ) : null
            }
            renderItem={({ item }) => {
              const device = Array.isArray(item.devices)
                ? item.devices[0]
                : item.devices;
              const imageSource =
                BRAND_IMAGES[device?.brand || ""] || DEFAULT_IMAGE;

              return (
                <TouchableOpacity
                  accessibilityLabel={`Buka detail penarikan ${device?.device_name ?? "perangkat"}`}
                  accessibilityRole="button"
                  activeOpacity={0.82}
                  style={styles.listItem}
                  onPress={() =>
                    router.push({
                      pathname: "/payment-detail",
                      params: { id: item.id },
                    })
                  }
                >
                  <Image
                    source={imageSource}
                    style={styles.deviceImage}
                    resizeMode="contain"
                  />
                  <View style={styles.itemInfo}>
                    <Text style={styles.deviceName} numberOfLines={1}>
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
                  <Text style={styles.itemAmount} numberOfLines={1}>
                    - Rp {Number(item.gross_amount).toLocaleString("id-ID")}
                  </Text>
                  <ChevronRight size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>

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

      <AppDatePickerModal
        onCancel={() => setShowStartPicker(false)}
        onConfirm={(date) => {
          setShowStartPicker(false);
          setCustomStartDate(date);
        }}
        title="Tanggal mulai"
        value={customStartDate}
        visible={showStartPicker}
      />
      <AppDatePickerModal
        onCancel={() => setShowEndPicker(false)}
        onConfirm={(date) => {
          setShowEndPicker(false);
          setCustomEndDate(date);
        }}
        title="Tanggal selesai"
        value={customEndDate}
        visible={showEndPicker}
      />
    </>
  );
}

function HistoryFilters({
  activeFilter,
  onSelect,
  onCustom,
}: {
  activeFilter: HistoryFilter;
  onSelect: (filter: HistoryFilter) => void;
  onCustom: () => void;
}) {
  return (
    <View style={styles.filterWrapper}>
      {[
        { id: "this_month" as const, label: "Bulan Ini" },
        { id: "last_month" as const, label: "Bulan Lalu" },
        { id: "all" as const, label: "Semua" },
      ].map((item) => {
        const isActive = activeFilter === item.id;
        return (
          <TouchableOpacity
            key={item.id}
            style={[styles.filterTab, isActive && styles.filterTabActive]}
            onPress={() => onSelect(item.id)}
          >
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
      <TouchableOpacity
        accessibilityLabel="Pilih rentang tanggal"
        accessibilityRole="button"
        style={[
          styles.filterTab,
          styles.customFilter,
          activeFilter === "custom" && styles.filterTabActive,
        ]}
        onPress={onCustom}
      >
        <Calendar
          size={20}
          color={activeFilter === "custom" ? COLORS.primary : COLORS.textMuted}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  screenTitle: { fontSize: 22, fontWeight: "800", color: COLORS.text },
  listContent: { paddingBottom: 120 },
  totalCard: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 20,
    padding: 24,
    borderRadius: RADIUS.card,
    ...SHADOW.card,
  },
  totalLabel: { color: "rgba(255,255,255,0.8)", fontSize: 14 },
  totalValue: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "800",
    marginTop: 6,
  },
  totalCount: { color: "rgba(255,255,255,0.72)", fontSize: 12, marginTop: 7 },
  filterWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  filterTab: {
    flex: 1,
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  customFilter: { flex: 0, width: 48, paddingHorizontal: 0 },
  filterTabActive: { borderBottomColor: COLORS.primary },
  filterTabText: { fontSize: 13, fontWeight: "600", color: COLORS.textMuted },
  filterTabTextActive: { color: COLORS.primary, fontWeight: "700" },
  listItem: {
    minHeight: 82,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: RADIUS.card,
    marginHorizontal: 20,
    marginBottom: 10,
    ...SHADOW.card,
  },
  deviceImage: { width: 32, height: 48, marginRight: 14 },
  itemInfo: { flex: 1 },
  deviceName: { fontSize: 15, fontWeight: "700", color: COLORS.text },
  itemDate: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  itemAmount: {
    maxWidth: "38%",
    marginHorizontal: 8,
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.warning,
  },
  pageLoader: { marginVertical: 16 },
  emptyState: { marginHorizontal: 20 },
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
    borderRadius: RADIUS.sheet,
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
    borderRadius: RADIUS.control,
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
    borderRadius: RADIUS.control,
    backgroundColor: "#F1F5F9",
  },
  modalBtnCancelText: { color: COLORS.textMuted, fontWeight: "700" },
  modalBtnSave: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: RADIUS.control,
    backgroundColor: COLORS.primary,
  },
  modalBtnSaveText: { color: "#FFFFFF", fontWeight: "700" },
});
