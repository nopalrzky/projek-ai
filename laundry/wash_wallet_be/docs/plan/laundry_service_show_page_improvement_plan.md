# Implementation Plan: Improvement Halaman Detail Laundry Service

**Tanggal:** 2026-06-28
**Berdasarkan:** `docs/user_need/laundry_service_show_page_improvement_user_need.md`
**Dikerjakan oleh:** AI Model (bukan pembuat plan ini)

---

## Ringkasan

Halaman `Dashboard/LaundryServices/Show` saat ini hanya memiliki 2 tab: **Ringkasan** dan **Proses Layanan**. Tab Ringkasan hanya menampilkan field dasar (outlet, kategori, unit, tanggal, deskripsi) dan tidak menyertakan informasi komersial seperti harga, durasi, minimal kuantitas, dan status kurir. Relasi `servicePackageItems` dan `orderItems` belum ditampilkan sama sekali.

Plan ini mencakup:
1. Perluasan konten tab Ringkasan menjadi overview bisnis yang actionable (termasuk informasi komersial dan indikator kesehatan konfigurasi).
2. Penambahan tab baru **Paket Layanan** (`ServicePackageItems/Index.tsx`) untuk relasi `servicePackageItems`.
3. Penambahan tab baru **Riwayat Order** (`OrderItems/Index.tsx`) untuk relasi `orderItems` dengan strategi payload aman.
4. Penyesuaian backend: controller, resource, dan TypeScript type.
5. Verifikasi dan perbaikan route nested proses layanan.

---

## Kondisi Codebase Saat Ini (Temuan Aktual)

### Backend

- `LaundryServiceController::show` saat ini memuat relasi: `category`, `category.outlet`, `unit`, `laundryServiceProcesses.process`.
- `LaundryServiceResource` sudah mengekspos field: `id`, `categoryId`, `unitId`, `name`, `description`, `price`, `durationHours`, `minQuantity`, `slug`, `isActive`, `supportsCourier`, `courierSupportLabel`, `courierSupportMessage`, `averageRating`, `totalReviews`, `createdAt`, `updatedAt`, `deletedAt`.
- `LaundryServiceResource` sudah mendukung relasi `servicePackageItems` via `whenLoaded`, tetapi **controller show belum meloadnya**.
- `LaundryServiceResource` **belum mengekspos** `orderItems` dan `orderItemsCount`.
- Route `laundry-services.laundry-service-processes.*` **tidak ditemukan** di `web.php`. Ini menyebabkan action tambah/edit/hapus proses di `LaundryServiceProcesses/Index.tsx` akan error di runtime.
- Controller `LaundryServiceController` memiliki method untuk proses: `createLaundryServiceProcess`, `storeLaundryServiceProcess`, `editLaundryServiceProcess`, `updateLaundryServiceProcess`, `destroyLaundryServiceProcess`. Tidak ada method `showLaundryServiceProcess`.

### Frontend

- `LaundryServiceOverview.tsx` menampilkan: outlet, kategori, unit, tanggal dibuat, terakhir diupdate, deskripsi.
- `LaundryServiceOverview.tsx` **tidak menampilkan**: harga, durasi, minimal kuantitas, status kurir, rating, indikator kesehatan.
- `LaundryServicePageHeader.tsx` hanya memiliki tombol Kembali, tidak ada tombol Edit.
- `Show.tsx` hanya mendaftarkan 2 tab.
- `LaundryService` TypeScript type sudah memiliki: `orderItems`, `orderItemsCount`, `servicePackageItems`, `servicePackageItemsCount`. Namun `orderItems` dan `servicePackageItems` saat ini tidak opsional, yang bisa menyebabkan error di halaman yang tidak meload relasi tersebut.
- Field `courierSupportLabel`, `courierSupportMessage`, `averageRating`, `totalReviews` tersedia di resource tetapi perlu diverifikasi apakah ada di `laundry_service.ts`.

---

## Keputusan Desain

### 1. Strategi `orderItems` — Load Recent Terbatas (20 item)

Karena `orderItems` berpotensi sangat banyak, plan ini memilih **load recent terbatas** (20 item terbaru, diurutkan `created_at DESC`). Count dikirim via `loadCount`.

- Controller `show` menambah `loadCount('orderItems')`.
- Controller `show` meload `orderItems` terbatas 20 item terbaru dengan relasi `order` dan `order.customer`.
- `LaundryServiceResource` menambah `orderItems` dan `orderItemsCount` dengan `whenLoaded`.
- Frontend menampilkan keterangan bahwa yang tampil adalah 20 item terbaru dari total `orderItemsCount`.

