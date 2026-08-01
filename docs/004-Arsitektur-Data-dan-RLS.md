# Arsitektur Data dan RLS

## Tujuan

Dokumen ini menetapkan boundary tenant dan aturan otorisasi database. UI dan filter client bukan security boundary. Supabase Row Level Security adalah lapisan yang wajib menolak akses lintas-user, termasuk request yang dibuat di luar aplikasi.

## Model Data Target

### profiles

| Kolom | Aturan |
| --- | --- |
| `id` | Primary key dan foreign key ke `auth.users(id)` dengan `ON DELETE CASCADE` |
| `full_name` | Nama tampilan user, nullable sesuai kebijakan registrasi |
| `email` | Data profil opsional; jangan digunakan sebagai identifier otorisasi |
| `avatar_url` | Opsional |
| `created_at` | Timestamp UTC, immutable |
| `updated_at` | Timestamp UTC, diperbarui trigger |

### devices

| Kolom | Aturan |
| --- | --- |
| `id` | UUID primary key |
| `user_id` | `NOT NULL`, FK langsung ke `auth.users(id)`, cascade delete |
| `code` | Format `HPnnn`, unik bersama `user_id` |
| `device_name` | Wajib |
| `brand` | Nilai domain yang dikenali aplikasi |
| `phone_number`, `email`, `ewallet` | Opsional |
| `is_active` | Boolean, default true |
| `created_at`, `updated_at` | Timestamp UTC |

Kolom `status` yang redundan dengan `is_active` harus dihapus atau memiliki satu definisi resmi. Target awal adalah mempertahankan `is_active` sebagai sumber kebenaran.

### income

| Kolom | Aturan |
| --- | --- |
| `id` | UUID primary key |
| `device_id` | FK ke `devices(id)`, cascade delete |
| `trx_date` | Tanggal transaksi, wajib |
| `amount` | Numeric dan lebih besar dari nol |
| `created_at`, `updated_at` | Timestamp UTC |

Constraint unik: `(device_id, trx_date)`.

### payment

| Kolom | Aturan |
| --- | --- |
| `id` | UUID primary key |
| `device_id` | FK ke `devices(id)`, cascade delete |
| `trx_date` | Tanggal transaksi, wajib |
| `gross_amount` | Numeric dan lebih besar dari nol |
| `admin_fee` | Numeric dan tidak negatif |
| `net_amount` | Harus sama dengan `gross_amount - admin_fee` |
| `created_at`, `updated_at` | Timestamp UTC |

Constraint unik: `(device_id, trx_date)` dan hanya satu constraint untuk aturan tersebut.

## Matriks RLS Target

| Tabel | Operasi | Rule |
| --- | --- | --- |
| `profiles` | SELECT | `id = auth.uid()` |
| `profiles` | UPDATE | Existing dan new row harus `id = auth.uid()` |
| `profiles` | INSERT | Dilakukan trigger signup, bukan client umum |
| `profiles` | DELETE | Tidak diberikan pada client awal |
| `devices` | SELECT | `user_id = auth.uid()` |
| `devices` | INSERT | New row harus `user_id = auth.uid()` |
| `devices` | UPDATE | Existing dan new row harus dimiliki user aktif |
| `devices` | DELETE | Existing row harus dimiliki user aktif |
| `income` | Semua CRUD | Device terkait harus dimiliki `auth.uid()` |
| `payment` | Semua CRUD | Device terkait harus dimiliki `auth.uid()` |

Role `anon` tidak mendapatkan akses CRUD ke empat tabel tersebut. Role `authenticated` hanya memperoleh privilege yang diperlukan dan tetap dibatasi RLS. Role `service_role` hanya digunakan oleh proses server terpercaya, tidak pernah dikirim ke aplikasi.

## Owner Assignment

Urutan pertahanan yang direkomendasikan:

1. `devices.user_id` memiliki default berbasis `auth.uid()`.
2. Policy INSERT memiliki `WITH CHECK (user_id = auth.uid())`.
3. Client tidak menerima field `user_id` dari form.
4. Generated types dan API input memisahkan field user-editable dari field sistem.

Filter `.eq('user_id', user.id)` di client boleh digunakan untuk kejelasan atau optimasi, tetapi bukan pengganti RLS.

## Generator Device Code

Generator harus berjalan di database dan memenuhi hal berikut:

- Menggunakan owner dari session database.
- Mengunci proses penentuan nomor untuk satu user agar dua insert paralel tidak memperoleh nomor sama.
- Membaca nomor maksimum milik user tersebut.
- Menghasilkan minimal tiga digit dan dapat berkembang melewati 999.
- Didukung constraint unik `(user_id, code)` sebagai pertahanan terakhir.

Function lama yang mengacu pada `NEW.device_code` tidak sesuai dengan kolom `code` dan tidak menjadi sumber kebenaran target.

## Index Target

- `devices(user_id)`.
- Unique `devices(user_id, code)`.
- `income(device_id, trx_date DESC)`.
- `payment(device_id, trx_date DESC)`.
- Index tambahan hanya dibuat setelah query nyata atau execution plan menunjukkan kebutuhan.

## Function dan Trigger

- `handle_new_user`: `SECURITY DEFINER`, fixed `search_path`, fully qualified table, privilege minimum.
- Timestamp trigger: satu implementasi konsisten untuk seluruh tabel.
- Function tidak boleh executable oleh `anon` kecuali memang menjadi API publik yang dirancang.
- RPC agregasi memakai security invoker agar policy caller tetap berlaku.

## Aturan Migration

1. Jangan edit migration yang telah applied pada database bersama.
2. Gunakan nama timestamp dan deskripsi yang menjelaskan satu tujuan.
3. Migration harus transactional sejauh operasi mendukung.
4. Pisahkan perubahan schema dari backfill data besar bila perlu.
5. Tambahkan assertion sebelum constraint `NOT NULL` atau unique diterapkan.
6. Replay migration dari database kosong dan uji upgrade dari baseline existing.
7. File dalam `.temp` tidak boleh dilacak Git.
