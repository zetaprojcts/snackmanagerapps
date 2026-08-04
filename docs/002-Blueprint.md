# Blueprint Multi-User Snack Manager

## Visi

Snack Manager menjadi aplikasi pencatatan perangkat dan transaksi yang dapat digunakan banyak user tanpa mengubah pengalaman inti aplikasi. Setiap user hanya dapat melihat dan mengelola perangkat serta transaksi miliknya sendiri.

## Platform Target

- Platform yang didukung: Android.
- Runtime pengujian: Expo Go pada perangkat Android fisik.
- Distribusi akhir: Android APK standalone melalui EAS Internal Distribution; AAB dan Google Play Store tidak termasuk scope.
- iOS dan web tidak termasuk scope implementasi, build, QA, atau release.
- Konfigurasi serta dependency khusus iOS/web yang tidak diperlukan akan dibersihkan secara terkontrol pada Sprint 4.

## Ruang Lingkup

### Termasuk

- Registrasi, login, session persistence, logout, dan account switching.
- Kepemilikan perangkat oleh tepat satu user.
- Kepemilikan income dan payment melalui perangkat.
- Isolasi data di database melalui RLS.
- Isolasi state dan cache di aplikasi.
- Pemisahan development dan production.
- Migrasi data single-user production ke akun owner yang ditentukan.
- Dukungan Android Development APK untuk debugging dan Internal Production APK untuk pemakaian akhir.

### Tidak Termasuk

- Dukungan, build, deployment, atau QA iOS dan web.
- Berbagi perangkat antar-user.
- Organisasi, role, atau permission bertingkat.
- Transfer ownership perangkat.

## Model Kepemilikan

```text
auth.users
  1 -> 1 profiles
  1 -> N devices
           1 -> N income
           1 -> N payment
```

`auth.users.id` adalah identitas utama. `profiles` menyimpan data tampilan, bukan sumber otorisasi. `devices.user_id` menjadi boundary tenant. `income` dan `payment` tidak memerlukan `user_id` tambahan selama semua akses diwajibkan melewati perangkat dan foreign key tidak dapat dilewati.

## Invariant Sistem

1. Semua row `devices` harus memiliki `user_id` valid.
2. User hanya dapat SELECT, INSERT, UPDATE, dan DELETE perangkat miliknya.
3. User hanya dapat mengakses transaksi dari perangkat miliknya.
4. Client tidak boleh memilih owner atas nama user lain.
5. Pergantian session harus menghapus data cache user sebelumnya.
6. Kode perangkat unik dalam lingkup satu user, bukan secara global.
7. Satu perangkat hanya memiliki satu income dan satu payment per tanggal.
8. Semua nilai transaksi harus valid dan konsisten di database.
9. Development tidak boleh menulis ke database production.
10. Production tidak dimigrasikan sebelum rehearsal dan rekonsiliasi lulus.
11. APK akhir hanya boleh mengarah ke production setelah schema dan migration production tervalidasi sinkron dengan baseline development yang disetujui.

## Arsitektur Aplikasi Target

### Presentation Layer

- Expo Router mengatur protected route.
- Screen hanya mengonsumsi hook/query terstruktur.
- Halaman akun menampilkan identitas aktif dan menyediakan logout.
- Build development memiliki identitas visual yang jelas.
- Editor transaksi dibuka sebagai bottom sheet dari halaman detail, mengikuti pola form tambah transaksi.
- Editor profil dan password menggunakan bottom sheet, keyboard behavior, serta footer simpan yang sama dengan form utama.
- Bottom navigation utama hanya menampilkan ikon, dengan indikator aktif berbentuk chip yang berpindah secara halus.
- Seluruh pemilihan tanggal memakai kalender aplikasi yang konsisten dengan warna, radius, dan aksesibilitas UI.
- Aktivitas pada detail perangkat membuka detail transaksi terpilih berdasarkan ID, tanpa mengubah ringkasan perangkat.
- Loading detail perangkat merepresentasikan seluruh struktur layar dan beberapa baris transaksi, bukan satu kartu generik.

### Session Layer

