# Ownership Strict Comparison and Stale Outlet Fetch General Fix Plan

## Summary

Perbaiki pola bug lintas modul dari `docs/issue/ownership_strict_comparison_and_stale_outlet_fetch_general_issue.md`:

- strict comparison pada foreign key Eloquent yang belum di-cast eksplisit;
- stale async fetch saat pilihan outlet berubah di frontend;
- tenant ownership gap eksplisit di `CustomerService::store()`.

Catatan penting: worktree mungkin sudah berisi sebagian perubahan cast model dari percobaan sebelumnya. Implementer harus mulai dengan `git diff`, perlakukan perubahan itu sebagai baseline, dan jangan revert perubahan unrelated.

## Scope

Termasuk:

- Cast integer untuk FK yang dipakai ownership atau tenant check.
- Normalisasi comparison FK yang memakai `===` atau `!==`.
- Guard ownership di `CustomerService::store()`.
- Hook frontend reusable untuk stale async response.
- Penerapan hook pada halaman outlet-dependent yang aktif.
- Regression tests dan build verification.

Tidak termasuk:

- Migration atau perubahan schema database.
- Perubahan route, API payload, atau response shape.
- Audit tenant gap penuh di semua service.
- Refactor besar ke Policy/Gate baru.
- Perubahan `Loans/Edit.tsx` jika file masih full commented-out.
- Perubahan `Payrolls/Create.tsx` jika data outlet masih hanya berasal dari props tanpa async fetch aktif.

## Backend Plan

### 1. Baseline Worktree

1. Jalankan `git status --short`.
2. Jalankan `git diff` untuk file yang sudah berubah.
3. Pisahkan perubahan task ini dari perubahan employee/position existing.
4. Jangan revert file employee/position yang sudah menjadi scope plan lain.

### 2. Add Integer Casts for FK Columns

Pastikan model berikut punya cast integer untuk FK relevan:

- `Account`: `owner_id`, `outlet_id`, `parent_id`
- `Customer`: `outlet_id`, `customer_account_id`
- `CustomerSubscription`: `customer_id`, `service_package_id`
- `MembershipContract`: `customer_id`, `outlet_id`, `membership_plan_id`
- `MembershipPlan`: `outlet_id`
- `CourierSchedule`: `outlet_id`, `operational_day_id`
- `CourierSetting`: `outlet_id`
- `Prive`: `outlet_id`, `user_id`, `source_account_id`, `equity_account_id`
- `Topup`: `user_id`, `outlet_id`
- `Expense`: `outlet_id`, `user_id`, `employee_id`, `expense_account_id`, `source_account_id`, `approved_by`, `journal_entry_id`
- `WalletWithdrawal`: `user_id`, `owner_bank_account_id`, `processed_by`
- `ServicePackage`: `outlet_id`
- `Category`: `outlet_id`
- `LaundryService`: `category_id`, `unit_id`

Verify existing casts tetap ada:

- `Outlet`: `owner_id`
- `Position`: `outlet_id`
- `Employee`: `outlet_id`

### 3. Normalize Strict FK Comparisons

Ubah comparison FK yang rawan type mismatch menjadi salah satu pola berikut:

```php
(int) $model->outlet_id !== (int) $outletId
```

atau untuk owner outlet:

```php
$outlet->isOwner($user)
```

Target prioritas:

- `AccountService`: owner check account.
- `CustomerService`: package outlet vs customer outlet.
- `ExpenseService`: outlet owner check.
- `EmployeeService`: laundry service/customer/owner checks yang masih strict.
- `OutletService`: outlet owner check, courier setting outlet check, employee outlet access.
- `MembershipPlanService`: owner modify check.
- `MembershipContractService`: owner modify check dan membership plan ID comparison.
- `PriveService`: owner outlet check.
- `TopupService`: owner outlet check.
- `WalletWithdrawalService`: withdrawal owner check.
- `CourierScheduleController`: schedule outlet check.
- `CustomerController`: subscription/contract customer check.
- `OrderService`: order item outlet consistency check.
- `PayrollService`: employee outlet check.

Hindari mengubah strict comparison yang bukan FK tenant/ownership, misalnya enum/status string dan boolean form state.

### 4. Add Customer Store Ownership Guard

Tambahkan guard di `CustomerService::store()` sebelum create:

- `super_admin`: boleh membuat customer untuk semua outlet.
- `owner`: hanya boleh untuk outlet miliknya.
- `employee`: hanya boleh untuk outlet yang ada di `getAccessibleOutletIds()`.
- user lain: ditolak.

Gunakan `Outlet::findOrFail($outletId)` untuk memastikan outlet valid dan `Outlet::isOwner($user)` untuk owner check.

Behavior baru:

- Owner membuat customer pada outlet sendiri: sukses.
- Owner membuat customer pada outlet owner lain: ditolak.
- Super admin: tetap sukses untuk semua outlet.

Jika implementer menemukan service lain tanpa ownership check, catat follow-up issue. Jangan perluas scope kecuali ada test existing yang langsung gagal.

## Frontend Plan

### 1. Create Reusable Stale Response Hook

Buat hook di `resources/js/Hooks`, misalnya:

```ts
useLatestAsync
```

Prinsip:

- Simpan `sequenceRef`.
- Simpan `currentKeyRef`.
- Setiap request baru menaikkan sequence dan menulis current key.
- Handler `onSuccess`, `onError`, dan `onFinally` hanya boleh jalan jika sequence dan key masih current.
- Jangan pakai `AbortController` supaya kompatibel dengan service campuran `fetch` dan `axios`.

API disarankan:

```ts
const { runLatest, isLatest } = useLatestAsync();

runLatest(key, async () => {
  return await serviceCall(key);
}, {
  onSuccess: (result) => {},
  onError: (error) => {},
  onFinally: () => {},
});
```

### 2. Apply Hook to Outlet-Dependent Fetches

Terapkan pada halaman aktif berikut:

- `resources/js/Pages/Dashboard/MembershipContracts/Create.tsx`
- `resources/js/Pages/Dashboard/ServicePackages/Create.tsx`
- `resources/js/Pages/Dashboard/FineLogs/Create.tsx`
- `resources/js/Pages/Dashboard/CustomerSubscriptions/Create.tsx`
- `resources/js/Pages/Dashboard/Loans/Create.tsx`
- `resources/js/Pages/Dashboard/LaundryServices/Create.tsx`
- `resources/js/Pages/Dashboard/Expenses/Create.tsx`
- `resources/js/Pages/Dashboard/Expenses/Edit.tsx`
- `resources/js/Pages/Dashboard/Outlets/Courier/Partials/ZoneEditor.tsx`

Saat outlet berubah:

- Clear dependent selected IDs.
- Clear option lists.
- Clear error state.
- Set loading state untuk request baru.
- Pastikan response lama tidak bisa mengubah list, selected IDs, error state, atau loading state.

Per halaman:

- Membership contract create: guard customers dan membership plans.
- Service package create: guard laundry services.
- Fine log create: guard employees dan fines.
- Customer subscription create: guard customers dan service packages.
- Loan create: guard employees dan funding accounts.
- Laundry service create: guard categories.
- Expense create/edit: guard expense accounts dan source accounts.
- Courier zone editor: guard district options dan village options per district.

### 3. Files to Leave Alone

- `Loans/Edit.tsx`: jangan ubah jika masih seluruhnya commented-out.
- `Payrolls/Create.tsx`: jangan ubah jika masih memakai employees dari outlet props dan preview hanya dipicu tombol/manual action.

## Tests

### 1. Model Cast Regression

Tambahkan unit test untuk memastikan FK yang relevan kembali sebagai `int` setelah model di-fetch.

Minimal model yang perlu dicakup:

- `Account`
- `Customer`
- `CustomerSubscription`
- `MembershipContract`
- `MembershipPlan`
- `CourierSchedule`
- `Prive`
- `Topup`
- `Expense`
- `WalletWithdrawal`
- `ServicePackage`
- `CourierSetting`

Tambahkan test `Outlet::isOwner()`:

- true untuk owner valid walau ID dibandingkan dengan nilai string.
- false untuk owner lain.

### 2. Customer Store Guard

Tambahkan feature/service test:

- owner membuat customer di outlet sendiri: sukses.
- owner membuat customer di outlet owner lain: ditolak.
- super_admin membuat customer di outlet mana pun: sukses.

### 3. Regression Flow Tests

Jalankan atau tambahkan targeted tests untuk flow high-risk:

- expense create/update ownership.
- topup outlet ownership.
- prive outlet ownership.
- membership plan/contract owner modification.
- wallet withdrawal cancel owner check.
- courier schedule update/delete owner or outlet check.
- existing employee/position cross-outlet tests.

## Verification Commands

Backend:

```powershell
php -l app\Models\Account.php
php -l app\Models\Customer.php
php -l app\Models\CustomerSubscription.php
php -l app\Models\MembershipContract.php
php -l app\Models\MembershipPlan.php
php -l app\Models\CourierSchedule.php
php -l app\Models\Prive.php
php -l app\Models\Topup.php
php -l app\Models\Expense.php
php -l app\Models\WalletWithdrawal.php
php -l app\Services\CustomerService.php
```

Targeted tests:

```powershell
php artisan test tests/Unit/Models
php artisan test tests/Feature/Rbac/CrossOutletAssignmentTest.php
php artisan test --filter=Customer
```

Frontend:

```powershell
npm run build
```

Manual QA:

- Aktifkan network throttling.
- Pilih outlet A lalu cepat pilih outlet B.
- Pastikan data akhir selalu milik outlet B.
- Pastikan selected IDs dari outlet A kosong atau tidak ikut terkirim.

## Acceptance Criteria

- FK tenant/ownership yang relevan sudah di-cast integer.
- Strict FK comparison yang rawan type mismatch sudah dinormalisasi.
- `CustomerService::store()` menolak owner membuat customer di outlet owner lain.
- Super admin tetap bisa membuat customer untuk semua outlet.
- Frontend outlet-dependent fetch aman dari stale response.
- Tidak ada route/API payload/response/migration baru.
- Existing employee/position cross-outlet tests tetap hijau.
