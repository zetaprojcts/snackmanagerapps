# PROJECT SPECIFICATION

Project:
SNACK Device Manager

Version:
2.2.0-beta

---

# TECHNOLOGY STACK

Frontend:

- Expo SDK 54
- React Native
- Expo Router
- React Query
- Reanimated
- Lucide React Native
- React Native Element Dropdown
- Gorhom Bottom Sheet

Backend:

- Supabase

Database:

- PostgreSQL

---

# DATABASE

## devices

Fields:

- id
- code
- brand
- device_name
- phone_number
- email
- ewallet
- is_active
- created_at

---

## income

Fields:

- id
- device_id
- amount
- trx_date
- created_at

Rules:

- 1 device hanya boleh memiliki 1 pemasukan per tanggal
- Duplicate akan memunculkan dialog timpa data

---

## payment

Fields:

- id
- device_id
- gross_amount
- admin_fee
- net_amount
- trx_date
- created_at

Rules:

- 1 device hanya boleh memiliki 1 penarikan per tanggal
- Duplicate akan memunculkan dialog timpa data

---

# BUSINESS RULES

## Device

- Device dapat aktif atau nonaktif
- Device nonaktif tidak boleh menerima pemasukan
- Device tanpa e-wallet tidak boleh melakukan penarikan
- Device balance = income - gross payment

---

## Income

- Duplicate date validation
- Override existing record
- Active device only

---

## Payment

Admin Fee:

Dana = 2500

OVO = 2500

GoPay = 2500

ShopeePay = 750

Rules:

- Device harus memiliki e-wallet
- Device harus aktif
- Duplicate date validation
- Override existing record

---

# DESIGN RULES

Reference:
Original Snack Device Manager UI

Implemented:

✅ Device List V2
✅ Device Detail
✅ Add Device
✅ Edit Device

✅ Income V2
✅ Add Income

✅ Payment V2
✅ Add Payment

✅ Balance V2 Final

---

# UI SYSTEM

Theme:

- COLORS
- SPACING
- RADIUS
- SHADOW

Global Components:

- EmptyState
- Skeleton

Skeleton Variants:

- DeviceCardSkeleton
- TransactionCardSkeleton
- BalanceCardSkeleton

---

# CURRENT DEVELOPMENT

Checkpoint:
UI_CONSISTENCY_V1

Completed:

✅ Theme Refactor
✅ EmptyState
✅ Skeleton System

Pending:

⏳ Income Refactor
⏳ Payment Refactor
⏳ Device Detail Refactor
⏳ Add Device Polish
⏳ Edit Device Polish
⏳ Add Income Polish
⏳ Add Payment Polish

---

# PROJECT RULES

1. Semua source code berasal dari ChatGPT.

2. Source code terbaru menjadi checkpoint terbaru.

3. History chat adalah source of truth.

4. Jangan meminta file yang sudah pernah dikirim.

5. Jika file tidak berubah maka dianggap fixed.

6. Setiap perubahan wajib mengirim FULL SOURCE CODE.

7. Jangan mengirim potongan code kecuali diminta user.

8. Jangan memberikan penjelasan yang tidak diminta.

9. Kerjakan sesuai instruksi user.

10. Design UI adalah acuan utama project.

11. Dashboard bukan bagian dari design UI saat ini.

12. Selalu menjaga kompatibilitas Expo SDK 54.

13. Semua revisi harus dapat langsung replace file lama.

14. Empty State dan Skeleton wajib menjadi standar seluruh screen.

15. Current Active Checkpoint:
    UI_CONSISTENCY_V1
