# Implementation Plan: Order Show Overview Improvement

**Referensi User Need:** [`order_show_overview_improvement_user_need.md`](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/docs/user_need/order_show_overview_improvement_user_need.md)

**Tanggal:** 2026-06-26

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

Tab `Overview` pada halaman detail order (`Dashboard/Orders/Show`) akan dirombak menjadi ringkasan order yang actionable dan mudah dibaca owner. `OrderOverview.tsx` yang sekarang sepanjang 640 baris akan dipecah menjadi beberapa komponen Partial yang terstruktur dan fokus. TypeScript type `Order` akan disinkronkan dengan field yang sudah dikirim `OrderResource`. Tidak ada perubahan backend yang signifikan karena hampir semua data yang dibutuhkan sudah ada di payload existing — hanya perlu menambah relasi `outlet` langsung di eager load controller dan memuat `customerAddress` jika dibutuhkan untuk pickup/delivery.

Layout overview baru mengikuti hierarki prioritas bisnis owner: status dan next action → pembayaran → produksi → fulfillment → pihak terkait → catatan → aktivitas terbaru.

---

## 2. Keputusan Desain

| # | Pertanyaan | Keputusan |
|---|-----------|-----------|
| D1 | Apakah perlu `orderOverview` computed object dari backend? | **Tidak.** Semua field yang dibutuhkan sudah dikirim `OrderResource`. Agregasi ringan (item count per status, process count per status, aktivitas terbaru gabungan) aman dihitung di frontend dari payload existing. Next action dan risk alert dihitung di frontend utility function terpisah agar tidak tersebar di JSX. |
| D2 | Apakah `OrderPageHeader` perlu diperkuat? | **Tidak.** Header tetap ringkas. Overview memiliki Hero Summary section sendiri di bawah header untuk detail status, progress, dan total yang lebih kaya tanpa duplikasi berlebihan. |
| D3 | Bagaimana cara navigasi dari overview ke tab detail? | Menggunakan `onNavigateTab` callback yang di-pass dari `Show.tsx` ke `OrderOverview`. `Show.tsx` sudah memiliki `activeTab` state dan `setActiveTab`. Tidak perlu routing baru. |
| D4 | Apakah perlu memuat relasi tambahan di backend? | **Satu tambahan wajib:** relasi `outlet` langsung di `OrderController::show` (saat ini hanya dimuat via `employee.outlet`). Relasi `customerAddress` perlu ditambah jika dibutuhkan untuk pickup/delivery display — evaluasi berdasarkan field `customerAddressId` yang sudah ada. Relasi `review` dan `statusUpdater` masuk prioritas rendah dan bisa ditambah setelah inti selesai. |
| D5 | Field mana di `order.ts` yang harus disinkronkan? | Semua field yang akan dipakai komponen overview baru: `source`, `sourceLabel`, `deliveryType`, `deliveryTypeLabel`, `completionPercentage`, `outletId`, `pickupFee`, `formattedPickupFee`, `deliveryFee`, `formattedDeliveryFee`, `pickupAddress`, `pickupSchedule`, `formattedPickupSchedule`, `deliveryDate`, `formattedDeliveryDate`, `deliveryAddress`, `deliverySchedule`, `formattedDeliverySchedule`, `canScheduleDelivery`, `requiresPaymentBeforeDelivery`. Field `review`, `hasReview`, `customerAccountId`, `customerAddressId` ditambahkan sekaligus agar type lebih lengkap meski belum semua dipakai overview. |
| D6 | Komponen mana yang jadi reusable global vs partial order? | Komponen berikut masuk `resources/js/Components` jika belum ada: tidak ada komponen baru yang cukup generic untuk dipindah — semua komponen baru bersifat spesifik order dan cukup di `Partials/`. Gunakan `Card`, `Badge`, `Button`, `Progress` existing. |
| D7 | Bagaimana next action ditentukan? | Dibuat sebagai pure function `resolveNextAction(order: Order): NextAction | null` di file utility `resources/js/Pages/Dashboard/Orders/utils/orderOverviewUtils.ts`. Function ini membaca kombinasi `status`, `paymentStatus`, `canPay`, `requiresPaymentBeforeDelivery`, `canScheduleDelivery`, `completionPercentage`. |
| D8 | Bagaimana risk alert ditentukan? | Dibuat sebagai pure function `resolveOrderAlerts(order: Order): OrderAlert[]` di file utility yang sama. Mengembalikan array alert terurut berdasarkan severity. Dibatasi maksimal 3–4 alert yang paling kritis di overview, sisanya bisa dilihat di tab terkait. |
| D9 | Bagaimana `specialInstructions` ditampilkan? | Selalu diperlakukan sebagai `string[] | null`. Ditampilkan sebagai daftar chip/tag, bukan paragraf tunggal. |
| D10 | Bagaimana `OrderOverview.tsx` yang ada diperlakukan? | File lama dihapus seluruhnya dan diganti dengan `OrderOverview.tsx` baru yang hanya berperan sebagai container/orchestrator yang mendelegasikan render ke sub-Partials. |

