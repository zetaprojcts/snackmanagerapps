# Hasil Audit Proyek

## Ringkasan Eksekutif

Konsep perubahan sudah benar: satu user memiliki banyak perangkat, dan setiap pemasukan serta penarikan dimiliki secara tidak langsung melalui perangkat tersebut. Implementasi saat ini baru mencapai tahap autentikasi dan policy dasar. Sistem belum aman untuk pergantian akun atau penggunaan bersamaan oleh beberapa user.

Status keseluruhan: **partially aligned, not multi-user ready**.

## Temuan P0 - Blocker

### A-001: Insert perangkat tidak menetapkan owner

- Lokasi: `src/features/devices/api.ts`, fungsi `addDevice`.
- Kondisi: payload insert tidak memiliki `user_id`.
- Database: `devices.user_id` bersifat `NOT NULL` dan policy mensyaratkan `user_id = auth.uid()`.
- Dampak: user yang sudah login dapat gagal membuat perangkat.
- Keputusan target: database menetapkan owner dari `auth.uid()` dan policy tetap memvalidasi owner.

### A-002: Cache tidak terisolasi per session

- Lokasi: `src/app/_layout.tsx` dan seluruh React Query key.
- Kondisi: satu `QueryClient` dipakai lintas sesi dan query key tidak memuat user ID.
- Dampak: data cache akun sebelumnya dapat tampil sementara ketika akun berganti.
- Keputusan target: cache dibersihkan pada perubahan user dan query key di-scope dengan `user.id`.

### A-003: Tabel profiles belum dilindungi RLS

- Lokasi: `supabase/migrations/20260731205010_002_create_profiles.sql`.
- Kondisi: tabel dibuat pada schema `public` tanpa enable RLS dan tanpa policy owner.
- Dampak: data profil berpotensi dapat dibaca atau dimodifikasi tidak sesuai ownership, tergantung grant live database.
- Keputusan target: enable RLS, cabut akses anon yang tidak dibutuhkan, dan izinkan user membaca/memperbarui profilnya sendiri.

### A-004: Device code bentrok antar-user

- Lokasi: `generateNextDeviceCode` dan constraint unik `devices.code`.
- Kondisi: RLS membuat setiap user melihat urutan kodenya sendiri, tetapi kode masih unik secara global.
- Dampak: perangkat pertama user kedua dapat berbenturan dengan `HP001` milik user pertama.
- Keputusan target: uniqueness menjadi `(user_id, code)` dan kode dibuat secara atomik di database.

## Temuan P1 - Risiko Tinggi

### A-005: Migration tidak dilacak Git

Folder `supabase/` seluruhnya masuk `.gitignore`. Schema tidak dapat direproduksi oleh CI atau mesin lain. Targetnya adalah melacak `supabase/migrations/**` dan mengabaikan hanya `.temp`, backup, serta state lokal.

Status Sprint 0: ditangani. `supabase/migrations/**` kini dapat dilacak, sedangkan `.temp`, environment lokal, dan backup tetap diabaikan. Histori migration belum dinyatakan benar sampai corrective migration dan replay Sprint 1 lulus.

### A-006: Migrasi data lama memakai UUID hard-coded

Migration `006_migrate_existing_data.sql` mengikat data ke satu UUID environment. Proses ini tidak portabel dan tidak aman untuk production. Migrasi production harus menerima owner yang sudah diverifikasi dan menjalankan rekonsiliasi sebelum `NOT NULL` diterapkan.

### A-007: Trigger profil belum di-hardening

Fungsi `handle_new_user` menggunakan `SECURITY DEFINER` tanpa fixed `search_path`. Fungsi perlu memakai `SET search_path = ''`, referensi fully qualified, privilege minimum, dan tes signup karena kegagalan trigger dapat memblokir registrasi.

### A-008: Environment build belum eksplisit

`start:dev` dan `start:pub` sudah memisahkan database, tetapi script Android belum memilih environment secara eksplisit. EAS build profile juga belum mengikat environment. Risiko utamanya adalah build development terhubung ke production atau sebaliknya. iOS dan web berada di luar scope produk dan konfigurasi sisanya perlu dibersihkan.

Status Sprint 0: sebagian ditangani. Default start tetap development, loader memvalidasi kontrak environment, dan EAS profile Android kini memilih environment secara eksplisit serta hanya menghasilkan APK. Pemisahan package identifier, script Android, dan visual marker tetap menjadi Sprint 4.

### A-009: Tidak ada alur logout

Provider menyediakan `signOut`, tetapi tidak ada UI untuk menggunakannya. Pergantian akun dan pengujian isolasi data tidak dapat dilakukan secara normal dari aplikasi.

### A-010: Kredensial tersimpan plaintext di backup lokal

File backup lokal berisi informasi koneksi. Folder tidak dilacak Git, tetapi password harus dipindahkan ke password manager, nilai yang pernah terpapar perlu dirotasi, dan backup perlu dienkripsi.

## Temuan P2 - Kualitas dan Skalabilitas

- Supabase generated types belum tersedia dan banyak jalur data menggunakan `any`.
- Belum ada test otomatis untuk RLS, auth switching, migration, atau data layer.
- Riwayat diambil seluruhnya dan agregasi dilakukan di client tanpa pagination.
- Constraint database belum menjaga nilai positif dan konsistensi nilai pembayaran.
- `payment-detail.tsx` memakai `maxValue={7}` walaupun skala uang telah dihitung.
- Plugin Reanimated masih dikonfigurasi manual walaupun Expo SDK 54 menanganinya melalui preset.
- README masih berupa dokumentasi starter Expo dan belum menjelaskan proyek ini.

## Hal yang Sudah Sesuai

- URL Supabase development dan production terpisah.
- Default `npm start` menggunakan environment development.
- Environment lokal, backup, dan state Supabase tidak dilacak Git.
- Session Supabase persisten melalui AsyncStorage dan auto-refresh aktif.
- `Stack.Protected` memisahkan login dari area aplikasi.
- RLS transaksi menggunakan ownership perangkat, sesuai hubungan bisnis saat ini.
- Foreign key transaksi menggunakan cascade delete.
- Satu income dan satu payment per perangkat per tanggal dijaga constraint unik.

## Hasil Pemeriksaan Toolchain

- `npx tsc --noEmit`: lulus tanpa error.
- `npm run lint`: lulus dengan 9 warning.
- Expo Doctor baseline: 17 dari 18 pemeriksaan lulus karena patch Expo tidak sesuai.
- Expo Doctor setelah remediasi Sprint 0: 18 dari 18 pemeriksaan lulus dengan Expo `~54.0.36`.
- `npm audit --omit=dev`: mendeteksi 17 advisory transitif, terdiri dari 13 moderate dan 4 high. Perbaikan paksa meminta upgrade Expo SDK 57 sehingga tidak diterapkan pada project SDK 54; risiko dicatat untuk pemantauan dependency.
- Git worktree sebelum audit: bersih. Perubahan setelahnya adalah pekerjaan Sprint 0 yang belum di-commit sampai pengujian user lulus.

## Batas Audit

Audit ini memeriksa source, konfigurasi, migration lokal, backup, dan toolchain. Policy pada live development database belum diuji menggunakan akun A/B/C dan migration belum di-replay dari database kosong. Keduanya menjadi gate wajib Sprint 1.
