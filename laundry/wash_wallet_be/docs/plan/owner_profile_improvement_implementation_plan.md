# Implementation Plan: Owner Profile Improvement

Tanggal: 2026-05-29
Berdasarkan: `docs/user_need/owner_profile_improvement_user_need.md`

---

## Keputusan Teknis

| Item | Keputusan |
|---|---|
| Service approach | Perluas `ProfileService` yang sudah ada — tambah method `getFinanceSummary()`, `getReferralSummary()`, `getSetupChecklist()` |
| Available wallet balance | Diambil dari `WalletBalanceService::getStats($userId)` — sudah menghitung `pendingWdrTotal` |
| Rekening lama (`bank_account_name` dll) | Tidak digunakan di tampilan baru — digantikan sepenuhnya oleh `owner_bank_accounts` |
| Jumlah item terbaru | 3 withdrawal terbaru + 5 wallet transaction terbaru di tab Finance |
| Masking nomor rekening | Tampilkan hanya 4 digit terakhir, sisanya `****` — handle di layer service (PHP) |
| Checklist setup | Visual-only — tidak disimpan ke tabel baru, dihitung real-time dari data existing |
| Tab Referrals | Diaktifkan dan diisi dalam scope ini |
| Tab Finance | Diaktifkan dan diisi dalam scope ini |
| Struktur tab | Overview · Finance · Outlets · Referrals · Settings |
| Referral commission | Tetap pakai data existing `getTotalCommission()` + list 5 referral terbaru |

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

## Overview Perubahan

```
Backend (Laravel)
├── app/Services/
│   └── ProfileService.php        → [MODIFY] tambah getFinanceSummary(), getReferralSummary(), getSetupChecklist()
│
└── app/Http/Controllers/Web/
    └── ProfileController.php     → [MODIFY] tambah finance, referral, checklist ke index()

Frontend (React/Inertia)
├── resources/js/Pages/Dashboard/Profile/
│   ├── Index.tsx                 → [MODIFY] tambah tab Finance + Referrals
│   ├── types.ts                  → [MODIFY] tambah ProfileFinanceSummary, ProfileReferralSummary, ProfileSetupChecklist
│   │
│   ├── Finance/
│   │   ├── Index.tsx             → [CREATE] layout tab Finance
│   │   └── Partials/
│   │       ├── FinanceBalanceCard.tsx      → [CREATE] coin + wallet balance cards
│   │       ├── FinanceBankAccountsCard.tsx → [CREATE] daftar rekening dengan masking
│   │       ├── FinanceWithdrawalCard.tsx   → [CREATE] ringkasan + 3 withdrawal terbaru
│   │       └── FinanceTransactionCard.tsx  → [CREATE] 5 wallet transaction terbaru
│   │
│   ├── Referrals/
│   │   ├── Index.tsx             → [CREATE] layout tab Referrals
│   │   └── Partials/
│   │       ├── ReferralCodeCard.tsx        → [CREATE] kode referral + copy button
│   │       ├── ReferralStatsCard.tsx       → [CREATE] stat: total referral + total commission
│   │       └── ReferralListCard.tsx        → [CREATE] 5 referral terbaru
│   │
│   └── Partials/
│       ├── ProfileOverview.tsx   → [MODIFY] tambah SetupChecklist + QuickActions
│       ├── ProfileSidebar.tsx    → [MODIFY] tambah wallet_balance ke stat chip
│       ├── SetupChecklist.tsx    → [CREATE] checklist kelengkapan owner
│       └── QuickActionsCard.tsx  → [CREATE] quick action buttons
```

---

## Phase 1 — Backend: Perluas ProfileService

### Step 1.1 — [MODIFY] `app/Services/ProfileService.php`

Tambahkan dependency baru ke constructor:

```php
use App\Models\OwnerBankAccount;
use App\Models\WalletWithdrawal;
use App\Models\WalletTransaction;
use App\Services\WalletBalanceService;

public function __construct(
    protected User $user,
    protected Outlet $outlet,
    protected OwnerBankAccount $ownerBankAccount,
    protected WalletWithdrawal $walletWithdrawal,
    protected WalletTransaction $walletTransaction,
    protected WalletBalanceService $walletBalanceService,
) {}
```

Tambahkan private helper untuk masking:

```php
private function maskAccountNumber(string $number): string
{
    $len = strlen($number);
    if ($len <= 4) return $number;
    return str_repeat('*', $len - 4) . substr($number, -4);
}
```

#### Method `getFinanceSummary(): array`

Return:
- `walletBalance` — dari `$user->wallet_balance`
- `coinBalance` — dari `$user->coin_balance`
- `availableBalance`, `pendingWdrTotal` — dari `WalletBalanceService::getStats($user->id)`
- `bankAccounts` — array dari `ownerBankAccounts()->where('is_active', true)->get()`, field: `id`, `bankName` (via `withdrawalBank->name`), `accountNumberMasked`, `accountHolderName`, `isDefault`, `isActive`
- `recentWithdrawals` — 3 terbaru: `id`, `code`, `requestedAmount`, `adminFee`, `netAmount`, `status`, `statusLabel`, `createdAt`
- `recentTransactions` — 5 terbaru: `id`, `transactionNumber`, `type`, `typeLabel`, `amount`, `isCredit`, `createdAt`
- `totalWithdrawals` — array count per status: `pending`, `processing`, `paid`, `rejected`

#### Method `getReferralSummary(): array`

Return:
- `referralCode` — `$user->referral_code`
- `totalReferrals` — `$user->referrals()->count()`
- `totalCommission` — `$user->getTotalCommission()`
- `recentReferrals` — 5 terbaru: `id`, `name`, `createdAt`

#### Method `getSetupChecklist(): array`

Return checklist boolean:
- `profileComplete` — name && phone && address sudah diisi
- `hasPhone` — phone tidak null/kosong
- `hasAddress` — address tidak null/kosong
- `hasOutlet` — outlets()->count() > 0
- `hasActiveOutlet` — outlets()->active()->count() > 0 (atau where status active)
- `hasActiveBankAccount` — ownerBankAccounts()->where('is_active', true)->count() > 0
- `hasWalletOrCoin` — wallet_balance > 0 || coin_balance > 0

---

## Phase 2 — Backend: Perluas ProfileController

### Step 2.1 — [MODIFY] `app/Http/Controllers/Web/ProfileController.php`

Pada method `index()`, tambahkan 3 data baru dan pass ke Inertia:

```php
$financeSummary  = $this->profileService->getFinanceSummary();
$referralSummary = $this->profileService->getReferralSummary();
$setupChecklist  = $this->profileService->getSetupChecklist();

return Inertia::render('Dashboard/Profile/Index', [
    'user'            => (new UserResource($user))->resolve(),
    'overview'        => $overview,
    'outlets'         => OutletResource::collection($outlets)->resolve(),
    'financeSummary'  => $financeSummary,
    'referralSummary' => $referralSummary,
    'setupChecklist'  => $setupChecklist,
    'flash'           => ['success' => session('success'), 'error' => session('error')],
]);
```

---

## Phase 3 — Frontend Types

### Step 3.1 — [MODIFY] `resources/js/Pages/Dashboard/Profile/types.ts`

Tambahkan interface baru di bawah yang sudah ada:

```typescript
export interface ProfileBankAccountSummary {
    id: number;
    bankName: string;
    accountNumberMasked: string;
    accountHolderName: string;
    isDefault: boolean;
    isActive: boolean;
}

export interface ProfileWithdrawalItem {
    id: number;
    code: string;
    requestedAmount: number;
    adminFee: number;
    netAmount: number;
    status: string;
    statusLabel: string;
    createdAt: string;
}

export interface ProfileTransactionItem {
    id: number;
    transactionNumber: string;
    type: string;
    typeLabel: string;
    amount: number;
    isCredit: boolean;
    createdAt: string;
}

export interface ProfileFinanceSummary {
    walletBalance: number;
    coinBalance: number;
    availableBalance: number;
    pendingWdrTotal: number;
    bankAccounts: ProfileBankAccountSummary[];
    recentWithdrawals: ProfileWithdrawalItem[];
    recentTransactions: ProfileTransactionItem[];
    totalWithdrawals: {
        pending: number;
        processing: number;
        paid: number;
        rejected: number;
    };
}

export interface ProfileReferralItem {
    id: number;
    name: string;
    createdAt: string;
}

export interface ProfileReferralSummary {
    referralCode: string | null;
    totalReferrals: number;
    totalCommission: number;
    recentReferrals: ProfileReferralItem[];
}

export interface ProfileSetupChecklist {
    profileComplete: boolean;
    hasPhone: boolean;
    hasAddress: boolean;
    hasOutlet: boolean;
    hasActiveOutlet: boolean;
    hasActiveBankAccount: boolean;
    hasWalletOrCoin: boolean;
}
```

