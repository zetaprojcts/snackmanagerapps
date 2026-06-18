import React, { useMemo, useState } from "react";

import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";

import DateTimePicker from "@react-native-community/datetimepicker";

import { Dropdown } from "react-native-element-dropdown";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useRouter } from "expo-router";

import { Calendar, Save, Wallet, X } from "lucide-react-native";

import { addPayment, updatePayment } from "../../features/payment/api";

import { getDevices } from "../../features/devices/api";

import { COLORS } from "../../theme";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function AddPaymentSheet({ visible, onClose }: Props) {
  const router = useRouter();

  const queryClient = useQueryClient();

  const snapPoints = useMemo(() => ["90%"], []);

  const [showDatePicker, setShowDatePicker] = useState(false);

  const [form, setForm] = useState({
    device_id: "",
    amount: "",
    trx_date: new Date(),
  });

  const { data: devices } = useQuery({
    queryKey: ["devices"],
    queryFn: getDevices,
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
        queryKey: ["payment"],
      });

      queryClient.invalidateQueries({
        queryKey: ["devices"],
      });

      queryClient.invalidateQueries({
        queryKey: ["device-detail"],
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
                    queryKey: ["payment"],
                  });

                  queryClient.invalidateQueries({
                    queryKey: ["devices"],
                  });

                  queryClient.invalidateQueries({
                    queryKey: ["device-detail"],
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
    console.log(selectedDevice);
    console.log(selectedDevice?.ewallet);
    const allowedWallets = [
      "Dana",
      "OVO",
      "GoPay",
      "ShopeePay",
      "DANA",
      "GOPAY",
      "SHOPEEPAY",
    ];

    if (
      !selectedDevice ||
      !allowedWallets.includes(String(selectedDevice.ewallet))
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

  if (!visible) {
    return null;
  }

  return (
    <BottomSheet
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
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
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
      }}
    >
      <KeyboardAvoidingView
        style={{
          flex: 1,
        }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <BottomSheetScrollView
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

          {showDatePicker && (
            <DateTimePicker
              value={form.trx_date}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);

                if (selectedDate) {
                  setForm({
                    ...form,
                    trx_date: selectedDate,
                  });
                }
              }}
            />
          )}

          <Text style={styles.label}>Nominal Penarikan</Text>

          <View style={styles.inputWrapper}>
            <Text style={styles.currency}>Rp</Text>

            <TextInput
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

          <TouchableOpacity
            style={[
              styles.saveBtn,
              mutation.isPending && {
                opacity: 0.7,
              },
            ]}
            onPress={handleSave}
            disabled={mutation.isPending}
          >
            <Save size={18} color="#FFF" />

            <Text style={styles.saveText}>
              {mutation.isPending ? "Menyimpan..." : "Simpan Penarikan"}
            </Text>
          </TouchableOpacity>
        </BottomSheetScrollView>
      </KeyboardAvoidingView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 60,
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
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
  },

  dropdownMenu: {
    borderRadius: 16,
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
    borderRadius: 16,
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
    borderRadius: 16,
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
    borderRadius: 16,
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
    borderRadius: 16,
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

  saveBtn: {
    marginTop: 30,
    height: 56,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },

  saveText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 15,
  },
});
