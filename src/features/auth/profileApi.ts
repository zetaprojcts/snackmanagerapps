import type { ImagePickerAsset } from "expo-image-picker";

import { supabase } from "../../lib/supabase";
import {
  isStrongPassword,
  PASSWORD_REQUIREMENT_MESSAGE,
} from "./passwordPolicy";

export type UserProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  password_changed_at: string | null;
};

export const getOwnProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, avatar_url, password_changed_at")
    .eq("id", userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as UserProfile;
};

export const updateOwnProfile = async ({
  fullName,
  email,
  currentEmail,
}: {
  fullName: string;
  email: string;
  currentEmail: string;
}) => {
  const normalizedEmail = email.trim().toLowerCase();
  const emailChangeRequested = normalizedEmail !== currentEmail.toLowerCase();
  const attributes: {
    data: { full_name: string };
    email?: string;
  } = {
    data: { full_name: fullName.trim() },
  };

  if (emailChangeRequested) {
    attributes.email = normalizedEmail;
  }

  const { data, error } = await supabase.auth.updateUser(attributes);

  if (error) {
    throw new Error(error.message);
  }

  return {
    emailChange: !emailChangeRequested
      ? ("none" as const)
      : data.user.email?.toLowerCase() === normalizedEmail
        ? ("updated" as const)
        : ("pending" as const),
  };
};

export const updateOwnPassword = async ({
  userId,
  currentPassword,
  newPassword,
}: {
  userId: string;
  currentPassword: string;
  newPassword: string;
}) => {
  if (!isStrongPassword(newPassword)) {
    throw new Error(PASSWORD_REQUIREMENT_MESSAGE);
  }

  const { error } = await supabase.auth.updateUser({
    current_password: currentPassword,
    password: newPassword,
  });

  if (error) {
    throw new Error(error.message);
  }

  const changedAt = new Date().toISOString();
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .update({ password_changed_at: changedAt })
    .eq("id", userId)
    .select("password_changed_at")
    .single();

  return {
    changedAt: profileError ? null : profile.password_changed_at,
    statusWarning: profileError
      ? "Password berhasil diubah, tetapi waktu perubahan belum dapat dicatat."
      : null,
  };
};

export const uploadOwnAvatar = async (
  userId: string,
  asset: ImagePickerAsset,
) => {
  if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
    throw new Error("Ukuran foto maksimal 5 MB.");
  }

  const fileData = await fetch(asset.uri).then((response) =>
    response.arrayBuffer(),
  );
  const supportedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
  const contentType = supportedMimeTypes.includes(asset.mimeType ?? "")
    ? asset.mimeType!
    : "image/jpeg";
  const avatarPath = `${userId}/avatar`;
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(avatarPath, fileData, {
      cacheControl: "3600",
      contentType,
      upsert: true,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { error: metadataError } = await supabase.auth.updateUser({
    data: { avatar_url: avatarPath },
  });

  if (metadataError) {
    throw new Error(metadataError.message);
  }

  return avatarPath;
};

export const downloadOwnAvatar = async (path: string) => {
  const { data, error } = await supabase.storage
    .from("avatars")
    .download(path);

  if (error) {
    throw new Error(error.message);
  }

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Foto profil tidak dapat dibaca."));
    reader.readAsDataURL(data);
  });
};
