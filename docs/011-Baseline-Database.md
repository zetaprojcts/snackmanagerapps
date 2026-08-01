# Baseline Database

## Tujuan

Dokumen ini mencatat baseline yang digunakan untuk merancang migration multi-user dan melakukan rekonsiliasi. Tidak ada koneksi write atau perubahan terhadap database production saat baseline dibuat.

## Sumber Baseline

| Target | Sumber | Tanggal sumber | Tingkat keyakinan |
| --- | --- | --- | --- |
| Development | Enam migration lokal pada `supabase/migrations` dan metadata link lokal | 31 Juli 2026 | Provisional sampai dibandingkan dengan schema live development |
| Production | Backup lokal `snack-pub-2026-08-01` | 1 Agustus 2026 | Snapshot, bukan verifikasi live production |

Nilai environment, project reference, credential, UUID user, dan data pribadi tidak dicatat di dokumen ini.

## Baseline Development

Migration lokal yang tersedia:

1. `001_initial_schema`
2. `002_create_profiles`
3. `003_add_devices_user_id`
4. `004_create_indexes`
5. `005_enable_rls`
6. `006_migrate_existing_data`

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
3. Development sudah memiliki rancangan ownership, tetapi profile RLS dan insert owner aplikasi belum lengkap.
4. Strategi device code kedua environment masih menggunakan uniqueness global.
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

Tindakan yang tetap memerlukan user:

1. Rotasi credential yang pernah disimpan plaintext.
2. Pindahkan credential ke password manager.
3. Enkripsi atau pindahkan backup ke penyimpanan terbatas.

## Verifikasi Lanjutan

Baseline ini menjadi final setelah:

1. Schema live development dibandingkan dengan migration lokal menggunakan akses read-only.
2. Backup production direstore pada rehearsal terisolasi.
3. Migration dapat direplay dan seluruh query rekonsiliasi lulus.
4. Tidak ada koneksi atau perubahan production tanpa approval eksplisit user.
