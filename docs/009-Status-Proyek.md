# 009-STATUS-PROYEK

**Version:** 1.6.0 (Sprint 0 Locked, Sprint 1 Active)<br>
**Status:** LOCKED & ACTIVE<br>
**Target Readers:** Developer dan Autonomous AI Development Agents<br>
**Single Source of Truth (SSOT):** Status eksekusi, checklist, dan gate refactor multi-user Snack Manager<br>
**Last Updated:** 2 Agustus 2026

---

## BAB 1: Status Fase Global

Pengembangan Snack Manager mempertahankan seluruh fungsi single-user yang sudah berjalan, lalu menambahkan ownership dan isolasi multi-user secara bertahap. Seluruh perubahan dilakukan pada development terlebih dahulu. Production tetap tidak disentuh sampai rehearsal dan approval pada fase terakhir.

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

[CURRENT] SPRINT 1: Database Multi-Tenant

- Memperbaiki ownership `devices`.
- Melindungi `profiles` dengan RLS.
- Membuat device code unik per-user dan atomik.
- Merapikan policy, grant, function, index, dan constraint.
- Membuktikan isolasi dengan User A, B, dan C.

[PENDING] SPRINT 2: Auth dan Session Isolation

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

[PENDING] SPRINT 6: QA, Rehearsal, dan Rollout

- Menjalankan seluruh acceptance test dan regression test.
- Melakukan rehearsal dari backup production.
- Memigrasikan data legacy ke owner yang diverifikasi.
- Melakukan rekonsiliasi, rollback rehearsal, dan rollout dengan approval eksplisit.

---

## BAB 2: Objektif Sprint Aktif

Sprint 0 belum mengubah fitur aplikasi maupun schema database. Fokusnya adalah memastikan pekerjaan selanjutnya dapat dilakukan dengan aman, dapat direproduksi, dan tidak memengaruhi production.

Fokus Sprint 0:

1. Dokumentasi menjadi SSOT dan saling terhubung.
2. Migration dapat dilacak Git, sedangkan `.temp`, `.env`, dan backup tetap diabaikan.
3. Credential plaintext dirotasi dan dipindahkan ke penyimpanan aman.
4. Baseline schema development dan production tercatat tanpa credential.
5. Target environment selalu eksplisit sebelum command development, build, atau migration dijalankan.

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

1. [ ] Membandingkan schema live development dengan migration lokal.
2. [ ] Membuat corrective migration forward-only.
3. [ ] Mengaktifkan RLS pada `profiles`.
4. [ ] Membuat policy own-profile untuk SELECT dan UPDATE.
5. [ ] Mengamankan `handle_new_user` dengan fixed `search_path`.
6. [ ] Mengarahkan `devices.user_id` ke `auth.users(id)` dengan cascade yang benar.
7. [ ] Menetapkan owner perangkat dari session database.
8. [ ] Mengubah unique device code menjadi `(user_id, code)`.
9. [ ] Membuat generator device code atomik per-user.
10. [ ] Menghapus duplicate constraint dan database object mati.
11. [ ] Memperketat grant function, sequence, dan table.
12. [ ] Menambahkan constraint integritas income dan payment.
13. [ ] Membuat test RLS User A, B, dan C.
14. [ ] Replay migration dari database kosong.

### 3.3 Sprint 2: Auth dan Session Isolation

1. [ ] Menambahkan `user` pada kontrak AuthProvider.
2. [ ] Membatalkan request tenant saat user berubah.
3. [ ] Membersihkan React Query cache saat logout atau pergantian user.
4. [ ] Membuat seluruh tenant query key berbasis `user.id`.
5. [ ] Menambahkan halaman akun.
6. [ ] Menambahkan tombol dan error handling logout.
7. [ ] Menguji cold start, expired session, dan deep link privat.
8. [ ] Menguji urutan login A, logout, login B, lalu login A kembali.

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

1. [ ] Memperbaiki `payment-detail` agar memakai skala chart hasil kalkulasi.
2. [ ] Menyelesaikan warning lint yang relevan.
3. [ ] Menambahkan pagination history.
4. [ ] Memindahkan filter tanggal ke server-side query.
5. [ ] Membuat agregasi saldo/statistik yang RLS-safe.
6. [ ] Menetapkan definisi gross, net, admin fee, dan saldo.
7. [ ] Menambahkan performance test dataset besar.
8. [ ] Memastikan hasil saldo identik dengan baseline.

### 3.7 Sprint 6: QA dan Rollout

1. [ ] Menjalankan seluruh static check dan automated test yang tersedia.
2. [ ] Menyiapkan Expo Go development server dan checklist pengujian.
3. [ ] Menyerahkan URL/QR Expo Go kepada user.
4. [ ] Menghubungkan scrcpy/ADB bila user menyediakan dan mengizinkan perangkat.
5. [ ] Melakukan Visual QA kolaboratif melalui scrcpy bila tersedia.
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
16. [ ] Restore backup production ke environment rehearsal.
17. [ ] Membuat dan memverifikasi owner legacy.
18. [ ] Menjalankan migration pada rehearsal.
19. [ ] Menjalankan rekonsiliasi row count dan total nominal.
20. [ ] Menjalankan RLS test pada hasil rehearsal.
21. [ ] Menguji rollback pada rehearsal.
22. [ ] Mendapatkan approval eksplisit terpisah untuk database production.
23. [ ] Mengambil backup final production.
24. [ ] Menjalankan migration production.
25. [ ] Menjalankan smoke test dan monitoring pascarilis.
26. [ ] Memastikan schema, policy, function, dan constraint production sinkron dengan migration yang disetujui.
27. [ ] Memastikan akun dan data QA development tidak tersalin ke production.
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

