  // ... style lainnya tetap sama

  tooltipContainer: {
    position: 'absolute',
    bottom: 4,         // Memberi jarak sedikit dari atas batang grafik
    width: 70,         // Lebar tetap agar teks nominal tidak tergencet
    left: -26,         // Menggeser tepat ke tengah (rumus: (70 - barWidth 18) / 2)
    backgroundColor: '#1A1A1A',
    paddingVertical: 5,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,       // Memastikan teks selalu tampil di urutan paling depan
  },
  tooltipText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },

  // activitySection: { ...
