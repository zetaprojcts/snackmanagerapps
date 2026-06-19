PROJECT_SPEC

Project Name

SNACK Device Manager

---

Purpose

Application for managing multiple devices and monitoring:

- Daily Income
- Withdrawals
- Device Status
- Device Performance
- Balance
- Financial Statistics

---

Technology Stack

Frontend

Expo SDK 54

React Native

Expo Router

TanStack Query

React Native Reanimated

React Native Gesture Handler

React Native Gifted Charts

React Native Element Dropdown

Lucide React Native

---

Backend

Supabase

---

Database

PostgreSQL

---

Current Database Tables

devices

income

payment

---

Current Device Code Format

HP001

HP002

HP003

...

Generated Automatically

---

Current Supported Ewallet

Dana

OVO

GoPay

ShopeePay

---

Main Modules

Device Management

- Add Device
- Edit Device
- Device Detail
- Device Search
- Device Filter
- Device Status

---

Income Management

- Add Income
- Income History
- Income Filter
- Duplicate Validation
- Overwrite Existing Data

---

Payment Management

- Add Withdrawal
- Withdrawal History
- Withdrawal Filter
- Duplicate Validation
- Overwrite Existing Data

---

Balance Management

- Total Balance
- Total Income
- Total Withdrawal
- Admin Fee Summary

---

Business Rules

Device

Active Device

- Can receive income
- Can create withdrawal

Inactive Device

- Cannot receive income
- Cannot create withdrawal

---

Income

1 Device

=

1 Income

=

1 Date

Duplicate:

Show overwrite confirmation

---

Withdrawal

1 Device

=

1 Withdrawal

=

1 Date

Duplicate:

Show overwrite confirmation

---

Ewallet Requirement

Withdrawal allowed only when:

ewallet != null

ewallet != "-"

---

Current Dashboard

balance.tsx

Status:

Temporary Dashboard

Will be replaced by:

Dashboard V2

---

Dashboard V2 Target

Hero Section

Total Balance

Financial Overview

---

Statistics

Total Devices

Active Devices

Inactive Devices

Total Income

Total Withdrawal

Admin Fee

---

Analytics

Income Trend

Withdrawal Trend

Balance Trend

---

Quick Actions

Add Device

Add Income

Add Withdrawal

---

Recent Activities

Latest Income

Latest Withdrawal

---

Development Rules

Checkpoint Rules

- Source code yang dikirim pada chat menjadi checkpoint terbaru.
- Checkpoint terbaru menggantikan checkpoint sebelumnya untuk file yang sama.
- Checkpoint menjadi source of truth project.

---

Communication Rules

- Jangan meminta ulang file yang sudah pernah dikirim dan belum berubah.
- Gunakan checkpoint terbaru yang tersedia sebagai referensi utama.
- Prioritaskan membaca checkpoint sebelum meminta data tambahan.

---

Code Delivery Rules

- Setiap perubahan file wajib mengirim full source code.
- Jangan mengirim potongan source code.
- Jangan mengirim perubahan per baris.
- Full file menjadi checkpoint baru.

---

Documentation Rules

Setelah fitur besar selesai:

- Update PROJECT_STATUS.md
- Update CHECKPOINT.md

Jika requirement berubah:

- Update PROJECT_SPEC.md

---

Working Rules

- Fokus pada task yang diperintahkan.
- Jangan memberikan penjelasan yang tidak diminta.
- Selalu menjaga konsistensi dengan checkpoint project.

---

Release Target

Android First

Expo Build

Play Store Ready

---

Current Development Target

SNACK-DM-CP-002

Deliverables

- Dashboard V2
- Analytics Dashboard
- Improved Statistics
- Activity Feed
