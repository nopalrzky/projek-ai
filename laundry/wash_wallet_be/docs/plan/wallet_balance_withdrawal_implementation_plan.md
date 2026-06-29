# Implementation Plan: Wallet Balance Owner & Withdrawal Manual

Tanggal: 2026-05-29
Berdasarkan: `docs/user_need/wallet_balance_withdrawal_user_need.md`

---

## Keputusan Teknis

| Item | Keputusan |
|---|---|
| Wallet balance level | **Owner-level** (`users.wallet_balance`) — owner menarik gabungan pendapatan semua outlet |
| Penyimpanan saldo | Field `wallet_balance` (decimal 15,2) di tabel `users` + ledger `wallet_transactions` untuk audit trail |
| Pendekatan reserved balance | Saldo langsung dikurangi saat withdrawal dibuat (`withdrawal_request`), dikembalikan jika rejected/cancelled (`withdrawal_rejected_refund`) |
| Tabel withdrawals existing | **Tidak dipakai ulang** — tabel lama berbasis `coin_amount`. Buat tabel baru `wallet_withdrawals` |
| Tabel rekening owner | `owner_bank_accounts` — owner bisa punya banyak rekening |
| Tabel master bank | `withdrawal_banks` — dikelola super admin, menyimpan biaya admin fixed per bank |
| Snapshot pada withdrawal | Simpan `bank_name`, `account_number`, `account_holder_name`, `admin_fee` langsung di `wallet_withdrawals` |
| Requested amount | Nominal yang dipotong dari saldo owner (gross). `net_amount = requested_amount - admin_fee` |
| PG fee Midtrans | Tidak mengurangi wallet balance owner — menjadi biaya platform. Saldo owner = gross order total |
| Owner cancel withdrawal | Diperbolehkan selama status masih `pending` |
| Minimum withdrawal | Configurable di `withdrawal_banks` level, default global Rp 50.000 |
| Bukti transfer super admin | Upload file gambar (jpg/png/pdf, max 5MB) |
| Status lifecycle | `pending` → `processing` → `paid` / `rejected` / `cancelled` |
| Kode withdrawal | Format `WDR-YYYYMMDD-XXXX` (auto-increment harian) |
| Notifikasi | Database channel, sama seperti pattern `DepositRequestNotification` |

---

## Instruksi Wajib untuk AI Model

> [!IMPORTANT]
> **Baca sebelum menulis kode apapun:**
> 1. **Baca spec standarisasi** di `docs/spec/` — terutama `model_spec.md`, `service_spec.md`, `controller_spec.md`, `api_resource_spec.md`, `columns_spec.md`, `modal_spec.md`, `index_page_dashboard_spec.md`, `filter_spec.md`, `routing_spec.md`
> 2. **Baca komponen reusable** di `resources/js/Components/` sebelum menggunakannya — pastikan props yang dipakai benar
> 3. **Gunakan CSS variables** dari `app.css` untuk semua warna — gunakan `style={{ color: "var(--color-*)" }}` atau Tailwind classes yang sudah di-map ke theme (`text-text-primary`, `bg-surface`, dll.). **Jangan hardcode warna**
> 4. **Pecah ke Partials** — jangan tulis semua UI dalam satu file. Setiap section yang cukup besar harus menjadi komponen di folder `Partials/`
> 5. **Tidak ada comment** di dalam kode — tulis clean code yang self-explanatory
> 6. **Tidak ada kode panjang** dalam satu file — jika satu file melebihi ~150 baris, pertimbangkan pemecahan ke Partials
> 7. **Baca file existing** yang akan dimodifikasi sebelum menulis perubahan — pastikan konteks lengkap

---

## Overview Perubahan