### 2. `servicePackageItemsCount` — Dari Collection Loaded

Controller meload `servicePackageItems.servicePackage` sekaligus, count diambil dari collection. Tidak perlu `withCount` terpisah.

### 3. Action Proses Layanan — Tetap Aktif, Route Diperbaiki

Route `laundry-services.laundry-service-processes.*` yang dipanggil di `LaundryServiceProcesses/Index.tsx` tidak terdaftar di `web.php`. Plan ini mendaftarkan route nested yang sesuai. Method `showLaundryServiceProcess` tidak ada di controller, sehingga route `show` untuk proses tidak didaftarkan.

### 4. Header — Tambah Tombol Edit

Konsisten dengan show page lain, header ditambah tombol **Edit** menuju `laundry-services.edit`.

### 5. Rating/Review — Hanya Summary di Tab Ringkasan

`averageRating` dan `totalReviews` sudah tersedia di resource. Tampilkan di tab Ringkasan. Tidak perlu tab review terpisah.

---

## Perubahan yang Direncanakan

### Layer 1: Backend

---

#### [MODIFY] `app/Http/Controllers/Web/LaundryServiceController.php`

**Method `show` — Perluasan relasi dan load orderItems terbatas:**

```php
public function show(Request $request, int $id): Response|RedirectResponse
{
    try {
        $laundryService = $this->laundryServiceService->getById($id, [
            'category',
            'category.outlet',
            'unit',
            'laundryServiceProcesses.process',
            'servicePackageItems.servicePackage',
            'servicePackageItems.servicePackage.outlet',
        ]);

        // Load count orderItems tanpa memuat seluruh data
        $laundryService->loadCount('orderItems');

        // Load orderItems terbatas 20 terbaru dengan relasi order dan customer
        $laundryService->load(['orderItems' => function ($query) {
            $query->with(['order', 'order.customer'])
                  ->orderBy('created_at', 'desc')
                  ->limit(20);
        }]);

        return Inertia::render('Dashboard/LaundryServices/Show', [
            'laundryService' => (new LaundryServiceResource($laundryService))->resolve(),
        ]);
    } catch (Throwable $e) {
        Log::error('[LaundryServiceController] Failed to show laundry service', [
            'error'   => $e->getMessage(),
            'user_id' => Auth::id(),
            'type'    => 'laundry_service_controller_error',
        ]);

        return redirect()->route('laundry-services.index')
            ->with('error', 'Layanan laundry tidak ditemukan atau akses ditolak');
    }
}
```

---

#### [MODIFY] `app/Http/Resources/LaundryService/LaundryServiceResource.php`

Tambah import `OrderItemResource` dan ekspos `orderItems` serta `orderItemsCount`:

```php
// Tambah di bagian use/import:
use App\Http\Resources\OrderItem\OrderItemResource;

// Tambah di dalam toArray(), setelah baris servicePackageItemsCount:
'orderItems' => OrderItemResource::collection($this->whenLoaded('orderItems')),
'orderItemsCount' => $this->when(
    isset($this->resource->order_items_count) || $this->relationLoaded('orderItems'),
    fn() => $this->resource->order_items_count
        ?? ($this->relationLoaded('orderItems') ? $this->orderItems->count() : 0)
),
```

> **Catatan:** `loadCount('orderItems')` mengisi attribute `order_items_count` pada model. Gunakan `$this->resource->order_items_count` untuk mengaksesnya.

---

#### [MODIFY] `routes/web.php`

Tambah route nested `laundry-service-processes` di dalam area dashboard routes (di sekitar `Route::resource('laundry-services', ...)`):

```php
// Tambah setelah Route::resource('laundry-services', LaundryServiceController::class);
Route::prefix('laundry-services/{laundryServiceId}')
    ->name('laundry-services.')
    ->controller(LaundryServiceController::class)
    ->whereNumber('laundryServiceId')
    ->group(function () {
        Route::prefix('laundry-service-processes')
            ->name('laundry-service-processes.')
            ->group(function () {
                Route::get('/create', 'createLaundryServiceProcess')->name('create');
                Route::post('/', 'storeLaundryServiceProcess')->name('store');
                Route::get('/{laundryServiceProcessId}/edit', 'editLaundryServiceProcess')
                    ->name('edit')->whereNumber('laundryServiceProcessId');
                Route::put('/{laundryServiceProcessId}', 'updateLaundryServiceProcess')
                    ->name('update')->whereNumber('laundryServiceProcessId');
                Route::delete('/{laundryServiceProcessId}', 'destroyLaundryServiceProcess')
                    ->name('destroy')->whereNumber('laundryServiceProcessId');
            });
    });
```

