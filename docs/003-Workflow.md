# Workflow Refactor Multi-User

## Prinsip Eksekusi

- Kerjakan hanya pada environment development sampai Sprint 6 disetujui.
- Gunakan migration forward-only; jangan mengubah migration yang sudah pernah diterapkan pada database bersama.
- Satu sprint harus menghasilkan bukti verifikasi sebelum sprint berikutnya dimulai.
- Perubahan kecil dan terisolasi lebih diutamakan daripada satu perubahan besar.
- Production tidak digunakan sebagai tempat pengujian.
- Pengujian runtime dan acceptance dilakukan user melalui Expo Go pada perangkat fisik yang disediakan user.
- Agent menyiapkan skenario uji dan menjalankan pemeriksaan statis sebelum handoff.
- Commit dan push hanya dilakukan setelah user menyatakan pengujian selesai dan lulus.
- Setelah approval, agent wajib push branch aktif dan mempromosikan commit yang sama ke `master` mengikuti `010-Protokol-Expo-Go-dan-Promosi-Git.md`.

## Status

| Sprint | Nama | Status | Gate |
| --- | --- | --- | --- |
| 0 | Guardrail dan dokumentasi | Completed | Dokumen lengkap dan environment tervalidasi |
| 1 | Database multi-tenant | In progress | RLS test A/B/C lulus |
| 2 | Auth dan session isolation | Pending | Account switching tanpa cache leak |
| 3 | Data layer dan type safety | Pending | API typed dan test lulus |
| 4 | Environment dan build variants | Pending | Development APK dan Internal Production APK mengarah ke target benar |
| 5 | Integritas dan skalabilitas | Pending | Constraint, pagination, dan agregasi lulus |
| 6 | QA dan rollout | Pending | Rehearsal serta approval production |

## Sprint 0 - Guardrail dan Dokumentasi

### Langkah

1. Selesaikan seluruh dokumen pada folder `docs`.
2. Ubah ignore rule agar migration dilacak, tetapi `.temp`, backup, dan secret tetap diabaikan.
3. Catat baseline schema development dan production tanpa menyimpan credential.
4. Pastikan default command development tidak dapat memilih production secara implisit.
5. Rotasi password database yang tersimpan plaintext dan amankan backup.

### Output

- Dokumen bernomor dan saling terhubung.
- Migration siap dilacak Git.
- Baseline dan daftar risiko disetujui.

### Definition of Done

- Tidak ada secret baru di Git.
- Git diff hanya memuat dokumen/guardrail yang dimaksud.
- Production belum berubah.

## Sprint 1 - Database Multi-Tenant

### Langkah

1. Audit schema live development dan bandingkan dengan migration lokal.
2. Buat corrective migration baru, tanpa mengedit migration applied.
3. Aktifkan RLS dan policy owner pada `profiles`.
4. Pastikan `devices.user_id` mengacu pada `auth.users(id)` dan memiliki owner default aman.
5. Ubah uniqueness device code menjadi per-user dan buat generator atomik.
6. Rapikan duplicate constraint, function mati, sequence, grant, dan policy.
7. Tambahkan constraint integritas transaksi.
8. Tambahkan test database dengan User A, B, dan C.

### Definition of Done

- Insert perangkat berhasil untuk tiap user.
- Cross-user SELECT/INSERT/UPDATE/DELETE ditolak.
- Ketiga user dapat memiliki kode perangkat yang sama.
- Signup menghasilkan profil tepat satu kali.
- Migration dapat di-replay dari database kosong.

## Sprint 2 - Auth dan Session Isolation

### Langkah

1. Tambahkan `user` pada kontrak AuthProvider.
2. Bersihkan dan batalkan query tenant ketika session berubah.
3. Scope seluruh query key dengan user ID.
4. Tambahkan halaman akun dan tombol logout.
5. Tangani error session restore, signout, dan expired session.
6. Uji login A, logout, login B, lalu kembali login A.

### Definition of Done

- Tidak ada frame yang menampilkan data akun lama.
- Protected route tetap bekerja untuk cold start dan deep link.
- Logout dapat dilakukan dari UI dan menghapus state tenant.

## Sprint 3 - Data Layer dan Type Safety

### Langkah

1. Generate Supabase `Database` types dari schema development.
2. Tipe-kan Supabase client, entity, input, dan response.
3. Buat query-key factory dan helper invalidation.
4. Hapus `any` pada jalur auth, devices, income, dan payment.
5. Standarkan domain error untuk duplicate date, RLS, validation, dan network.
6. Tambahkan unit test untuk transformasi serta kalkulasi utama.

