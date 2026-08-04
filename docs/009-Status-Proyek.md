# 009-STATUS-PROYEK

**Version:** 2.0.0 (Production Schema Synchronized, Final Android QA Pending)<br>
**Status:** LOCKED & ACTIVE<br>
**Target Readers:** Developer dan Autonomous AI Development Agents<br>
**Single Source of Truth (SSOT):** Status eksekusi, checklist, dan gate refactor multi-user Snack Manager<br>
**Last Updated:** 4 Agustus 2026

---

## BAB 1: Status Fase Global

Pengembangan Snack Manager mempertahankan seluruh fungsi single-user yang sudah berjalan, lalu menambahkan ownership dan isolasi multi-user secara bertahap. Implementasi dilakukan pada development, direhearsal dari backup final, lalu disinkronkan ke production setelah approval eksplisit user pada 4 Agustus 2026.

[LOCKED] FASE 0: Audit dan Blueprint

- Seluruh source, konfigurasi, aset, migration lokal, dan backup telah dipetakan.
- Audit multi-user P0-P2 telah selesai.
- Blueprint, workflow, arsitektur data, strategi environment, testing, rollout, dan keamanan telah didokumentasikan.
- TypeScript, lint, dan Expo Doctor baseline telah dijalankan.

[LOCKED] SPRINT 0: Guardrail dan Dokumentasi

- Mengunci dokumentasi sebagai sumber acuan refactor.
- Menyiapkan migration agar dapat dilacak Git tanpa melacak secret atau state lokal.
- Mengamankan credential dan backup lokal.
- Mencatat baseline schema development dan production.
- Memastikan default workflow tidak dapat mengarah ke production secara tidak sengaja.

[LOCKED] SPRINT 1: Database Multi-Tenant

- Memperbaiki ownership `devices`.
- Melindungi `profiles` dengan RLS.
- Membuat device code unik per-user dan atomik.
- Merapikan policy, grant, function, index, dan constraint.
- Membuktikan isolasi dengan User A, B, dan C.

[VERIFYING] SPRINT 2: Auth dan Session Isolation

- Membersihkan cache saat session berubah.
- Membuat query key berbasis user.
- Menambahkan halaman akun dan logout.
- Memastikan account switching tidak menampilkan data user sebelumnya.

[PENDING] SPRINT 3: Data Layer dan Type Safety

- Generate Supabase Database types.
- Menghapus `any` dari API utama.
- Membuat query-key factory dan domain error yang konsisten.
- Menambahkan unit test data layer.

[PENDING] SPRINT 4: Android Environment dan Build Variants

- Memisahkan identitas aplikasi Android development dan production.
- Membuat script Android environment yang eksplisit.
- Menghubungkan EAS Android profile ke environment yang benar.
- Menambahkan startup guard dan visual marker development.
- Membersihkan konfigurasi iOS/web yang berada di luar scope.

[PENDING] SPRINT 5: Integritas dan Skalabilitas

- Menambahkan constraint nilai transaksi.
- Memperbaiki grafik dan warning statis.
- Menambahkan pagination dan filter server-side.
- Memindahkan agregasi berat ke query/RPC yang RLS-safe.

[VERIFYING] SPRINT 6: QA, Rehearsal, dan Rollout

- Menjalankan seluruh acceptance test dan regression test.
- Melakukan rehearsal dari backup production.
- Memigrasikan data legacy ke owner yang diverifikasi.
- Melakukan rekonsiliasi, rollback rehearsal, dan rollout dengan approval eksplisit.

---

## BAB 2: Objektif Sprint Aktif

Implementasi Sprint 2 telah selesai dan lulus pemeriksaan otomatis serta regression QA utama melalui Expo Go. Session berbeda membatalkan query aktif dan membersihkan cache, seluruh tenant query key memuat user ID, dan urutan account switching A-B-A tidak menampilkan data tenant lain. Sprint masih menunggu cold start, expired session, protected deep link, serta persetujuan akhir user.

Fokus Sprint 2:

1. Menambahkan user aktif pada kontrak auth aplikasi.
2. Membatalkan request dan membersihkan cache ketika session berubah.
3. Membuat query key tenant berbasis `user.id`.
4. Menyediakan halaman akun dan logout.
5. Menguji login A, logout, login B, lalu kembali ke A.

Dokumen acuan:

- `001-Hasil-Audit.md`
- `002-Blueprint.md`
- `003-Workflow.md`
- `004-Arsitektur-Data-dan-RLS.md`
- `005-Strategi-Environment-dan-Build.md`
- `006-Rencana-Pengujian.md`
- `007-Migrasi-Production-dan-Rollback.md`
- `008-Keamanan-dan-Operasional.md`
- `011-Baseline-Database.md`

---

## BAB 3: Matriks Eksekusi dan Checklist

Developer atau AI Agent wajib mengubah `[ ]` menjadi `[x]` hanya setelah implementasi dan verifikasi item tersebut selesai.

### 3.1 Sprint 0: Guardrail dan Dokumentasi

1. [x] Membaca dan memahami seluruh project-owned files.
2. [x] Menyelesaikan audit multi-user menyeluruh.
3. [x] Membuat indeks dokumentasi.
4. [x] Membuat blueprint multi-user.
5. [x] Membuat workflow refactor per sprint.
6. [x] Membuat dokumen arsitektur data dan RLS.
7. [x] Membuat strategi environment dan build.
8. [x] Membuat rencana pengujian.
9. [x] Membuat prosedur migration production dan rollback.
10. [x] Membuat standar keamanan dan operasional.
11. [x] Membuat roadmap dan checklist status proyek ini.
12. [x] Mengubah ignore rule agar `supabase/migrations/**` dilacak Git.
13. [x] Memastikan `supabase/.temp/**`, `.env*`, dan backup tetap diabaikan.
14. [x] Merotasi credential yang tersimpan plaintext.
15. [x] Memindahkan credential ke password manager.
16. [x] Mengenkripsi atau memindahkan backup ke penyimpanan aman.
17. [x] Mencatat baseline schema development.
18. [x] Mencatat baseline schema production tanpa melakukan perubahan.
19. [x] Memastikan seluruh command default mengarah ke development.
20. [x] Menjalankan secret scan dan Git hygiene check.

### 3.2 Sprint 1: Database Multi-Tenant

