# Implementation Plan: Service Courier Eligibility

Tanggal: 2026-05-29
Berdasarkan: `docs/user_need/service_courier_eligibility_user_need.md`

---

## Keputusan Teknis

| Item | Keputusan |
|---|---|
| Nama field database | `supports_courier` (boolean) |
| Default untuk data existing | `false` — owner wajib aktifkan secara eksplisit |
| Default untuk layanan baru | `false` |
| Bulk update | Endpoint `PATCH /laundry-services/bulk-courier-eligibility` di Web controller |
| Validasi order | Ditambahkan di `OrderService::store()` + method update jika delivery method berubah |
| Computed field frontend | `supportsCourier` (boolean dari resource) |

---

## Instruksi Wajib untuk AI Model

> [!IMPORTANT]
> **Baca sebelum menulis kode apapun:**
> 1. **Baca spec standarisasi** di `docs/spec/` — terutama `model_spec.md`, `service_spec.md`, `controller_spec.md`, `api_resource_spec.md`, `columns_spec.md`, `modal_spec.md`
> 2. **Baca komponen reusable** di `resources/js/Components/` sebelum menggunakannya — pastikan props yang dipakai benar
> 3. **Gunakan CSS variables** dari `app.css` untuk semua warna — gunakan `style={{ color: "var(--color-*)" }}` atau Tailwind classes yang sudah di-map ke theme (`text-text-primary`, `bg-surface`, dll.). **Jangan hardcode warna**
> 4. **Pecah ke Partials** — jangan tulis semua UI dalam satu file. Setiap section yang cukup besar harus menjadi komponen di folder `Partials/`
> 5. **Tidak ada comment** di dalam kode — tulis clean code yang self-explanatory
> 6. **Tidak ada kode panjang** dalam satu file — jika satu file melebihi ~150 baris, pertimbangkan pemecahan ke Partials

---

## Overview Perubahan

```
Backend (Laravel)
├── database/migrations/         → Tambah kolom supports_courier
├── app/Models/LaundryService.php → Tambah fillable, cast, scope baru
├── app/Http/Requests/LaundryService/
│   ├── StoreLaundryServiceRequest.php        → Tambah supportsCourier
│   ├── UpdateLaundryServiceRequest.php       → Tambah supportsCourier
│   └── BulkUpdateCourierEligibilityRequest.php → NEW
├── app/Services/LaundryServiceService.php    → Tambah method courier eligibility
├── app/Services/OrderService.php             → Tambah validasi courier eligibility
├── app/Http/Resources/LaundryService/
│   └── LaundryServiceResource.php            → Tambah supportsCourier
├── app/Http/Controllers/Web/OutletController.php → Tambah 2 method baru
└── routes/web.php               → Tambah 2 route baru

Frontend (React/Inertia)
├── resources/js/types.ts        → Update LaundryService + form data types
├── resources/js/Pages/Dashboard/Outlets/LaundryServices/
│   ├── Create.tsx               → Tambah field supportsCourier
│   ├── Edit.tsx                 → Tambah field supportsCourier
│   └── Partials/
│       └── CourierEligibilityField.tsx   → NEW
└── resources/js/Pages/Dashboard/Outlets/Courier/
    ├── Index.tsx                → Tambah CourierServicesSection
    └── Partials/
        ├── CourierServicesSection.tsx    → NEW
        ├── CourierServiceRow.tsx         → NEW
        └── ToggleCourierServiceModal.tsx → NEW
```

---

## Step 1 — Database Migration

### [CREATE] Migration file

```
database/migrations/xxxx_xx_xx_add_supports_courier_to_laundry_services_table.php
```

**Isi migration:**
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('laundry_services', function (Blueprint $table) {
            $table->boolean('supports_courier')->default(false)->after('is_active');
        });
    }

    public function down(): void
    {
        Schema::table('laundry_services', function (Blueprint $table) {
            $table->dropColumn('supports_courier');
        });
    }
};
```

---

## Step 2 — Model: LaundryService

### [MODIFY] `app/Models/LaundryService.php`

**Tambahkan ke `$fillable`:**
```php
'supports_courier',
```

**Tambahkan ke `casts()`:**
```php
'supports_courier' => 'boolean',
```

**Tambahkan scope baru setelah `scopeActive()`:**
```php
public function scopeSupportsCourier(Builder $query): Builder
{
    return $query->where('supports_courier', true);
}

