export const PASSWORD_REQUIREMENT_MESSAGE =
  "Password harus minimal 8 karakter serta mengandung huruf besar, huruf kecil, dan angka.";

export const getPasswordStrength = (password: string) => {
  const checks = {
    minLength: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
  };
  const score = Object.values(checks).filter(Boolean).length;

  if (!password) {
    return {
      checks,
      score: 0,
      label: "Belum dinilai",
      color: "#94A3B8",
      isValid: false,
    };
  }

  if (score <= 1) {
    return { checks, score, label: "Lemah", color: "#EF4444", isValid: false };
  }

  if (score <= 3) {
    return { checks, score, label: "Cukup", color: "#F59E0B", isValid: false };
  }

  return { checks, score, label: "Kuat", color: "#10B981", isValid: true };
};

export const isStrongPassword = (password: string) =>
  getPasswordStrength(password).isValid;