1. [x] Membandingkan schema live development dengan migration lokal.
2. [x] Membuat corrective migration forward-only.
3. [x] Mengaktifkan RLS pada `profiles`.
4. [x] Membuat policy own-profile untuk SELECT dan UPDATE.
5. [x] Mengamankan `handle_new_user` dengan fixed `search_path`.
6. [x] Mengarahkan `devices.user_id` ke `auth.users(id)` dengan cascade yang benar.
7. [x] Menetapkan owner perangkat dari session database.
8. [x] Mengubah unique device code menjadi `(user_id, code)`.
9. [x] Membuat generator device code atomik per-user.
10. [x] Menghapus duplicate constraint dan database object mati.
11. [x] Memperketat grant function, sequence, dan table.
12. [x] Menambahkan constraint integritas income dan payment untuk write baru; validasi row historis dijadwalkan pada Sprint 5.
13. [x] Membuat test RLS User A, B, dan C.
14. [x] Replay migration dari database kosong.

### 3.3 Sprint 2: Auth dan Session Isolation

1. [x] Menambahkan `user` pada kontrak AuthProvider.
2. [x] Membatalkan request tenant saat user berubah.
3. [x] Membersihkan React Query cache saat logout atau pergantian user.
4. [x] Membuat seluruh tenant query key berbasis `user.id`.
5. [x] Menambahkan halaman akun.
6. [x] Menambahkan tombol dan error handling logout.
7. [ ] Menguji cold start, expired session, dan deep link privat.
8. [x] Menguji urutan login A, logout, login B, lalu login A kembali.
9. [x] Menambahkan perubahan foto profil, nama, email, dan password.
10. [x] Membuat bucket avatar privat dan policy object per-user.
11. [x] Menyinkronkan perubahan Auth ke tabel `profiles`.
12. [x] Memperluas pgTAP untuk profile dan Storage isolation.
13. [x] Menampilkan informasi pribadi dan keamanan sebagai ringkasan read-only.
14. [x] Membuka editor informasi pribadi dan password melalui ikon pensil.
15. [x] Mencatat dan menampilkan waktu perubahan password terakhir.
16. [x] Menampilkan versi aplikasi di bagian paling bawah halaman akun.
17. [x] Menyejajarkan ikon akun dengan judul daftar perangkat.
18. [x] Menstabilkan tombol simpan form perangkat, pendapatan, dan penarikan saat keyboard Android terbuka.
19. [x] Menghapus email sekunder di bawah foto dan nama profil.
20. [x] Memberi jarak yang cukup antara tombol keluar dan versi aplikasi.
21. [x] Menambahkan konfirmasi password baru dan validasi kecocokan.
22. [x] Mengaktifkan navigasi dan tampilan detail transaksi pendapatan serta penarikan.
23. [x] Mengganti tiga kartu ringkasan saldo dengan donut chart pendapatan, pengeluaran bersih, dan admin fee.
24. [x] Menerapkan kebijakan password bersama pada register, perubahan password, dan data layer.
25. [x] Menampilkan strength meter serta aturan huruf besar, huruf kecil, angka, dan minimal delapan karakter.
26. [x] Menyesuaikan loading state dengan skeleton multi-row untuk perangkat, riwayat, detail, dan saldo.
27. [x] Menambahkan edit dan hapus transaksi terpilih berbasis ID dengan konfirmasi destruktif.
28. [x] Menampilkan avatar akun pada header perangkat dengan fallback inisial nama/email.
29. [x] Menstandarkan radius kartu, kontrol, bottom sheet, serta elemen lingkaran melalui token tema bersama.
30. [x] Mengganti halaman penuh edit transaksi menjadi bottom sheet dari detail transaksi.
31. [x] Menyesuaikan skeleton detail perangkat dengan seluruh struktur layar dan beberapa transaksi.
32. [x] Mengganti date picker native dengan kalender bertema aplikasi pada seluruh alur transaksi dan filter.
33. [x] Mengubah bottom navigation menjadi ikon tanpa label dengan chip aktif beranimasi.
34. [x] Membuat seluruh transaksi yang tampil pada detail perangkat dapat membuka detail transaksi berdasarkan ID.
35. [x] Merapatkan editor transaksi ketika keyboard Android terbuka tanpa menutupi aksi simpan dan hapus.
36. [x] Memastikan label dan nilai panjang pada rincian pendapatan serta penarikan dapat membungkus tanpa terpotong.
37. [x] Melembutkan chip aktif bottom navigation dengan radius penuh dan opacity 60%.
38. [x] Menyesuaikan chip aktif menjadi latar biru lembut dengan ikon biru sesuai referensi visual.
39. [x] Menambahkan ring putih 8 px pada FAB dan menghapus seluruh shadow FAB.
40. [x] Menyamakan editor profil serta password dengan pola bottom sheet form lainnya.

### 3.4 Sprint 3: Data Layer dan Type Safety

1. [ ] Generate Supabase `Database` types.
2. [ ] Mengetik Supabase client dengan schema hasil generate.
3. [ ] Mengetik entity dan input devices, income, payment, dan profiles.
4. [ ] Menghapus `any` dari public API utama.
5. [ ] Membuat query-key factory.
6. [ ] Membuat helper invalidation berbasis user.
7. [ ] Menstandarkan domain error.
8. [ ] Menambahkan unit test transformasi dan kalkulasi.

### 3.5 Sprint 4: Android Environment dan Build Variants

1. [ ] Membuat app config Android dinamis.
2. [ ] Menambahkan nama dan Android package identifier development terpisah.
3. [ ] Membuat script `start` dan `android` per environment.
4. [ ] Menetapkan EAS environment pada profile Development APK dan Internal Production APK.
5. [ ] Menambahkan startup guard terhadap target database yang salah.
6. [ ] Menambahkan visual marker khusus development.
7. [ ] Memverifikasi Development APK menuju Supabase development.
8. [ ] Memverifikasi Internal Production APK menuju Supabase production yang telah disinkronkan.
9. [ ] Menghapus atau menonaktifkan konfigurasi/script iOS dan web.
10. [ ] Memastikan cleanup platform tidak memengaruhi build Android.
11. [ ] Memastikan artifact akhir berupa standalone APK tanpa developer launcher dan tanpa ketergantungan Metro.
12. [ ] Memastikan tidak ada profile AAB atau workflow Google Play Store.

### 3.6 Sprint 5: Integritas dan Skalabilitas

1. [x] Memperbaiki `payment-detail` agar memakai skala chart hasil kalkulasi.
2. [x] Menyelesaikan seluruh warning lint lama dan baru.
3. [x] Menambahkan pagination history.
4. [x] Memindahkan filter tanggal ke server-side query.
5. [x] Membuat agregasi saldo/statistik yang RLS-safe.
6. [ ] Menetapkan definisi gross, net, admin fee, dan saldo.
7. [ ] Menambahkan performance test dataset besar.
8. [ ] Memastikan hasil saldo identik dengan baseline.

### 3.7 Sprint 6: QA dan Rollout