### Definition of Done

- Tidak ada `any` pada public data API utama.
- Schema drift terdeteksi oleh TypeScript.
- Mutasi meng-invalidasi hanya cache user aktif.

## Sprint 4 - Environment dan Build Variants

### Langkah

1. Buat konfigurasi app Android dinamis berdasarkan app variant.
2. Gunakan Android package identifier dan nama aplikasi berbeda untuk development.
3. Perjelas script `start` dan `android` untuk tiap environment.
4. Hubungkan EAS Android profile `development` dengan Supabase development dan profile `internal-production` dengan Supabase production.
5. Tambahkan validasi startup untuk kombinasi environment yang tidak valid.
6. Tampilkan penanda development yang tidak muncul pada production.
7. Hapus atau nonaktifkan konfigurasi dan script iOS/web yang berada di luar scope.

### Definition of Done

- Aplikasi Android development dan production dapat dipasang bersamaan bila diperlukan.
- Development APK selalu menuju Supabase development dan memuat developer tools.
- Internal Production APK selalu menuju Supabase production, tidak memuat developer launcher, dan dapat berjalan tanpa Metro.
- Seluruh artifact Android berformat APK; AAB dan Play Store berada di luar scope.
- Nilai `EXPO_PUBLIC_*` diperlakukan sebagai informasi publik, bukan secret.
- Tidak ada build gate atau QA requirement untuk iOS/web.

## Sprint 5 - Integritas dan Skalabilitas

### Langkah

1. Perbaiki skala grafik payment dan warning lint terkait.
2. Terapkan pagination dan filter server-side untuk history.
3. Pindahkan agregasi saldo/statistik ke query SQL atau RPC yang RLS-safe.
4. Validasi amount, admin fee, gross, dan net pada database.
5. Dokumentasikan arti saldo, gross payment, net payment, dan admin fee.
6. Pertahankan UX existing melalui regression test.

### Definition of Done

- Dataset besar tidak harus dimuat seluruhnya untuk layar pertama.
- Nilai transaksi invalid ditolak database.
- Hasil saldo sebelum dan sesudah refactor identik untuk data yang sama.

## Sprint 6 - QA, Rehearsal, dan Rollout

### Langkah

1. Jalankan seluruh pemeriksaan statis dan test otomatis yang tersedia.
2. Restore salinan backup production ke environment rehearsal.
3. Buat owner legacy dan migrasikan seluruh perangkat existing.
4. Rekonsiliasi row count, foreign key, duplicate, dan total nominal.
5. Serahkan runtime development melalui Expo Go atau Development APK beserta checklist kepada user.
6. Tunggu user menyelesaikan pengujian pada perangkat fisik dan memberikan hasil eksplisit.
7. Perbaiki temuan dan ulangi handoff sampai user menyatakan `PASS`.
8. Setelah `PASS`, perbarui status, jalankan final check, commit, dan push branch aktif.
9. Promosikan commit yang disetujui ke `master` tanpa force-push dan push `origin/master`.
10. Siapkan backup final, maintenance window, migration, dan rollback command.
11. Minta approval eksplisit terpisah sebelum menyentuh database production.
12. Setelah approval, sinkronkan schema production menggunakan migration yang telah lulus rehearsal; jangan menyalin akun atau data QA development.
13. Rekonsiliasi schema, policy, function, data legacy, row count, dan nominal pada production.
14. Buat Internal Production APK yang mengarah ke Supabase production dan lakukan smoke test terkontrol.

### Definition of Done

- Seluruh gate pada `006-Rencana-Pengujian.md` lulus.
- Selisih rekonsiliasi adalah nol.
- Rollback telah diuji pada rehearsal.
- Owner legacy dapat mengakses seluruh data existing.
- Tidak ada user yang dapat mengakses data user lain.
- User telah menyatakan pengujian Expo Go selesai dan lulus.
- Commit yang disetujui tersedia pada branch aktif dan `master` di origin.
- Schema production sinkron dengan migration yang disetujui tanpa membawa data QA development.
- Internal Production APK dapat dipasang dan berjalan tanpa Metro.

## Workflow Setiap Perubahan

1. Baca dokumen terkait dan konfirmasi scope.
2. Periksa status Git dan perubahan user yang sudah ada.
3. Implementasikan perubahan paling kecil yang memenuhi sprint.
4. Jalankan formatter/lint/typecheck/test yang relevan.
5. Verifikasi RLS atau UI sesuai blast radius.
6. Perbarui dokumen dan status sprint.
7. Sajikan ringkasan perubahan, bukti test, risiko tersisa, dan langkah berikutnya.