> **Catatan:** Route `show` untuk proses tidak ditambahkan karena method `showLaundryServiceProcess` tidak ada di controller. Jika `LaundryServiceProcesses/Index.tsx` memanggil route `show`, hapus atau comment handler `handleView` di komponen tersebut, atau tambahkan stub method di controller yang redirect ke `laundry-services.show`.

---

### Layer 2: Frontend — Tab Ringkasan

---

#### [MODIFY] `resources/js/Pages/Dashboard/LaundryServices/Partials/LaundryServiceOverview.tsx`

Komponen ini diubah total menjadi **overview bisnis** dengan 4 section terorganisir. Pertahankan pola CSS variable existing.

**Struktur baru:**

```
LaundryServiceOverview
|-- Section 1: Konfigurasi Komersial (Card)
|   |-- Grid 2 kolom:
|   |   Kiri:                           Kanan:
|   |   - Harga (formatCurrency)        - Durasi (jam)
|   |   - Min. Kuantitas + Unit         - Status Kurir
|   |   - Outlet                        - Kategori
|
|-- Section 2: Indikator Kesehatan Konfigurasi (Card)
|   |-- Status aktif/nonaktif
|   |-- Jumlah proses (warning jika isActive && processesCount === 0)
|   |-- Status dukungan kurir
|   |-- Jumlah paket layanan (netral jika 0)
|   |-- Jumlah order (informatif)
|
|-- Section 3: Rating & Review (Card kecil)
|   |-- averageRating (bintang visual jika perlu, atau angka)
|   |-- totalReviews
|   |-- Empty state "Belum ada review" jika totalReviews === 0
|
|-- Section 4: Deskripsi (kondisional)
    |-- Muncul hanya jika description tidak kosong
```

**Icon yang digunakan (lucide-react):**
- `Banknote` atau `DollarSign` untuk harga
- `Clock` untuk durasi
- `Package` untuk minimal kuantitas
- `Truck` untuk kurir
- `Building2` untuk outlet
- `Tag` untuk kategori
- `Ruler` untuk unit
- `CheckCircle` / `XCircle` / `AlertTriangle` untuk indikator kesehatan
- `Star` untuk rating

**Utility yang digunakan:**
- `formatCurrency` dari `@/lib/utils` untuk harga
- `formatDate` dari `@/lib/utils` untuk tanggal (di section yang membutuhkan)

**Warning card kesehatan:**
Jika `laundryService.isActive && (laundryService.laundryServiceProcessesCount ?? 0) === 0`, tampilkan card warning dengan warna `var(--color-warning-*)`:
> "Layanan ini aktif tetapi belum memiliki proses produksi. Tambahkan proses di tab Proses Layanan."

---

#### [MODIFY] `resources/js/Pages/Dashboard/LaundryServices/Partials/LaundryServicePageHeader.tsx`

Tambah tombol **Edit** di bagian Actions, sebelum tombol Kembali:

```tsx
// Tambah import Edit icon
import { Shirt, ArrowLeft, Edit } from 'lucide-react';

// Di bagian Actions (div className="flex items-center gap-3 ml-4"):
<Button
    variant="warning"
    size="md"
    onClick={() => router.visit(route('laundry-services.edit', laundryService.id))}
    leftIcon={<Edit className="w-4 h-4" />}
    disabled={isLoading}
>
    Edit
</Button>
<Button
    variant="outline"
    size="md"
    onClick={handleBack}
    leftIcon={<ArrowLeft className="w-4 h-4" />}
    disabled={isLoading}
>
    Kembali
</Button>
```

---

### Layer 3: Frontend — Tab Baru `ServicePackageItems`

---

#### [NEW] `resources/js/Pages/Dashboard/LaundryServices/ServicePackageItems/Index.tsx`

Komponen tabel yang menampilkan daftar paket layanan yang menggunakan layanan ini.

**Kolom tabel:**

| # | Header | Field | Keterangan |
|---|--------|-------|------------|
| 1 | Nama Paket | `servicePackage.name` | Font semibold, subtitle outlet jika ada |
| 2 | Kuantitas | `quantity` | Angka + satuan dari `laundryService.unit?.symbol` |
| 3 | Status Paket | `servicePackage.isActive` | Badge success="Aktif" / secondary="Nonaktif" |
| 4 | Outlet Paket | `servicePackage.outlet?.name` | Teks, fallback "-" |
| 5 | Ditambahkan | `createdAt` | `formatDate(createdAt)` |

