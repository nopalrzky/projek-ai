# Implementasi Fitur Jadwal Kurir (Courier Schedule Feature)

## Latar Belakang

Saat ini, sistem sudah memiliki kerangka dasar berupa:
- **Migration**: `courier_settings` dan `courier_schedules` sudah ada
- **Model**: `CourierSchedule` sudah ada (namun masih minimal — belum ada `type`, `trial_duration_days`, dll)
- **Resource**: `CourierScheduleResource` sudah ada
- **UI Index**: `CourierSchedules/Index.tsx` sudah ada (menampilkan tabel sederhana)
- **Outlet**: relasi `courierSchedules()` sudah ada di `Outlet` model

Namun alur fitur belum lengkap:
- Fitur kurir belum terintegrasi dengan sistem **Feature/OutletFeature** (unlock gratis)
- `CourierSchedule` belum punya kolom **tipe sesi** (`pickup` atau `delivery`)
- Tidak ada **seeder** untuk Feature `courier`
- Tidak ada **controller** khusus untuk mengelola jadwal
- Tidak ada halaman **Create/Edit** untuk jadwal kurir

---

## Kondisi Saat Ini

### Yang Sudah Ada
| Komponen | Status | Catatan |
|---|---|---|
| Migration `courier_schedules` | ✅ Ada | Kolom: `outlet_id`, `day_of_week`, `start_time`, `end_time`, `is_active` |
| Migration `courier_settings` | ✅ Ada | Kolom: `outlet_id`, `pickup_fee`, `delivery_fee` |
| `CourierSchedule` Model | ✅ Ada | Minimal — perlu tambah scope, helper, dan kolom `type` |
| `CourierScheduleResource` | ✅ Ada | Sudah standar camelCase |
| `CourierSchedules/Index.tsx` | ✅ Ada | Tabel dasar, tombol Tambah/Edit belum fungsional |
| `Outlet.courierSchedules()` relasi | ✅ Ada | Sudah terhubung |
| Feature seeder `courier` | ❌ Belum ada | Perlu dibuat agar fitur muncul di catalog |
| `CourierScheduleController` | ❌ Belum ada | Perlu dibuat |
| Halaman Create/Edit jadwal | ❌ Belum ada | Perlu dibuat |
| Unlock flow di UI | ❌ Belum ada | Index harus tampilkan state locked/unlocked |
| `CourierScheduleService` | ❌ Belum ada | Opsional, bisa langsung di `OutletService` |

---

## Perubahan yang Direncanakan

> [!IMPORTANT]
> **Untuk AI yang mengerjakan**: Sebelum menulis kode apapun, **baca terlebih dahulu** file-file referensi berikut:
> - `docs/spec/model_spec.md` — standar model Eloquent
> - `docs/spec/api_resource_spec.md` — standar Resource (camelCase, null-safety, `whenLoaded`)
> - `docs/spec/controller_spec.md` — standar controller (constructor injection, error handling, logging)
> - `docs/spec/service_spec.md` — standar service
> - Contoh controller yang sudah ada: `OutletController.php`, `OutletFeatureController.php`
> - Contoh service: `OutletFeatureService.php`, `OutletService.php`
> - Contoh UI page: `Outlets/Categories/Index.tsx`, `Outlets/Customers/Create.tsx`

---

### Phase 1 — Database & Backend Model

#### [MODIFY] `CourierSchedule` Model
- Tambah kolom `type` → nilai: `pickup` atau `delivery`
- Tambah section header sesuai `model_spec.md`
- Tambah scope `byType()`, `scopePickup()`, `scopeDelivery()`
- Tambah helper `getTypeLabel(): string`
- Tambah `$table`, `$casts` sesuai standar (timestamp casts)

