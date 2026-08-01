import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Constants from "expo-constants";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import {
  Camera,
  ChevronLeft,
  Clock3,
  Eye,
  EyeOff,
  KeyRound,
  LogOut,
  Mail,
  Pencil,
  Save,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../features/auth/AuthProvider";
import {
  downloadOwnAvatar,
  getOwnProfile,
  updateOwnPassword,
  updateOwnProfile,
  uploadOwnAvatar,
} from "../features/auth/profileApi";
import { COLORS } from "../theme";

type ProfileEditorValues = {
  fullName: string;
  email: string;
};

type PasswordEditorValues = {
  currentPassword: string;
  newPassword: string;
};

export default function AccountScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, signOut } = useAuth();
  const [profileEditorVisible, setProfileEditorVisible] = useState(false);
  const [passwordEditorVisible, setPasswordEditorVisible] = useState(false);
  const [profileDraft, setProfileDraft] = useState<ProfileEditorValues>({
    fullName: "",
    email: "",
  });
  const [passwordDraft, setPasswordDraft] = useState<PasswordEditorValues>({
    currentPassword: "",
    newPassword: "",
  });
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [localAvatarUri, setLocalAvatarUri] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["tenant", user?.id, "profile"],
    queryFn: () => getOwnProfile(user!.id),
    enabled: Boolean(user),
  });

  const { data: downloadedAvatarUri } = useQuery({
    queryKey: ["tenant", user?.id, "avatar", profile?.avatar_url],
    queryFn: () => downloadOwnAvatar(profile!.avatar_url!),
    enabled: Boolean(user && profile?.avatar_url),
  });

  const metadataName = user?.user_metadata?.full_name;
  const fullName =
    profile?.full_name ??
    (typeof metadataName === "string" ? metadataName : "") ??
    "";
  const email = user?.new_email ?? profile?.email ?? user?.email ?? "";
  const initials = useMemo(
    () =>
      (fullName || email.split("@")[0] || "Pengguna")
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join(""),
    [email, fullName],
  );
  const avatarUri = localAvatarUri ?? downloadedAvatarUri;
  const appVersion = Constants.expoConfig?.version ?? "1.2.0";

  const profileMutation = useMutation({
    mutationFn: (values: ProfileEditorValues) =>
      updateOwnProfile({
        fullName: values.fullName,
        email: values.email,
        currentEmail: user?.new_email ?? user?.email ?? "",
      }),
    onSuccess: async ({ emailChange }) => {
      await queryClient.invalidateQueries({
        queryKey: ["tenant", user?.id, "profile"],
      });
      setProfileEditorVisible(false);

      Alert.alert(
        emailChange === "pending" ? "Konfirmasi Email" : "Berhasil",
        emailChange === "pending"
          ? "Periksa email lama dan email baru untuk menyelesaikan perubahan."
          : "Informasi pribadi telah diperbarui.",
      );
    },
    onError: (error) => {
      setProfileError(
        error instanceof Error ? error.message : "Silakan coba kembali.",
      );
    },
  });

  const passwordMutation = useMutation({
    mutationFn: (values: PasswordEditorValues) =>
      updateOwnPassword({
        userId: user!.id,
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }),
    onSuccess: async ({ statusWarning }) => {
      setPasswordDraft({ currentPassword: "", newPassword: "" });
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      await queryClient.invalidateQueries({
        queryKey: ["tenant", user?.id, "profile"],
      });
      setPasswordEditorVisible(false);
      Alert.alert(
        "Password Berhasil Diubah",
        statusWarning ?? "Gunakan password baru saat login berikutnya.",
      );
    },
    onError: (error) => {
      setPasswordError(
        error instanceof Error ? error.message : "Silakan coba kembali.",
      );
    },
  });

  const openProfileEditor = () => {
    setProfileDraft({ fullName, email });
    setProfileError(null);
    setProfileEditorVisible(true);
  };

  const openPasswordEditor = () => {
    setPasswordDraft({ currentPassword: "", newPassword: "" });
    setPasswordError(null);
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setPasswordEditorVisible(true);
  };

  const saveProfile = () => {
    const cleanName = profileDraft.fullName.trim();
    const cleanEmail = profileDraft.email.trim().toLowerCase();

    if (!cleanName) {
      setProfileError("Masukkan nama yang ingin ditampilkan.");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      setProfileError("Masukkan alamat email yang valid.");
      return;
    }

    setProfileError(null);
    profileMutation.mutate({ fullName: cleanName, email: cleanEmail });
  };

  const savePassword = () => {
    if (!passwordDraft.currentPassword) {
      setPasswordError("Masukkan password saat ini.");
      return;
    }

    if (passwordDraft.newPassword.length < 8) {
      setPasswordError("Password baru harus terdiri dari minimal 8 karakter.");
      return;
    }

    if (passwordDraft.newPassword === passwordDraft.currentPassword) {
      setPasswordError("Password baru harus berbeda dari password saat ini.");
      return;
    }

    setPasswordError(null);
    passwordMutation.mutate(passwordDraft);
  };

  const selectAvatar = async () => {
    if (!user) {
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets[0]) {
        return;
      }

      setUploadingAvatar(true);
      const asset = result.assets[0];
      const avatarPath = await uploadOwnAvatar(user.id, asset);

      setLocalAvatarUri(asset.uri);
      await queryClient.invalidateQueries({
        queryKey: ["tenant", user.id, "profile"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["tenant", user.id, "avatar", avatarPath],
      });
    } catch (error) {
      Alert.alert(
        "Gagal Mengubah Foto",
        error instanceof Error ? error.message : "Silakan coba kembali.",
      );
    } finally {
      setUploadingAvatar(false);
    }
  };

  const performSignOut = async () => {
    setSigningOut(true);

    try {
      await signOut();
    } catch (error) {
      setSigningOut(false);
      Alert.alert(
        "Gagal Keluar",
        error instanceof Error ? error.message : "Silakan coba kembali.",
      );
    }
  };

  const confirmSignOut = () => {
    Alert.alert(
      "Keluar dari akun?",
      "Anda perlu login kembali untuk mengakses data perangkat.",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Keluar",
          style: "destructive",
          onPress: () => void performSignOut(),
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          accessibilityLabel="Kembali"
          accessibilityRole="button"
          style={styles.iconButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={28} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.identity}>
          <TouchableOpacity
            accessibilityLabel="Ubah foto profil"
            accessibilityRole="button"
            activeOpacity={0.85}
            disabled={uploadingAvatar}
            style={styles.avatarButton}
            onPress={() => void selectAvatar()}
          >
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarText}>{initials || "U"}</Text>
              </View>
            )}

            <View style={styles.cameraButton}>
              {uploadingAvatar ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Camera size={18} color="#FFFFFF" />
              )}
            </View>
          </TouchableOpacity>

          <Text numberOfLines={2} style={styles.name}>
            {fullName || "Pengguna"}
          </Text>
          <Text numberOfLines={1} style={styles.email}>
            {email || "-"}
          </Text>
        </View>

        {profileLoading ? (
          <ActivityIndicator color={COLORS.primary} style={styles.loader} />
        ) : (
          <>
            <SectionHeader
              icon={<UserRound size={20} color={COLORS.primary} />}
              title="Informasi Pribadi"
              editLabel="Edit informasi pribadi"
              onEdit={openProfileEditor}
            />
            <InfoRow label="Nama" value={fullName || "Belum diisi"} />
            <View style={styles.rowDivider} />
            <InfoRow label="Email" value={email || "Belum diisi"} />

            <View style={styles.sectionDivider} />

            <SectionHeader
              icon={<ShieldCheck size={20} color={COLORS.primary} />}
              title="Keamanan"
              editLabel="Ubah password"
              onEdit={openPasswordEditor}
            />
            <InfoRow label="Password" value="••••••••" />
            <View style={styles.passwordStatus}>
              <Clock3 size={17} color={COLORS.textMuted} />
              <Text style={styles.passwordStatusText}>
                {formatPasswordStatus(profile?.password_changed_at)}
              </Text>
            </View>
          </>
        )}

        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.8}
          disabled={signingOut}
          style={[styles.signOutButton, signingOut && styles.buttonDisabled]}
          onPress={confirmSignOut}
        >
          <LogOut size={20} color={COLORS.danger} />
          <Text style={styles.signOutText}>
            {signingOut ? "Keluar..." : "Keluar"}
          </Text>
        </TouchableOpacity>
        <Text style={styles.version}>Versi {appVersion}</Text>
      </ScrollView>

      <EditorModal
        error={profileError}
        pending={profileMutation.isPending}
        title="Edit Informasi Pribadi"
        visible={profileEditorVisible}
        onClose={() => setProfileEditorVisible(false)}
        onSave={saveProfile}
      >
        <Text style={styles.label}>Nama</Text>
        <View style={styles.inputWithIcon}>
          <UserRound size={18} color={COLORS.textMuted} />
          <TextInput
            autoCapitalize="words"
            maxLength={80}
            placeholder="Nama lengkap"
            placeholderTextColor={COLORS.textMuted}
            style={styles.flexInput}
            value={profileDraft.fullName}
            onChangeText={(value) => {
              setProfileError(null);
              setProfileDraft((current) => ({ ...current, fullName: value }));
            }}
          />
        </View>

        <Text style={styles.label}>Email</Text>
        <View style={styles.inputWithIcon}>
          <Mail size={18} color={COLORS.textMuted} />
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            placeholder="email@contoh.com"
            placeholderTextColor={COLORS.textMuted}
            style={styles.flexInput}
            value={profileDraft.email}
            onChangeText={(value) => {
              setProfileError(null);
              setProfileDraft((current) => ({ ...current, email: value }));
            }}
          />
        </View>
        <Text style={styles.helperText}>
          Perubahan email mungkin memerlukan konfirmasi pada email lama dan baru.
        </Text>
      </EditorModal>

      <EditorModal
        error={passwordError}
        pending={passwordMutation.isPending}
        title="Ubah Password"
        visible={passwordEditorVisible}
        onClose={() => setPasswordEditorVisible(false)}
        onSave={savePassword}
      >
        <View style={styles.editorStatus}>
          <Clock3 size={17} color={COLORS.textMuted} />
          <Text style={styles.editorStatusText}>
            {formatPasswordStatus(profile?.password_changed_at)}
          </Text>
        </View>
        <PasswordInput
          label="Password saat ini"
          placeholder="Masukkan password saat ini"
          value={passwordDraft.currentPassword}
          visible={showCurrentPassword}
          onChangeText={(value) => {
            setPasswordError(null);
            setPasswordDraft((current) => ({
              ...current,
              currentPassword: value,
            }));
          }}
          onToggleVisibility={() =>
            setShowCurrentPassword((current) => !current)
          }
        />
        <PasswordInput
          label="Password baru"
          placeholder="Minimal 8 karakter"
          value={passwordDraft.newPassword}
          visible={showNewPassword}
          onChangeText={(value) => {
            setPasswordError(null);
            setPasswordDraft((current) => ({
              ...current,
              newPassword: value,
            }));
          }}
          onToggleVisibility={() =>
            setShowNewPassword((current) => !current)
          }
        />
        <Text style={styles.helperText}>
          Gunakan minimal 8 karakter dan jangan gunakan password lama.
        </Text>
      </EditorModal>
    </SafeAreaView>
  );
}