1. [x] Menjalankan seluruh static check dan automated test yang tersedia.
2. [x] Menyiapkan Expo Go development server dan checklist pengujian.
3. [ ] Menyerahkan URL/QR Expo Go kepada user.
4. [x] Menghubungkan scrcpy/ADB bila user menyediakan dan mengizinkan perangkat.
5. [x] Melakukan Visual QA kolaboratif melalui scrcpy bila tersedia.
6. [ ] Menunggu user melakukan pengujian pada perangkat fisik.
7. [ ] Mencatat hasil pengujian user sebagai `PASS`, `FAIL`, atau `PAUSED`.
8. [ ] Menyelesaikan seluruh temuan hasil pengujian dan melakukan handoff ulang bila diperlukan.
9. [ ] Menerima konfirmasi eksplisit `PASS` dari user.
10. [ ] Memperbarui status dan catatan verifikasi setelah hasil `PASS`.
11. [ ] Melakukan commit pada branch aktif.
12. [ ] Push branch aktif ke origin.
13. [ ] Merge commit yang disetujui ke `master` tanpa force-push.
14. [ ] Push `master` ke origin.
15. [ ] Melaporkan commit hash branch aktif dan `master` kepada user.
16. [x] Restore backup production ke environment rehearsal.
17. [x] Membuat dan memverifikasi owner legacy.
18. [x] Menjalankan migration pada rehearsal.
19. [x] Menjalankan rekonsiliasi row count dan total nominal.
20. [x] Menjalankan RLS test pada hasil rehearsal.
21. [ ] Menguji rollback pada rehearsal.
22. [x] Mendapatkan approval eksplisit terpisah untuk database production.
23. [x] Mengambil backup final production.
24. [x] Menjalankan migration production.
25. [ ] Menjalankan smoke test dan monitoring pascarilis.
26. [x] Memastikan schema, policy, function, dan constraint production sinkron dengan migration yang disetujui.
27. [x] Memastikan akun dan data QA development tidak tersalin ke production.
28. [ ] Membuat Internal Production APK yang mengarah ke Supabase production.
29. [ ] Memasang dan melakukan smoke test pada APK tanpa Metro.

---

## BAB 4: Exit Criteria dan Gate

### 4.1 Sprint 0 Exit Gate

[x] Seluruh dokumen 000-011 tersedia dan saling terhubung.<br>
[x] Dokumentasi tidak memuat credential atau nilai environment nyata.<br>
[x] Audit, blueprint, workflow, testing, rollout, dan security baseline tersedia.<br>
[x] Migration siap dilacak Git dan local state tetap diabaikan.<br>
[x] Credential plaintext telah dirotasi dan dipindahkan.<br>
[x] Backup telah diamankan.<br>
[x] Baseline development dan production tersedia.<br>
[x] Secret scan dan Git hygiene check lulus.<br>
[x] Production tetap tidak berubah.

Sprint 0 baru dapat ditandai `[LOCKED]` ketika seluruh checklist di atas bernilai `[x]`.

### 4.2 Multi-User Database Exit Gate

[x] User A, B, dan C dapat membuat perangkat sendiri.<br>
[x] User A, B, dan C dapat memiliki kode `HP001` masing-masing.<br>
[x] Cross-user SELECT tidak mengembalikan row.<br>
[x] Cross-user INSERT, UPDATE, dan DELETE ditolak atau difilter oleh RLS.<br>
[x] Anon tidak memiliki akses CRUD ke data tenant.<br>
[x] Signup membuat tepat satu profile.<br>
[x] Profile Auth tersinkron dan object avatar terisolasi per-user.<br>
[x] Migration replay dari database kosong lulus.<br>
[x] Schema lint dan privilege test lulus.

### 4.3 Application Exit Gate

[x] Account switching tidak menampilkan cache user sebelumnya.<br>
[x] Logout tersedia dan berfungsi dari UI.<br>
[x] Semua query tenant di-scope berdasarkan user.<br>
[ ] API utama menggunakan generated database types.<br>
[x] TypeScript lulus tanpa error.<br>
[x] Lint lulus tanpa error atau warning.<br>
[x] Expo Doctor lulus seluruh check pada baseline dependency aktif.<br>
[x] User menyelesaikan regression test Sprint 1 melalui Expo Go.<br>
[x] Commit Sprint 1 yang diuji telah di-push ke branch aktif dan `master`.<br>
[x] Account switching test Sprint 2 melalui Expo Go dan ADB selesai.<br>
[ ] User menguji perubahan foto, nama, email, dan password.<br>
[ ] User memberikan konfirmasi eksplisit `PASS SPRINT 2`.<br>
[ ] Commit Sprint 2 yang diuji telah di-push ke branch aktif dan `master`.

### 4.4 Production Rollout Gate

[x] Rehearsal migration lulus.<br>
[x] Selisih row count dan total nominal adalah nol.<br>
[ ] Owner legacy melihat seluruh data existing.<br>
[x] User baru tidak melihat data legacy.<br>
[ ] Rollback telah diuji.<br>
[x] Backup final terverifikasi.<br>
[x] Approval production tercatat.

---

## BAB 5: Global Multi-User Specifications

### 5.1 Ownership

| Entity | Ownership Source | Cardinality |
| --- | --- | --- |
| Profile | `profiles.id = auth.users.id` | Satu profile per user |
| Device | `devices.user_id = auth.uid()` | Banyak device per user |
| Income | Owner dari `income.device_id -> devices.user_id` | Banyak income per device |
| Payment | Owner dari `payment.device_id -> devices.user_id` | Banyak payment per device |

### 5.2 Security Invariants

1. UI filter bukan security boundary; RLS wajib menolak akses lintas-user.
2. `auth.users.id` adalah identitas otorisasi utama.
3. `profiles` hanya menyimpan data tampilan dan tidak menentukan permission.
4. Client tidak boleh menentukan owner user lain.
5. Service role key tidak boleh masuk aplikasi.
6. Cache tenant harus dibersihkan saat session berubah.
7. Semua exposed table pada schema `public` harus memiliki RLS.

### 5.3 Compatibility Invariants

1. ID perangkat dan transaksi existing tidak berubah.
2. Total income, gross payment, admin fee, net payment, dan saldo tidak berubah akibat refactor.
3. Perangkat production existing dipetakan ke satu owner legacy terverifikasi.
4. Alur perangkat, income, payment, dan saldo existing tetap tersedia.
5. Production tidak digunakan sebagai environment pengujian.

---

## BAB 6: Feature dan Architecture Gap Audit

### 6.1 Route Aktif Saat Ini

```text
/login
/(tabs)/devices
/(tabs)/income
/(tabs)/payment
/(tabs)/balance
/action-sheet-modal
/device-detail
/edit-device
/income-detail
/payment-detail
```

### 6.2 Gap Route dan User Flow

