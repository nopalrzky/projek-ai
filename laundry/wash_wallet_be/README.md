# 🧺 WashWallet - Sistem Manajemen Laundry Modern

[![Laravel](https://img.shields.io/badge/Laravel-11.0-FF2D20?style=flat&logo=laravel)](https://laravel.com)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat&logo=react)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![Inertia.js](https://img.shields.io/badge/Inertia.js-2.0-9553E9?style=flat)](https://inertiajs.com)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.2-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com)
[![PHP](https://img.shields.io/badge/PHP-8.3-777BB4?style=flat&logo=php)](https://www.php.net)

> **WashWallet** adalah solusi lengkap untuk manajemen bisnis laundry modern dengan fitur kasir, operasional, keuangan & akuntansi, HR & payroll, sistem koin, dan program afiliasi - semua terintegrasi dalam satu sistem terpadu.

## 📋 Daftar Isi

- [Tentang Proyek](#-tentang-proyek)
- [Fitur Utama](#-fitur-utama)
- [Tech Stack](#-tech-stack)
- [Prasyarat](#-prasyarat)
- [Instalasi](#-instalasi)
- [Konfigurasi](#-konfigurasi)
- [Menjalankan Aplikasi](#-menjalankan-aplikasi)
- [Testing](#-testing)
- [Struktur Proyek](#-struktur-proyek)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Kontribusi](#-kontribusi)
- [Lisensi](#-lisensi)

## 🎯 Tentang Proyek

**WashWallet** bukan sekadar aplikasi, tapi **aset berharga** bagi seluruh pengusaha laundry di Indonesia. WashWallet bercita-cita untuk meningkatkan industri laundry di Indonesia agar terus tumbuh dan berkembang secara makro, sehingga membuat daya saing industri laundry Indonesia bisa berkompetisi dan lebih unggul dengan industri laundry negara lain.

### 🌟 Visi & Misi

**Visi:**
Menjadi sistem #1 pilihan owner laundry di seluruh Indonesia untuk mengelola dan mengembangkan bisnis mereka.

**Misi:**

- Membuat mitra kami **senang** dengan layanan terbaik
- Setia menemani pertumbuhan dan peningkatan usaha laundry langkah demi langkah
- Menyediakan solusi lengkap dari kasir, stok, keuangan, hingga HR & Payroll dalam satu sistem terpadu

## ✨ Fitur Utama

### 1. 💼 Manajemen Operasional

- **Multi-Outlet Management**: Kelola banyak cabang dalam satu sistem
- **Kategori & Layanan Laundry**: Atur berbagai jenis layanan dengan harga dan durasi fleksibel
- **Process Management**: Kelola proses produksi laundry (Pencucian, Pengeringan, Penyetrikaan, Pelipatan, dll)
- **Laundry Service Processes**: Assign proses ke layanan dengan urutan sequence otomatis
- **Unit Measurement**: Sistem pengukuran layanan (kg, pcs, paket, dll)
- **Service Packages**: Paket bundling layanan dengan harga khusus
- **Order Management**: Status tracking real-time dari order masuk hingga selesai
    - Statuses: pending, in_progress, washing, drying, ironing, folding, quality_check, ready_for_pickup, completed, cancelled
- **Customer Management**: Database pelanggan dengan riwayat transaksi lengkap
- **Membership System**: Program keanggotaan dengan benefit khusus
- **Subscription System**: Langganan paket layanan untuk pelanggan regular
- **Quota Management**: Pengelolaan kuota pelanggan berlangganan

### 2. 💰 Keuangan & Akuntansi

- **Chart of Accounts (COA)**: Sistem akun keuangan lengkap dengan kategori:
    - Assets (Aset)
    - Liabilities (Kewajiban)
    - Equity (Ekuitas)
    - Revenue (Pendapatan)
    - Expense (Beban)
- **Journal Entry**: Pencatatan jurnal keuangan otomatis
- **General Ledger**: Buku besar untuk setiap akun
- **Accounting Period**: Periode akuntansi dengan lock/unlock
- **Expense Management**: Pengelolaan biaya operasional
- **Prive Management**: Pencatatan pengambilan pemilik
- **Deposit Management**: Deposit awal untuk kasir
- **Petty Cash**: Kas kecil operasional
- **Balance Sheet**: Laporan posisi keuangan
- **Profit & Loss**: Laporan laba rugi
- **Financial Reports**: Laporan keuangan lengkap

### 3. 👥 HR & Payroll

- **Employee Management**: Database karyawan lengkap
- **Position & Role Management**: Struktur jabatan dan hak akses
- **Attendance System**: Sistem absensi karyawan
- **Salary Management**: Pengaturan gaji pokok dan komponen gaji
- **Payroll Processing**: Proses penggajian otomatis dengan:
    - Gaji pokok
    - Tunjangan
    - Komisi berdasarkan performa
    - Potongan (denda, pinjaman)
- **Commission System**: Komisi berdasarkan proses yang dikerjakan
- **Fine Management**: Pengelolaan denda karyawan
- **Loan Management**: Pinjaman karyawan dengan sistem cicilan
- **Performance Tracking**: Tracking kinerja karyawan

### 4. 🪙 Sistem Koin & Loyalty

- **Coin System**: Sistem poin digital untuk customer
- **Top-up Management**: Isi ulang koin pelanggan
- **Coin Transactions**: Riwayat transaksi koin lengkap
- **Withdrawal System**: Penarikan koin
- **Loyalty Rewards**: Program reward untuk pelanggan setia

### 5. 🤝 Program Afiliasi

- **Affiliate/Referral System**: Sistem kode referral unik
- **Referral Tracking**: Tracking pelanggan dari referral
- **Commission Management**: Komisi otomatis untuk affiliator
- **Affiliate Dashboard**: Dashboard khusus untuk melihat performa afiliasi

### 6. 📊 Dashboard & Analytics

- **Real-time Dashboard**: Dashboard dengan data real-time
- **Revenue Analytics**: Analisis pendapatan
- **Order Statistics**: Statistik pesanan
- **Customer Analytics**: Analisis pelanggan
- **Employee Performance**: Performa karyawan
- **Financial Overview**: Ringkasan keuangan

### 7. 📥 Import & Export Data

- **Bulk Import**: Import data massal (Excel/CSV) untuk:
    - Outlets
    - Categories
    - Laundry Services
    - Customers
    - Service Packages
- **Template Download**: Template Excel untuk import dengan struktur yang sesuai
- **Data Validation**: Validasi data sebelum import dengan preview
- **Error Handling**: Log error lengkap dengan solusi dan row number
- **Progress Tracking**: Monitor progress import real-time
- **Import History**: Riwayat import dengan status dan detail
- **Export Data**: Export data ke Excel untuk backup atau analisis

### 8. 🔐 Security & Access Control

- **Role-Based Access Control (RBAC)**: Menggunakan Spatie Permission
- **Position-Based Roles**: Hak akses berdasarkan jabatan
- **Multi-Authentication**: Auth untuk owner dan employee
- **Sanctum API Authentication**: Token-based authentication untuk mobile
- **Activity Logging**: Log aktivitas user
- **Data Protection**: Encryption untuk data sensitif

### 9. 🎨 User Experience

- **Modern UI/UX**: Interface modern dengan TailwindCSS
- **Responsive Design**: Optimal di semua device (desktop, tablet, mobile)
- **Dark Mode Ready**: Dukungan dark mode theme
- **Interactive Components**: Animasi smooth dengan Framer Motion
- **Real-time Updates**: Data updates tanpa reload page
- **Search & Filter**: Pencarian dan filter data yang powerful
- **Pagination**: Pagination dengan infinite scroll option

## 🛠 Tech Stack

### Backend

- **Laravel 11.0** - PHP Framework
- **PHP 8.3** - Programming Language
- **MySQL** - Database
- **Laravel Sanctum** - API Authentication
- **Spatie Laravel Permission** - Role & Permission Management
- **Spatie Laravel Query Builder** - Advanced Query Building
- **Maatwebsite Excel** - Excel Import/Export
- **Pest PHP** - Testing Framework

### Frontend

- **React 18.2** - UI Library
- **TypeScript 5.0** - Type-safe JavaScript
- **Inertia.js 2.0** - Modern Monolith Stack
- **TailwindCSS 3.2** - Utility-first CSS
- **Headless UI** - Unstyled UI Components
- **Framer Motion** - Animation Library
- **Recharts** - Charting Library
- **React Table (TanStack)** - Table Management
- **Lucide React** - Icon Library
- **React Day Picker** - Date Picker
- **React Dropzone** - File Upload

### Development Tools

- **Vite 7.0** - Build Tool & Dev Server
- **Laravel Breeze** - Authentication Scaffolding
- **Laravel Pail** - Log Viewer
- **Laravel Pint** - PHP Code Style Fixer
- **Concurrently** - Run multiple commands
- **Ziggy** - Laravel Routes in JavaScript

## 📦 Prasyarat

Sebelum memulai instalasi, pastikan sistem Anda memiliki:

- **PHP** >= 8.3
- **Composer** >= 2.0
- **Node.js** >= 20.0
- **NPM** atau **Yarn**
- **MySQL** >= 8.0 atau **PostgreSQL** >= 13
- **Git**

### Extensi PHP yang Diperlukan