Update `ProfileIndexProps`:
```typescript
export interface ProfileIndexProps {
    user: ProfileUser | null;
    overview: ProfileOverview;
    outlets: ProfileOutlet[];
    financeSummary: ProfileFinanceSummary;
    referralSummary: ProfileReferralSummary;
    setupChecklist: ProfileSetupChecklist;
    flash?: { success?: string; error?: string };
}
```

---

## Phase 4 — Frontend: Tab Finance

### Step 4.1 — [CREATE] `Finance/Partials/FinanceBalanceCard.tsx`

- **Coin Balance card** — ikon koin, warna amber, label "Saldo Koin (Fitur)", link ke topup
- **Wallet Balance card** — ikon wallet, warna hijau/success, label "Saldo Pendapatan"
- Di bawah wallet: Available Balance + Reserved (pending withdrawal)
- CTA: "Tarik Saldo" → `wallet-withdrawals.create` (disabled jika `availableBalance <= 0`)
- Gunakan komponen `Card`, `Badge`, `Button` dari `@/Components/`

### Step 4.2 — [CREATE] `Finance/Partials/FinanceBankAccountsCard.tsx`

- List rekening aktif: nama bank, `accountNumberMasked`, nama pemilik, badge "Default" jika `isDefault`
- Jika kosong: warning card "Belum ada rekening aktif" + Button ke `bank-accounts.create`
- Footer: "Kelola Rekening" link ke `bank-accounts.index`

### Step 4.3 — [CREATE] `Finance/Partials/FinanceWithdrawalCard.tsx`

- Stat row 4 kolom: Pending / Diproses / Selesai / Ditolak
- List 3 withdrawal terbaru: kode, tanggal, nominal, net amount, badge status
- Footer: "Lihat Semua" → `wallet-withdrawals.index`
- CTA: "Ajukan Penarikan" → `wallet-withdrawals.create`

### Step 4.4 — [CREATE] `Finance/Partials/FinanceTransactionCard.tsx`

- 5 transaksi terbaru: tanggal, typeLabel, amount (+/- dengan warna sesuai `isCredit`), nomor transaksi
- Footer: "Lihat Riwayat Dompet" → `wallet.index`
- Jika kosong: empty state ringan

### Step 4.5 — [CREATE] `Finance/Index.tsx`

Layout 2-kolom grid merender ke-4 Partial di atas. Pass data dari `financeSummary` prop.

---

## Phase 5 — Frontend: Tab Referrals

### Step 5.1 — [CREATE] `Referrals/Partials/ReferralCodeCard.tsx`

- Kode referral dalam kotak highlight dengan font mono besar
- Tombol copy ke clipboard dengan state feedback "Tersalin!"
- Jika kode null: empty state ringan

### Step 5.2 — [CREATE] `Referrals/Partials/ReferralStatsCard.tsx`

- Stat card: Total Referral (purple) + Total Komisi Rp (amber)
- Gunakan komponen `Card` dan ikon Lucide

### Step 5.3 — [CREATE] `Referrals/Partials/ReferralListCard.tsx`

- List 5 referral terbaru: nama, tanggal bergabung
- Empty state: "Belum ada referral" + pesan motivasi singkat

### Step 5.4 — [CREATE] `Referrals/Index.tsx`

Layout tab Referrals merender ke-3 Partial di atas. Pass data dari `referralSummary` prop.

---

## Phase 6 — Frontend: Update Overview & Sidebar

### Step 6.1 — [CREATE] `Partials/SetupChecklist.tsx`

Checklist visual yang menerima prop `checklist: ProfileSetupChecklist`:

| Checklist Item | Field | Action Link |
|---|---|---|
| Nama & email diisi | `profileComplete` | `profile.edit` |
| Nomor telepon | `hasPhone` | `profile.edit` |
| Alamat | `hasAddress` | `profile.edit` |
| Memiliki outlet | `hasOutlet` | `outlets.create` |
| Outlet aktif | `hasActiveOutlet` | `outlets.index` |
| Rekening bank aktif | `hasActiveBankAccount` | `bank-accounts.create` |

- Progress bar persentase di bagian atas
- Jika semua lengkap → success state "Setup Akun Lengkap"
- Gunakan `CheckCircle2` (done) dan `Circle` / `AlertCircle` (belum) dari Lucide

### Step 6.2 — [CREATE] `Partials/QuickActionsCard.tsx`

Grid 2x4 tombol quick actions:
- Edit Profil, Ganti Password, Kelola Outlet, Dompet Pendapatan, Rekening Bank, Tarik Saldo, Topup Koin
- "Tarik Saldo" disabled (dengan tooltip) jika `!hasActiveBankAccount`
- Gunakan `Button` komponen dengan variant & icon

### Step 6.3 — [MODIFY] `Partials/ProfileOverview.tsx`

- Tambahkan `SetupChecklist` di bagian atas (hanya jika setup belum 100% lengkap)
- Tambahkan `QuickActionsCard` di bawah stats grid
- Props tambahan: `setupChecklist: ProfileSetupChecklist`

### Step 6.4 — [MODIFY] `Partials/ProfileSidebar.tsx`

- Tambahkan stat chip "Wallet Balance" di bawah Coins dengan warna hijau/success
- Label chip: "Wallet" dengan ikon `Wallet` dari Lucide
- Props tambahan: `financeSummary: ProfileFinanceSummary`

---

## Phase 7 — Frontend: Update Profile Index.tsx

### Step 7.1 — [MODIFY] `resources/js/Pages/Dashboard/Profile/Index.tsx`

- Import `FinanceTab` dan `ReferralsTab`
- Update tabs array ke 5 tab: Overview · Finance · Outlets · Referrals · Settings
- Pass props baru ke setiap tab:

```typescript
const tabs = [
    { label: "Overview", icon: <User className="w-4 h-4" /> },
    { label: "Finance", icon: <Wallet className="w-4 h-4" /> },
    { label: "Outlets", icon: <Building2 className="w-4 h-4" />, badge: outlets.length || undefined, badgeVariant: "primary" as const },
    { label: "Referrals", icon: <Users className="w-4 h-4" />, badge: referralSummary.totalReferrals || undefined, badgeVariant: "secondary" as const },
    { label: "Settings", icon: <Settings className="w-4 h-4" /> },
];
```

---

## Urutan Implementasi

| Urutan | Phase | Dependency |
|---|---|---|
| 1 | Phase 1 — ProfileService | - |
| 2 | Phase 2 — ProfileController | Phase 1 |
| 3 | Phase 3 — Frontend Types | - |
| 4 | Phase 4 — Finance Partials | Phase 3 |
| 5 | Phase 4.5 — Finance/Index.tsx | Phase 4 |
| 6 | Phase 5 — Referrals Partials | Phase 3 |
| 7 | Phase 5.4 — Referrals/Index.tsx | Phase 5 |
| 8 | Phase 6 — Overview & Sidebar update | Phase 3 |
| 9 | Phase 7 — Profile Index.tsx update | Phase 2, 4, 5, 6 |

---

## Verification Checklist

- [ ] `coin_balance` dan `wallet_balance` dipisahkan secara visual dan istilah
- [ ] Nomor rekening hanya menampilkan 4 digit terakhir (masking dilakukan di service PHP)
- [ ] `SetupChecklist` dihitung real-time, tidak disimpan ke tabel baru
- [ ] Tab Finance dan Referrals terisi dengan data dari service
- [ ] Quick actions disabled dengan penjelasan jika kondisi belum terpenuhi
- [ ] Owner hanya melihat data miliknya sendiri (dijaga oleh `byOwnerId` scope di service)
- [ ] Tidak ada hardcoded warna — gunakan `var(--color-*)` atau Tailwind theme class
- [ ] Tidak ada comment di dalam kode
- [ ] Tidak ada file frontend > ~150 baris (dipecah ke Partials)
- [ ] Semua komponen reusable digunakan dengan props yang benar setelah dibaca dari `@/Components/`
