# Implementation Plan: Owner Dashboard Control Center

Tanggal: 2026-06-22  
Referensi User Need: `docs/user_need/owner_dashboard_screen_improvement_user_need.md`

---

## 1. Tujuan

Mengubah dashboard utama owner di `/dashboard` dari halaman ringkasan statis menjadi **control center bisnis laundry lintas outlet** yang actionable. Owner harus dapat membuka dashboard dan dalam beberapa detik memahami kondisi bisnis dari atas ke bawah: uang masuk, order aktif, masalah yang butuh tindakan, keuangan, performa outlet, pelanggan, dan HR/payroll.

---

## 2. Keputusan Teknis yang Diambil dalam Plan Ini

Bagian ini menetapkan keputusan-keputusan yang sebelumnya terbuka di dokumen user need.

### 2.1 Definisi Revenue

| KPI | Sumber Data | Keterangan |
|---|---|---|
| `todayRevenue` | `SUM(paid_amount)` pada order dengan `payment_status IN (paid, cod, paid_by_package)` dan `order_date` = hari ini | Uang yang benar-benar masuk hari ini |
| `periodRevenue` | `SUM(total_amount)` pada order dengan `status IN (completed, delivered)` dalam periode | Konsisten dengan dashboard existing (`User::totalRevenue`) |

### 2.2 Definisi Active Order (Non-Terminal)

Order dianggap **aktif** jika statusnya **bukan**:
- `completed`
- `delivered`
- `cancelled`
- `rejected`

Status aktif yang dihitung: `requested`, `pending_dropoff`, `accepted`, `picking_up`, `picked_up`, `received`, `weighing`, `ready_to_process`, `in_progress`, `ready`, `delivering`.

### 2.3 Definisi Delayed / Stale Order

Order dianggap **delayed** jika salah satu kondisi berikut terpenuhi:
1. Memiliki `estimated_completion` dan sudah melewatinya (`estimated_completion < NOW()`).
2. Status aktif tetapi `updated_at` tidak berubah lebih dari **4 jam** (default, dapat dikonfigurasi lewat env `DASHBOARD_STALE_ORDER_HOURS=4`).

### 2.4 Definisi Repeat Customer (Periode)

Customer dianggap **repeat** pada periode tertentu jika memiliki **≥ 2 order** dengan status non-terminal-negatif (`completed` atau `delivered`) dalam periode tersebut.

### 2.5 Definisi Inactive Customer

Customer dianggap **inactive** jika tidak memiliki order apapun dalam **90 hari terakhir**.

### 2.6 Sumber Data Expense untuk Trend

Sumber expense untuk grafik revenue vs expense adalah tabel `expenses` dengan `status = 'approved'` (field `date` pada expense). Ini lebih sederhana dan konsisten karena `ProfitLossService` sudah menggunakan journal entries yang mungkin belum sinkron sempurna.

### 2.7 Profit/Loss Summary

`ProfitLossService::getReport()` membutuhkan `outletId` tertentu. Untuk dashboard "Semua Outlet":
- Profit/loss **tidak tersedia** jika owner memilih filter "Semua Outlet".
- Tampilkan **empty state** yang jelas: *"Pilih satu outlet untuk melihat laba/rugi."*
- Jika filter outlet dipilih, panggil `ProfitLossService::getReport()` untuk outlet tersebut.

### 2.8 Package / Membership Expiring Soon

- Customer subscription dianggap **hampir expired** jika `expired_date <= NOW() + 30 hari` dan status masih aktif.
- Membership contract dianggap **hampir expired** jika `expired_at <= NOW() + 30 hari` dan `status = 'active'`.

### 2.9 Cache TTL per Section

| Section | Cache Key Pattern | TTL |
|---|---|---|
| KPI (today) | `users:{id}:dashboard:kpis:{period}:{outletId}` | **60 detik** |
| Action Center | `users:{id}:dashboard:action_center:{outletId}` | **60 detik** |
| Finance Trend | `users:{id}:dashboard:finance_trend:{period}:{outletId}` | **300 detik** |
| Outlet Ranking | `users:{id}:dashboard:outlet_ranking:{period}:{outletId}` | **180 detik** |
| Customer Summary | `users:{id}:dashboard:customer_summary:{period}:{outletId}` | **300 detik** |
| Membership Summary | `users:{id}:dashboard:membership_summary:{outletId}` | **300 detik** |
| HR/Payroll Summary | `users:{id}:dashboard:hr_payroll:{outletId}` | **300 detik** |
| Activity Feed | `users:{id}:dashboard:activity_feed:{outletId}` | **60 detik** |
| Money Summary | `users:{id}:dashboard:money_summary` | **60 detik** |

