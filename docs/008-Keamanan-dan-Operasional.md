# Keamanan dan Operasional

## Aturan Dasar

1. RLS adalah security boundary utama untuk data tenant.
2. Protected route hanya mengatur navigasi client dan bukan pengganti RLS.
3. Semua nilai `EXPO_PUBLIC_*` dianggap publik.
4. Service role key dan database password tidak pernah berada di aplikasi.
5. Production tidak digunakan untuk eksperimen atau pengujian manual bebas.

## Klasifikasi Informasi

| Kategori | Contoh | Penyimpanan |
| --- | --- | --- |
| Publik/client | Supabase URL, anon/publishable key | EAS environment atau `.env` lokal |
| Sensitif operasional | Email user, nomor telepon, data transaksi | Database dengan RLS dan backup terenkripsi |
| Secret | Database password, service role key | Password manager/EAS secret sesuai kebutuhan server |
| Generated local state | `.expo`, `supabase/.temp` | Lokal dan diabaikan Git |

## Git Hygiene

Harus dilacak:

- `supabase/migrations/**`.
- Source aplikasi.
- Dokumentasi.
- Contoh environment tanpa nilai nyata.

Harus diabaikan:

- `.env.snack-dev` dan `.env.snack-pub`.
- `supabase/.temp/**`.
- Backup database dan hasil restore.
- Keystore, certificate, service account, dan output build.

Sebelum commit, periksa diff dan lakukan secret scan. Jangan mengandalkan `.gitignore` untuk secret yang pernah terlanjur masuk history.

## Database Access

- Gunakan akun individu, bukan credential bersama bila platform mendukung.
- Berikan akses minimum berdasarkan tugas.
- Perubahan schema dilakukan melalui migration, bukan perubahan manual tanpa catatan.
- SQL manual production harus memiliki review, backup, target project, dan query verifikasi.
- Service role hanya digunakan proses server terpercaya.

## Logging

Log yang diperbolehkan:

- Nama environment.
- Error code terkontrol.
- Correlation ID atau entity ID yang diperlukan untuk debug.
- Durasi request dan status umum.

Log yang dilarang:

- Password, token, anon/service key lengkap.
- Authorization header atau session JWT.
- Connection string.
- Data profil/transaksi lengkap yang tidak diperlukan.

## Screenshot dan Rekaman Perangkat

- Scrcpy/ADB hanya digunakan setelah user menghubungkan dan mengizinkan perangkat.
- Gunakan akun serta data development untuk visual QA.
- Tutup notification shade dan aplikasi lain yang dapat menampilkan informasi pribadi.
- Screenshot atau video yang mengandung PII, token, QR sensitif, atau data production tidak boleh masuk Git.
- Artifact pengujian disimpan sementara pada lokasi yang diabaikan Git dan dihapus setelah tidak diperlukan.
- Agent tidak menjalankan tindakan destructive pada perangkat tanpa instruksi eksplisit user.

## Backup

- Backup production dienkripsi saat disimpan dan dipindahkan.
- Akses backup dibatasi dan diaudit.
- Retention period ditetapkan agar salinan lama tidak menumpuk tanpa kontrol.
- Restore diuji berkala pada environment terisolasi.
- File catatan tidak boleh menyertakan password atau key.

## Rotasi Credential

Rotasi dilakukan ketika credential:

- Tersimpan plaintext di file lokal atau dokumentasi.
- Masuk Git, log, screenshot, atau kanal komunikasi.
- Diketahui pihak yang tidak lagi memerlukan akses.
- Mencapai jadwal rotasi organisasi.

Setelah rotasi, perbarui development/EAS environment, verifikasi build, dan hapus salinan lama secara aman.

## Monitoring Minimum

- Kegagalan signup dan trigger profile.
- Error login dan refresh session.
- RLS denial yang meningkat tidak wajar.
- Error insert/update perangkat dan transaksi.
- Latency query dashboard/history.
- Kegagalan build karena environment tidak tersedia.

## Respons Insiden Cross-Tenant

1. Hentikan write atau distribusi build yang terdampak.
2. Simpan bukti teknis tanpa menyebarkan data pengguna.
3. Identifikasi policy/query/cache yang menjadi jalur kebocoran.
4. Perbaiki dan uji dengan matriks A/B/C.
5. Nilai data dan user yang terdampak.
6. Rotasi credential bila ada kemungkinan eksposur.
7. Dokumentasikan akar masalah, perbaikan, dan pencegahan ulang.

## Checklist Operasional Singkat

- Environment aktif sudah benar.
- Git diff bebas secret dan file generated.
- Migration telah direview dan diuji replay.
- Test RLS lintas-user lulus.
- Backup dan rollback tersedia.
- Static check dan build check lulus.
- Approval production tercatat.