| Module | Route/Flow | Status |
| --- | --- | --- |
| Auth | Login | IMPLEMENTED |
| Auth | Register | IMPLEMENTED dalam `/login` |
| Auth | Protected routes | IMPLEMENTED |
| Auth | Logout | IMPLEMENTED, device QA lulus |
| Account | Foto, ringkasan nama/email, editor pensil, konfirmasi password, password status, versi, dan logout | IMPLEMENTED, device QA tampilan dan validasi lulus |
| Auth | Forgot password | MISSING, non-blocking refactor awal |
| Devices | List dan filter | IMPLEMENTED |
| Devices | Add dan edit | IMPLEMENTED, ownership ditetapkan database |
| Income | Add dan overwrite | IMPLEMENTED |
| Income | Riwayat paginated dan detail transaksi terpilih | IMPLEMENTED, DEVICE QA PASSED |
| Payment | Add dan overwrite | IMPLEMENTED |
| Payment | Riwayat paginated dan detail transaksi terpilih | IMPLEMENTED, DEVICE QA PASSED |
| Balance | Dashboard, donut summary, filter activity, dan detail activity | IMPLEMENTED, DEVICE QA PASSED |
| Multi-user | Cache isolation | IMPLEMENTED, device QA A-B-A lulus |
| Multi-user | Account switching | TEST PASSED |

### 6.3 Gap Database dan Data Layer

| Area | Kondisi Saat Ini | Status |
| --- | --- | --- |
| `devices.user_id` | Default dan trigger memakai `auth.uid()` | IMPLEMENTED |
| `profiles` RLS | Own-profile SELECT dan UPDATE | IMPLEMENTED |
| Income/payment RLS | Mengikuti owner device | VERIFIED A/B/C |
| Device code | Composite unique dan DB-generated per-user | IMPLEMENTED |
| Migration tracking | Migration dilacak, state lokal diabaikan | IMPLEMENTED |
| Generated types | Belum ada | MISSING |
| Query cache scope | Namespace tenant berbasis `user.id` dan clear saat session berubah | IMPLEMENTED |
| Pagination | Riwayat income/payment memakai page 40 row dan virtualized list | IMPLEMENTED |
| Server aggregation | Summary history dan saldo memakai RPC security invoker yang RLS-safe | IMPLEMENTED |
| Transaction constraints | Write baru dijaga; row historis perlu rekonsiliasi | PARTIAL, SPRINT 5 |
| Automated RLS tests | pgTAP 36 assertion dan rollback | IMPLEMENTED |

### 6.4 Prioritas Eksekusi

1. [x] Guardrail Git, credential, backup, dan baseline.
2. [x] Database ownership, profile RLS, dan device code.
3. [x] RLS test User A/B/C.
4. [x] Session cache isolation dan logout.
5. [ ] Generated types dan typed data layer.
6. [ ] Environment/build variants.
7. [ ] Integritas dan performance test skala besar; pagination dan agregasi telah diimplementasikan lebih awal.
8. [ ] Rehearsal dan rollout production.

---

## BAB 7: Catatan Verifikasi dan Gate

Catatan verifikasi 2 Agustus 2026: seluruh project-owned files telah dibaca dan dipetakan. Git worktree bersih sebelum dokumentasi dibuat. Environment Supabase yang terhubung saat audit adalah development; file environment, Supabase local state, dan backup tidak dilacak Git.

Catatan verifikasi 2 Agustus 2026: `npx tsc --noEmit` lulus tanpa error. `npm run lint` lulus dengan 9 warning existing. Expo Doctor meluluskan 17 dari 18 pemeriksaan; satu kegagalan adalah patch mismatch `expo` terpasang `54.0.35` sedangkan versi yang diharapkan `~54.0.36`.

Catatan verifikasi 2 Agustus 2026: dokumen 000-010 dibuat, seluruh link lokal lulus pemeriksaan, dan secret-pattern check pada folder `docs` tidak menemukan credential. Source aplikasi dan database belum diubah pada tahap dokumentasi.

Catatan kebijakan 2 Agustus 2026: pengujian runtime dan acceptance ditetapkan sebagai tanggung jawab user melalui Expo Go pada perangkat fisik yang disediakan user. Agent wajib menunggu konfirmasi eksplisit `PASS`, lalu melakukan commit, push branch aktif, merge non-force ke `master`, dan push `origin/master` sesuai dokumen 010. Approval Git tidak menjadi approval untuk mengubah database production; approval production tetap terpisah.

Catatan kebijakan 2 Agustus 2026: user dapat menyediakan screen capture perangkat melalui scrcpy. Dengan izin user dan koneksi ADB yang valid, agent dapat ikut melakukan Visual QA, mengambil screenshot/rekaman seperlunya, dan membantu reproduksi bug. Artifact yang memuat data pribadi atau credential dilarang masuk Git; keputusan akhir `PASS` tetap berada pada user.

Catatan scope 2 Agustus 2026: aplikasi ditetapkan hanya mendukung Android. Expo Go, scrcpy, Visual QA, build variants, EAS profile, dan release gate hanya berlaku untuk Android. iOS dan web tidak memerlukan environment atau pengujian; konfigurasi sisanya dijadwalkan untuk cleanup Sprint 4.

Catatan distribusi 2 Agustus 2026: user menetapkan bahwa artifact akhir hanya Android APK dan tidak memerlukan AAB/EAS Store build. Development APK digunakan untuk debugging dengan Supabase development. Setelah approval production terpisah dan sinkronisasi migration tervalidasi, artifact akhir dibuat sebagai Internal Production APK standalone yang mengarah ke Supabase production. Sinkronisasi tidak mencakup akun atau data QA development.

Catatan eksekusi Sprint 0 tanggal 2 Agustus 2026: ignore rule diperbaiki sehingga enam migration lokal dapat dilacak dan state Supabase lokal tetap diabaikan. Kontrak environment divalidasi pada startup, EAS profile menjadi eksplisit untuk Development APK dan Internal Production APK, dan profile AAB dihapus. Baseline development/production dicatat pada dokumen 011 tanpa mengakses atau mengubah live production.

Catatan verifikasi Sprint 0 tanggal 2 Agustus 2026: TypeScript lulus tanpa error; lint lulus dengan 9 warning baseline; `expo install --check` menyatakan dependency up to date; Expo Doctor lulus 18/18 setelah Expo diperbarui ke `~54.0.36`; Android export dengan environment development berhasil membundel 3.702 modul; link dokumentasi, JSON parse, ignore rules, prospective secret scan, dan Git hygiene lulus. `npm audit --omit=dev` masih melaporkan 17 advisory transitif (13 moderate, 4 high); force-fix ditolak karena meminta upgrade breaking ke Expo SDK 57.

