PROJECT SPECIFICATION

Project:
SNACK Device Manager

Version:
2.1.0-beta

---

TECHNOLOGY STACK

Frontend:

- Expo SDK 54
- React Native
- Expo Router
- React Query
- Reanimated
- React Native Element Dropdown
- Gorhom Bottom Sheet

Backend:

- Supabase

Database:

- PostgreSQL

---

DATABASE

devices

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

income

Fields:

- id
- device_id
- amount
- trx_date
- created_at

payment

Fields:

- id
- device_id
- gross_amount
- admin_fee
- net_amount
- trx_date
- created_at

Relationships:

income.device_id
→ devices.id

payment.device_id
→ devices.id

---

BUSINESS RULES

Device

- Device dapat aktif atau nonaktif.
- Device nonaktif tidak boleh menerima pemasukan.
- Device dapat memiliki e-wallet atau kosong.
- Saldo device dihitung dari:
  Total Income - Total Gross Payment.

Income

- 1 Device hanya boleh memiliki 1 pemasukan per tanggal.
- Jika data sudah ada:
  - tampilkan konfirmasi.
  - user dapat menimpa data lama.

Payment

- 1 Device hanya boleh memiliki 1 penarikan per tanggal.
- Jika data sudah ada:
  - tampilkan konfirmasi.
  - user dapat menimpa data lama.

Admin Fee:

Dana = 2500

OVO = 2500

GoPay = 2500

ShopeePay = 750

Jika e-wallet kosong:

- penarikan tidak diizinkan.
- user diarahkan ke Edit Device.

---

DESIGN RULES

Current Design:
Original Design UI

Completed:

✅ Device List V2
✅ Device Detail
✅ Add Device
✅ Edit Device

✅ Income V2
✅ Add Income

✅ Payment V2
✅ Add Payment

✅ Balance V2 Final

Current Target:

🔄 UI_CONSISTENCY_V1

---

UI CONSISTENCY TARGET

Theme

Completed:

- COLORS
- SPACING
- RADIUS
- SHADOW

Global Components

Planned:

- EmptyState.tsx
- Skeleton.tsx Refinement

Standard Components

Target:

- Unified Radius
- Unified Shadow
- Unified Typography
- Unified Spacing
- Unified Empty State
- Unified Loading State

---

PROJECT RULES

1. Semua source code berasal dari ChatGPT.

2. Source code terbaru menjadi checkpoint terbaru.

3. History chat adalah source of truth.

4. Jangan meminta file yang sudah ada pada checkpoint history.

5. Jika file tidak berubah maka dianggap fixed.

6. Setiap perubahan wajib mengirim FULL SOURCE CODE.

7. Jangan mengirim potongan code kecuali diminta user.

8. Jangan memberikan penjelasan yang tidak diminta.

9. Kerjakan sesuai instruksi user.

10. Selalu menjaga kompatibilitas:

- Expo SDK 54
- Expo Router
- React Query
- Supabase
- Reanimated
- Gorhom Bottom Sheet

11. Setiap revisi harus dapat langsung replace file lama.

12. Design UI adalah acuan utama project.

13. Dashboard bukan bagian dari design UI saat ini.

14. Current Active Checkpoint:
    BALANCE_V2_FINAL

15. Current Development:
    UI_CONSISTENCY_V1