> **Catatan:** Kolom harga paket tidak ditambahkan karena perlu verifikasi apakah `ServicePackageResource` mengekspos `price`. Jika ya, bisa ditambahkan.

**Empty state:** `"Layanan ini belum digunakan dalam paket layanan mana pun."`

**Pola referensi:** Ikuti struktur [`ServicePackages/ServicePackageItems/Index.tsx`](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/resources/js/Pages/Dashboard/ServicePackages/ServicePackageItems/Index.tsx) dengan adaptasi konteks (props dari `laundryService` bukan `servicePackage`).

```tsx
// Struktur komponen:
interface LaundryServicePackageItemsIndexProps {
    laundryService: LaundryService;
    isLoading?: boolean;
}

const LaundryServicePackageItemsIndex: React.FC<...> = ({ laundryService, isLoading = false }) => {
    const items = laundryService.servicePackageItems || [];
    const columns: ColumnDef<ServicePackageItem>[] = useMemo(() => [...], []);

    return (
        <div className="space-y-6">
            <Card variant="elevated" className="p-6">
                {/* Header section */}
                <Table
                    data={items}
                    columns={columns}
                    isLoading={isLoading}
                    enableSorting={true}
                    enablePagination={true}
                    enableRowSelection={false}
                    emptyMessage="Layanan ini belum digunakan dalam paket layanan mana pun."
                    pageSize={10}
                    className="w-full"
                />
            </Card>
        </div>
    );
};
```

---

#### [NEW] `resources/js/Pages/Dashboard/LaundryServices/ServicePackageItems/types.ts`

```ts
import { LaundryService } from '@/types';

export interface LaundryServicePackageItemsIndexProps {
    laundryService: LaundryService;
    isLoading?: boolean;
}
```

---

### Layer 4: Frontend — Tab Baru `OrderItems`

---

#### [NEW] `resources/js/Pages/Dashboard/LaundryServices/OrderItems/Index.tsx`

Komponen tabel yang menampilkan riwayat pemakaian layanan dalam order (20 item terbaru).

**Kolom tabel:**

| # | Header | Field | Keterangan |
|---|--------|-------|------------|
| 1 | No. Order | `orderId` | Jika `order.orderNumber` tersedia, tampilkan itu |
| 2 | Customer | `order.customer?.name` | Fallback "-" jika tidak ada |
| 3 | Tanggal | `createdAt` | `formatDate(createdAt)` |
| 4 | Qty | `quantity` | Angka |
| 5 | Harga Satuan | `unitPrice` | `formatCurrency(unitPrice)` |
| 6 | Subtotal | `subtotal` | `formatCurrency(subtotal)` |
| 7 | Total | `totalAmount` | `formatCurrency(totalAmount)`, font bold |
| 8 | Status | `statusLabel` atau `status` | Badge warna sesuai status |

**Info card di atas tabel** (jika `orderItemsCount` tersedia):
```
Menampilkan 20 transaksi terbaru.
Total seluruh transaksi: {laundryService.orderItemsCount}.
```

**Empty state:** `"Layanan ini belum pernah digunakan dalam order."`

> **Verifikasi sebelum implementasi:** Cek apakah `OrderResource` yang diexpose oleh `OrderItemResource` memiliki field `orderNumber` dan apakah `order.customer` tersedia. Sesuaikan kolom tabel dengan field yang benar-benar ada.

```tsx
// Struktur komponen:
interface LaundryServiceOrderItemsIndexProps {
    laundryService: LaundryService;
    isLoading?: boolean;
}

const LaundryServiceOrderItemsIndex: React.FC<...> = ({ laundryService, isLoading = false }) => {
    const items = laundryService.orderItems || [];
    const totalCount = laundryService.orderItemsCount ?? 0;
    const columns: ColumnDef<OrderItem>[] = useMemo(() => [...], []);

    return (
        <div className="space-y-6">
            {totalCount > 0 && (
                <Card variant="outlined" className="p-4" style={{ backgroundColor: 'var(--color-info-50)', borderColor: 'var(--color-info-200)' }}>
                    {/* Info card: "Menampilkan 20 terbaru dari {totalCount} total" */}
                </Card>
            )}
            <Card variant="elevated" className="p-6">
                {/* Header section */}
                <Table
                    data={items}
                    columns={columns}
                    isLoading={isLoading}
                    enableSorting={true}
                    enablePagination={true}
                    enableRowSelection={false}
                    emptyMessage="Layanan ini belum pernah digunakan dalam order."
                    pageSize={10}
                    className="w-full"
                />
            </Card>
        </div>
    );
};
```

