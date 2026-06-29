# Show Outlet Screen — Implementation Plan

Dokumen ini berisi panduan lengkap untuk membangun halaman `ShowOutletScreen` pada customer mobile app. Halaman ini menampilkan daftar layanan laundry milik suatu outlet, dikelompokkan berdasarkan kategori, dengan fitur filter pill, section "Paling Laris", modal konfirmasi tambah keranjang, dan floating button untuk lanjut ke pemesanan.

---

## 1. Ringkasan Fitur

| Fitur | Deskripsi |
|---|---|
| **Header + Back Button** | AppBar dengan nama outlet dan tombol back |
| **Category Filter Pills** | Horizontal scrollable pill buttons, klik → auto-scroll ke section kategori |
| **Section Paling Laris** | Menampilkan layanan terlaris (estimasi dari semua kategori) |
| **Section per Kategori** | Judul kategori → daftar layanan di bawahnya |
| **Modal Konfirmasi** | Klik layanan → `AppBottomSheet.action` konfirmasi tambah ke keranjang |
| **Floating Button** | Muncul jika keranjang tidak kosong, menampilkan jumlah item & total harga |
  
---

## 2. Arsitektur & Data Flow

### A. Sumber Data

Backend endpoint: `GET /api/mobile/customer/outlets/{id}`

> [!IMPORTANT]
> Saat ini `OutletService::getById()` hanya memuat relasi `['owner']`. Perlu diubah agar saat dipanggil dari customer API, relasi `categories.laundryServices.unit` juga dimuat. Ini krusial karena halaman ini membutuhkan data kategori beserta layanan di dalamnya.

**Opsi Implementasi Backend:**
- Modifikasi `OutletController::show()` agar memanggil `getById($id, ['categories.laundryServices.unit', 'operationalDays'])` sehingga response mengembalikan `categories` yang masing-masing berisi `laundryServices` (beserta `unit`).