### 2.10 Filter dan Partial Reload

Filter periode dan outlet menggunakan **Inertia partial reload** (`router.reload({ data: { period, outlet_id }, only: ['dashboard'] })`). Tidak menggunakan full page reload. Backend menerima query parameter `?period=today&outlet_id=null`.

### 2.11 Backward Compatibility

- Payload lama (`quickMetrics`, `revenueOvertime`, `assetSummary`, `recentCoinTransactions`, `recentOrders`) **dihapus** dari `DashboardController::index()`.
- Payload baru (`dashboard`) dikirim sebagai satu prop tunggal.
- Komponen lama di `resources/js/Pages/Dashboard/Partials/` tetap ada tetapi tidak lagi dirender oleh `Index.tsx` (diganti komponen baru). File lama dapat dihapus setelah komponen baru selesai.

### 2.12 Service Architecture

Buat service baru `OwnerDashboardService` yang **tidak mewarisi** `DashboardService`. `DashboardService` existing tetap ada untuk `showAsset` route. `OwnerDashboardService` mengorkestrasi semua section dan di-inject ke `DashboardController`.

### 2.13 Lazy Loading Section Berat

Section berikut **di-lazy load** menggunakan `Suspense` di frontend:
- `RevenueExpenseTrend` (chart berat)
- `OutletPerformance`
- `CustomerMembership`
- `HrPayroll`
- `ActivityFeed`

Section yang di-render langsung (critical path):
- `DashboardHeader` (filter)
- `MoneySummary`
- `KpiGrid`
- `ActionCenter`
- `OrderFunnel`

---

## 3. Mapping Status Order ke Stage Funnel Bisnis

| Stage Bisnis | Label UI | Status Teknis (Order) |
|---|---|---|
| `waiting` | Menunggu | `requested`, `pending_dropoff` |
| `pickup` | Pickup/Dropoff | `accepted`, `picking_up`, `picked_up` |
| `received` | Diterima | `received` |
| `weighing` | Ditimbang | `weighing`, `ready_to_process` |
| `processing` | Proses | `in_progress` |
| `ready` | Siap | `ready` |
| `delivery` | Delivery | `delivering` |
| `done` | Selesai | `completed`, `delivered` |
| `cancelled` | Batal/Ditolak | `cancelled`, `rejected` |

---

## 4. Database Indexes yang Direkomendasikan

Tambahkan migration untuk index berikut jika belum ada. Cek dengan `SHOW INDEX FROM table_name` sebelum menambahkan.

```sql
-- orders
CREATE INDEX IF NOT EXISTS idx_orders_owner_outlet_date ON orders (outlet_id, order_date, status, payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_owner_status ON orders (status, updated_at);
CREATE INDEX IF NOT EXISTS idx_orders_estimated_completion ON orders (estimated_completion, status);

-- expenses
CREATE INDEX IF NOT EXISTS idx_expenses_outlet_date_status ON expenses (outlet_id, date, status);

-- deposits
CREATE INDEX IF NOT EXISTS idx_deposits_outlet_status ON deposits (outlet_id, status);

-- petty_cashes
CREATE INDEX IF NOT EXISTS idx_petty_cashes_outlet_status ON petty_cashes (outlet_id, status);

-- wallet_withdrawals
CREATE INDEX IF NOT EXISTS idx_wallet_withdrawals_user_status ON wallet_withdrawals (user_id, status);

-- payrolls
CREATE INDEX IF NOT EXISTS idx_payrolls_outlet_month_year ON payrolls (outlet_id, month, year, status);

-- customer_subscriptions
CREATE INDEX IF NOT EXISTS idx_customer_subscriptions_status_expired ON customer_subscriptions (status, expired_date);

-- membership_contracts
CREATE INDEX IF NOT EXISTS idx_membership_contracts_status_expired ON membership_contracts (status, expired_at);
```

---

## 5. Proposed Changes

---

### Backend Layer

---

#### [NEW] `app/Services/OwnerDashboardService.php`

Service utama yang mengorkestrasi semua data dashboard. Setiap method berdiri sendiri dan menggunakan cache terpisah.

**Method yang perlu dibuat:**

