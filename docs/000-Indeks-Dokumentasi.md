# Indeks Dokumentasi Snack Manager

Dokumentasi ini adalah sumber acuan refactor Snack Manager dari aplikasi single-user menjadi multi-user. Seluruh implementasi harus dilakukan pada environment development terlebih dahulu. Database dan aplikasi production tidak boleh diubah sebelum seluruh gate pengujian dan persetujuan rollout terpenuhi.

## Dokumen Utama

| Urutan | Dokumen | Tujuan |
| --- | --- | --- |
| 001 | [Hasil Audit](./001-Hasil-Audit.md) | Kondisi proyek saat ini, risiko, dan prioritas perbaikan. |
| 002 | [Blueprint](./002-Blueprint.md) | Arsitektur target, invariant, batas sistem, dan kriteria keberhasilan. |
| 003 | [Workflow](./003-Workflow.md) | Urutan sprint refactor, gate, output, dan definition of done. |
| 004 | [Arsitektur Data dan RLS](./004-Arsitektur-Data-dan-RLS.md) | Model ownership, policy, constraint, dan strategi query. |
| 005 | [Strategi Environment dan Build](./005-Strategi-Environment-dan-Build.md) | Pemisahan development/production serta aturan build dan release. |
| 006 | [Rencana Pengujian](./006-Rencana-Pengujian.md) | Matriks pengujian aplikasi, database, RLS, dan regresi. |
| 007 | [Migrasi Production dan Rollback](./007-Migrasi-Production-dan-Rollback.md) | Rehearsal, cutover, rekonsiliasi, dan rollback. |
| 008 | [Keamanan dan Operasional](./008-Keamanan-dan-Operasional.md) | Aturan kredensial, logging, akses, backup, dan respons insiden. |
| 009 | [Status Proyek](./009-Status-Proyek.md) | Status pekerjaan, hasil verifikasi, blocker, dan riwayat penyelesaian. |
| 010 | [Protokol Expo Go dan Promosi Git](./010-Protokol-Expo-Go-dan-Promosi-Git.md) | Handoff pengujian perangkat, approval user, commit, push branch, dan promosi ke master. |
| 011 | [Baseline Database](./011-Baseline-Database.md) | Snapshot struktur development dan production yang menjadi dasar migration serta rekonsiliasi. |

## Status Program

- Tahap saat ini: Sprint 0, guardrail dan baseline.
- Branch aktif saat audit: `feature/multi-user-auth`.
- Environment aktif saat audit: development.
- Production: tetap menggunakan perilaku existing dan tidak disentuh.
- Implementasi kode: guardrail environment sedang dikerjakan; schema database belum diubah.
- Status rinci pekerjaan: lihat [Status Proyek](./009-Status-Proyek.md).

## Aturan Perubahan Dokumentasi

1. Setiap perubahan desain harus diperbarui di Blueprint sebelum atau bersamaan dengan implementasi.
2. Status pekerjaan hanya diperbarui di Workflow setelah bukti verifikasi tersedia.
3. Perubahan schema harus dicatat di Arsitektur Data dan RLS serta Migrasi Production.
4. Temuan baru yang memengaruhi risiko harus ditambahkan ke Hasil Audit.
5. Kredensial, token, password, dan nilai `.env` tidak boleh dimasukkan ke dokumentasi.
