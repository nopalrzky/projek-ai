# Plan: Fitur Buka/Tutup Outlet (Operational Hours)

Tanggal: 2026-05-29

---

> [!IMPORTANT]
> **Instruksi untuk AI Model sebelum mengerjakan plan ini:**
> - Baca standarisasi spec di `docs/spec/` sebelum membuat kode.
> - Gunakan shared UI widgets dari `wash_wallet_ui` (AppBadge, AppCard, AppButton, AppListTile, dll).
> - Gunakan `context.colors`, `context.typography`, `context.space`, `context.radius` — jangan hardcode warna.
> - Pecah UI menjadi widget terpisah di folder `widgets/`.
> - Jangan ada comment di kode. Clean code.
> - Kode yang pendek dan fokus per file.

---

## Konteks & Discovery

### Kondisi Saat Ini

**Backend:**
- `OperationalDay` model (`app/Models/OperationalDay.php`) menyimpan satu `open_time` dan satu `close_time` per hari.
- Model sudah punya `isCurrentlyOpen()`, `getNextOpenDay()`, `getTodayOperationalDay()` di `Outlet.php`, tetapi tidak timezone-aware dan tidak mendukung multiple time ranges per hari.
- `OutletResource.php` sudah mengirim `isCurrentlyOpen`, `todaySchedule`, `nextOpenDay`, tetapi tidak ada `operationalStatus`, `canCreateOrderNow`, `orderDisabledReason`, `weeklyHours`, `nextOpenAt`.
- `OperationalDayResource.php` sudah mengirim `dayOfWeek`, `isOpen`, `openTime`, `closeTime`, `dayLabel`, `isCurrentlyOpen`.

**Frontend (customer app):**
- `Outlet` entity sudah punya `isCurrentlyOpen`, `todaySchedule`, `nextOpenDay`, `operationalDays`.
- `OperationalDay` entity hanya punya satu `openTime` dan `closeTime` — belum mendukung multiple time ranges.
- `OutletCard` menampilkan badge `Buka` / `Tutup` berdasarkan `outlet.isActive` (bukan `isCurrentlyOpen`).
- `OutletBannerHeader` menggunakan `outlet.isActive` untuk badge juga.
- Tidak ada widget yang menampilkan `operationalStatusLabel`, `operationalStatusMessage`, `canCreateOrderNow`, atau `orderDisabledReason`.
- `ShowOutletScreen` tidak memblokir tombol order saat outlet tutup.

### Gap yang Harus Diisi

1. Backend perlu `OperationalStatusService` yang menghitung status dengan timezone-aware dan mendukung multiple time ranges.
2. Backend perlu migration untuk tambah kolom `timezone` di tabel `outlets`.
3. `OutletResource` perlu tambah field: `operationalStatus`, `operationalStatusLabel`, `operationalStatusMessage`, `todayHours`, `weeklyHours`, `nextOpenAt`, `nextCloseAt`, `canCreateOrderNow`, `orderDisabledReason`.
4. Domain model perlu ditambah field-field baru: `OutletOperationalStatus` value object baru di `wash_wallet_domain`.
5. `OutletModel` dan `Outlet` entity perlu field baru.
6. UI widget baru: `OutletStatusBadgeWidget`, `OutletOperationalInfoWidget`, `OutletWeeklyHoursWidget`, `OutletOrderButtonWidget`.
7. `OutletCard` dan `OutletBannerHeader` perlu update untuk pakai `operationalStatusLabel` dan `operationalStatusMessage`.
8. `ShowOutletScreen` perlu replace tombol order dengan `OutletOrderButtonWidget`.

---

## Scope Perubahan

### Backend: `webapp/wash_wallet_be`

#### 1. Migration: Tambah `timezone` ke tabel `outlets`

**File:** `database/migrations/xxxx_add_timezone_to_outlets_table.php`

Tambah kolom:
- `timezone` (string, default `'Asia/Jakarta'`)

#### 2. Update `Outlet` Model

**File:** `app/Models/Outlet.php`

- Tambah `timezone` ke `$fillable`.
- Update method `isCurrentlyOpen()` agar timezone-aware menggunakan `now()->setTimezone($this->timezone)`.
- Update method `getTodayOperationalDay()` agar timezone-aware.
- Update method `getNextOpenDay()` agar timezone-aware.

#### 3. Buat `OperationalStatusService`

**File:** `app/Services/OperationalStatusService.php`

Method utama:
```
public function resolve(Outlet $outlet): array
```

Menghitung dan mengembalikan:
```php
[
    'timezone'                 => string,
    'isOpenNow'                => bool,
    'operationalStatus'        => 'open' | 'closed' | 'temporary_closed' | 'closed_today' | 'hours_not_set',
    'operationalStatusLabel'   => string,   // e.g. 'Buka', 'Tutup sementara'
    'operationalStatusMessage' => string,   // e.g. 'Buka sampai 20:00', 'Buka lagi hari ini 13:00'
    'todayHours'               => [],       // array of {open, close} ranges
    'weeklyHours'              => [],       // array of {day, dayLabel, isClosed, timeRanges[]}
    'nextOpenAt'               => string|null,   // ISO datetime
    'nextCloseAt'              => string|null,   // ISO datetime
    'canCreateOrderNow'        => bool,
    'orderDisabledReason'      => string|null,
]
```