---

## 3. Arsitektur Perubahan

```
OrderController::show(int $id)
    ├── MODIFY: tambah 'outlet' ke eager load
    ├── EVALUATE: tambah 'customerAddress' jika $order->customer_address_id ada
    └── Inertia::render('Dashboard/Orders/Show', ['order' => OrderResource])

Show.tsx
    ├── MODIFY: tambah prop onNavigateTab ke OrderOverview
    └── <OrderOverview order={order} onNavigateTab={setActiveTab} />
            ├── [NEW] OverviewHeroSummary.tsx        ← FR-01: status, payment, produksi, total
            ├── [NEW] OverviewNextAction.tsx          ← FR-02: next action + risk alerts
            ├── [NEW] OverviewFinancialSummary.tsx    ← FR-03 + FR-04: payment progress + breakdown keuangan
            ├── [NEW] OverviewProductionSummary.tsx   ← FR-05: production progress + item summary (FR-06)
            ├── [NEW] OverviewFulfillment.tsx         ← FR-07: pickup/delivery readiness
            ├── [NEW] OverviewParties.tsx             ← FR-08: customer + employee + outlet ringkas
            ├── [NEW] OverviewNotes.tsx               ← FR-09: catatan + instruksi khusus
            └── [NEW] OverviewRecentActivity.tsx      ← FR-10: aktivitas terbaru gabungan

[NEW] resources/js/Pages/Dashboard/Orders/utils/orderOverviewUtils.ts
    ├── resolveNextAction(order): NextAction | null
    └── resolveOrderAlerts(order): OrderAlert[]
```

**Tab navigation mapping (untuk onNavigateTab):**

| Index | Tab Label |
|-------|-----------|
| 0 | Overview |
| 1 | Items |
| 2 | Pembayaran |
| 3 | Riwayat Status |
| 4 | Pelanggan |
| 5 | Karyawan |
| 6 | Pengaturan |

---

## 4. Data Contract

### 4.1 Penambahan Eager Load — `OrderController::show`

```php
$order = $this->orderService->getById($id, [
    'customer.customerSubscriptions',
    'employee.employeePositions.position',
    'employee.outlet',
    'outlet',                                          // TAMBAH — outlet langsung
    'customerAddress',                                 // TAMBAH — untuk pickup/delivery address display
    'orderItems.laundryService',
    'orderItems.orderItemProcesses.laundryServiceProcess.process',
    'orderItems.orderItemProcesses.employee',
    'orderItems.quotaUsageLog.customerSubscription.servicePackage',
    'orderStatusHistories.employee',
    'orderPaymentLogs.employee',
]);
```

> **Catatan:** `customerAddress` hanya perlu dimuat jika `customer_address_id` ada. Implementor dapat memuat secara conditional atau selalu eager load dan handle `null` di frontend.

### 4.2 Sinkronisasi TypeScript — `resources/js/types/order.ts`

Tambahkan field berikut ke interface `Order`:

```typescript
// === Field yang sudah dikirim resource, belum ada di type ===
source: string;
sourceLabel: string;
deliveryType: string;
deliveryTypeLabel: string;
completionPercentage: number;

outletId: number;
customerAccountId: number | null;
customerAddressId: number | null;
updatedBy: number | null;

pickupFee: number;
formattedPickupFee: string;
deliveryFee: number;
formattedDeliveryFee: string;

pickupAddress?: string | null;
pickupSchedule?: string | null;
formattedPickupSchedule?: string | null;

deliveryDate?: string | null;
formattedDeliveryDate?: string | null;
deliveryAddress?: string | null;
deliverySchedule?: string | null;
formattedDeliverySchedule?: string | null;

canScheduleDelivery: boolean;
requiresPaymentBeforeDelivery: boolean;

review?: OrderReview | null;           // tambah interface OrderReview
hasReview: boolean;

// === Relasi baru dari eager load tambahan ===
outlet?: Outlet | null;
customerAddress?: CustomerAddress | null;
```

Tambahkan interface baru di `order.ts`:

```typescript
export interface OrderReview {
    id: number;
    rating: number;
    review?: string | null;
    createdAt: string;
    formattedCreatedAt: string;
}

export interface CustomerAddress {
    id: number;
    label?: string | null;
    address: string;
    city?: string | null;
    province?: string | null;
    postalCode?: string | null;
    latitude?: number | null;
    longitude?: number | null;
}
```

> **Catatan:** Import `Outlet` yang sudah ada dari types index. Jika belum ada interface `Outlet` di types, buat interface minimal yang mencukupi untuk kebutuhan overview (name, street, phone).

### 4.3 Type Utility untuk Overview

```typescript
// resources/js/Pages/Dashboard/Orders/utils/orderOverviewUtils.ts

export interface NextAction {
    key: string;
    label: string;
    description: string;
    severity: 'info' | 'warning' | 'danger' | 'success';
    tabIndex?: number;    // tab yang dituju jika ada
    ctaLabel?: string;
}

export interface OrderAlert {
    key: string;
    severity: 'info' | 'warning' | 'danger';
    message: string;
}
```

---

## 5. Rencana Implementasi

### Fase 1 — Backend & TypeScript

---

#### [MODIFY] `app/Http/Controllers/Web/OrderController.php`

**Perubahan:**
- Tambahkan `'outlet'` dan `'customerAddress'` ke array eager load pada method `show`.

---

#### [MODIFY] `resources/js/types/order.ts`

**Perubahan:**
- Tambahkan semua field yang terdaftar di bagian 4.2.
- Tambahkan interface `OrderReview` dan `CustomerAddress`.
- Ubah `specialInstructions` memastikan typenya `string[] | null` (sudah benar di existing, pastikan tidak berubah).

---

### Fase 2 — Utilities

---

#### [NEW] `resources/js/Pages/Dashboard/Orders/utils/orderOverviewUtils.ts`

Pure functions untuk menentukan next action dan risk alerts berdasarkan data order. Tidak ada side effect, tidak ada API call.

**`resolveNextAction(order: Order): NextAction | null`**

Logika penentuan (urutan evaluasi dari prioritas tertinggi ke terendah):

| Kondisi | Key | Label | Severity | Tab |
|---------|-----|-------|----------|-----|
| `paymentStatus === 'not_yet_priced'` | `not_yet_priced` | Tunggu Penimbangan/Penentuan Harga | warning | 1 (Items) |
| `requiresPaymentBeforeDelivery && remainingAmount > 0 && status === 'ready'` | `pay_before_delivery` | Selesaikan Pelunasan Sebelum Delivery | danger | 2 (Pembayaran) |
| `canPay && remainingAmount > 0 && ['completed', 'cancelled', 'rejected'].indexOf(status) === -1` | `record_payment` | Catat Pembayaran | warning | 2 (Pembayaran) |
| `status === 'ready_to_process' && completionPercentage === 0` | `start_production` | Mulai Proses Produksi | info | 1 (Items) |
| `completionPercentage > 0 && completionPercentage < 100 && status === 'in_progress'` | `continue_production` | Lanjutkan Produksi | info | 1 (Items) |
| `status === 'ready' && deliveryType !== 'walk_in'` | `prepare_fulfillment` | Siapkan Pickup/Delivery | info | — |
| `canScheduleDelivery` | `schedule_delivery` | Jadwalkan Pengiriman | info | — |
| `status === 'completed' && paymentStatus === 'paid'` | `completed` | Order Selesai | success | — |
| semua kondisi lain tidak terpenuhi | `null` | — | — | — |