```php
class OwnerDashboardService extends BaseService
{
    public function buildPayload(int $ownerId, string $period, ?int $outletId): array;

    private function buildMeta(string $period, ?int $outletId, string $timezone): array;
    private function resolveOutletIds(int $ownerId, ?int $outletId): array;
    private function resolveDateRange(string $period, string $timezone): array; // returns [$startDate, $endDate, $today]
    private function validatePeriod(string $period): string; // accepted: today, 7d, 30d, 90d

    public function buildKpis(int $ownerId, array $outletIds, string $period, Carbon $startDate, Carbon $endDate, Carbon $today): array;
    public function buildMoneySummary(int $ownerId, array $outletIds): array;
    public function buildActionCenter(int $ownerId, array $outletIds): array;
    public function buildOperations(int $ownerId, array $outletIds, Carbon $startDate, Carbon $endDate): array;
    public function buildFinance(int $ownerId, array $outletIds, Carbon $startDate, Carbon $endDate): array;
    public function buildOutletSummary(int $ownerId, array $outletIds, Carbon $startDate, Carbon $endDate): array;
    public function buildCustomerSummary(int $ownerId, array $outletIds, Carbon $startDate, Carbon $endDate): array;
    public function buildMembershipSummary(int $ownerId, array $outletIds): array;
    public function buildHrPayrollSummary(int $ownerId, array $outletIds): array;
    public function buildActivityFeed(int $ownerId, array $outletIds, int $limit = 20): array;
    public function buildSetupChecklist(int $ownerId): ?array; // null jika sudah setup
}
```

**Detail implementasi `buildKpis`:**
```php
// todayRevenue: SUM(paid_amount) WHERE payment_status IN ('paid','cod','paid_by_package') AND DATE(order_date) = today AND outlet_id IN outletIds
// todayOrdersCount: COUNT(*) WHERE DATE(order_date) = today AND outlet_id IN outletIds
// activeOrdersCount: COUNT(*) WHERE status NOT IN terminal statuses AND outlet_id IN outletIds
// unpaidOrdersCount: COUNT(*) WHERE payment_status IN ('unpaid','partial','not_yet_priced') AND outlet_id IN outletIds (semua waktu, bukan hanya hari ini)
// outstandingAmount: SUM(remaining_amount) WHERE payment_status IN ('unpaid','partial') AND outlet_id IN outletIds
// periodRevenue: SUM(total_amount) WHERE status IN ('completed','delivered') AND order_date BETWEEN startDate AND endDate AND outlet_id IN outletIds
// periodExpense: SUM(amount) WHERE status='approved' AND date BETWEEN startDate AND endDate AND outlet_id IN outletIds (dari tabel expenses)
// periodNetProfit: nullable, hanya jika outletId tertentu, dari ProfitLossService
// periodOrdersCount: COUNT(*) WHERE order_date BETWEEN startDate AND endDate AND outlet_id IN outletIds
// newCustomersCount: COUNT distinct customer_id pada order pertama mereka yang jatuh dalam periode
// pendingApprovalsCount: jumlah total pending expense + deposit + petty_cash + withdrawal
```

**Detail implementasi `buildActionCenter`:**
```php
// Menghasilkan array OwnerDashboardActionItem, diurutkan: critical dulu, lalu warning, lalu info
// Items yang diperiksa:
// 1. order_new_requests: requested orders COUNT → severity: critical jika > 0
// 2. order_delayed: delayed orders COUNT → severity: critical jika > 0
// 3. order_unpaid_large: unpaid/partial total outstanding → severity: warning
// 4. expense_pending: expenses pending COUNT + amount → severity: warning
// 5. deposit_pending: deposits pending COUNT + amount → severity: warning
// 6. petty_cash_pending: petty_cashes pending COUNT + amount → severity: warning
// 7. withdrawal_pending: wallet_withdrawals pending/processing → severity: info
// 8. outlet_no_service: outlet tanpa laundry_service aktif → severity: critical
// 9. outlet_no_schedule: outlet tanpa operational_days → severity: warning
// 10. outlet_expired_feature: outlet_features expired → severity: critical
// 11. subscription_expiring: customer_subscriptions hampir expired → severity: info
// 12. payroll_unprocessed: bulan berjalan belum ada payroll (estimasi dari employee aktif) → severity: info
```

**Detail implementasi `buildMoneySummary`:**
```php
// Memanggil WalletBalanceService::getStats($ownerId) untuk walletBalance, availableBalance, pendingWdrTotal
// Membaca coinBalance dari user->coinBalance
// Memanggil DashboardService::assetSummary() yang sudah ada (reuse)
// Return: { walletBalance, availableWalletBalance, pendingWithdrawalAmount, coinBalance, assetSummary[] }
```

