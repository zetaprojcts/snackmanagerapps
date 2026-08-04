import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { COLORS, RADIUS, SHADOW } from "../../theme";

type Props = {
  onCancel: () => void;
  onConfirm: (date: Date) => void;
  title?: string;
  value: Date;
  visible: boolean;
};

const WEEK_DAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

export default function AppDatePickerModal({
  onCancel,
  onConfirm,
  title = "Pilih tanggal",
  value,
  visible,
}: Props) {
  const [draftDate, setDraftDate] = useState(value);
  const [visibleMonth, setVisibleMonth] = useState(
    new Date(value.getFullYear(), value.getMonth(), 1),
  );

  useEffect(() => {
    if (!visible) return;

    setDraftDate(value);
    setVisibleMonth(new Date(value.getFullYear(), value.getMonth(), 1));
  }, [value, visible]);

  const days = useMemo(() => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const firstWeekDay = new Date(year, month, 1).getDay();
    const leadingEmptyDays = (firstWeekDay + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cellCount = Math.ceil((leadingEmptyDays + daysInMonth) / 7) * 7;

    return Array.from({ length: cellCount }, (_, index) => {
      const day = index - leadingEmptyDays + 1;
      return day > 0 && day <= daysInMonth ? day : null;
    });
  }, [visibleMonth]);

  const shiftMonth = (amount: number) => {
    setVisibleMonth(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + amount, 1),
    );
  };

  return (
    <Modal
      animationType="fade"
      onRequestClose={onCancel}
      presentationStyle="overFullScreen"
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={styles.overlay}>
        <Pressable
          accessibilityLabel="Tutup pemilih tanggal"
          onPress={onCancel}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.dialog}>
          <View style={styles.titleRow}>
            <View style={styles.titleIcon}>
              <CalendarDays color={COLORS.primary} size={20} />
            </View>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity
              accessibilityLabel="Tutup pemilih tanggal"
              accessibilityRole="button"
              onPress={onCancel}
              style={styles.iconButton}
            >
              <X color={COLORS.textMuted} size={20} />
            </TouchableOpacity>
          </View>

          <View style={styles.monthRow}>
            <TouchableOpacity
              accessibilityLabel="Bulan sebelumnya"
              accessibilityRole="button"
              onPress={() => shiftMonth(-1)}
              style={styles.iconButton}
            >
              <ChevronLeft color={COLORS.text} size={21} />
            </TouchableOpacity>
            <Text style={styles.monthLabel}>
              {visibleMonth.toLocaleDateString("id-ID", {
                month: "long",
                year: "numeric",
              })}
            </Text>
            <TouchableOpacity
              accessibilityLabel="Bulan berikutnya"
              accessibilityRole="button"
              onPress={() => shiftMonth(1)}
              style={styles.iconButton}
            >
              <ChevronRight color={COLORS.text} size={21} />
            </TouchableOpacity>
          </View>

          <View style={styles.weekRow}>
            {WEEK_DAYS.map((day) => (
              <Text key={day} style={styles.weekDay}>
                {day}
              </Text>
            ))}
          </View>

          <View style={styles.calendarGrid}>
            {days.map((day, index) => {
              if (!day) {
                return <View key={`empty-${index}`} style={styles.dayCell} />;
              }

              const date = new Date(
                visibleMonth.getFullYear(),
                visibleMonth.getMonth(),
                day,
              );
              const selected = isSameDay(date, draftDate);
              const today = isSameDay(date, new Date());

              return (
                <TouchableOpacity
                  accessibilityLabel={date.toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                  accessibilityRole="button"
                  key={date.toISOString()}
                  onPress={() => setDraftDate(date)}
                  style={styles.dayCell}
                >
                  <View
                    style={[
                      styles.dayButton,
                      today && styles.todayButton,
                      selected && styles.selectedDayButton,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        today && styles.todayText,
                        selected && styles.selectedDayText,
                      ]}
                    >
                      {day}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.actions}>
            <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onConfirm(draftDate)}
              style={styles.confirmButton}
            >
              <Text style={styles.confirmText}>Pilih</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function isSameDay(first: Date, second: Date) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "rgba(15,23,42,0.55)",
  },
  dialog: {
    width: "100%",
    maxWidth: 420,
    padding: 20,
    borderRadius: RADIUS.sheet,
    backgroundColor: COLORS.card,
    ...SHADOW.card,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  titleIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: RADIUS.control,
    backgroundColor: COLORS.softBlue,
  },
  title: {
    flex: 1,
    marginLeft: 12,
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "800",
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: RADIUS.control,
    backgroundColor: COLORS.background,
  },
  monthRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 22,
  },
  monthLabel: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  weekRow: {
    flexDirection: "row",
    marginTop: 18,
  },
  weekDay: {
    width: "14.2857%",
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  dayCell: {
    width: "14.2857%",
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  dayButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent",
    borderRadius: RADIUS.full,
  },
  todayButton: {
    borderColor: COLORS.primary,
  },
  selectedDayButton: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  dayText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "600",
  },
  todayText: {
    color: COLORS.primary,
    fontWeight: "800",
  },
  selectedDayText: {
    color: "#FFFFFF",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: RADIUS.control,
    backgroundColor: COLORS.background,
  },
  cancelText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: "700",
  },
  confirmButton: {
    flex: 1,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: RADIUS.control,
    backgroundColor: COLORS.primary,
  },
  confirmText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
