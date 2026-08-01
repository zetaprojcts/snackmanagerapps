# Rencana Pengujian

## Tujuan

Pengujian harus membuktikan dua hal: fitur existing tetap bekerja dan tidak ada data yang dapat menyeberang antar-user. Pengujian UI saja tidak cukup untuk membuktikan keamanan; RLS harus diuji melalui request database.

Platform pengujian runtime hanya Android. Tidak ada test matrix, Visual QA, build check, atau acceptance gate untuk iOS dan web.

## Pembagian Tanggung Jawab

- User menjadi pemilik keputusan akhir pengujian runtime dan acceptance.
- Pengujian runtime dilakukan user melalui Expo Go atau Development APK pada perangkat Android fisik yang disediakan user.
- Agent menyiapkan server development, URL/QR atau Development APK, akun/data uji yang disepakati, dan checklist pengujian.
- Agent tetap menjalankan pemeriksaan statis dan test otomatis yang tersedia sebelum handoff.
- Bila user mengizinkan dan perangkat terhubung, agent dapat mengamati atau membantu pengujian melalui `scrcpy`/ADB.
- Agent tidak boleh menandai pengujian selesai berdasarkan asumsi; status selesai hanya diberikan setelah konfirmasi eksplisit dari user.
- Commit dan push dilakukan setelah hasil pengujian dinyatakan `PASS` oleh user.

## Test Users

- User A: memiliki beberapa perangkat aktif dan nonaktif.
- User B: memiliki perangkat dengan kode yang sama seperti User A.
- User C: akun baru tanpa perangkat.

Gunakan akun khusus development/QA. Jangan memakai akun atau data production.

## Matriks RLS Wajib

| Kasus | User A | Target | Hasil |
| --- | --- | --- | --- |
| Select own device | A | Device A | Diizinkan |
| Select other device by UUID | A | Device B | Tidak mengembalikan row |
| Insert own device | A | Owner A | Diizinkan |
| Insert with owner B | A | Owner B | Ditolak |
| Update own device | A | Device A | Diizinkan |
| Update other device | A | Device B | Ditolak/tidak ada row |
| Delete own device | A | Device A | Diizinkan |
| Delete other device | A | Device B | Ditolak/tidak ada row |
| Insert income/payment own | A | Device A | Diizinkan |
| Insert income/payment other | A | Device B | Ditolak |
| Read profile own | A | Profile A | Diizinkan |
| Read/update profile other | A | Profile B | Ditolak |
| Unauthenticated CRUD | Anon | Semua tabel tenant | Ditolak |

Matriks yang sama harus dijalankan untuk User B. User C harus menerima daftar kosong, bukan data A/B.

## Test Database dan Migration

1. Replay seluruh migration dari database kosong.
2. Upgrade schema dari baseline single-user pada database rehearsal.
3. Jalankan dua insert perangkat paralel untuk satu user.
4. Pastikan User A dan B dapat sama-sama memiliki `HP001`.
5. Pastikan duplicate `(device_id, trx_date)` ditolak.
6. Pastikan amount nol/negatif dan payment tidak konsisten ditolak.
7. Hapus device dan verifikasi transaksi terkait terhapus.
8. Hapus test user dan verifikasi profile/device/transaksi terhapus sesuai cascade.
9. Verifikasi function dan table grant untuk `anon`, `authenticated`, dan `service_role`.

## Test Auth dan Cache

1. Cold start tanpa session membuka login.
2. Registrasi membuat auth user dan satu profile.
3. Email confirmation flow ditangani sesuai konfigurasi project.
4. Login User A menampilkan hanya data A.
5. Logout menghapus navigator privat dan cache tenant.
6. Login User B setelah A tidak pernah menampilkan data A, termasuk satu frame.
7. Session expired kembali ke login tanpa crash.
8. Restart aplikasi memulihkan session yang valid.
9. Deep link ke route privat tanpa session dialihkan ke login.

## Regression Test Fitur Existing

- Tambah, edit, aktifkan, dan nonaktifkan perangkat.
- Filter perangkat berdasarkan status, brand, pencarian, dan saldo.
- Tambah income dan overwrite pada tanggal duplicate.
- Tambah payment, hitung admin fee/net, dan overwrite duplicate.
- Perangkat tanpa e-wallet tidak dapat melakukan payment.
- Dashboard saldo, statistik bulanan, dan aktivitas terbaru konsisten.
- Detail perangkat, income, payment, grafik, dan custom date berfungsi.
- Pull-to-refresh dan state loading/empty/error bekerja.

