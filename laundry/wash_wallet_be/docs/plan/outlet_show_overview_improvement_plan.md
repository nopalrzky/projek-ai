# Implementation Plan: Outlet Show Overview Improvement

**Referensi User Need:** [`outlet_show_overview_improvement_user_need.md`](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/docs/user_need/outlet_show_overview_improvement_user_need.md)

**Tanggal:** 2026-06-16

---

## Instruksi Wajib untuk AI Model

> **Baca sebelum menulis kode apapun:**
> 1. **Baca spec standarisasi** di `docs/spec/` — terutama `model_spec.md`, `service_spec.md`, `controller_spec.md`
> 2. **Baca komponen reusable** di `resources/js/Components/` sebelum menggunakannya — pastikan props yang dipakai benar
> 3. **Gunakan CSS variables** dari `app.css` — `var(--color-*)`, Tailwind theme classes. **Jangan hardcode warna hex**
> 4. **Pecah ke Partials** — jika satu file mendekati ~150 baris, pecah ke komponen di `Partials/`
> 5. **Tidak ada comment** di dalam kode — tulis clean code yang self-explanatory
> 6. **Baca file existing** yang akan dimodifikasi sebelum menulis perubahan

---

## 1. Ringkasan Perubahan

Tab `Overview` pada halaman detail outlet akan diubah menjadi ringkasan performa dan kesiapan operasional yang actionable. Backend akan mengirim payload agregasi baru (`overviewStats`, `overviewCharts`, `recentOrders`, `operationalChecklist`) yang dihitung oleh `OutletOverviewService`. Frontend akan merender KPI cards, chart (menggunakan `recharts`), checklist risiko konfigurasi, kesiapan operasional, dan recent orders nyata dari backend.

---

## 2. Keputusan Desain

| # | Keputusan | Pilihan |
|---|-----------|---------|
| D1 | Agregasi overview dibuat di service baru | `OutletOverviewService` — bukan langsung di controller agar mudah ditest dan dirawat |
| D2 | `recentOrders` menggunakan resource | Resource ringkas baru `OrderSummaryResource` — bukan `OrderResource` penuh agar payload ringan |
| D3 | Definisi `periodRevenue` | Total `total_amount` dari semua order non-cancelled dan non-rejected pada periode |
| D4 | Definisi `activeOrdersCount` | Order dengan status bukan `completed`, `cancelled`, `rejected` |
| D5 | Filter periode | Menggunakan query param `?period=7d\|30d\|90d` pada route `outlets.show`. Default `30d`. |
| D6 | `orderReviews` dimuat di show | Ya — tambahkan `orderReviews` ke eager load di `OutletController::show` agar `averageRating` di `OutletResource` akurat |
| D7 | Checklist risiko | Dibuat sepenuhnya oleh backend di `OutletOverviewService` agar rule konsisten |
| D8 | Layanan aktif | `LaundryService` yang tidak soft-deleted dan kategorinya aktif (tidak soft-deleted) |
| D9 | Karyawan aktif | Semua employee pada outlet yang tidak soft-deleted |
| D10 | COD dalam pendapatan | Dihitung sebagai pendapatan saat order masuk periode (bukan hanya completed), tapi dibedakan label-nya di chart kesehatan pembayaran |
| D11 | `paid_by_package` | Tidak dihitung sebagai cash revenue tapi dihitung sebagai order usage — dibedakan di chart |
| D12 | Timezone | Pakai `$outlet->timezone ?? 'Asia/Jakarta'` untuk batas hari ini dan range periode |
| D13 | Action checklist navigasi tab | Menggunakan URL param `?tab={index}` yang sudah didukung `useOutletTabs` (via `navigateToOutletTab`) |
| D14 | Agregasi layanan/kategori | Tidak memasukkan order yang `cancelled` atau `rejected` |

---

## 3. Arsitektur Perubahan

