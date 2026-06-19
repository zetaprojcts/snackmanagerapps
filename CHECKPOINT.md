CHECKPOINT

Checkpoint ID

SNACK-DM-CP-001

---

Current Repository Status

Framework:
Expo SDK 54

Routing:
Expo Router

Backend:
Supabase

Database:
PostgreSQL

State Query:
TanStack Query

Charts:
react-native-gifted-charts

Bottom Sheet:
@gorhom/bottom-sheet

Animation:
react-native-reanimated

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

Rules

- One income per device per date
- Duplicate blocked by database
- User can overwrite data

---

payment

Columns

- id
- device_id
- gross_amount
- admin_fee
- net_amount
- trx_date

Rules

- One withdrawal per device per date
- Duplicate blocked by database
- User can overwrite data

---

Current Financial Logic

Balance

Balance =
Total Income

Total Gross Withdrawal

---

Net Withdrawal

Net Withdrawal =
Gross Withdrawal

Admin Fee

---

Admin Fee

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

Current Navigation

Devices

Income

Action

Payment

Balance

---

Current Splash System

Custom Splash Overlay

Animated Progress Bar

Fade Out Animation

Asset:
assets/splash.png

---

Active Screens

Devices Screen V2

Income Screen V2

Payment Screen V2

Balance Screen

Device Detail

Edit Device

Action Sheet Modal

Add Device Sheet

Add Income Sheet

Add Payment Sheet

Brand Filter Sheet

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

❌ Reporting

---

Current Assets

icon.png

adaptive-icon.png

favicon.png

splash.png

samsung.png

oppo.png

vivo.png

xiaomi.png

realme.png

infinix.png

default.png

---

Next Checkpoint

SNACK-DM-CP-002

Goal:
Dashboard V2 Completed