Catatan keamanan Sprint 0 tanggal 2 Agustus 2026: backup tetap diabaikan Git, tetapi audit lokal mengonfirmasi satu catatan koneksi berisi indikator credential dan dump menyimpan data sensitif. Rotasi credential, pemindahan ke password manager, serta enkripsi/pemindahan backup tetap menunggu tindakan user dan menjadi tiga gate Sprint 0 yang belum lulus.

Catatan pengujian user tanggal 2 Agustus 2026: aplikasi berhasil dijalankan melalui Expo Go menggunakan environment development, session user existing berhasil dipulihkan, dan user melaporkan tidak ada error. Hasil ini dicatat sebagai smoke test runtime lulus, tetapi belum menjadi `PASS SPRINT 0` sampai tindakan keamanan credential dan backup dikonfirmasi selesai.

Catatan backup tanggal 2 Agustus 2026: user telah memindahkan folder `database-backups` keluar workspace dan verifikasi filesystem memastikan folder tersebut tidak lagi tersedia atau muncul pada status Git. User kemudian mengonfirmasi lokasi tujuan, credential, dan backup telah diamankan. Seluruh gate keamanan Sprint 0 dinyatakan terpenuhi.

Catatan approval tanggal 2 Agustus 2026: setelah smoke test tanpa error dan seluruh tindakan keamanan dikonfirmasi selesai, user memberi instruksi eksplisit untuk melakukan commit, push, dan melanjutkan tahap berikutnya. Instruksi ini menjadi `PASS SPRINT 0`; Sprint 0 dikunci dan Sprint 1 diaktifkan.

Catatan eksekusi Sprint 1 tanggal 2 Agustus 2026: migration development disinkronkan secara forward-only sampai `008_reject_cross_tenant_device_owner`. Database kini menetapkan owner perangkat dari `auth.uid()`, menghasilkan kode atomik per-user, melindungi seluruh tabel tenant dengan RLS, memperketat privilege, dan menolak owner lintas tenant. API perangkat tidak lagi menghitung atau mengirim kode dari client. Production tidak diakses atau diubah.

Catatan verifikasi Sprint 1 tanggal 2 Agustus 2026: schema lint development lulus; anon ditolak pada `profiles`, `devices`, `income`, dan `payment`; pgTAP User A/B/C lulus 19 dari 19 assertion pada database development; seluruh migration sampai 008 berhasil direplay dari database lokal kosong; TypeScript lulus; lint lulus dengan 9 warning baseline. Data development lama memiliki setidaknya satu `income.amount <= 0`, sehingga constraint positif dipasang `NOT VALID`: write baru tetap terlindungi, sedangkan rekonsiliasi dan validasi data historis menjadi pekerjaan Sprint 5.

Catatan gate Sprint 1 tanggal 2 Agustus 2026: seluruh database exit gate otomatis telah lulus. Status sprint tetap `VERIFYING` sampai user menguji alur existing pada perangkat Android melalui Expo Go dan memberikan `PASS SPRINT 1`; perubahan Sprint 1 belum boleh di-commit atau di-push sebelum approval tersebut.

Catatan approval Sprint 1 tanggal 2 Agustus 2026: user menyelesaikan regression test melalui Expo Go dan melaporkan tidak ada error. Hasil tersebut diterima sebagai `PASS SPRINT 1`; Sprint 1 dikunci, perubahan diizinkan untuk di-commit dan di-push ke branch aktif serta `master`, lalu Sprint 2 diaktifkan.

Catatan commit Sprint 1 tanggal 2 Agustus 2026: commit `e9bfae8` (`feat: enforce multi-tenant database isolation`) telah di-push ke `origin/feature/multi-user-auth` dan dipromosikan ke `origin/master` melalui fast-forward tanpa force push. Kedua remote branch menunjuk commit yang sama sebelum Sprint 2 dimulai.

Catatan implementasi Sprint 2 tanggal 2 Agustus 2026: AuthProvider mengekspos user aktif, memproses event session tanpa callback async, membatalkan query, dan membersihkan query serta mutation cache sebelum session berbeda ditampilkan. Seluruh query dan invalidation devices, income, payment, balance, serta detail memakai namespace tenant berbasis user ID. Protected route `/account` menampilkan identitas session dan menyediakan logout dengan konfirmasi, loading, serta error handling.

Catatan verifikasi Sprint 2 tanggal 2 Agustus 2026: TypeScript lulus tanpa error; lint lulus dengan 9 warning baseline dan tanpa warning baru; audit source tidak menemukan tenant query key global yang tersisa. Runtime cold start, expired session, protected deep link, dan urutan login A-B-A tetap menjadi device QA sebelum sprint dapat dikunci.

Catatan perluasan Sprint 2 tanggal 2 Agustus 2026: berdasarkan feedback user, ikon akun pada halaman perangkat diperbesar dan header halaman akun disederhanakan menjadi tombol kembali tanpa judul atau background putih. Halaman akun kini menyediakan foto profil dari galeri Android, perubahan nama dan email, perubahan password dengan password saat ini, serta logout. `expo-image-picker` dipasang pada versi kompatibel SDK 54 dan konfigurasi camera/microphone dinonaktifkan karena aplikasi hanya memilih gambar dari galeri.

Catatan database akun tanggal 2 Agustus 2026: migration `009_account_profile_management` telah direplay dari database lokal kosong lalu diterapkan hanya ke development. Migration membuat trigger sinkronisasi Auth ke `profiles`, bucket `avatars` privat dengan batas 5 MB, dan policy SELECT/INSERT/UPDATE/DELETE berdasarkan folder user. pgTAP lokal dan linked development lulus 28/28; schema lint bersih. Production tidak diakses atau diubah.

Catatan verifikasi perluasan Sprint 2 tanggal 2 Agustus 2026: `expo install --check` menyatakan dependency up to date, TypeScript lulus, lint tetap 9 warning baseline tanpa warning baru, dan Expo Doctor lulus 18/18. Runtime upload avatar, konfirmasi email, perubahan password, dan account switching tetap menunggu pengujian Expo Go.

Catatan penyempurnaan UI akun tanggal 2 Agustus 2026: halaman akun diubah menjadi ringkasan read-only. Ikon pensil pada `Informasi Pribadi` dan `Keamanan` membuka editor terpisah; password disembunyikan secara default, memiliki kontrol lihat/sembunyikan, petunjuk persyaratan, dan pesan validasi spesifik. Versi aplikasi ditampilkan di bawah tombol keluar, sedangkan judul `Daftar Perangkat` dan ikon akun kini memakai alignment vertikal yang sama.

Catatan database status password tanggal 2 Agustus 2026: migration forward-only `010_password_change_status` menambahkan `profiles.password_changed_at` dan telah diterapkan hanya ke development. Replay migration 001-010 dari database lokal kosong lulus, pgTAP lokal dan linked development lulus 29/29, serta schema lint development tidak menemukan error. Production tidak diakses atau diubah.

