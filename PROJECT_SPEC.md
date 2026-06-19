# PROJECT_SPEC.md

## PROJECT

SNACK Device Manager

## TUJUAN

Aplikasi manajemen perangkat untuk mengelola:

- Device
- Income
- Payment
- Balance
- Reporting

Menggunakan:

- Expo SDK 54
- Supabase
- React Query
- Expo Router

## DATABASE

### devices

- id
- code
- brand
- device_name
- phone_number
- email
- ewallet
- is_active
- created_at

### income

- id
- device_id
- amount
- trx_date

Constraint:
1 Device = 1 Income per Hari

### payment

- id
- device_id
- gross_amount
- admin_fee
- net_amount
- trx_date

Constraint:
1 Device = 1 Payment per Hari

## RULE PROJECT

### RULE SOURCE CODE

- Semua source code berasal dari ChatGPT
- Setiap revisi menjadi checkpoint baru
- Jangan mengubah file di luar scope task
- Kirim source code full
- Jika lebih dari 300 baris wajib dibagi beberapa bagian
- Tidak boleh mengirim patch parsial
- Tidak boleh mengirim potongan fungsi
- Selalu gunakan checkpoint terakhir sebagai source of truth

### RULE UI

Wajib mengikuti Design UI V2.

Karakteristik:

- Clean
- Rounded
- Soft Shadow
- White Card
- Blue Primary
- Consistent Spacing

### RULE EMPTY STATE

Semua halaman data wajib memiliki:

- Empty State
- Empty Message
- Empty Description

### RULE SKELETON

Semua halaman data wajib memiliki:

- Loading Skeleton
- Loading Placeholder

### RULE ANIMATION

Wajib menggunakan Reanimated.

Minimal:

- FadeInUp
- FadeInDown

Untuk:

- Card
- List
- Detail Page

### RULE DATA

Saldo Device:

Balance =
Total Income

---

Total Gross Payment

Saldo Global:

## Total Income

Total Gross Payment

## CURRENT CHECKPOINT

DEVICE_DETAIL_V2_FIXED

## NEXT TARGET

1. Device List Animation
2. Income Skeleton Integration
3. Payment Skeleton Integration
4. Dashboard Final V2
5. Reusable Component Refactor
