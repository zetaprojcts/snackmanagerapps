<<<<<<< HEAD
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, X } from "lucide-react-native";
import React, { useMemo, useState } from "react";
=======
Import React, { useMemo, useState } from "react";
>>>>>>> e05fa530eaca0801a5fcb00887dc993f011be475
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
<<<<<<< HEAD
import { Dropdown } from "react-native-element-dropdown";
=======

import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";

import { Dropdown } from "react-native-element-dropdown";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Save, X } from "lucide-react-native";

>>>>>>> e05fa530eaca0801a5fcb00887dc993f011be475
import { addDevice } from "../../features/devices/api";

import { COLORS } from "../../theme";

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

  const snapPoints = useMemo(() => ["90%"], []);

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
        queryKey: ["devices"],
      });

      Alert.alert("Sukses", "Perangkat berhasil ditambahkan");
<<<<<<< HEAD
=======

>>>>>>> e05fa530eaca0801a5fcb00887dc993f011be475
      setForm({
        brand: "Samsung",
        device_name: "",
        phone_number: "",
        email: "",
        ewallet: "-",
        is_active: true,
      });
<<<<<<< HEAD
=======

>>>>>>> e05fa530eaca0801a5fcb00887dc993f011be475
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

  if (!visible) return null;

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
<<<<<<< HEAD
      handleIndicatorStyle={{ backgroundColor: "#CBD5E1", width: 48 }}
      backgroundStyle={{ borderTopLeftRadius: 32, borderTopRightRadius: 32 }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
=======
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
>>>>>>> e05fa530eaca0801a5fcb00887dc993f011be475
      >
        <BottomSheetScrollView
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
<<<<<<< HEAD
              <Text
                style={[
                  styles.statusText,
                  { color: form.is_active ? COLORS.success : COLORS.danger },
=======

              <Text
                style={[
                  styles.statusText,
                  {
                    color: form.is_active ? COLORS.success : COLORS.danger,
                  },
>>>>>>> e05fa530eaca0801a5fcb00887dc993f011be475
                ]}
              >
                {form.is_active ? "Aktif" : "Nonaktif"}
              </Text>
            </View>
<<<<<<< HEAD
            <Switch
              value={form.is_active}
              onValueChange={(val) => setForm({ ...form, is_active: val })}
            />
          </View>
=======
>>>>>>> e05fa530eaca0801a5fcb00887dc993f011be475

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

          <TextInput
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
<<<<<<< HEAD
=======

>>>>>>> e05fa530eaca0801a5fcb00887dc993f011be475
          <TextInput
            style={styles.input}
            keyboardType="phone-pad"
            value={form.phone_number}
<<<<<<< HEAD
            onChangeText={(text) => setForm({ ...form, phone_number: text })}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            keyboardType="email-address"
            value={form.email}
            onChangeText={(text) => setForm({ ...form, email: text })}
=======
            onChangeText={(text) =>
              setForm({
                ...form,
                phone_number: text,
              })
            }
          />

          <Text style={styles.label}>Email</Text>

          <TextInput
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
>>>>>>> e05fa530eaca0801a5fcb00887dc993f011be475
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

          <TouchableOpacity
            style={styles.saveBtn}
<<<<<<< HEAD
            onPress={() =>
              mutation.mutate({
                ...form,
                ewallet: form.ewallet === "-" ? null : form.ewallet,
              })
            }
            disabled={mutation.isPending}
          >
            <Save size={18} color="#FFF" />
=======
            onPress={handleSave}
            disabled={mutation.isPending}
          >
            <Save size={18} color="#FFF" />

>>>>>>> e05fa530eaca0801a5fcb00887dc993f011be475
            <Text style={styles.saveText}>
              {mutation.isPending ? "Menyimpan..." : "Simpan Perangkat"}
            </Text>
          </TouchableOpacity>
        </BottomSheetScrollView>
      </KeyboardAvoidingView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
<<<<<<< HEAD
  content: { padding: 20, paddingBottom: 100 },
=======
  content: {
    padding: 20,
    paddingBottom: 60,
  },

>>>>>>> e05fa530eaca0801a5fcb00887dc993f011be475
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
<<<<<<< HEAD
  title: { fontSize: 20, fontWeight: "800", color: COLORS.text },
=======

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
  },

>>>>>>> e05fa530eaca0801a5fcb00887dc993f011be475
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
<<<<<<< HEAD
    backgroundColor: "#F1F5F9",
  },
  statusCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 20,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statusTitle: { fontWeight: "700", fontSize: 14, color: COLORS.text },
  statusText: { marginTop: 4, fontWeight: "600", fontSize: 12 },
=======
    backgroundColor: COLORS.background,
  },

  statusCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
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

>>>>>>> e05fa530eaca0801a5fcb00887dc993f011be475
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textMuted,
    marginBottom: 8,
<<<<<<< HEAD
    marginTop: 16,
  },
=======
    marginTop: 12,
  },

>>>>>>> e05fa530eaca0801a5fcb00887dc993f011be475
  input: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
<<<<<<< HEAD
    borderColor: "#E2E8F0",
=======
    borderColor: COLORS.border,
>>>>>>> e05fa530eaca0801a5fcb00887dc993f011be475
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    color: COLORS.text,
  },
<<<<<<< HEAD
  dropdown: {
    height: 56,
    borderWidth: 1,
    borderColor: "#E2E8F0",
=======

  dropdown: {
    height: 56,
    borderWidth: 1,
    borderColor: COLORS.border,
>>>>>>> e05fa530eaca0801a5fcb00887dc993f011be475
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
  },
<<<<<<< HEAD
  dropdownText: { fontSize: 15, color: COLORS.text },
  saveBtn: {
    marginTop: 32,
=======

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

  saveBtn: {
    marginTop: 30,
>>>>>>> e05fa530eaca0801a5fcb00887dc993f011be475
    height: 56,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
<<<<<<< HEAD
  saveText: { color: "#FFF", fontWeight: "700", fontSize: 15 },
=======

  saveText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 15,
  },
>>>>>>> e05fa530eaca0801a5fcb00887dc993f011be475
});