Catatan approval checkpoint tanggal 2 Agustus 2026: user memberi instruksi eksplisit untuk menyelesaikan feedback UI akun lalu melakukan commit dan push ke branch aktif serta `master`. Instruksi ini mengizinkan checkpoint Git Sprint 2 setelah automated verification, tetapi tidak dianggap sebagai `PASS SPRINT 2`; seluruh device QA yang belum dijalankan tetap terbuka dan wajib diuji saat sesi development berikutnya.

Catatan verifikasi checkpoint tanggal 2 Agustus 2026: TypeScript lulus tanpa error; lint lulus tanpa error dan tetap pada 9 warning baseline; dependency check menyatakan seluruh paket sesuai Expo SDK 54; Expo Doctor lulus 18/18; dan Android export development berhasil membundel 3.708 modul. Tidak ada perangkat pada daftar ADB, sehingga Visual QA melalui scrcpy dan runtime QA Expo Go tidak dijalankan pada checkpoint ini.

Catatan commit checkpoint Sprint 2 tanggal 2 Agustus 2026: commit implementasi `aebfe19` (`feat: add isolated account management`) telah di-push ke `origin/feature/multi-user-auth` dan dipromosikan ke `origin/master` melalui fast-forward tanpa force push. Workspace kemudian dikembalikan ke branch `feature/multi-user-auth` untuk kelanjutan development.

Catatan Visual QA tanggal 4 Agustus 2026: perangkat Infinix beresolusi 1080x2400 terhubung melalui ADB dan scrcpy. Login/register, daftar perangkat, seluruh tab utama, action sheet, form tambah perangkat, halaman akun, editor informasi pribadi, editor password, kontrol lihat/sembunyikan, validasi inline, photo picker, konfirmasi logout, serta tampilan versi diperiksa tanpa menulis data. Tidak ditemukan overlap atau clipping pada halaman akun; alignment ikon akun dan judul daftar perangkat lulus. Screenshot dan hierarchy QA disimpan hanya di folder sementara dan tidak masuk Git.

Catatan remediasi Visual QA tanggal 4 Agustus 2026: navigasi ke Pendapatan atau Penarikan sempat membuat saldo pada daftar perangkat berubah menjadi nol karena query saldo dan query opsi perangkat berbagi cache key yang sama. Query key dipisahkan menjadi varian `devices/with-balance` dan `devices/options`, sementara invalidation tetap menggunakan prefix `devices`. Setelah hot reload, saldo tetap konsisten ketika berpindah Perangkat-Pendapatan-Perangkat dan Perangkat-Penarikan-Perangkat. TypeScript lulus tanpa error; lint tetap 9 warning baseline tanpa error baru. Perbaikan menunggu regression test user sebelum commit dan push.

Catatan remediasi tombol simpan tanggal 4 Agustus 2026: burst screenshot mengonfirmasi tombol simpan form perangkat, pendapatan, dan penarikan berkedip karena `KeyboardAvoidingView` Android bersaing dengan pengukuran keyboard dan dynamic sizing milik `@gorhom/bottom-sheet`. Ketiga form kini memakai `BottomSheetTextInput`, snap point statis, mode keyboard `interactive` dengan Android `adjustPan`, serta footer simpan bersama yang tetap berada di atas keyboard. Visual QA tanpa menulis data lulus pada 16 frame Pendapatan, 12 frame Penarikan, dan 12 frame Perangkat tanpa kedipan. TypeScript dan `git diff --check` lulus; lint tetap 9 warning baseline. Perbaikan tetap menunggu regression test user sebelum commit dan push.

Catatan penyempurnaan jarak form tanggal 4 Agustus 2026: tinggi awal bottom sheet disesuaikan dengan panjang masing-masing form menjadi 52% untuk Pendapatan, 78% untuk Penarikan, dan 86% untuk Perangkat. Tombol simpan kini berada dekat dengan field atau ringkasan terakhir tanpa menutupi E-Wallet, sedangkan perilaku keyboard-aware tetap dipertahankan. Visual QA keyboard tambahan lulus pada 8 frame Pendapatan dan 8 frame Perangkat tanpa kedipan.

Catatan penyempurnaan akun tanggal 4 Agustus 2026: email sekunder di bawah foto dan nama dihapus, footer akun mendorong versi aplikasi ke bagian paling bawah dengan jarak yang cukup dari tombol keluar, dan editor keamanan kini memiliki field konfirmasi password baru. Validasi menolak form kosong dan konfirmasi yang berbeda sebelum request perubahan password dikirim.

Catatan regression QA multi-user tanggal 4 Agustus 2026: dua akun QA development yang awalnya kosong diuji melalui Expo Go, ADB, dan scrcpy tanpa mencatat credential ke repository. Akun A menyimpan satu perangkat dengan pendapatan Rp100.000, penarikan Rp50.000, dan saldo Rp50.000; akun B menyimpan perangkat berbeda dengan pendapatan Rp220.000, penarikan Rp70.000, dan saldo Rp150.000. Alur tambah dan edit perangkat, tambah pendapatan, tambah penarikan, detail perangkat, pencarian, filter perangkat, filter periode transaksi, dashboard saldo, editor profil, validasi password, photo picker, logout, serta pergantian akun A-B-A lulus. Tidak ada data akun B pada akun A atau sebaliknya, dan log error yang difilter khusus proses Expo Go kosong. TypeScript lulus tanpa error, `git diff --check` bersih, dan lint tetap pada 9 warning baseline tanpa error atau warning baru.

Catatan implementasi functional hardening tanggal 4 Agustus 2026: item riwayat pendapatan dan penarikan kini membuka detail transaksi terpilih, sementara detail perangkat tetap menampilkan total dan histori perangkat. Dashboard saldo memakai satu donut chart untuk pendapatan, pengeluaran bersih, dan admin fee; activity dapat difilter dan membuka detail transaksi. Register serta perubahan password memakai policy bersama minimal delapan karakter dengan huruf besar, huruf kecil, dan angka, disertai strength meter dan validasi pada data layer.

Catatan skalabilitas tanggal 4 Agustus 2026: riwayat pendapatan dan penarikan dipindahkan dari filter seluruh dataset di memori menjadi query rentang tanggal server-side, pagination 40 row, dan `FlatList` tervirtualisasi. Migration `011_transaction_history_performance` menambahkan index tanggal per perangkat serta RPC summary history dan saldo dengan `security invoker`; migration diterapkan hanya pada development. Loading state kini menampilkan beberapa baris skeleton sesuai struktur layar dan loader terpisah ketika halaman berikutnya diambil.