```
OutletController::show(int $id, Request $request)
    ├── OutletService::getById($id, [...relations, 'orderReviews'])
    ├── OutletOverviewService::buildPayload($outlet, $period)
    │   ├── buildStats($outlet, $startDate, $endDate, $today)       → overviewStats
    │   ├── buildCharts($outlet, $startDate, $endDate)              → overviewCharts
    │   ├── buildRecentOrders($outlet)                              → recentOrders
    │   └── buildOperationalChecklist($outlet)                      → operationalChecklist
    └── Inertia::render('Dashboard/Outlets/Show', [...])

OutletShowProps (types.ts)
    ├── outlet: Outlet
    ├── overviewStats: OutletOverviewStats
    ├── overviewCharts: OutletOverviewCharts
    ├── recentOrders: OrderSummary[]
    ├── operationalChecklist: OperationalChecklistItem[]
    └── overviewMeta: { period, startDate, endDate, generatedAt }

Show.tsx
    └── <OutletOverview outlet overviewStats overviewCharts recentOrders
                       operationalChecklist overviewMeta />
            ├── PeriodFilterBar (7d | 30d | 90d — Inertia visit)
            ├── KPICards (overviewStats)
            ├── RevenueOrderChart (recharts — overviewCharts.revenueAndOrdersByDay)
            ├── OrderStatusChart (recharts PieChart — orderStatusDistribution)
            ├── PaymentHealthChart (recharts BarChart — paymentHealth)
            ├── TopServicesChart (recharts HorizontalBar — topServices)
            ├── OperationalReadiness (operationalChecklist OK items)
            └── RecentOrders (recentOrders)
```

---

## 4. Data Contract Final

### Backend → Frontend Props Baru

```ts
// Ditambahkan ke OutletShowProps di types.ts
interface OutletShowProps {
    outlet: Outlet;                              // existing
    overviewStats: OutletOverviewStats;          // NEW
    overviewCharts: OutletOverviewCharts;        // NEW
    recentOrders: OrderSummary[];                // NEW
    operationalChecklist: OperationalChecklistItem[]; // NEW
    overviewMeta: {                              // NEW
        period: '7d' | '30d' | '90d';
        startDate: string;  // ISO date
        endDate: string;    // ISO date
        generatedAt: string; // ISO datetime
    };
}

interface OutletOverviewStats {
    period: {
        preset: '7d' | '30d' | '90d';
        startDate: string;
        endDate: string;
    };
    todayOrdersCount: number;
    periodOrdersCount: number;
    periodRevenue: number;
    activeOrdersCount: number;
    unpaidOrdersCount: number;
    outstandingAmount: number;
    customersCount: number;
    activeLaundryServicesCount: number;
    activeEmployeesCount: number;
    averageRating: number;
    totalReviews: number;
    coinBalance: number;
    featureStatusSummary: {
        active: number;
        trial: number;
        expired: number;
        inactive: number;
    };
}

interface OutletOverviewCharts {
    revenueAndOrdersByDay: Array<{
        date: string;         // 'YYYY-MM-DD'
        revenue: number;
        ordersCount: number;
    }>;
    orderStatusDistribution: Array<{
        status: string;
        label: string;
        count: number;
        color: string;        // hex warna untuk chart
    }>;
    paymentHealth: Array<{
        paymentStatus: string;
        label: string;
        ordersCount: number;
        totalAmount: number;
        paidAmount: number;
        remainingAmount: number;
    }>;
    topServices: Array<{
        name: string;
        categoryName: string | null;
        itemsCount: number;
        quantity: number;
        revenue: number;
    }>;
    topCategories: Array<{
        name: string;
        itemsCount: number;
        quantity: number;
        revenue: number;
    }>;
}

interface OrderSummary {
    id: number;
    orderNumber: string;
    customerName: string | null;
    customerId: number;
    status: string;
    statusLabel: string;
    statusBadgeVariant: string;
    paymentStatus: string;
    paymentStatusLabel: string;
    totalAmount: number;
    remainingAmount: number;
    orderDate: string | null;
    createdAt: string;
}

interface OperationalChecklistItem {
    key: string;
    label: string;
    status: 'ok' | 'info' | 'warning' | 'critical';
    message: string;
    actionLabel?: string;
    actionTarget?: string;   // URL atau '?tab={index}'
}
```

---

## 5. Rencana Implementasi

### Fase 1 — Backend

---

#### [NEW] `app/Services/OutletOverviewService.php`

Service baru yang bertanggung jawab atas seluruh agregasi data overview outlet.

**Method yang perlu dibuat:**

