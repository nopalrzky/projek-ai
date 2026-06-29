# Customer Address Index Screen — Implementation Plan

**Tujuan:** Membangun layar manajemen alamat customer (`IndexCustomerAddressScreen`), yang dapat diakses dengan mengetuk area alamat di `HomeHeader`. Fokus tahap ini hanya pada tampilan **index** — menampilkan daftar alamat, pencarian, filter, dan tombol tambah.

---

> [!IMPORTANT]
> **MANDATORY INSTRUCTION FOR AI AGENT — BACA DULU SEBELUM MENULIS KODE:**
>
> Sebelum menulis atau mengubah kode apapun, Anda **WAJIB** membaca dan memahami:
>
> **1. Semua spesifikasi arsitektur:**
> - `docs/spec/remote_datasource_spec.md`
> - `docs/spec/repository_spec.md`
> - `docs/spec/repository_impl_spec.md`
> - `docs/spec/usecase_spec.md`
> - `docs/spec/state_spec.md`
> - `docs/spec/cubit_spec.md`
> - `docs/spec/provider_spec.md`
>
> **2. Shared UI components yang sudah ada — jangan buat ulang komponen yang sudah ada:**
> Buka package `wash_wallet_ui` dan pelajari komponen yang tersedia, seperti:
> - `AppCard` (elevated, outlined, dll)
> - `AppBadge`
> - `AppLayout`
> - `context.colors.*` — sistem warna token
> - `context.typography.*` — sistem tipografi
> - `context.space.*` — sistem spacing
> - `context.radius.*` — sistem border radius
>
> **3. Pelajari contoh widget yang sudah ada di project ini:**
> - `lib/features/home/presentation/widgets/home_header.dart` — cara pakai `context.colors`, `context.typography`, `context.space`, `context.radius`
> - `lib/features/home/presentation/widgets/greeting_wallet_card.dart` — cara pakai `AppCard.elevated`, `AppBadge`
> - `lib/features/home/presentation/screens/home_screen.dart` — pola `BlocBuilder`, `CustomScrollView`, `SliverList`
>
> Gunakan design token yang sama (warna, spacing, typography, radius) agar tampilan konsisten dengan seluruh app.
>
> Referensi visual desain: **Alfagift Home Screen** — struktur header dengan label alamat + chevron, search bar yang bersih, dan filter toggle tersembunyi.

---

## Ringkasan Fitur

- **Entry point**: Tap area **"Alamat Pengiriman"** di kiri atas `HomeHeader` → navigasi ke `/customer-addresses`.
- **Index screen**: Menampilkan list alamat milik customer yang sedang login.
- **Search**: Search bar di bagian atas, digunakan untuk filter by label/street.
- **Filter panel**: Tombol filter di kanan search bar, secara default **tersembunyi** (hidden). Saat diklik, panel filter muncul di bawah search bar (animated expand/collapse).
- **Filter options**: Filter berdasarkan `isPrimary` (semua / hanya alamat utama).
- **FAB**: Floating Action Button di sudut kanan bawah untuk navigasi ke screen tambah alamat (untuk saat ini cukup navigasi ke placeholder route).
- **Alamat Primary**: Ditandai dengan badge/chip khusus pada list item.

---

## Struktur File yang Perlu Dibuat / Dimodifikasi

### [MODIFY] `home_header.dart`

Bungkus area kiri (kolom `addressLabel` + `addressValue`) dengan `GestureDetector` atau `InkWell`. Saat diklik, navigasi ke `/customer-addresses` menggunakan `context.go('/customer-addresses')` dari `go_router`.

Tambahkan juga ikon chevron kecil (`Icons.keyboard_arrow_down_rounded`) di sebelah kanan `addressValue` sebagai indikator bahwa area ini bisa diklik, mengikuti pola Alfagift.

### [NEW] `lib/features/customer_address/presentation/screens/index_customer_address_screen.dart`

Screen utama daftar alamat. Struktur layout:

```
Scaffold
├── AppBar
│   └── title: "Alamat Saya"
├── Column (body)
│   ├── _SearchAndFilterBar (sticky di atas)
│   │   ├── Row
│   │   │   ├── Expanded → TextField search (styled)
│   │   │   └── _FilterToggleButton (icon filter, toggle show/hide panel)
│   │   └── AnimatedSwitcher / AnimatedSize
│   │       └── _FilterPanel (default hidden, expand saat filter diklik)
│   └── Expanded
│       └── BlocBuilder<CustomerAddressListCubit, CustomerAddressListState>
│           ├── loading → Center(CircularProgressIndicator)
│           ├── failure → _ErrorView
│           └── success → ListView.separated (daftar CustomerAddressCard)
└── FloatingActionButton
    └── icon: Icons.add_rounded
    └── onPressed: context.push('/customer-addresses/create') [placeholder]
```

### [NEW] `lib/features/customer_address/presentation/widgets/customer_address_card.dart`

Widget card untuk setiap item alamat. Tampilkan:
- **Label alamat** (contoh: "Rumah", "Kantor") — gunakan `context.typography.titleSmall` dengan `fontWeight: w700`
- **Badge "Utama"** — tampilkan `AppBadge.success(label: 'Utama')` jika `isPrimary == true`
- **Nama penerima** + nomor telepon — gunakan `context.typography.bodySmall` dengan warna `context.colors.textSecondary`
- **Alamat lengkap (street)** — gunakan `context.typography.bodySmall`
- **Trailing**: `IconButton` dengan `Icons.more_vert_rounded` (placeholder untuk edit/delete, implementasi nanti)