```
Backend (Laravel)
├── database/migrations/
│   ├── xxxx_add_wallet_balance_to_users_table.php
│   ├── xxxx_create_wallet_transactions_table.php
│   ├── xxxx_create_withdrawal_banks_table.php
│   ├── xxxx_create_owner_bank_accounts_table.php
│   └── xxxx_create_wallet_withdrawals_table.php
│
├── app/Models/
│   ├── User.php                            → [MODIFY] tambah wallet_balance field
│   ├── WalletTransaction.php               → [CREATE]
│   ├── WithdrawalBank.php                  → [CREATE]
│   ├── OwnerBankAccount.php                → [CREATE]
│   └── WalletWithdrawal.php                → [CREATE]
│
├── app/Services/
│   ├── WalletBalanceService.php            → [CREATE]
│   ├── OwnerBankAccountService.php         → [CREATE]
│   ├── WithdrawalBankService.php           → [CREATE]
│   ├── WalletWithdrawalService.php         → [CREATE]
│   └── OrderService.php                    → [MODIFY] hook wallet balance credit
│
├── app/Http/Requests/
│   ├── OwnerBankAccount/
│   │   ├── StoreOwnerBankAccountRequest.php    → [CREATE]
│   │   └── UpdateOwnerBankAccountRequest.php   → [CREATE]
│   ├── WithdrawalBank/
│   │   ├── StoreWithdrawalBankRequest.php      → [CREATE]
│   │   └── UpdateWithdrawalBankRequest.php     → [CREATE]
│   └── WalletWithdrawal/
│       ├── StoreWalletWithdrawalRequest.php    → [CREATE]
│       ├── ProcessWithdrawalRequest.php        → [CREATE]
│       └── RejectWithdrawalRequest.php         → [CREATE]
│
├── app/Http/Resources/
│   ├── WalletTransaction/
│   │   └── WalletTransactionResource.php       → [CREATE]
│   ├── WithdrawalBank/
│   │   └── WithdrawalBankResource.php          → [CREATE]
│   ├── OwnerBankAccount/
│   │   └── OwnerBankAccountResource.php        → [CREATE]
│   └── WalletWithdrawal/
│       └── WalletWithdrawalResource.php        → [CREATE]
│
├── app/Http/Controllers/Web/
│   ├── WalletController.php                    → [CREATE] owner wallet dashboard
│   ├── OwnerBankAccountController.php          → [CREATE] owner bank CRUD
│   ├── WalletWithdrawalController.php          → [CREATE] owner withdrawal
│   ├── Admin/
│   │   ├── WithdrawalBankController.php        → [CREATE] super admin bank master
│   │   └── AdminWalletWithdrawalController.php → [CREATE] super admin withdrawal queue
│
├── app/Notifications/
│   ├── WithdrawalRequestedNotification.php     → [CREATE] → super admin
│   ├── WithdrawalPaidNotification.php          → [CREATE] → owner
│   └── WithdrawalRejectedNotification.php      → [CREATE] → owner
│
└── routes/web.php                              → [MODIFY] tambah route group baru

Frontend (React/Inertia)
├── resources/js/types/
│   ├── wallet_transaction.ts               → [CREATE]
│   ├── withdrawal_bank.ts                  → [CREATE]
│   ├── owner_bank_account.ts               → [CREATE]
│   ├── wallet_withdrawal.ts                → [CREATE]
│   ├── user.ts                             → [MODIFY] tambah walletBalance
│   └── index.d.ts                          → [MODIFY] tambah exports
│
├── resources/js/Services/
│   ├── wallet.service.ts                   → [CREATE]
│   ├── owner_bank_account.service.ts       → [CREATE]
│   └── wallet_withdrawal.service.ts        → [CREATE]
│
├── resources/js/Pages/Dashboard/Wallet/
│   ├── Index.tsx                            → [CREATE] wallet dashboard owner
│   ├── columns.tsx                          → [CREATE] wallet transaction columns
│   ├── filters.tsx                          → [CREATE] wallet transaction filters
│   ├── types.ts                            → [CREATE] page props
│   └── Partials/
│       ├── WalletBalanceOverview.tsx        → [CREATE] saldo card
│       ├── WalletStatChip.tsx              → [CREATE] stat chip
│       └── WalletTransactionSection.tsx    → [CREATE] transaction history
│
├── resources/js/Pages/Dashboard/BankAccounts/
│   ├── Index.tsx                            → [CREATE] list rekening owner
│   ├── Create.tsx                           → [CREATE] tambah rekening
│   ├── Edit.tsx                             → [CREATE] edit rekening
│   ├── columns.tsx                          → [CREATE]
│   ├── types.ts                            → [CREATE]
│   └── Partials/
│       ├── BankAccountForm.tsx             → [CREATE] form partial
│       └── DeleteBankAccountModal.tsx      → [CREATE]
│
├── resources/js/Pages/Dashboard/WalletWithdrawals/
│   ├── Index.tsx                            → [CREATE] list withdrawal owner
│   ├── Create.tsx                           → [CREATE] form request withdrawal
│   ├── Show.tsx                            → [CREATE] detail withdrawal
│   ├── columns.tsx                          → [CREATE]
│   ├── filters.tsx                          → [CREATE]
│   ├── types.ts                            → [CREATE]
│   └── Partials/
│       ├── WithdrawalForm.tsx              → [CREATE] form + estimasi
│       ├── WithdrawalSummaryCard.tsx       → [CREATE] ringkasan biaya
│       ├── CancelWithdrawalModal.tsx       → [CREATE]
│       └── WithdrawalStatusTimeline.tsx    → [CREATE] timeline status
│
├── resources/js/Pages/Dashboard/Admin/WithdrawalBanks/
│   ├── Index.tsx                            → [CREATE] list bank master
│   ├── Create.tsx                           → [CREATE] tambah bank
│   ├── Edit.tsx                             → [CREATE] edit bank
│   ├── columns.tsx                          → [CREATE]
│   ├── types.ts                            → [CREATE]
│   └── Partials/
│       ├── WithdrawalBankForm.tsx           → [CREATE]
│       └── DeleteWithdrawalBankModal.tsx    → [CREATE]
│
└── resources/js/Pages/Dashboard/Admin/WalletWithdrawals/
    ├── Index.tsx                            → [CREATE] queue withdrawal semua owner
    ├── Show.tsx                             → [CREATE] detail + proses
    ├── columns.tsx                          → [CREATE]
    ├── filters.tsx                          → [CREATE]
    ├── types.ts                             → [CREATE]
    └── Partials/
        ├── ProcessWithdrawalModal.tsx       → [CREATE] tandai processing
        ├── MarkPaidModal.tsx               → [CREATE] tandai paid + upload bukti
        ├── RejectWithdrawalModal.tsx        → [CREATE] tolak + alasan
        └── WithdrawalDetailCard.tsx         → [CREATE] detail snapshot
```

---

## Phase 1 — Database Migrations

### Step 1.1 — [CREATE] Add wallet_balance to users table

```
database/migrations/xxxx_add_wallet_balance_to_users_table.php
```

```php
Schema::table('users', function (Blueprint $table) {
    $table->decimal('wallet_balance', 15, 2)->default(0.00)->after('coin_balance');
});
```

### Step 1.2 — [CREATE] wallet_transactions table

```
database/migrations/xxxx_create_wallet_transactions_table.php
```

| Column | Type | Notes |
|---|---|---|
| id | bigIncrements | PK |
| user_id | foreignId | FK users, cascade delete |
| outlet_id | foreignId | nullable, FK outlets, set null on delete |
| order_id | foreignId | nullable, FK orders, set null on delete |
| wallet_withdrawal_id | foreignId | nullable, FK wallet_withdrawals, set null on delete |
| transaction_number | string, unique | Format: `WTX-YYYYMMDD-XXXX` |
| type | enum | `order_transfer_income`, `order_wallet_income`, `withdrawal_request`, `withdrawal_rejected_refund`, `withdrawal_cancelled_refund`, `manual_adjustment` |
| amount | decimal(15,2) | Positif = kredit, negatif = debit |
| balance_before | decimal(15,2) | Saldo sebelum transaksi |
| balance_after | decimal(15,2) | Saldo setelah transaksi |
| description | text, nullable | Keterangan |
| timestamps | | |

