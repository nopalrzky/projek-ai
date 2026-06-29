# Improvement Header Location Selector pada Discovery Screen

Menambahkan Location Selector pada header Discovery screen agar customer dapat melihat alamat aktif, membuka bottom sheet pemilihan lokasi, dan mengganti alamat melalui search manual, current location, alamat favorit, alamat terakhir, atau map picker. Alamat hanya berubah setelah konfirmasi. Setelah konfirmasi, Discovery content refresh berdasarkan lokasi baru.

Referensi: [header_improvement_discovery_screen_user_need.md](file:///C:/Bimo/Project/wash_wallet/docs/user_need/header_improvement_discovery_screen_user_need.md)

---

## User Review Required

> [!IMPORTANT]
> **Posisi Sort & Refresh Button**: Saat ini header (`DiscoveryStickySearchHeaderWidget`) terdiri dari `[Back] [Search Bar] [Sort] [Refresh]`. Dengan penambahan location selector, plan ini mengubah layout menjadi **dua baris**:
> - **Baris 1 (top)**: `[Back] [Address Selector (expanded)] [History Button]`
> - **Baris 2 (existing)**: `[Search Bar] [Sort] [Refresh]`
>
> Sort dan refresh tetap di posisinya. Hanya baris atas yang baru. Apakah setuju?

> [!IMPORTANT]
> **Address History Button**: User need menyebutkan address history button di kanan header yang membuka daftar alamat terakhir. Plan ini menempatkan history button di kanan baris atas header — saat ditekan, membuka bottom sheet location picker yang sama (scroll ke section alamat terakhir). Apakah setuju, atau lebih baik digabung saja ke bottom sheet tanpa button terpisah?

> [!IMPORTANT]
> **Map Picker — Sudah Ada**: Codebase sudah memiliki [map_picker_bottom_sheet.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/core/widgets/map_picker_bottom_sheet.dart) di `core/widgets/`. Plan ini akan **reuse** map picker existing dan mengintegrasikannya ke flow location picker bottom sheet. Map picker sudah menggunakan `geolocator` dan mengembalikan `Map<String, dynamic>` (lat, lng, address). Apakah setuju?

> [!IMPORTANT]
> **Geocoding / Address Search**: Codebase sudah memiliki [places_service.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/core/services/places_service.dart) dan [address_autocomplete_field.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/core/widgets/address_autocomplete_field.dart) di `core/`. Plan ini akan **reuse** service existing untuk search alamat. Apakah setuju?

> [!IMPORTANT]
> **CustomerAddress Entity vs AddressEntity**: Codebase sudah memiliki `CustomerAddress` entity di [customer_address.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/customer_address/domain/entities/customer_address.dart) dengan fields: `id, label, recipientName, recipientPhone, street, notes, latitude, longitude, isPrimary, villageId/Name, districtId/Name, regencyId/Name, provinceId/Name`. Plan ini akan menggunakan **`CustomerAddress` entity existing** sebagai tipe alamat aktif, bukan membuat entity baru. Apakah setuju?

## Open Questions

> [!NOTE]
> **Recent Addresses Storage**: Plan ini mengasumsikan recent addresses disimpan **lokal** menggunakan `SharedPreferences` (via pattern yang sudah ada di `OnboardingService`). Apakah setuju, atau lebih memilih backend endpoint?

> [!NOTE]
> **Jumlah Max Recent Addresses**: Plan ini mengasumsikan **5 item** terakhir. Apakah jumlah ini sudah sesuai?

> [!NOTE]
> **Alamat Aktif Persistensi**: Saat ini Discovery mengambil GPS koordinat device via `LocationService`. Setelah improvement, alamat aktif akan disimpan di state cubit dan juga lokal agar tetap tersedia setelah app restart. Apakah setuju?

---

## Konteks Codebase yang Sudah Dipelajari

### Arsitektur
- **Monorepo Melos** dengan 4 packages: `wash_wallet_core`, `wash_wallet_data`, `wash_wallet_domain`, `wash_wallet_ui`
- **Feature-first + Clean Architecture**: setiap feature punya `data/`, `domain/`, `presentation/`
- **State management**: `flutter_bloc` (Cubit), sealed class states, `Equatable`, `Result<T>` (dari core)
- **DI**: Provider factory pattern dengan static `createCubit()` method
- **Routing**: GoRouter dengan `StatefulShellRoute.indexedStack`
- **Shared services** di `core/services/` dan `core/widgets/`

### Existing Discovery Screen
| File | Deskripsi |
|------|-----------|
| [discovery_screen.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/discovery/presentation/screens/discovery_screen.dart) | `StatefulWidget`, uses `AppLayout(header:, body:)`, init mengambil GPS lalu `loadRecommendations(lat, lng)` |
| [discovery_sticky_search_header_widget.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/discovery/presentation/widgets/discovery_sticky_search_header_widget.dart) | Current header: `[Back] [Search Bar] [Sort] [Refresh]`, 110 lines |
| [discovery_cubit.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/discovery/presentation/bloc/discovery_cubit.dart) | Methods: `loadRecommendations(lat, lng)`, `search()`, `loadMore()`, `updateFilter()`, `clearSearch()`, `refresh()`, `retry()` |
| [discovery_state.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/discovery/presentation/bloc/discovery_state.dart) | Sealed: `Initial`, `Loading`, `RecommendationsLoaded`, `SearchResultLoaded`, `Failure` |
| [discovery_provider.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/discovery/presentation/providers/discovery_provider.dart) | Static factory: `createCubit(dio, endpoints)` |
| 28 widget files | Filter bar, search bar, bottom sheets, service cards, dll |

### Existing Customer Address Feature
| File | Deskripsi |
|------|-----------|
| [customer_address.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/features/customer_address/domain/entities/customer_address.dart) | Entity: `id, label, recipientName, recipientPhone, street, notes, latitude, longitude, isPrimary, village/district/regency/province` |
| Customer address screens | CRUD screens untuk manage alamat customer |
| Customer address cubit | Manages list of saved addresses |

### Existing Location & Map Services
| File | Deskripsi |
|------|-----------|
| [location_service.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/core/services/location_service.dart) | `geolocator` + `permission_handler`, returns `Result<Position>` |
| [places_service.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/core/services/places_service.dart) | Address search/autocomplete service |
| [map_picker_bottom_sheet.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/core/widgets/map_picker_bottom_sheet.dart) | Full map picker, returns `Map<String, dynamic>` |
| [address_autocomplete_field.dart](file:///C:/Bimo/Project/wash_wallet/apps/customer/lib/core/widgets/address_autocomplete_field.dart) | Autocomplete text field for address search |

### Shared UI Widgets yang Akan Digunakan
| Widget | Pattern | Penggunaan di Plan |
|--------|---------|--------------------|
| `AppLayout` | `AppLayout(header:, body:)` | Tetap sebagai scaffold wrapper Discovery |
| `AppBottomSheet.show()` | Static method, returns `Future<T?>` | Location picker bottom sheet |
| `AppTextField.filled()` / `.search()` | Named constructor | Search input alamat |
| `AppButton.primary()` / `.outline()` / `.ghost()` / `.icon()` | Named constructor | Konfirmasi, quick actions, icon buttons |
| `AppListTile` / `.compact()` | Named constructor | Item alamat favorit & terakhir |
| `AppLoadingIndicator` | `AppLoadingIndicator(message:)` | Loading states |
| `AppEmptyState.search()` | Named constructor | Empty search results |
| `AppErrorState` | `AppErrorState(message:, onRetry:)` | Error states |
| `AppChip` | `AppChip(label:, onTap:)` | Quick action chips (current location, map) |
| `AppDivider` / `.soft()` | Named constructor | Section separators |

### Theme System — Context Accessors (WAJIB Digunakan)
```dart
context.colors       // → AppColorExtension (semantic colors: primary, textPrimary, surface, border, dll)
context.typography   // → AppTypographyExtension (text styles: bodyMedium, labelLarge, caption, dll)
context.space        // → AppSpacingExtension (spacing: insetsAll.md, insetsHorizontal.lg, dll)
context.radius       // → AppRadiusExtension (radius: all.md, top.lg, dll)
```

### Standarisasi Spec (WAJIB Dibaca)
| Spec | Aturan Kunci |
|------|-------------|
| [cubit_spec.md](file:///C:/Bimo/Project/wash_wallet/docs/spec/cubit_spec.md) | Cubit hanya depend usecase. `result.when()` pattern (BUKAN `.fold()`). Named params. Emit Loading untuk page 1 saja. |
| [state_spec.md](file:///C:/Bimo/Project/wash_wallet/docs/spec/state_spec.md) | Sealed class + Equatable. 6 standard states. Plural untuk list loaded. |
| [usecase_spec.md](file:///C:/Bimo/Project/wash_wallet/docs/spec/usecase_spec.md) | `call()` method (callable class). `Future<Result<T>>`. Satu file per usecase. Class name TANPA feature prefix. |
| [repository_spec.md](file:///C:/Bimo/Project/wash_wallet/docs/spec/repository_spec.md) | Abstract di domain. `Future<Result<T>>`. Standard CRUD: `getAll, getById, store, update, destroy`. |
| [repository_impl_spec.md](file:///C:/Bimo/Project/wash_wallet/docs/spec/repository_impl_spec.md) | Implements abstract. `Result.success()` / `Result.failure()`. Exception mapping: `ApiException`, `NetworkException`. |
| [remote_datasource_spec.md](file:///C:/Bimo/Project/wash_wallet/docs/spec/remote_datasource_spec.md) | Abstract + Impl satu file. `Dio` + `ApiEndpoints`. `_validateResponse()` + `_handleError()`. Return `Future<Model>`. |
| [provider_spec.md](file:///C:/Bimo/Project/wash_wallet/docs/spec/provider_spec.md) | `FeatureProvider._()` private constructor. Static `createCubit()`. Static `create*()` per dependency. |

---

## Proposed Changes

### Aturan Implementasi (WAJIB Diikuti AI Model)

> [!CAUTION]
> **WAJIB baca semua spec** di `docs/spec/` sebelum menulis code apapun. Ikuti pattern dari spec secara konsisten.

> [!CAUTION]
> **WAJIB gunakan shared UI widgets** dari `wash_wallet_ui` package (lihat tabel di atas). JANGAN membuat widget yang sudah ada. Gunakan **named constructor pattern** yang konsisten (e.g., `AppButton.primary()`, `AppListTile.compact()`, `AppTextField.search()`).

> [!CAUTION]
> **WAJIB gunakan theme via context extension**: `context.colors.*`, `context.typography.*`, `context.space.*`, `context.radius.*`. JANGAN PERNAH hardcode warna (`Color(0xFF...)`), font size, spacing, atau border radius. Semua harus dari theme system.

> [!CAUTION]
> **JANGAN ada comment** dalam code. Nama class, method, dan variable harus self-documenting (clean code). Ini standar project.

> [!CAUTION]
> **JANGAN buat file panjang**. Pecah menjadi widget-widget kecil di folder `widgets/`. Satu widget per file. Setiap widget fokus satu tanggung jawab. Letakkan location picker widgets dalam subfolder `widgets/location_picker/`.

> [!CAUTION]
> **Gunakan named parameters** untuk semua constructor dan method. Ikuti naming convention project: file `snake_case`, class `PascalCase`, suffix `Widget` untuk presentation widgets.

> [!CAUTION]
> **Gunakan `Result<T>` pattern** dari `wash_wallet_core` (BUKAN `Either` dari dartz). Gunakan `result.when(success:, failure:)` di cubit (BUKAN `.fold()`).

> [!CAUTION]
> **Gunakan sealed class + Equatable** untuk state (BUKAN freezed). Ikuti state_spec.md.

> [!CAUTION]
> **Gunakan Provider factory pattern**: `FeatureProvider._()` private constructor, static `createCubit()` method. Ikuti provider_spec.md.

> [!CAUTION]
> **Reuse existing services/widgets**: `LocationService`, `PlacesService`, `MapPickerBottomSheet`, `AddressAutocompleteField`, `CustomerAddress` entity. JANGAN duplikasi.

---

### Component 1: Domain Layer — Recent Address

Menambahkan repository contract dan use case untuk recent addresses. Menggunakan `CustomerAddress` entity yang sudah ada.

---

#### [NEW] `recent_address_repository.dart`
**Path**: `apps/customer/lib/features/discovery/domain/repositories/recent_address_repository.dart`

```dart
abstract class RecentAddressRepository {
  Future<Result<List<CustomerAddress>>> getAll();
  Future<Result<void>> save(CustomerAddress address);
  Future<Result<void>> clear();
}
```

---

#### [NEW] `get_all_usecase.dart` (Recent Address)
**Path**: `apps/customer/lib/features/discovery/domain/usecases/recent_address/get_all_usecase.dart`

Use case untuk mengambil daftar recent addresses dari local storage.

```dart
class GetAllUsecase {
  final RecentAddressRepository _repository;
  GetAllUsecase(this._repository);
  Future<Result<List<CustomerAddress>>> call() async {
    return await _repository.getAll();
  }
}
```

---

#### [NEW] `save_usecase.dart` (Recent Address)
**Path**: `apps/customer/lib/features/discovery/domain/usecases/recent_address/save_usecase.dart`

Use case untuk menyimpan alamat ke recent addresses setelah konfirmasi.

---

### Component 2: Data Layer — Recent Address Local Storage

---

#### [NEW] `recent_address_local_datasource.dart`
**Path**: `apps/customer/lib/features/discovery/data/datasources/recent_address_local_datasource.dart`

Abstract + Impl dalam satu file. Menggunakan `SharedPreferences` untuk persist recent addresses sebagai JSON list. Max 5 items. LIFO order (terbaru di atas).

---

#### [NEW] `recent_address_repository_impl.dart`
**Path**: `apps/customer/lib/features/discovery/data/repositories/recent_address_repository_impl.dart`

Implements `RecentAddressRepository`. Try-catch dengan `Result.success()` / `Result.failure()`.

---

### Component 3: Location Picker Cubit & State

State management untuk bottom sheet location picker. Diletakkan di feature discovery karena location picker adalah sub-flow dari discovery.

---

#### [NEW] `location_picker_state.dart`
**Path**: `apps/customer/lib/features/discovery/presentation/bloc/location_picker_state.dart`

Menggunakan **sealed class + Equatable** pattern sesuai state_spec. Karena location picker memiliki banyak shared fields yang berubah secara incremental (search keyword, results, favorites, recents, selected candidate), plan ini menggunakan **single state class with status enum** agar tidak terlalu banyak state variant.

```dart
enum LocationPickerStatus { initial, loading, loaded, confirming, error }

class LocationPickerState extends Equatable {
  final LocationPickerStatus status;
  final CustomerAddress? activeAddress;
  final CustomerAddress? selectedCandidate;
  final List<dynamic> searchResults;        // dari PlacesService
  final List<CustomerAddress> favoriteAddresses;
  final List<CustomerAddress> recentAddresses;
  final String searchKeyword;
  final bool isSearching;
  final bool isResolvingCurrentLocation;
  final String? errorMessage;

  // constructor, copyWith, props
}
```

> [!NOTE]
> Menggunakan single class with status dan `copyWith()` karena banyak field yang shared dan berubah incremental. Ini lebih cocok daripada sealed union untuk use case ini.

---

#### [NEW] `location_picker_cubit.dart`
**Path**: `apps/customer/lib/features/discovery/presentation/bloc/location_picker_cubit.dart`

Methods:
| Method | Deskripsi |
|--------|-----------|
| `init()` | Load favorite addresses (dari `CustomerAddressListCubit` atau use case existing) + recent addresses + active address |
| `searchAddress({required String keyword})` | Search alamat via `PlacesService` existing |
| `clearSearch()` | Reset search results dan keyword |
| `selectSearchResult({required dynamic result})` | Resolve place detail → set selectedCandidate |
| `useCurrentLocation()` | `LocationService` → reverse geocode → set selectedCandidate |
| `selectFavoriteAddress({required CustomerAddress address})` | Set selectedCandidate |
| `selectRecentAddress({required CustomerAddress address})` | Set selectedCandidate |
| `selectFromMap()` | Open `MapPickerBottomSheet` existing → get result → set selectedCandidate |
| `confirmAddress()` | Confirm selected candidate sebagai active address, save ke recent |
| `resetSelection()` | Reset selectedCandidate tanpa mengubah active address |

Dependencies (injected via constructor):
- `GetAllUsecase` (customer addresses, untuk favorites — reuse existing)
- `GetAllUsecase` (recent addresses — baru)
- `SaveUsecase` (recent address — baru)
- `LocationService` (existing)
- `PlacesService` (existing)

---

#### [NEW] `location_picker_provider.dart`
**Path**: `apps/customer/lib/features/discovery/presentation/providers/location_picker_provider.dart`

Static factory pattern sesuai provider_spec:
```dart
class LocationPickerProvider {
  LocationPickerProvider._();

  static LocationPickerCubit createCubit(...) {
    final recentDatasource = _createRecentAddressLocalDatasource();
    final recentRepository = _createRecentAddressRepository(recentDatasource);
    final getRecentAddressesUsecase = _createGetAllUsecase(recentRepository);
    final saveRecentAddressUsecase = _createSaveUsecase(recentRepository);
    // ... wire up
    return LocationPickerCubit(...);
  }
}
```

---

### Component 4: Discovery Header Widgets

Refactor header dari satu widget menjadi komposisi widget kecil. Header baru memiliki **dua baris**.

---

#### [MODIFY] `discovery_sticky_search_header_widget.dart`
**Path**: `apps/customer/lib/features/discovery/presentation/widgets/discovery_sticky_search_header_widget.dart`

Tambahkan **baris atas** di atas search bar row yang sudah ada:
```
Column(
  children: [
    DiscoveryLocationHeaderWidget(...),   // [NEW] Baris 1: Back + Address + History
    existing search/sort/refresh row,      // Baris 2: tetap seperti sekarang
  ],
)
```

Search bar, sort button, dan refresh button **tidak berubah**.

---

#### [NEW] `discovery_location_header_widget.dart`
**Path**: `apps/customer/lib/features/discovery/presentation/widgets/discovery_location_header_widget.dart`

Baris atas header. Komposisi:
```
Row(
  children: [
    DiscoveryBackButtonWidget(),           // Back
    Expanded(DiscoveryAddressSelectorWidget()), // Address selector
    DiscoveryAddressHistoryButtonWidget(),  // History
  ],
)
```

Menggunakan `context.space` untuk padding, `context.colors.surface` untuk background.

---

#### [NEW] `discovery_back_button_widget.dart`
**Path**: `apps/customer/lib/features/discovery/presentation/widgets/discovery_back_button_widget.dart`

Wrap `AppButton.icon()` dengan `Icons.arrow_back_ios_new` dan `context.pop()`. Ukuran tap target 40x40 (konsisten dengan icon buttons existing di header).

---

#### [NEW] `discovery_address_selector_widget.dart`
**Path**: `apps/customer/lib/features/discovery/presentation/widgets/discovery_address_selector_widget.dart`

Widget utama di tengah header. `BlocBuilder<LocationPickerCubit, LocationPickerState>`.

Layout:
```
InkWell(onTap: openBottomSheet)
  Row(
    Icon(location_on, context.colors.primary)
    Expanded(
      Column(
        Text("Alamat Pengiriman", context.typography.caption)  // label atas
        Text(addressLabel, context.typography.labelMedium, maxLines: 1, ellipsis)  // alamat
      )
    )
    Icon(keyboard_arrow_down, context.colors.textTertiary)
  )
```

States:
- **Loading**: Shimmer/skeleton placeholder
- **Loaded + ada alamat**: `"Label - Street..."` atau `"Street..."` jika label kosong
- **Loaded + tidak ada alamat**: `"Alamat belum dipilih"` (tappable, warna `context.colors.textTertiary`)

Format alamat:
```
Jika label ada: "Rumah - Jl. Demak Jaya II..."
Jika label kosong: "Jl. Demak Jaya II No.82..."
```

---

#### [NEW] `discovery_address_history_button_widget.dart`
**Path**: `apps/customer/lib/features/discovery/presentation/widgets/discovery_address_history_button_widget.dart`

`AppButton.icon()` dengan `Icons.history` atau `Icons.location_history`. `onTap` membuka `LocationPickerBottomSheetWidget.show()` (sama dengan address selector).

---

### Component 5: Location Picker Bottom Sheet Widgets

Semua widget untuk bottom sheet location picker diletakkan dalam subfolder `widgets/location_picker/`.

---

#### [NEW] `location_picker_bottom_sheet_widget.dart`
**Path**: `apps/customer/lib/features/discovery/presentation/widgets/location_picker/location_picker_bottom_sheet_widget.dart`

Orchestrator. Static `show()` method yang menggunakan `AppBottomSheet.show()`:

```dart
class LocationPickerBottomSheetWidget extends StatelessWidget {
  static Future<CustomerAddress?> show(BuildContext context) {
    return AppBottomSheet.show<CustomerAddress>(
      context,
      title: 'Pilih Lokasi',
      child: BlocProvider(
        create: (_) => LocationPickerProvider.createCubit(...),
        child: const LocationPickerBottomSheetWidget(),
      ),
    );
  }
}
```

Body composisi (scrollable):
```
SingleChildScrollView(
  Column(
    LocationPickerSearchInputWidget(),
    LocationPickerQuickActionsWidget(),
    LocationPickerSearchResultsWidget(),     // conditional: visible saat ada keyword
    AppDivider.soft(),                        // separator (conditional)
    LocationPickerFavoriteAddressesWidget(),  // conditional: visible saat ada data
    AppDivider.soft(),                        // separator (conditional)
    LocationPickerRecentAddressesWidget(),    // conditional: visible saat ada data
    LocationPickerConfirmButtonWidget(),      // conditional: visible saat ada candidate
  ),
)
```

---

#### [NEW] `location_picker_search_input_widget.dart`
**Path**: `apps/customer/lib/features/discovery/presentation/widgets/location_picker/location_picker_search_input_widget.dart`

Menggunakan `AppTextField.search()` atau `AppTextField.filled()` dengan:
- Hint: `"Cari alamat..."`
- Prefix icon: search
- Suffix icon: clear (visible saat ada text)
- Debounce 500ms menggunakan `Timer` (pattern yang sudah dipakai di `DiscoverySearchBarWidget`)
- `onChanged` → `context.read<LocationPickerCubit>().searchAddress(keyword:)`

---

#### [NEW] `location_picker_quick_actions_widget.dart`
**Path**: `apps/customer/lib/features/discovery/presentation/widgets/location_picker/location_picker_quick_actions_widget.dart`

Dua action row:
```
Column(
  LocationPickerActionTileWidget(
    icon: Icons.my_location,
    label: "Gunakan lokasimu saat ini",
    onTap: () => cubit.useCurrentLocation(),
    isLoading: state.isResolvingCurrentLocation,
  ),
  LocationPickerActionTileWidget(
    icon: Icons.map_outlined,
    label: "Pilih lewat peta",
    onTap: () => _openMapPicker(context),
  ),
)
```

Menggunakan `AppListTile.compact()` atau custom Row dengan `context.colors`, `context.typography`.

---

#### [NEW] `location_picker_action_tile_widget.dart`
**Path**: `apps/customer/lib/features/discovery/presentation/widgets/location_picker/location_picker_action_tile_widget.dart`

Reusable tile untuk quick action (current location, map picker). Leading icon berwarna `context.colors.primary`, title dengan `context.typography.labelMedium`, optional loading indicator, trailing chevron.

---

#### [NEW] `location_picker_search_results_widget.dart`
**Path**: `apps/customer/lib/features/discovery/presentation/widgets/location_picker/location_picker_search_results_widget.dart`

`BlocBuilder` yang menampilkan list search results. Visible hanya saat `state.searchKeyword.isNotEmpty`.

States:
- Searching: `AppLoadingIndicator(message: "Mencari alamat...")`
- Ada results: List of `LocationPickerAddressItemWidget`
- Tidak ada results: `AppEmptyState.search(title: "Alamat tidak ditemukan", description: "Coba kata kunci lain atau pilih lewat peta.")`

---

#### [NEW] `location_picker_favorite_addresses_widget.dart`
**Path**: `apps/customer/lib/features/discovery/presentation/widgets/location_picker/location_picker_favorite_addresses_widget.dart`

Section "Alamat Favorit". `BlocBuilder` yang menampilkan list favorit (dari `CustomerAddress` yang `isPrimary` atau semua saved addresses). Hidden jika list kosong.

```
Column(
  Text("Alamat Favorit", context.typography.labelLarge),
  ...addresses.map((a) => LocationPickerAddressItemWidget(
    address: a,
    icon: Icons.favorite_border,
    onTap: () => cubit.selectFavoriteAddress(address: a),
  )),
)
```

---

#### [NEW] `location_picker_recent_addresses_widget.dart`
**Path**: `apps/customer/lib/features/discovery/presentation/widgets/location_picker/location_picker_recent_addresses_widget.dart`

Section "Alamat Terakhir". Pattern sama dengan favorite. Hidden jika list kosong.

---

#### [NEW] `location_picker_address_item_widget.dart`
**Path**: `apps/customer/lib/features/discovery/presentation/widgets/location_picker/location_picker_address_item_widget.dart`

Reusable widget untuk satu item alamat. Dipakai oleh search results, favorites, dan recents.

Menggunakan `AppListTile.compact()` atau `AppListTile()` dengan:
- Leading: Icon (pin/home/history) berwarna `context.colors.primary`
- Title: label atau title alamat (`context.typography.labelMedium`)
- Subtitle: detail alamat, `maxLines: 1`, ellipsis (`context.typography.bodySmall`, `context.colors.textSecondary`)
- `onTap` callback

---

#### [NEW] `location_picker_confirm_button_widget.dart`
**Path**: `apps/customer/lib/features/discovery/presentation/widgets/location_picker/location_picker_confirm_button_widget.dart`

`BlocBuilder`. Visible hanya saat `state.selectedCandidate != null`.

Menampilkan selected address detail + confirm button:
```
Column(
  AppDivider(),
  Padding(
    Column(
      Text(selectedCandidate.label ?? selectedCandidate.street, context.typography.labelLarge),
      Text(fullAddressDetail, context.typography.bodySmall, context.colors.textSecondary),
      SizedBox(height: space.md),
      AppButton.primary(
        label: "Konfirmasi",
        isFullWidth: true,
        onPressed: () {
          cubit.confirmAddress();
          Navigator.pop(context, state.selectedCandidate);
        },
      ),
    ),
  ),
)
```

Button disabled jika alamat belum valid (lat/lng null).

---

### Component 6: Discovery Screen Integration

---

#### [MODIFY] `discovery_screen.dart`
**Path**: `apps/customer/lib/features/discovery/presentation/screens/discovery_screen.dart`

Perubahan:
1. Tambah `BlocProvider` untuk `LocationPickerCubit` di atas `DiscoveryCubit` (atau `MultiBlocProvider`)
2. Tambah `BlocListener<LocationPickerCubit, LocationPickerState>` — saat `confirmAddress` sukses (address berubah), trigger `discoveryCubit.loadRecommendations(latitude:, longitude:)` dengan koordinat baru
3. Update init logic: jika ada active address tersimpan, gunakan koordinatnya. Jika tidak, fallback ke GPS via `LocationService` (behavior existing)
4. Pass `LocationPickerCubit` ke header widget

---

#### [MODIFY] `discovery_cubit.dart`
**Path**: `apps/customer/lib/features/discovery/presentation/bloc/discovery_cubit.dart`

Perubahan minimal — method `loadRecommendations()` sudah menerima `latitude` dan `longitude`. Hanya perlu dipastikan bisa dipanggil ulang saat alamat berubah (refresh). Kemungkinan tidak perlu perubahan jika method sudah idempotent.

---

### Component 7: Provider & DI Wiring

---

#### [MODIFY] `discovery_provider.dart`
**Path**: `apps/customer/lib/features/discovery/presentation/providers/discovery_provider.dart`

Tidak perlu diubah. `LocationPickerProvider` akan jadi file terpisah.

---

#### [NEW] `location_picker_provider.dart` (sudah disebut di Component 3)
**Path**: `apps/customer/lib/features/discovery/presentation/providers/location_picker_provider.dart`

Wiring:
```
createCubit()
  → createRecentAddressLocalDatasource()
  → createRecentAddressRepository(datasource)
  → createGetAllUsecase(recentRepo)
  → createSaveUsecase(recentRepo)
  → LocationPickerCubit(
      getRecentAddressesUsecase: ...,
      saveRecentAddressUsecase: ...,
      locationService: LocationService(),
      placesService: PlacesService(),
    )
```

Customer addresses (favorites) bisa diambil via existing cubit yang sudah ada di widget tree, atau pass use case tambahan.

---

## Struktur File Akhir (Summary Perubahan)

```
apps/customer/lib/features/discovery/
├── data/
│   ├── datasources/
│   │   ├── discovery_remote_datasource.dart      (unchanged)
│   │   └── recent_address_local_datasource.dart   [NEW]
│   └── repositories/
│       ├── discovery_repository_impl.dart         (unchanged)
│       └── recent_address_repository_impl.dart    [NEW]
├── domain/
│   ├── entities/                                  (unchanged, reuse CustomerAddress)
│   ├── repositories/
│   │   ├── discovery_repository.dart              (unchanged)
│   │   └── recent_address_repository.dart         [NEW]
│   └── usecases/
│       ├── search_services_usecase.dart            (unchanged)
│       ├── get_recommended_services_usecase.dart   (unchanged)
│       ├── get_top_outlets_usecase.dart            (unchanged)
│       └── recent_address/
│           ├── get_all_usecase.dart                [NEW]
│           └── save_usecase.dart                   [NEW]
├── presentation/
│   ├── bloc/
│   │   ├── discovery_cubit.dart                   [MODIFY — minor]
│   │   ├── discovery_state.dart                   (unchanged)
│   │   ├── location_picker_cubit.dart             [NEW]
│   │   └── location_picker_state.dart             [NEW]
│   ├── providers/
│   │   ├── discovery_provider.dart                (unchanged)
│   │   └── location_picker_provider.dart          [NEW]
│   ├── screens/
│   │   └── discovery_screen.dart                  [MODIFY]
│   └── widgets/
│       ├── discovery_sticky_search_header_widget.dart  [MODIFY]
│       ├── discovery_location_header_widget.dart       [NEW]
│       ├── discovery_back_button_widget.dart           [NEW]
│       ├── discovery_address_selector_widget.dart      [NEW]
│       ├── discovery_address_history_button_widget.dart[NEW]
│       ├── location_picker/
│       │   ├── location_picker_bottom_sheet_widget.dart    [NEW]
│       │   ├── location_picker_search_input_widget.dart   [NEW]
│       │   ├── location_picker_quick_actions_widget.dart   [NEW]
│       │   ├── location_picker_action_tile_widget.dart    [NEW]
│       │   ├── location_picker_search_results_widget.dart [NEW]
│       │   ├── location_picker_favorite_addresses_widget.dart [NEW]
│       │   ├── location_picker_recent_addresses_widget.dart   [NEW]
│       │   ├── location_picker_address_item_widget.dart   [NEW]
│       │   └── location_picker_confirm_button_widget.dart [NEW]
│       └── ... (28 existing widget files unchanged)
```

**Total: 17 file baru, 3 file dimodifikasi**

---

## Verification Plan

### Automated Tests

```bash
# Analyze untuk memastikan tidak ada error
flutter analyze

# Run existing tests untuk memastikan tidak ada regresi
flutter test
```

### Manual Verification

1. **Header Display**:
   - Buka Discovery screen → header memiliki 2 baris: location row (atas) + search row (bawah)
   - Address selector menampilkan alamat aktif atau "Alamat belum dipilih"
   - Alamat panjang di-truncate dengan ellipsis
   - Address selector terlihat clickable (icon location + chevron down)
   - Back button, sort button, refresh button tetap berfungsi

2. **Bottom Sheet**:
   - Tap address selector → bottom sheet muncul dengan `AppBottomSheet`
   - Bottom sheet menampilkan: search input, quick actions (current location, map), alamat favorit, alamat terakhir
   - Scroll works jika list panjang
   - Menutup tanpa konfirmasi → alamat tidak berubah

3. **Search**:
   - Ketik keyword → debounce 500ms → hasil muncul via `PlacesService`
   - Pilih hasil → candidate terpilih, confirm button muncul
   - Tap konfirmasi → alamat berubah, bottom sheet tutup, discovery refresh
   - Search kosong → empty state

4. **Current Location**:
   - Tap "Gunakan lokasimu saat ini" → `LocationService` + reverse geocode
   - Permission flow berjalan sesuai
   - Error handling jika permission ditolak atau GPS gagal

5. **Map Picker**:
   - Tap "Pilih lewat peta" → `MapPickerBottomSheet` existing terbuka
   - Pilih lokasi → kembali → selected candidate di-set
   - Back dari map picker → bottom sheet tetap terbuka

6. **Favorite & Recent**:
   - Alamat favorit (saved addresses) tampil jika ada data
   - Alamat terakhir tampil jika ada data (max 5)
   - Section kosong di-hide
   - Tap alamat → select candidate → konfirmasi

7. **Discovery Refresh**:
   - Setelah konfirmasi alamat baru → header update → discovery content refresh dengan lat/lng baru
   - Services dan outlets tampil sesuai lokasi baru