**Response yang diharapkan (setelah modifikasi):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Wash & Go Outlet",
    "categories": [
      {
        "id": 1,
        "name": "Cuci Reguler",
        "slug": "cuci-reguler",
        "laundryServices": [
          {
            "id": 1,
            "name": "Cuci Kering",
            "price": 7000,
            "durationHours": 24,
            "minQuantity": 3,
            "unit": { "id": 1, "name": "Kilogram", "symbol": "kg" },
            "description": "..."
          }
        ]
      }
    ]
  }
}
```

### B. Entity & Model yang Sudah Tersedia

Semua entity dan model sudah tersedia di `wash_wallet_domain`:

| Entity | Path | Field Penting |
|---|---|---|
| `Outlet` | `src/entities/outlet.dart` | `categories: List<Category>?` |
| `Category` | `src/entities/category.dart` | `laundryServices: List<LaundryService>?`, `name`, `slug` |
| `LaundryService` | `src/entities/laundry_service.dart` | `name`, `price`, `durationHours`, `minQuantity`, `unit: Unit?`, `category: Category?`, `description` |
| `Unit` | `src/entities/unit.dart` | `name`, `symbol` |

### C. State Management (Cubit)

**Existing:** `OutletCubit` sudah memiliki method `getById(int id)` yang memanggil `GetByIdUsecase` → `OutletRepository.getById(id)` → `OutletRemoteDatasource.getById(id)`.  
**State:** `OutletDetailLoaded(Outlet outlet)` sudah ada di `OutletState`.

**Perubahan State Management:**
1. **Outlet State (`OutletCubit`)**: Tidak perlu membuat file terpisah (`ShowOutletCubit`). Gunakan `OutletCubit` dan `OutletState` yang sudah ada untuk mengelola detail outlet serta *selected category filter*.
2. **Order / Cart State (`CartCubit` / `OrderCubit`)**: Semua state yang relevan dengan fitur *order* (cart items, subtotal) dipisah ke cubit tersendiri (bagian dari fitur `order`). *Cart* ini **disimpan di local storage** (e.g., `SharedPreferences` atau `Hive`) sehingga data tetap bertahan meski aplikasi ditutup.

---

## 3. Perubahan Backend

### [MODIFY] `app/Http/Controllers/Api/OutletController.php`

Ubah method `show()` agar memuat relasi yang dibutuhkan:

```diff
 public function show(int $id): JsonResponse
 {
     try {
-        $outlet = $this->outletService->getById($id);
+        $outlet = $this->outletService->getById($id, [
+            'categories.laundryServices.unit',
+            'operationalDays',
+        ]);

         return $this->successResponse(
             (new OutletResource($outlet))->resolve(),
             'Outlet retrieved successfully'
         );
```

> [!NOTE]
> Tidak perlu modifikasi `OutletService`, karena method `getById()` sudah menerima parameter `$relations` (default `['owner']`). Cukup override dari controller.

> [!TIP]
> **TODO Backend**: Implementasikan logic atau flag pada `laundryServices` untuk menentukan layanan "Paling Laris" secara dinamis (misal berdasarkan jumlah transaksi terbanyak) agar tidak sekedar mengambil 5 data pertama.

---

## 4. Perubahan Flutter — Data Layer

### [MODIFY] `outlet_remote_datasource.dart` (Tidak perlu perubahan)

Datasource `getById` sudah mengembalikan `OutletModel` yang di-parse dari JSON. Selama backend mengembalikan `categories` + `laundryServices` yang ter-nested, model `OutletModel` (menggunakan `CategoryModel`, `LaundryServiceModel`, `UnitModel`) akan otomatis parsing via freezed/json_serializable.

> [!IMPORTANT]
> Verifikasi bahwa `CategoryModel.fromJson` benar-benar mem-parse `laundryServices` nested field. Dari kode yang ada, `CategoryModel` **sudah** memiliki `List<LaundryServiceModel>? laundryServices` — ini sudah benar.

---

## 5. Perubahan Flutter — Presentation Layer

### A. File Baru yang Dibuat

```
features/outlet/presentation/
├── screens/
│   └── show_outlet_screen.dart     ← [MODIFY] (file sudah ada, isi kosong)
└── widgets/
    ├── category_filter_bar.dart    ← [NEW]
    ├── service_card.dart           ← [NEW]
    ├── service_category_section.dart ← [NEW]

features/order/presentation/
├── bloc/
│   ├── cart_cubit.dart             ← [NEW] (Dengan local storage persistence)
│   └── cart_state.dart             ← [NEW]
└── widgets/
    ├── add_to_cart_bottom_sheet.dart ← [NEW]
    └── cart_floating_button.dart   ← [NEW]
```

---

### B. Cubit & State Modifications

#### [MODIFY] `outlet_state.dart` & `outlet_cubit.dart`

Modifikasi `OutletDetailLoaded` untuk menyimpan state UI yang berkaitan dengan halaman outlet:

```dart
class OutletDetailLoaded extends OutletState {
  final Outlet outlet;
  final int? selectedCategoryId; // untuk filter pill highlight

  const OutletDetailLoaded({required this.outlet, this.selectedCategoryId});
  
  // implement copyWith ...
}
```

Tambahkan method di `OutletCubit`:
- `getById(int id)` — (sudah ada)
- `selectCategory(int? categoryId)` — emit state dengan `selectedCategoryId` baru

#### [NEW] `cart_state.dart` & `cart_cubit.dart` (Order Feature)

```dart
class CartState extends Equatable {
  final Map<int, int> cartItems; // serviceId → quantity
  
  // Helper getters
  int get totalItems => cartItems.values.fold(0, (a, b) => a + b);
  // Asumsi ada cara resolve Service model dari serviceId untuk hitung totalPrice
  bool get hasItems => cartItems.isNotEmpty;
}
```

Methods di `CartCubit` (menggunakan Local Storage):
- `loadCart()` — Membaca cart dari local storage saat inisialisasi
- `saveCart()` — Menyimpan state cart saat ini ke local storage
- `addToCart(int serviceId, int quantity)` — tambah/update dan `saveCart()`
- `removeFromCart(int serviceId)` — hapus dan `saveCart()`
- `clearCart()` — bersihkan dan `saveCart()`

---

### C. UI Components

#### [NEW] `category_filter_bar.dart`

Widget berupa `SingleChildScrollView` horizontal dengan `Row` berisi pill chips:

- Chip pertama: **"Semua"** (default selected, unfiltered)
- Chip berikutnya: satu per kategori aktif
- Menggunakan komponen `AppChip.primary(label: ..., selected: ..., onTap: ...)`
- Saat diklik → emit `selectCategory(categoryId)` + trigger scroll ke section terkait

**ScrollController Integration:**
Gunakan `GlobalKey` pada setiap section kategori, lalu `Scrollable.ensureVisible(key.currentContext!)` saat filter diklik.

#### [NEW] `service_card.dart`

Kartu layanan individual:
- Layout: `AppCard.outlined`
- Kiri: Icon container (menggunakan `Icons.local_laundry_service_rounded`)
- Kanan:
  - **Nama layanan** (bold)
  - **Harga**: Rp xxx / unit (format currency Indonesia)
  - **Durasi**: "±24 jam" 
  - **Min qty**: "Min. 3 kg"
- Seluruh card `onTap` → trigger modal konfirmasi

#### [NEW] `service_category_section.dart`

Section yang terdiri dari:
- **Title**: Nama kategori (bold, large)
- **Description**: Deskripsi kategori (opsional)
- **List layanan**: `Column` berisi `ServiceCard` items
- Setiap section diberi `GlobalKey` untuk scrolling target

#### [NEW] `add_to_cart_bottom_sheet.dart`

Modal konfirmasi menggunakan `AppBottomSheet.action`:
- **Title**: Nama layanan
- **Content**: Detail layanan (harga, durasi, deskripsi singkat)
- **Quantity Selector**: +/- counter (min = `minQuantity`)
- **Primary Action**: "Tambah ke Keranjang" → `context.read<CartCubit>().addToCart(serviceId, qty)`
- **Secondary Action**: "Batal" → `Navigator.pop()`

#### [NEW] `cart_floating_button.dart`

Floating action button yang muncul saat keranjang berisi item:
- Positioned di bottom center, di atas safe area
- **Layout**: Rounded container dengan gradient primary
- **Konten**: Icon keranjang + badge jumlah item + total harga
- **Label**: "Lanjut ke Pemesanan" 
- **OnTap**: Tampilkan snackbar "Coming Soon" (Halaman pemesanan belum tersedia)
- Animasi slide-up saat muncul, slide-down saat hilang

---

### D. Screen Utama

#### [MODIFY] `show_outlet_screen.dart`

```
Scaffold
├── AppBar
│   ├── leading: BackButton
│   └── title: outlet.name (dari state)
├── body: Column
│   ├── CategoryFilterBar (sticky/pinned)
│   └── Expanded → SingleChildScrollView
│       ├── Section "Paling Laris" (top 5 layanan, estimasi random/semua)
│       ├── SizedBox
│       ├── CategorySection #1
│       ├── SizedBox
│       ├── CategorySection #2
│       └── ...
└── floatingActionButton / Stack bottom:
    └── CartFloatingButton (conditional)
```

**Section "Paling Laris":**
Gunakan **5 layanan pertama dari semua kategori** sebagai representasi layanan terlaris untuk saat ini. Data diambil dari gabungan list layanan di semua kategori yang ada pada state `outlet`. Section ini menggunakan layout horizontal scroll (`SingleChildScrollView` horizontal) atau grid kecil.

**State Handling:**
- `OutletLoading` → Shimmer skeleton (header + 3 section cards)
- `OutletDetailLoaded` → Render filter bar + sections
- `OutletFailure` → Error state dengan tombol retry

---

## 6. Routing

### [MODIFY] `app_router.dart`

Tambahkan route baru di dalam branch outlets atau sebagai route standalone:

```dart
GoRoute(
  path: '/outlets/:id',
  builder: (context, state) {
    final id = int.parse(state.pathParameters['id']!);
    // Menggunakan OutletCubit yang sudah ada. CartCubit direkomendasikan di-inject di level lebih atas (MaterialApp) agar persisten.
    return BlocProvider.value(
      value: context.read<OutletCubit>()..getById(id),
      child: ShowOutletScreen(outletId: id),
    );
  },
),
```

### [MODIFY] `outlet_card.dart` (di `IndexOutletScreen`)

Hubungkan `onTap` pada `OutletCard` untuk navigasi ke `ShowOutletScreen`:

```dart
OutletCard(
  outlet: outlet,
  onTap: () => context.push('/outlets/${outlet.id}'),
),
```

---

## 7. Format Harga

Gunakan helper function untuk format currency Indonesia:

```dart
String formatRupiah(double amount) {
  final formatter = NumberFormat('#,##0', 'id_ID');
  return 'Rp ${formatter.format(amount.toInt())}';
}
// Contoh: formatRupiah(7000) → "Rp 7.000"
```

Bisa ditaruh di `lib/core/utils/currency_formatter.dart` atau inline.

---

## 8. Instruksi Eksekusi

- [ ] **Backend**: Modifikasi `OutletController::show()` untuk load relasi `categories.laundryServices.unit`
- [ ] **State Management**: Modifikasi `OutletCubit` & `OutletState` yang sudah ada. Buat `CartCubit` & `CartState` dengan local storage persistence (di fitur order).
- [ ] **Widgets**: Buat komponen `CategoryFilterBar`, `ServiceCard`, `ServiceCategorySection`, `AddToCartBottomSheet`, `CartFloatingButton`
- [ ] **Screen**: Implementasi `ShowOutletScreen` dengan layout lengkap
- [ ] **Router**: Tambah route `/outlets/:id` dan hubungkan navigasi dari `IndexOutletScreen`
- [ ] **Testing**: Verifikasi flow end-to-end (termasuk restart app untuk mengecek local storage cart)

---

## 9. Catatan Tambahan

> [!NOTE]
> **Section "Paling Laris"**: Menggunakan 5 layanan pertama sebagai placeholder sementara. TODO backend sudah dicatat untuk pengembangan fitur analytics di masa mendatang.

> [!NOTE]
> **Navigasi "Lanjut ke Pemesanan"**: Akan menampilkan snackbar "Coming Soon" hingga fitur checkout/pemesanan diimplementasikan.