**`resolveOrderAlerts(order: Order): OrderAlert[]`**

Evaluasi kondisi berikut, kembalikan array alert terurut dari severity tertinggi:

| Kondisi | Severity | Pesan |
|---------|----------|-------|
| `estimatedCompletion` ada dan sudah lewat dan status bukan `completed`/`cancelled`/`rejected` | danger | Order sudah melewati estimasi selesai |
| `requiresPaymentBeforeDelivery && remainingAmount > 0` | danger | Order harus lunas sebelum bisa dikirim |
| `paymentStatus === 'not_yet_priced'` | warning | Harga order belum ditentukan |
| `remainingAmount > 0 && paymentStatus !== 'cod'` | warning | Masih ada sisa tagihan |
| `status === 'ready' && !canScheduleDelivery` | warning | Order siap tapi pengiriman belum bisa dijadwalkan |
| `orderItems?.length === 0` | warning | Order belum memiliki item |
| `deliveryType !== 'walk_in' && !pickupAddress && !deliveryAddress` | info | Alamat pickup/delivery belum tersedia |
| `!customer?.phone` | info | Nomor telepon customer tidak tersedia |

Batasi output maksimal **4 alert** (ambil 4 severity tertinggi). Jangan tampilkan alert yang kontradiktif — misalnya jika `status === 'completed'` maka alert sisa tagihan tidak perlu ditampilkan untuk non-COD.

---

### Fase 3 — Komponen Partial Baru

Semua komponen baru ditempatkan di `resources/js/Pages/Dashboard/Orders/Partials/`.

---

#### [NEW] `OverviewHeroSummary.tsx`

**Props:** `{ order: Order }`

**Tampilkan:**
- Strip KPI horizontal — 5 tile dalam grid responsive:
  - Status Order: Badge `order.statusBadgeVariant` + `order.statusLabel`
  - Status Pembayaran: Badge `order.paymentStatusBadgeVariant` + `order.paymentStatusLabel`
  - Progress Produksi: `Progress` component — `value={order.completionPercentage}` + label persentase
  - Total Tagihan: `order.formattedTotalAmount`
  - Sisa Tagihan: `order.formattedRemainingAmount` — warna `var(--color-error-*)` jika `> 0`, `var(--color-success-*)` jika `=== 0`
- Informasi sekunder satu baris di bawah KPI strip:
  - Tanggal Order: `order.formattedOrderDate`
  - Estimasi Selesai: `order.formattedEstimatedCompletion` atau "Belum ditentukan"
  - Tipe Delivery: `order.deliveryTypeLabel`
  - Sumber Order: `order.sourceLabel`

**Desain:** Gunakan `Card` component variant `flat`. Grid `grid-cols-2 sm:grid-cols-3 lg:grid-cols-5`. Tile KPI menggunakan pattern yang konsisten dengan KPI di dashboard.

---

#### [NEW] `OverviewNextAction.tsx`

**Props:** `{ order: Order; onNavigateTab: (index: number) => void }`

**Tampilkan:**
- Panggil `resolveNextAction(order)` dari utils
- Panggil `resolveOrderAlerts(order)` dari utils — tampilkan sebagai daftar chip/callout kecil
- Next action ditampilkan sebagai panel yang lebih menonjol dengan warna sesuai severity dan tombol CTA jika `tabIndex` tersedia
- Jika tidak ada next action dan tidak ada alert: tampilkan state "Tidak ada tindakan mendesak" dengan ikon `CheckCircle2`
- Alert list tampil di bawah next action sebagai callout ringkas dengan severity icon