---

#### [NEW] `resources/js/Pages/Dashboard/LaundryServices/OrderItems/types.ts`

```ts
import { LaundryService } from '@/types';

export interface LaundryServiceOrderItemsIndexProps {
    laundryService: LaundryService;
    isLoading?: boolean;
}
```

---

### Layer 5: Frontend — `Show.tsx` (Komposer Tab)

---

#### [MODIFY] `resources/js/Pages/Dashboard/LaundryServices/Show.tsx`

Tambah 2 tab baru dan badge count:

```tsx
import { Eye, ListOrdered, Package, History } from 'lucide-react';
import ServicePackageItemsIndex from './ServicePackageItems/Index';
import OrderItemsIndex from './OrderItems/Index';

const tabsConfig = [
    {
        label: 'Ringkasan',
        icon: <Eye className="w-4 h-4" />,
    },
    {
        label: 'Proses Layanan',
        icon: <ListOrdered className="w-4 h-4" />,
        badge: (laundryService.laundryServiceProcessesCount ?? 0).toString(),
    },
    {
        label: 'Paket Layanan',
        icon: <Package className="w-4 h-4" />,
        badge: (laundryService.servicePackageItemsCount ?? 0).toString(),
    },
    {
        label: 'Riwayat Order',
        icon: <History className="w-4 h-4" />,
        badge: (laundryService.orderItemsCount ?? 0).toString(),
    },
];

// Di JSX Tabs children:
<Tabs ...>
    <LaundryServiceOverview laundryService={laundryService} />
    <LaundryServiceProcessesIndex laundryService={laundryService} isLoading={isLoading} />
    <ServicePackageItemsIndex laundryService={laundryService} isLoading={isLoading} />
    <OrderItemsIndex laundryService={laundryService} isLoading={isLoading} />
</Tabs>
```

---

### Layer 6: TypeScript Types

---

#### [MODIFY] `resources/js/types/laundry_service.ts`

```ts
export interface LaundryService {
    id: number;
    name: string;
    description?: string;
    slug: string;
    price: number;
    durationHours: number;
    minQuantity: number;
    isActive: boolean;
    supportsCourier: boolean;
    // Tambah field resource yang belum ada:
    courierSupportLabel?: string | null;
    courierSupportMessage?: string | null;
    averageRating?: number;
    totalReviews?: number;
    categoryId: number;
    unitId: number;
    category: Category;
    unit: Unit;
    outlet?: Outlet;                        // sudah ada, pastikan opsional
    // Ubah relasi besar menjadi opsional (tidak selalu diload):
    laundryServiceProcesses?: LaundryServiceProcess[];  // ubah menjadi opsional
    orderItems?: OrderItem[];               // sudah ada, pastikan opsional
    servicePackageItems?: ServicePackageItem[];         // sudah ada, pastikan opsional
    // Count fields:
    laundryServiceProcessesCount?: number;
    orderItemsCount?: number;
    servicePackageItemsCount?: number;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
}
```

> **Penting:** `laundryServiceProcesses` di type saat ini mungkin tidak opsional. Ubah menjadi `laundryServiceProcesses?: LaundryServiceProcess[]` untuk konsistensi. Di `LaundryServiceProcesses/Index.tsx`, sudah ada guard `const processes = laundryService.laundryServiceProcesses || []` sehingga aman.

---

## Urutan Pengerjaan

| Urutan | Tindakan | File | Alasan |
|--------|----------|------|--------|
| 1 | Daftarkan route nested `laundry-service-processes.*` | `routes/web.php` | Perbaiki bug yang sudah ada, tidak ada dependency |
| 2 | Tambah `orderItems` dan `orderItemsCount` ke resource | `LaundryServiceResource.php` | Dibutuhkan controller dan frontend |
| 3 | Perluas relasi di `show()` dan tambah `loadCount` | `LaundryServiceController.php` | Butuh resource yang sudah diupdate |
| 4 | Sinkronkan TypeScript type | `laundry_service.ts` | Dibutuhkan semua komponen frontend baru |
| 5 | Perbarui `LaundryServiceOverview.tsx` | Overview partial | Hanya butuh type yang sudah diupdate |
| 6 | Tambah tombol Edit di header | `LaundryServicePageHeader.tsx` | Independen |
| 7 | Buat `ServicePackageItems/Index.tsx` + `types.ts` | File baru | Butuh type dan data dari controller |
| 8 | Buat `OrderItems/Index.tsx` + `types.ts` | File baru | Butuh type dan data dari controller |
| 9 | Update `Show.tsx` untuk daftarkan 2 tab baru | `Show.tsx` | Butuh semua komponen di atas tersedia |