Indexes: `[user_id, type]`, `[order_id]`, `[wallet_withdrawal_id]`

> [!NOTE]
> FK `wallet_withdrawal_id` perlu dibuat setelah tabel `wallet_withdrawals` ada. Gunakan migration ordering yang tepat atau tambahkan FK di migration terpisah setelah `wallet_withdrawals` dibuat.

### Step 1.3 — [CREATE] withdrawal_banks table

```
database/migrations/xxxx_create_withdrawal_banks_table.php
```

| Column | Type | Notes |
|---|---|---|
| id | bigIncrements | PK |
| bank_name | string(100) | Nama bank (BCA, BNI, Mandiri, dll.) |
| bank_code | string(20), nullable | Kode bank jika ada |
| admin_fee | decimal(15,2), default 0 | Biaya admin fixed |
| min_withdrawal | decimal(15,2), default 50000 | Minimum withdrawal |
| max_withdrawal | decimal(15,2), nullable | Maximum per request, nullable = unlimited |
| is_active | boolean, default true | |
| timestamps | | |
| softDeletes | | |

### Step 1.4 — [CREATE] owner_bank_accounts table

```
database/migrations/xxxx_create_owner_bank_accounts_table.php
```

| Column | Type | Notes |
|---|---|---|
| id | bigIncrements | PK |
| user_id | foreignId | FK users, cascade delete |
| withdrawal_bank_id | foreignId | FK withdrawal_banks, cascade delete |
| account_number | string(50) | Nomor rekening |
| account_holder_name | string(100) | Nama pemilik rekening |
| is_default | boolean, default false | Rekening utama |
| is_active | boolean, default true | |
| timestamps | | |
| softDeletes | | |

Unique constraint: `[user_id, withdrawal_bank_id, account_number]` (mencegah duplikat)

### Step 1.5 — [CREATE] wallet_withdrawals table

```
database/migrations/xxxx_create_wallet_withdrawals_table.php
```

| Column | Type | Notes |
|---|---|---|
| id | bigIncrements | PK |
| user_id | foreignId | FK users, cascade delete |
| owner_bank_account_id | foreignId | FK owner_bank_accounts, nullable, set null |
| code | string, unique | Format: `WDR-YYYYMMDD-XXXX` |
| requested_amount | decimal(15,2) | Nominal dipotong dari saldo |
| admin_fee | decimal(15,2) | Snapshot biaya admin saat request |
| net_amount | decimal(15,2) | `requested_amount - admin_fee` |
| status | enum | `pending`, `processing`, `paid`, `rejected`, `cancelled` |
| bank_name | string(100) | Snapshot nama bank |
| bank_code | string(20), nullable | Snapshot kode bank |
| account_number | string(50) | Snapshot nomor rekening |
| account_holder_name | string(100) | Snapshot nama pemilik |
| admin_note | text, nullable | Catatan super admin |
| proof_path | string, nullable | Path bukti transfer |
| processed_by | foreignId, nullable | FK users (super admin) |
| processed_at | timestamp, nullable | |
| paid_at | timestamp, nullable | |
| rejected_at | timestamp, nullable | |
| cancelled_at | timestamp, nullable | |
| timestamps | | |
| softDeletes | | |

Indexes: `[user_id, status]`, `[code]`, `[status]`

---

## Phase 2 — Backend Models

### Step 2.1 — [MODIFY] `app/Models/User.php`

Tambahkan ke `$fillable`:
```php
'wallet_balance',
```

Tambahkan ke `casts()`:
```php
'wallet_balance' => 'decimal:2',
```

Tambahkan relationships:
```php
public function walletTransactions(): HasMany
{
    return $this->hasMany(WalletTransaction::class);
}

public function ownerBankAccounts(): HasMany
{
    return $this->hasMany(OwnerBankAccount::class);
}

public function walletWithdrawals(): HasMany
{
    return $this->hasMany(WalletWithdrawal::class);
}
```

Tambahkan helper:
```php
public function availableWalletBalance(): float
{
    return (float) $this->wallet_balance;
}
```

### Step 2.2 — [CREATE] `app/Models/WalletTransaction.php`

Ikuti pattern `CoinTransaction.php`:
- `declare(strict_types=1)`, `#[Table('wallet_transactions')]`
- `$fillable`: semua kolom kecuali id
- `casts()`: amount, balance_before, balance_after → `decimal:2`, created_at/updated_at → `datetime`
- Relationships: `user()`, `outlet()`, `order()`, `walletWithdrawal()`
- Scopes: `scopeById`, `scopeByUserId`, `scopeByType`, `scopeByOrderId`, `scopeSearch`, `scopeSortBy`
- Type constants: `TYPE_ORDER_TRANSFER_INCOME`, `TYPE_ORDER_WALLET_INCOME`, `TYPE_WITHDRAWAL_REQUEST`, `TYPE_WITHDRAWAL_REJECTED_REFUND`, `TYPE_WITHDRAWAL_CANCELLED_REFUND`, `TYPE_MANUAL_ADJUSTMENT`
- Static method: `generateTransactionNumber()` — Format `WTX-YYYYMMDD-XXXX`
- Helper: `isCredit(): bool`, `isDebit(): bool`

### Step 2.3 — [CREATE] `app/Models/WithdrawalBank.php`