Catatan verifikasi functional hardening tanggal 4 Agustus 2026: Visual QA Expo Go pada perangkat Android meluluskan detail pendapatan, detail penarikan, skala chart penarikan, donut saldo, filter activity, filter Bulan Lalu/Semua untuk kedua riwayat, dialog rentang tanggal custom, register strength meter, serta editor password tanpa menyimpan perubahan credential. Log `ReactNativeJS:E` proses Expo Go kosong. TypeScript lulus tanpa error, lint lulus tanpa error dengan 4 warning baseline, schema lint development bersih, dan pgTAP linked development lulus 36/36. Performance test dengan dataset besar dan konfirmasi `PASS` akhir user tetap menjadi gate terbuka; production tidak diakses atau diubah.

Catatan revisi UI functional hardening tanggal 4 Agustus 2026: filter riwayat dibagi simetris dalam lebar konten, empty state disamakan dengan margin kartu transaksi, dan donut saldo dibungkus kartu putih selebar hero. Detail pendapatan dan penarikan hanya meminta serta menampilkan transaksi yang dipilih; kartu perangkat dipertahankan dan bagian bawah menjadi satu kartu rincian berisi nominal, tanggal, identitas perangkat, waktu pencatatan, ID transaksi, serta breakdown bruto/admin/net dan e-wallet khusus penarikan. Segmented picker login/register memakai indikator biru beranimasi dengan teks aktif putih. Strength meter disembunyikan ketika password kosong dan muncul setelah karakter pertama.

Catatan verifikasi revisi UI tanggal 4 Agustus 2026: Visual QA hanya menggunakan akun admin yang ditentukan user dan tidak menyimpan perubahan credential. Layout filter, empty state, kartu donut, detail pendapatan, detail penarikan, animasi login/register, serta visibility strength meter pada register dan editor password diperiksa pada perangkat Android 1080x2400. TypeScript dan lint lulus tanpa error atau warning; empat warning hook lama telah diperbaiki. Konfirmasi `PASS` akhir user tetap diperlukan sebelum commit dan push.

Catatan editor transaksi tanggal 4 Agustus 2026: header detail pendapatan dan penarikan kini memiliki ikon pensil yang membuka editor transaksi terpilih. Update serta delete memakai ID transaksi, bukan kombinasi perangkat dan tanggal. Editor menyediakan perubahan nominal dan tanggal, breakdown admin/net untuk penarikan, aksi teks merah `Hapus transaksi` sebelum tombol simpan, serta dialog konfirmasi yang menjelaskan dampak permanen terhadap saldo. Seluruh cache riwayat, perangkat, detail perangkat, dan saldo di-invalidasi setelah mutasi berhasil.

Catatan avatar header tanggal 4 Agustus 2026: tombol akun pada daftar perangkat memuat avatar privat dari profile aktif. Ketika avatar belum tersedia atau gagal dimuat, tombol menampilkan fallback inisial dari nama profile, email, atau `U`, selaras dengan halaman akun. Visual QA hanya memakai akun admin dan mengonfirmasi avatar tersinkron; editor pendapatan, editor penarikan, serta dialog hapus diperiksa tanpa menyimpan atau menghapus data.

Catatan standardisasi radius tanggal 4 Agustus 2026: tema aplikasi kini menetapkan radius bersama sebesar 16 untuk kartu dan surface, 12 untuk tombol serta field, 24 untuk bottom sheet dan popup besar, serta radius penuh untuk avatar, badge, chip, dan kontrol berbentuk lingkaran. Seluruh literal radius pada source aplikasi telah diganti dengan token tema agar perubahan berikutnya tetap konsisten lintas halaman.

Catatan bottom sheet editor transaksi tanggal 4 Agustus 2026: route halaman penuh edit transaksi dihapus. Ikon pensil pada detail pendapatan dan penarikan kini membuka `EditTransactionSheet` yang mengikuti pola form tambah transaksi, tetap menampilkan aksi hapus sebelum tombol simpan, menjaga footer stabil saat keyboard Android terbuka, dan mempertahankan update/delete berbasis ID. Visual QA akun admin meluluskan editor pendapatan, editor penarikan, rincian biaya admin, keyboard numerik, serta dialog konfirmasi hapus tanpa mengubah data.

Catatan penyempurnaan navigasi dan detail perangkat tanggal 4 Agustus 2026: bottom navigation utama kini hanya menampilkan ikon dengan chip biru beranimasi dan ikon putih untuk tab aktif. Skeleton detail perangkat mengikuti header, kartu informasi, saldo, ringkasan, filter, grafik, serta tiga baris transaksi. Seluruh transaksi yang tampil pada detail perangkat kini dapat ditekan dan membuka detail pendapatan atau penarikan yang tepat berdasarkan ID.

Catatan penyempurnaan kalender dan editor tanggal 4 Agustus 2026: date picker native pada form tambah/edit transaksi, filter riwayat, dan filter detail perangkat diganti dengan kalender aplikasi berwarna biru yang mendukung navigasi bulan, indikator hari ini, pilihan tanggal, batal, dan konfirmasi. Tinggi awal editor pendapatan dan penarikan diringkas; Visual QA keyboard numerik memastikan field, aksi hapus, dan tombol simpan tetap terlihat tanpa overlap atau kedipan.

Catatan verifikasi penyempurnaan tanggal 4 Agustus 2026: Visual QA pada perangkat Android 1080x2400 dan akun admin meluluskan tampilan tab tanpa label, posisi chip aktif, kalender bertema, navigasi aktivitas perangkat ke transaksi yang tepat, serta editor pendapatan dengan keyboard terbuka tanpa menulis data. Cold reload memulihkan session dan data perangkat dengan benar; log `ReactNativeJS:E` kosong. TypeScript, lint, `git diff --check`, audit date picker lama, audit literal radius, dan pemindaian credential QA seluruhnya lulus. Perubahan tetap menunggu acceptance test dan konfirmasi `PASS` user sebelum commit atau push.

Catatan keterbacaan detail transaksi tanggal 4 Agustus 2026: baris rincian pendapatan dan penarikan kini memakai kolom label stabil, alignment atas, serta nilai fleksibel dengan line-height eksplisit agar nama perangkat, e-wallet, dan waktu pencatatan dapat membungkus tanpa terpotong. Chip aktif bottom navigation diubah menjadi pill dengan opacity 60%, sementara ikon aktif tetap putih penuh pada layer terpisah. Visual QA akun admin pada layar Android 1080x2400 meluluskan detail pendapatan, detail penarikan, dan pill aktif tanpa overlap atau clipping.

