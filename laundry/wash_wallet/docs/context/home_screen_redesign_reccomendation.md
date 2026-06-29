# 1. Prinsip Utama Redesign HomeScreen

## A. Home bukan pusat semua menu

Home tidak perlu menampung semua fitur aplikasi. Home cukup menjadi pintu cepat untuk pekerjaan harian kasir:

* membuat transaksi baru;
* melihat pesanan;
* memantau status order penting;
* melihat kas outlet;
* melakukan setoran;
* melihat notifikasi order baru;
* pindah pegawai;
* akses cepat ke customer bila workflow laundry memang sering dimulai dari pelanggan.

Fitur seperti kategori, layanan, paket deposit, membership, printer, profil, dan PIN sebaiknya tidak ditaruh sebagai menu utama Home. Itu lebih cocok masuk ke **Setting** atau **Setup Outlet**.

## B. Bottom bar menjadi root navigation

Rekomendasi root navigation:

| Tab       | Route Final | Fungsi                                         |
| --------- | ----------- | ---------------------------------------------- |
| Home      | `/home`     | Ringkasan kerja kasir                          |
| Dana      | `/finances` | Setoran, petty cash, pengeluaran               |
| Transaksi | `/orders`   | Daftar pesanan dan status order                |
| Setting   | `/settings` | Pengaturan aplikasi, akun, outlet, data master |

Customer tidak saya sarankan menjadi bottom tab utama, karena customer adalah fitur pendukung transaksi. Namun, Customer tetap boleh muncul sebagai **quick action** di Home.

## C. Drawer dihapus dari root screen

Root screen yang memakai bottom bar sebaiknya tidak lagi memakai drawer:

* Home;
* Dana;
* Transaksi;
* Setting.

Secara konseptual:

```dart
AppLayout(
  showDrawer: false,
  header: AppHeader(
    showMenuButton: false,
  ),
  bottomBar: AppBottomBar.navigation(...),
)
```

Drawer tidak perlu dijadikan fallback, karena requirement redesign sudah jelas: navigasi utama pindah ke bottom bar.

---

# 2. Rekomendasi Struktur HomeScreen Baru

Urutan section Home yang saya rekomendasikan:

## 1. Header Operasional

Header jangan terlalu ramai. Struktur ideal:

```text
Wash Wallet
Selamat bekerja, [Nama Pegawai]
[Switch Employee Icon] [Notification Icon + Badge]
```

Rekomendasi:

* hilangkan hamburger menu;
* tetap tampilkan icon switch employee;
* tetap tampilkan notification badge;
* notification tap langsung ke order dengan status `requested`;
* jangan pindahkan notification ke profile card agar tidak membingungkan.

Flow:

```text
Tap notification badge
→ clear badge
→ go('/orders?status=requested')
→ daftar order tampil dengan filter Requested
```

Catatan penting: karena `IndexOrdersScreen` sudah support `initialStatusFilter`, behavior ini tetap relevan.

---

## 2. Employee / Shift Summary Ringkas

`EmployeeInfoSection` tetap boleh ada, tetapi jangan dibuat terlalu dominan. Fungsinya cukup sebagai validasi identitas kasir yang sedang aktif.

Isi:

```text
[Nama Pegawai]
[Nomor Telepon]
Outlet aktif / shift aktif bila datanya tersedia
```

Interaksi yang disarankan:

```text
Tap employee card
→ /switch-employee
```

Namun, karena sudah ada icon switch employee di header, card ini bisa bersifat non-clickable agar tidak duplikatif.

Rekomendasi saya:

* untuk MVP: card hanya informasi;
* switch employee tetap di header;
* parameter `onNotificationTap` di profile card sebaiknya dibersihkan bila tidak dipakai.

---

## 3. Kas Outlet Card

Card ini penting karena kasir perlu tahu saldo kas outlet.

Struktur:

```text
Kas di Outlet
Rp xxx.xxx

[Setor]
```

Flow tombol Setor:

Pilihan paling aman untuk tahap redesign awal:

```text
Tap Setor
→ go('/finances')
→ tampilkan menu Dana & Keuangan
→ user pilih Setoran Kasir
```