- `$fillable`: `bank_name`, `bank_code`, `admin_fee`, `min_withdrawal`, `max_withdrawal`, `is_active`
- `casts()`: `admin_fee` → `decimal:2`, `min_withdrawal` → `decimal:2`, `max_withdrawal` → `decimal:2`, `is_active` → `boolean`
- Scopes: `scopeById`, `scopeActive`, `scopeSearch`, `scopeSortBy`
- Uses: `SoftDeletes`
- Relationship: `ownerBankAccounts(): HasMany`

### Step 2.4 — [CREATE] `app/Models/OwnerBankAccount.php`

- `$fillable`: `user_id`, `withdrawal_bank_id`, `account_number`, `account_holder_name`, `is_default`, `is_active`
- `casts()`: `is_default` → `boolean`, `is_active` → `boolean`
- Relationships: `user()`, `withdrawalBank()`
- Scopes: `scopeByUserId`, `scopeActive`, `scopeDefault`, `scopeSearch`, `scopeSortBy`
- Uses: `SoftDeletes`

### Step 2.5 — [CREATE] `app/Models/WalletWithdrawal.php`

Ikuti pattern `Withdrawal.php` + `Deposit.php`:
- `$fillable`: semua kolom
- `casts()`: amounts → `decimal:2`, timestamps → `datetime`, status → `string`
- Status constants: `STATUS_PENDING`, `STATUS_PROCESSING`, `STATUS_PAID`, `STATUS_REJECTED`, `STATUS_CANCELLED`
- Relationships: `user()`, `ownerBankAccount()`, `processedByUser()`, `walletTransactions()`
- Scopes: `scopeById`, `scopeByUserId`, `scopeByStatus`, `scopePending`, `scopeProcessing`, `scopePendingOrProcessing`, `scopeSearch`, `scopeSortBy`
- Helpers: `isPending()`, `isProcessing()`, `isPaid()`, `isRejected()`, `isCancelled()`, `canBeProcessed()`, `canBeCancelled()`
- Static method: `generateCode()` — Format `WDR-YYYYMMDD-XXXX`

---

## Phase 3 — Backend Services

### Step 3.1 — [CREATE] `app/Services/WalletBalanceService.php`

Extends `BaseService`. Constructor DI: `WalletTransaction`, `User`.

Metode utama:

| Method | Tugas |
|---|---|
| `getTransactions(filters, page, perPage, relations)` | List wallet transactions owner |
| `getStats(userId)` | Return stat cards: wallet balance, available balance, pending withdrawal total |
| `getById(id, relations)` | Single transaction |
| `creditFromOrder(User, Order, string $type)` | Tambah saldo dari order paid. Idempotent (cek existing transaction by order_id + type). Dalam DB::transaction |
| `debitForWithdrawal(User, WalletWithdrawal)` | Kurangi saldo saat withdrawal dibuat. Dalam DB::transaction |
| `refundWithdrawal(User, WalletWithdrawal, string $type)` | Kembalikan saldo saat rejected/cancelled. Dalam DB::transaction |
| `manualAdjustment(User, float $amount, string $description)` | Penyesuaian manual oleh super admin |

Pattern idempotent untuk `creditFromOrder`:
```php
$existing = $this->walletTransaction
    ->byOrderId($order->id)
    ->where('type', $type)
    ->exists();

if ($existing) {
    Log::info('Wallet credit already recorded, skipping', [...]);
    return;
}
```

### Step 3.2 — [CREATE] `app/Services/OwnerBankAccountService.php`

Extends `BaseService`. Constructor DI: `OwnerBankAccount`.

| Method | Tugas |
|---|---|
| `getAll(filters, page, perPage, relations)` | List rekening owner (scoped by user) |
| `getById(id, relations)` | Single rekening |
| `store(data)` | Buat rekening baru. Jika `is_default`, reset default lain. Validasi unique `[user_id, withdrawal_bank_id, account_number]` |
| `update(id, data)` | Edit rekening. Cek tidak sedang dipakai withdrawal pending/processing |
| `destroy(id)` | Soft delete. Cek tidak dipakai withdrawal pending/processing |
| `setDefault(id)` | Set rekening sebagai default, unset lainnya |

### Step 3.3 — [CREATE] `app/Services/WithdrawalBankService.php`

Extends `BaseService`. Constructor DI: `WithdrawalBank`.

| Method | Tugas |
|---|---|
| `getAll(filters, page, perPage, relations)` | List bank master |
| `getActiveBanks()` | List bank aktif (untuk dropdown) |
| `getById(id, relations)` | Single bank |
| `store(data)` | Buat bank baru |
| `update(id, data)` | Edit bank |
| `destroy(id)` | Soft delete bank |

### Step 3.4 — [CREATE] `app/Services/WalletWithdrawalService.php`

Extends `BaseService`. Constructor DI: `WalletWithdrawal`, `WalletBalanceService`, `OwnerBankAccount`, `User`.

| Method | Tugas |
|---|---|
| `getAll(filters, page, perPage, relations)` | List withdrawal (scoped: owner lihat miliknya, super admin lihat semua) |
| `getStats()` | Stat cards |
| `getById(id, relations)` | Single withdrawal |
| `store(data)` | Buat withdrawal request. Dalam DB::transaction |
| `process(id)` | Super admin mulai proses → status `processing` |
| `markPaid(id, data)` | Super admin tandai paid → upload bukti, status `paid` |
| `reject(id, reason)` | Super admin tolak → refund saldo, status `rejected` |
| `cancel(id)` | Owner batalkan → refund saldo, status `cancelled` |

