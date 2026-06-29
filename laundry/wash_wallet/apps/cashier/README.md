# WashWallet POS Kasir

[![Flutter](https://img.shields.io/badge/Flutter-Stable-02569B?style=flat&logo=flutter)](https://flutter.dev)
[![Dart](https://img.shields.io/badge/Dart-3.9.2-0175C2?style=flat&logo=dart)](https://dart.dev)
[![BLoC](https://img.shields.io/badge/State%20Management-flutter__bloc-40C4FF?style=flat)](https://pub.dev/packages/flutter_bloc)
[![GoRouter](https://img.shields.io/badge/Routing-go__router-EA4335?style=flat)](https://pub.dev/packages/go_router)
[![Dio](https://img.shields.io/badge/HTTP-dio-5B4DB1?style=flat)](https://pub.dev/packages/dio)

Aplikasi kasir laundry untuk operasional outlet WashWallet. Project ini berfokus pada alur transaksi frontliner/kasir, manajemen pelanggan, master data layanan, dana dan keuangan outlet, serta integrasi cetak nota thermal.

## Daftar Isi

- [Tentang Proyek](#tentang-proyek)
- [Fitur Utama](#fitur-utama)
- [Status Pengembangan](#status-pengembangan)
- [Tech Stack](#tech-stack)
- [Prasyarat](#prasyarat)
- [Instalasi](#instalasi)
- [Konfigurasi API](#konfigurasi-api)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Build Release](#build-release)
- [Code Generation](#code-generation)
- [Testing dan Quality Check](#testing-dan-quality-check)
- [Struktur Proyek](#struktur-proyek)
- [Arsitektur](#arsitektur)
- [Endpoint API Utama](#endpoint-api-utama)
- [Lisensi](#lisensi)

## Tentang Proyek

`wash_wallet_cashier` (kasir FE) adalah aplikasi Flutter yang digunakan tim kasir outlet untuk:

- menerima dan memproses transaksi laundry,
- mengelola pelanggan, membership, dan deposit paket,
- mengelola arus dana harian (setoran, petty cash, pengeluaran),
- memantau ringkasan operasional dari dashboard.

Target platform:

- Android
- iOS
- Web
- Windows
- macOS
- Linux

## Fitur Utama

### 1. Onboarding dan Autentikasi

- Splash screen dengan pengecekan status sesi.
- Onboarding untuk first-time user.
- Login berbasis username dan password.
- Persist token menggunakan `flutter_secure_storage` dengan backup `SharedPreferences`.
- Auto-redirect berdasarkan status auth (`/login` atau `/home`).
- Logout dan proteksi rute dengan auth guard.

### 2. Dashboard Kasir

- Ringkasan metrik operasional:
  - saldo kas
  - order dalam produksi
  - order belum diambil
  - order sudah diambil
- Informasi kasir yang sedang login.
- Aksi cepat:
  - buat transaksi
  - lihat transaksi
  - kelola pelanggan
  - kelola dana dan keuangan
- Pull-to-refresh untuk update data dashboard.

### 3. Manajemen Transaksi / Order POS

- Daftar pesanan per outlet dengan:
  - search
  - filter status (`pending`, `processing`, `ready`, `delivered`)
- Alur pembuatan order bertahap:
  - pilih pelanggan
  - pilih layanan
  - review order
- Input item order (kuantitas + catatan per item).
- Draft order tersimpan lokal per customer (bisa dilanjutkan kembali).
- Perhitungan harga otomatis (subtotal, diskon, total) dengan context:
  - membership contract aktif
  - kuota subscription/deposit aktif
- Metode pembayaran: `cash`, `transfer`, `qris`.
- Status pembayaran: `unpaid`, `paid`, `partial`.
- Validasi rekening tujuan untuk pembayaran non-tunai.
- Penentuan estimasi selesai dan catatan transaksi.
- Detail order mencakup:
  - timeline order
  - ringkasan finansial
  - item transaksi
  - data pelanggan
- Cetak nota thermal.
- Riwayat order per pelanggan dengan filter status dan payment status.

### 4. Manajemen Pelanggan

- CRUD pelanggan:
  - tambah
  - lihat detail
  - edit
  - hapus
- Search pelanggan.
- Quick add pelanggan langsung dari flow pembuatan order.
- Detail pelanggan menampilkan ringkasan:
  - jumlah transaksi
  - jumlah kontrak membership
  - jumlah deposit/subscription
- Navigasi dari detail pelanggan ke:
  - riwayat order
  - kontrak membership
  - deposit pelanggan

### 5. Membership dan Deposit Pelanggan

- Lihat daftar membership plan per outlet.
- Lihat detail membership plan (harga, durasi, diskon, level, status aktif).
- Buat kontrak membership untuk pelanggan.
- Lihat daftar paket layanan/deposit (service package).
- Lihat detail paket layanan/deposit.
- Buat customer subscription/deposit dari service package.
- Filter dan pencarian data membership/deposit pelanggan.

### 6. Master Data Outlet

- Kategori laundry:
  - list
  - create
  - detail
  - edit
  - delete
- Layanan laundry:
  - list
  - create
  - detail
  - edit
  - delete
  - filter berdasarkan kategori dan unit
- Paket layanan/deposit:
  - list
  - detail
- Membership plan:
  - list
  - detail
- Dukungan data unit layanan untuk perhitungan order.

### 7. Dana dan Keuangan Outlet

- Menu keuangan terpusat:
  - Setoran Kasir
  - Saldo Petty Cash
  - Pengeluaran Outlet
- Setoran kasir:
  - list + search + filter status
  - buat setoran (akun tujuan, nominal, catatan, lampiran bukti)
- Petty cash:
  - list + search + filter status
  - ajukan permintaan kas kecil
- Pengeluaran outlet:
  - list + search + filter status
  - buat pengeluaran (akun pengeluaran, tanggal, nominal, deskripsi, lampiran)
- Integrasi akun:
  - source account (transfer/qris)
  - expense account per outlet

### 8. UX dan Fondasi Aplikasi

- Design system internal (layout, header, bottom bar, button, text field, card, empty/error/loading state).
- Theme extension terpusat (warna, spacing, radius, typography).
- Navigasi dengan `go_router` + custom transition.
- Penanganan error berbasis failure mapping dari layer network/domain.
- Konsistensi pola state management per fitur menggunakan Cubit/BLoC.

## Status Pengembangan

Project aktif dikembangkan. Fitur utama kasir sudah berjalan untuk operasional transaksi dan keuangan dasar.

Beberapa area masih bertahap atau placeholder:

- detail screen tertentu pada modul keuangan (beberapa masih `TODO`)
- detail atau upgrade lanjutan pada sebagian modul membership/subscription

## Tech Stack

### Core

- Flutter
- Dart `^3.9.2`
- `flutter_bloc`
- `go_router`
- `dio`
- `dartz`
- `equatable`
- `intl`
- `hive_flutter`
- `flutter_secure_storage`
- `shared_preferences`
- `image_picker`
- `flutter_bluetooth_printer`

### Code Generation

- `freezed`
- `freezed_annotation`
- `json_serializable`
- `json_annotation`
- `build_runner`

## Prasyarat

Sebelum memulai, pastikan environment tersedia:

- Flutter SDK versi stable
- Dart SDK (mengikuti Flutter SDK)
- Git
- Backend API WashWallet yang aktif
- Browser (Chrome/Edge) untuk mode web

## Instalasi

1. Clone repository:

```bash
git clone <repository-url>
cd aplikasi_kasir_fe
```

2. Install dependency:

```bash
flutter pub get
```

3. Generate file Freezed/JSON:

```bash
dart run build_runner build --delete-conflicting-outputs
```

## Konfigurasi API

Base URL API dikirim lewat `--dart-define` dengan key:

- `API_BASE_URL`

Jika tidak diisi, default aplikasi:

```text
http://10.0.2.2:8000/api
```

Catatan:

- `10.0.2.2` cocok untuk Android emulator.
- Untuk web dan device fisik, gunakan host/IP backend yang bisa diakses client.

## Menjalankan Aplikasi

### 1. Web

```bash
flutter run -d chrome --dart-define=API_BASE_URL=http://127.0.0.1:8000/api
```

Jika backend di mesin lain:

```bash
flutter run -d chrome --dart-define=API_BASE_URL=http://192.168.1.10:8000/api
```

### 2. Android Emulator

```bash
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:8000/api
```

### 3. Device Fisik

```bash
flutter run --dart-define=API_BASE_URL=http://<IP-LOCAL-BACKEND>:8000/api
```

## Build Release

### Web

```bash
flutter build web --release --dart-define=API_BASE_URL=http://<backend-host>/api
```

### Android

```bash
flutter build apk --release --dart-define=API_BASE_URL=http://<backend-host>/api
```

atau:

```bash
flutter build appbundle --release --dart-define=API_BASE_URL=http://<backend-host>/api
```

### iOS

```bash
flutter build ios --release --dart-define=API_BASE_URL=http://<backend-host>/api
```

## Code Generation

Jalankan ulang saat ada perubahan model Freezed/JSON:

```bash
dart run build_runner build --delete-conflicting-outputs
```

Mode watch:

```bash
dart run build_runner watch --delete-conflicting-outputs
```

## Testing dan Quality Check

Jalankan analisis statis:

```bash
flutter analyze
```

Jalankan test:

```bash
flutter test
```

Catatan: saat ini coverage test masih minim dan perlu ditambah seiring pengembangan fitur.

## Struktur Proyek

```text
lib/
|-- core/
|   |-- auth/            # Token storage
|   |-- components/      # Reusable UI components + layout + drawer
|   |-- network/         # Dio, API client, endpoints, interceptors
|   |-- router/          # GoRouter + transitions
|   |-- services/        # Onboarding, thermal printer, dll
|   |-- storage/         # Secure storage provider
|   |-- theme/           # Theme extensions
|   `-- utils/
|-- features/
|   |-- auth/
|   |-- onboarding/
|   |-- splash/
|   |-- home/
|   |-- order/
|   |-- customer/
|   |-- category/
|   |-- laundry_service/
|   |-- service_package/
|   |-- membership_plan/
|   |-- membership_contract/
|   |-- customer_subscription/
|   |-- deposit/
|   |-- petty_cash/
|   |-- expense/
|   |-- account/
|   `-- unit/
`-- main.dart
```

## Arsitektur

Project menggunakan pendekatan Clean Architecture:

- `presentation`: screen, widget, Cubit/BLoC
- `domain`: entity, repository contract, use case
- `data`: model, datasource, repository implementation

Alur data utama:

```text
UI -> Cubit/BLoC -> Use Case -> Repository (Domain) -> Repository Impl (Data) -> Data Source (API/Local)
```

Manfaat utama:

- modular dan mudah dikembangkan per fitur,
- boundary yang jelas antar layer,
- lebih mudah dites dan di-maintain.

## Endpoint API Utama

Sumber: `lib/core/network/api/api_endpoints.dart`

### Auth

- `POST /mobile/cashier/auth/login`
- `POST /mobile/cashier/auth/logout`
- `GET /mobile/cashier/auth/me`
- `GET /mobile/cashier/auth/validate`

### Dashboard

- `GET /mobile/cashier/dashboard`

### Order dan Operasional

- `GET /mobile/cashier/orders`
- `GET /mobile/cashier/orders/outlet`
- `GET /mobile/cashier/orders/customer`
- `GET /mobile/cashier/laundry-services`
- `GET /mobile/cashier/categories`

### Pelanggan, Membership, Deposit

- `GET /mobile/cashier/customers`
- `GET /mobile/cashier/customer-subscriptions`
- `GET /mobile/cashier/service-packages`
- `GET /mobile/cashier/membership-plans/outlets/{outletId}`
- `GET /mobile/cashier/membership-contracts/customers/{customerId}`

### Keuangan

- `GET/POST /mobile/cashier/deposits`
- `GET/POST /mobile/cashier/petty-cashes`
- `GET/POST /mobile/cashier/expenses`
- `GET /mobile/cashier/accounts/source-accounts`
- `GET /mobile/cashier/accounts/expense-accounts/outlet/{outletId}`

## Lisensi

Project ini bersifat private/proprietary untuk kebutuhan internal WashWallet.
