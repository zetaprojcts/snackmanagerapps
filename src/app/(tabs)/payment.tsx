import { useQuery } from "@tanstack/react-query";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { fetchPayments } from "../../features/payment/api";
import { COLORS } from "../../theme";

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
  const [filter, setFilter] = useState<"today" | "month" | "all">("today");

  const {
    data: payments,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["payment"],
    queryFn: fetchPayments,
  });

  const filteredPayments = useMemo(() => {
    if (!payments) return [];

    const now = new Date();

    return payments.filter((item: any) => {
      const trxDate = new Date(item.trx_date);

      if (filter === "today") {
        return (
          trxDate.getDate() === now.getDate() &&
          trxDate.getMonth() === now.getMonth() &&
          trxDate.getFullYear() === now.getFullYear()
        );
      }

      if (filter === "month") {
        return (
          trxDate.getMonth() === now.getMonth() &&
          trxDate.getFullYear() === now.getFullYear()
        );
      }

      return true;
    });
  }, [payments, filter]);

  const totalPayment = filteredPayments.reduce(
    (total: number, item: any) => total + Number(item.gross_amount),
    0,
  );

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const renderItem = ({ item }: any) => {
    const imageSource =
      BRAND_IMAGES[item.devices?.brand || ""] || DEFAULT_IMAGE;

    return (
      <TouchableOpacity activeOpacity={0.85} style={styles.card}>
        <Image
          source={imageSource}
          resizeMode="contain"
          style={styles.deviceImage}
        />

        <View style={styles.cardContent}>
          <Text style={styles.deviceName}>
            {item.devices?.device_name || "Perangkat"}
          </Text>

          <Text style={styles.dateText}>{formatDate(item.trx_date)}</Text>
        </View>

        <Text style={styles.amountText}>
          Rp {Number(item.gross_amount).toLocaleString("id-ID")}
        </Text>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.danger} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Riwayat Penarikan</Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total Penarikan</Text>

        <Text style={styles.summaryValue}>
          Rp {totalPayment.toLocaleString("id-ID")}
        </Text>
      </View>

      <View style={styles.filterTabs}>
        <TouchableOpacity
          style={[styles.filterTab, filter === "today" && styles.activeTab]}
          onPress={() => setFilter("today")}
        >
          <Text
            style={[styles.filterText, filter === "today" && styles.activeText]}
          >
            Hari Ini
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filter === "month" && styles.activeTab]}
          onPress={() => setFilter("month")}
        >
          <Text
            style={[styles.filterText, filter === "month" && styles.activeText]}
          >
            Bulan Ini
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filter === "all" && styles.activeTab]}
          onPress={() => setFilter("all")}
        >
          <Text
            style={[styles.filterText, filter === "all" && styles.activeText]}
          >
            Semua
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredPayments}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshing={isRefetching}
        onRefresh={refetch}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Belum Ada Penarikan</Text>

            <Text style={styles.emptySubtitle}>
              Data penarikan akan muncul di sini
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 60,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.text,
  },

  summaryCard: {
    marginHorizontal: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 20,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },

  summaryLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
  },

  summaryValue: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "800",
    marginTop: 4,
  },

  filterTabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 18,
    marginBottom: 16,
    paddingHorizontal: 20,
  },

  filterTab: {
    paddingBottom: 10,
  },

  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },

  filterText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: "600",
  },

  activeText: {
    color: COLORS.primary,
    fontWeight: "700",
  },

  list: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,

    flexDirection: "row",
    alignItems: "center",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },

  deviceImage: {
    width: 42,
    height: 42,
    marginRight: 12,
  },

  cardContent: {
    flex: 1,
  },

  deviceName: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
  },

  dateText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 3,
  },

  amountText: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.danger,
  },

  emptyContainer: {
    alignItems: "center",
    marginTop: 80,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  emptySubtitle: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
});