Detail `store(data)`:
```
1. Resolve owner dari auth
2. Ambil OwnerBankAccount + validate ownership + active
3. Ambil WithdrawalBank dari rekening → ambil admin_fee, min/max
4. Validate requested_amount >= min, <= max (jika ada), <= available balance
5. Validate net_amount > 0
6. DB::transaction:
   a. Generate code WDR-YYYYMMDD-XXXX
   b. Snapshot bank_name, account_number, account_holder_name, admin_fee
   c. Hitung net_amount = requested_amount - admin_fee
   d. Buat WalletWithdrawal record
   e. Panggil walletBalanceService->debitForWithdrawal()
   f. Kirim WithdrawalRequestedNotification ke semua super admin
7. Return withdrawal
```

---

## Phase 4 — Form Requests

### Step 4.1 — [CREATE] `app/Http/Requests/OwnerBankAccount/StoreOwnerBankAccountRequest.php`

Rules:
```php
'withdrawalBankId'   => ['required', 'integer', 'exists:withdrawal_banks,id'],
'accountNumber'      => ['required', 'string', 'max:50', 'regex:/^[0-9]+$/'],
'accountHolderName'  => ['required', 'string', 'max:100'],
'isDefault'          => ['nullable', 'boolean'],
```

Messages dalam Bahasa Indonesia. Attributes untuk label field yang rapi.

### Step 4.2 — [CREATE] `app/Http/Requests/OwnerBankAccount/UpdateOwnerBankAccountRequest.php`

Rules identik dengan Store, kecuali `withdrawalBankId` tidak boleh diubah.

### Step 4.3 — [CREATE] `app/Http/Requests/WithdrawalBank/StoreWithdrawalBankRequest.php`

Rules:
```php
'bankName'       => ['required', 'string', 'max:100'],
'bankCode'       => ['nullable', 'string', 'max:20'],
'adminFee'       => ['required', 'numeric', 'min:0'],
'minWithdrawal'  => ['required', 'numeric', 'min:0'],
'maxWithdrawal'  => ['nullable', 'numeric', 'min:0', 'gt:minWithdrawal'],
'isActive'       => ['nullable', 'boolean'],
```

### Step 4.4 — [CREATE] `app/Http/Requests/WithdrawalBank/UpdateWithdrawalBankRequest.php`

Rules identik dengan Store.

### Step 4.5 — [CREATE] `app/Http/Requests/WalletWithdrawal/StoreWalletWithdrawalRequest.php`

Rules:
```php
'ownerBankAccountId' => ['required', 'integer', 'exists:owner_bank_accounts,id'],
'requestedAmount'    => ['required', 'numeric', 'min:1'],
```

### Step 4.6 — [CREATE] `app/Http/Requests/WalletWithdrawal/ProcessWithdrawalRequest.php`

Rules:
```php
'proof'     => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
'adminNote' => ['nullable', 'string', 'max:500'],
```

### Step 4.7 — [CREATE] `app/Http/Requests/WalletWithdrawal/RejectWithdrawalRequest.php`

Rules:
```php
'reason' => ['required', 'string', 'max:500'],
```

---

## Phase 5 — API Resources

### Step 5.1 — [CREATE] `app/Http/Resources/WalletTransaction/WalletTransactionResource.php`

Ikuti pattern `CoinTransactionResource`:
```php
return [
    'id'                  => (int) $this->id,
    'userId'              => (int) $this->user_id,
    'outletId'            => $this->outlet_id ? (int) $this->outlet_id : null,
    'orderId'             => $this->order_id ? (int) $this->order_id : null,
    'walletWithdrawalId'  => $this->wallet_withdrawal_id ? (int) $this->wallet_withdrawal_id : null,
    'transactionNumber'   => (string) $this->transaction_number,
    'type'                => (string) $this->type,
    'typeLabel'           => $this->getTypeLabel(),
    'amount'              => (float) $this->amount,
    'balanceBefore'       => (float) $this->balance_before,
    'balanceAfter'        => (float) $this->balance_after,
    'description'         => $this->description,
    'isCredit'            => $this->isCredit(),
    'createdAt'           => $this->created_at?->toISOString(),
    'updatedAt'           => $this->updated_at?->toISOString(),
    'user'                => UserResource::make($this->whenLoaded('user')),
    'outlet'              => OutletResource::make($this->whenLoaded('outlet')),
];
```

Private `getTypeLabel()` mapping type → label Indonesia.

### Step 5.2 — [CREATE] `app/Http/Resources/WithdrawalBank/WithdrawalBankResource.php`

Fields: `id, bankName, bankCode, adminFee, minWithdrawal, maxWithdrawal, isActive, formattedAdminFee, createdAt, updatedAt`.

### Step 5.3 — [CREATE] `app/Http/Resources/OwnerBankAccount/OwnerBankAccountResource.php`

Fields: `id, userId, withdrawalBankId, accountNumber, accountHolderName, isDefault, isActive, bankName (via withdrawalBank), adminFee (via withdrawalBank), createdAt, updatedAt`.

Relationship: `withdrawalBank` → `WithdrawalBankResource::make($this->whenLoaded('withdrawalBank'))`.

### Step 5.4 — [CREATE] `app/Http/Resources/WalletWithdrawal/WalletWithdrawalResource.php`

Fields: `id, userId, ownerBankAccountId, code, requestedAmount, adminFee, netAmount, status, statusLabel, statusColor, bankName, bankCode, accountNumber, accountHolderName, adminNote, proofPath, proofUrl, processedBy, processedAt, paidAt, rejectedAt, cancelledAt, createdAt, updatedAt`.

Relationships: `user`, `ownerBankAccount`, `processedByUser`.

Status label mapping:
```php
private function getStatusLabel(): string
{
    return match ($this->status) {
        'pending'    => 'Menunggu',
        'processing' => 'Diproses',
        'paid'       => 'Dibayar',
        'rejected'   => 'Ditolak',
        'cancelled'  => 'Dibatalkan',
        default      => $this->status,
    };
}
```

---