**Detail implementasi `buildOperations`:**
```php
// orderFunnel: GROUP BY status dari semua active orders, mapping ke stage bisnis
// recentActiveOrders: 10 order terbaru yang aktif (non-terminal), dengan select minimal
//   fields: id, order_number, outlet.name, customer.name, status, payment_status, total_amount, remaining_amount, order_date, estimated_completion, created_at
// delayedOrders: order aktif yang melewati estimated_completion atau stale > 4 jam
//   fields: id, order_number, outlet.name, status, age_minutes (diff dari updated_at ke now), estimated_completion
```

**Detail implementasi `buildFinance`:**
```php
// revenueExpenseTrend: array per hari dalam periode
//   revenue: SUM(total_amount) completed/delivered per hari
//   expense: SUM(amount) approved expenses per hari
//   net: revenue - expense
//   Isi 0 untuk hari tanpa transaksi (generate date range terlebih dahulu)
// paymentHealth: GROUP BY payment_status
//   fields: paymentStatus, label, ordersCount, totalAmount, paidAmount, remainingAmount
//   scope: semua order dalam periode (bukan hanya completed)
// withdrawalSummary: dari WalletWithdrawal
//   pendingCount, processingCount, paidCount (dalam periode), pendingAmount, paidAmount (dalam periode)
```

**Detail implementasi `buildOutletSummary`:**
```php
// Loop semua outlet owner, per outlet hitung:
//   revenue: SUM(total_amount) completed/delivered dalam periode
//   ordersCount: COUNT dalam periode
//   activeOrdersCount: COUNT non-terminal
//   outstandingAmount: SUM(remaining_amount) unpaid/partial
//   delayedOrdersCount: COUNT delayed
//   readinessStatus: ok/warning/critical (cek jam kerja, layanan, karyawan, feature status)
// riskyOutlets: outlet dengan readinessStatus != ok, reasons array
//   reasons: ['Tidak ada layanan aktif', 'Tidak ada jam kerja', 'Fitur expired', 'Tidak ada karyawan aktif']
```

**Detail implementasi `buildCustomerSummary`:**
```php
// totalCustomers: COUNT customers dari outlet owner
// newCustomersCount: customers yang order pertama mereka dalam periode ini
// repeatCustomersCount: customers dengan >= 2 completed/delivered order dalam periode
// inactiveCustomersCount: customers tanpa order dalam 90 hari terakhir
// topCustomers: top 5 customers berdasarkan SUM(total_amount) completed/delivered dalam periode
//   fields: id, name, ordersCount, totalSpent
```

**Detail implementasi `buildMembershipSummary`:**
```php
// activeSubscriptionsCount: COUNT customer_subscriptions aktif (quota > 0 atau belum expired)
// expiringSubscriptionsCount: COUNT yang expired_date <= today + 30 hari
// activeMembershipContractsCount: COUNT membership_contracts status = 'active'
// expiringMembershipContractsCount: COUNT yang expired_at <= today + 30 hari AND status = 'active'
// topPackages: top 5 service_packages berdasarkan jumlah customer_subscriptions
//   fields: id, name, soldCount, revenue (SUM dari order items paid_by_package)
```

**Detail implementasi `buildHrPayrollSummary`:**
```php
// activeEmployeesCount: COUNT employees aktif milik owner
// payrollPaidAmount: SUM(net_salary) dari payrolls bulan berjalan yang status = 'paid'
// payrollPaidCount: COUNT payrolls bulan berjalan status = 'paid'
// unpaidCommissionAmount: SUM(commission_amount) dari work_logs yang belum masuk payroll (is_paid = false atau similar)
// activeLoanAmount: SUM(remaining_balance) dari loans aktif karyawan owner
// fineDeductionAmount: SUM(amount) dari fine_logs bulan berjalan yang belum diproses payroll
```

**Detail implementasi `buildActivityFeed`:**
```php
// Gabungkan dari beberapa sumber, limit total 20 item, sorted by timestamp desc:
// - 5 order terbaru (order_number, status, customer_name)
// - 5 wallet_transactions terbaru (type, amount, description)
// - 3 wallet_withdrawals terbaru (status, requested_amount)
// - 3 expense/deposit/petty_cash approvals terbaru
// - 4 coin transactions terbaru
// Setiap item: { id, type, title, description, timestamp, href? }
```

**Detail implementasi `buildSetupChecklist`:**
```php
// Return null jika owner sudah punya outlet aktif dengan setup lengkap
// Return array checklist jika owner baru/belum setup:
// - create_outlet: apakah ada outlet?
// - set_schedule: apakah ada operational_days?
// - add_service: apakah ada laundry_service aktif?
// - add_employee: apakah ada employee aktif?
// - add_customer: apakah ada customer?
// - set_bank_account: apakah ada owner_bank_account?
// - activate_feature: apakah ada outlet_feature aktif?
```