- `AuthProvider` menyediakan `session`, `user`, `loading`, dan `signOut`.
- Perubahan `user.id` menjadi event boundary untuk reset cache.
- Tidak ada data query yang digunakan sebelum session selesai dipulihkan.

### Data Layer

- Supabase client tetap satu instance.
- Semua API menggunakan generated `Database` types.
- Query key menggunakan factory dan selalu memuat `user.id` untuk data tenant.
- Error database diterjemahkan ke error domain yang stabil.
- Pagination dan filter tanggal dilakukan server-side untuk riwayat besar.

### Database Layer

- `devices.user_id` mengacu langsung pada `auth.users(id)` dengan cascade delete.
- Owner default berasal dari `auth.uid()` dan divalidasi policy.
- RLS aktif pada seluruh tabel schema `public` yang exposed.
- Agregasi atau RPC menggunakan security invoker kecuali ada alasan teruji untuk security definer.
- Function security definer memakai fixed `search_path` dan privilege minimum.

## Standar Surface dan Radius

- `RADIUS.card` bernilai 16 dan digunakan untuk kartu serta surface konten.
- `RADIUS.control` bernilai 12 dan digunakan untuk tombol, field, serta kontrol interaktif.
- `RADIUS.sheet` bernilai 24 dan digunakan pada sudut atas bottom sheet atau popup besar milik aplikasi.
- `RADIUS.full` digunakan untuk avatar, badge, chip, indikator, dan kontrol yang memang berbentuk lingkaran atau pill.
- Komponen tidak menulis literal `borderRadius` sendiri; perubahan standar dilakukan melalui token tema bersama.
- Dialog kalender milik aplikasi menggunakan `RADIUS.sheet`, sementara dialog native Android yang tersisa mengikuti bentuk sistem operasi.

## Strategi Cache

Format query key target:

```text
['user', userId, 'devices']
['user', userId, 'device', deviceId]
['user', userId, 'income', filters]
['user', userId, 'payment', filters]
['user', userId, 'balance', filters]
```

Pada `SIGNED_OUT`, `USER_DELETED`, atau perubahan user ID, query tenant dibatalkan dan cache dibersihkan sebelum navigator privat dirender kembali.

## Strategi Device Code

- Format tampilan dipertahankan: `HP001`, `HP002`, dan seterusnya.
- Constraint unik: `(user_id, code)`.
- Nomor berikutnya dibuat secara atomik di database.
- Client tidak menghitung nomor terakhir sebagai sumber kebenaran.
- Konflik concurrency diuji dengan dua insert paralel untuk user yang sama.

## Strategi Kompatibilitas Single-User

- Seluruh perangkat production existing dipetakan ke satu akun owner legacy.
- ID perangkat dan transaksi tidak diubah.
- Total row dan total nominal sebelum/sesudah migrasi harus identik.
- UI inti perangkat, income, payment, dan saldo dipertahankan.
- Rollout multi-user tidak menghapus kemampuan owner lama mengakses data existing.

## Non-Functional Requirements

- Security: tidak ada cross-tenant read/write melalui API atau cache.
- Reliability: migration dapat diulang dari database kosong pada CI/local.
- Performance: layar utama tidak memerlukan full-table scan client untuk histori tanpa batas.
- Maintainability: schema dan API bertipe serta terdokumentasi.
- Operability: environment aktif dapat dikenali dan release dapat di-rollback.
- Distribution: artefak akhir berupa APK yang dapat dijalankan tanpa Metro; tidak ada AAB atau submission ke Play Store.

## Kriteria Keberhasilan

1. User A, B, dan C masing-masing dapat memiliki `HP001` tanpa konflik.
2. User A tidak dapat membaca atau memutasi UUID milik User B, termasuk melalui request manual.
3. Logout User A lalu login User B tidak pernah menampilkan data User A.
4. Registrasi membuat satu profil yang benar dan tidak membuka profil user lain.
5. Data production legacy tetap utuh setelah rehearsal.
6. TypeScript, lint, Expo Doctor, test RLS, dan smoke test lulus.
7. Semua migration dan dokumen tercatat di Git tanpa kredensial.