#### [NEW] Migration — Tambah Kolom `type` ke `courier_schedules`
```
database/migrations/YYYY_MM_DD_HHMMSS_add_type_to_courier_schedules_table.php
```
- Kolom: `type` enum(`pickup`, `delivery`), default `pickup`
- Tambahkan index pada `[outlet_id, day_of_week, type]`

#### [NEW] Seeder — Feature `courier_schedule`
```
database/seeders/CourierFeatureSeeder.php
```
- Insert ke tabel `features`:
  - `key`: `courier_schedule`
  - `name`: `Layanan Antar-Jemput`
  - `coin_price`: `0`
  - `is_paid`: `false`
  - `is_active`: `true`
  - `duration_days`: `0` (selamanya)
- Tambahkan ke `DatabaseSeeder`

---

### Phase 2 — Service Layer

#### [MODIFY] `OutletService`
Tambah metode (sesuai pola `storeCustomer`, `storeOutletFeature`, dll):
- `getCourierSchedules(int $outletId): Collection`
- `storeCourierSchedule(int $outletId, array $data): CourierSchedule`
- `updateCourierSchedule(int $outletId, int $scheduleId, array $data): CourierSchedule`
- `destroyCourierSchedule(int $outletId, int $scheduleId): bool`
- `activateCourierFeature(int $outletId): OutletFeature` — unlock fitur gratis (is_paid=false)

Atau alternatif: buat **`CourierScheduleService`** terpisah (lebih clean jika jadwal berkembang kompleks).

#### [MODIFY] `OutletFeatureService`
- Tambah metode `unlockFreeFeature(int $outletId, string $featureKey): OutletFeature`
  - Digunakan untuk fitur gratis (`is_paid = false`) — tidak perlu potong koin

---

### Phase 3 — Controller

#### [MODIFY] `OutletController`
Tambah metode untuk manajemen jadwal kurir (ikut pola nama method yang sudah ada seperti `createCustomer`, `storeCustomer`):
- `createCourierSchedule(int $outletId): Response|RedirectResponse`
- `storeCourierSchedule(int $outletId, Request $request): RedirectResponse`
- `editCourierSchedule(int $outletId, int $scheduleId): Response|RedirectResponse`
- `updateCourierSchedule(int $outletId, int $scheduleId, Request $request): RedirectResponse`
- `destroyCourierSchedule(int $outletId, int $scheduleId): RedirectResponse`
- `activateCourierFeature(int $outletId): RedirectResponse` — aksi unlock gratis

> [!NOTE]
> Semua method harus mengikuti pola dari `controller_spec.md`: try/catch, Log::error di catch, redirect ke route yang sesuai.

#### [MODIFY] `routes/web.php`
Tambah rute di bawah blok `outlets.{outletId}`:
```php
Route::prefix('/courier-schedules')->name('courier-schedules.')->group(function () {
    Route::get('/create', 'createCourierSchedule')->name('create');
    Route::post('/', 'storeCourierSchedule')->name('store');
    Route::get('/{scheduleId}/edit', 'editCourierSchedule')->name('edit');
    Route::put('/{scheduleId}', 'updateCourierSchedule')->name('update');
    Route::delete('/{scheduleId}', 'destroyCourierSchedule')->name('destroy');
});
Route::post('/activate-courier', 'activateCourierFeature')->name('activate-courier');
```

#### [MODIFY] `CourierScheduleResource`
- Tambah field `type` dan `typeLabel`
- Indentasi disesuaikan ke 4 spasi sesuai standar

---

### Phase 4 — Frontend (TypeScript + React)

#### [MODIFY] `types/courier_schedule.ts`
Tambah field `type: 'pickup' | 'delivery'` dan `typeLabel: string`.

#### [MODIFY] `CourierSchedules/Index.tsx`
Redesain menjadi tampilan per-hari dengan grouping. **Pendekatan UI yang diusulkan**:

Tampilan berbentuk **kartu per hari** (bukan tabel flat) — lebih intuitif karena jadwal terikat hari dan tipe:
- Header: nama hari (Senin, Selasa, dll.)
- Dua section per hari: **Sesi Ambil** (pickup) dan **Sesi Antar** (delivery)
- Per sesi: tampilkan slot waktu (start_time – end_time) + badge isActive
- Tombol tambah slot per tipe per hari

Tambah **state locked/unlocked** — jika fitur `courier_schedule` belum diaktifkan, tampilkan overlay/banner "Aktifkan Fitur" dengan tombol gratis.

#### [NEW] `CourierSchedules/Create.tsx`
Form tambah jadwal baru:
- Pilih hari (`day_of_week`) — dropdown atau pilihan hari (Sun–Sat)
- Pilih tipe: **Ambil (pickup)** atau **Antar (delivery)**
- Input jam mulai (`start_time`) dan jam selesai (`end_time`)
- Toggle aktif/nonaktif
- Ikuti pola dari `Customers/Create.tsx` dan `OutletFeatures/Create.tsx`

#### [NEW] `CourierSchedules/Edit.tsx`
Form edit jadwal — serupa dengan Create, namun pre-filled dengan data existing.

#### [NEW] `CourierSchedules/types.ts`
Interface props:
```typescript
CourierScheduleIndexProps
CourierScheduleCreateProps  // { outlet, existingDays }
CourierScheduleEditProps    // { outlet, schedule }
```

#### [MODIFY] `OutletFeatures/Index.tsx`
- Ketika tabel fitur menampilkan fitur `courier_schedule`, tampilkan tombol **"Aktifkan"** dengan label *gratis* / badge `GRATIS`
- Klik → POST ke `outlets.activate-courier` (langsung tanpa pilih coin type)

#### [MODIFY] `Services/outlet.service.ts`
Tambah metode:
- `goToCreateCourierSchedule(outletId: number)`
- `goToEditCourierSchedule(outletId: number, scheduleId: number)`
- `destroyCourierSchedule(outletId: number, scheduleId: number)`
- `activateCourierFeature(outletId: number)`

---

## Open Questions ✅ Semua Terjawab

Berdasarkan klarifikasi user:
- **Satu hari = banyak slot** per tipe. Contoh: Senin bisa punya pickup jam 08–10, 12–14, 16–18 DAN delivery jam 09–11, 13–15.
- **Tipe selalu terpisah**: `pickup` atau `delivery` — satu slot tidak bisa sekaligus keduanya.
- **Auto-generate 7 hari saat aktivasi**: Ketika fitur courier diaktifkan (gratis), sistem langsung **auto-create 7 record** `courier_schedule` (satu per hari, Senin–Minggu) namun **tanpa slot** — hanya sebagai placeholder hari. Slot (waktu) ditambahkan manual oleh user.
  - *Alternatif yang lebih tepat*: Alih-alih membuat record kosong, auto-generate bisa diwujudkan dengan tampilan UI yang sudah menampilkan 7 kartu hari secara statis — user tinggal klik "+" untuk tambah slot di hari tersebut. Tidak perlu record DB kosong.
  - **Pilihan ini lebih bersih**: Tidak ada record kosong di DB, setiap row di `courier_schedules` pasti adalah slot waktu yang valid.

> [!IMPORTANT]
> **Keputusan arsitektur**: Satu baris di tabel `courier_schedules` = **satu slot waktu** (`start_time`–`end_time`) untuk hari dan tipe tertentu. UI menampilkan 7 hari secara statis, bukan dari DB.


---

## Rencana Verifikasi

### Backend
```bash
php artisan route:list | findstr courier
php artisan db:seed --class=CourierFeatureSeeder
```

### Frontend
- Akses tab **Jadwal Kurir** di halaman detail outlet
- Coba klik **Aktifkan** pada fitur `Layanan Antar-Jemput` di tab Fitur
- Coba tambah jadwal baru (Create form)
- Edit dan hapus jadwal yang ada
- Verifikasi tampilan per-hari dan per-tipe di Index