---

#### [MODIFY] `app/Http/Controllers/Web/DashboardController.php`

```php
// Tambahkan dependency OwnerDashboardService
// Ubah method index() menjadi:

public function index(Request $request): Response
{
    $user = Auth::user();
    $period = $request->query('period', 'today'); // today, 7d, 30d, 90d
    $outletId = $request->query('outlet_id') ? (int) $request->query('outlet_id') : null;

    $dashboard = $this->ownerDashboardService->buildPayload($user->id, $period, $outletId);

    return Inertia::render('Dashboard/Index', [
        'dashboard' => $dashboard,
        'outlets'   => // list outlet milik owner (id, name) untuk dropdown filter
    ]);
}

// Method showAsset tetap tidak berubah (masih pakai DashboardService)
```

---

#### [NEW] `database/migrations/xxxx_add_dashboard_indexes.php`

Migration untuk menambahkan database indexes yang belum ada (lihat Section 4). Gunakan `Schema::hasIndex()` check sebelum menambahkan agar idempotent.

---

### Frontend Layer

---

#### [MODIFY] `resources/js/Pages/Dashboard/types.ts`

Hapus semua type lama dan ganti dengan type baru yang merepresentasikan `OwnerDashboardPayload`. Tambahkan juga type untuk filter dan props outlet.

```ts
// Hapus: DashboardFilters, QuickMetricsData, QuickMetric, DashboardProps (lama)
// Tetap ada: AssetSummaryItem, TransactionalAccount, AssetShowProps (untuk AssetShow.tsx)

// Tambahkan type baru:
export type DashboardPeriod = 'today' | '7d' | '30d' | '90d';

export interface OwnerDashboardMeta { ... }
export interface OwnerDashboardFilters { ... }
export interface OwnerDashboardKpis { ... }
export interface OwnerDashboardMoneySummary { ... }
export interface OwnerDashboardActionItem { ... }
export interface OwnerDashboardOperations { ... }
export interface OwnerDashboardFinance { ... }
export interface OwnerDashboardOutletSummary { ... }
export interface OwnerDashboardCustomerSummary { ... }
export interface OwnerDashboardMembershipSummary { ... }
export interface OwnerDashboardHrPayrollSummary { ... }
export interface OwnerDashboardActivityItem { ... }
export interface OwnerDashboardSetupItem { ... }

export interface OwnerDashboardPayload {
    meta: OwnerDashboardMeta;
    filters: OwnerDashboardFilters;
    kpis: OwnerDashboardKpis;
    money: OwnerDashboardMoneySummary;
    actionCenter: OwnerDashboardActionItem[];
    operations: OwnerDashboardOperations;
    finance: OwnerDashboardFinance;
    outlets: OwnerDashboardOutletSummary;
    customers: OwnerDashboardCustomerSummary;
    membership: OwnerDashboardMembershipSummary;
    hrPayroll: OwnerDashboardHrPayrollSummary;
    activityFeed: OwnerDashboardActivityItem[];
    setupChecklist?: OwnerDashboardSetupItem[];
}

export interface OutletOption {
    id: number;
    name: string;
}

export interface DashboardIndexProps {
    dashboard: OwnerDashboardPayload;
    outlets: OutletOption[];
}
```

---

#### [MODIFY] `resources/js/Pages/Dashboard/Index.tsx`

Komponen utama diubah total. Tidak lagi menggunakan prop lama. Layout baru menggunakan komponen-komponen baru.

```tsx
function Dashboard({ dashboard, outlets }: DashboardIndexProps) {
    const [period, setPeriod] = useState<DashboardPeriod>(dashboard.meta.period);
    const [outletId, setOutletId] = useState<number | null>(dashboard.filters.outletId);

    const handleFilterChange = (newPeriod: DashboardPeriod, newOutletId: number | null) => {
        router.reload({
            data: { period: newPeriod, outlet_id: newOutletId ?? '' },
            only: ['dashboard'],
            onSuccess: () => { /* update state */ }
        });
    };

    // Render:
    // 1. DashboardHeader (filter, quick actions)
    // 2. Jika setupChecklist ada → SetupChecklist (full page)
    // 3. Jika tidak:
    //    - MoneySummary
    //    - KpiGrid
    //    - ActionCenter
    //    - OrderFunnel
    //    - <Suspense> RevenueExpenseTrend
    //    - <Suspense> OutletPerformance
    //    - <Suspense> CustomerMembership
    //    - <Suspense> HrPayroll
    //    - <Suspense> ActivityFeed
}
```