---

## Ringkasan File yang Diubah

### Backend

| File | Status | Deskripsi Perubahan |
|------|--------|---------------------|
| `app/Http/Controllers/Web/LaundryServiceController.php` | MODIFY | Perluas relasi `show()`, tambah `loadCount` dan `load` orderItems terbatas |
| `app/Http/Resources/LaundryService/LaundryServiceResource.php` | MODIFY | Tambah `orderItems` dan `orderItemsCount` |
| `routes/web.php` | MODIFY | Daftarkan route nested `laundry-service-processes.*` |

### Frontend

| File | Status | Deskripsi Perubahan |
|------|--------|---------------------|
| `resources/js/Pages/Dashboard/LaundryServices/Show.tsx` | MODIFY | Tambah 2 tab baru, badge count |
| `resources/js/Pages/Dashboard/LaundryServices/Partials/LaundryServiceOverview.tsx` | MODIFY | Perbarui menjadi overview bisnis 4 section |
| `resources/js/Pages/Dashboard/LaundryServices/Partials/LaundryServicePageHeader.tsx` | MODIFY | Tambah tombol Edit |
| `resources/js/Pages/Dashboard/LaundryServices/ServicePackageItems/Index.tsx` | NEW | Tabel servicePackageItems |
| `resources/js/Pages/Dashboard/LaundryServices/ServicePackageItems/types.ts` | NEW | Props interface |
| `resources/js/Pages/Dashboard/LaundryServices/OrderItems/Index.tsx` | NEW | Tabel orderItems (20 terbaru) |
| `resources/js/Pages/Dashboard/LaundryServices/OrderItems/types.ts` | NEW | Props interface |
| `resources/js/types/laundry_service.ts` | MODIFY | Sinkronkan field, buat relasi opsional, tambah field resource |

### File yang TIDAK Diubah

| File | Alasan |
|------|--------|
| `app/Models/LaundryService.php` | Semua relasi sudah ada |
| `app/Services/LaundryServiceService.php` | `getById` sudah mendukung relasi arbitrary |
| `app/Http/Resources/ServicePackageItem/ServicePackageItemResource.php` | Sudah mengekspos field yang dibutuhkan |
| `app/Http/Resources/OrderItem/OrderItemResource.php` | Sudah memiliki field lengkap |
| `resources/js/Pages/Dashboard/LaundryServices/LaundryServiceProcesses/Index.tsx` | Tidak ada perubahan UI; route diperbaiki di layer backend |

---

## Verification Plan

### Automated

```bash
# Verifikasi route terdaftar dengan benar
php artisan route:list --name=laundry-services.laundry-service-processes

# Pastikan tidak ada error konfigurasi
php artisan optimize:clear

# TypeScript compile check
npx tsc --noEmit
```

### Manual Verification

1. Buka `Dashboard/LaundryServices/{id}` untuk layanan yang **memiliki** proses, paket, dan riwayat order.
   - Tab Ringkasan harus menampilkan: harga, durasi, kuantitas, outlet, kategori, unit, kurir, rating, indikator kesehatan.
   - Tab Proses Layanan tetap menampilkan daftar proses.
   - Tab Paket Layanan menampilkan daftar paket dengan badge count yang benar.
   - Tab Riwayat Order menampilkan hingga 20 item terbaru dengan total count di info card.

2. Buka layanan yang **aktif tetapi tidak memiliki proses** — warning "belum memiliki proses" harus muncul di tab Ringkasan.

3. Buka layanan yang **belum pernah diorder** — empty state tampil di tab Riwayat Order.

4. Buka layanan yang **tidak masuk paket mana pun** — empty state tampil di tab Paket Layanan.

5. Klik tombol **Tambah Proses** di tab Proses Layanan — harus navigasi ke form tambah proses (tidak error 404).

6. Klik tombol **Edit** di header — harus navigasi ke halaman edit layanan.

7. Pastikan halaman tetap berfungsi untuk layanan **nonaktif** (data historis tetap tampil, status nonaktif ditegaskan).
