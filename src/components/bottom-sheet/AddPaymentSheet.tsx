import React, { useCallback, useMemo, useRef, useState } from "react";

import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetTextInput,
  type BottomSheetFooterProps,
} from "@gorhom/bottom-sheet";


import { Dropdown } from "react-native-element-dropdown";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useRouter } from "expo-router";

import { Calendar, Wallet, X } from "lucide-react-native";

import { useAuth } from "../../features/auth/AuthProvider";
import { addPayment, updatePayment } from "../../features/payment/api";

import { getDevices } from "../../features/devices/api";

import { COLORS, RADIUS } from "../../theme";
import AppDatePickerModal from "../ui/AppDatePickerModal";
import SheetSaveFooter from "./SheetSaveFooter";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function AddPaymentSheet({ visible, onClose }: Props) {
  const router = useRouter();

  const queryClient = useQueryClient();
  const { user } = useAuth();

  const snapPoints = useMemo(() => ["78%"], []);

  const [showDatePicker, setShowDatePicker] = useState(false);

  const [form, setForm] = useState({
    device_id: "",
    amount: "",
    trx_date: new Date(),
  });

  const { data: devices } = useQuery({
    queryKey: ["tenant", user?.id, "devices", "options"],
    queryFn: getDevices,
    enabled: Boolean(user),
  });

  const activeDevices = devices?.filter((item) => item.is_active) || [];

  const deviceOptions = activeDevices.map((device) => ({
    label: device.device_name,
    value: device.id,
  }));

  const selectedDevice = activeDevices.find(
    (item) => item.id === form.device_id,
  );

  const selectedWallet = selectedDevice?.ewallet || "-";

  const numericAmount = Number(form.amount) || 0;

  const getAdminFee = () => {
    switch (selectedWallet) {
      case "ShopeePay":
        return 750;

      case "Dana":
        return 2500;

      case "OVO":
        return 2500;

      case "GoPay":
        return 2500;

      default:
        return 0;
    }
  };

  const adminFee = getAdminFee();

  const netAmount = numericAmount > adminFee ? numericAmount - adminFee : 0;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-CA");
  };

  const mutation = useMutation({
    mutationFn: addPayment,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tenant", user?.id, "payment"],
      });

      queryClient.invalidateQueries({
        queryKey: ["tenant", user?.id, "devices"],
      });

      queryClient.invalidateQueries({
        queryKey: ["tenant", user?.id, "device-detail"],
      });

      Alert.alert("Sukses", "Penarikan berhasil ditambahkan");

      setForm({
        device_id: "",
        amount: "",
        trx_date: new Date(),
      });

      onClose();
    },

    onError: async (error: any) => {
      if (error.message === "DUPLICATE_DATE") {
        Alert.alert(
          "Data Sudah Ada",
          "Perangkat ini sudah memiliki penarikan pada tanggal yang dipilih. Apakah ingin menimpa data tersebut?",
          [
            {
              text: "Batal",
              style: "cancel",
            },
            {
              text: "Timpa Data",
              onPress: async () => {
                try {
                  await updatePayment({
                    device_id: form.device_id,

                    gross_amount: numericAmount,

                    admin_fee: adminFee,

                    net_amount: netAmount,

                    trx_date: formatDate(form.trx_date),
                  });

                  queryClient.invalidateQueries({
                    queryKey: ["tenant", user?.id, "payment"],
                  });

                  queryClient.invalidateQueries({
                    queryKey: ["tenant", user?.id, "devices"],
                  });

                  queryClient.invalidateQueries({
                    queryKey: ["tenant", user?.id, "device-detail"],
                  });

                  Alert.alert("Sukses", "Data penarikan berhasil diperbarui");

                  setForm({
                    device_id: "",
                    amount: "",
                    trx_date: new Date(),
                  });

                  onClose();
                } catch (err: any) {
                  Alert.alert("Gagal", err.message);
                }
              },
            },
          ],
        );

        return;
      }

      Alert.alert("Gagal", error.message);
    },
  });

  const handleSave = () => {
    if (!form.device_id) {
      Alert.alert("Perhatian", "Pilih perangkat terlebih dahulu");

      return;
    }

    const walletValue = String(selectedDevice?.ewallet ?? "").trim();

    if (
      walletValue === "" ||
      walletValue === "-" ||
      walletValue.toLowerCase() === "null"
    ) {
      Alert.alert(
        "Perangkat Belum Siap",
        "Device ini belum bisa melakukan penarikan. Silahkan lengkapi data perangkat terlebih dahulu.",
        [
          {
            text: "Kembali",
            style: "cancel",
          },
          {
            text: "Edit Data Perangkat",
            onPress: () => {
              onClose();

              setTimeout(() => {
                router.push({
                  pathname: "/edit-device",
                  params: {
                    id: selectedDevice?.id,
                  },
                });
              }, 300);
            },
          },
        ],
      );

      return;
    }

    if (!form.amount.trim()) {
      Alert.alert("Perhatian", "Nominal penarikan wajib diisi");

      return;
    }

    if (numericAmount <= adminFee) {
      Alert.alert(
        "Perhatian",
        `Nominal harus lebih besar dari biaya admin Rp ${adminFee.toLocaleString(
          "id-ID",
        )}`,
      );

      return;
    }

    mutation.mutate({
      device_id: form.device_id,

      gross_amount: numericAmount,

      admin_fee: adminFee,

      net_amount: netAmount,

      trx_date: formatDate(form.trx_date),
    });
  };

  const handleSaveRef = useRef(handleSave);
  handleSaveRef.current = handleSave;

  const renderFooter = useCallback(
    (props: BottomSheetFooterProps) => (
      <SheetSaveFooter
        {...props}
        label="Simpan Penarikan"
        pending={mutation.isPending}
        onPress={() => handleSaveRef.current()}
      />
    ),
    [mutation.isPending],
  );

  if (!visible) {
    return null;
  }

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
      handleIndicatorStyle={{
        backgroundColor: "#CBD5E1",
        width: 48,
        height: 5,
      }}
      backgroundStyle={{
        borderTopLeftRadius: RADIUS.sheet,
        borderTopRightRadius: RADIUS.sheet,
      }}
    >
      <BottomSheetScrollView
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
      >
          <View style={styles.header}>
            <Text style={styles.title}>Tambah Penarikan</Text>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
          <Text style={styles.label}>Pilih Perangkat</Text>

          <Dropdown
            style={styles.dropdown}
            containerStyle={styles.dropdownMenu}
            placeholderStyle={styles.dropdownText}
            selectedTextStyle={styles.dropdownText}
            data={deviceOptions}
            labelField="label"
            valueField="value"
            value={form.device_id}
            placeholder="Pilih perangkat"
            onChange={(item) =>
              setForm({
                ...form,
                device_id: item.value,
              })
            }
          />

          <Text style={styles.label}>E-Wallet</Text>

          <View style={styles.disabledInput}>
            <Wallet size={18} color={COLORS.primary} />

            <Text style={styles.disabledInputText}>{selectedWallet}</Text>
          </View>

          <Text style={styles.label}>Tanggal Penarikan</Text>

          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Calendar size={18} color={COLORS.primary} />

            <Text style={styles.dateText}>
              {form.trx_date.toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </Text>
          </TouchableOpacity>

          <Text style={styles.label}>Nominal Penarikan</Text>

          <View style={styles.inputWrapper}>
            <Text style={styles.currency}>Rp</Text>

            <BottomSheetTextInput
              style={styles.input}
              keyboardType="number-pad"
              placeholder="0"
              value={form.amount}
              onChangeText={(text) =>
                setForm({
                  ...form,
                  amount: text,
                })
              }
            />
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Penarikan</Text>

              <Text style={styles.summaryValue}>
                Rp {numericAmount.toLocaleString("id-ID")}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Biaya Admin</Text>

              <Text
                style={[
                  styles.summaryValue,
                  {
                    color: COLORS.danger,
                  },
                ]}
              >
                - Rp {adminFee.toLocaleString("id-ID")}
              </Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>

              <Text style={styles.totalValue}>
                Rp {netAmount.toLocaleString("id-ID")}
              </Text>
            </View>
          </View>

      </BottomSheetScrollView>
    </BottomSheet>
    <AppDatePickerModal
      onCancel={() => setShowDatePicker(false)}
      onConfirm={(selectedDate) => {
        setShowDatePicker(false);
        setForm((current) => ({ ...current, trx_date: selectedDate }));
      }}
      title="Tanggal penarikan"
      value={form.trx_date}
      visible={showDatePicker}
    />
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 128,
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
    borderRadius: RADIUS.full,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textMuted,
    marginBottom: 8,
    marginTop: 12,
  },

  dropdown: {
    height: 56,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.control,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
  },

  dropdownMenu: {
    borderRadius: RADIUS.card,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  dropdownText: {
    fontSize: 15,
    color: COLORS.text,
  },

  disabledInput: {
    height: 56,
    borderRadius: RADIUS.control,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  disabledInputText: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: "500",
  },

  dateButton: {
    height: 56,
    borderRadius: RADIUS.control,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  dateText: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: "500",
  },

  inputWrapper: {
    height: 56,
    borderRadius: RADIUS.control,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },

  currency: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginRight: 10,
  },

  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "600",
  },

  summaryCard: {
    marginTop: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.card,
    padding: 16,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  summaryLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
  },

  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },

  summaryDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },

  totalLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
  },

  totalValue: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primary,
  },

});
