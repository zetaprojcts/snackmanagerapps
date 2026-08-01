# Hasil Audit Proyek

## Ringkasan Eksekutif

Konsep perubahan sudah benar: satu user memiliki banyak perangkat, dan setiap pemasukan serta penarikan dimiliki secara tidak langsung melalui perangkat tersebut. Implementasi saat ini baru mencapai tahap autentikasi dan policy dasar. Sistem belum aman untuk pergantian akun atau penggunaan bersamaan oleh beberapa user.

Status keseluruhan setelah implementasi Sprint 2: **database development multi-tenant ready; session isolation, logout, serta pengelolaan akun telah diterapkan dan menunggu account-switching serta account-management test pada perangkat**.

## Temuan P0 - Blocker

### A-001: Insert perangkat tidak menetapkan owner

- Lokasi: `src/features/devices/api.ts`, fungsi `addDevice`.
- Kondisi: payload insert tidak memiliki `user_id`.
- Database: `devices.user_id` bersifat `NOT NULL` dan policy mensyaratkan `user_id = auth.uid()`.
- Dampak: user yang sudah login dapat gagal membuat perangkat.
- Keputusan target: database menetapkan owner dari `auth.uid()` dan policy tetap memvalidasi owner.

Status Sprint 1: ditangani. Client tidak lagi mengirim kode atau owner, sedangkan database menetapkan `user_id` dari session dan menolak owner lintas tenant.

### A-002: Cache tidak terisolasi per session

- Lokasi: `src/app/_layout.tsx` dan seluruh React Query key.
- Kondisi: satu `QueryClient` dipakai lintas sesi dan query key tidak memuat user ID.
- Dampak: data cache akun sebelumnya dapat tampil sementara ketika akun berganti.
- Keputusan target: cache dibersihkan pada perubahan user dan query key di-scope dengan `user.id`.

Status Sprint 2: ditangani pada source. Query aktif dibatalkan, cache dibersihkan sebelum session berbeda dipasang, dan seluruh tenant query key memuat user ID. Verifikasi runtime A-B-A masih menunggu device QA.

### A-003: Tabel profiles belum dilindungi RLS

- Lokasi: `supabase/migrations/20260731205010_002_create_profiles.sql`.
- Kondisi: tabel dibuat pada schema `public` tanpa enable RLS dan tanpa policy owner.
- Dampak: data profil berpotensi dapat dibaca atau dimodifikasi tidak sesuai ownership, tergantung grant live database.
- Keputusan target: enable RLS, cabut akses anon yang tidak dibutuhkan, dan izinkan user membaca/memperbarui profilnya sendiri.

Status Sprint 1: ditangani dan terverifikasi melalui test User A/B/C serta pemeriksaan akses anon.

### A-004: Device code bentrok antar-user

- Lokasi: `generateNextDeviceCode` dan constraint unik `devices.code`.
- Kondisi: RLS membuat setiap user melihat urutan kodenya sendiri, tetapi kode masih unik secara global.
- Dampak: perangkat pertama user kedua dapat berbenturan dengan `HP001` milik user pertama.
- Keputusan target: uniqueness menjadi `(user_id, code)` dan kode dibuat secara atomik di database.

Status Sprint 1: ditangani. Generator database memakai lock transaksi per-user dan pgTAP membuktikan user berbeda dapat memperoleh `HP001`.

## Temuan P1 - Risiko Tinggi

### A-005: Migration tidak dilacak Git

Folder `supabase/` seluruhnya masuk `.gitignore`. Schema tidak dapat direproduksi oleh CI atau mesin lain. Targetnya adalah melacak `supabase/migrations/**` dan mengabaikan hanya `.temp`, backup, serta state lokal.

Status Sprint 1: ditangani. `supabase/migrations/**` dapat dilacak, corrective migration tersedia, dan histori lengkap berhasil direplay dari database kosong.

### A-006: Migrasi data lama memakai UUID hard-coded

Migration `006_migrate_existing_data.sql` mengikat data ke satu UUID environment. Proses ini tidak portabel dan tidak aman untuk production. Migrasi production harus menerima owner yang sudah diverifikasi dan menjalankan rekonsiliasi sebelum `NOT NULL` diterapkan.

Status Sprint 1: dimitigasi untuk development melalui migration `002b` yang menghentikan replay bila ownership belum lengkap. File 006 dipertahankan sebagai histori; migration production tetap wajib memakai owner yang diverifikasi pada rehearsal.

### A-007: Trigger profil belum di-hardening

Fungsi `handle_new_user` menggunakan `SECURITY DEFINER` tanpa fixed `search_path`. Fungsi perlu memakai `SET search_path = ''`, referensi fully qualified, privilege minimum, dan tes signup karena kegagalan trigger dapat memblokir registrasi.

Status Sprint 1: ditangani. Function di-hardening, grant dipersempit, dan pembuatan tepat satu profile dibuktikan dalam pgTAP.

### A-008: Environment build belum eksplisit

`start:dev` dan `start:pub` sudah memisahkan database, tetapi script Android belum memilih environment secara eksplisit. EAS build profile juga belum mengikat environment. Risiko utamanya adalah build development terhubung ke production atau sebaliknya. iOS dan web berada di luar scope produk dan konfigurasi sisanya perlu dibersihkan.

Status Sprint 0: sebagian ditangani. Default start tetap development, loader memvalidasi kontrak environment, dan EAS profile Android kini memilih environment secara eksplisit serta hanya menghasilkan APK. Pemisahan package identifier, script Android, dan visual marker tetap menjadi Sprint 4.

### A-009: Tidak ada alur logout

Provider menyediakan `signOut`, tetapi tidak ada UI untuk menggunakannya. Pergantian akun dan pengujian isolasi data tidak dapat dilakukan secara normal dari aplikasi.

Status Sprint 2: ditangani pada source melalui protected Account route, konfirmasi logout, loading state, dan error handling. Verifikasi runtime masih menunggu device QA.

### A-010: Kredensial tersimpan plaintext di backup lokal

File backup lokal berisi informasi koneksi. Folder tidak dilacak Git, tetapi password harus dipindahkan ke password manager, nilai yang pernah terpapar perlu dirotasi, dan backup perlu dienkripsi.

## Temuan P2 - Kualitas dan Skalabilitas

- Supabase generated types belum tersedia dan banyak jalur data menggunakan `any`.
- Test otomatis RLS dan migration sudah tersedia; auth switching dan data layer tetap belum tercakup.
- Riwayat diambil seluruhnya dan agregasi dilakukan di client tanpa pagination.
- Constraint write baru menjaga nilai income positif dan konsistensi pembayaran; row historis development perlu direkonsiliasi sebelum validasi penuh.
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
- Sprint 0 telah di-commit dan di-push pada `025e4db`; perubahan Sprint 1 menunggu pengujian user sebelum commit berikutnya.

## Batas Audit

Audit awal memeriksa source, konfigurasi, migration lokal, backup, dan toolchain. Verifikasi Sprint 1 kemudian membuktikan policy pada live development menggunakan User A/B/C (19/19 assertion), schema lint, akses anon, dan replay migration dari database kosong. Production tetap hanya mengacu pada snapshot dan belum diverifikasi live.
