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

import { Calendar, X } from "lucide-react-native";

import { useAuth } from "../../features/auth/AuthProvider";
import { addIncome, updateIncome } from "../../features/income/api";

import { getDevices } from "../../features/devices/api";

import { COLORS, RADIUS } from "../../theme";
import AppDatePickerModal from "../ui/AppDatePickerModal";
import SheetSaveFooter from "./SheetSaveFooter";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function AddIncomeSheet({ visible, onClose }: Props) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const snapPoints = useMemo(() => ["52%"], []);

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

  const mutation = useMutation({
    mutationFn: addIncome,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tenant", user?.id, "income"],
      });

      queryClient.invalidateQueries({
        queryKey: ["tenant", user?.id, "devices"],
      });

      queryClient.invalidateQueries({
        queryKey: ["tenant", user?.id, "device-detail"],
      });

      Alert.alert("Sukses", "Pemasukan berhasil ditambahkan");

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
          "Perangkat ini sudah memiliki pemasukan pada tanggal yang dipilih. Apakah ingin menimpa data tersebut?",
          [
            {
              text: "Batal",
              style: "cancel",
            },
            {
              text: "Timpa Data",
              onPress: async () => {
                try {
                  await updateIncome({
                    device_id: form.device_id,

                    amount: Number(form.amount),

                    trx_date: formatDate(form.trx_date),
                  });

                  queryClient.invalidateQueries({
                    queryKey: ["tenant", user?.id, "income"],
                  });

                  queryClient.invalidateQueries({
                    queryKey: ["tenant", user?.id, "devices"],
                  });

                  queryClient.invalidateQueries({
                    queryKey: ["tenant", user?.id, "device-detail"],
                  });

                  Alert.alert("Sukses", "Pemasukan berhasil diperbarui");

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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-CA");
  };

  const handleSave = () => {
    if (!form.device_id) {
      Alert.alert("Perhatian", "Pilih perangkat terlebih dahulu");

      return;
    }

    if (!form.amount.trim()) {
      Alert.alert("Perhatian", "Nominal pemasukan wajib diisi");

      return;
    }

    if (!selectedDevice?.is_active) {
      Alert.alert(
        "Perangkat Nonaktif",
        "Perangkat ini tidak dapat menerima pemasukan",
      );

      return;
    }

    mutation.mutate({
      device_id: form.device_id,

      amount: Number(form.amount),

      trx_date: formatDate(form.trx_date),
    });
  };

  const handleSaveRef = useRef(handleSave);
  handleSaveRef.current = handleSave;

  const renderFooter = useCallback(
    (props: BottomSheetFooterProps) => (
      <SheetSaveFooter
        {...props}
        label="Simpan Pendapatan"
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
            <Text style={styles.title}>Tambah Pemasukan</Text>

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

          <Text style={styles.label}>Tanggal Pendapatan</Text>

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

          <Text style={styles.label}>Nominal Pendapatan</Text>

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

      </BottomSheetScrollView>
    </BottomSheet>
    <AppDatePickerModal
      onCancel={() => setShowDatePicker(false)}
      onConfirm={(selectedDate) => {
        setShowDatePicker(false);
        setForm((current) => ({ ...current, trx_date: selectedDate }));
      }}
      title="Tanggal pendapatan"
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

});