**Desain:** Gunakan `Card` component. Alert menggunakan background `var(--color-{severity}-50)` dan border `var(--color-{severity}-200)`. Tombol CTA menggunakan `Button` component.

---

#### [NEW] `OverviewFinancialSummary.tsx`

**Props:** `{ order: Order; onNavigateTab: (index: number) => void }`

**Tampilkan dua sub-section:**

*Sub-section 1 — Status Pembayaran:*
- Progress bar pelunasan: `Progress` component — `value={paidAmount}` `max={totalAmount}`
- Label "Sudah Dibayar" + `formattedPaidAmount` vs "Sisa" + `formattedRemainingAmount`
- Jika `paymentMethod` ada: tampilkan metode pembayaran
- Jika COD: banner info "Pembayaran ditagih saat delivery/pickup"
- Jika `requiresPaymentBeforeDelivery`: banner warning "Harus lunas sebelum delivery"
- Jika `canPay`: tombol/link "Catat Pembayaran" → `onNavigateTab(2)`
- Aktivitas pembayaran terakhir: ambil `order.orderPaymentLogs?.[0]` jika ada, tampilkan amount + waktu + employee

*Sub-section 2 — Breakdown Keuangan:*
- Row: Subtotal, Diskon (jika `> 0`), Pajak (jika `> 0`), Pickup Fee (jika `> 0`), Delivery Fee (jika `> 0`), **Total** (bold/besar)
- Format selalu rupiah, gunakan formatted field dari backend
- Link "Lihat Detail Pembayaran" → `onNavigateTab(2)`

**Desain:** Gunakan `Card` component. Sub-section dipisahkan dengan `divider`. Gunakan `var(--color-success-*)` untuk "Lunas" dan `var(--color-error-*)` untuk "Belum Lunas".

---

#### [NEW] `OverviewProductionSummary.tsx`

**Props:** `{ order: Order; onNavigateTab: (index: number) => void }`

**Tampilkan:**

*Section 1 — Production Progress:*
- `Progress` component besar — `value={order.completionPercentage}` dengan label `{completionPercentage}%`
- KPI kecil: Total Item | Item Selesai | Sedang Diproses | Pending
- Hitung dari `order.orderItems`:
  - Item "selesai": semua `orderItemProcesses` berstatus `done`
  - Item "sedang diproses": ada `orderItemProcesses` berstatus `processing`
  - Item "pending": semua `orderItemProcesses` berstatus `pending`
- KPI kecil proses: Total Proses | Proses Selesai | Proses Berjalan | Proses Pending
- Hitung dari semua `orderItemProcesses` pada semua `orderItems`
- Jika ada proses yang sedang `processing`: tampilkan "Sedang dikerjakan: {processName} oleh {employeeName}"

*Section 2 — Item Summary (FR-06):*
- Judul "Ringkasan Item"
- Tampilkan maksimal 4 item pertama dari `order.orderItems`:
  - Nama layanan (`laundryService.name`)
  - Quantity + unit
  - Status item (badge)
  - Total amount formatted
  - Indikator kecil jika item punya `quotaUsageLog` (ikon paket/kuota)
- Jika `orderItems.length > 4`: tampilkan "+ N item lainnya" sebagai link → `onNavigateTab(1)`
- Jika `orderItems.length === 0`: empty state "Belum ada item dalam order ini"
- Link "Lihat Semua Item" → `onNavigateTab(1)`

**Desain:** Gunakan `Card` component. Dua sub-section dalam satu card atau dua card terpisah sesuai kebutuhan hierarki visual. Jangan nested card.

---

#### [NEW] `OverviewFulfillment.tsx`

**Props:** `{ order: Order }`

**Tampilkan:**
- Label "Tipe Fulfillment": `order.deliveryTypeLabel` sebagai badge/chip
- Jika `deliveryType === 'walk_in'`: tampilkan info ringkas "Order diserahkan langsung di outlet"
- Jika ada pickup:
  - Jadwal pickup: `formattedPickupSchedule` atau `formattedPickupDate` atau "Belum dijadwalkan"
  - Alamat pickup: `order.pickupAddress` atau warning "Alamat pickup belum tersedia"