```php
class OutletOverviewService
{
    public function buildPayload(Outlet $outlet, string $period = '30d'): array;

    // private methods:
    private function validatePeriod(string $period): string;
    private function resolveDateRange(string $period, string $timezone): array;
    private function buildStats(Outlet $outlet, Carbon $startDate, Carbon $endDate, Carbon $today): array;
    private function buildCharts(Outlet $outlet, Carbon $startDate, Carbon $endDate): array;
    private function buildRecentOrders(Outlet $outlet, int $limit = 6): array;
    private function buildOperationalChecklist(Outlet $outlet): array;

    // chart sub-methods:
    private function getRevenueAndOrdersByDay(Outlet $outlet, Carbon $startDate, Carbon $endDate): array;
    private function getOrderStatusDistribution(Outlet $outlet, Carbon $startDate, Carbon $endDate): array;
    private function getPaymentHealth(Outlet $outlet, Carbon $startDate, Carbon $endDate): array;
    private function getTopServices(Outlet $outlet, Carbon $startDate, Carbon $endDate, int $limit = 5): array;
    private function getTopCategories(Outlet $outlet, Carbon $startDate, Carbon $endDate, int $limit = 5): array;
}
```

**Logika Query Penting:**

- **Scope utama**: Semua query pakai `where('outlet_id', $outlet->id)`.
- **Period Revenue**: `SUM(total_amount)` dari orders `status NOT IN ('cancelled', 'rejected')` dan `created_at BETWEEN $startDate AND $endDate`.
- **Active Orders**: `status NOT IN ('completed', 'cancelled', 'rejected')` — tanpa filter periode (kondisi real-time).
- **Unpaid Orders**: `payment_status IN ('unpaid', 'partial')` — tanpa filter periode.
- **Outstanding Amount**: `SUM(remaining_amount)` dari order `payment_status IN ('unpaid', 'partial')`.
- **Active Laundry Services**: `laundry_services` tidak soft-deleted JOIN `categories` tidak soft-deleted, WHERE `categories.outlet_id = $outlet->id`.
- **Active Employees**: `employees` WHERE `outlet_id = $outlet->id` dan tidak soft-deleted.
- **`revenueAndOrdersByDay`**: `SELECT DATE(created_at) as date, SUM(total_amount) as revenue, COUNT(*) as orders_count FROM orders WHERE outlet_id = ? AND created_at BETWEEN ? AND ? AND status NOT IN ('cancelled','rejected') GROUP BY DATE(created_at)`. Tanggal tanpa data diisi 0 di PHP dengan cara generate range tanggal penuh.
- **Top Services**: JOIN `order_items` ke `orders`, scope outlet + periode + non-cancelled/rejected, `GROUP BY laundry_service_name ORDER BY SUM(quantity) DESC LIMIT 5`.
- **Top Categories**: Sama dengan Top Services tapi `GROUP BY category_name`.
- **Feature Status Summary**: Hitung dari `$outlet->outletFeatures` yang sudah eager-loaded — group by `status`.
- **Average Rating**: Dari `$outlet->orderReviews` yang sudah eager-loaded — `where('is_published', true)->avg('rating')`.

**Validasi period:**

```php
private function validatePeriod(string $period): string
{
    return in_array($period, ['7d', '30d', '90d']) ? $period : '30d';
}

private function resolveDateRange(string $period, string $timezone): array
{
    $tz = new \DateTimeZone($timezone);
    $today = Carbon::now($tz)->startOfDay();
    $days = match ($period) {
        '7d'  => 7,
        '90d' => 90,
        default => 30,
    };
    $startDate = $today->copy()->subDays($days - 1)->startOfDay();
    $endDate = Carbon::now($tz)->endOfDay();
    return [$startDate, $endDate, $today];
}
```

**Checklist Risiko Konfigurasi — rule per item:**