function SectionHeader({
  icon,
  title,
  editLabel,
  onEdit,
}: {
  icon: React.ReactNode;
  title: string;
  editLabel: string;
  onEdit: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeading}>
        {icon}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <TouchableOpacity
        accessibilityLabel={editLabel}
        accessibilityRole="button"
        style={styles.editButton}
        onPress={onEdit}
      >
        <Pencil size={19} color={COLORS.primary} />
      </TouchableOpacity>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text numberOfLines={2} style={styles.infoValue}>
        {value}
      </Text>
    </View>
  );
}

function EditorModal({
  title,
  visible,
  pending,
  error,
  children,
  onClose,
  onSave,
}: {
  title: string;
  visible: boolean;
  pending: boolean;
  error: string | null;
  children: React.ReactNode;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      <SafeAreaView style={styles.editorSafeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "android" ? "height" : "padding"}
          style={styles.keyboardView}
        >
          <View style={styles.editorHeader}>
            <TouchableOpacity
              accessibilityLabel="Tutup editor"
              accessibilityRole="button"
              disabled={pending}
              style={styles.iconButton}
              onPress={onClose}
            >
              <X size={25} color={COLORS.text} />
            </TouchableOpacity>
            <Text numberOfLines={1} style={styles.editorTitle}>
              {title}
            </Text>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView
            contentContainerStyle={styles.editorContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
            {error ? (
              <View accessibilityRole="alert" style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
            <TouchableOpacity
              accessibilityRole="button"
              activeOpacity={0.8}
              disabled={pending}
              style={[styles.primaryButton, pending && styles.buttonDisabled]}
              onPress={onSave}
            >
              {pending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Save size={19} color="#FFFFFF" />
              )}
              <Text style={styles.primaryButtonText}>Simpan Perubahan</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

function PasswordInput({
  label,
  placeholder,
  value,
  visible,
  onChangeText,
  onToggleVisibility,
}: {
  label: string;
  placeholder: string;
  value: string;
  visible: boolean;
  onChangeText: (value: string) => void;
  onToggleVisibility: () => void;
}) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWithIcon}>
        <KeyRound size={18} color={COLORS.textMuted} />
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          secureTextEntry={!visible}
          style={styles.flexInput}
          value={value}
          onChangeText={onChangeText}
        />
        <TouchableOpacity
          accessibilityLabel={visible ? "Sembunyikan password" : "Lihat password"}
          accessibilityRole="button"
          style={styles.visibilityButton}
          onPress={onToggleVisibility}
        >
          {visible ? (
            <EyeOff size={19} color={COLORS.textMuted} />
          ) : (
            <Eye size={19} color={COLORS.textMuted} />
          )}
        </TouchableOpacity>
      </View>
    </>
  );
}

function formatPasswordStatus(changedAt?: string | null) {
  if (!changedAt) {
    return "Belum ada riwayat perubahan password";
  }

  const parsedDate = new Date(changedAt);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Riwayat perubahan password tidak tersedia";
  }

  return `Terakhir diubah ${parsedDate.toLocaleString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    height: 52,
    paddingHorizontal: 8,
    justifyContent: "center",
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 36,
  },
  identity: {
    alignItems: "center",
    paddingTop: 4,
    paddingBottom: 32,
  },
  avatarButton: {
    width: 112,
    height: 112,
    marginBottom: 16,
  },
  avatarImage: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: COLORS.border,
  },
  avatarFallback: {
    width: 112,
    height: 112,
    borderRadius: 56,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "700",
  },
  cameraButton: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.text,
    borderWidth: 3,
    borderColor: COLORS.background,
  },
  name: {
    maxWidth: "100%",
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
  },
  email: {
    maxWidth: "100%",
    marginTop: 6,
    fontSize: 14,
    color: COLORS.textMuted,
  },
  loader: {
    marginVertical: 28,
  },
  sectionHeader: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sectionHeading: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "700",
    color: COLORS.text,
  },
  editButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  infoRow: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  infoLabel: {
    width: 76,
    fontSize: 14,
    color: COLORS.textMuted,
  },
  infoValue: {
    flex: 1,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "600",
    color: COLORS.text,
    textAlign: "right",
  },
  rowDivider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  sectionDivider: {
    height: 1,
    marginVertical: 28,
    backgroundColor: COLORS.border,
  },
  passwordStatus: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginTop: 2,
  },
  passwordStatusText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.textMuted,
  },
  signOutButton: {
    height: 52,
    marginTop: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    borderRadius: 8,
  },
  signOutText: {
    color: COLORS.danger,
    fontSize: 15,
    fontWeight: "700",
  },
  version: {
    marginTop: 2,
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: "center",
  },
  editorSafeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  editorHeader: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  editorTitle: {
    flex: 1,
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
  },
  headerSpacer: {
    width: 44,
  },
  editorContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 36,
  },
  label: {
    marginTop: 14,
    marginBottom: 7,
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textMuted,
  },
  inputWithIcon: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingLeft: 14,
    backgroundColor: COLORS.card,
  },
  flexInput: {
    flex: 1,
    minHeight: 50,
    paddingRight: 14,
    color: COLORS.text,
    fontSize: 15,
  },
  visibilityButton: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
  },
  helperText: {
    marginTop: 9,
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.textMuted,
  },
  editorStatus: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: COLORS.softBlue,
  },
  editorStatusText: {
    flex: 1,
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  errorBox: {
    marginTop: 18,
    padding: 12,
    borderRadius: 8,
    backgroundColor: COLORS.softRed,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
  },
  primaryButton: {
    height: 52,
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  buttonDisabled: {
    opacity: 0.65,
  },
});
