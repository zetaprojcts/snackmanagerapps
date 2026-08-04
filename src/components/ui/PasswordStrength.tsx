import { Check, Circle } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { getPasswordStrength } from "../../features/auth/passwordPolicy";
import { COLORS, RADIUS } from "../../theme";

export function PasswordStrength({ password }: { password: string }) {
  if (!password) {
    return null;
  }

  const strength = getPasswordStrength(password);
  const rules = [
    { label: "Minimal 8 karakter", passed: strength.checks.minLength },
    { label: "Huruf besar", passed: strength.checks.uppercase },
    { label: "Huruf kecil", passed: strength.checks.lowercase },
    { label: "Angka", passed: strength.checks.number },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Kekuatan password</Text>
        <Text style={[styles.label, { color: strength.color }]}>
          {strength.label}
        </Text>
      </View>
      <View style={styles.meter}>
        {rules.map((rule, index) => (
          <View
            key={rule.label}
            style={[
              styles.segment,
              index < strength.score && { backgroundColor: strength.color },
            ]}
          />
        ))}
      </View>
      <View style={styles.rules}>
        {rules.map((rule) => {
          const Icon = rule.passed ? Check : Circle;
          const color = rule.passed ? COLORS.success : COLORS.textMuted;

          return (
            <View key={rule.label} style={styles.rule}>
              <Icon size={14} color={color} />
              <Text style={[styles.ruleText, rule.passed && { color }]}>
                {rule.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    marginBottom: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
  },
  meter: {
    height: 5,
    flexDirection: "row",
    gap: 5,
    marginTop: 8,
  },
  segment: {
    flex: 1,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.border,
  },
  rules: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 7,
    marginTop: 10,
  },
  rule: {
    width: "50%",
    flexDirection: "row",
    alignItems: "center",
  },
  ruleText: {
    flex: 1,
    marginLeft: 5,
    color: COLORS.textMuted,
    fontSize: 11,
  },
});