- Jika ada delivery:
  - Jadwal delivery: `formattedDeliverySchedule` atau `formattedDeliveryDate` atau "Belum dijadwalkan"
  - Alamat delivery: `order.deliveryAddress` atau warning "Alamat delivery belum tersedia"
- Jika `canScheduleDelivery`: tampilkan info/action "Delivery bisa dijadwalkan"
- Jika `requiresPaymentBeforeDelivery && remainingAmount > 0`: tampilkan warning banner

**Kondisional render:** Jika `deliveryType` adalah `walk_in` dan tidak ada informasi pickup/delivery yang relevan, section ini bisa tampil minimal (hanya tipe fulfillment).

**Desain:** Gunakan `Card` component. Warning dengan `var(--color-warning-50)` background.

---

#### [NEW] `OverviewParties.tsx`

**Props:** `{ order: Order; onNavigateTab: (index: number) => void }`

**Tampilkan dalam dua kolom (`grid grid-cols-1 md:grid-cols-2`):**

*Kolom kiri — Customer:*
- Nama: `order.customer?.name`
- Telepon: `order.customer?.phone` — jika ada, bisa dibuat link `tel:` atau WhatsApp
- Email (opsional): `order.customer?.email`
- Link "Lihat Detail Customer" → `onNavigateTab(4)`

*Kolom kanan — Employee & Outlet:*
- Employee: `order.employee?.name`
- Posisi: dari `order.employee?.employeePositions?.[0]?.position?.name` jika tersedia
- Outlet: `order.outlet?.name` (dari relasi `outlet` langsung) atau fallback `order.employee?.outlet?.name`
- Alamat outlet (opsional): `order.outlet?.street` atau `order.employee?.outlet?.street`
- Link "Lihat Detail Karyawan" → `onNavigateTab(5)`

**Catatan:** Ini adalah ringkasan ringkas. Tab `Pelanggan` dan `Karyawan` tetap berisi detail penuh. Informasi di sini tidak perlu sebanyak di kedua tab tersebut.

**Desain:** Gunakan `Card` component. Masing-masing kolom berisi info rows: label di atas, value di bawah atau label di kiri + value di kanan, konsisten dengan pola UI existing.

---

#### [NEW] `OverviewNotes.tsx`

**Props:** `{ order: Order }`

**Tampilkan (hanya jika ada konten):**
- `specialInstructions` sebagai daftar chip/tag (array — gunakan `.map()` → `<Badge>`)
- `internalNotes` dengan label "Catatan Internal" — bedakan visual (background lebih gelap atau border berbeda)
- `notes` dengan label "Catatan Customer"
- Catatan panjang harus `break-words` dan tidak merusak layout
- Jika tidak ada catatan apapun: section tidak dirender (`return null`)

**Desain:** Gunakan `Card` component. Section catatan internal dibedakan dengan `var(--color-warning-50)` atau `var(--color-gray-50)` background. Special instructions sebagai chip menggunakan `Badge` component.

---

#### [NEW] `OverviewRecentActivity.tsx`

**Props:** `{ order: Order; onNavigateTab: (index: number) => void }`

**Tampilkan:**
- Gabungkan dan urutkan aktivitas dari dua sumber berdasarkan waktu terbaru:
  - `order.orderStatusHistories`: label = status change, actor = employee, waktu = `createdAt`
  - `order.orderPaymentLogs`: label = pembayaran, actor = employee, waktu = `createdAt`, amount
- Tampilkan maksimal **5 aktivitas terbaru**
- Setiap aktivitas: ikon (status change atau payment), label, waktu relatif (gunakan `dayjs().fromNow()` atau formatted backend), actor name jika ada
- Jika tidak ada aktivitas: empty state ringkas
- Link "Lihat Riwayat Status Lengkap" → `onNavigateTab(3)`
- Link "Lihat Riwayat Pembayaran" → `onNavigateTab(2)`

**Desain:** Gunakan `Card` component. Timeline vertikal sederhana dengan garis koneksi antar item atau daftar stacked ringan. Gunakan `Clock`/`DollarSign`/`Activity` icon dari lucide-react.

