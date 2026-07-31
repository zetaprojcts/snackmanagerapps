import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { supabase } from "../lib/supabase";

type AuthMode = "login" | "register";

export default function LoginScreen() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");
  const [loading, setLoading] = useState(false);

  const isRegister = mode === "register";

  const resetPasswordFields = () => {
    setPassword("");
    setConfirmPassword("");
  };

  const changeMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    resetPasswordFields();
  };

  const handleLogin = async () => {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      Alert.alert(
        "Data belum lengkap",
        "Masukkan email dan password.",
      );
      return;
    }

    try {
      setLoading(true);

      const { error } =
        await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

      if (error) {
        Alert.alert("Login gagal", error.message);
      }
    } catch (error) {
      Alert.alert(
        "Login gagal",
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat login.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (
      !cleanName ||
      !cleanEmail ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert(
        "Data belum lengkap",
        "Lengkapi nama, email, password, dan konfirmasi password.",
      );
      return;
    }

    if (password.length < 8) {
      Alert.alert(
        "Password terlalu pendek",
        "Gunakan minimal 8 karakter.",
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        "Password tidak sama",
        "Konfirmasi password harus sama dengan password.",
      );
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanName,
          },
        },
      });

      if (error) {
        Alert.alert("Pendaftaran gagal", error.message);
        return;
      }

      if (data.session) {
        Alert.alert(
          "Pendaftaran berhasil",
          "Akun berhasil dibuat dan Anda sudah masuk.",
        );
        return;
      }

      Alert.alert(
        "Pendaftaran berhasil",
        "Silakan periksa email untuk mengonfirmasi akun, kemudian masuk.",
      );

      changeMode("login");
    } catch (error) {
      Alert.alert(
        "Pendaftaran gagal",
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat membuat akun.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (isRegister) {
      void handleRegister();
    } else {
      void handleLogin();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === "ios" ? "padding" : undefined
      }
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.title}>Snack Manager</Text>

          <Text style={styles.subtitle}>
            Kelola perangkat dan transaksi dengan akun
            Anda sendiri
          </Text>

          <View style={styles.tabContainer}>
            <Pressable
              onPress={() => changeMode("login")}
              disabled={loading}
              style={[
                styles.tab,
                mode === "login" && styles.activeTab,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  mode === "login" &&
                    styles.activeTabText,
                ]}
              >
                Masuk
              </Text>
            </Pressable>

            <Pressable
              onPress={() => changeMode("register")}
              disabled={loading}
              style={[
                styles.tab,
                mode === "register" && styles.activeTab,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  mode === "register" &&
                    styles.activeTabText,
                ]}
              >
                Daftar
              </Text>
            </Pressable>
          </View>

          {isRegister && (
            <>
              <Text style={styles.label}>Nama lengkap</Text>

              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="Masukkan nama lengkap"
                autoCapitalize="words"
                editable={!loading}
                style={styles.input}
              />
            </>
          )}

          <Text style={styles.label}>Email</Text>

          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="nama@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
            style={styles.input}
          />

          <Text style={styles.label}>Password</Text>

          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder={
              isRegister
                ? "Minimal 8 karakter"
                : "Masukkan password"
            }
            secureTextEntry
            autoCapitalize="none"
            editable={!loading}
            style={styles.input}
          />

          {isRegister && (
            <>
              <Text style={styles.label}>
                Konfirmasi password
              </Text>

              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Ketik ulang password"
                secureTextEntry
                autoCapitalize="none"
                editable={!loading}
                onSubmitEditing={handleSubmit}
                style={styles.input}
              />
            </>
          )}

          {!isRegister && (
            <Pressable
              onPress={handleSubmit}
              disabled={loading}
              style={({ pressed }) => [
                styles.button,
                pressed &&
                  !loading &&
                  styles.buttonPressed,
                loading && styles.buttonDisabled,
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>
                  Masuk
                </Text>
              )}
            </Pressable>
          )}

          {isRegister && (
            <Pressable
              onPress={handleSubmit}
              disabled={loading}
              style={({ pressed }) => [
                styles.button,
                pressed &&
                  !loading &&
                  styles.buttonPressed,
                loading && styles.buttonDisabled,
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>
                  Buat akun
                </Text>
              )}
            </Pressable>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7FB",
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },

  card: {
    padding: 24,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },

  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    color: "#172033",
    textAlign: "center",
  },

  subtitle: {
    marginTop: 8,
    marginBottom: 24,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 21,
    color: "#667085",
    textAlign: "center",
  },

  tabContainer: {
    flexDirection: "row",
    marginBottom: 24,
    padding: 4,
    borderRadius: 12,
    backgroundColor: "#EEF2F6",
  },

  tab: {
    flex: 1,
    height: 42,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 9,
  },

  activeTab: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
  },

  tabText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: "#667085",
  },

  activeTabText: {
    color: "#155EEF",
  },

  label: {
    marginBottom: 8,
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: "#344054",
  },

  input: {
    height: 52,
    marginBottom: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: "#172033",
  },

  button: {
    height: 52,
    marginTop: 6,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "#155EEF",
  },

  buttonPressed: {
    opacity: 0.85,
  },

  buttonDisabled: {
    opacity: 0.65,
  },

  buttonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: "#FFFFFF",
  },
});