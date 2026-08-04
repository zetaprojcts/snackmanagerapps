import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetTextInput,
  type BottomSheetFooterProps,
} from "@gorhom/bottom-sheet";
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
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react-native";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PasswordStrength } from "../components/ui/PasswordStrength";
import SheetSaveFooter from "../components/bottom-sheet/SheetSaveFooter";
import { useAuth } from "../features/auth/AuthProvider";
import {
  isStrongPassword,
  PASSWORD_REQUIREMENT_MESSAGE,
} from "../features/auth/passwordPolicy";
import {
  downloadOwnAvatar,
  getOwnProfile,
  updateOwnPassword,
  updateOwnProfile,
  uploadOwnAvatar,
} from "../features/auth/profileApi";
import { COLORS, RADIUS } from "../theme";

type ProfileEditorValues = {
  fullName: string;
  email: string;
};

type PasswordEditorValues = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
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
    confirmPassword: "",
  });
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
  const appVersion = Constants.expoConfig?.version ?? "2.0.0";

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
      setPasswordDraft({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
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
    setPasswordDraft({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordError(null);
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
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

    if (!isStrongPassword(passwordDraft.newPassword)) {
      setPasswordError(PASSWORD_REQUIREMENT_MESSAGE);
      return;
    }

    if (passwordDraft.newPassword === passwordDraft.currentPassword) {
      setPasswordError("Password baru harus berbeda dari password saat ini.");
      return;
    }

    if (!passwordDraft.confirmPassword) {
      setPasswordError("Masukkan konfirmasi password baru.");
      return;
    }

    if (passwordDraft.confirmPassword !== passwordDraft.newPassword) {
      setPasswordError("Konfirmasi password baru tidak sama.");
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

        <View style={styles.accountFooter}>
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
        </View>
      </ScrollView>

      <EditorSheet
        error={profileError}
        pending={profileMutation.isPending}
        snapPoint="52%"
        title="Edit Informasi Pribadi"
        visible={profileEditorVisible}
        onClose={() => setProfileEditorVisible(false)}
        onSave={saveProfile}
      >
        <Text style={styles.label}>Nama</Text>
        <View style={styles.inputWithIcon}>
          <UserRound size={18} color={COLORS.textMuted} />
          <BottomSheetTextInput
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
          <BottomSheetTextInput
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
      </EditorSheet>

      <EditorSheet
        error={passwordError}
        pending={passwordMutation.isPending}
        snapPoint="70%"
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
          placeholder="Huruf besar, kecil, dan angka"
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
        <PasswordStrength password={passwordDraft.newPassword} />
        <PasswordInput
          label="Konfirmasi password baru"
          placeholder="Ketik ulang password baru"
          value={passwordDraft.confirmPassword}
          visible={showConfirmPassword}
          onChangeText={(value) => {
            setPasswordError(null);
            setPasswordDraft((current) => ({
              ...current,
              confirmPassword: value,
            }));
          }}
          onToggleVisibility={() =>
            setShowConfirmPassword((current) => !current)
          }
        />
        <Text style={styles.helperText}>Password baru tidak boleh sama dengan password lama.</Text>
      </EditorSheet>
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

function EditorSheet({
  title,
  snapPoint,
  visible,
  pending,
  error,
  children,
  onClose,
  onSave,
}: {
  title: string;
  snapPoint: string;
  visible: boolean;
  pending: boolean;
  error: string | null;
  children: React.ReactNode;
  onClose: () => void;
  onSave: () => void;
}) {
  const snapPoints = useMemo(() => [snapPoint], [snapPoint]);
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  const renderFooter = useCallback(
    (props: BottomSheetFooterProps) => (
      <SheetSaveFooter
        {...props}
        label="Simpan Perubahan"
        pending={pending}
        onPress={() => onSaveRef.current()}
      />
    ),
    [pending],
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
      handleIndicatorStyle={styles.editorHandleIndicator}
      backgroundStyle={styles.editorSheetBackground}
    >
      <BottomSheetScrollView
        contentContainerStyle={styles.editorContent}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.editorHeader}>
          <Text numberOfLines={1} style={styles.editorTitle}>
            {title}
          </Text>
          <TouchableOpacity
            accessibilityLabel="Tutup editor"
            accessibilityRole="button"
            disabled={pending}
            style={styles.editorCloseButton}
            onPress={onClose}
          >
            <X size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {children}
        {error ? (
          <View accessibilityRole="alert" style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
      </BottomSheetScrollView>
    </BottomSheet>
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
        <BottomSheetTextInput
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
    flexGrow: 1,
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
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.border,
  },
  avatarFallback: {
    width: 112,
    height: 112,
    borderRadius: RADIUS.full,
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
    borderRadius: RADIUS.full,
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
  accountFooter: {
    marginTop: "auto",
    paddingTop: 36,
  },
  signOutButton: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    borderRadius: RADIUS.control,
  },
  signOutText: {
    color: COLORS.danger,
    fontSize: 15,
    fontWeight: "700",
  },
  version: {
    marginTop: 28,
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: "center",
  },
  editorSheetBackground: {
    borderTopLeftRadius: RADIUS.sheet,
    borderTopRightRadius: RADIUS.sheet,
  },
  editorHandleIndicator: {
    width: 48,
    height: 5,
    borderRadius: RADIUS.full,
    backgroundColor: "#CBD5E1",
  },
  editorHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  editorTitle: {
    flex: 1,
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "800",
  },
  editorCloseButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.background,
  },
  editorContent: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 128,
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
    borderRadius: RADIUS.control,
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
    borderRadius: RADIUS.control,
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
    borderRadius: RADIUS.control,
    backgroundColor: COLORS.softRed,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.65,
  },
});