Checklist ini dieksekusi oleh user pada Expo Go atau Development APK dengan Supabase development. Agent mencatat hasil yang dilaporkan user tanpa mengklaim telah melakukan pengujian perangkat.

## Protokol Handoff Expo Go

1. Agent memastikan aplikasi menggunakan environment development.
2. Agent menjalankan pemeriksaan statis dan memperbaiki blocker sebelum handoff.
3. Agent menjalankan Expo development server dan memberikan URL/QR yang dapat diakses perangkat user.
4. Agent memberikan daftar perubahan dan checklist kasus yang perlu diuji.
5. User menjalankan pengujian pada perangkat fisik melalui Expo Go atau Development APK.
6. User melaporkan salah satu hasil: `PASS`, `FAIL`, atau `PAUSED` beserta temuan bila ada.
7. Pada hasil `FAIL`, agent memperbaiki masalah dan kembali ke langkah pertama.
8. Pada hasil `PASS`, agent menjalankan final check, memperbarui status, lalu menjalankan protokol commit/push.

## Visual QA dengan Scrcpy

Scrcpy dapat digunakan sebagai alat bantu agar user dan agent melihat sesi perangkat yang sama. Penggunaan scrcpy tidak memindahkan ownership approval dari user.

### Prasyarat

1. Perangkat Android fisik telah mengaktifkan USB debugging atau wireless debugging.
2. User telah mengizinkan koneksi debugging pada perangkat.
3. `adb devices` menampilkan perangkat sebagai `device`, bukan `unauthorized` atau `offline`.
4. Expo Go atau Development APK menjalankan project development yang benar.
5. Data uji tidak menggunakan data pribadi atau credential production.

### Hal yang Dapat Diverifikasi Agent

- Tampilan pada viewport perangkat nyata.
- Overflow, overlap, clipping, dan safe area.
- Navigasi, modal, bottom sheet, keyboard, dan back behavior.
- Loading, empty, error, disabled, dan success state.
- Account switching serta indikasi cache data lama.
- Langkah reproduksi bug yang ditemukan user.

### Bukti Pengujian

- Screenshot atau rekaman hanya dibuat bila diperlukan.
- Artifact diberi nama berdasarkan tanggal, fitur, dan kasus uji tanpa nama user.
- Artifact yang mengandung email, nomor telepon, transaksi nyata, token, atau credential tidak boleh masuk Git.
- Artifact sementara dihapus atau disimpan pada lokasi yang diabaikan Git setelah verifikasi selesai.
- Hasil akhir tetap dicatat sebagai laporan `PASS`, `FAIL`, atau `PAUSED` dari user.

## Test Performance

- Seed minimal 100 perangkat dan 10.000 transaksi untuk satu test user.
- Ukur waktu layar pertama, refresh, filter, dan pagination.
- Pastikan layar awal tidak mengunduh seluruh history tanpa batas.
- Periksa query plan untuk agregasi dan filter tanggal utama.

## Static dan Build Checks

```text
npm run lint
npx tsc --noEmit
npx expo install --check
npx expo-doctor
```

Development APK dan Internal Production APK diuji terpisah. Internal Production APK harus dapat dibuka tanpa Metro dan hanya diuji setelah database production disinkronkan serta rollout disetujui. iOS, web, dan AAB tidak menjadi target pemeriksaan. Warning baru harus dijelaskan atau diselesaikan sebelum merge.

## Acceptance Criteria

- Seluruh kasus cross-tenant ditolak.
- Tidak ada cache leak ketika account switching.
- Tidak ada regresi pada workflow single-user existing.
- Row count dan total nominal rehearsal sesuai baseline.
- Seluruh static/build check lulus.
- Hasil test dicatat dengan tanggal, commit, environment, dan tester tanpa credential.
- User memberikan konfirmasi eksplisit bahwa pengujian Expo Go atau Development APK selesai dan lulus.
- Tidak ada commit/push final sebelum konfirmasi tersebut diterima.
- Internal Production APK mengarah ke Supabase production yang schema dan migration-nya telah direkonsiliasi.
- Internal Production APK dapat berjalan tanpa Metro dan tidak memuat data/credential development.

Prosedur setelah acceptance mengikuti `010-Protokol-Expo-Go-dan-Promosi-Git.md`.
