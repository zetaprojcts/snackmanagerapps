import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Pencil, TrendingUp } from "lucide-react-native";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

import EditTransactionSheet from "../components/bottom-sheet/EditTransactionSheet";
import EmptyState from "../components/ui/EmptyState";
import { DetailScreenSkeleton } from "../components/ui/Skeleton";
import { useAuth } from "../features/auth/AuthProvider";
import { getIncomeById } from "../features/income/api";
import { COLORS, RADIUS, SHADOW } from "../theme";

const BRAND_IMAGES: Record<string, any> = {
  Samsung: require("../../assets/devices/samsung.png"),
  Oppo: require("../../assets/devices/oppo.png"),
  Vivo: require("../../assets/devices/vivo.png"),
  Xiaomi: require("../../assets/devices/xiaomi.png"),
  Realme: require("../../assets/devices/realme.png"),
  Infinix: require("../../assets/devices/infinix.png"),
};

const DEFAULT_IMAGE = require("../../assets/devices/default.png");

export default function IncomeDetail() {
  const { id } = useLocalSearchParams();
  const transactionId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();
  const { user } = useAuth();
  const [editVisible, setEditVisible] = useState(false);

  const { data: incomeDetail, isLoading } = useQuery({
    queryKey: ["tenant", user?.id, "income-detail", transactionId],
    queryFn: () => getIncomeById(transactionId!),
    enabled: Boolean(user && transactionId),
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <DetailScreenSkeleton />
      </View>
    );
  }

  if (!incomeDetail) {
    return (
      <View style={styles.container}>
        <EmptyState
          style={styles.errorState}
          title="Data Tidak Ditemukan"
          subtitle="Transaksi pendapatan tidak tersedia."
        />
      </View>
    );
  }

  const device = incomeDetail.devices;
  const imageSource = BRAND_IMAGES[device?.brand || ""] || DEFAULT_IMAGE;

  return (
    <>
      <View style={styles.container}>
      <Animated.View entering={FadeInDown} style={styles.header}>
        <TouchableOpacity
          accessibilityLabel="Kembali"
          accessibilityRole="button"
          onPress={() => router.back()}
          style={styles.backBtn}
        >
          <ChevronLeft size={28} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Detail Pendapatan</Text>
        <TouchableOpacity
          accessibilityLabel="Edit transaksi pendapatan"
          accessibilityRole="button"
          onPress={() => setEditVisible(true)}
          style={styles.editBtn}
        >
          <Pencil size={19} color={COLORS.primary} />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View entering={FadeInUp} style={styles.deviceCard}>
          <Image
            source={imageSource}
            style={styles.deviceImage}
            resizeMode="contain"
          />
          <View style={styles.deviceInfo}>
            <Text style={styles.deviceName}>{device?.device_name || "-"}</Text>
            <Text style={styles.devicePhone}>{device?.phone_number || "-"}</Text>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: device?.is_active
                    ? COLORS.success
                    : COLORS.danger,
                },
              ]}
            >
              <Text style={styles.statusText}>
                {device?.is_active ? "Aktif" : "Nonaktif"}
              </Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(80)}
          style={styles.transactionCard}
        >
          <View style={styles.transactionHeader}>
            <View style={styles.transactionIcon}>
              <TrendingUp size={22} color={COLORS.success} />
            </View>
            <View style={styles.transactionHeading}>
              <Text style={styles.transactionTitle}>Rincian Transaksi</Text>
              <Text style={styles.transactionType}>Pendapatan</Text>
            </View>
            <View style={styles.recordedBadge}>
              <Text style={styles.recordedBadgeText}>Tercatat</Text>
            </View>
          </View>

          <Text style={styles.amountLabel}>Nominal pendapatan</Text>
          <Text style={styles.amountValue} numberOfLines={1} adjustsFontSizeToFit>
            + Rp {Number(incomeDetail.amount).toLocaleString("id-ID")}
          </Text>

          <View style={styles.divider} />

          <DetailRow
            label="Tanggal"
            value={formatTransactionDate(incomeDetail.trx_date)}
          />
          <DetailRow label="Perangkat" value={device?.device_name || "-"} />
          <DetailRow label="Kode" value={device?.code || "-"} />
          <DetailRow
            label="Waktu"
            value={formatRecordedAt(incomeDetail.created_at)}
          />

          <Text style={styles.referenceLabel}>ID transaksi</Text>
          <View style={styles.referenceBox}>
            <Text selectable style={styles.referenceValue}>
              {incomeDetail.id}
            </Text>
          </View>
        </Animated.View>
        </ScrollView>
      </View>

      <EditTransactionSheet
        id={incomeDetail.id}
        type="income"
        visible={editVisible}
        onClose={() => setEditVisible(false)}
        onDeleted={() => router.replace("/(tabs)/income")}
      />
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function formatTransactionDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatRecordedAt(value: string | null) {
  if (!value) return "-";

  return new Date(value).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backBtn: { padding: 4 },
  editBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { color: COLORS.text, fontSize: 18, fontWeight: "700" },
  scrollContent: { paddingBottom: 40 },
  errorState: { marginHorizontal: 20, marginTop: 24 },
  deviceCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: RADIUS.card,
    backgroundColor: "#FFFFFF",
    ...SHADOW.card,
  },
  deviceImage: { width: 50, height: 80, marginRight: 20 },
  deviceInfo: { flex: 1 },
  deviceName: {
    marginBottom: 4,
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "800",
  },
  devicePhone: { marginBottom: 8, color: COLORS.textMuted, fontSize: 14 },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  statusText: { color: "#FFFFFF", fontSize: 11, fontWeight: "700" },
  transactionCard: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: RADIUS.card,
    backgroundColor: "#FFFFFF",
    ...SHADOW.card,
  },
  transactionHeader: { flexDirection: "row", alignItems: "center" },
  transactionIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: RADIUS.control,
    backgroundColor: COLORS.softGreen,
  },
  transactionHeading: { flex: 1, marginLeft: 12 },
  transactionTitle: { color: COLORS.text, fontSize: 16, fontWeight: "700" },
  transactionType: { marginTop: 2, color: COLORS.textMuted, fontSize: 12 },
  recordedBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: RADIUS.control,
    backgroundColor: COLORS.softGreen,
  },
  recordedBadgeText: { color: COLORS.success, fontSize: 11, fontWeight: "700" },
  amountLabel: { marginTop: 24, color: COLORS.textMuted, fontSize: 12 },
  amountValue: {
    marginTop: 5,
    color: COLORS.success,
    fontSize: 30,
    fontWeight: "800",
  },
  divider: { height: 1, marginVertical: 20, backgroundColor: COLORS.border },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 10,
  },
  detailLabel: {
    width: 92,
    flexShrink: 0,
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  detailValue: {
    flex: 1,
    minWidth: 0,
    flexShrink: 1,
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
    textAlign: "right",
  },
  referenceLabel: { marginTop: 14, color: COLORS.textMuted, fontSize: 12 },
  referenceBox: {
    marginTop: 8,
    padding: 12,
    borderRadius: RADIUS.control,
    backgroundColor: COLORS.background,
  },
  referenceValue: {
    color: COLORS.text,
    fontSize: 12,
    lineHeight: 18,
  },
});
