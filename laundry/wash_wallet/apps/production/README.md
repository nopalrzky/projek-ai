# Wash Wallet Produksi

[![Flutter](https://img.shields.io/badge/Flutter-Stable-02569B?style=flat&logo=flutter)](https://flutter.dev)
[![Dart](https://img.shields.io/badge/Dart-3.10.3-0175C2?style=flat&logo=dart)](https://dart.dev)
[![BLoC](https://img.shields.io/badge/State%20Management-flutter__bloc-40C4FF?style=flat)](https://pub.dev/packages/flutter_bloc)
[![GoRouter](https://img.shields.io/badge/Routing-go__router-EA4335?style=flat)](https://pub.dev/packages/go_router)
[![Dio](https://img.shields.io/badge/HTTP-dio-5B4DB1?style=flat)](https://pub.dev/packages/dio)

Aplikasi operasional produksi laundry untuk tim outlet Wash Wallet.  
Project ini dibangun dengan Flutter dan menerapkan pola Clean Architecture (Presentation, Domain, Data) untuk menjaga kode tetap modular dan mudah dikembangkan.

## Daftar Isi

- [Tentang Proyek](#tentang-proyek)
- [Fitur Utama](#fitur-utama)
- [Tech Stack](#tech-stack)
- [Prasyarat](#prasyarat)
- [Instalasi](#instalasi)
- [Konfigurasi API](#konfigurasi-api)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Build Release](#build-release)
- [Code Generation](#code-generation)
- [Testing dan Quality Check](#testing-dan-quality-check)
- [Struktur Proyek](#struktur-proyek)
- [Endpoint API Utama](#endpoint-api-utama)
- [Status Pengembangan](#status-pengembangan)
- [Lisensi](#lisensi)

## Tentang Proyek

`wash_wallet_production` berfokus pada alur kerja produksi laundry, mulai dari login petugas, monitoring dashboard, pengelolaan order pending dan in-progress, hingga eksekusi proses per item order secara berurutan.

Target platform:

- Android
- iOS
- Web
- Windows
- macOS
- Linux

## Fitur Utama

### 1. Onboarding dan Autentikasi

- Splash screen dengan pemeriksaan status onboarding.
- Onboarding untuk first-time user.
- Login menggunakan username dan password.
- Persist token menggunakan `flutter_secure_storage` + backup ke `SharedPreferences`.
- Auto redirect berdasarkan status auth (`/login` atau `/home`).

### 2. Dashboard Produksi

- Ringkasan metrik produksi:
  - order hari ini
  - order in progress
  - order ready for pickup
  - order completed
- Daftar process queue.
- Daftar active order.
- Daftar priority order.
- Quick action panel (UI tersedia untuk perluasan fitur).

### 3. Manajemen Order

- Tab order `Pending` dan `Dalam Progress`.
- Pull-to-refresh untuk pembaruan data.
- Mulai pengerjaan order dari status pending.
- Detail order dengan informasi:
  - nomor order
  - status dan payment status
  - item order
  - ringkasan pembayaran
  - catatan order

### 4. Proses Produksi per Item

- Detail item order.
- Mulai dan selesaikan order item.
- Eksekusi proses laundry per item (start/complete).
- Validasi aksi proses berdasarkan status backend (`canStart`, `canComplete`, `actionDeniedReason`).
- Riwayat proses (siapa mengerjakan, waktu mulai, waktu selesai).

### 5. UI System dan UX

- Material 3 dengan light dan dark theme.
- Design system internal:
  - `AppButton`, `AppCard`, `AppDialog`, `AppDrawer`, `AppTabBar`, dll.
- Routing dengan transisi custom (fade dan slide).
- Error, empty, dan loading state yang konsisten.

## Tech Stack

### Core

- Flutter
- Dart `^3.10.3`
- `flutter_bloc`
- `go_router`
- `dio`
- `equatable`
- `dartz`
- `intl`
- `hive_flutter`
- `flutter_secure_storage`
- `shared_preferences`

### Codegen

- `freezed`
- `freezed_annotation`
- `json_serializable`
- `json_annotation`
- `build_runner`

## Prasyarat

Sebelum mulai, pastikan environment sudah tersedia:

- Flutter SDK versi stable yang kompatibel dengan Dart `3.10.3`
- Dart SDK `3.10.3` (ikut dari Flutter SDK)
- Git
- Backend API Wash Wallet yang aktif
- Browser (Chrome/Edge) untuk mode web

## Instalasi

1. Clone repository:

```bash
git clone <repository-url>
cd wash_wallet_production
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

Jika tidak diisi, default yang dipakai aplikasi:

```text
http://10.0.2.2:8000/api
```

Catatan:

- `10.0.2.2` cocok untuk Android emulator.
- Untuk web dan device fisik, gunakan host/IP backend yang bisa diakses dari client.

## Menjalankan Aplikasi

### 1. Web (website)

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

Catatan: folder `test/` saat ini belum berisi test case, jadi sebaiknya tambahkan unit/widget test seiring pengembangan fitur.

## Struktur Proyek

```text
lib/
|-- core/
|   |-- auth/            # Token storage
|   |-- components/      # Reusable UI components
|   |-- network/         # Dio, API client, endpoints, interceptors
|   |-- router/          # GoRouter + transitions
|   |-- services/        # Onboarding service, dsb
|   |-- storage/         # Secure storage provider
|   |-- theme/           # Theme extensions (color, spacing, radius, typography)
|   `-- utils/
|-- features/
|   |-- auth/
|   |-- onboarding/
|   |-- splash/
|   |-- home/
|   |-- order/
|   |-- category/        # Domain/model support
|   |-- laundry_service/ # Domain/model support
|   |-- outlet/          # Domain/model support
|   `-- unit/            # Domain/model support
`-- main.dart
```

## Endpoint API Utama

Sumber: `lib/core/network/api/api_endpoints.dart`

### Auth

- `POST /mobile/production/auth/login`
- `POST /mobile/production/auth/logout`
- `GET /mobile/production/auth/me`
- `GET /mobile/production/auth/validate`

### Dashboard

- `GET /mobile/production/dashboard`

### Orders

- `GET /mobile/production/orders`
- `GET /mobile/production/orders/pending`
- `GET /mobile/production/orders/in-progress`
- `GET /mobile/production/orders/{id}`
- `POST /mobile/production/orders/{id}/start`

### Order Items

- `GET /mobile/production/order-items/{id}`
- `POST /mobile/production/order-items/{id}/start`
- `POST /mobile/production/order-items/{id}/complete`

### Order Item Processes

- `POST /mobile/production/order-item-processes/{id}/start`
- `POST /mobile/production/order-item-processes/{id}/complete`

## Status Pengembangan

Project ini aktif dikembangkan.  
Fokus utama saat ini adalah stabilitas alur produksi (dashboard, order, dan process handling).

Beberapa menu master data di drawer (misalnya customer/kategori/layanan/membership) sudah disiapkan pada konfigurasi navigasi, namun implementasi halaman lengkapnya masih tahap bertahap.

## Lisensi

Project ini bersifat private/proprietary dan digunakan untuk kebutuhan internal Wash Wallet.