Catatan konsistensi navigasi dan editor akun tanggal 4 Agustus 2026: berdasarkan referensi visual terbaru, indikator aktif bottom navigation memakai latar turunan biru 12% dengan ikon biru utama. FAB memiliki ring putih 8 px dan tidak lagi memakai shadow atau elevation. Editor informasi pribadi dan password dipindahkan dari modal layar penuh ke bottom sheet standar dengan handle, backdrop, radius, keyboard behavior, tombol tutup, serta footer simpan bersama. Snap point awal disesuaikan menjadi 52% untuk profil dan 70% untuk password agar tidak menyisakan ruang kosong berlebihan. Visual QA akun admin pada Android 1080x2400 meluluskan kedua sheet dalam keadaan keyboard terbuka dan tertutup, termasuk keterlihatan seluruh field serta footer simpan; tidak ada data profil atau password yang diubah.

Catatan backup dan rehearsal production tanggal 4 Agustus 2026: backup final role, schema, public data, Auth, dan Storage dibuat di folder lokal yang diabaikan Git serta lulus SHA-256. Snapshot production direstore pada stack Supabase lokal terisolasi. Urutan migration kompatibel lulus, tetapi rehearsal awal menemukan policy CRUD single-user permisif masih aktif; migration `012_finalize_legacy_device_ownership` ditambahkan untuk menghapus policy legacy, memverifikasi owner, melakukan backfill, dan mengunci `devices.user_id` sebagai `NOT NULL`. Setelah perbaikan, admin melihat 22/701/99 row dan user lain melihat 0/0/0.

Catatan sinkronisasi production tanggal 4 Agustus 2026: user memberi approval eksplisit untuk migrasi Auth dengan UUID yang sama. Satu akun admin dibuat dari hash Auth development yang tetap terenkripsi; akun QA lain tidak disalin. Migration history production dibaseline untuk migration historis yang tidak aman dijalankan ulang, kemudian migration `002`, `003`, `004`, `005`, dan `007` sampai `012` diterapkan tanpa error. Development juga diperbarui sampai `012`, lalu link CLI dikembalikan ke development.

Catatan rekonsiliasi production tanggal 4 Agustus 2026: production tetap memiliki 22 perangkat, 701 pendapatan, dan 99 penarikan. Total income Rp6.280.337, gross payment Rp4.888.000, admin fee Rp126.750, dan net payment Rp4.761.250 identik dengan backup. Device tanpa owner, owner salah, orphan income, dan orphan payment seluruhnya nol. Empat tabel tenant memakai RLS, tiga policy transaksi own-data tersedia, tiga RPC ringkasan tersedia, dan bucket avatar privat tersedia. Akun production sementara berhasil login tetapi menerima `*/0` untuk ketiga tabel tenant, lalu akun dan profile tersebut dihapus.

Catatan versi tanggal 4 Agustus 2026: versi aplikasi pada Expo config, package metadata, lockfile, dan fallback halaman akun diselaraskan menjadi `2.0.0`. Android memakai `versionCode` 20 dan EAS memakai version source lokal agar metadata APK identik dengan commit release.

Catatan verifikasi otomatis final tanggal 4 Agustus 2026: TypeScript lulus tanpa error, lint lulus tanpa error atau warning, dependency Expo SDK 54 sesuai, Expo Doctor lulus 18/18, pgTAP linked development lulus 36/36, `git diff --check` tidak menemukan whitespace error, dan seluruh metadata versi terverifikasi `2.0.0`. Folder backup tetap diabaikan dan tidak memiliki file yang dilacak Git; migration historis `006` tetap dilacak untuk menjaga replay deterministik.

Catatan sanitasi release tanggal 4 Agustus 2026: migration `006` dan `012` tidak lagi menyimpan UUID owner literal. Backfill hanya berjalan ketika tepat satu Auth user tersedia, sehingga kondisi ambigu dihentikan sebelum data berubah. `git grep` pada tree release tidak menemukan UUID admin, backup tetap diabaikan, dan environment EAS production telah diverifikasi sama dengan `.env.snack-pub` tanpa mencatat nilainya.

Catatan risiko aktif:

1. Penyimpanan nyata perubahan avatar/nama/email/password, expired session, cold start tanpa jaringan, dan protected deep link belum diverifikasi; semuanya tetap menjadi gate aktif Sprint 2.
2. Migration historis `006` tetap dilacak karena bagian dari replay development. Migration `012` menangani database legacy secara forward-only dan production telah direkonsiliasi; file historis tidak dihapus dari Git.
3. Data development historis memiliki nominal income non-positif; write baru sudah ditolak constraint, tetapi validasi seluruh row menunggu rekonsiliasi Sprint 5.
4. Command Android dan package variant belum seluruhnya eksplisit; pekerjaan ini tetap dijadwalkan pada Sprint 4.
5. Dependency transitif masih memiliki advisory yang belum memiliki jalur perbaikan aman pada Expo SDK 54.
6. Rollback penuh rehearsal dan smoke test login admin melalui Internal Production APK masih terbuka.
7. Backup final production masih berada di workspace dan wajib dipindahkan user ke lokasi aman.

---

## BAB 8: Lock Policy

Berkas `009-Status-Proyek.md` bersifat **LOCKED** untuk struktur BAB dan definisi gate, tetapi berstatus **ACTIVE** untuk pembaruan progress.

Aturan pembaruan:

1. AI Agent atau developer wajib membaca dokumen ini sebelum memulai perubahan.
2. Item hanya boleh diubah dari `[ ]` menjadi `[x]` setelah implementasi dan verifikasi selesai.
3. Fase hanya boleh berubah menjadi `[LOCKED]` setelah seluruh exit gate fase tersebut lulus.
4. Hanya satu fase atau sprint yang boleh berstatus `[CURRENT]`.
5. Setiap penyelesaian penting wajib menambahkan catatan verifikasi bertanggal pada BAB 7.
6. Temuan scope baru wajib dicatat pada gap audit sebelum dikerjakan.
7. Detail desain tetap mengikuti `002-Blueprint.md`; detail urutan kerja mengikuti `003-Workflow.md`.
8. Credential, token, password, data pribadi, dan nilai environment nyata dilarang dicatat di dokumen ini.
9. Production hanya boleh disentuh setelah seluruh Production Rollout Gate lulus dan approval eksplisit tersedia.
10. Commit dan push final dilakukan setelah user menyatakan pengujian Expo Go selesai dan lulus; checkpoint implementasi sebelum gate tersebut hanya boleh dilakukan melalui instruksi eksplisit user dan tidak mengubah status QA menjadi lulus.
11. Setelah hasil `PASS`, agent wajib mempromosikan commit ke branch aktif dan `master` tanpa force-push.
12. Seluruh checklist platform, build, dan QA hanya berlaku untuk Android.
13. Artifact akhir hanya APK; AAB dan submission Google Play Store berada di luar scope.
14. Development APK dilarang menggunakan Supabase production; akses production hanya dimiliki Internal Production APK setelah rollout disetujui.
