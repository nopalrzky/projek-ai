# Google Play Reviewer Credentials & Setup Guide

Dokumen ini berisi informasi akun demo dan langkah-langkah setup untuk memfasilitasi peninjauan (review) aplikasi **WashWallet** oleh Google Play Console Team. 

Aplikasi yang diuji menggunakan akun ini meliputi:
1. **WashWallet Customer**
2. **WashWallet Cashier**
3. **WashWallet Production & Courier**

---

> [!CAUTION]
> **Pemberitahuan Keamanan Penting**
> Jangan pernah menuliskan atau men-commit password asli/production ke dalam repositori ini. 
> Password di bawah ini menggunakan referensi variabel environment `<nilai GOOGLE_PLAY_REVIEWER_PASSWORD production>`. Nilai password asli harus dikonfigurasi pada environment variable `.env` di server production sebelum menjalankan seeder.

---

## 1. Sign-in Details untuk Google Play Console

Gunakan data berikut saat mengisi formulir **App Access / Sign-in Details** di Google Play Console untuk masing-masing aplikasi:

### A. WashWallet Customer (Aplikasi Pelanggan)
* **Name:** `Google Play Reviewer - WashWallet Customer`
* **Username / Phone Number:** `081100009001`
* **Password:** `<nilai GOOGLE_PLAY_REVIEWER_PASSWORD production>`
* **Instructions / Catatan Tambahan:**
  > Di halaman utama Login, pengguna tidak perlu meminta OTP via WhatsApp.
  > Di bawah tombol utama "Kirim OTP", silakan klik tautan **"Masuk dengan Password"**.
  > Masukkan nomor telepon `081100009001` dan password di atas untuk langsung masuk ke halaman utama aplikasi dengan saldo demo terisi.

---

### B. WashWallet Cashier (Aplikasi Kasir)
* **Name:** `Google Play Reviewer - WashWallet Cashier`
* **Username:** `googleplay.reviewer`
* **Password:** `<nilai GOOGLE_PLAY_REVIEWER_PASSWORD production>`
* **Instructions / Catatan Tambahan:**
  > Gunakan username dan password di atas untuk login.
  > Apabila aplikasi meminta **PIN Keamanan** (setup atau otentikasi ulang sesi), gunakan PIN statis **`112233`**.

---

### C. WashWallet Production & Courier (Aplikasi Produksi & Kurir)
* **Name:** `Google Play Reviewer - WashWallet Production`
* **Username:** `googleplay.reviewer`
* **Password:** `<nilai GOOGLE_PLAY_REVIEWER_PASSWORD production>`
* **Instructions / Catatan Tambahan:**
  > Akun reviewer ini telah di-assign ke tiga role sekaligus (Kasir, Produksi, dan Kurir).
  > Apabila aplikasi meminta **PIN Keamanan** untuk otentikasi sesi, gunakan PIN statis **`112233`**.

---

## 2. Cara Menjalankan Seeder di Lingkungan Production/Staging

Seeder ini dirancang agar aman dijalankan di database production secara *idempotent* (dapat dijalankan berulang kali tanpa merusak data asli atau menduplikasi entitas). Seeder tidak dimasukkan ke dalam `DatabaseSeeder::run()` agar tidak berjalan otomatis saat melakukan reset database umum.

### Langkah-langkah Setup:

1. Pastikan env variable `GOOGLE_PLAY_REVIEWER_PASSWORD` sudah didefinisikan di file `.env` server target:
   ```env
   GOOGLE_PLAY_REVIEWER_PASSWORD="PasswordKuatReviewer2026!"
   ```
   *(Jika variabel ini tidak diset, default password adalah `DemoPass@2024`)*

2. Jalankan perintah Artisan berikut di root direktori backend Laravel:
   ```bash
   php artisan db:seed --class=GooglePlayReviewerSeeder
   ```

3. Jalankan kembali perintah di atas jika diperlukan untuk memastikan update data demo terbaru. Seeder akan memperbarui data demo yang ada tanpa memengaruhi data non-demo lainnya.

---

## 3. Ringkasan Identitas Demo yang Stabil

Berikut adalah referensi internal data demo terisolasi yang dibuat oleh seeder:

| Entitas | Field Identifier | Nilai Demo | Keterangan |
| :--- | :--- | :--- | :--- |
| **Owner (Pemilik Toko)** | email | `googleplay.owner@washwallet.test` | Akun owner dari tenant demo |
| **Outlet** | code | `GPREVIEW` | Outlet terisolasi untuk data reviewer |
| **Employee** | username | `googleplay.reviewer` | Karyawan dengan posisi Kasir, Produksi, & Kurir |
| **Customer** | phone | `081100009001` | Akun pelanggan demo dengan alamat primary |
| **Customer Email** | email | `googleplay.customer@washwallet.test` | Email pelanggan demo |
| **PIN Karyawan** | PIN (statis) | `112233` | Untuk keamanan kasir/produksi |
| **Env Password** | name | `GOOGLE_PLAY_REVIEWER_PASSWORD` | Password global reviewer di .env |
| **Deposit Balance** | deposit_balance | `150,000` | Saldo demo terisi untuk pelanggan |

---