Pilihan yang lebih matang apabila route detail sudah tersedia:

```text
Tap Setor
→ push('/finances/deposits/create')
→ form setoran kasir
→ selesai
→ kembali ke /finances atau /home
```

Saya lebih merekomendasikan tahap awal memakai `context.go('/finances')` dulu, karena route final setoran kasir belum jelas dari konteks yang diberikan.

---

## 4. Order Operational Summary

Data yang tersedia saat ini:

* `ordersInProduction`;
* `ordersNotPickedUp`;
* `ordersPickedUp`.

Maka Home jangan menampilkan chart atau revenue trend dulu. Lebih tepat tampilkan tiga status kerja:

```text
Status Pesanan Hari Ini / Operasional

Produksi        12
Belum Diambil   8
Sudah Diambil  20
```

Masing-masing status sebaiknya bisa ditap.

Flow:

```text
Tap Produksi
→ go('/orders?status=production')

Tap Belum Diambil
→ go('/orders?status=not_picked_up')

Tap Sudah Diambil
→ go('/orders?status=picked_up')
```

Catatan: nama status harus disesuaikan dengan enum/status backend yang benar. Jangan membuat status label UI yang tidak cocok dengan filter backend.

Untuk order baru/requested, saat ini data count tidak tersedia di `HomeLoaded`. Jadi jangan memaksakan card “Order Baru” kecuali datanya berasal dari notification badge atau API baru.

---

## 5. Primary Quick Actions

Quick action jangan mengulang bottom bar secara mentah. Quick action harus berbasis tugas cepat, bukan menu navigasi penuh.

Rekomendasi quick actions Home:

| Action               | Tujuan                | Flow                          |
| -------------------- | --------------------- | ----------------------------- |
| Buat Transaksi       | pekerjaan utama kasir | pilih customer → buat order   |
| Cari / Lihat Pesanan | akses order aktif     | `/orders`                     |
| Customer             | cari/tambah pelanggan | `/customers`                  |
| Setor Kas            | masuk ke Dana         | `/finances` atau flow setoran |

Namun, karena sudah ada tab Transaksi dan Dana, quick action perlu dibedakan secara copywriting.

Daripada:

```text
Dana & Keuangan
Lihat Transaksi
```

Lebih baik:

```text
Setor Kas
Cek Pesanan
```

Jadi quick actions terasa seperti shortcut kerja, bukan duplikasi bottom tab.

---

# 3. Flow HomeScreen yang Direkomendasikan

Secara konseptual:

```text
Login / Pilih Pegawai
        ↓
      Home
        ↓
 ┌──────────────────────────────┐
 │ Header                       │
 │ - Wash Wallet                │
 │ - Nama pegawai               │
 │ - Switch employee            │
 │ - Notification badge         │
 └──────────────────────────────┘
        ↓
 ┌──────────────────────────────┐
 │ Ringkasan Pegawai            │
 │ Nama + telepon               │
 └──────────────────────────────┘
        ↓
 ┌──────────────────────────────┐
 │ Kas Outlet                   │
 │ Saldo kas + tombol Setor     │
 └──────────────────────────────┘
        ↓
 ┌──────────────────────────────┐
 │ Status Pesanan               │
 │ Produksi                     │
 │ Belum Diambil                │
 │ Sudah Diambil                │
 └──────────────────────────────┘
        ↓
 ┌──────────────────────────────┐
 │ Aksi Cepat                   │
 │ Buat Transaksi               │
 │ Cek Pesanan                  │
 │ Customer                     │
 │ Setor Kas                    │
 └──────────────────────────────┘
        ↓
 Bottom Bar:
 Home | Dana | Transaksi | Setting
```

---

# 4. Flow Navigasi Detail

## A. Buat Transaksi

```text
Home
→ Tap Buat Transaksi
→ Pilih / cari customer
→ Buat order laundry
→ Review order
→ Pembayaran / simpan pesanan
→ Order detail atau order list
```

Catatan implementasi:

* flow ini boleh memakai `Navigator.push` atau `context.push`;
* ini bukan root tab;
* bottom bar tidak wajib tampil di create transaction flow karena user sedang dalam task fokus.

---

## B. Lihat Pesanan