[ ] User A, B, dan C dapat membuat perangkat sendiri.<br>
[ ] User A, B, dan C dapat memiliki kode `HP001` masing-masing.<br>
[ ] Cross-user SELECT tidak mengembalikan row.<br>
[ ] Cross-user INSERT, UPDATE, dan DELETE ditolak.<br>
[ ] Anon tidak memiliki akses CRUD ke data tenant.<br>
[ ] Signup membuat tepat satu profile.<br>
[ ] Migration replay dari database kosong lulus.<br>
[ ] Schema lint dan privilege test lulus.

### 4.3 Application Exit Gate

[ ] Account switching tidak menampilkan cache user sebelumnya.<br>
[ ] Logout tersedia dan berfungsi dari UI.<br>
[ ] Semua query tenant di-scope berdasarkan user.<br>
[ ] API utama menggunakan generated database types.<br>
[ ] TypeScript lulus tanpa error.<br>
[ ] Lint lulus tanpa warning yang tidak disetujui.<br>
[ ] Expo Doctor lulus seluruh check.<br>
[ ] User menyelesaikan regression test fitur existing melalui Expo Go.<br>
[ ] User memberikan konfirmasi eksplisit `PASS`.<br>
[ ] Commit yang diuji telah di-push ke branch aktif dan `master`.

### 4.4 Production Rollout Gate

[ ] Rehearsal migration lulus.<br>
[ ] Selisih row count dan total nominal adalah nol.<br>
[ ] Owner legacy melihat seluruh data existing.<br>
[ ] User baru tidak melihat data legacy.<br>
[ ] Rollback telah diuji.<br>
[ ] Backup final terverifikasi.<br>
[ ] Approval production tercatat.

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
| Auth | Logout | MISSING |
| Account | Profile/account page | MISSING |
| Auth | Forgot password | MISSING, non-blocking refactor awal |
| Devices | List dan filter | IMPLEMENTED |
| Devices | Add dan edit | IMPLEMENTED, ownership belum benar |
| Income | Add dan overwrite | IMPLEMENTED |
| Payment | Add dan overwrite | IMPLEMENTED |
| Balance | Dashboard dan activity | IMPLEMENTED |
| Multi-user | Cache isolation | MISSING |
| Multi-user | Account switching | MISSING |

### 6.3 Gap Database dan Data Layer

| Area | Kondisi Saat Ini | Status |
| --- | --- | --- |
| `devices.user_id` | Ada pada migration, tidak diisi oleh app | BLOCKER |
| `profiles` RLS | Belum ada | BLOCKER |
| Income/payment RLS | Mengikuti owner device | PARTIAL, perlu test |
| Device code | Unique global dan client-generated | BLOCKER |
| Migration tracking | Folder Supabase diabaikan Git | MISSING |
| Generated types | Belum ada | MISSING |
| Query cache scope | Global lintas-session | BLOCKER |
| Pagination | Belum ada | MISSING |
| Server aggregation | Belum ada | MISSING |
| Transaction constraints | Belum lengkap | PARTIAL |
| Automated RLS tests | Belum ada | MISSING |

### 6.4 Prioritas Eksekusi

1. [x] Guardrail Git, credential, backup, dan baseline.
2. [ ] Database ownership, profile RLS, dan device code.
3. [ ] RLS test User A/B/C.
4. [ ] Session cache isolation dan logout.
5. [ ] Generated types dan typed data layer.
6. [ ] Environment/build variants.
7. [ ] Integritas, pagination, dan agregasi.
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

Catatan risiko aktif:

1. Insert perangkat belum menetapkan owner.
2. Cache React Query belum diisolasi per-user.
3. Tabel `profiles` belum memiliki RLS.
4. Device code masih unik secara global.
5. Migration backfill memakai UUID hard-coded.
6. Credential masih tersimpan plaintext di backup lokal dan belum dikonfirmasi telah dirotasi.
7. Command Android/package variant belum seluruhnya eksplisit.
8. Dependency transitif masih memiliki advisory yang belum memiliki jalur perbaikan aman pada Expo SDK 54.

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
10. Commit dan push final hanya dilakukan setelah user menyatakan pengujian Expo Go selesai dan lulus.
11. Setelah hasil `PASS`, agent wajib mempromosikan commit ke branch aktif dan `master` tanpa force-push.
12. Seluruh checklist platform, build, dan QA hanya berlaku untuk Android.
13. Artifact akhir hanya APK; AAB dan submission Google Play Store berada di luar scope.
14. Development APK dilarang menggunakan Supabase production; akses production hanya dimiliki Internal Production APK setelah rollout disetujui.
