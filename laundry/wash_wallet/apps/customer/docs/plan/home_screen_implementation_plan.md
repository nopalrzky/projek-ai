# Implementation Plan: Customer Home Screen / Dashboard (Revised)

**Tujuan:**
Mengimplementasikan layout konten Beranda (Home Tab) untuk aplikasi Customer menggunakan Flutter. Desain berfokus pada layout modular bergaya Alfagift, dengan menggunakan komponen *shared UI* dan *theme* yang sudah ada di dalam project. Data yang ditampilkan sementara berupa data dummy.

---

## 1. Struktur UI & Komponen

Layout akan dibangun secara modular dan tidak lagi menggunakan scaffold global di level fitur ini, melainkan mengandalkan `app_layout` yang sudah ada.

### a. App Layout (Root Container)
File: `lib/core/presentation/layouts/app_layout.dart` *(Atau lokasi app_layout saat ini)*
- Bertanggung jawab sebagai Scaffold utama dan menampung `BottomNavigationBar` (serta logika *tab switching*).
- Jika ada limitasi atau struktur yang kurang optimal, `app_layout` akan disesuaikan tanpa merusak *separation of concerns*.

### b. Home Screen (Home Tab Content)
File: `home_screen.dart`
- Berperan murni sebagai isi dari tab "Beranda".
- Menggunakan `CustomScrollView` atau `SingleChildScrollView`.
- Berisi komposisi widget secara berurutan: Header, Greeting & Wallet Card, dan seksi pendukung lainnya.

### c. Pemecahan Komponen (Widgets)
Semua bagian UI wajib dipisahkan menjadi komponen-komponen kecil yang mandiri:
1. **`home_header.dart`**: Menampilkan Alamat Pengiriman dan aksi icon (Chat, Notification, Cart). Menggunakan icon & padding dari theme project.
2. **`greeting_wallet_card.dart`**: Card komposit yang membungkus info sapaan, *badge membership*, saldo deposit, dan koin. Dibuat menggunakan shared card widget/theme colors dari desain sistem Wash Wallet.
3. **`promo_section.dart`** *(Opsional/Dummy)*: Placeholder untuk banner promo atau layanan unggulan di bawah Wallet Card.

---

## 2. Struktur Direktori File

Seluruh kode UI khusus fitur home akan dikelola dalam `lib/features/home/presentation/` (dengan tetap mengikuti standar struktur singular `presentation` bawaan Clean Architecture di project ini):

```text
lib/features/home/presentation/
├── screens/
│   └── home_screen.dart           (Konten utama tab Beranda)
└── widgets/
    ├── home_header.dart           (Header Alamat & Aksi)
    ├── greeting_wallet_card.dart  (Sapaan, Koin, Deposit, Membership)
    └── promo_section.dart         (Dummy konten tambahan bawah)
```

---

## 3. Aturan Desain dan Theming

Sesuai instruksi:
- **Wajib menggunakan Shared UI & Theme**: Tidak ada hardcode untuk `Colors`, `Typography` (`TextStyle`), dan `Spacing`. Semua harus mengambil dari `Theme.of(context)` atau class `AppColors` / `AppStyles` yang sudah distandardisasi.
- **Konsistensi Visual**: Pastikan bentuk *border radius*, *shadow*, dan ketebalan font mengikuti gaya visual premium yang umum ada pada aplikasi Wash Wallet.

---

## 4. Langkah Eksekusi (Implementation Steps)

1. **Review & Refactor `app_layout`**: Memeriksa `app_layout` saat ini. Jika belum ada atau belum mengakomodasi 4 tab (Beranda, Pesanan, Outlet, Akun), lakukan penyesuaian untuk mendaftarkan `HomeScreen` sebagai tab pertama.
2. **Setup Direktori & File**: Membuat file `home_screen.dart` dan file pendukung di dalam folder `widgets/`.
3. **Implementasi Widgets (Dummy Data)**: 
   - `home_header.dart`
   - `greeting_wallet_card.dart`
   - `promo_section.dart`
4. **Merakit `HomeScreen`**: Menggabungkan widget-widget tersebut ke dalam list *scrollable* di `home_screen.dart`.
5. **Verifikasi Tampilan**: Memastikan tampilan sudah berjalan dengan baik, responsif, dan sesuai dengan theme system (tanpa hardcoded properties).

---

> [!IMPORTANT]
> **Konfirmasi Terakhir Sebelum Eksekusi**
> Rencana telah direvisi sesuai instruksi: penghapusan `dashboard_screen`, pemecahan modular ke dalam `widgets/`, penggunaan integrasi `app_layout`, serta ketaatan pada *shared UI/Theme*. 
> 
> Silakan **setujui (approve)** plan ini agar saya dapat mulai menulis kode implementasinya!