## Phase 6 — Controllers & Routes

### Step 6.1 — [CREATE] `app/Http/Controllers/Web/WalletController.php`

Owner wallet dashboard:
```php
#[Middleware('auth')]
class WalletController extends Controller
{
    public function __construct(
        private readonly WalletBalanceService $walletBalanceService,
    ) {}

    public function index(Request $request) // Wallet balance + transaction history
}
```

Render: `Dashboard/Wallet/Index`

### Step 6.2 — [CREATE] `app/Http/Controllers/Web/OwnerBankAccountController.php`

Owner bank account CRUD:
```php
public function index(Request $request)    // List
public function create()                    // Form
public function store(StoreRequest $req)    // Save
public function edit(int $id)               // Edit form
public function update(UpdateRequest, int)  // Update
public function destroy(int $id)            // Soft delete
public function setDefault(int $id)         // Set as default
```

### Step 6.3 — [CREATE] `app/Http/Controllers/Web/WalletWithdrawalController.php`

Owner withdrawal:
```php
public function index(Request $request)         // List withdrawal owner
public function create()                         // Form request withdrawal
public function store(StoreRequest $request)     // Submit request
public function show(int $id)                    // Detail
public function cancel(int $id)                  // Cancel (owner, jika pending)
```

### Step 6.4 — [CREATE] `app/Http/Controllers/Web/Admin/WithdrawalBankController.php`

Super admin bank master CRUD:
```php
public function index(Request $request)
public function create()
public function store(StoreRequest $request)
public function edit(int $id)
public function update(UpdateRequest $request, int $id)
public function destroy(int $id)
```

### Step 6.5 — [CREATE] `app/Http/Controllers/Web/Admin/AdminWalletWithdrawalController.php`

Super admin withdrawal processing:
```php
public function index(Request $request)              // List semua withdrawal
public function show(int $id)                         // Detail withdrawal
public function process(int $id)                      // → status processing
public function markPaid(ProcessRequest $req, int $id) // → status paid + bukti
public function reject(RejectRequest $req, int $id)    // → status rejected + alasan
```

### Step 6.6 — [MODIFY] `routes/web.php`

Tambahkan route group di dalam dashboard prefix:

```php
// Owner Wallet
Route::get('wallet', [WalletController::class, 'index'])->name('wallet.index');

// Owner Bank Accounts
Route::resource('bank-accounts', OwnerBankAccountController::class)->except(['show']);
Route::post('bank-accounts/{id}/set-default', [OwnerBankAccountController::class, 'setDefault'])
    ->name('bank-accounts.set-default');

// Owner Wallet Withdrawals
Route::resource('wallet-withdrawals', WalletWithdrawalController::class)
    ->only(['index', 'create', 'store', 'show']);
Route::post('wallet-withdrawals/{id}/cancel', [WalletWithdrawalController::class, 'cancel'])
    ->name('wallet-withdrawals.cancel');

// Admin — Withdrawal Banks
Route::prefix('admin')->name('admin.')->group(function () {
    Route::resource('withdrawal-banks', Admin\WithdrawalBankController::class)->except(['show']);

    // Admin — Wallet Withdrawals
    Route::get('wallet-withdrawals', [Admin\AdminWalletWithdrawalController::class, 'index'])
        ->name('wallet-withdrawals.index');
    Route::get('wallet-withdrawals/{id}', [Admin\AdminWalletWithdrawalController::class, 'show'])
        ->name('wallet-withdrawals.show');
    Route::post('wallet-withdrawals/{id}/process', [Admin\AdminWalletWithdrawalController::class, 'process'])
        ->name('wallet-withdrawals.process');
    Route::post('wallet-withdrawals/{id}/mark-paid', [Admin\AdminWalletWithdrawalController::class, 'markPaid'])
        ->name('wallet-withdrawals.mark-paid');
    Route::post('wallet-withdrawals/{id}/reject', [Admin\AdminWalletWithdrawalController::class, 'reject'])
        ->name('wallet-withdrawals.reject');
});
```

---

## Phase 7 — Notifications

### Step 7.1 — [CREATE] `app/Notifications/WithdrawalRequestedNotification.php`

Ikuti pattern `DepositRequestNotification`:
```php
public function toDatabase($notifiable): array
{
    return [
        'type'         => 'withdrawal_requested',
        'title'        => 'Permintaan Withdrawal Baru',
        'message'      => "{$this->withdrawal->user->name} mengajukan withdrawal ...",
        'amount'       => $this->withdrawal->requested_amount,
        'code'         => $this->withdrawal->code,
        'owner_name'   => $this->withdrawal->user->name,
        'bank_name'    => $this->withdrawal->bank_name,
        'net_amount'   => $this->withdrawal->net_amount,
        'request_id'   => $this->withdrawal->id,
        'request_type' => 'wallet_withdrawal',
        'url'          => "/dashboard/admin/wallet-withdrawals/{$this->withdrawal->id}",
    ];
}
```

### Step 7.2 — [CREATE] `app/Notifications/WithdrawalPaidNotification.php`

Dikirim ke owner saat withdrawal ditandai paid.

### Step 7.3 — [CREATE] `app/Notifications/WithdrawalRejectedNotification.php`

Dikirim ke owner saat withdrawal ditolak, termasuk alasan.

---

## Phase 8 — Integration Hooks (OrderService)

### Step 8.1 — [MODIFY] `app/Services/OrderService.php` — handlePaymentWebhook()

Setelah order berhasil ditandai `PAYMENT_STATUS_PAID` untuk metode `transfer`:

```php
if ($mapped['payment'] === Order::PAYMENT_STATUS_PAID
    && $order->payment_status !== Order::PAYMENT_STATUS_PAID) {
    $order->update([
        'paid_amount' => $order->total_amount,
        'remaining_amount' => 0,
    ]);

    if ($order->payment_method === 'transfer') {
        $owner = $order->outlet?->owner;
        if ($owner) {
            app(WalletBalanceService::class)->creditFromOrder(
                $owner,
                $order,
                WalletTransaction::TYPE_ORDER_TRANSFER_INCOME
            );
        }
    }
}
```

### Step 8.2 — [MODIFY] `app/Services/OrderService.php` — wallet payment handler

Di method pembayaran wallet customer, tambahkan hook:

```php
if ($order->payment_method === 'wallet') {
    $owner = $order->outlet?->owner;
    if ($owner) {
        app(WalletBalanceService::class)->creditFromOrder(
            $owner,
            $order,
            WalletTransaction::TYPE_ORDER_WALLET_INCOME
        );
    }
}
```

> [!WARNING]
> Pastikan **tidak** menambah wallet balance untuk metode `cod`. COD hanya dicatat sebagai order paid tetapi dana tidak masuk ke WashWallet.

---

## Phase 9 — Frontend Types

### Step 9.1 — [CREATE] `resources/js/types/wallet_transaction.ts`

```typescript
export interface WalletTransaction {
    id: number;
    userId: number;
    outletId?: number | null;
    orderId?: number | null;
    walletWithdrawalId?: number | null;
    transactionNumber: string;
    type: string;
    typeLabel: string;
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    description?: string | null;
    isCredit: boolean;
    createdAt: string;
    updatedAt: string;
    user?: User;
    outlet?: Outlet;
}

export interface WalletTransactionFilters extends BaseFilters {
    type?: string;
    startDate?: string;
    endDate?: string;
}

export interface WalletTransactionSortOptions extends BaseSortOptions {
    column: 'created_at' | 'amount' | 'type';
}
```

### Step 9.2 — [CREATE] `resources/js/types/withdrawal_bank.ts`

### Step 9.3 — [CREATE] `resources/js/types/owner_bank_account.ts`

### Step 9.4 — [CREATE] `resources/js/types/wallet_withdrawal.ts`

```typescript
export type WalletWithdrawalStatus =
    'pending' | 'processing' | 'paid' | 'rejected' | 'cancelled';

export interface WalletWithdrawal {
    id: number;
    userId: number;
    ownerBankAccountId?: number | null;
    code: string;
    requestedAmount: number;
    adminFee: number;
    netAmount: number;
    status: WalletWithdrawalStatus;
    statusLabel: string;
    statusColor: string;
    bankName: string;
    bankCode?: string | null;
    accountNumber: string;
    accountHolderName: string;
    adminNote?: string | null;
    proofPath?: string | null;
    proofUrl?: string | null;
    processedBy?: number | null;
    processedAt?: string | null;
    paidAt?: string | null;
    rejectedAt?: string | null;
    cancelledAt?: string | null;
    createdAt: string;
    updatedAt: string;
    user?: User;
    ownerBankAccount?: OwnerBankAccount;
    processedByUser?: User;
}

export interface WalletWithdrawalFilters extends BaseFilters {
    status?: WalletWithdrawalStatus | string;
    userId?: number;
    startDate?: string;
    endDate?: string;
}

export interface WalletWithdrawalFormData {
    ownerBankAccountId: number;
    requestedAmount: number;
}
```

### Step 9.5 — [MODIFY] `resources/js/types/user.ts`

Tambahkan field `walletBalance: number;` setelah `coinBalance`.

### Step 9.6 — [MODIFY] `resources/js/types/index.d.ts`

Tambahkan exports baru dan update `AppNotification.request_type`.

---

## Phase 10 — Frontend Pages: Owner Wallet Dashboard

### Step 10.1 — [CREATE] `resources/js/Pages/Dashboard/Wallet/`

| File | Tugas |
|---|---|
| `Index.tsx` | Halaman utama wallet: balance overview + transaction history |
| `types.ts` | Page props interfaces |
| `columns.tsx` | DataView columns untuk wallet transactions |
| `filters.tsx` | Filter configs |
| `Partials/WalletBalanceOverview.tsx` | Card besar: wallet balance, available balance, pending withdrawal |
| `Partials/WalletStatChip.tsx` | Stat chip component (mirip `CourierStatChip`) |
| `Partials/WalletTransactionSection.tsx` | Section data table transaction history |

**WalletBalanceOverview**: Card dengan gradient banner (hijau-teal) menampilkan:
- Ikon Wallet besar dalam container glassmorphism
- "Saldo Pendapatan" (wallet_balance) — angka besar bold putih
- Stat chips: Available Balance, Pending Withdrawal, Total Transaksi
- Tombol "Tarik Saldo" → navigasi ke withdrawal create

**WalletTransactionSection**: DataView dengan columns:
- Transaction number
- Type + type label badge
- Amount (hijau positif / merah negatif)
- Balance after
- Description
- Created at

---

## Phase 11 — Frontend Pages: Owner Bank Accounts

### Step 11.1 — [CREATE] `resources/js/Pages/Dashboard/BankAccounts/`

| File | Tugas |
|---|---|
| `Index.tsx` | DataView list rekening owner |
| `Create.tsx` | Form tambah rekening |
| `Edit.tsx` | Form edit rekening |
| `columns.tsx` | DataView columns |
| `types.ts` | Page props |
| `Partials/BankAccountForm.tsx` | Shared form partial (create + edit) |
| `Partials/DeleteBankAccountModal.tsx` | Modal konfirmasi hapus |

---

## Phase 12 — Frontend Pages: Owner Wallet Withdrawals

### Step 12.1 — [CREATE] `resources/js/Pages/Dashboard/WalletWithdrawals/`