```text
Home
→ Tap Cek Pesanan
→ go('/orders')
→ IndexOrdersScreen tampil
→ Bottom bar tetap terlihat
```

Kalau dari status card:

```text
Home
→ Tap Produksi
→ go('/orders?status=production')
→ IndexOrdersScreen filter Produksi
```

---

## C. Notification Order Baru

Ada dua jalur:

### 1. Tap badge notification

```text
Home
→ Tap notification icon
→ clear badge
→ go('/orders?status=requested')
```

### 2. Tap NewOrderBanner

```text
New order masuk
→ banner muncul
→ tap banner
→ push('/orders/:id') atau ShowOrderScreen
```

Untuk banner, memakai `push` masih masuk akal karena user masuk ke detail order spesifik. Yang perlu dihindari adalah memakai `push` untuk pindah antar root tab.

---

## D. Dana & Keuangan

```text
Bottom Bar Dana
→ go('/finances')
→ IndexFinancesScreen sebagai root tab
→ tampilkan:
   - Setoran Kasir
   - Saldo Petty Cash
   - Pengeluaran Outlet
```

Ketika user masuk detail:

```text
/finances
→ Setoran Kasir
→ push('/finances/deposits')
→ detail/list setoran
```

Atau apabila arsitektur route sudah matang:

```text
/finances/deposits
/finances/petty-cash
/finances/expenses
```

Tetapi landing `/finances` tetap harus terasa sebagai root, bukan screen yang punya back button.

---

## E. Setting dan Data Master

Karena drawer dihapus, Data Master perlu rumah baru.

Rekomendasi struktur Setting:

```text
Pengaturan

Akun
- Profil Pegawai
- PIN Keamanan

Perangkat
- Printer

Setup Outlet
- Pelanggan
- Kategori
- Layanan Laundry
- Paket Deposit
- Membership
```

Namun, saya tidak menyarankan semua Data Master langsung dijejer dalam satu list panjang tanpa grouping. Lebih rapi bila dibuat item:

```text
Setup Outlet
Kelola kategori, layanan, paket, membership, dan data pelanggan
```

Lalu masuk ke screen secondary:

```text
/settings/setup-outlet
→ Pelanggan
→ Kategori
→ Layanan Laundry
→ Paket Deposit
→ Membership
```

Customer tetap boleh punya shortcut di Home, karena customer sering dipakai dalam proses transaksi.

---

# 5. Rekomendasi Bottom Bar Logic

Masalah utama saat ini adalah `currentIndex: 0` hardcoded. Ini harus diganti menjadi berbasis route aktif.

Rekomendasi mapping:

```dart
final bottomNavItems = [
  BottomNavItem(label: 'Home', route: '/home'),
  BottomNavItem(label: 'Dana', route: '/finances'),
  BottomNavItem(label: 'Transaksi', route: '/orders'),
  BottomNavItem(label: 'Setting', route: '/settings'),
];
```

Logika index:

```dart
int getCurrentIndex(String location) {
  if (location.startsWith('/finances')) return 1;
  if (location.startsWith('/orders')) return 2;
  if (location.startsWith('/settings')) return 3;
  return 0;
}
```

Handling tap:

```dart
void onBottomBarTap(BuildContext context, int index) {
  final targetRoute = bottomNavItems[index].route;
  final currentLocation = GoRouterState.of(context).uri.toString();

  if (currentLocation == targetRoute) return;

  context.go(targetRoute);
}
```

Intinya:

* root tab memakai `context.go`;
* detail/task flow memakai `context.push`;
* jangan campur `Navigator.push` untuk root tab;
* jangan membuat screen stack bertumpuk saat user tap bottom bar berkali-kali.

---

# 6. Rekomendasi Route Final

Saya sarankan konsolidasi seperti ini:

```text
/home
/finances
/orders
/settings
/customers

/categories
/laundry-services
/service-packages
/membership-plans
```

Untuk `/dashboard`, jadikan alias atau redirect:

```text
/dashboard → /home
```

Jangan biarkan `/dashboard` dan `/home` sama-sama diperlakukan sebagai root berbeda, karena itu bisa bikin active bottom bar dan navigasi membingungkan.

---

