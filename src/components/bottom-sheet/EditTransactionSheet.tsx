import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, X } from "lucide-react-native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetTextInput,
  type BottomSheetFooterProps,
} from "@gorhom/bottom-sheet";

import { useAuth } from "../../features/auth/AuthProvider";
import {
  deleteIncomeById,
  getIncomeById,
  updateIncomeById,
} from "../../features/income/api";
import {
  deletePaymentById,
  getPaymentById,
  updatePaymentById,
} from "../../features/payment/api";
import { formatLocalDate } from "../../features/transactions/history";
import { COLORS, RADIUS } from "../../theme";
import AppDatePickerModal from "../ui/AppDatePickerModal";
import SheetSaveFooter from "./SheetSaveFooter";

type TransactionType = "income" | "payment";

type Props = {
  id: string;
  onClose: () => void;
  onDeleted: () => void;
  type: TransactionType;
  visible: boolean;
};

export default function EditTransactionSheet({
  id,
  onClose,
  onDeleted,
  type,
  visible,
}: Props) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const snapPoints = useMemo(
    () => [type === "payment" ? "64%" : "52%"],
    [type],
  );
  const [amount, setAmount] = useState("");
  const [transactionDate, setTransactionDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { data: transaction } = useQuery({
    queryKey: ["tenant", user?.id, `${type}-detail`, id],
    queryFn: () =>
      type === "income" ? getIncomeById(id) : getPaymentById(id),
    enabled: Boolean(visible && user && id),
  });

  useEffect(() => {
    if (!visible || !transaction) return;

    setAmount(
      String(
        "amount" in transaction
          ? transaction.amount
          : transaction.gross_amount,
      ),
    );
    setTransactionDate(new Date(`${transaction.trx_date}T00:00:00`));
  }, [transaction, visible]);

  const device = transaction?.devices;
  const numericAmount = Number(amount);
  const storedAdminFee =
    transaction && "admin_fee" in transaction
      ? Number(transaction.admin_fee)
      : 0;
  const adminFee =
    type === "payment" ? getAdminFee(device?.ewallet, storedAdminFee) : 0;
  const netAmount = Math.max(numericAmount - adminFee, 0);

  const invalidateTransactionQueries = async () => {
    if (!user) return;

    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["tenant", user.id, type],
      }),
      queryClient.invalidateQueries({
        queryKey: ["tenant", user.id, "devices"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["tenant", user.id, "device-detail"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["tenant", user.id, "balance"],
      }),
    ]);
  };

  const updateMutation = useMutation({
    mutationFn: async () => {
      const trxDate = formatLocalDate(transactionDate);

      if (type === "income") {
        return updateIncomeById(id, {
          amount: numericAmount,
          trx_date: trxDate,
        });
      }

      return updatePaymentById(id, {
        gross_amount: numericAmount,
        admin_fee: adminFee,
        net_amount: netAmount,
        trx_date: trxDate,
      });
    },
    onSuccess: async () => {
      await invalidateTransactionQueries();
      onClose();
      Alert.alert("Berhasil", "Transaksi berhasil diperbarui.");
    },
    onError: (error) => {
      if (error.message === "DUPLICATE_DATE") {
        Alert.alert(
          "Tanggal sudah digunakan",
          "Perangkat ini sudah memiliki transaksi pada tanggal tersebut.",
        );
        return;
      }

      Alert.alert("Gagal memperbarui", error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () =>
      type === "income" ? deleteIncomeById(id) : deletePaymentById(id),
    onSuccess: async () => {
      await invalidateTransactionQueries();
      onClose();
      Alert.alert(
        "Transaksi dihapus",
        "Data transaksi telah dihapus dan saldo sudah diperbarui.",
        [{ text: "OK", onPress: onDeleted }],
      );
    },
    onError: (error) => Alert.alert("Gagal menghapus", error.message),
  });

  const handleSave = () => {
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      Alert.alert("Nominal tidak valid", "Masukkan nominal lebih dari nol.");
      return;
    }

    if (type === "payment" && numericAmount <= adminFee) {
      Alert.alert(
        "Nominal tidak valid",
        `Nominal harus lebih besar dari biaya admin Rp ${adminFee.toLocaleString("id-ID")}.`,
      );
      return;
    }

    updateMutation.mutate();
  };

  const confirmDelete = () => {
    Alert.alert(
      "Hapus transaksi?",
      "Transaksi akan dihapus permanen dan memengaruhi saldo perangkat. Apakah Anda benar-benar yakin?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: () => deleteMutation.mutate(),
        },
      ],
    );
  };

  const handleSaveRef = useRef(handleSave);
  const confirmDeleteRef = useRef(confirmDelete);
  handleSaveRef.current = handleSave;
  confirmDeleteRef.current = confirmDelete;

  const renderFooter = useCallback(
    (props: BottomSheetFooterProps) => (
      <SheetSaveFooter
        {...props}
        deleteLabel="Hapus transaksi"
        deletePending={deleteMutation.isPending}
        label="Simpan Perubahan"
        pending={updateMutation.isPending}
        onDelete={() => confirmDeleteRef.current()}
        onPress={() => handleSaveRef.current()}
      />
    ),
    [deleteMutation.isPending, updateMutation.isPending],
  );

  if (!visible) return null;

  const isPending = updateMutation.isPending || deleteMutation.isPending;

  return (
    <>
      <BottomSheet
        index={0}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        enablePanDownToClose
        enableBlurKeyboardOnGesture
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustPan"
        onClose={onClose}
        footerComponent={renderFooter}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            opacity={0.5}
          />
        )}
        handleIndicatorStyle={styles.handleIndicator}
        backgroundStyle={styles.sheetBackground}
      >
        <BottomSheetScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>
                Edit {type === "income" ? "Pendapatan" : "Penarikan"}
              </Text>
              <Text style={styles.subtitle}>{device?.device_name || "-"}</Text>
            </View>
            <TouchableOpacity
              accessibilityLabel="Tutup editor transaksi"
              accessibilityRole="button"
              disabled={isPending}
              onPress={onClose}
              style={styles.closeButton}
            >
              <X size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Nominal</Text>
          <BottomSheetTextInput
            value={amount}
            onChangeText={setAmount}
            editable={!isPending}
            keyboardType="numeric"
            placeholder="Masukkan nominal"
            placeholderTextColor={COLORS.textMuted}
            style={styles.input}
          />

          <Text style={styles.label}>Tanggal transaksi</Text>
          <TouchableOpacity
            accessibilityLabel="Pilih tanggal transaksi"
            accessibilityRole="button"
            disabled={isPending}
            onPress={() => setShowDatePicker(true)}
            style={styles.dateInput}
          >
            <Text style={styles.dateText}>
              {transactionDate.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </Text>
            <Calendar size={19} color={COLORS.primary} />
          </TouchableOpacity>

          {type === "payment" ? (
            <View style={styles.breakdown}>
              <SummaryRow label="Biaya admin" value={adminFee} />
              <SummaryRow emphasized label="Dana diterima" value={netAmount} />
            </View>
          ) : null}
        </BottomSheetScrollView>
      </BottomSheet>

      <AppDatePickerModal
        onCancel={() => setShowDatePicker(false)}
        onConfirm={(selectedDate) => {
          setShowDatePicker(false);
          setTransactionDate(selectedDate);
        }}
        title="Tanggal transaksi"
        value={transactionDate}
        visible={showDatePicker}
      />
    </>
  );
}