Logic:
- Jika `operationalDays` kosong → status `hours_not_set`.
- Ambil `dayOfWeek` sekarang berdasarkan `$outlet->timezone`.
- Cari entry hari ini. Jika `is_open = false` → status `closed_today`, cari next open.
- Jika `is_open = true`, cek apakah now masuk dalam salah satu time range.
  - Jika iya → `open`, hitung `nextCloseAt` dari end of current range.
  - Jika tidak, tapi ada range berikutnya hari ini → `temporary_closed`, hitung `nextOpenAt`.
  - Jika tidak dan tidak ada range lagi hari ini → `closed`, cari next open day/time.
- Support jam melewati tengah malam: close_time < open_time → tambah 1 hari ke close_time saat compare.
- `canCreateOrderNow` = `isOpenNow`.
- `orderDisabledReason` diisi sesuai status jika `!canCreateOrderNow`.

> **Catatan:** Untuk MVP, `OperationalDay` masih satu time range per hari. Multiple time ranges per hari akan memerlukan schema change (tabel `operational_day_time_ranges`). Plan ini mempersiapkan **data contract** yang mendukung multiple time ranges di response, tetapi implementasi multiple time ranges di DB adalah **out of scope MVP** dan dapat dikerjakan sebagai phase 2.

#### 4. Update `OutletResource`

**File:** `app/Http/Resources/Outlet/OutletResource.php`

Tambah field dari `OperationalStatusService`:
```php
'operationalStatus'        => $status['operationalStatus'],
'operationalStatusLabel'   => $status['operationalStatusLabel'],
'operationalStatusMessage' => $status['operationalStatusMessage'],
'todayHours'               => $status['todayHours'],
'weeklyHours'              => $status['weeklyHours'],
'nextOpenAt'               => $status['nextOpenAt'],
'nextCloseAt'              => $status['nextCloseAt'],
'canCreateOrderNow'        => $status['canCreateOrderNow'],
'orderDisabledReason'      => $status['orderDisabledReason'],
'timezone'                 => $status['timezone'],
```

Inject `OperationalStatusService` via constructor atau resolve dari service container.

#### 5. Validasi Order: `OrderService` atau `StoreCustomerOrderRequest`

**File:** `app/Services/OrderService.php`

Saat `storeCustomerOrder()`, sebelum membuat order:
- Load `outlet->operationalDays`.
- Panggil `OperationalStatusService::resolve($outlet)`.
- Jika `canCreateOrderNow = false` → throw `ValidationException` dengan pesan yang sesuai.

---

### Domain Package: `packages/wash_wallet_domain`

#### 6. Tambah Entity `OutletOperationalStatus`

**File:** `lib/src/entities/outlet_operational_status.dart`

```dart
class OutletOperationalStatus extends Equatable {
  final bool isOpenNow;
  final String operationalStatus;
  final String operationalStatusLabel;
  final String operationalStatusMessage;
  final List<TimeRange> todayHours;
  final List<WeeklyHours> weeklyHours;
  final String? nextOpenAt;
  final String? nextCloseAt;
  final bool canCreateOrderNow;
  final String? orderDisabledReason;
  final String timezone;
  ...
}
```

**File:** `lib/src/entities/time_range.dart`
```dart
class TimeRange extends Equatable {
  final String open;
  final String close;
  ...
}
```

**File:** `lib/src/entities/weekly_hours.dart`
```dart
class WeeklyHours extends Equatable {
  final String day;
  final String dayLabel;
  final bool isClosed;
  final List<TimeRange> timeRanges;
  ...
}
```

#### 7. Tambah Model untuk Entities Baru

**File:** `lib/src/models/outlet_operational_status_model.dart` (dengan freezed)
**File:** `lib/src/models/time_range_model.dart` (dengan freezed)
**File:** `lib/src/models/weekly_hours_model.dart` (dengan freezed)

#### 8. Update `Outlet` Entity & `OutletModel`

**File:** `lib/src/entities/outlet.dart`

Tambah field:
```dart
final OutletOperationalStatus? operationalStatus;
```

**File:** `lib/src/models/outlet_model.dart`

Tambah field dan normalisasi JSON untuk semua field operational status baru (`operationalStatus`, `canCreateOrderNow`, `orderDisabledReason`, `nextOpenAt`, `nextCloseAt`, `todayHours`, `weeklyHours`, `timezone`).

---

### Customer App: `apps/customer`

#### 9. Widget: `OutletStatusBadgeWidget`

**File:** `lib/features/outlet/presentation/widgets/outlet_status_badge_widget.dart`

- Menerima `operationalStatus` string dan `operationalStatusLabel` string.
- Mengembalikan `AppBadge` dengan warna sesuai:
  - `open` → `AppBadge.success`
  - `temporary_closed` → `AppBadge.warning`
  - `closed`, `closed_today` → `AppBadge.neutral`
  - `hours_not_set` → `AppBadge.neutral`

