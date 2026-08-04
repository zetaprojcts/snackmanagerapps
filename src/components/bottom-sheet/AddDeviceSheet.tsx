import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Alert,
  StyleSheet,
  Switch,
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

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { X } from "lucide-react-native";

import { useAuth } from "../../features/auth/AuthProvider";
import { addDevice } from "../../features/devices/api";

import { COLORS, RADIUS } from "../../theme";
import SheetSaveFooter from "./SheetSaveFooter";

const BRAND_OPTIONS = [
  {
    label: "SAMSUNG",
    value: "Samsung",
  },
  {
    label: "OPPO",
    value: "Oppo",
  },
  {
    label: "VIVO",
    value: "Vivo",
  },
  {
    label: "XIAOMI",
    value: "Xiaomi",
  },
  {
    label: "REALME",
    value: "Realme",
  },
  {
    label: "INFINIX",
    value: "Infinix",
  },
];

const EWALLET_OPTIONS = [
  {
    label: "-",
    value: "-",
  },
  {
    label: "DANA",
    value: "Dana",
  },
  {
    label: "OVO",
    value: "OVO",
  },
  {
    label: "GOPAY",
    value: "GoPay",
  },
  {
    label: "SHOPEEPAY",
    value: "ShopeePay",
  },
];

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function AddDeviceSheet({ visible, onClose }: Props) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const snapPoints = useMemo(() => ["86%"], []);

  const [form, setForm] = useState({
    brand: "Samsung",
    device_name: "",
    phone_number: "",
    email: "",
    ewallet: "-",
    is_active: true,
  });

  const mutation = useMutation({
    mutationFn: addDevice,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tenant", user?.id, "devices"],
      });

      Alert.alert("Sukses", "Perangkat berhasil ditambahkan");

      setForm({
        brand: "Samsung",
        device_name: "",
        phone_number: "",
        email: "",
        ewallet: "-",
        is_active: true,
      });

      onClose();
    },

    onError: (error: any) => {
      Alert.alert("Gagal", error.message);
    },
  });

  const handleSave = () => {
    if (!form.device_name.trim()) {
      Alert.alert("Perhatian", "Nama perangkat wajib diisi");
      return;
    }

    mutation.mutate({
      brand: form.brand,

      device_name: form.device_name,

      phone_number: form.phone_number,

      email: form.email,

      ewallet: form.ewallet === "-" ? null : form.ewallet,

      is_active: form.is_active,
    });
  };

  const handleSaveRef = useRef(handleSave);
  handleSaveRef.current = handleSave;

  const renderFooter = useCallback(
    (props: BottomSheetFooterProps) => (
      <SheetSaveFooter
        {...props}
        label="Simpan Perangkat"
        pending={mutation.isPending}
        onPress={() => handleSaveRef.current()}
      />
    ),
    [mutation.isPending],
  );

  if (!visible) return null;

  return (
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
            <Text style={styles.title}>Tambah Perangkat</Text>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={styles.statusCard}>
            <View>
              <Text style={styles.statusTitle}>Status Perangkat</Text>

              <Text
                style={[
                  styles.statusText,
                  {
                    color: form.is_active ? COLORS.success : COLORS.danger,
                  },
                ]}
              >
                {form.is_active ? "Aktif" : "Nonaktif"}
              </Text>
            </View>

            <Switch
              value={form.is_active}
              onValueChange={(value) =>
                setForm({
                  ...form,
                  is_active: value,
                })
              }
            />
          </View>
          <Text style={styles.label}>Nama Brand</Text>

          <Dropdown
            style={styles.dropdown}
            containerStyle={styles.dropdownMenu}
            placeholderStyle={styles.dropdownText}
            selectedTextStyle={styles.dropdownText}
            data={BRAND_OPTIONS}
            labelField="label"
            valueField="value"
            value={form.brand}
            mode="modal"
            maxHeight={250}
            inverted={false}
            onChange={(item) =>
              setForm({
                ...form,
                brand: item.value,
              })
            }
          />

          <Text style={styles.label}>Tipe Perangkat</Text>

          <BottomSheetTextInput
            placeholder="Masukkan nama perangkat"
            style={styles.input}
            value={form.device_name}
            onChangeText={(text) =>
              setForm({
                ...form,
                device_name: text,
              })
            }
          />

          <Text style={styles.label}>Nomor Telepon</Text>

          <BottomSheetTextInput
            style={styles.input}
            keyboardType="phone-pad"
            value={form.phone_number}
            onChangeText={(text) =>
              setForm({
                ...form,
                phone_number: text,
              })
            }
          />

          <Text style={styles.label}>Email</Text>

          <BottomSheetTextInput
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            value={form.email}
            onChangeText={(text) =>
              setForm({
                ...form,
                email: text,
              })
            }
          />

          <Text style={styles.label}>E-Wallet</Text>

          <Dropdown
            style={styles.dropdown}
            containerStyle={styles.dropdownMenu}
            placeholderStyle={styles.dropdownText}
            selectedTextStyle={styles.dropdownText}
            data={EWALLET_OPTIONS}
            labelField="label"
            valueField="value"
            value={form.ewallet}
            onChange={(item) =>
              setForm({
                ...form,
                ewallet: item.value,
              })
            }
          />

      </BottomSheetScrollView>
    </BottomSheet>
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

  statusCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.card,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  statusTitle: {
    fontWeight: "700",
    fontSize: 15,
    color: COLORS.text,
  },

  statusText: {
    marginTop: 4,
    fontWeight: "600",
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textMuted,
    marginBottom: 8,
    marginTop: 12,
  },

  input: {
    height: 56,
    borderRadius: RADIUS.control,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    color: COLORS.text,
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

});
