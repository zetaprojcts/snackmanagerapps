import { ArrowDownToLine, Wallet } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../theme';

type Props = {
  type: 'income' | 'payment';
  deviceName: string;
  date: string;
  amount: number;
};

export const TransactionCard = ({ type, deviceName, date, amount }: Props) => {
  const isIncome = type === 'income';
  const Icon = isIncome ? ArrowDownToLine : Wallet;
  const color = isIncome ? COLORS.success : COLORS.warning;
  const bgColor = isIncome ? '#D1FAE5' : '#FEF3C7';

  return (
    <View style={styles.card}>
      <View style={[styles.iconBox, { backgroundColor: bgColor }]}>
        <Icon color={color} size={20} />
      </View>
      <View style={styles.info}>
        <Text style={styles.deviceName}>{deviceName}</Text>
        <Text style={styles.date}>{date}</Text>
      </View>
      <Text style={[styles.amount, { color }]}>
        {isIncome ? '+' : '-'} Rp {amount.toLocaleString('id-ID')}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, padding: 15, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  iconBox: { padding: 10, borderRadius: 8 },
  info: { flex: 1, marginLeft: 15 },
  deviceName: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: 4 },
  date: { fontSize: 12, color: COLORS.textMuted },
  amount: { fontSize: 16, fontWeight: '700' }
});