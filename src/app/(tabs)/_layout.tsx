import { Tabs, useRouter } from 'expo-router';
import { Activity, ArrowDownToLine, Plus, Smartphone, Wallet } from 'lucide-react-native';
import React from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../../theme';

export default function TabLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerShown: false, // Sembunyikan header bawaan
        tabBarShowLabel: true,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 85 : 70,
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
          paddingTop: 10,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
        },
      }}
    >
      <Tabs.Screen
        name="balance"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Activity size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="devices"
        options={{
          title: 'Perangkat',
          tabBarIcon: ({ color }) => <Smartphone size={24} color={color} />,
        }}
      />
      
      {/* 🔴 TOMBOL FAB TENGAH 🔴 */}
      <Tabs.Screen
        name="action"
        options={{
          title: '', // Kosongkan judul agar bersih
          tabBarButton: (props) => (
            <TouchableOpacity
              activeOpacity={0.8}
              // Arahkan langsung ke modal pop-up saat ditekan
              onPress={() => router.push('/action-sheet-modal')} 
              style={styles.fabContainer}
            >
              <View style={styles.fab}>
                <Plus size={32} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          ),
        }}
      />

      <Tabs.Screen
        name="income"
        options={{
          title: 'Pemasukan',
          tabBarIcon: ({ color }) => <ArrowDownToLine size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="payment"
        options={{
          title: 'Penarikan',
          tabBarIcon: ({ color }) => <Wallet size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    top: -25, // Kunci utama: Menarik tombol ke atas agar melayang menembus batas navbar
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    // Efek bayangan agar tombol terlihat timbul (3D)
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8, 
  },
});