---

### Fase 4 — Rekonstruksi `OrderOverview.tsx`

---

#### [MODIFY/REPLACE] `resources/js/Pages/Dashboard/Orders/Partials/OrderOverview.tsx`

File lama (640 baris) dihapus dan diganti dengan container baru yang clean:

**Props:** `{ order: Order; onNavigateTab: (index: number) => void }`

**Struktur render:**

```tsx
// Layout struktur — bukan kode final
<div className="space-y-5">
    {/* Baris 1: Hero KPI Strip */}
    <OverviewHeroSummary order={order} />

    {/* Baris 2: Grid Utama lg:grid-cols-3 */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Kolom Kiri lg:col-span-2 */}
        <div className="lg:col-span-2 space-y-5">
            <OverviewFinancialSummary order={order} onNavigateTab={onNavigateTab} />
            <OverviewProductionSummary order={order} onNavigateTab={onNavigateTab} />
        </div>

        {/* Kolom Kanan lg:col-span-1 */}
        <div className="space-y-5">
            <OverviewNextAction order={order} onNavigateTab={onNavigateTab} />
            <OverviewFulfillment order={order} />
            <OverviewParties order={order} onNavigateTab={onNavigateTab} />
        </div>
    </div>

    {/* Baris 3: Bottom Section */}
    <OverviewNotes order={order} />
    <OverviewRecentActivity order={order} onNavigateTab={onNavigateTab} />
</div>
```

**Urutan mobile (stack vertikal):**
1. OverviewHeroSummary
2. OverviewNextAction
3. OverviewFinancialSummary
4. OverviewProductionSummary
5. OverviewFulfillment
6. OverviewParties
7. OverviewNotes
8. OverviewRecentActivity

---

### Fase 5 — Modifikasi `Show.tsx`

---

#### [MODIFY] `resources/js/Pages/Dashboard/Orders/Show.tsx`

**Perubahan:**
- Pass `onNavigateTab={setActiveTab}` ke `<OrderOverview>`.

```tsx
// Sebelum
<OrderOverview order={order} />

// Sesudah
<OrderOverview order={order} onNavigateTab={setActiveTab} />
```

Tidak ada perubahan lain di `Show.tsx`.

---

## 6. File yang Diubah — Ringkasan

### Backend

| File | Aksi | Keterangan |
|------|------|-----------|
| `app/Http/Controllers/Web/OrderController.php` | MODIFY | Tambah `'outlet'` dan `'customerAddress'` ke eager load `show` |

### Frontend — Types

| File | Aksi | Keterangan |
|------|------|-----------|
| `resources/js/types/order.ts` | MODIFY | Tambah field yang gap dari `OrderResource`, tambah interface `OrderReview` dan `CustomerAddress` |

### Frontend — Utilities

| File | Aksi | Keterangan |
|------|------|-----------|
| `resources/js/Pages/Dashboard/Orders/utils/orderOverviewUtils.ts` | NEW | Pure functions `resolveNextAction` dan `resolveOrderAlerts` |

### Frontend — Partials Baru

| File | Aksi | Keterangan |
|------|------|-----------|
| `resources/js/Pages/Dashboard/Orders/Partials/OverviewHeroSummary.tsx` | NEW | FR-01: KPI strip status utama |
| `resources/js/Pages/Dashboard/Orders/Partials/OverviewNextAction.tsx` | NEW | FR-02 + FR-11: next action + risk alerts |
| `resources/js/Pages/Dashboard/Orders/Partials/OverviewFinancialSummary.tsx` | NEW | FR-03 + FR-04: payment summary + breakdown keuangan |
| `resources/js/Pages/Dashboard/Orders/Partials/OverviewProductionSummary.tsx` | NEW | FR-05 + FR-06: production progress + item summary |
| `resources/js/Pages/Dashboard/Orders/Partials/OverviewFulfillment.tsx` | NEW | FR-07: pickup/delivery readiness |
| `resources/js/Pages/Dashboard/Orders/Partials/OverviewParties.tsx` | NEW | FR-08: customer + employee + outlet ringkas |
| `resources/js/Pages/Dashboard/Orders/Partials/OverviewNotes.tsx` | NEW | FR-09: catatan + instruksi khusus |
| `resources/js/Pages/Dashboard/Orders/Partials/OverviewRecentActivity.tsx` | NEW | FR-10: aktivitas terbaru gabungan |