public function scopeNotSupportsCourier(Builder $query): Builder
{
    return $query->where('supports_courier', false);
}
```

**Tambahkan ke `scopeSortBy()` — `$allowedColumns`:**
```php
'supportsCourier',
```

**Tambahkan ke `$columnMap` di `scopeSortBy()`:**
```php
'supportsCourier' => 'supports_courier',
```

---

## Step 3 — Form Requests

### [MODIFY] `app/Http/Requests/LaundryService/StoreLaundryServiceRequest.php`

Tambahkan ke `rules()`:
```php
'supportsCourier' => ['nullable', 'boolean'],
```

Tambahkan ke `messages()`:
```php
'supportsCourier.boolean' => 'Status layanan kurir harus berupa nilai benar atau salah.',
```

Tambahkan ke `attributes()`:
```php
'supportsCourier' => 'dukungan kurir',
```

### [MODIFY] `app/Http/Requests/LaundryService/UpdateLaundryServiceRequest.php`

Perubahan identik dengan `StoreLaundryServiceRequest`.

---

## Step 4 — Form Request Baru: Bulk Update

### [CREATE] `app/Http/Requests/LaundryService/BulkUpdateCourierEligibilityRequest.php`

```php
<?php

namespace App\Http\Requests\LaundryService;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class BulkUpdateCourierEligibilityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Auth::check();
    }

    public function rules(): array
    {
        return [
            'services'                   => ['required', 'array', 'min:1'],
            'services.*.id'              => ['required', 'integer', 'min:1', 'exists:laundry_services,id'],
            'services.*.supportsCourier' => ['required', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'services.required'                   => 'Data layanan harus disertakan.',
            'services.array'                      => 'Format data layanan tidak valid.',
            'services.min'                        => 'Minimal satu layanan harus disertakan.',
            'services.*.id.required'              => 'ID layanan harus disertakan.',
            'services.*.id.exists'                => 'Layanan tidak ditemukan.',
            'services.*.supportsCourier.required' => 'Status kurir layanan harus disertakan.',
            'services.*.supportsCourier.boolean'  => 'Status kurir layanan harus berupa nilai benar atau salah.',
        ];
    }
}
```

---

## Step 5 — Service: LaundryServiceService

### [MODIFY] `app/Services/LaundryServiceService.php`

**Tambahkan method `updateCourierEligibility()`:**
```php
public function updateCourierEligibility(int $laundryServiceId, bool $supportsCourier): LaundryService
{
    $laundryService = $this->laundryService->findOrFail($laundryServiceId);

    $laundryService->update(['supports_courier' => $supportsCourier]);

    return $laundryService->fresh();
}
```

**Tambahkan method `bulkUpdateCourierEligibility()`:**
```php
public function bulkUpdateCourierEligibility(array $services): void
{
    DB::transaction(function () use ($services) {
        foreach ($services as $item) {
            $this->laundryService
                ->where('id', $item['id'])
                ->update(['supports_courier' => $item['supportsCourier']]);
        }
    });
}
```

**Modifikasi method `store()`:**

Di bagian data yang dikirim ke model, pastikan `supports_courier` disertakan:
```php
'supports_courier' => $data['supportsCourier'] ?? false,
```

**Modifikasi method `update()`:**

Di bagian data yang dikirim ke model, pastikan `supports_courier` disertakan:
```php
'supports_courier' => $data['supportsCourier'] ?? $laundryService->supports_courier,
```

> [!NOTE]
> Baca method `store()` dan `update()` yang ada terlebih dahulu sebelum modifikasi untuk memahami struktur data yang sudah diproses.

---

## Step 6 — Service: OrderService — Validasi Courier Eligibility

### [MODIFY] `app/Services/OrderService.php`

> [!IMPORTANT]
> Baca seluruh method `store()` dan semua method yang berhubungan dengan delivery method di `OrderService` terlebih dahulu sebelum modifikasi. Kenali nama field delivery method yang digunakan (`deliveryMethod`, `delivery_method`, dll.) dan nilai enum yang berlaku (`pickup`, `delivery`, `self_pickup`, dll.).

**Tambahkan method private `validateCourierEligibility()`:**
```php
private function validateCourierEligibility(array $serviceIds): void
{
    if (empty($serviceIds)) {
        return;
    }

    $ineligibleServices = LaundryService::whereIn('id', $serviceIds)
        ->where('supports_courier', false)
        ->pluck('name')
        ->toArray();

    if (!empty($ineligibleServices)) {
        $names = implode(', ', $ineligibleServices);
        throw new \InvalidArgumentException(
            "Layanan berikut tidak mendukung kurir: {$names}. Ubah metode pengiriman atau hapus layanan tersebut dari order."
        );
    }
}
```

**Panggil `validateCourierEligibility()` di titik berikut:**
- Di `store()`: jika delivery method adalah kurir (pickup atau delivery), ambil semua `laundryServiceId` dari order items dan panggil validasi
- Di method update delivery method (jika ada): sama

---

## Step 7 — API Resource

### [MODIFY] `app/Http/Resources/LaundryService/LaundryServiceResource.php`

Tambahkan field baru setelah `isActive`:
```php
'supportsCourier' => (bool) $this->supports_courier,
```

---

## Step 8 — Controller

### [MODIFY] `app/Http/Controllers/Web/OutletController.php`

> [!IMPORTANT]
> Baca seluruh `OutletController` sebelum menambahkan method baru. Perhatikan pola constructor injection dan dependency yang sudah ada agar tidak duplikasi.

**Tambahkan import di use statements:**
```php
use App\Http\Requests\LaundryService\BulkUpdateCourierEligibilityRequest;
```

**Tambahkan method `updateLaundryServiceCourierEligibility()`:**
```php
public function updateLaundryServiceCourierEligibility(
    Request $request,
    int $outletId,
    int $laundryServiceId
): RedirectResponse {
    try {
        $this->laundryServiceService->updateCourierEligibility(
            $laundryServiceId,
            $request->boolean('supportsCourier')
        );

        return redirect()->back()
            ->with('success', 'Status kurir layanan berhasil diperbarui.');
    } catch (ModelNotFoundException $e) {
        return redirect()->back()
            ->with('error', 'Layanan tidak ditemukan.');
    } catch (Throwable $e) {
        Log::error('[OutletController] Failed to update courier eligibility', [
            'error'              => $e->getMessage(),
            'user_id'            => Auth::id(),
            'type'               => 'outlet_controller_error',
            'outlet_id'          => $outletId,
            'laundry_service_id' => $laundryServiceId,
        ]);

        return redirect()->back()
            ->with('error', 'Gagal memperbarui status kurir layanan.');
    }
}
```

**Tambahkan method `bulkUpdateLaundryServiceCourierEligibility()`:**
```php
public function bulkUpdateLaundryServiceCourierEligibility(
    BulkUpdateCourierEligibilityRequest $request,
    int $outletId
): RedirectResponse {
    try {
        $this->laundryServiceService->bulkUpdateCourierEligibility(
            $request->validated()['services']
        );

        return redirect()->back()
            ->with('success', 'Status kurir layanan berhasil diperbarui.');
    } catch (Throwable $e) {
        Log::error('[OutletController] Failed to bulk update courier eligibility', [
            'error'     => $e->getMessage(),
            'user_id'   => Auth::id(),
            'type'      => 'outlet_controller_error',
            'outlet_id' => $outletId,
        ]);

        return redirect()->back()
            ->with('error', 'Gagal memperbarui status kurir layanan.');
    }
}
```

---

## Step 9 — Routes

### [MODIFY] `routes/web.php`

Tambahkan 2 route di dalam grup `/laundry-services` outlet yang sudah ada:

```php
Route::patch('/bulk-courier-eligibility', [OutletController::class, 'bulkUpdateLaundryServiceCourierEligibility'])
    ->name('bulk-courier-eligibility');