---

#### [NEW] `resources/js/Pages/Dashboard/Partials/DashboardHeader.tsx`

Komponen header dashboard dengan:
- Sapaan + nama owner
- Timestamp data terakhir diperbarui (dari `dashboard.meta.generatedAt`)
- **Period filter**: Tabs/button group → `Hari ini`, `7 Hari`, `30 Hari`, `90 Hari`
- **Outlet filter**: Dropdown → `Semua Outlet`, list outlet dari prop `outlets`
- **Quick actions**: 4 button → `Buat Order`, `Tarik Saldo`, `Catat Pengeluaran`, `Lihat Laba Rugi`

---

#### [NEW] `resources/js/Pages/Dashboard/Partials/MoneySummary.tsx`

Komponen strip/card di bawah header yang menampilkan:
- **Saldo Pendapatan Tersedia** (`money.availableWalletBalance`) — paling dominan
- **Tertahan Withdrawal** (`money.pendingWithdrawalAmount`) — jika > 0
- **Saldo Coin** (`money.coinBalance`) — lebih kecil dari saldo pendapatan
- Link: `Dompet Pendapatan`, `Tarik Saldo`, `Topup Koin`
- Asset summary cards dari `money.assetSummary` (kas, bank, ewallet, other)

---

#### [NEW] `resources/js/Pages/Dashboard/Partials/KpiGrid.tsx`

Grid KPI dua baris:
- **Baris 1 (Primary KPI, 4 card):**
  - Pendapatan Hari Ini (`kpis.todayRevenue`)
  - Order Hari Ini (`kpis.todayOrdersCount`)
  - Order Aktif (`kpis.activeOrdersCount`) — clickable → `/dashboard/orders?status=active`
  - Belum Dibayar (`kpis.unpaidOrdersCount` + `kpis.outstandingAmount`)
- **Baris 2 (Secondary KPI, chip/compact, 4 item):**
  - Pendapatan Periode (`kpis.periodRevenue`)
  - Laba Bersih Periode (`kpis.periodNetProfit` — nullable, tampil hanya jika tidak null)
  - Customer Baru (`kpis.newCustomersCount`)
  - Pending Approval (`kpis.pendingApprovalsCount`)

---

#### [NEW] `resources/js/Pages/Dashboard/Partials/ActionCenter.tsx`

Section action center dengan:
- Header: "Perlu Tindakan"
- Jika `actionCenter` kosong: empty state hijau "Semua berjalan lancar 🎉"
- List items diurutkan critical → warning → info
- Setiap item: badge severity, title, count/amount, message, tombol action (link ke route)
- Color coding: critical = merah, warning = kuning, info = biru

---

#### [NEW] `resources/js/Pages/Dashboard/Partials/OrderFunnel.tsx`

Section order funnel dengan:
- Horizontal bar atau card per stage (menggunakan mapping dari Section 3)
- Count per stage dari `operations.orderFunnel`
- Klik stage → link ke order list dengan filter status
- Sub-section "Order Bermasalah" dari `operations.delayedOrders` (tabel kecil, max 5)
- Sub-section "Order Aktif Terbaru" dari `operations.recentActiveOrders` (tabel, max 10)

---

#### [NEW] `resources/js/Pages/Dashboard/Partials/RevenueExpenseTrend.tsx`

*(Lazy loaded dengan Suspense)*

Section keuangan dengan dua sub-section:
- **Chart Revenue vs Expense**: Line chart dual axis menggunakan `recharts` (AreaChart atau LineChart)
  - Data dari `finance.revenueExpenseTrend`
  - 3 series: revenue (hijau), expense (merah), net (biru)
- **Payment Health**: Horizontal bar atau pill list dari `finance.paymentHealth`
  - Setiap status: label, count, amount, remaining
- **Wallet & Withdrawal Summary**: Card dari `finance.withdrawalSummary`
  - Pending withdrawal count + amount
  - Link ke halaman withdrawal

---

#### [NEW] `resources/js/Pages/Dashboard/Partials/OutletPerformance.tsx`

*(Lazy loaded dengan Suspense)*

Section performa outlet dengan:
- **Outlet Ranking**: Table/list `outlets.topOutlets`, sorted by revenue
  - Columns: Outlet, Revenue, Orders, Active Orders, Outstanding, Status
  - Status badge: ok (hijau), warning (kuning), critical (merah)
  - Klik nama outlet → `/dashboard/outlets/{id}` (outlet detail)