### Frontend — Partials Dimodifikasi

| File | Aksi | Keterangan |
|------|------|-----------|
| `resources/js/Pages/Dashboard/Orders/Partials/OrderOverview.tsx` | REPLACE | Container baru yang mendelegasikan ke sub-Partials di atas |
| `resources/js/Pages/Dashboard/Orders/Show.tsx` | MODIFY | Tambah prop `onNavigateTab` ke `<OrderOverview>` |

---

## 7. Hal yang Tidak Boleh Dilakukan

1. Jangan memindahkan atau mengubah tab `Items`, `Pembayaran`, `Riwayat Status`, `Pelanggan`, `Karyawan`, atau `Pengaturan`.
2. Jangan membuat route baru hanya untuk pindah tab.
3. Jangan membuat duplikasi penuh dari tab detail di overview — cukup summary dan link.
4. Jangan hardcode warna hex atau Tailwind color class (`blue-500`, `red-600`, dsb.) — gunakan `var(--color-*)`.
5. Jangan menghitung business rule kompleks di frontend jika rule tersebut harus konsisten dengan backend (misalnya jangan hitung ulang `canPay` — gunakan field dari `OrderResource`).
6. Jangan mengabaikan `null` check — data customer, employee, outlet, address, notes, dan payment logs bisa null/undefined.
7. Jangan membuat nested Card (Card di dalam Card) yang membuat tampilan berat.
8. Jangan menambahkan comment kode yang tidak diperlukan.
9. Jangan membuat komponen baru di `resources/js/Components` kecuali komponen tersebut benar-benar reusable lintas halaman.
10. Jangan mengabaikan urutan mobile — mobile harus stack vertikal dengan urutan prioritas yang benar.

---

## 8. Verification Plan

### Automated

```bash
# TypeScript compile check (pastikan tidak ada type error)
npm run build

# atau jika menggunakan type check terpisah
npx tsc --noEmit
```

### Manual

1. Buka halaman detail order dengan berbagai kondisi:
   - Order baru, belum dibayar, belum ada item → cek empty state dan next action
   - Order `in_progress`, partial payment → cek production summary dan payment summary
   - Order `ready`, belum lunas, delivery type `pickup` → cek fulfillment warning dan next action
   - Order `completed`, fully paid → cek state "Tidak ada tindakan mendesak"
   - Order dengan `specialInstructions` berisi array multiple string → cek chips tampil benar
2. Verifikasi layout di desktop (≥1024px) menampilkan grid dua kolom.
3. Verifikasi layout di mobile (<768px) menampilkan stack vertikal dengan urutan prioritas.
4. Verifikasi tab navigation (onNavigateTab) berfungsi dari setiap CTA di overview.
5. Verifikasi tidak ada perubahan di tab lain (`Items`, `Pembayaran`, dll).
6. Verifikasi tidak ada hardcode warna yang tidak menggunakan token theme.

---

## 9. Catatan Tambahan

- `commissionLogs: ReferralLog[]` ada di type frontend tapi tidak ada di `OrderResource.toArray()`. Jangan hapus field ini dari type — kemungkinan dikirim via relasi lain. Pastikan tidak ada yang break karena field ini tidak dipakai di overview baru.
- `OrderSettings.tsx` sangat kecil (898 bytes) dan kemungkinan placeholder. Tidak perlu diubah dalam scope ini.
- Gunakan `dayjs` yang sudah tersedia di codebase untuk format waktu relatif jika formatted backend tidak tersedia untuk suatu field.
- Jika `OrderResource` mengirim `outlet` via relasi tapi tidak ada di type, pastikan interface `Outlet` sudah atau dibuat di `resources/js/types/`.