| Key | Kondisi | Severity | Action Target |
|-----|---------|----------|---------------|
| `operational_days` | `$outlet->operationalDays->isEmpty()` | `critical` | `?tab=2` |
| `active_services` | `$activeLaundryServicesCount === 0` | `critical` | `?tab=8` |
| `employees` | `$activeEmployeesCount === 0` | `warning` | `?tab=5` |
| `courier_setting` | `$isCourierActive && !$outlet->courierSetting` | `critical` | `?tab=3` |
| `courier_schedule` | `$isCourierActive && $outlet->courierSchedules->isEmpty()` | `warning` | `?tab=3` |
| `activation_feature` | `activationStatus.status === 'expired'` | `critical` | `?tab=1` |
| `exposure_feature` | `exposureStatus.status === 'expired'` | `warning` | `?tab=1` |
| `coordinates` | `!$outlet->latitude || !$outlet->longitude` | `warning` | route edit outlet |
| `address` | `!$outlet->street` | `info` | route edit outlet |

Jika kondisi tidak terpenuhi (semua OK), item tetap disertakan dengan `status: 'ok'` dan pesan positif.

**Status warna untuk `orderStatusDistribution`:**

```php
private array $statusColors = [
    'requested'       => '#94a3b8',
    'accepted'        => '#60a5fa',
    'picking_up'      => '#818cf8',
    'picked_up'       => '#a78bfa',
    'received'        => '#34d399',
    'weighing'        => '#fbbf24',
    'ready_to_process'=> '#f59e0b',
    'in_progress'     => '#f97316',
    'ready'           => '#22c55e',
    'delivering'      => '#3b82f6',
    'delivered'       => '#10b981',
    'completed'       => '#16a34a',
    'cancelled'       => '#ef4444',
    'rejected'        => '#b91c1c',
    'pending_dropoff' => '#8b5cf6',
];
```

---

#### [NEW] `app/Http/Resources/Order/OrderSummaryResource.php`

Resource ringkas khusus untuk `recentOrders`.

```php
namespace App\Http\Resources\Order;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderSummaryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                  => (int) $this->id,
            'orderNumber'         => (string) $this->order_number,
            'customerName'        => $this->whenLoaded('customer', fn() => $this->customer?->name, null),
            'customerId'          => (int) $this->customer_id,
            'status'              => (string) $this->status,
            'statusLabel'         => (string) $this->getStatusLabel(),
            'statusBadgeVariant'  => (string) $this->getStatusBadgeVariant(),
            'paymentStatus'       => (string) $this->payment_status,
            'paymentStatusLabel'  => (string) $this->getPaymentStatusLabel(),
            'totalAmount'         => (float) $this->total_amount,
            'remainingAmount'     => (float) $this->remaining_amount,
            'orderDate'           => $this->order_date ? (string) $this->order_date : null,
            'createdAt'           => $this->created_at->toISOString(),
        ];
    }
}
```

Relasi yang perlu eager-loaded sebelum pakai resource ini: `customer`.

---

#### [MODIFY] `app/Http/Controllers/Web/OutletController.php`

Perubahan pada method `show`:

1. Tambahkan `Request $request` pada signature method.
2. Inject `OutletOverviewService` melalui constructor.
3. Tambahkan `'orderReviews'` ke array relasi di `getById`.
4. Ambil `$period` dari query param.
5. Panggil service untuk build payload.
6. Kirim semua prop baru ke Inertia.

```php
// Constructor (tambahkan):
public function __construct(
    // ... existing injections
    private OutletOverviewService $outletOverviewService,
) {}

// Method show (setelah perubahan):
public function show(int $id, Request $request): Response|RedirectResponse
{
    try {
        $outlet = $this->outletService->getById($id, [
            'owner',
            'categories',
            'customers',
            'employees',
            'fines',
            'laundryServices',
            'laundryServices.unit',
            'laundryServices.category',
            'membershipPlans',
            'operationalDays.courierSchedules',
            'positions',
            'servicePackages',
            'courierSchedules',
            'outletFeatures',
            'outletFeatures.feature',
            'outletSettings.setting',
            'courierSetting',
            'courierSetting.pricingTiers',
            'courierSetting.pricingZones',
            'orderReviews',  // NEW
        ]);

        if ($outlet->status !== 'active') {
            return redirect()->route('outlets.activate.page', $id);
        }

        $period = $request->input('period', '30d');
        $overview = $this->outletOverviewService->buildPayload($outlet, $period);

        return Inertia::render('Dashboard/Outlets/Show', [
            'outlet'               => (new OutletResource($outlet))->resolve(),
            'overviewStats'        => $overview['stats'],        // NEW
            'overviewCharts'       => $overview['charts'],       // NEW
            'recentOrders'         => $overview['recentOrders'], // NEW
            'operationalChecklist' => $overview['checklist'],    // NEW
            'overviewMeta'         => $overview['meta'],         // NEW
        ]);
    } catch (Throwable $e) {
        // ... existing error handling
    }
}
```

