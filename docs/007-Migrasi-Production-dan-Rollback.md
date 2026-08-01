# Migrasi Production dan Rollback

## Prinsip

Production tetap berjalan seperti sekarang sampai implementasi development, pengujian multi-user, dan rehearsal migrasi dinyatakan lulus. Backup bukan rollback plan apabila proses restore belum pernah diuji.

## Prasyarat

- Blueprint dan migration sudah disetujui.
- Semua Sprint 1-5 selesai.
- Test RLS A/B/C lulus.
- Akun owner legacy production sudah dibuat dan dikonfirmasi.
- UUID owner legacy diverifikasi langsung dari `auth.users`.
- Backup schema, data, role, dan auth yang diperlukan tersedia serta terenkripsi.
- Restore backup telah diuji pada environment rehearsal.

## Rehearsal

1. Buat environment rehearsal terisolasi.
2. Restore snapshot production single-user.
3. Catat baseline row count dan agregat sebelum migrasi.
4. Terapkan migration dengan urutan yang sama seperti rencana production.
5. Backfill seluruh `devices.user_id` ke owner legacy yang tervalidasi.
6. Pastikan tidak ada `user_id IS NULL` sebelum menerapkan `NOT NULL`.
7. Terapkan RLS dan privilege minimum.
8. Jalankan test aplikasi serta test request lintas-user.
9. Ulangi rehearsal dari snapshot baru bila ada perubahan migration.

## Rekonsiliasi Wajib

| Pemeriksaan | Target |
| --- | --- |
| Jumlah devices | Sama sebelum/sesudah |
| Jumlah income | Sama sebelum/sesudah |
| Jumlah payment | Sama sebelum/sesudah |
| Total income | Sama sebelum/sesudah |
| Total gross payment | Sama sebelum/sesudah |
| Total admin fee | Sama sebelum/sesudah |
| Total net payment | Sama sebelum/sesudah |
| Orphan income/payment | Nol |
| Device tanpa owner | Nol |
| Duplicate code per owner | Nol |
| Akses owner legacy | Seluruh data existing terlihat |
| Akses user baru | Tidak melihat data legacy |

## Cutover Production

1. Pastikan user telah menyatakan pengujian Expo Go atau Development APK selesai dan lulus.
2. Pastikan commit yang diuji sudah berada pada branch aktif dan `master` di origin.
3. Umumkan maintenance window bila diperlukan.
4. Bekukan penulisan atau pastikan snapshot konsisten.
5. Ambil backup final dan verifikasi file dapat dibaca.
6. Catat migration version dan commit aplikasi target.
7. Terapkan migration yang sama dengan rehearsal.
8. Jalankan backfill owner legacy menggunakan UUID production yang sudah diverifikasi.
9. Jalankan query rekonsiliasi sebelum membuka aplikasi.
10. Pastikan schema, function, trigger, policy, dan constraint production sesuai migration yang disetujui; jangan menyalin akun atau data QA development.
11. Buat dan distribusikan Internal Production APK hanya setelah schema dinyatakan siap.
12. Pastikan APK mengarah ke Supabase production, tidak memuat developer launcher, dan dapat berjalan tanpa Metro.
13. Jalankan smoke test owner legacy dan satu akun baru.
14. Pantau auth error, RLS denial tidak wajar, dan error transaksi.

## Trigger Rollback

Rollback dilakukan bila salah satu kondisi berikut terjadi:

- Owner legacy tidak dapat melihat data existing.
- Rekonsiliasi row count atau nominal memiliki selisih.
- Data lintas-user dapat diakses.
- Signup/login gagal secara sistemik akibat trigger/schema.
- Error write utama melebihi batas yang disetujui.

## Strategi Rollback

### Sebelum Build Multi-User Dibuka

- Hentikan migration berikutnya.
- Rollback transaction bila masih aktif.
- Jika perubahan sudah committed, restore snapshot ke project rehearsal/target sesuai prosedur teruji.

### Setelah Build Multi-User Dibuka

- Hentikan distribusi/update baru.
- Nonaktifkan write bila integritas data terancam.
- Kembalikan build kompatibel hanya jika schema masih kompatibel.
- Untuk migration destructive, restore ke project pengganti lalu alihkan setelah validasi; jangan improvisasi restore langsung.

## Setelah Rollout

- Simpan hasil rekonsiliasi dan migration version.
- Pantau minimal satu siklus operasional yang disepakati.
- Verifikasi backup pascamigrasi.
- Tutup maintenance window setelah owner legacy dan user baru lulus smoke test.
- Catat insiden atau deviasi pada dokumen audit.