- **Risky Outlets**: Kartu atau list `outlets.riskyOutlets` jika ada
  - Tampilkan reasons dan action button

---

#### [NEW] `resources/js/Pages/Dashboard/Partials/CustomerMembership.tsx`

*(Lazy loaded dengan Suspense)*

Section customer dan membership dalam satu komponen dua kolom:
- **Kolom kiri - Customer Summary:**
  - Total, baru, repeat, tidak aktif dari `customers`
  - Top 5 customers (`customers.topCustomers`)
- **Kolom kanan - Membership/Package Summary:**
  - Subscription aktif, hampir expired dari `membership`
  - Membership contract aktif, hampir expired
  - Top packages/plans

---

#### [NEW] `resources/js/Pages/Dashboard/Partials/HrPayroll.tsx`

*(Lazy loaded dengan Suspense)*

Section HR & Payroll:
- Employee aktif (`hrPayroll.activeEmployeesCount`)
- Payroll bulan berjalan (paid amount, count)
- Unpaid commission amount
- Active loan amount
- Fine deduction amount
- Link ke masing-masing halaman (payroll, loan, fine)

---

#### [NEW] `resources/js/Pages/Dashboard/Partials/ActivityFeed.tsx`

*(Lazy loaded dengan Suspense)*

Section activity feed:
- List 20 aktivitas terbaru dari `activityFeed`
- Icon per type (order, payment, wallet, coin, dll)
- Timestamp relatif (misalnya "5 menit lalu")
- Link ke detail jika ada `href`

---

#### [NEW] `resources/js/Pages/Dashboard/Partials/SetupChecklist.tsx`

Komponen yang ditampilkan jika `setupChecklist` tidak null (owner baru):
- Judul: "Selesaikan Setup Bisnis Anda"
- List checklist dengan status done/pending
- Setiap item pending: action button dengan link

---

#### [DELETE] File Lama (setelah komponen baru selesai)

File berikut dapat dihapus setelah `Index.tsx` tidak lagi menggunakannya:
- `resources/js/Pages/Dashboard/Partials/Welcome.tsx`
- `resources/js/Pages/Dashboard/Partials/QuickMetrics.tsx`
- `resources/js/Pages/Dashboard/Partials/RevenueOvertime.tsx`
- `resources/js/Pages/Dashboard/Partials/RecentCoinTransactions.tsx`
- `resources/js/Pages/Dashboard/Partials/LastOrder.tsx`
- `resources/js/Pages/Dashboard/Partials/types.ts` (diganti types.ts di parent)

---

## 6. Urutan Pengerjaan yang Disarankan

Kerjakan dalam urutan berikut untuk memastikan tidak ada breaking change di tengah jalan:

```
Phase 1 - Backend Service:
  1. Buat OwnerDashboardService dengan semua method skeleton (return data dummy/static)
  2. Modifikasi DashboardController::index() untuk pakai OwnerDashboardService
  3. Buat migration database indexes
  4. Implementasi method satu per satu mulai dari buildKpis, buildMoneySummary, buildActionCenter
  5. Implementasi buildOperations, buildFinance
  6. Implementasi buildOutletSummary, buildCustomerSummary, buildMembershipSummary, buildHrPayrollSummary
  7. Implementasi buildActivityFeed, buildSetupChecklist

Phase 2 - Frontend Types & Layout:
  8. Update types.ts dengan semua type baru
  9. Update Index.tsx dengan layout baru dan Suspense
  10. Buat DashboardHeader.tsx dengan filter logic (Inertia partial reload)

Phase 3 - Critical Path Components:
  11. Buat MoneySummary.tsx
  12. Buat KpiGrid.tsx
  13. Buat ActionCenter.tsx
  14. Buat OrderFunnel.tsx

Phase 4 - Lazy Loaded Components:
  15. Buat RevenueExpenseTrend.tsx
  16. Buat OutletPerformance.tsx
  17. Buat CustomerMembership.tsx
  18. Buat HrPayroll.tsx
  19. Buat ActivityFeed.tsx
  20. Buat SetupChecklist.tsx

Phase 5 - Cleanup:
  21. Hapus komponen lama jika sudah tidak dipakai
  22. Verifikasi semua route link di action center valid
```

---

## 7. Konvensi Kode

### Backend