---

### Fase 2 — Frontend Types

---

#### [MODIFY] `resources/js/Pages/Dashboard/Outlets/types.ts`

Tambahkan interface baru di bawah interface `OutletOverviewProps` yang sudah ada, dan update `OutletShowProps` serta `OutletOverviewProps`:

```ts
// Interface baru yang ditambahkan:

export interface OutletOverviewStats {
    period: {
        preset: '7d' | '30d' | '90d';
        startDate: string;
        endDate: string;
    };
    todayOrdersCount: number;
    periodOrdersCount: number;
    periodRevenue: number;
    activeOrdersCount: number;
    unpaidOrdersCount: number;
    outstandingAmount: number;
    customersCount: number;
    activeLaundryServicesCount: number;
    activeEmployeesCount: number;
    averageRating: number;
    totalReviews: number;
    coinBalance: number;
    featureStatusSummary: {
        active: number;
        trial: number;
        expired: number;
        inactive: number;
    };
}

export interface RevenueAndOrdersByDay {
    date: string;
    revenue: number;
    ordersCount: number;
}

export interface OrderStatusDistributionItem {
    status: string;
    label: string;
    count: number;
    color: string;
}

export interface PaymentHealthItem {
    paymentStatus: string;
    label: string;
    ordersCount: number;
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
}

export interface TopServiceItem {
    name: string;
    categoryName: string | null;
    itemsCount: number;
    quantity: number;
    revenue: number;
}

export interface TopCategoryItem {
    name: string;
    itemsCount: number;
    quantity: number;
    revenue: number;
}

export interface OutletOverviewCharts {
    revenueAndOrdersByDay: RevenueAndOrdersByDay[];
    orderStatusDistribution: OrderStatusDistributionItem[];
    paymentHealth: PaymentHealthItem[];
    topServices: TopServiceItem[];
    topCategories: TopCategoryItem[];
}

export interface OrderSummary {
    id: number;
    orderNumber: string;
    customerName: string | null;
    customerId: number;
    status: string;
    statusLabel: string;
    statusBadgeVariant: string;
    paymentStatus: string;
    paymentStatusLabel: string;
    totalAmount: number;
    remainingAmount: number;
    orderDate: string | null;
    createdAt: string;
}

export interface OperationalChecklistItem {
    key: string;
    label: string;
    status: 'ok' | 'info' | 'warning' | 'critical';
    message: string;
    actionLabel?: string;
    actionTarget?: string;
}

export interface OutletOverviewMeta {
    period: '7d' | '30d' | '90d';
    startDate: string;
    endDate: string;
    generatedAt: string;
}

// Update interface yang sudah ada:

// OutletShowProps — tambah props baru
export interface OutletShowProps {
    outlet: Outlet;
    overviewStats: OutletOverviewStats;     // NEW
    overviewCharts: OutletOverviewCharts;   // NEW
    recentOrders: OrderSummary[];           // NEW
    operationalChecklist: OperationalChecklistItem[]; // NEW
    overviewMeta: OutletOverviewMeta;       // NEW
}

// OutletOverviewProps — tambah props baru
export interface OutletOverviewProps {
    outlet: Outlet;
    overviewStats: OutletOverviewStats;     // NEW
    overviewCharts: OutletOverviewCharts;   // NEW
    recentOrders: OrderSummary[];           // NEW (ganti dari Order[])
    operationalChecklist: OperationalChecklistItem[]; // NEW
    overviewMeta: OutletOverviewMeta;       // NEW
    employees?: Employee[];                 // existing (bisa dihapus jika tidak dipakai)
    isLoading?: boolean;                    // existing
}
```

---

### Fase 3 — Frontend Components

---

#### [MODIFY] `resources/js/Pages/Dashboard/Outlets/Show.tsx`

