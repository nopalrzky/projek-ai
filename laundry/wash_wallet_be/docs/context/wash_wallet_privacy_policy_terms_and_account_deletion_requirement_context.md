# Context: WashWallet Privacy Policy, Terms, and Account Deletion Requirements

## Background

WashWallet memiliki 3 aplikasi dalam satu ekosistem:

### Customer App

* App Name: WashWallet
* Package Name: `com.washwallet.customer`

### Cashier App

* App Name: WashWallet Cashier
* Package Name: `com.washwallet.cashier`

### Production App

* App Name: WashWallet Production
* Package Name: `com.washwallet.production`

Ketiga aplikasi:

* Menggunakan backend yang sama.
* Menggunakan database yang sama.
* Beroperasi dalam satu platform WashWallet.
* Dikelola oleh organisasi yang sama.

Karena itu, sistem akan menggunakan:

```txt
1 Privacy Policy
1 Terms of Service
1 Account Deletion Policy
```

yang berlaku untuk seluruh ekosistem WashWallet.

---

# Required Public URLs

Sistem harus menyediakan halaman publik yang dapat diakses tanpa login:

```txt
/privacy
/terms
/account-deletion
```

Halaman harus dapat dibuka oleh:

* User umum
* Customer
* Employee
* Google Play reviewer

Halaman tidak boleh memerlukan autentikasi.

---

# Privacy Policy Requirements

## Introduction

Privacy Policy harus menjelaskan bahwa kebijakan berlaku untuk:

* WashWallet
* WashWallet Cashier
* WashWallet Production

Harus menjelaskan bahwa WashWallet adalah platform manajemen laundry yang menyediakan:

* Pemesanan laundry
* Pengelolaan operasional laundry
* Pembayaran
* Tracking status laundry
* Pickup dan delivery management

---

## Information Collected

### Customer Data

Privacy Policy harus menjelaskan bahwa sistem dapat mengumpulkan:

#### Account Information

* Nama
* Nomor telepon
* Email
* Password terenkripsi

#### Address Information

* Alamat pickup
* Alamat pengantaran
* Catatan alamat
* Latitude
* Longitude

#### Location Information

* Lokasi perangkat
* Koordinat GPS
* Informasi lokasi yang digunakan untuk menemukan outlet dan menghitung layanan pickup

#### Transaction Information

* Pesanan laundry
* Status pesanan
* Invoice
* Pembayaran
* Top up wallet
* Riwayat transaksi

#### Review Information

* Rating
* Review outlet
* Feedback pengguna

---

### Employee Data

Untuk Cashier dan Production.

Privacy Policy harus menjelaskan bahwa sistem dapat mengumpulkan:

#### Employee Information

* Nama karyawan
* Nomor telepon
* Email
* Role
* Permission

#### Operational Information

* Aktivitas operasional
* Status pekerjaan
* Riwayat proses laundry
* Pickup dan delivery activity

---

### Media Information

Privacy Policy harus menjelaskan penggunaan:

* Kamera
* Galeri
* Foto bukti pickup
* Foto bukti pengantaran
* Foto terkait pesanan

---

### Device Information

Privacy Policy harus menjelaskan bahwa sistem dapat mengumpulkan:

* Device identifier
* FCM token
* App version
* Device information
* Log dan diagnostic information

---

## How Information Is Used

Privacy Policy harus menjelaskan bahwa data digunakan untuk:

* Membuat dan mengelola akun
* Memproses pesanan laundry
* Mengelola transaksi
* Mengirim notifikasi
* Menghitung biaya layanan
* Menampilkan outlet dan layanan terdekat
* Menyediakan fitur pickup dan delivery
* Menyediakan dukungan pelanggan
* Meningkatkan kualitas layanan
* Menjaga keamanan sistem
* Memenuhi kewajiban hukum

---

## Third Party Services

Privacy Policy harus menjelaskan penggunaan layanan pihak ketiga.

### Firebase

Digunakan untuk:

* Push notification

### Google Maps Platform

Digunakan untuk:

* Maps
* Geocoding
* Location services
* Place search

### Midtrans

Digunakan untuk:

* Pembayaran
* Top up
* Invoice payment

### Fonnte

Digunakan untuk:

* WhatsApp notification

---

## Data Security

Privacy Policy harus menjelaskan bahwa:

* Data disimpan secara aman.
* Akses dibatasi berdasarkan role dan permission.
* Komunikasi menggunakan HTTPS.
* Sistem menerapkan langkah-langkah keamanan yang wajar untuk melindungi data pengguna.

---

## Data Retention

Privacy Policy harus menjelaskan:

* Data akun disimpan selama akun aktif.
* Data transaksi dapat disimpan lebih lama untuk kebutuhan operasional, audit, dan kepatuhan hukum.

---

## User Rights

Privacy Policy harus menjelaskan bahwa pengguna dapat:

* Melihat data pribadi
* Memperbarui data pribadi
* Meminta penghapusan akun
* Menghubungi tim support terkait data pribadi

---

## Children's Privacy

Privacy Policy harus menjelaskan bahwa layanan tidak ditujukan untuk anak-anak di bawah usia yang ditentukan oleh hukum yang berlaku.

---

## Policy Changes

Privacy Policy harus menjelaskan bahwa kebijakan dapat diperbarui dari waktu ke waktu.

---

## Contact Information

Privacy Policy harus memiliki:

* Nama organisasi
* Email support
* Website resmi

Placeholder dapat digunakan sampai informasi final diberikan.

---

# Terms of Service Requirements

## Introduction

Terms harus menjelaskan bahwa layanan berlaku untuk:

* WashWallet
* WashWallet Cashier
* WashWallet Production

---

## User Responsibilities

Terms harus menjelaskan bahwa pengguna wajib:

* Memberikan informasi yang akurat
* Menjaga keamanan akun
* Tidak menyalahgunakan layanan
* Tidak menggunakan layanan untuk aktivitas ilegal

---

## Employee Responsibilities

Untuk Cashier dan Production.

Harus menjelaskan:

* Employee bertanggung jawab atas aktivitas akun mereka
* Employee wajib mengikuti kebijakan outlet dan organisasi

---

## Payments

Terms harus menjelaskan bahwa:

* Pembayaran diproses melalui metode pembayaran yang tersedia
* Harga layanan ditentukan oleh outlet laundry
* WashWallet dapat bertindak sebagai platform penyedia layanan teknologi

---

## Service Availability

Terms harus menjelaskan bahwa:

* Layanan dapat berubah atau dihentikan sewaktu-waktu
* Sistem dapat mengalami maintenance

---

## Limitation of Liability

Terms harus memiliki bagian yang membatasi tanggung jawab platform sesuai praktik umum layanan digital.

---

## Contact Information

Terms harus memiliki informasi kontak yang sama dengan Privacy Policy.

---

# Account Deletion Requirements

## Overview

Halaman Account Deletion harus menjelaskan cara pengguna meminta penghapusan akun.

---

## Customer Account Deletion

Customer harus dapat:

* Mengajukan penghapusan akun
* Menghubungi support
* Mengajukan penghapusan data tertentu jika berlaku

---

## Employee Account Deletion

Cashier dan Production harus dijelaskan sebagai akun kerja.

Proses penghapusan dapat dilakukan melalui:

* Administrator outlet
* Administrator sistem
* Tim support WashWallet

---

## Data Removal Process

Halaman harus menjelaskan:

* Data apa yang akan dihapus
* Data apa yang mungkin tetap disimpan
* Alasan penyimpanan data tertentu

Contoh:

* Kebutuhan audit
* Kewajiban hukum
* Pencegahan fraud

---

## Processing Time

Halaman harus menjelaskan estimasi waktu proses penghapusan akun.

---

## Contact Information

Halaman harus menyediakan:

* Email support
* Informasi kontak lain jika tersedia

---

# Google Play Compliance Goals

Dokumen dan halaman yang dibuat harus membantu memenuhi kebutuhan:

* Privacy Policy URL
* Account Deletion URL
* Data Safety Disclosure
* App Access Review
* Google Play App Review Process

untuk:

* WashWallet
* WashWallet Cashier
* WashWallet Production

```
```
