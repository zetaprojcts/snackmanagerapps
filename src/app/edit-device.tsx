import React, { useEffect, useState } from "react";

import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useLocalSearchParams, useRouter } from "expo-router";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ChevronLeft, Save } from "lucide-react-native";

import { Dropdown } from "react-native-element-dropdown";

import { DeviceCardSkeleton } from "../components/ui/Skeleton";

import { getDeviceById, updateDevice } from "../features/devices/api";

import { COLORS, SHADOW } from "../theme";

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

export default function EditDevice() {
  const { id } = useLocalSearchParams();

  const router = useRouter();

  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    brand: "Samsung",
    device_name: "",
    phone_number: "",
    email: "",
    ewallet: "-",
    is_active: true,
  });

  const { data: currentDevice, isLoading } = useQuery({
    queryKey: ["device", id],
    queryFn: () => getDeviceById(id as string),
  });

  useEffect(() => {
    if (!currentDevice) {
      return;
    }

    setForm({
      brand: currentDevice.brand || "Samsung",

      device_name: currentDevice.device_name || "",

      phone_number: currentDevice.phone_number || "",

      email: currentDevice.email || "",

      ewallet: currentDevice.ewallet || "-",

      is_active: currentDevice.is_active ?? true,
    });
  }, [currentDevice]);

  const mutation = useMutation({
    mutationFn: (data: any) => updateDevice(id as string, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["devices"],
      });

      queryClient.invalidateQueries({
        queryKey: ["device", id],
      });

      queryClient.invalidateQueries({
        queryKey: ["device-detail", id],
      });

      Alert.alert("Sukses", "Perangkat berhasil diperbarui");

      router.back();
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

  if (isLoading) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <DeviceCardSkeleton />
          <DeviceCardSkeleton />
          <DeviceCardSkeleton />
        </View>
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={24} color={COLORS.text} />
          </TouchableOpacity>

          <Text style={styles.title}>Edit Perangkat</Text>

          <View
            style={{
              width: 24,
            }}
          />
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

        <View style={styles.formCard}>
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

          <TextInput
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
        </View>

        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          disabled={mutation.isPending}
        >
          <Save size={18} color="#FFFFFF" />

          <Text style={styles.saveText}>
            {mutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 55,
  },

  content: {
    padding: 20,
    paddingBottom: 120,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  title: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.text,
  },

  statusCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    ...SHADOW.card,
  },

  statusTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
  },

  statusText: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "700",
  },

  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    ...SHADOW.card,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textMuted,
    marginBottom: 8,
    marginTop: 14,
  },

  input: {
    height: 56,
    borderRadius: 16,
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

  saveBtn: {
    height: 56,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    marginTop: 24,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    gap: 10,

    ...SHADOW.card,
  },

  saveText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
