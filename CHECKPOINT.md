CHECKPOINT

Checkpoint ID

SNACK-DM-CP-001

Date

Current Project Checkpoint

---

Current Database

devices

Columns

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

income

Columns

- id
- device_id
- amount
- trx_date

Business Rules

- One income per device per date
- Duplicate blocked by database
- User can overwrite duplicate data

---

payment

Columns

- id
- device_id
- gross_amount
- admin_fee
- net_amount
- trx_date

Business Rules

- One withdrawal per device per date
- Duplicate blocked by database
- User can overwrite duplicate data

---

Current Financial Logic

Balance

Balance =
Total Income

Total Gross Withdrawal

---

Withdrawal

Net Withdrawal =
Gross Withdrawal

Admin Fee

---

Admin Fee Rules

ShopeePay = 750

Dana = 2500

OVO = 2500

GoPay = 2500

Default = 0

---

Supported Brands

Samsung

Oppo

Vivo

Xiaomi

Realme

Infinix

---

Active Screens

Tabs

devices.tsx

income.tsx

payment.tsx

balance.tsx

---

Detail

device-detail.tsx

edit-device.tsx

---

Modal

action-sheet-modal.tsx

---

Bottom Sheet

AddDeviceSheet

AddIncomeSheet

AddPaymentSheet

BrandFilterSheet

---

Current Theme

Primary:
#0D47FF

Background:
#F8FAFC

Card:
#FFFFFF

Text:
#1E293B

TextMuted:
#64748B

Border:
#E2E8F0

Success:
#10B981

Warning:
#F59E0B

Danger:
#EF4444

---

Current Assets

icon.png

adaptive-icon.png

favicon.png

splash.png

---

Device Assets

samsung.png

oppo.png

vivo.png

xiaomi.png

realme.png

infinix.png

default.png

---

UI Revision Status

Completed

✅ Devices Screen V2

✅ Income Screen V2

✅ Payment Screen V2

✅ Add Device V2

✅ Edit Device V2

✅ Add Income V2

✅ Add Payment V2

---

Partial

⚠ Device Detail

⚠ Balance Screen

---

Pending

❌ Dashboard V2

❌ Analytics

❌ Reports

---

Next Checkpoint

SNACK-DM-CP-002

Goal:
Dashboard V2 Completed
