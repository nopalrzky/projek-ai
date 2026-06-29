# UX Home, Search, dan Discovery Layanan Customer

Improvement UX untuk tiga layar utama customer: Home Screen (redesign branded header + search entry point), Search Screen (layar baru khusus input keyword + history + saran), dan Discovery Screen (refinement filter/sort sesuai user need baru).

## Relasi dengan Plan Sebelumnya

> [!NOTE]
> Plan ini melengkapi [customer_service_discovery_search_filter_plan.md](file:///C:/Bimo/Project/wash_wallet/docs/plan/customer_service_discovery_search_filter_plan.md) yang sudah diimplementasikan. Feature `discovery` sudah ada lengkap (31 file). Plan ini **tidak membuat ulang** data/domain/bloc discovery, tetapi melakukan:
> 1. **Redesign** Home Screen.
> 2. **Tambah** Search Screen baru sebagai perantara Home → Discovery.
> 3. **Refine** Discovery Screen: header + sort + filter horizontal + filter bottom sheet lengkap.

## User Review Required

> [!IMPORTANT]
> **Flow navigasi baru.** Home search bar sekarang bukan input aktif; tap akan membuka Search Screen terpisah. Dari Search Screen, submit keyword membuka Discovery Screen. Apakah ini sudah sesuai? Flow: `Home → Search Screen → Discovery Screen`.

> [!IMPORTANT]
> **Search history.** Plan ini menyimpan search history di `SharedPreferences` (local, max 10 item). History tidak disync ke server. Apakah ini cukup untuk MVP?

> [!IMPORTANT]
> **Suggested search.** Untuk MVP, suggested search bersifat statis (hardcoded list seperti `Cuci kiloan`, `Cuci kering`, `Express`, `Setrika`, `Karpet`). Apakah ini cukup, atau perlu ditarik dari backend?

> [!IMPORTANT]
> **Filter lengkap di Discovery.** User need menambahkan filter lokasi, metode pembayaran, range harga + preset, dan rating. Ini belum ada di filter bottom sheet discovery saat ini. Plan ini menambahkan widget filter baru. Apakah semua filter masuk MVP atau mau phased?

## Open Questions

> [!IMPORTANT]
> 1. Apakah quick action cards di Home (Voucher, Riwayat, Bantuan) tetap dipertahankan, atau diganti dengan quick action baru sesuai user need?
> 2. Apakah promo section di Home tetap ada, atau diganti/digeser posisinya?
> 3. Apakah dekorasi header Home (wave/bubble) perlu didesainkan dulu, atau boleh implementasi visual langsung?

---

## Panduan Implementasi

> [!CAUTION]
> **WAJIB DIBACA SEBELUM CODING.** Setiap file yang dibuat harus mengikuti standardisasi spec di `docs/spec/`:
>
> | Spec | Lokasi |
> |------|--------|
> | Cubit | [cubit_spec.md](file:///C:/Bimo/Project/wash_wallet/docs/spec/cubit_spec.md) |
> | State | [state_spec.md](file:///C:/Bimo/Project/wash_wallet/docs/spec/state_spec.md) |
> | Provider | [provider_spec.md](file:///C:/Bimo/Project/wash_wallet/docs/spec/provider_spec.md) |
> | Usecase | [usecase_spec.md](file:///C:/Bimo/Project/wash_wallet/docs/spec/usecase_spec.md) |
> | Repository | [repository_spec.md](file:///C:/Bimo/Project/wash_wallet/docs/spec/repository_spec.md) |
> | Repository Impl | [repository_impl_spec.md](file:///C:/Bimo/Project/wash_wallet/docs/spec/repository_impl_spec.md) |
> | Remote Datasource | [remote_datasource_spec.md](file:///C:/Bimo/Project/wash_wallet/docs/spec/remote_datasource_spec.md) |

> [!CAUTION]
> **Aturan coding yang HARUS dipatuhi:**
> - Gunakan widget dari `wash_wallet_ui` (`AppCard`, `AppButton`, `AppBadge`, `AppChip`, `AppEmptyState`, `AppLayout`, `AppHeader`, `AppTextField`, `AppLoadingIndicator`, `AppBottomSheet`, `AppListTile`, `AppDivider`)
> - Gunakan theme token via `context.colors`, `context.space`, `context.radius`, `context.typography` — **JANGAN hardcode warna, spacing, atau font**
> - **JANGAN tulis comment** di kode — biarkan clean code
> - **Pecah kode menjadi widget kecil** di folder `widgets/` — setiap widget max ~80-100 baris
> - Gunakan `result.when()` — **JANGAN** `.fold()` atau `if (result.isSuccess)`
> - State menggunakan `sealed class` dengan pattern matching di UI
> - Constructor cubit menggunakan named parameters
> - Remote datasource mengembalikan `Model`, bukan `Result`
> - Repository impl mengembalikan `Result` via try/catch + `_mapExceptionToFailure`

---

## Proposed Changes

### Component 1: Home Screen Redesign

Home screen saat ini ([home_screen.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/home/presentation/screens/home_screen.dart)) sudah memiliki: `HomeHeader` (alamat + action buttons), `GreetingWalletCard`, `PendingPaymentShortcut`, `PromoSection`, dan card CTA "Cari layanan" yang navigasi ke `/discovery`.

Perubahan yang diperlukan:

---

#### [MODIFY] [home_screen.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/home/presentation/screens/home_screen.dart)

Redesign layout Home menjadi:

```text
CustomScrollView
├── HomeBrandedHeaderWidget (BARU — branded header dengan wave/pattern)
│   ├── Alamat customer (tap → /customer-addresses)
│   ├── HomeSearchEntryWidget (BARU — search bar tap-only → /search)
│   └── Cart button dengan dynamic badge dari CartCubit
├── SizedBox spacing
├── HomeQuickInfoWidget (BARU — wallet balance + riwayat pesanan)
├── SizedBox spacing
├── PendingPaymentShortcut (existing, tetap)
├── SizedBox spacing
└── PromoSection (existing, tetap)
```

Perubahan utama:
1. Hapus `AppLayout` wrapper yang current dan gunakan `Scaffold` langsung agar header branded bisa full-width tanpa padding AppLayout.
2. Ganti `HomeHeader` existing dengan `HomeBrandedHeaderWidget` baru.
3. Hapus card CTA "Cari layanan" inline (line 112-161), ganti dengan `HomeSearchEntryWidget` di dalam branded header.
4. Pindahkan wallet info dari `GreetingWalletCard` ke `HomeQuickInfoWidget` yang lebih compact.
5. Screen tetap menggunakan `BlocBuilder<HomeDashboardCubit, HomeDashboardState>`.
6. Cart badge membaca dari `CartCubit` yang sudah ada sebagai global cubit.

---

#### [NEW] `home_branded_header_widget.dart`

**Lokasi:** `apps/customer/lib/features/home/presentation/widgets/home_branded_header_widget.dart`

Header branded Wash Wallet yang full-width. Layout:

```text
Container (gradient primary → primaryDark, atau primary surface)
├── SafeArea
│   └── Column
│       ├── Row (top row)
│       │   ├── Address area (label + value, tap → /customer-addresses)
│       │   │   └── Text ellipsis, max 1 line
│       │   ├── Notification icon button
│       │   └── HomeCartButtonWidget (BARU, dengan badge)
│       ├── SizedBox spacing
│       └── HomeSearchEntryWidget (tap-only search bar → /search)
├── Decorative wave/curve di bottom (CustomPainter atau ClipPath)
```

Props:
- `addressLabel: String`
- `addressValue: String`
- `cartItemCount: int`
- `onAddressTap: VoidCallback`
- `onCartTap: VoidCallback`
- `onSearchTap: VoidCallback`

Dekorasi visual:
- Background menggunakan `context.colors.primary` gradient
- Teks alamat dan icon menggunakan `Colors.white` atau `context.colors.onPrimary` (warna kontras)
- Wave/curve di bagian bawah menggunakan `CustomPainter` sederhana
- Tidak boleh mengganggu keterbacaan search bar dan alamat

---

#### [NEW] `home_search_entry_widget.dart`

**Lokasi:** `apps/customer/lib/features/home/presentation/widgets/home_search_entry_widget.dart`

Search bar yang hanya berfungsi sebagai entry point (tap-only, bukan input aktif).

```text
GestureDetector(onTap: → context.push('/search'))
└── Container (rounded, surface color with slight opacity, border)
    └── Row
        ├── Icon search (white or onPrimary)
        ├── Text placeholder "Mau laundry apa hari ini?" (white/onPrimary, semi-transparent)
        └── SizedBox
```

Props:
- `onTap: VoidCallback`

Widget ini menggunakan `Container` styled mirip search field, bukan `AppTextField`, karena tidak menerima input.

---

#### [NEW] `home_cart_button_widget.dart`

**Lokasi:** `apps/customer/lib/features/home/presentation/widgets/home_cart_button_widget.dart`

Cart button dengan dynamic badge dari `CartCubit`.

```text
BlocBuilder<CartCubit, CartState>
└── Stack
    ├── IconButton (shopping_cart icon, onTap → /order-summary atau cart)
    └── Positioned badge (if totalItems > 0)
        └── Container circle with count text
```

Props:
- `onTap: VoidCallback`
- `iconColor: Color` (untuk mendukung light/dark header)

---

#### [NEW] `home_quick_info_widget.dart`

**Lokasi:** `apps/customer/lib/features/home/presentation/widgets/home_quick_info_widget.dart`

Card horizontal compact untuk wallet balance dan riwayat pesanan.

```text
Row
├── Expanded: AppCard wallet info
│   ├── Icon wallet
│   ├── Column
│   │   ├── Text "Saldo Wallet"
│   │   └── Text formatted balance
│   └── AppButton "Top Up" (small)
└── SizedBox spacing
└── Expanded: AppCard riwayat
    ├── Icon assignment
    ├── Column
    │   ├── Text "Riwayat Pesanan"
    │   └── Text "{count} pesanan aktif" (dari orderSummary)
    └── Icon chevron_right
```

Props:
- `depositBalance: int`
- `activeOrderCount: int`
- `onTopupTap: VoidCallback`
- `onOrderHistoryTap: VoidCallback`

---

#### [MODIFY] [home_header.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/home/presentation/widgets/home_header.dart)

File ini **tidak lagi dipakai** oleh `HomeScreen` setelah redesign. Bisa dibiarkan untuk backward compatibility atau dihapus. Rekomendasi: biarkan dulu, tidak dihapus.

#### [MODIFY] [greeting_wallet_card.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/home/presentation/widgets/greeting_wallet_card.dart)

File ini **tidak lagi dipakai** oleh `HomeScreen` karena wallet info pindah ke `HomeQuickInfoWidget`. Biarkan untuk backward compatibility.

---

### Component 2: Search Screen (BARU)

Search Screen adalah layar perantara antara Home dan Discovery. Customer tap search bar di Home → masuk Search Screen → ketik keyword → submit → Discovery Screen.

---

#### [NEW] `search_screen.dart`

**Lokasi:** `apps/customer/lib/features/search/presentation/screens/search_screen.dart`

Screen ini **tidak memerlukan cubit/bloc** karena tidak ada API call. Hanya mengelola:
1. Input text (autofocus)
2. Search history (baca dari SharedPreferences)
3. Suggested search (statis)
4. Navigasi ke `/discovery?query={keyword}` saat submit

Layout:

```text
Scaffold
└── SafeArea
    └── Column
        ├── SearchScreenHeaderWidget (back button + input aktif)
        ├── Expanded
        │   └── SingleChildScrollView
        │       └── Padding
        │           ├── SearchHistorySectionWidget (jika ada history)
        │           ├── SizedBox spacing
        │           └── SearchSuggestedSectionWidget (always show)
```

State management:
- `TextEditingController` untuk input
- `List<String> _searchHistory` dimuat dari `SearchHistoryService` di `initState`
- Saat submit: simpan keyword ke history, navigasi ke `/discovery?query={keyword}`
- Saat tap history/suggestion: simpan ke history, navigasi ke `/discovery?query={keyword}`

---

#### [NEW] `search_screen_header_widget.dart`

**Lokasi:** `apps/customer/lib/features/search/presentation/widgets/search_screen_header_widget.dart`

Header search screen:

```text
Padding
└── Row
    ├── IconButton back (context.pop)
    └── Expanded AppTextField.filled
        ├── autofocus: true
        ├── hint: "Cari layanan laundry"
        ├── textInputAction: TextInputAction.search
        ├── prefixIcon: Icon search
        ├── onSubmitted: → submit search
        └── suffixIcon: clear button (jika ada text)
```

Props:
- `controller: TextEditingController`
- `onSubmitted: ValueChanged<String>`
- `onClear: VoidCallback`

---

#### [NEW] `search_history_section_widget.dart`

**Lokasi:** `apps/customer/lib/features/search/presentation/widgets/search_history_section_widget.dart`

Section riwayat pencarian:

```text
Column
├── Row
│   ├── Text "Riwayat pencarian" (headlineSmall bold)
│   └── TextButton "Hapus" (onClearAll, textSecondary color)
├── SizedBox spacing
└── Wrap (spacing: context.space.sm)
    └── AppChip.primary(label: history[i], onTap: → select, selected: false)
        × N items (max 10)
```

Props:
- `history: List<String>`
- `onSelect: ValueChanged<String>`
- `onClearAll: VoidCallback`

---

#### [NEW] `search_suggested_section_widget.dart`

**Lokasi:** `apps/customer/lib/features/search/presentation/widgets/search_suggested_section_widget.dart`

Section pencarian pilihan:

```text
Column
├── Text "Pencarian pilihan" (headlineSmall bold)
├── SizedBox spacing
└── Wrap (spacing: context.space.sm)
    └── AppChip.primary(label: suggestion[i], onTap: → select, selected: false)
        × N items
```

Props:
- `suggestions: List<String>`
- `onSelect: ValueChanged<String>`

Suggested search MVP (statis):
```dart
const defaultSuggestions = [
  'Cuci kiloan',
  'Cuci kering',
  'Express',
  'Setrika',
  'Karpet',
  'Bed cover',
  'Sepatu',
  'Jas',
];
```

---

#### [NEW] `search_history_service.dart`

**Lokasi:** `apps/customer/lib/features/search/data/search_history_service.dart`

Service sederhana untuk baca/tulis search history ke SharedPreferences:

```dart
class SearchHistoryService {
  static const _key = 'search_history';
  static const _maxItems = 10;

  Future<List<String>> getHistory() async { ... }
  Future<void> addToHistory(String query) async { ... }
  Future<void> clearHistory() async { ... }
}
```

Tidak perlu repository/usecase pattern karena ini murni local storage sederhana tanpa API call.

---

### Component 3: Discovery Screen Refinements

Discovery screen sudah ada dan berfungsi. Perubahan:

---

#### [MODIFY] [discovery_screen.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/discovery/presentation/screens/discovery_screen.dart)

Perubahan:

1. **Terima query parameter dari route.** Tambahkan `final String? initialQuery` ke constructor. Saat dibuka dari Search Screen via `/discovery?query=xxx`, parse query dan langsung trigger search di `initState`.

2. **Redesign header.** Tambahkan sort button di header sebelah search bar:

```text
AppHeader
├── Back button (onBackPressed)
├── title area diganti search bar (menampilkan keyword aktif)
└── actions: [Sort IconButton]
```

3. **Search bar di discovery tetap editable** via `DiscoverySearchBarWidget` yang sudah ada. Saat tap sort button, tampilkan sort selector bottom sheet.

---

#### [MODIFY] [discovery_quick_filter_bar_widget.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/discovery/presentation/widgets/discovery_quick_filter_bar_widget.dart)

Redesign filter horizontal sesuai user need baru:

```text
SingleChildScrollView horizontal
└── Row chips:
    [Semua] [Buka sekarang] [Antar-jemput] [Datang langsung] [Rating 4+] [Harga hemat] [Filter ▼]
```

Perubahan:
- Tambahkan chip `Semua` (reset all filters)
- Tambahkan chip `Buka sekarang` (filter outlet yang sedang buka)
- Rename chip kurir menjadi `Antar-jemput`
- Tambahkan chip `Datang langsung`
- Tambahkan chip `Rating 4+` (filter rating >= 4.0)
- Tambahkan chip `Harga hemat` (sort cheapest)
- Chip `Filter` di ujung kanan membuka full filter bottom sheet
- Chip aktif menggunakan `AppChip.primary(selected: true)`

---

#### [MODIFY] [discovery_filter_bottom_sheet_widget.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/discovery/presentation/widgets/discovery_filter_bottom_sheet_widget.dart)

Redesign filter bottom sheet lengkap sesuai user need:

```text
AppBottomSheet scrollable
└── Column
    ├── Text "Filter" (headlineSmall bold)
    ├── SizedBox spacing
    ├── AppDivider.soft
    ├── SizedBox spacing
    ├── DiscoveryLocationFilterWidget (BARU)
    ├── SizedBox spacing
    ├── AppDivider.soft
    ├── SizedBox spacing
    ├── DiscoveryPaymentFilterWidget (BARU)
    ├── SizedBox spacing
    ├── AppDivider.soft
    ├── SizedBox spacing
    ├── DiscoveryPriceRangeFilterWidget (existing, bisa dipertahankan)
    ├── SizedBox spacing
    ├── DiscoveryPricePresetFilterWidget (BARU)
    ├── SizedBox spacing
    ├── AppDivider.soft
    ├── SizedBox spacing
    ├── DiscoveryRatingFilterWidget (BARU)
    ├── SizedBox spacing
    └── Row fixed bottom actions
        ├── Expanded: AppButton "Atur Ulang" (outlined/secondary)
        ├── SizedBox spacing
        └── Expanded: AppButton.primary "Terapkan"
```

---

#### [NEW] `discovery_location_filter_widget.dart`

**Lokasi:** `apps/customer/lib/features/discovery/presentation/widgets/discovery_location_filter_widget.dart`

Filter lokasi:

```text
Column
├── Text "Lokasi" (titleMedium bold)
├── SizedBox spacing
└── Column selectable options (radio-like via AppListTile.compact)
    ├── AppListTile.compact "Gunakan alamat utama" (leading: radio icon)
    ├── AppListTile.compact "Pilih alamat lain" (leading: radio icon, tap → /customer-addresses)
    └── AppListTile.compact "Sekitar lokasi saya" (leading: radio icon, tap → request GPS)
```

Props:
- `selectedOption: String?`
- `onChanged: ValueChanged<String>`

---

#### [NEW] `discovery_payment_filter_widget.dart`

**Lokasi:** `apps/customer/lib/features/discovery/presentation/widgets/discovery_payment_filter_widget.dart`

Filter metode pembayaran:

```text
Column
├── Text "Metode Pembayaran" (titleMedium bold)
├── SizedBox spacing
└── Wrap (spacing: context.space.sm)
    ├── AppChip.primary(label: "Wallet", selected: ..., onTap: ...)
    ├── AppChip.primary(label: "Transfer", selected: ..., onTap: ...)
    └── AppChip.primary(label: "Bayar di outlet", selected: ..., onTap: ...)
```

Props:
- `selectedMethod: String?`
- `onChanged: ValueChanged<String?>`

---

#### [NEW] `discovery_price_preset_filter_widget.dart`

**Lokasi:** `apps/customer/lib/features/discovery/presentation/widgets/discovery_price_preset_filter_widget.dart`

Preset harga:

```text
Column
├── Text "Rentang Harga Cepat" (titleMedium bold)
├── SizedBox spacing
└── Wrap (spacing: context.space.sm)
    ├── AppChip.primary(label: "0 - 25rb", selected: ..., onTap: ...)
    ├── AppChip.primary(label: "25rb - 50rb", selected: ..., onTap: ...)
    ├── AppChip.primary(label: "50rb - 75rb", selected: ..., onTap: ...)
    ├── AppChip.primary(label: "75rb - 100rb", selected: ..., onTap: ...)
    └── AppChip.primary(label: "100rb+", selected: ..., onTap: ...)
```

Saat dipilih, otomatis set `priceMin`/`priceMax` di filter state.

Props:
- `selectedPreset: int?` (index)
- `onChanged: ValueChanged<({double? min, double? max})>`

---

#### [NEW] `discovery_rating_filter_widget.dart`

**Lokasi:** `apps/customer/lib/features/discovery/presentation/widgets/discovery_rating_filter_widget.dart`

Filter rating:

```text
Column
├── Text "Rating Minimal" (titleMedium bold)
├── SizedBox spacing
└── Wrap (spacing: context.space.sm)
    ├── AppChip.primary(label: "⭐ 4.5+", selected: ..., onTap: ...)
    ├── AppChip.primary(label: "⭐ 4.0+", selected: ..., onTap: ...)
    └── AppChip.primary(label: "⭐ 3.5+", selected: ..., onTap: ...)
```

Props:
- `selectedRating: double?`
- `onChanged: ValueChanged<double?>`

---

#### [MODIFY] [discovery_sort_selector_widget.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/discovery/presentation/widgets/discovery_sort_selector_widget.dart)

Update pilihan sort sesuai user need baru:

```text
AppBottomSheet
└── Column
    ├── Text "Urutkan" (headlineSmall bold)
    ├── SizedBox spacing
    ├── AppDivider.soft
    ├── AppListTile.compact "Terkait" (leading: check if selected)
    ├── AppListTile.compact "Terbaru" (leading: check if selected)
    ├── AppListTile.compact "Terlaris" (leading: check if selected)
    ├── AppListTile.compact "Harga tertinggi" (leading: check if selected)
    └── AppListTile.compact "Harga terendah" (leading: check if selected)
```

Mapping ke backend `serviceSortBy`:
- `Terkait` → `relevant`
- `Terbaru` → `newest`
- `Terlaris` → `popular`
- `Harga tertinggi` → `price_desc`
- `Harga terendah` → `cheapest`

---

#### [MODIFY] [discovery_filter.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/discovery/domain/entities/discovery_filter.dart)

Tambahkan field baru untuk filter yang ditambahkan:

```dart
final bool? isCurrentlyOpen;
final double? minRating;
final String? paymentMethod;
```

Pastikan `copyWith`, `hasActiveFilter`, dan props di-update. Tambahkan `clearXxx` parameter di `copyWith` untuk setiap field nullable yang baru.

---

### Component 4: Routing

#### [MODIFY] [app_router.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/core/router/app_router.dart)

Perubahan:

1. **Tambah route `/search`:**

```dart
GoRoute(
  path: '/search',
  builder: (context, state) => const SearchScreen(),
),
```

2. **Update route `/discovery` untuk menerima query parameter:**

```dart
GoRoute(
  path: '/discovery',
  builder: (context, state) {
    final query = state.uri.queryParameters['query'];
    return BlocProvider(
      create: (_) => DiscoveryProvider.createCubit(dio, endpoints),
      child: DiscoveryScreen(initialQuery: query),
    );
  },
),
```

3. Import `SearchScreen`.

---

## Struktur File

### File Baru (14 file)

```text
apps/customer/lib/features/home/presentation/widgets/
├── home_branded_header_widget.dart         (BARU)
├── home_search_entry_widget.dart           (BARU)
├── home_cart_button_widget.dart            (BARU)
└── home_quick_info_widget.dart             (BARU)

apps/customer/lib/features/search/
├── data/
│   └── search_history_service.dart         (BARU)
└── presentation/
    ├── screens/
    │   └── search_screen.dart              (BARU)
    └── widgets/
        ├── search_screen_header_widget.dart     (BARU)
        ├── search_history_section_widget.dart   (BARU)
        └── search_suggested_section_widget.dart (BARU)

apps/customer/lib/features/discovery/presentation/widgets/
├── discovery_location_filter_widget.dart        (BARU)
├── discovery_payment_filter_widget.dart         (BARU)
├── discovery_price_preset_filter_widget.dart    (BARU)
├── discovery_rating_filter_widget.dart          (BARU)
└── discovery_open_now_filter_chip.dart          (BARU — opsional, bisa inline di quick filter)
```

### File Dimodifikasi (7 file)

```text
apps/customer/lib/features/home/presentation/screens/home_screen.dart
apps/customer/lib/features/discovery/presentation/screens/discovery_screen.dart
apps/customer/lib/features/discovery/presentation/widgets/discovery_quick_filter_bar_widget.dart
apps/customer/lib/features/discovery/presentation/widgets/discovery_filter_bottom_sheet_widget.dart
apps/customer/lib/features/discovery/presentation/widgets/discovery_sort_selector_widget.dart
apps/customer/lib/features/discovery/domain/entities/discovery_filter.dart
apps/customer/lib/core/router/app_router.dart
```

### File Deprecated (2 file, tidak dihapus)

```text
apps/customer/lib/features/home/presentation/widgets/home_header.dart          (deprecated, diganti home_branded_header)
apps/customer/lib/features/home/presentation/widgets/greeting_wallet_card.dart  (deprecated, diganti home_quick_info)
```

---

## Verification Plan

### Automated Checks

```bash
cd apps/customer && flutter analyze
cd apps/customer && flutter build apk --debug
```

### Manual Verification

#### Home Screen
1. Home menampilkan branded header dengan warna utama brand.
2. Header menampilkan alamat customer (atau "Alamat belum tersedia").
3. Alamat panjang dipotong dengan ellipsis.
4. Tap alamat membuka `/customer-addresses`.
5. Search bar menampilkan placeholder "Mau laundry apa hari ini?".
6. Search bar **bukan** input aktif — tap membuka Search Screen.
7. Cart button menampilkan badge jumlah item dari CartCubit.
8. Cart button tanpa item tidak menampilkan badge.
9. Quick info menampilkan saldo wallet dan shortcut riwayat pesanan.
10. Pending payment shortcut tetap muncul jika ada order unpaid.
11. Promo section tetap tampil.

#### Search Screen
12. Search Screen terbuka dari tap search bar Home.
13. Input search langsung fokus (autofocus).
14. Back button kembali ke Home.
15. Search history muncul jika ada riwayat.
16. Tap item history langsung navigasi ke Discovery dengan keyword.
17. Suggested search selalu muncul.
18. Tap suggestion navigasi ke Discovery dengan keyword.
19. Submit input navigasi ke Discovery dengan keyword.
20. Keyword tersimpan di search history.
21. "Hapus" menghapus semua search history.
22. Screen tanpa history menyembunyikan section history.

#### Discovery Screen
23. Discovery terbuka dengan keyword dari Search Screen.
24. Keyword ditampilkan di search bar discovery.
25. Sort button ada di header, tap membuka sort selector.
26. Sort options: Terkait, Terbaru, Terlaris, Harga tertinggi, Harga terendah.
27. Default sort = Terkait.
28. Filter horizontal chips scrollable.
29. Chip "Semua" me-reset filter.
30. Chip "Buka sekarang" filter outlet buka.
31. Chip "Rating 4+" filter rating >= 4.
32. Chip "Filter" membuka bottom sheet.
33. Filter bottom sheet memiliki: lokasi, metode pembayaran, range harga, preset harga, rating.
34. Button "Atur Ulang" di bottom sheet menghapus semua filter.
35. Button "Terapkan" menerapkan filter dan menutup bottom sheet.
36. Empty state muncul saat tidak ada hasil.
37. Error state punya tombol "Coba Lagi".
38. Loading state menampilkan indicator/skeleton.
39. Semua warna menggunakan theme token, bukan hardcode.
40. UI konsisten di light dan dark mode.
