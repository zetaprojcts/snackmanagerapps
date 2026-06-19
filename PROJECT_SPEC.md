PROJECT SPECIFICATION

Project Name:
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
- React Native Reanimated
- React Native Element Dropdown
- Gorhom Bottom Sheet

Backend:

- Supabase

Database:

- PostgreSQL

---

DATABASE STRUCTURE

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

---

BUSINESS RULES

Device

- Device dapat aktif atau nonaktif.
- Device nonaktif tidak dapat menerima pemasukan.
- Device dapat memiliki atau tidak memiliki e-wallet.
- Balance device dihitung dari:
  Total Income - Total Gross Payment

Income

- 1 device hanya boleh memiliki 1 pemasukan per tanggal.
- Jika data sudah ada:
  - tampilkan konfirmasi.
  - user dapat menimpa data lama.

Payment

- 1 device hanya boleh memiliki 1 penarikan per tanggal.
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

UI STATUS

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

🔄 Dashboard V2

---

PROJECT WORKFLOW RULES

1. Semua source code adalah hasil generate ChatGPT.

2. Source code terbaru menjadi checkpoint terbaru.

3. History chat adalah source of truth.

4. Jangan meminta file yang sudah pernah diberikan dan belum berubah.

5. Jika file tidak berubah maka dianggap fixed.

6. Setiap perubahan file wajib mengirim FULL SOURCE CODE.

7. Jangan mengirim potongan code kecuali diminta user.

8. Jangan memberikan penjelasan yang tidak diminta.

9. Kerjakan sesuai instruksi user.

10. Setiap revisi harus kompatibel dengan:

- Expo SDK 54
- Expo Router
- React Query
- Supabase
- Reanimated
- Gorhom Bottom Sheet

11. Setiap file yang direvisi harus bisa langsung replace file lama.

12. Seluruh progress wajib mengikuti checkpoint terbaru.

13. Current Active Checkpoint:
    BALANCE_V2_FINAL

14. Next Development Target:
    DASHBOARD_V2