Gunakan `AppCard.outlined()` sebagai pembungkus agar konsisten dengan design system.

### [NEW] `lib/features/customer_address/presentation/widgets/customer_address_search_bar.dart`

Widget search bar standalone. Input styled menggunakan `InputDecoration` yang mengikuti `context.colors` dan `context.radius`, bukan `TextField` default. Prefix icon: `Icons.search_rounded`. Hint text: `"Cari alamat..."`.

### [NEW] `lib/features/customer_address/presentation/widgets/customer_address_filter_panel.dart`

Panel filter yang expand/collapse. Konten:
- Label "Tampilkan:" dengan opsi chip toggle:
  - **Semua** (default selected)
  - **Alamat Utama**

Gunakan `FilterChip` atau implementasikan chip custom mengikuti color token. Saat filter berubah, emit ke cubit via callback.

### [MODIFY] `lib/core/router/app_router.dart`

Tambahkan route baru:

```dart
GoRoute(
  path: '/customer-addresses',
  builder: (context, state) => const IndexCustomerAddressScreen(),
),
```

---

## Detail Layout `_SearchAndFilterBar`

```
┌─────────────────────────────────────────────────┐
│  [ 🔍 Cari alamat...                ] [ 🎛 ]   │
│                                                   │
│  ▼ Filter panel (hidden by default)              │
│  Tampilkan:  [Semua] [Alamat Utama]              │
└─────────────────────────────────────────────────┘
```

- Tombol filter menggunakan `DecoratedBox` dengan `context.colors.surface`, border `context.colors.border`, dan radius `context.radius.lg` — **sama persis** dengan `_HeaderActionButton` di `home_header.dart` agar konsisten.
- Saat filter panel aktif, tombol filter berubah warna background menjadi `context.colors.primary` dengan icon berwarna `context.colors.onPrimary`.
- Animasi expand/collapse filter panel menggunakan `AnimatedSize` + `AnimatedOpacity`.

---

## Detail Layout List Item (`CustomerAddressCard`)

```
┌────────────────────────────────────────────────┐
│  Rumah    [Utama]                    [⋮]       │
│  Bimo · 081234567890                           │
│  Jl. Sukajadi No. 10                          │
└────────────────────────────────────────────────┘
```

- Padding internal: `context.space.md` semua sisi.
- Separator antara item: `SizedBox(height: context.space.sm)`.
- Tidak menggunakan `Divider` antar card, melainkan jarak vertikal.

---

## State & Cubit (sesuai `state_spec.md` dan `cubit_spec.md`)

### `CustomerAddressListState`

```dart
sealed class CustomerAddressListState {}

class CustomerAddressListInitial extends CustomerAddressListState {}
class CustomerAddressListLoading extends CustomerAddressListState {}
class CustomerAddressListSuccess extends CustomerAddressListState {
  final List<CustomerAddress> addresses;
  CustomerAddressListSuccess({required this.addresses});
}
class CustomerAddressListFailure extends CustomerAddressListState {
  final Failure failure;
  CustomerAddressListFailure({required this.failure});
}
```

### `CustomerAddressListCubit`

Method yang perlu diimplementasikan:
- `getAll({String? search, bool? isPrimary})` — memanggil `GetAllCustomerAddressUsecase` dengan param opsional.
- Merespons perubahan search & filter dari UI dengan memanggil ulang `getAll`.

Gunakan pola `Result.when(success: ..., failure: ...)` sesuai `cubit_spec.md`.

---

## Provider

Daftarkan di `customer_address_provider.dart`:
- `CustomerAddressListCubit` — dibuat fresh setiap kali screen dibuka (via `BlocProvider` di route atau di screen).

---

## Navigasi (Entry Point dari HomeHeader)

Di `home_header.dart`, bungkus kolom kiri dengan `GestureDetector`:

```dart
GestureDetector(
  onTap: () => context.push('/customer-addresses'),
  child: Row(
    mainAxisSize: MainAxisSize.min,
    children: [
      Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(addressLabel, ...),  // "Alamat Pengiriman"
          Text(addressValue, ...),  // "Rumah - Jl. Sukajadi..."
        ],
      ),
      SizedBox(width: context.space.xs),
      Icon(
        Icons.keyboard_arrow_down_rounded,
        size: 18,
        color: context.colors.textSecondary,
      ),
    ],
  ),
),
```

---

## Urutan Pengerjaan (Checklist untuk AI Agent)

- [ ] Baca semua spec di `docs/spec/`.
- [ ] Pelajari widget existing: `home_header.dart`, `greeting_wallet_card.dart`, `home_screen.dart`.
- [ ] Cek komponen yang tersedia di `wash_wallet_ui`.
- [ ] Modifikasi `home_header.dart` — tambahkan navigasi tap + ikon chevron.
- [ ] Buat `index_customer_address_screen.dart`.
- [ ] Buat `customer_address_card.dart`.
- [ ] Buat `customer_address_search_bar.dart`.
- [ ] Buat `customer_address_filter_panel.dart`.
- [ ] Buat/sesuaikan `CustomerAddressListState` dan `CustomerAddressListCubit`.
- [ ] Daftarkan di `customer_address_provider.dart`.
- [ ] Tambahkan route `/customer-addresses` di `app_router.dart`.
- [ ] Jalankan `dart run build_runner build -d` jika ada file Freezed.
