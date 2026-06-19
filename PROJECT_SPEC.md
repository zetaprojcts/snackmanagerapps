PROJECT_SPEC

Project Name

SNACK Device Manager

---

Purpose

Application for managing multiple earning devices and monitoring:

- Daily Income
- Withdrawals
- Balance
- Device Status
- Financial Statistics

---

Technology Stack

Frontend

Expo SDK 54

React Native

Expo Router

TanStack Query

Reanimated

Gesture Handler

Gifted Charts

Lucide Icons

Element Dropdown

---

Backend

Supabase

---

Database

PostgreSQL

---

Main Modules

Device Management

Functions:

- Add Device
- Edit Device
- View Device
- Filter Device
- Search Device
- Device Status

---

Income Management

Functions:

- Add Income
- View Income History
- Filter Income
- Replace Duplicate Income

---

Withdrawal Management

Functions:

- Add Withdrawal
- View Withdrawal History
- Filter Withdrawal
- Replace Duplicate Withdrawal

---

Balance Management

Functions:

- Total Balance
- Income Summary
- Withdrawal Summary
- Admin Fee Summary

---

Business Rules

Device

Active Device:

- Can receive income
- Can receive withdrawal

Inactive Device:

- Cannot receive income
- Cannot receive withdrawal

---

Income

Constraint:

1 Device

1 Income

1 Date

Duplicate:
Show overwrite confirmation

---

Withdrawal

Constraint:

1 Device

1 Withdrawal

1 Date

Duplicate:
Show overwrite confirmation

---

Ewallet Requirement

Withdrawal only allowed when:

ewallet != null

ewallet != "-"

---

Dashboard V2 Specification

Header

Greeting

Date

User Summary

---

Hero Card

Total Balance

---

Statistics Grid

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

Latest Withdrawals

---

Design Language

Modern

Minimal

Financial Dashboard

Blue Accent

Rounded Corners

Soft Shadows

High Readability

Mobile First

---

Folder Structure Target

app

components

features

lib

theme

assets

---

Release Target

Android First

Expo Build

Play Store Ready

---

Current Development Target

SNACK-DM-CP-002

Deliverables:

- Dashboard V2
- Analytics Dashboard
- Improved Statistics
- Activity Feed
