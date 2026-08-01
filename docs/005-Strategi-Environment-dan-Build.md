# Strategi Environment dan Build

## Tujuan

Development harus terisolasi dari production pada level database, command, build profile, package identifier, dan penampilan aplikasi. Kesalahan command tidak boleh diam-diam mengarahkan developer ke production.

## Platform Scope

Strategi ini hanya berlaku untuk Android. iOS dan web tidak didukung dan tidak memerlukan environment, build profile, artifact, atau QA tersendiri.

## Environment Resmi

| Environment | Fungsi | Database | Distribusi |
| --- | --- | --- | --- |
| `development` | Coding, debugging, dan acceptance test | Supabase development | Expo Go atau Development APK |
| `internal-production` | Pemakaian akhir setelah rollout disetujui | Supabase production yang telah disinkronkan | Standalone Internal Android APK |

Tidak ada AAB atau submission Google Play Store dalam scope. Istilah "sinkron" berarti production menerima urutan migration, schema, function, trigger, policy, dan constraint yang telah lulus di development/rehearsal. Akun, transaksi, dan data QA development tidak disalin ke production. Data legacy production tetap dipertahankan dan dimigrasikan secara terkontrol.

## Variable Contract

Variable client yang diperlukan:

```text
EXPO_PUBLIC_APP_ENV
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY
```

Nilai dengan prefix `EXPO_PUBLIC_` masuk ke bundle dan harus dianggap dapat dibaca end user. Service role key, database password, JWT secret, dan credential admin tidak boleh menggunakan prefix tersebut atau berada dalam aplikasi.

## Local Development

- `npm start` selalu mengarah ke development.
- Command Android harus memiliki varian eksplisit, misalnya `android:dev` dan `android:pub`.
- Command production tidak menjadi default dan harus terlihat jelas pada nama script.
- Startup gagal cepat bila URL/key kosong atau `EXPO_PUBLIC_APP_ENV` tidak sesuai nilai yang dikenal.
- Log hanya menyebut nama environment, tidak menampilkan URL lengkap atau key.

## App Variant

Konfigurasi app dinamis harus membedakan minimal:

| Properti Android | Development | Production |
| --- | --- | --- |
| App name | `Snack Manager Dev` | `Snack Manager` |
| Android package | Suffix `.dev` | Identifier production existing |
| Scheme | Scheme development terpisah | Scheme production existing |
| Visual marker | Badge/label development | Tidak ada |

Identifier production existing tidak boleh diganti tanpa rencana store migration terpisah.

Konfigurasi `ios`, `web`, serta script/dependency yang hanya dibutuhkan kedua platform tersebut akan ditinjau dan dibersihkan pada Sprint 4. Pembersihan tidak boleh mengganggu Expo Router atau dependency Android.

## EAS

Setiap profile di `eas.json` harus menetapkan environment secara eksplisit:

```text
development        -> environment development, developmentClient true, APK
internal-production -> environment production, internal distribution, APK
```

Variable disimpan pada EAS Environment Variables. Local `.env` tetap diabaikan Git. Build artifact harus mencatat profile dan commit yang digunakan tanpa mencatat nilai credential.

Development APK digunakan untuk debugging dan biasanya terhubung ke Metro. Internal Production APK tidak menggunakan `developmentClient`, memuat bundle aplikasi di dalam APK, dan dapat dibuka mandiri tanpa Metro.

## Guardrail

1. Internal Production APK menolak `EXPO_PUBLIC_APP_ENV` selain production.
2. Development build menolak URL production.
3. Build profile tidak boleh mencampur `developmentClient` dengan credential production.
4. Script migrasi meminta target project secara eksplisit dan mencetak nama target sebelum eksekusi.
5. Command destructive memerlukan backup terverifikasi dan approval.

## Secret Handling

- Simpan database password dalam password manager.
- Gunakan EAS secret/sensitive sesuai kebutuhan build, tetapi ingat nilai client tetap publik.
- Jangan menaruh service role key di `.env` aplikasi.
- Jangan menaruh credential dalam Markdown, issue, commit, screenshot, atau log.
- Backup yang mengandung data pengguna disimpan terenkripsi dan memiliki retention policy.

## Release Gate

- Expo Doctor lulus.
- Dependency sesuai Expo SDK 54.
- Development APK dan Internal Production APK diverifikasi mengarah ke project yang benar.
- Tidak ada `.env`, `.temp`, backup, atau secret dalam Git diff.
- Smoke test login dan isolasi data lulus pada artifact yang akan dirilis.
- User telah menyatakan pengujian Expo Go pada perangkat fisik selesai dan lulus.
- Commit hasil pengujian telah dipromosikan ke branch aktif dan `master` sesuai protokol Git.
- Migration production telah disetujui secara terpisah, dijalankan, dan direkonsiliasi sebelum Internal Production APK dibuat.
- Artifact akhir adalah APK standalone; tidak ada AAB.