# 7. Rekomendasi Layout Root Screen

Buat reusable layout untuk root tab, misalnya:

```dart
CashierRootLayout(
  currentIndex: currentIndex,
  header: ...,
  body: ...,
)
```

Tugas layout ini:

* mematikan drawer;
* memasang bottom bar;
* menentukan active tab;
* mengatur `context.go` untuk root navigation.

Dengan begitu, Home, Orders, Finances, dan Settings tidak perlu membuat bottom bar masing-masing secara manual.

Konsepnya:

```dart
class CashierRootLayout extends StatelessWidget {
  final Widget body;
  final AppHeader header;

  const CashierRootLayout({
    required this.body,
    required this.header,
  });

  @override
  Widget build(BuildContext context) {
    final location = GoRouterState.of(context).uri.toString();
    final currentIndex = getCurrentIndex(location);

    return AppLayout(
      showDrawer: false,
      header: header.copyWith(showMenuButton: false),
      body: body,
      bottomBar: AppBottomBar.navigation(
        currentIndex: currentIndex,
        items: cashierBottomNavItems,
        onTap: (index) => onBottomBarTap(context, index),
      ),
    );
  }
}
```

---

# 8. Rekomendasi Desain Home dalam Versi MVP

Untuk tahap awal, saya rekomendasikan HomeScreen v1 seperti ini:

```text
[Header]
Wash Wallet
Selamat bekerja, [Nama Pegawai]
[Switch Employee] [Notification Badge]

[Employee Card]
Nama Pegawai
Nomor HP

[Kas Outlet]
Rp xxx.xxx
Button: Setor Kas

[Status Pesanan]
Produksi
Belum Diambil
Sudah Diambil

[Aksi Cepat]
Buat Transaksi
Cek Pesanan
Customer
Setor Kas

[Bottom Bar]
Home | Dana | Transaksi | Setting
```

Yang dihapus:

* drawer;
* hamburger menu;
* duplikasi navigasi yang tidak perlu;
* bottom bar hardcoded index 0;
* `Navigator.push` untuk Dana dan Transaksi.

Yang dipertahankan:

* badge notification;
* new order banner;
* pull-to-refresh;
* state loading/error;
* quick action transaksi;
* ringkasan kas;
* ringkasan status order.

---

# 9. Prioritas Implementasi

Urutan pengerjaan yang paling aman:

## Tahap 1 — Benahi navigasi root

* tambahkan route `/finances`;
* jadikan `/dashboard` redirect ke `/home`;
* buat helper bottom bar;
* current index berbasis route;
* root navigation pakai `context.go`.

## Tahap 2 — Hilangkan drawer dari root screens

* Home;
* Orders;
* Finances;
* Settings.

Gunakan:

```dart
showDrawer: false
showMenuButton: false
```

## Tahap 3 — Rapikan Home section

* header tanpa hamburger;
* Kas Outlet card dengan action Setor;
* status order tappable;
* quick actions sebagai shortcut task;
* customer tetap sebagai shortcut sekunder.

## Tahap 4 — Pindahkan Data Master

* buat grouping di Setting;
* Data Master masuk ke Setup Outlet;
* jangan jadikan semua data master bottom tab.

## Tahap 5 — Perbaiki notification flow

* badge tap ke `/orders?status=requested`;
* banner tap ke detail order;
* idealnya notification listener dipindah ke root shell agar tidak hanya hidup di Home.

---

# 10. Kesimpulan Rekomendasi

Desain HomeScreen WashWallet yang paling tepat adalah **dashboard operasional kasir yang sederhana, cepat, dan task-oriented**. Bottom bar harus menjadi navigasi utama untuk Home, Dana, Transaksi, dan Setting. Drawer sebaiknya dihapus dari semua root screen agar model navigasi tidak tumpang tindih.

Home tidak perlu menjadi analytics dashboard penuh karena data API saat ini masih terbatas. Fokus terbaik adalah menampilkan identitas pegawai, saldo kas outlet, status pesanan, quick actions, notification badge, dan banner order baru. Data Master tetap harus bisa diakses, tetapi ditempatkan sebagai secondary flow melalui Setting atau Setup Outlet, bukan sebagai tab utama.
