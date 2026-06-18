import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { ChevronLeft, Save } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Chip } from "../components/ui/Chip";
import { fetchDevices } from "../features/devices/api";
import { addPayment } from "../features/payment/api";
import { COLORS } from "../theme";

export default function AddPayment() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: devices, isLoading: isLoadingDevices } = useQuery({
    queryKey: ["devices"],
    queryFn: fetchDevices,
  });
  const activeDevices = devices?.filter((d) => d.is_active) || [];

  // Cari E-Wallet dari HP yang dipilih untuk menentukan Biaya Admin
  const selectedDevice = activeDevices.find((d) => d.id === selectedDeviceId);
  const selectedWallet = selectedDevice?.ewallet || "Lainnya";

  // Logika Kalkulasi Gaib
  const adminFee = selectedWallet === "ShopeePay" ? 500 : 2500;
  const numericAmount = Number(amount) || 0;
  const netAmount = numericAmount > adminFee ? numericAmount - adminFee : 0;

  const handleSave = async () => {
    if (!selectedDeviceId)
      return Alert.alert("Error", "Pilih perangkat terlebih dahulu!");
    if (!amount || numericAmount <= adminFee)
      return Alert.alert(
        "Error",
        `Nominal harus lebih besar dari biaya admin (Rp ${adminFee})`,
      );

    setLoading(true);
    const today = new Date().toLocaleDateString("en-CA");
    const paymentData = {
      device_id: selectedDeviceId,
      gross_amount: numericAmount,
      admin_fee: adminFee,
      net_amount: netAmount,
      trx_date: today,
    };

    try {
      await addPayment(paymentData);
      Alert.alert("Sukses", "Penarikan berhasil dicatat!");
      queryClient.invalidateQueries({ queryKey: ["payment"] });
      router.back();
    } catch (error: any) {
      Alert.alert("Gagal", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Catat Penarikan</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>Pilih Perangkat (Sumber Dana)</Text>
        {isLoadingDevices ? (
          <ActivityIndicator
            size="small"
            color={COLORS.primary}
            style={{ alignSelf: "flex-start" }}
          />
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.deviceScroll}
            contentContainerStyle={{ gap: 10 }}
          >
            {activeDevices.map((device) => (
              <Chip
                key={device.id}
                label={`${device.device_name} (${device.ewallet})`}
                isActive={selectedDeviceId === device.id}
                onPress={() => setSelectedDeviceId(device.id)}
              />
            ))}
          </ScrollView>
        )}

        <Text style={styles.label}>Nominal Ditarik (Kotor)</Text>
        <View style={styles.inputWrapper}>
          <Text style={styles.currency}>Rp</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            placeholder="0"
            value={amount}
            onChangeText={setAmount}
          />
        </View>

        {selectedDeviceId ? (
          <View style={styles.receipt}>
            <View style={styles.row}>
              <Text style={styles.receiptText}>Penarikan Kotor</Text>
              <Text style={styles.receiptText}>
                Rp {numericAmount.toLocaleString("id-ID")}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.receiptText}>Admin ({selectedWallet})</Text>
              <Text style={[styles.receiptText, { color: COLORS.warning }]}>
                - Rp {adminFee.toLocaleString("id-ID")}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalText}>Nominal Cair</Text>
              <Text style={styles.totalAmount}>
                Rp {netAmount.toLocaleString("id-ID")}
              </Text>
            </View>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.btnSave, loading && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={loading}
        >
          <Save color="#FFF" size={20} style={{ marginRight: 8 }} />
          <Text style={styles.btnText}>
            {loading ? "Memproses..." : "Simpan Penarikan"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // ... (Gunakan style yang persis sama dengan AddIncome, ditambah dengan style receipt dari langkah sebelumnya)
  container: { flex: 1, backgroundColor: COLORS.background, paddingTop: 50 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
  },
  title: { fontSize: 16, fontWeight: "700" },
  content: { padding: 20 },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textMuted,
    marginBottom: 12,
    marginTop: 15,
  },
  deviceScroll: { flexGrow: 0, marginBottom: 15 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  currency: { fontSize: 18, fontWeight: "700", marginRight: 10 },
  input: { flex: 1, paddingVertical: 15, fontSize: 20, fontWeight: "600" },
  receipt: {
    backgroundColor: COLORS.card,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  receiptText: { color: COLORS.textMuted },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10,
    marginTop: 5,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  totalText: { fontWeight: "700" },
  totalAmount: { fontWeight: "700", color: COLORS.primary, fontSize: 16 },
  btnSave: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    padding: 15,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  btnText: { color: "#FFF", fontWeight: "700", fontSize: 16 },
});