Destructure props baru dan teruskan ke `<OutletOverview />`:

```tsx
const OutletShow = ({
    outlet,
    overviewStats,
    overviewCharts,
    recentOrders,
    operationalChecklist,
    overviewMeta,
}: OutletShowProps) => {
    // ...existing code...

    return (
        <>
            {/* ...existing... */}
            <Tabs ...>
                <OutletOverview
                    outlet={outlet}
                    overviewStats={overviewStats}
                    overviewCharts={overviewCharts}
                    recentOrders={recentOrders}
                    operationalChecklist={operationalChecklist}
                    overviewMeta={overviewMeta}
                />
                {/* ...rest of tabs... */}
            </Tabs>
        </>
    );
};
```

---

#### [MODIFY] `resources/js/Pages/Dashboard/Outlets/Partials/OutletOverview.tsx`

File ini akan direfactor secara substansial. Struktur komponen baru:

**1. PeriodFilterBar** — inline component atau sub-component:
```tsx
// Tombol 7 Hari | 30 Hari | 90 Hari
// Saat klik:
router.visit(route('outlets.show', outlet.id), {
    data: { period: preset },
    preserveState: false,
    preserveScroll: false,
});
```

**2. KPICardsSection** — grid card KPI:
- Gunakan komponen `Card` existing.
- Minimum 3 kolom pada desktop, 2 pada tablet, 1 pada mobile.
- Cards yang ditampilkan (dengan value dari `overviewStats`):

| Card | Field | Note |
|------|-------|------|
| Order Hari Ini | `todayOrdersCount` | |
| Order Periode | `periodOrdersCount` | |
| Pendapatan Periode | `periodRevenue` | format `formatCurrency()` |
| Order Aktif | `activeOrdersCount` | |
| Belum Dibayar | `unpaidOrdersCount` | warna warning jika > 0 |
| Outstanding | `outstandingAmount` | format currency, warning jika > 0 |
| Total Pelanggan | `customersCount` | |
| Layanan Aktif | `activeLaundryServicesCount` | |
| Karyawan Aktif | `activeEmployeesCount` | |
| Rating | `averageRating` + `totalReviews` | icon bintang |
| Coin Balance | `coinBalance` | |
| Status Fitur | `featureStatusSummary` | badge per status |

**3. RevenueOrderChartSection** — recharts `ComposedChart`:
```tsx
import {
    ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// data: overviewCharts.revenueAndOrdersByDay
// Bar: revenue (Y-axis kiri)
// Line: ordersCount (Y-axis kanan)
// X-axis: date format 'DD/MM'
// Tooltip custom: tampilkan formatCurrency(revenue) dan ordersCount
```

**4. OrderStatusChart** — recharts `PieChart`:
```tsx
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// data: overviewCharts.orderStatusDistribution
// Cell color dari item.color
// Label persentase
// Empty state jika semua count === 0
```

**5. PaymentHealthChart** — recharts `BarChart` horizontal:
```tsx
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// layout="vertical"
// data: overviewCharts.paymentHealth
// Bar: ordersCount
// Tooltip: tampilkan ordersCount, totalAmount, remainingAmount
// Highlight 'unpaid' dan 'partial' dengan warna warning
```

**6. TopServicesSection** — recharts `BarChart` horizontal ATAU tabel:
```tsx
// Tab kecil: "Top Layanan" | "Top Kategori"
// State lokal untuk switch tab
// Tampilkan top 5 layanan atau top 5 kategori
// Kolom: Nama, Kategori (untuk layanan), Qty, Revenue
// Atau gunakan HorizontalBar chart
```

**7. OperationalReadinessSection** — checklist konfigurasi:
```tsx
// Loop operationalChecklist
// Group: critical → warning → info → ok
// Setiap item bukan 'ok':
//   - Icon sesuai severity (X merah untuk critical, warning untuk warning, info untuk info)
//   - Badge severity
//   - Label + message
//   - Tombol/link ke actionTarget jika ada actionLabel
// Jika semua 'ok':
//   - Green banner "Outlet siap beroperasi"
```