| File | Tugas |
|---|---|
| `Index.tsx` | DataView list withdrawal owner |
| `Create.tsx` | Form request withdrawal |
| `Show.tsx` | Detail withdrawal + timeline |
| `columns.tsx` | DataView columns |
| `filters.tsx` | Filter configs |
| `types.ts` | Page props |
| `Partials/WithdrawalForm.tsx` | Form: pilih rekening, input nominal, tampilkan estimasi |
| `Partials/WithdrawalSummaryCard.tsx` | Ringkasan: saldo tersedia, nominal, admin fee, net amount |
| `Partials/CancelWithdrawalModal.tsx` | Modal konfirmasi cancel |
| `Partials/WithdrawalStatusTimeline.tsx` | Visual timeline status lifecycle |

**WithdrawalForm** harus:
1. Dropdown pilih rekening aktif (tampilkan nama bank + nomor rekening)
2. Input nominal withdrawal
3. Otomatis kalkulasi dan tampilkan di `WithdrawalSummaryCard`:
   - Saldo tersedia
   - Nominal withdrawal
   - Biaya admin (dari rekening terpilih → withdrawalBank.adminFee)
   - Net amount = nominal - admin fee
4. Validasi frontend: nominal > 0, nominal <= available, net > 0, nominal >= min withdrawal
5. Tombol submit disabled jika validasi gagal

---

## Phase 13 — Frontend Pages: Super Admin

### Step 13.1 — [CREATE] `resources/js/Pages/Dashboard/Admin/WithdrawalBanks/`

CRUD bank master. Pattern identik dengan halaman master data lain:
- `Index.tsx`, `Create.tsx`, `Edit.tsx`
- `columns.tsx`, `types.ts`
- `Partials/WithdrawalBankForm.tsx`, `Partials/DeleteWithdrawalBankModal.tsx`

### Step 13.2 — [CREATE] `resources/js/Pages/Dashboard/Admin/WalletWithdrawals/`

Queue withdrawal processing. Pattern mirip `Deposits`:

| File | Tugas |
|---|---|
| `Index.tsx` | DataView semua withdrawal + filter status/owner/bank/date |
| `Show.tsx` | Detail withdrawal + action buttons |
| `columns.tsx` | Columns: code, owner, bank, amount, admin fee, net, status, aksi |
| `filters.tsx` | Filter: status, owner, bank, tanggal |
| `types.ts` | Page props |
| `Partials/ProcessWithdrawalModal.tsx` | Modal: tandai processing |
| `Partials/MarkPaidModal.tsx` | Modal: tandai paid + upload bukti + catatan |
| `Partials/RejectWithdrawalModal.tsx` | Modal: tolak + alasan wajib |
| `Partials/WithdrawalDetailCard.tsx` | Card detail: snapshot rekening, nominal, admin fee, timeline |

---

## Phase 14 — Frontend Services

### Step 14.1 — [CREATE] `resources/js/Services/wallet.service.ts`
### Step 14.2 — [CREATE] `resources/js/Services/owner_bank_account.service.ts`
### Step 14.3 — [CREATE] `resources/js/Services/wallet_withdrawal.service.ts`

Ikuti pattern `deposit.service.ts` — navigation helpers menggunakan `router.visit()`.

---

## Phase 15 — Notification Type Update

### Step 15.1 — [MODIFY] `resources/js/types/index.d.ts`

Tambahkan `'wallet_withdrawal'` ke union type `request_type` di `AppNotification`:

```typescript
request_type: "deposit" | "expense" | "petty_cash" | "wallet_withdrawal";
```

---

## Urutan Implementasi yang Disarankan

| Urutan | Phase | Dependency |
|---|---|---|
| 1 | Phase 1 — Migrations | - |
| 2 | Phase 2 — Models | Phase 1 |
| 3 | Phase 3 — Services | Phase 2 |
| 4 | Phase 4 — Form Requests | - |
| 5 | Phase 5 — API Resources | Phase 2 |
| 6 | Phase 6 — Controllers & Routes | Phase 3, 4, 5 |
| 7 | Phase 7 — Notifications | Phase 2 |
| 8 | Phase 8 — OrderService Hooks | Phase 3 |
| 9 | Phase 9 — Frontend Types | - |
| 10 | Phase 10 — Wallet Dashboard (FE) | Phase 6, 9 |
| 11 | Phase 11 — Bank Accounts (FE) | Phase 6, 9 |
| 12 | Phase 12 — Owner Withdrawals (FE) | Phase 6, 9 |
| 13 | Phase 13 — Admin Pages (FE) | Phase 6, 9 |
| 14 | Phase 14 — Frontend Services | Phase 6 |
| 15 | Phase 15 — Notification Types | Phase 7, 9 |

---

## Verification Checklist

- [ ] `wallet_balance` dan `coin_balance` tidak tercampur di UI maupun backend
- [ ] Withdrawal hanya mengurangi `wallet_balance`, bukan `coin_balance`
- [ ] `creditFromOrder()` bersifat idempotent (tidak double credit)
- [ ] COD tidak menambah wallet balance
- [ ] Available balance dihitung dengan benar (wallet_balance sudah dikurangi saat withdrawal dibuat)
- [ ] Snapshot rekening dan admin fee tersimpan di `wallet_withdrawals`
- [ ] Super admin menerima notifikasi saat withdrawal baru
- [ ] Owner menerima notifikasi saat withdrawal paid/rejected
- [ ] Withdrawal paid/rejected tidak bisa diproses ulang
- [ ] Owner hanya melihat withdrawal miliknya
- [ ] Semua warna menggunakan CSS variables / Tailwind theme classes
- [ ] Tidak ada hardcoded colors
- [ ] Tidak ada comment di kode
- [ ] Tidak ada file frontend > ~150 baris (dipecah ke Partials)
- [ ] Semua komponen reusable dari `@/Components/` digunakan dengan props yang benar
