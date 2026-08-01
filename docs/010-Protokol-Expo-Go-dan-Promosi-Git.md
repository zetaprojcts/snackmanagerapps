# Protokol Expo Go dan Promosi Git

**Version:** 1.2.0 (Android APK Distribution)<br>
**Status:** LOCKED & ACTIVE<br>
**Owner Pengujian Runtime:** User<br>
**Owner Implementasi dan Git Promotion:** Agent<br>
**Platform:** Android only<br>

---

## 1. Tujuan

Dokumen ini menetapkan proses handoff pengujian menggunakan Expo Go atau Development APK, tindakan Git setelah user menyatakan pengujian lulus, dan boundary menuju Internal Production APK.

## 2. Prinsip

1. Pengujian runtime dilakukan pada environment development.
2. User melakukan pengujian melalui Expo Go atau Development APK pada perangkat Android fisik yang disediakan user.
3. Agent tidak mengklaim pengujian perangkat telah lulus tanpa konfirmasi user.
4. Commit dan push final menunggu konfirmasi eksplisit `PASS`.
5. Push dilakukan ke branch aktif dan `master` pada origin.
6. Force-push, reset destructive, dan penghapusan history dilarang.
7. Approval Git tidak memberi izin otomatis untuk migration database production.
8. Scrcpy/ADB dapat digunakan untuk Visual QA kolaboratif setelah user mengizinkan perangkat.
9. Development APK hanya mengarah ke Supabase development.
10. Artifact akhir adalah Internal Production APK standalone; AAB dan Google Play Store tidak termasuk scope.

## 3. Persiapan Handoff oleh Agent

Sebelum menyerahkan aplikasi untuk diuji, agent wajib:

1. Memastikan environment aktif adalah development.
2. Memeriksa Git diff dan menjaga perubahan tetap sesuai scope.
3. Menjalankan TypeScript, lint, Expo dependency check, dan test otomatis yang tersedia.
4. Menjalankan Expo development server yang dapat diakses perangkat user.
5. Memberikan URL/QR Expo Go atau Development APK sesuai tahap pengujian.
6. Menjelaskan perubahan yang perlu diperhatikan tanpa menjelaskan ulang fungsi UI di dalam aplikasi.
7. Memberikan checklist kasus uji dan expected result.
8. Mencatat commit baseline atau status worktree yang sedang diuji.

## 4. Mode Visual QA dengan Scrcpy

User dapat menyediakan screen capture perangkat menggunakan scrcpy. Bila `adb devices` menunjukkan perangkat terotorisasi, agent dapat membantu:

- Mengamati tampilan dan interaksi secara langsung.
- Menjalankan langkah reproduksi yang disetujui user.
- Memeriksa overflow, safe area, keyboard, modal, bottom sheet, dan navigasi.
- Mengambil screenshot atau rekaman untuk membandingkan hasil perbaikan.
- Mencatat hasil visual sebagai bukti pendukung.

Aturan privasi:

1. Gunakan akun dan data development.
2. Jangan membuka data production atau aplikasi pribadi lain selama capture.
3. Jangan memasukkan screenshot/video yang memuat PII atau credential ke Git.
4. Simpan artifact pada lokasi sementara atau path yang diabaikan Git.
5. Hapus artifact yang tidak lagi diperlukan.
6. Agent tidak melakukan tindakan destructive pada perangkat tanpa instruksi eksplisit.

Visual QA oleh agent adalah bukti tambahan. Status `PASS` final tetap harus diberikan user.

## 5. Pengujian oleh User

User menjalankan checklist pada perangkat fisik dan memberikan salah satu hasil:

- `PASS`: seluruh kasus yang disepakati lulus dan perubahan boleh dipromosikan.
- `FAIL`: terdapat masalah; user menyertakan langkah reproduksi, hasil aktual, dan bukti bila tersedia.
- `PAUSED`: pengujian belum selesai; agent tidak melakukan commit/push final.

Konfirmasi dianggap eksplisit bila user menyatakan bahwa pengujian selesai/lulus atau memberikan status `PASS` dengan jelas.

## 6. Penanganan Hasil

### FAIL

1. Agent mencatat temuan pada `009-Status-Proyek.md`.
2. Agent memperbaiki masalah pada branch aktif.
3. Agent menjalankan kembali pemeriksaan statis.
4. Agent menyerahkan runtime Expo Go atau Development APK baru.
5. Siklus berulang sampai user menyatakan `PASS`.

### PAUSED

1. Development server boleh dihentikan setelah dikomunikasikan.
2. Status pekerjaan tetap `Verification` atau `In progress`.
3. Tidak ada commit/push final atau promosi ke `master`.

### PASS

Agent melanjutkan ke final verification dan Git promotion.

## 7. Final Verification oleh Agent