Route::patch('/{laundryServiceId}/courier-eligibility', [OutletController::class, 'updateLaundryServiceCourierEligibility'])
    ->name('courier-eligibility')
    ->whereNumber('laundryServiceId');
```

> [!IMPORTANT]
> Route `bulk-courier-eligibility` harus dideklarasikan **sebelum** route dengan parameter `{laundryServiceId}` untuk menghindari konflik pattern matching di Laravel.

---

## Step 10 — Frontend: Types

### [MODIFY] `resources/js/types.ts`

Tambahkan `supportsCourier` ke interface `LaundryService`:
```ts
supportsCourier: boolean;
```

Tambahkan `supportsCourier` ke interface/type `OutletLaundryServiceFormData`:
```ts
supportsCourier: boolean;
```

---

## Step 11 — Frontend: Form Create & Edit Layanan

### [CREATE] `resources/js/Pages/Dashboard/Outlets/LaundryServices/Partials/CourierEligibilityField.tsx`

**Tujuan:** Field toggle reusable untuk `supportsCourier` di form Create dan Edit.

**Props:**
```ts
interface CourierEligibilityFieldProps {
    value: boolean;
    onChange: (value: boolean) => void;
    disabled?: boolean;
    error?: string;
}
```

**UI (ikuti pola field-field lain di form yang ada):**
- Container dengan icon `Truck` dari lucide-react
- Label: `"Bisa Dijemput / Diantar Kurir"`
- Deskripsi: `"Aktifkan jika layanan ini dapat diambil atau diantarkan oleh kurir outlet"`
- Toggle switch menggunakan komponen yang sudah tersedia di `@/Components/`
- Semua warna via `var(--color-*)` atau Tailwind theme classes — tidak hardcode

### [MODIFY] `resources/js/Pages/Dashboard/Outlets/LaundryServices/Create.tsx`

- Tambahkan `supportsCourier: false` ke initial data `useForm`
- Import `CourierEligibilityField` dari Partials
- Tambahkan `<CourierEligibilityField>` di dalam form, setelah field status aktif layanan

### [MODIFY] `resources/js/Pages/Dashboard/Outlets/LaundryServices/Edit.tsx`

- Tambahkan `supportsCourier: laundryService.supportsCourier ?? false` ke initial data `useForm`
- Import dan gunakan `CourierEligibilityField` yang sama

---

## Step 12 — Frontend: Tab Kurir — Daftar Layanan

### [MODIFY] `app/Http/Controllers/Web/OutletController.php` — method `show()`

Pastikan eager loading `laundryServices` beserta relasinya disertakan:
```php
'laundryServices',
'laundryServices.category',
```

> [!NOTE]
> Baca method `show()` yang ada. Jika `laundryServices` sudah di-load, tambahkan `laundryServices.category`. Jika belum, tambahkan keduanya.

### [MODIFY] `resources/js/Pages/Dashboard/Outlets/Courier/Index.tsx`

Import dan render `CourierServicesSection` setelah section-section yang sudah ada:
```tsx
import CourierServicesSection from "./Partials/CourierServicesSection";