#### 10. Widget: `OutletOperationalInfoWidget`

**File:** `lib/features/outlet/presentation/widgets/outlet_operational_info_widget.dart`

- Menerima `operationalStatusMessage` string (nullable).
- Menampilkan baris kecil berisi ikon jam + pesan status, misalnya `Buka sampai 20:00` atau `Buka lagi hari ini 13:00`.
- Dipakai di `OutletCard` dan `OutletBannerHeader`.

#### 11. Widget: `OutletWeeklyHoursWidget`

**File:** `lib/features/outlet/presentation/widgets/outlet_weekly_hours_widget.dart`

- Menerima `List<WeeklyHours> weeklyHours`.
- Menampilkan tabel jam operasional mingguan, satu baris per hari.
- Jika `isClosed = true`, tampilkan `Tutup` dengan `context.colors.error`.
- Jika ada multiple `timeRanges`, tampilkan semua range dalam kolom kanan.
- Dipakai di `OutletInfoScreen` (ganti implementasi inline yang ada).

#### 12. Widget: `OutletOrderButtonWidget`

**File:** `lib/features/outlet/presentation/widgets/outlet_order_button_widget.dart`

- Menerima `Outlet outlet`, `VoidCallback? onPressed`.
- Jika `outlet.operationalStatus?.canCreateOrderNow == true` → tombol `AppButton.primary` aktif.
- Jika tidak, tombol disabled dengan label sesuai status:
  - `closed` → `Outlet Sedang Tutup`
  - `temporary_closed` → `Tutup Sementara`
  - `hours_not_set` → `Order Belum Tersedia`
  - `closed_today` → `Outlet Sedang Tutup`
- Jika `orderDisabledReason` tidak null, tampilkan pesan di bawah tombol menggunakan `context.typography.labelSmall` + `context.colors.textSecondary`.

#### 13. Update `OutletCard`

**File:** `lib/features/outlet/presentation/widgets/outlet_card.dart`

- Ganti badge `isActive` dengan `OutletStatusBadgeWidget`.
- Tambah `OutletOperationalInfoWidget` di bawah nama outlet.

#### 14. Update `OutletBannerHeader`

**File:** `lib/features/outlet/presentation/widgets/outlet_banner_header.dart`

- Ganti badge `isActive` dengan `OutletStatusBadgeWidget`.
- Tambah `OutletOperationalInfoWidget`.

#### 15. Update `ShowOutletScreen`

**File:** `lib/features/outlet/presentation/screens/show_outlet_screen.dart`

- Tambah `OutletOrderButtonWidget` di area bawah, menggantikan atau melengkapi tombol order yang ada.
- Pastikan `onPressed` diteruskan ke logika pembuatan order yang sudah ada.

#### 16. Update `OutletInfoScreen`

**File:** `lib/features/outlet/presentation/screens/outlet_info_screen.dart`

- Ganti implementasi jam operasional inline (`_buildOutletDetails`) dengan `OutletWeeklyHoursWidget`.
- Tampilkan `OutletStatusBadgeWidget` dan `OutletOperationalInfoWidget` di bagian atas detail outlet.

---

## Urutan Pengerjaan

```
Phase 1 — Backend
  1. Migration: tambah `timezone` ke `outlets`
  2. Update Outlet model (timezone-aware methods)
  3. Buat OperationalStatusService
  4. Update OutletResource (inject status fields)
  5. Update OrderService (validasi canCreateOrderNow)

Phase 2 — Domain Package
  6. Buat entity TimeRange, WeeklyHours, OutletOperationalStatus
  7. Buat model TimeRangeModel, WeeklyHoursModel, OutletOperationalStatusModel
  8. Update Outlet entity & OutletModel (tambah field operationalStatus)
  9. Jalankan build_runner untuk regenerate freezed/json

Phase 3 — Customer App UI
  10. Buat OutletStatusBadgeWidget
  11. Buat OutletOperationalInfoWidget
  12. Buat OutletWeeklyHoursWidget
  13. Buat OutletOrderButtonWidget
  14. Update OutletCard
  15. Update OutletBannerHeader
  16. Update ShowOutletScreen
  17. Update OutletInfoScreen
```

---

## Catatan Penting

- **Timezone**: Gunakan `Carbon::now($outlet->timezone)` di backend. Default `Asia/Jakarta`.
- **Multiple time ranges**: Response contract sudah mendukung array `timeRanges` dan `todayHours`, tetapi DB tetap satu range per hari untuk MVP.
- **canCreateOrderNow**: Field ini yang menjadi penjaga di backend (validasi saat store order) dan di frontend (disabled button).
- **Frontend tidak hitung status**: Frontend hanya render berdasarkan field yang dikirim backend.
- **Tidak ada comment** di kode yang dihasilkan.
- **Selalu gunakan theme**: `context.colors`, `context.typography`, `context.space`, `context.radius`.