Setelah menerima `PASS`, agent wajib:

1. Memastikan tidak ada pesan user terbaru yang membatalkan atau mengubah hasil.
2. Memperbarui checklist dan catatan verifikasi di `009-Status-Proyek.md`.
3. Menjalankan kembali pemeriksaan statis yang relevan.
4. Memeriksa `git diff --check` dan `git status`.
5. Memastikan tidak ada secret, `.env`, backup, atau generated local state dalam commit.
6. Meninjau seluruh diff yang akan dipromosikan.

Jika final verification gagal, agent memperbaiki masalah dan meminta pengujian ulang bila perilaku runtime berubah.

## 8. Commit dan Push Branch Aktif

1. Catat nama branch aktif.
2. Stage hanya file yang termasuk scope dan telah diuji.
3. Buat commit non-interaktif dengan pesan yang menjelaskan hasil perubahan.
4. Push branch aktif ke remote `origin`.
5. Catat commit hash hasil push.

Agent tidak boleh memasukkan perubahan user yang tidak terkait tanpa review dan persetujuan scope.

## 9. Promosi ke Master

Setelah branch aktif berhasil di-push:

1. Fetch state terbaru dari `origin`.
2. Pastikan `master` lokal dapat disinkronkan dengan `origin/master` tanpa rewrite history.
3. Merge branch aktif ke `master` secara non-interaktif dan tanpa force.
4. Bila terjadi conflict atau `master` memiliki perubahan yang belum dipahami, hentikan promosi dan laporkan blocker kepada user.
5. Jalankan smoke/static check yang relevan pada hasil merge.
6. Push `master` ke `origin/master`.
7. Catat commit hash `master` hasil push.
8. Kembali ke branch kerja awal bila pekerjaan berikutnya masih dilanjutkan di sana.

## 10. Laporan Setelah Push

Agent wajib melaporkan:

- Hasil pengujian user yang menjadi approval.
- Nama dan hash commit branch aktif.
- Status push branch aktif.
- Hash commit `master` setelah merge.
- Status push `origin/master`.
- Pemeriksaan final yang dijalankan.
- Risiko atau pekerjaan tersisa.

Promosi Git bukan izin untuk migration production atau pembuatan artifact yang terhubung ke production. Tahap tersebut tetap mengikuti approval dan gate pada `007-Migrasi-Production-dan-Rollback.md`.

## 11. Internal Production APK

Setelah approval production terpisah, migration production, dan rekonsiliasi lulus:

1. Agent memverifikasi bahwa data QA development tidak disalin ke production.
2. Agent membuat profile EAS internal distribution yang menggunakan environment production dan menghasilkan APK.
3. Profile tidak menggunakan `developmentClient` dan tidak menghasilkan AAB.
4. APK diverifikasi dapat dibuka tanpa Metro.
5. User menjalankan smoke test terkontrol terhadap Supabase production.

## 12. Kondisi yang Menghentikan Commit/Push

- User belum menyatakan `PASS`.
- Pengujian masih `FAIL` atau `PAUSED`.
- Final verification gagal.
- Diff mengandung secret atau file di luar scope.
- Remote berubah dan menimbulkan conflict/divergence.
- Merge memerlukan destructive history rewrite.
- Branch protection atau CI menolak push.

Dalam kondisi tersebut, agent tidak mencari jalan pintas dan harus melaporkan penyebabnya.

## 13. Checklist Operasional

[ ] Environment development terverifikasi.<br>
[ ] Static check pra-handoff lulus.<br>
[ ] Expo Go URL/QR atau Development APK diserahkan.<br>
[ ] Scrcpy/ADB terhubung bila digunakan.<br>
[ ] Visual QA kolaboratif selesai bila digunakan.<br>
[ ] User menyelesaikan pengujian perangkat.<br>
[ ] User menyatakan `PASS`.<br>
[ ] Status proyek diperbarui.<br>
[ ] Final verification lulus.<br>
[ ] Commit branch aktif dibuat.<br>
[ ] Branch aktif di-push ke origin.<br>
[ ] Branch aktif di-merge ke `master` tanpa force.<br>
[ ] Hasil merge diverifikasi.<br>
[ ] `master` di-push ke origin.<br>
[ ] Commit hash dan hasil push dilaporkan kepada user.
[ ] Approval database production tersedia secara terpisah.<br>
[ ] Migration dan rekonsiliasi production lulus.<br>
[ ] Internal Production APK standalone dibuat dan diverifikasi tanpa Metro.<br>

---

## 14. Lock Policy

Struktur protokol ini bersifat **LOCKED**. Checklist dan catatan hasil bersifat **ACTIVE**. Perubahan terhadap urutan approval, target branch, atau larangan force-push harus mendapat instruksi eksplisit dari user.