// Di dalam render block:
<CourierServicesSection outlet={outlet} />
```

---

### [CREATE] `resources/js/Pages/Dashboard/Outlets/Courier/Partials/CourierServicesSection.tsx`

**Tujuan:** Wrapper section yang menampilkan list layanan outlet dengan status `supportsCourier`.

**Props:** `{ outlet: any }`

**UI:**
- `Card` dengan header: icon `ShoppingBag` + judul `"Layanan untuk Kurir"`
- Sub-teks: `"Atur layanan mana saja yang boleh dijemput atau diantar oleh kurir"`
- Counter: `"X dari Y layanan mendukung kurir"`
- Render `CourierServiceRow` untuk setiap layanan
- Empty state jika `outlet.laundryServices` kosong
- State management `isOpenModal`, `selectedService`, `isLoading` dikelola di sini
- Render `ToggleCourierServiceModal` di sini

---

### [CREATE] `resources/js/Pages/Dashboard/Outlets/Courier/Partials/CourierServiceRow.tsx`

**Tujuan:** Satu baris layanan di dalam list kurir section.

**Props:**
```ts
interface CourierServiceRowProps {
    service: LaundryService;
    onToggle: (service: LaundryService) => void;
}
```

**UI:**
- Layout: `flex items-center justify-between gap-4 py-3`
- Border bottom dengan `var(--color-border)`
- Kiri: nama layanan (`var(--color-text-primary)`) + badge kategori + badge status aktif layanan
- Kanan: Badge atau indikator `supportsCourier` + tombol toggle
- Warna badge `supportsCourier`: `success` jika aktif, `secondary` jika nonaktif
- Label badge: `"Kurir Aktif"` / `"Tidak untuk Kurir"`

---

### [CREATE] `resources/js/Pages/Dashboard/Outlets/Courier/Partials/ToggleCourierServiceModal.tsx`

**Tujuan:** Modal konfirmasi toggle `supportsCourier` per layanan.

**Props (sesuai `modal_spec.md`):**
```ts
interface ToggleCourierServiceModalProps {
    isOpen: boolean;
    service?: LaundryService;
    onClose: () => void;
    onConfirm: (service: LaundryService) => void;
    isLoading?: boolean;
}
```

**Aturan wajib sesuai `modal_spec.md`:**
- `if (!service) return null;` di awal komponen
- Gunakan `<Modal>` dari `@/Components/Modal`
- `variant`: `"success"` jika mengaktifkan kurir, `"warning"` jika menonaktifkan kurir
- `preventClose={isLoading}`
- `closeOnOverlayClick={!isLoading}`
- `closeOnEscape={!isLoading}`
- Alert sesuai arah toggle
- Preview data service (nama + kategori + status aktif)
- Footer: Batal (kiri) + Konfirmasi (kanan)
- Label tombol: `"Aktifkan Kurir"` atau `"Nonaktifkan Kurir"`
- Label loading: `"Memproses..."`

**Submit via `router.patch()`** menggunakan route:
```
outlets.laundry-services.courier-eligibility
```

Parameter: `{ outletId, laundryServiceId }`, body: `{ supportsCourier: !service.supportsCourier }`

---

## Step 13 — Outlet Show: Tambah laundryServices ke Context

### [MODIFY] `resources/js/Pages/Dashboard/Outlets/Courier/types.ts`

Pastikan tipe `outlet` yang dipakai di tab Kurir memuat `laundryServices: LaundryService[]`.

---

## Step 14 — Verification Plan

### Backend Checklist
- [ ] Migration berjalan: `php artisan migrate`
- [ ] `supports_courier` ada di `$fillable`, `casts()`, dan scopes baru di `LaundryService.php`
- [ ] `StoreLaundryServiceRequest` dan `UpdateLaundryServiceRequest` menerima `supportsCourier`
- [ ] `BulkUpdateCourierEligibilityRequest` sesuai spec
- [ ] `LaundryServiceResource` mengembalikan field `supportsCourier`
- [ ] `LaundryServiceService::updateCourierEligibility()` dan `bulkUpdateCourierEligibility()` berfungsi
- [ ] `OrderService` menolak order kurir jika ada layanan dengan `supports_courier = false`
- [ ] Route `PATCH .../courier-eligibility` dan `.../bulk-courier-eligibility` terdaftar dan bisa diakses
- [ ] `php artisan route:list` menunjukkan kedua route baru

### Frontend Checklist
- [ ] Form Create layanan punya field `CourierEligibilityField`
- [ ] Form Edit layanan menampilkan nilai `supportsCourier` yang tersimpan
- [ ] `npm run build` bersih tanpa TypeScript error
- [ ] Tab Kurir detail outlet menampilkan `CourierServicesSection`
- [ ] Toggle per layanan berfungsi — data konsisten antara form layanan dan tab kurir
- [ ] `ToggleCourierServiceModal` sesuai `modal_spec.md`: guard, preview, footer, loading state
- [ ] Tidak ada warna hardcoded — semua via CSS variables atau Tailwind theme classes
- [ ] Semua file Partials terpisah — tidak ada file melebihi ~150 baris

---

## Catatan: File yang Tidak Perlu Diubah

| File | Alasan |
|---|---|
| `CourierSchedule.php` | Eligibility di level layanan, bukan jadwal kurir |
| `CourierSetting.php` | Pengaturan global outlet tidak berubah |
| `CourierToggleCard.tsx` | Toggle kurir outlet (global) tetap terpisah |
| `CourierSettingsOverviewSection.tsx` | Tidak terkait eligibility per layanan |
| `Category.php` | Eligibility di level layanan, bukan kategori (FR-07) |
| `CourierScheduleSection.tsx` | Jadwal kurir tidak berubah |
