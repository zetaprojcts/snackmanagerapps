import { useQuery } from "@tanstack/react-query";
import { ArrowDownToLine, Wallet } from "lucide-react-native";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { fetchIncomes } from "../../features/income/api";
import { fetchPayments } from "../../features/payment/api";
import { COLORS } from "../../theme";

export default function BalanceScreen() {
  const {
    data: incomes,
    isLoading: loadingIncome,
    refetch: refetchIncome,
    isRefetching: isRefetchingIncome,
  } = useQuery({
    queryKey: ["income"],
    queryFn: fetchIncomes,
  });

  const {
    data: payments,
    isLoading: loadingPayment,
    refetch: refetchPayment,
    isRefetching: isRefetchingPayment,
  } = useQuery({
    queryKey: ["payment"],
    queryFn: fetchPayments,
  });

  const totalIncome =
    incomes?.reduce(
      (total: number, item: any) => total + Number(item.amount),
      0,
    ) || 0;

  const totalGrossPayment =
    payments?.reduce(
      (total: number, item: any) => total + Number(item.gross_amount),
      0,
    ) || 0;

  const totalAdminFee =
    payments?.reduce(
      (total: number, item: any) => total + Number(item.admin_fee),
      0,
    ) || 0;

  const totalNetPayment =
    payments?.reduce(
      (total: number, item: any) => total + Number(item.net_amount),
      0,
    ) || 0;

  const netBalance = totalIncome - totalGrossPayment;

  const recentActivities = useMemo(() => {
    const incomeActivities =
      incomes?.map((item: any) => ({
        type: "income",
        amount: Number(item.amount),
        trx_date: item.trx_date,
        device_name: item.devices?.device_name ?? "Perangkat",
      })) || [];

    const paymentActivities =
      payments?.map((item: any) => ({
        type: "payment",
        amount: Number(item.gross_amount),
        trx_date: item.trx_date,
        device_name: item.devices?.device_name ?? "Perangkat",
      })) || [];

    return [...incomeActivities, ...paymentActivities]
      .sort(
        (a, b) =>
          new Date(b.trx_date).getTime() - new Date(a.trx_date).getTime(),
      )
      .slice(0, 8);
  }, [incomes, payments]);

  const onRefresh = () => {
    refetchIncome();
    refetchPayment();
  };

  const isLoading = loadingIncome || loadingPayment;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefetchingIncome || isRefetchingPayment}
          onRefresh={onRefresh}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Dashboard Saldo</Text>
      </View>

      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>Total Saldo</Text>

        <Text style={styles.heroAmount}>
          Rp {netBalance.toLocaleString("id-ID")}
        </Text>
      </View>

      <View style={styles.cardRow}>
        <View style={styles.statCard}>
          <View style={[styles.iconBox, { backgroundColor: "#D1FAE5" }]}>
            <ArrowDownToLine size={16} color={COLORS.success} />
          </View>

          <Text style={styles.cardLabel}>Pendapatan</Text>

          <Text style={styles.cardValueIncome}>
            + Rp {totalIncome.toLocaleString("id-ID")}
          </Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.iconBox, { backgroundColor: "#ffd0d0" }]}>
            <Wallet size={16} color={COLORS.danger} />
          </View>

          <Text style={styles.cardLabel}>Penarikan</Text>

          <Text style={styles.cardValuePayment}>
            - Rp {totalGrossPayment.toLocaleString("id-ID")}
          </Text>
        </View>
      </View>

      <View style={styles.activitySection}>
        <Text style={styles.sectionTitle}>Aktivitas Terbaru</Text>

        {recentActivities.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Belum Ada Aktivitas</Text>

            <Text style={styles.emptySubtitle}>
              Data transaksi akan muncul di sini
            </Text>
          </View>
        ) : (
          recentActivities.map((item, index) => (
            <View key={`${item.type}-${index}`} style={styles.activityCard}>
              <View
                style={[
                  styles.activityIcon,
                  {
                    backgroundColor:
                      item.type === "income" ? "#D1FAE5" : "#FEF3C7",
                  },
                ]}
              >
                {item.type === "income" ? (
                  <ArrowDownToLine size={18} color={COLORS.success} />
                ) : (
                  <Wallet size={18} color={COLORS.warning} />
                )}
              </View>

              <View style={styles.activityContent}>
                <Text style={styles.activityDevice}>{item.device_name}</Text>

                <Text style={styles.activityDate}>
                  {new Date(item.trx_date).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </Text>
              </View>

              <Text
                style={[
                  styles.activityAmount,
                  {
                    color:
                      item.type === "income" ? COLORS.success : COLORS.warning,
                  },
                ]}
              >
                {item.type === "income" ? "+" : "-"} Rp{" "}
                {item.amount.toLocaleString("id-ID")}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },

  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    marginBottom: 20,
  },

  pageTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.text,
  },

  pageSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: COLORS.textMuted,
  },

  heroCard: {
    marginHorizontal: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    padding: 24,

    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 8,
  },

  heroLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    marginBottom: 6,
  },

  heroAmount: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
  },

  cardRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 16,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },

  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  cardLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 4,
  },

  cardValueIncome: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primary,
  },

  cardValuePayment: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.danger,
  },

  summaryCard: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 16,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  summaryLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
  },

  summaryValue: {
    fontSize: 14,
    fontWeight: "700",
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },

  totalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },

  totalValue: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.primary,
  },

  activitySection: {
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 120,
  },

  activityCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,

    flexDirection: "row",
    alignItems: "center",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },

  activityIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  activityContent: {
    flex: 1,
    marginLeft: 12,
  },

  activityDevice: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
  },

  activityDate: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 3,
  },

  activityAmount: {
    fontSize: 14,
    fontWeight: "700",
  },

  emptyState: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 40,
    alignItems: "center",
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 6,
  },

  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
});
