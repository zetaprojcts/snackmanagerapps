import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  type LayoutChangeEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { PasswordStrength } from "../components/ui/PasswordStrength";
import {
  isStrongPassword,
  PASSWORD_REQUIREMENT_MESSAGE,
} from "../features/auth/passwordPolicy";
import { supabase } from "../lib/supabase";
import { RADIUS } from "../theme";

type AuthMode = "login" | "register";

export default function LoginScreen() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");
  const [loading, setLoading] = useState(false);
  const [tabWidth, setTabWidth] = useState(0);
  const tabProgress = useSharedValue(0);

  const isRegister = mode === "register";
  const tabIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tabProgress.value * tabWidth }],
  }));

  const resetPasswordFields = () => {
    setPassword("");
    setConfirmPassword("");
  };

  const changeMode = (nextMode: AuthMode) => {
    if (nextMode === mode) {
      return;
    }

    tabProgress.value = withTiming(nextMode === "login" ? 0 : 1, {
      duration: 220,
    });
    setMode(nextMode);
    resetPasswordFields();
  };

  const handleTabLayout = (event: LayoutChangeEvent) => {
    setTabWidth((event.nativeEvent.layout.width - 8) / 2);
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

    if (!isStrongPassword(password)) {
      Alert.alert(
        "Password belum kuat",
        PASSWORD_REQUIREMENT_MESSAGE,
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

          <View style={styles.tabContainer} onLayout={handleTabLayout}>
            <Animated.View
              pointerEvents="none"
              style={[
                styles.tabIndicator,
                { width: tabWidth },
                tabIndicatorStyle,
              ]}
            />
            <Pressable
              onPress={() => changeMode("login")}
              disabled={loading}
              style={styles.tab}
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
              style={styles.tab}
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

          {isRegister && <PasswordStrength password={password} />}

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
    borderRadius: RADIUS.card,
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
    position: "relative",
    flexDirection: "row",
    marginBottom: 24,
    padding: 4,
    borderRadius: RADIUS.control,
    backgroundColor: "#EEF2F6",
  },

  tab: {
    zIndex: 1,
    flex: 1,
    height: 42,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: RADIUS.control,
  },

  tabIndicator: {
    position: "absolute",
    top: 4,
    bottom: 4,
    left: 4,
    borderRadius: RADIUS.control,
    backgroundColor: "#155EEF",
  },

  tabText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: "#667085",
  },

  activeTabText: {
    color: "#FFFFFF",
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
    borderRadius: RADIUS.control,
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
    borderRadius: RADIUS.control,
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