function SummaryRow({
  emphasized = false,
  label,
  value,
}: {
  emphasized?: boolean;
  label: string;
  value: number;
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, emphasized && styles.summaryEmphasis]}>
        {label}
      </Text>
      <Text style={[styles.summaryValue, emphasized && styles.summaryEmphasis]}>
        Rp {value.toLocaleString("id-ID")}
      </Text>
    </View>
  );
}

function getAdminFee(wallet: string | null | undefined, fallback: number) {
  switch (wallet) {
    case "ShopeePay":
      return 750;
    case "Dana":
    case "OVO":
    case "GoPay":
      return 2500;
    default:
      return fallback;
  }
}

const styles = StyleSheet.create({
  sheetBackground: {
    borderTopLeftRadius: RADIUS.sheet,
    borderTopRightRadius: RADIUS.sheet,
  },
  handleIndicator: {
    width: 48,
    height: 5,
    borderRadius: RADIUS.full,
    backgroundColor: "#CBD5E1",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 150,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  title: { color: COLORS.text, fontSize: 20, fontWeight: "800" },
  subtitle: { marginTop: 3, color: COLORS.textMuted, fontSize: 13 },
  closeButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.background,
  },
  label: {
    marginTop: 16,
    marginBottom: 8,
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  input: {
    height: 54,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.control,
    color: COLORS.text,
    backgroundColor: "#FFFFFF",
    fontSize: 15,
  },
  dateInput: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.control,
    backgroundColor: "#FFFFFF",
  },
  dateText: { color: COLORS.text, fontSize: 14, fontWeight: "500" },
  breakdown: {
    gap: 12,
    marginTop: 18,
    padding: 14,
    borderRadius: RADIUS.control,
    backgroundColor: COLORS.background,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 20,
  },
  summaryLabel: { color: COLORS.textMuted, fontSize: 13 },
  summaryValue: { color: COLORS.text, fontSize: 13, fontWeight: "600" },
  summaryEmphasis: { color: COLORS.text, fontWeight: "800" },
});
