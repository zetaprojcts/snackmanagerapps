# Baseline Database

## Tujuan

Dokumen ini mencatat baseline yang digunakan untuk merancang migration multi-user dan melakukan rekonsiliasi. Tidak ada koneksi write atau perubahan terhadap database production saat baseline dibuat.

## Sumber Baseline

| Target | Sumber | Tanggal sumber | Tingkat keyakinan |
| --- | --- | --- | --- |
| Development | Sebelas migration pada `supabase/migrations`, migration history linked, schema lint, dan pgTAP | 2 Agustus 2026 | Terverifikasi pada live development dan replay lokal kosong |
| Production | Backup lokal `snack-pub-2026-08-01` | 1 Agustus 2026 | Snapshot, bukan verifikasi live production |

Nilai environment, project reference, credential, UUID user, dan data pribadi tidak dicatat di dokumen ini.

## Histori Migration Development

Migration yang tersedia dan telah direplay berurutan:

1. `001_initial_schema`
2. `002_create_profiles`
3. `002b_backfill_profiles`
4. `003_add_devices_user_id`
5. `004_create_indexes`
6. `005_enable_rls`
7. `006_migrate_existing_data`
8. `007_harden_multi_tenant_schema`
9. `008_reject_cross_tenant_device_owner`
10. `009_account_profile_management`
11. `010_password_change_status`

Migration 001-006 adalah histori awal dan tidak diubah. Migration 002b serta 007-010 merupakan corrective migration forward-only yang membuat replay aman, memperketat boundary tenant, serta menambahkan pengelolaan profile dan status perubahan password.

## Baseline Development Sebelum Sprint 1

Struktur yang dinyatakan oleh rangkaian migration:

| Area | Kondisi |
| --- | --- |
| Tabel tenant | `profiles`, `devices`, `income`, dan `payment` |
| Ownership | `devices.user_id` tersedia dan berstatus `NOT NULL` pada snapshot awal |
| RLS | Aktif pada `devices`, `income`, dan `payment` |
| Profile RLS | Belum didefinisikan |
| Device code | Masih unik global |
| Signup | Trigger membuat profile melalui function `SECURITY DEFINER` tanpa fixed `search_path` |
| Backfill | Migration terakhir memuat UUID owner hard-coded |
| Transaksi | Unique per perangkat dan tanggal tersedia; constraint nilai belum lengkap |

Catatan: migration lokal adalah histori yang harus dipertahankan. Kekurangan di atas diperbaiki melalui corrective migration baru pada Sprint 1, bukan dengan mengubah file yang sudah ada.

## Kondisi Development Setelah Sprint 1

| Area | Kondisi terverifikasi |
| --- | --- |
| Ownership | `devices.user_id` mengarah ke `auth.users(id)`, cascade delete, default `auth.uid()`, dan trigger menolak owner asing |
| RLS | Aktif pada `profiles`, `devices`, `income`, dan `payment` dengan policy per-user |
| Anon | Tidak memiliki akses CRUD pada tabel tenant |
| Device code | Unique `(user_id, code)` dan dihasilkan atomik oleh database; setiap user dapat memiliki `HP001` |
| Signup | Trigger profile memakai fixed `search_path`, referensi fully qualified, dan privilege minimum |
| Profile update | Perubahan nama/email Auth disinkronkan ke `profiles` melalui trigger hardened |
| Password status | `profiles.password_changed_at` mencatat perubahan password yang berhasil dilakukan melalui halaman akun |
| Avatar | Bucket privat 5 MB; object dibatasi ke folder `auth.uid()` masing-masing |
| Transaksi | Write baru menjaga income positif serta konsistensi payment; constraint belum divalidasi terhadap seluruh row historis |
| Pengujian | pgTAP User A/B/C lulus 29/29 pada linked development dan migration replay dari database lokal kosong lulus |
| Production | Tidak diakses atau diubah selama Sprint 1 |

Audit data menemukan row development historis dengan `income.amount <= 0`. Constraint dipasang `NOT VALID`, sehingga write baru tetap diperiksa tanpa menggagalkan migration karena data lama. Rekonsiliasi row historis dan `VALIDATE CONSTRAINT` dijadwalkan pada Sprint 5.

## Baseline Production

Snapshot production masih menggunakan model single-user:

| Area | Kondisi snapshot |
| --- | --- |
| Tabel aplikasi | `devices`, `income`, dan `payment` |
| Tabel profile | Tidak ada |
| Ownership perangkat | Kolom `user_id` belum ada |
| RLS | Aktif pada tiga tabel aplikasi |
| Policy | Policy CRUD bersifat permisif dan belum membatasi owner |
| Device code | Sequence global dan unique global |
| Auth user dalam backup data | Tidak tersedia |

Jumlah row aplikasi pada snapshot:

| Relation | Row |
| --- | ---: |
| `devices` | 22 |
| `income` | 659 |
| `payment` | 94 |

Jumlah ini menjadi baseline minimum untuk rehearsal. Rekonsiliasi production tetap harus menghitung ulang row dan total nominal dari backup final saat cutover.

## Gap Development dan Production

1. Production belum memiliki `profiles` dan ownership perangkat.
2. Policy production memungkinkan CRUD tanpa boundary user.
3. Development sudah memiliki ownership, profile RLS, dan generator kode per-user; production belum menerima perubahan ini.
4. Production masih memakai sequence dan uniqueness global sampai rehearsal serta rollout disetujui.
5. Backup tidak membawa auth user yang dapat langsung menjadi owner legacy.
6. Migration backfill development tidak portabel karena mengikat satu UUID environment.

## Implikasi Migration

1. Owner legacy production harus dibuat atau dipilih dan diverifikasi langsung dari `auth.users` sebelum backfill.
2. Corrective migration harus menerima kondisi awal development dan snapshot production secara eksplisit.
3. `user_id` tidak boleh dibuat `NOT NULL` sebelum seluruh perangkat memiliki owner valid.
4. Policy permissive production harus diganti dengan policy berbasis `auth.uid()` dalam maintenance window.
5. Row count, orphan, duplicate, dan total nominal wajib bernilai sama sebelum dan sesudah migration.

## Keamanan Backup

Folder backup sudah diabaikan Git. Audit lokal menemukan satu catatan koneksi yang memuat indikator credential serta dump data yang dapat memuat data autentikasi dan pribadi. Nilainya tidak dibaca ke dokumentasi dan tidak boleh di-commit.

Status tindakan keamanan user:

1. [x] Rotasi credential yang pernah disimpan plaintext.
2. [x] Pindahkan credential ke password manager.
3. [x] Enkripsi atau pindahkan backup ke penyimpanan terbatas.

## Verifikasi Lanjutan

Status verifikasi baseline:

1. [x] Schema live development dibandingkan dengan migration lokal.
2. [ ] Backup production direstore pada rehearsal terisolasi pada Sprint 6.
3. [x] Migration development dapat direplay dari kosong dan test boundary tenant lulus.
4. [x] Tidak ada koneksi atau perubahan production tanpa approval eksplisit user.