- Semua method `build*` di `OwnerDashboardService` menggunakan cache (lihat Section 2.9).
- Cache di-flush jika data sensitif berubah (cukup natural TTL, tidak perlu manual flush).
- Semua query **wajib** menggunakan `whereIn('outlet_id', $outletIds)` atau `byOwnerId($ownerId)` scope untuk keamanan multi-tenant.
- Field uang dikirim sebagai `float` (bukan string). Format dilakukan di frontend menggunakan `formatCurrency()` yang sudah ada.
- Gunakan `DB::select()` atau `Eloquent` dengan `select()` minimal untuk query agregasi — jangan load seluruh model.
- Gunakan `Carbon` untuk semua operasi tanggal dengan timezone dari outlet atau default `Asia/Jakarta`.

### Frontend

- Semua komponen baru menggunakan CSS variable dari design system existing (`var(--color-*)`) — tidak hardcode warna.
- Setiap komponen baru diletakkan di `resources/js/Pages/Dashboard/Partials/`.
- Gunakan `formatCurrency()` dari `@/lib/utils` untuk semua angka uang.
- Gunakan `lucide-react` untuk semua icon (sudah terinstall).
- Gunakan `recharts` untuk semua chart (sudah terinstall).
- Skeleton loading menggunakan class `loading-skeleton` yang sudah ada (lihat `Index.tsx` existing).
- Semua link navigasi menggunakan `route()` helper dari `ziggy-js` atau href string route existing.

---

## 8. Route yang Digunakan di Action Center

Pastikan semua route berikut valid sebelum dipakai sebagai `actionHref`:

| Action Item | Target Route |
|---|---|
| Order menunggu | `/dashboard/orders?status=requested` |
| Order terlambat | `/dashboard/orders?status=active&delayed=1` |
| Expense pending | `/dashboard/expenses?status=pending` |
| Deposit pending | `/dashboard/deposits?status=pending` |
| Petty cash pending | `/dashboard/petty-cashes?status=pending` |
| Withdrawal pending | `/dashboard/wallet/withdrawals?status=pending` |
| Outlet tanpa layanan | `/dashboard/outlets/{id}` |
| Outlet expired feature | `/dashboard/outlets/{id}/features` |
| Subscription expiring | `/dashboard/customer-subscriptions?expiring=1` |
| Payroll bulan ini | `/dashboard/payrolls` |

> **Catatan:** Verifikasi route name menggunakan `php artisan route:list` sebelum implementasi. Sesuaikan jika nama route berbeda.

---

## 9. Acceptance Criteria Teknis

Selain acceptance criteria bisnis dari user need, verifikasi teknis berikut:

1. `php artisan route:list` — route `dashboard` masih ada dan tidak error.
2. `php artisan tinker` — `app(OwnerDashboardService::class)->buildPayload($userId, 'today', null)` tidak throw exception.
3. Dashboard load di browser tanpa console error JavaScript.
4. Filter periode berubah menggunakan partial reload (network tab tidak menunjukkan full page reload).
5. Filter outlet berubah dan data berubah sesuai outlet.
6. Action center menampilkan item jika ada data pending.
7. Action center menampilkan empty state jika tidak ada masalah.
8. Setup checklist muncul untuk akun owner yang belum punya outlet.
9. Semua link di action center mengarah ke halaman yang valid.
10. Chart revenue vs expense merender dengan data jika ada transaksi.

---

## 10. Catatan untuk AI yang Mengerjakan

1. **Baca `DashboardService.php` existing** sebelum membuat `OwnerDashboardService` untuk memahami pattern cache dan helper method.
2. **Baca `OutletOverviewService.php` existing** untuk referensi pattern aggregasi per outlet dan date range resolution.
3. **Baca `ProfitLossService.php` existing** sebelum mengintegrasikan profit/loss ke dashboard — perhatikan bahwa method memerlukan `outletId` wajib (bukan nullable).
4. **Baca `WalletBalanceService::getStats()`** untuk cara mengambil wallet balance dan pending withdrawal.
5. **Baca `BaseService.php`** untuk memahami helper `applyTenantScope()`, `resolveOwnerId()`, dan `paginate()`.
6. **Jangan** menghapus `DashboardController::showAsset()` dan route `dashboard.asset.show` — masih digunakan.
7. **Jangan** mengubah `AssetShow.tsx` dan `AssetSummary.tsx` (terkait showAsset).
8. **Gunakan Inertia partial reload** untuk filter — lihat dokumentasi `router.reload()` dengan `only` parameter.
9. **Pastikan scoping multi-tenant** di setiap query: selalu filter berdasarkan `outletIds` yang merupakan outlet milik owner login.
10. **Payload bisa besar** — pertimbangkan untuk tidak memasukkan seluruh detail objek. Gunakan select minimal dan resource ringkas.