**8. RecentOrdersSection** — enhanced:
```tsx
// data: recentOrders (OrderSummary[])
// Tampilkan customerName atau fallback ke `Customer #${customerId}`
// Badge statusBadgeVariant untuk status
// Badge merah/warning untuk paymentStatus unpaid/partial
// formatCurrency untuk totalAmount
// formatDate untuk createdAt
// Link ke orders.show
// Empty state dipertahankan
```

---

### Fase 4 — Database Indexes (Opsional)

Cek apakah index berikut sudah ada di migration. Tambahkan hanya jika belum ada:

```php
// Migration baru: xxxx_add_overview_indexes_to_orders_table.php

Schema::table('orders', function (Blueprint $table) {
    // Cek dulu, buat jika belum ada
    $table->index(['outlet_id', 'created_at'], 'idx_orders_outlet_created');
    $table->index(['outlet_id', 'status'], 'idx_orders_outlet_status');
    $table->index(['outlet_id', 'payment_status'], 'idx_orders_outlet_payment');
});
```

> [!NOTE]
> Gunakan `DB::getSchemaBuilder()->hasIndex('orders', 'idx_orders_outlet_created')` untuk cek sebelum buat.

---

## 6. Daftar File yang Dimodifikasi / Dibuat

### Backend

| File | Aksi | Keterangan |
|------|------|------------|
| [`app/Services/OutletOverviewService.php`](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/app/Services/OutletOverviewService.php) | **[NEW]** | Service utama agregasi overview |
| [`app/Http/Resources/Order/OrderSummaryResource.php`](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/app/Http/Resources/Order/OrderSummaryResource.php) | **[NEW]** | Resource ringkas untuk recentOrders |
| [`app/Http/Controllers/Web/OutletController.php`](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/app/Http/Controllers/Web/OutletController.php) | **[MODIFY]** | Method `show` — tambah param, inject service, kirim props baru |
| `database/migrations/xxxx_add_overview_indexes_to_orders_table.php` | **[NEW, opsional]** | Tambah index untuk query overview |

### Frontend

| File | Aksi | Keterangan |
|------|------|------------|
| [`resources/js/Pages/Dashboard/Outlets/types.ts`](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/resources/js/Pages/Dashboard/Outlets/types.ts) | **[MODIFY]** | Tambah interface baru, update `OutletShowProps` dan `OutletOverviewProps` |
| [`resources/js/Pages/Dashboard/Outlets/Show.tsx`](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/resources/js/Pages/Dashboard/Outlets/Show.tsx) | **[MODIFY]** | Destructure dan teruskan props baru ke `<OutletOverview />` |
| [`resources/js/Pages/Dashboard/Outlets/Partials/OutletOverview.tsx`](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/resources/js/Pages/Dashboard/Outlets/Partials/OutletOverview.tsx) | **[MODIFY]** | Refactor substansial — tambah semua section baru |

---

## 7. Aturan Implementasi yang Harus Dipatuhi

1. **Semua query wajib scoped** ke `outlet_id` — tidak boleh ada query tanpa filter outlet.
2. **Tidak ada agregasi berat di frontend** — chart data diterima dari backend dalam bentuk sudah diagregasi.
3. **Period harus divalidasi di backend** — hanya `7d`, `30d`, `90d` yang diterima. Default `30d`.
4. **`recentOrders` dibatasi 6 item** di `OutletOverviewService`.
5. **Timezone outlet** digunakan untuk batas hari ini: `Carbon::now($outlet->timezone ?? 'Asia/Jakarta')->startOfDay()`.
6. **`orderReviews` harus dimuat** di `OutletController::show` agar `averageRating` di `OutletResource` akurat.
7. **Empty state** harus tersedia di semua section — outlet baru tanpa order tidak boleh error atau crash.
8. **Checklist disusun backend** — frontend hanya render, tidak menghitung rule konfigurasi.
9. **`recharts`** sudah tersedia di `package.json` — tidak perlu install dependency baru.
10. **Action checklist** menggunakan URL param `?tab={index}` yang sudah didukung `useOutletTabs` via `navigateToOutletTab()` di `useOutletTabs.tsx`.
11. **`OutletOverviewService`** tidak boleh mengambil seluruh collection order untuk dihitung di PHP — gunakan query agregasi SQL (`selectRaw`, `groupBy`, dll).
12. **`OutletSummaryResource`** harus menggunakan `whenLoaded('customer')` untuk `customerName` — load relasi `customer` saat query recent orders.
13. **Jangan mengubah tab lain** — hanya tab Overview yang berubah.
14. **Pertahankan `OutletResource`** — tidak perlu diubah selain penambahan `orderReviews` yang sudah ditangani oleh eager loading.

---

## 8. Acceptance Criteria Checklist

- [ ] Tab `Overview` menampilkan minimal 10 KPI ringkas dari `overviewStats`
- [ ] Grafik pendapatan dan order per hari ditampilkan menggunakan `recharts` dengan default 30 hari
- [ ] Filter periode 7 hari / 30 hari / 90 hari berfungsi via query param `?period=` dan mengubah semua KPI dan chart
- [ ] Distribusi status order ditampilkan sebagai pie/donut chart
- [ ] Ringkasan kesehatan pembayaran (paid, unpaid, partial, COD, paid_by_package) ditampilkan sebagai bar chart
- [ ] Top 5 layanan dan kategori berdasarkan order item ditampilkan
- [ ] Section kesiapan operasional dan checklist risiko konfigurasi ditampilkan
- [ ] Section `Pesanan Terbaru` menampilkan data nyata dari backend (bukan selalu empty state)
- [ ] `recentOrders` dibatasi 6 item
- [ ] Semua query scoped ke outlet yang dibuka
- [ ] `averageRating` di KPI cards akurat (orderReviews dimuat)
- [ ] Empty state tersedia di semua section jika outlet belum memiliki data
- [ ] Action dari checklist mengarahkan ke tab atau halaman yang benar via `?tab={index}`
- [ ] Tidak ada kalkulasi agregasi dari collection besar di frontend
- [ ] Tidak ada N+1 query baru yang tidak perlu
- [ ] Period `7d`, `30d`, `90d` divalidasi di backend

---

## 9. Urutan Pengerjaan yang Disarankan

**Step 1 — Backend:**
1. Buat `OrderSummaryResource` (file kecil, referensi mudah)
2. Buat `OutletOverviewService` dengan semua method
3. Modifikasi `OutletController::show`
4. Verifikasi payload dengan Inertia (dump props di browser)

**Step 2 — Frontend Types:**
1. Update `types.ts` — tambah semua interface baru
2. Update `OutletShowProps` dan `OutletOverviewProps`

**Step 3 — Frontend Components:**
1. Update `Show.tsx` untuk destructure dan teruskan props baru
2. Refactor `OutletOverview.tsx` section per section:
   a. `PeriodFilterBar`
   b. `KPICardsSection`
   c. `RevenueOrderChartSection`
   d. `OrderStatusChart`
   e. `PaymentHealthChart`
   f. `TopServicesSection`
   g. `OperationalReadinessSection`
   h. `RecentOrdersSection` (update dari data nyata)

**Step 4 — Verifikasi:**
1. Cek semua empty state
2. Cek filter periode (`?period=7d`, `?period=90d`)
3. Cek action link checklist mengarah ke tab benar
4. Cek tidak ada console error TypeScript
5. Cek tidak ada error pada outlet baru tanpa order

---

## 10. Referensi File Terkait

- [`OutletController.php`](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/app/Http/Controllers/Web/OutletController.php#L254-L297) — method `show` yang akan dimodifikasi
- [`OutletResource.php`](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/app/Http/Resources/Outlet/OutletResource.php) — resource outlet existing
- [`OrderResource.php`](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/app/Http/Resources/Order/OrderResource.php) — referensi untuk `OrderSummaryResource`
- [`OutletOverview.tsx`](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/resources/js/Pages/Dashboard/Outlets/Partials/OutletOverview.tsx) — file yang akan direfactor
- [`Show.tsx`](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/resources/js/Pages/Dashboard/Outlets/Show.tsx) — file yang akan dimodifikasi
- [`useOutletTabs.tsx`](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/resources/js/Hooks/useOutletTabs.tsx) — `TAB_INDICES` dan `navigateToOutletTab` untuk action checklist
- [`DashboardService.php`](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/app/Services/DashboardService.php) — referensi pola service existing
- [`Order.php`](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/app/Models/Order.php) — konstanta status dan payment status