---

## Urutan Implementasi yang Disarankan

1. Migration baru (tambah `type` ke `courier_schedules`)
2. Update `CourierSchedule` model (section headers, scopes `byType/scopePickup/scopeDelivery`, helper `getTypeLabel`, `$table`, full `$casts`)
3. Seeder feature `courier_schedule` (gratis, `is_paid = false`, `coin_price = 0`)
4. Update `OutletFeatureService` — tambah `unlockFreeFeature(int $outletId, string $featureKey)`
5. Update `OutletService` — tambah metode CRUD courier schedule + `activateCourierFeature`
6. Update `OutletController` — tambah semua method courier (create/store/edit/update/destroy + activate)
7. Update `routes/web.php` — rute courier-schedules + activate-courier
8. Update `CourierScheduleResource` — tambah `type`, `typeLabel`, benahi indentasi 4 spasi
9. Update TypeScript `types/courier_schedule.ts` — tambah `type`, `typeLabel`
10. Redesain `CourierSchedules/Index.tsx` — layout kartu per-hari, 2 section (Pickup/Delivery) per kartu, state locked/unlocked, tombol `+` per tipe per hari
11. Buat `CourierSchedules/Create.tsx` — form tambah slot (pilih hari, tipe, jam)
12. Buat `CourierSchedules/Edit.tsx` — form edit slot (pre-filled)
13. Buat `CourierSchedules/types.ts` — interface props
14. Update `OutletFeatures/Index.tsx` — badge `GRATIS` untuk fitur `courier_schedule`, alur aktivasi tanpa pilih coin
15. Update `Services/outlet.service.ts` — tambah helper navigasi & action courier

---

## UI/UX Design — Courier Schedule Index

### State 1: Fitur Belum Diaktifkan (Locked)
```
┌─────────────────────────────────────────────┐
│ 🚚 Jadwal Kurir                             │
│ ─────────────────────────────────────────── │
│   ⚠️  Fitur Layanan Antar-Jemput             │
│      belum diaktifkan                       │
│                                             │
│      [✨ Aktifkan Gratis]                    │
└─────────────────────────────────────────────┘
```

### State 2: Fitur Sudah Aktif — Tampilan Kartu Per Hari
```
┌───────────────────────────────────────────────────────┐
│  🚚 Jadwal Kurir          [+ Tambah Slot]             │
│                                                       │
│  ┌─ SENIN ─────────────────────────────────────────┐  │
│  │                                                  │  │
│  │  📦 AMBIL (Pickup)            [+ Tambah Sesi]   │  │
│  │  ┌──────────────┐ ┌──────────────┐              │  │
│  │  │ 08:00–10:00  │ │ 12:00–14:00  │  ...         │  │
│  │  │  ● Aktif [✏][🗑]│ ○ Nonaktif [✏][🗑]│         │  │
│  │  └──────────────┘ └──────────────┘              │  │
│  │                                                  │  │
│  │  🚐 ANTAR (Delivery)          [+ Tambah Sesi]   │  │
│  │  ┌──────────────┐                               │  │
│  │  │ 09:00–11:00  │  (kosong jika belum ada slot) │  │
│  │  │  ● Aktif [✏][🗑]│                             │  │
│  │  └──────────────┘                               │  │
│  └──────────────────────────────────────────────────┘  │
│                                                       │
│  ┌─ SELASA ───────────────────────────────────────┐   │
│  │  ...                                           │   │
│  └────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────┘
```

### Form Tambah Slot (`Create.tsx`)
- Hari (day_of_week) — Select atau sudah ter-preset dari URL query param
- Tipe — Radio/Select: Ambil (pickup) / Antar (delivery)  
- Jam Mulai (start_time) — Time input
- Jam Selesai (end_time) — Time input dengan validasi > jam mulai
- Status Aktif — Toggle switch
