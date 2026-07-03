# Issue: Pola Bug yang Sama dengan Insiden Employee/Position Ditemukan di Banyak Modul Lain (General)

## Context

Setelah investigasi insiden production di `docs/issue/owner_create_employee_position_production_failure_issue.md` (owner tidak bisa membuat employee/position), user meminta pengecekan menyeluruh: apakah pola masalah yang sama juga ada di bagian lain aplikasi.

Dua pola akar masalah yang teridentifikasi di issue sebelumnya:

1. **Backend** — perbandingan strict PHP (`===`/`!==`) untuk cek kepemilikan (`owner_id`, `outlet_id`, dst.) pada atribut Eloquent yang **tidak di-cast eksplisit** ke `integer`, sehingga rawan false-negative kalau representasi tipe dari database berbeda antara satu fetch dengan fetch lain/antar environment.
2. **Frontend** — fetch asynchronous yang dipicu perubahan pilihan outlet (`useEffect`/`onChange` → `await xxxService.getXxxByOutletId()`) tanpa guard terhadap **out-of-order response** (tidak ada `AbortController` atau pengecekan id terkini saat response tiba), sehingga hasil fetch untuk outlet yang sudah tidak dipilih bisa menimpa state untuk outlet yang sedang dipilih.

Hasil audit: **kedua pola ini bukan kasus terisolasi di modul Employee/Position** — ditemukan berulang di banyak service, model, controller, dan halaman frontend lain. Dokumen ini murni hasil audit/debugging (tidak ada perubahan kode), disusun sebagai acuan umum untuk AI model lain yang akan menyusun implementation plan perbaikan lintas modul.

Catatan penting soal severity: pola #1 secara konsisten menyebabkan **false rejection** (menolak akses yang sebenarnya sah), bukan authorization bypass — karena operator `===`/`!==` pada dua tipe berbeda hanya bisa membuat nilai yang sebenarnya sama terlihat "tidak sama" (fail closed), bukan sebaliknya. Jadi dampaknya adalah fungsionalitas rusak/user terblokir, bukan lubang keamanan langsung — kecuali pada kasus di mana pengecekan ownership **tidak ada sama sekali** (lihat bagian 6), yang risikonya justru authorization gap sungguhan.

## Findings

### 1. Backend — pola strict comparison pada foreign key yang tidak di-cast, ditemukan di ±16 file

Pencarian `_id (===|!==) $...` dan `->id (===|!==) $...->id` di seluruh `app/` menemukan pola identik dengan yang menyebabkan insiden Position/Employee di banyak service dan model lain:

| File | Baris | Pola |
|---|---|---|
| `app/Services/AccountService.php` | 1556 | `$account->owner_id === $user->id` |
| `app/Services/CustomerService.php` | 270 | `$servicePackage->outlet_id !== $customer->outlet_id` |
| `app/Services/ExpenseService.php` | 231 | `$outlet->owner_id !== $this->resolveOwnerId()` |
| `app/Models/Employee.php` | 560, 566 | `$position->outlet_id !== $this->outlet_id` (`validatePositionOwnership`) |
| `app/Services/EmployeeService.php` | 1018, 1134, 1148 | `...->outlet_id !== $employee->outlet_id` |
| `app/Services/EmployeeService.php` | 1599, 1610 | `$outlet->owner_id === $user->id`, `$employee->outlet->owner_id === $user->id` |
| `app/Services/EmployeeService.php` | 1678, 1682 | sudah dibahas di issue sebelumnya |
| `app/Services/OutletService.php` | 448, 869, 2138, 2149 | `$outlet->owner_id !== $user->id`, `$setting->outlet_id !== $outletId`, `$user->outlet_id === $outlet->id`, `$user->id === $outlet->owner_id` |
| `app/Services/MembershipPlanService.php` | 259 | `$membershipPlan->outlet->owner_id === $user->id` |
| `app/Services/PositionService.php` | 132, 178, 219, 253, 289, 374 | sudah dibahas di issue sebelumnya (6 titik) |
| `app/Services/MembershipContractService.php` | 312 | `$contract->outlet->owner_id === $user->id` |
| `app/Services/PriveService.php` | 145 | `$outlet->owner_id !== $user->id` |
| `app/Services/TopupService.php` | 125 | `$outlet->owner_id !== $user->id` |
| `app/Services/WalletWithdrawalService.php` | 328 | `$withdrawal->user_id !== $userId` |
| `app/Models/Outlet.php` | 398 | `isOwner()` — helper ada tapi tidak dipakai konsisten |
| `app/Http/Controllers/Api/CourierScheduleController.php` | 101, 161, 207 | `$schedule->outlet_id !== $outletId` |
| `app/Http/Controllers/Web/CustomerController.php` | 532, 629, 666, 709 | `$subscription->customer_id !== $customerId`, `$contract->customer_id !== $customerId` |

Total sekitar 35 titik pemanggilan di 17 file. Semua memakai pola yang sama persis dengan yang terbukti bermasalah di `PositionService`/`EmployeeService`: membandingkan atribut foreign key hasil fetch Eloquent (tidak di-cast) dengan operator strict.

Model-model terkait (`Account`, `Customer`, `CustomerSubscription`, `MembershipContract`, `MembershipPlan`, `CourierSchedule`, `Prive`, `Topup`, `Expense`, `WalletWithdrawal`, `Outlet`) sudah dicek satu per satu — **tidak ada satupun yang men-cast kolom foreign key-nya** (`owner_id`, `outlet_id`, `customer_id`, `user_id`) ke `integer` di method `casts()`. Ini konsisten dengan temuan di issue sebelumnya untuk `Position`/`Outlet`.

### 2. Konfirmasi: bukan bug baru, tapi pola desain yang sudah lama ada

`PositionPolicy` (satu-satunya Policy class di aplikasi) memakai pola yang sama di 5 method (`update`, `destroy`, `restore`, `forceDestroy`, `updatePermissions`). Ini menunjukkan pola ini sudah menjadi kebiasaan penulisan kode sejak awal (bukan regresi dari perubahan terbaru), dan baru "meledak" jadi bug yang terlihat user ketika fitur cross-outlet courier permission (baru) menambahkan jalur yang benar-benar bergantung pada hasil perbandingan ini untuk memutuskan boleh/tidaknya sebuah aksi pada data multi-outlet nyata.

### 3. Frontend — pola "fetch by outlet tanpa guard stale-response" ditemukan di ±11 halaman lain

Selain `resources/js/Pages/Dashboard/Employees/Create.tsx` (sudah dibahas di issue sebelumnya), pola `useEffect`/`onChange` yang memicu `await xxxService.getXxxByOutletId(outletId)` tanpa pembanding id terkini ditemukan juga di:

1. `resources/js/Pages/Dashboard/MembershipContracts/Create.tsx` — `loadCustomersByOutlet` + `loadMembershipPlansByOutlet`, dipicu `useEffect` pada `selectedOutlet` (baris 58-123).
2. `resources/js/Pages/Dashboard/ServicePackages/Create.tsx` — `handleOutletChange` → `fetchLaundryServices(outletId)` (baris 82-110), tidak menunggu fetch sebelumnya selesai/dibatalkan sebelum fetch baru dimulai.
3. `resources/js/Pages/Dashboard/FineLogs/Create.tsx` — `loadOptionsByOutlet` (baris 58) + `useEffect` (baris 112).
4. `resources/js/Pages/Dashboard/CustomerSubscriptions/Create.tsx` — dua `useEffect` terkait outlet (baris 89, 106).
5. `resources/js/Pages/Dashboard/Loans/Create.tsx` — fetch `employeeService.getAll(outletId)` dan `accountService.getFundingAccountsByOutlet(outletId)` di dalam `useEffect` (baris 69-107).
6. `resources/js/Pages/Dashboard/Loans/Edit.tsx` — pola serupa.
7. `resources/js/Pages/Dashboard/Payrolls/Create.tsx` — `useEffect` bergantung outlet.
8. `resources/js/Pages/Dashboard/LaundryServices/Create.tsx` — `useEffect` bergantung outlet.
9. `resources/js/Pages/Dashboard/Expenses/Create.tsx` — `loadAccountsByOutlet` (baris 61) → `getExpenseAccountsByOutlet`/`getFundingAccountsByOutlet`, dipicu `useEffect` (baris 107).
10. `resources/js/Pages/Dashboard/Expenses/Edit.tsx` — pola serupa dengan Create.
11. `resources/js/Pages/Dashboard/Outlets/Courier/Partials/ZoneEditor.tsx` — `useEffect` bergantung outlet.

Pengecekan tambahan: **tidak ada satupun pemakaian `AbortController`/`abortController`/`signal:` di seluruh folder `resources/js`** (hasil pencarian kosong total). Ini konfirmasi bahwa guard stale-response memang belum pernah jadi pola standar di codebase frontend ini — bukan cuma "lupa" di satu halaman, tapi memang belum ada precedent sama sekali untuk pola ini di seluruh aplikasi.

### 4. Dampak relatif per halaman

Dampak konkret dari race condition ini sebanding dengan seberapa "destruktif" konsekuensi salah pilih opsi di halaman terkait:

- **Employees/Create.tsx**: sudah terbukti menyebabkan error production nyata (lihat issue sebelumnya) — salah posisi bisa membuat submit gagal total atau (secara teori, kalau kombinasinya lolos validasi) menugaskan employee ke posisi outlet yang salah.
- **Loans/Create.tsx, Expenses/Create.tsx**: salah pilih akun (`account`) akibat race condition bisa membuat pencatatan keuangan (loan/expense) tercatat ke akun akuntansi outlet yang salah — dampak data finansial, bukan cuma UX.
- **MembershipContracts/Create.tsx, CustomerSubscriptions/Create.tsx, ServicePackages/Create.tsx**: salah pilih customer/paket/layanan akibat race condition berisiko membuat kontrak/subscription tercatat untuk customer atau outlet yang salah.
- **FineLogs/Create.tsx, Payrolls/Create.tsx, ZoneEditor.tsx**: dampak serupa pada domain masing-masing (denda karyawan, payroll, zona kurir).

Semua ini butuh audit lebih detail per halaman untuk memastikan skenario race yang benar-benar bisa terjadi (tergantung apakah backend punya validasi susulan seperti yang menyelamatkan — meski dengan cara "gagal" — kasus Employee/Position).

### 5. Gap terpisah yang ikut ditemukan — tenant ownership check yang hilang sama sekali (bukan strict-comparison, tapi ketiadaan check)

Selain pola "check ada tapi rawan false-negative", ditemukan juga pola yang justru **lebih berisiko dari sisi keamanan**: service yang menerima `outletId`/`customerId` dari request tapi tidak memverifikasi kepemilikannya sama sekali.

- `app/Services/CustomerService.php:114-148` (`store()`) — sudah dibahas di issue sebelumnya. Tidak ada validasi bahwa `outletId` yang dikirim adalah outlet milik owner yang login.

Ini baru satu contoh yang sempat dicek detail sebelumnya. Karena polanya "ketiadaan kode" (bukan pola teks yang bisa di-grep), daftar lengkap butuh audit manual per service — direkomendasikan sebagai langkah lanjutan terpisah (lihat Recommended Fix Direction poin 6), bukan diklaim lengkap di sini.

## Recommended Fix Direction

### Backend — perbaikan tipe data terpusat, bukan tambal satu-satu

1. Tambahkan cast eksplisit `integer` untuk seluruh kolom foreign key (`owner_id`, `outlet_id`, `user_id`, `customer_id`, dst.) di **semua** model yang disebut pada temuan #1, bukan hanya `Position`/`Outlet` yang sudah direkomendasikan di issue sebelumnya. Ini perbaikan defensif berisiko rendah dan bisa diterapkan serentak.
2. Karena jumlah titik lumayan banyak (17 file, ±35 lokasi), pertimbangkan audit terpusat: buat checklist semua model dengan kolom `*_id` yang dipakai untuk perbandingan otorisasi/tenant-scoping, lalu pastikan semuanya konsisten di-cast.
3. Jangan berhenti di cast saja — pertimbangkan mengganti pola "hand-rolled `!==`/`===` di dalam service" dengan Policy/Gate terpusat per model (baru ada 1 Policy di seluruh app, yaitu `PositionPolicy`, dan ironisnya Policy itu juga memakai pola strict comparison yang sama). Ini konsolidasi struktural, bukan sekadar type-safety.

### Frontend — buat guard stale-response jadi pola standar, terapkan ke semua titik yang ditemukan

4. Buat satu helper/hook reusable (misalnya `useLatestAsync`/`useAbortableEffect`) yang membungkus pola "fetch data berdasarkan id yang berubah" dengan guard stale-response (baik lewat `AbortController` atau lewat pembanding id/ref), lalu terapkan ke seluruh 12 lokasi yang teridentifikasi (Employees/Create.tsx dari issue sebelumnya + 11 file pada temuan #3). Membuat satu helper reusable lebih aman daripada menambal manual di 12 tempat berbeda dengan gaya berbeda-beda.
5. Prioritaskan perbaikan di halaman dengan dampak data finansial dulu (`Loans/Create.tsx`, `Loans/Edit.tsx`, `Expenses/Create.tsx`, `Expenses/Edit.tsx`, `MembershipContracts/Create.tsx`), baru ke halaman lain.

### Audit lanjutan yang direkomendasikan (di luar scope dokumen ini, perlu plan terpisah)

6. Audit semua method `store()`/`update()` pada service yang menerima `outletId`/`customerId` dari request untuk memastikan ada validasi kepemilikan (bukan hanya cek foreign key exists), mengikuti temuan #5 pada `CustomerService`. Ini butuh audit manual per service karena bukan pola teks yang bisa di-grep otomatis.
7. Setelah perbaikan cast diterapkan, jalankan regression test menyeluruh untuk memastikan tidak ada perubahan perilaku pada pengecekan yang sebelumnya (secara kebetulan) selalu benar karena tipe data yang konsisten di environment testing.

## Acceptance Criteria

- Seluruh kolom foreign key yang dipakai untuk pengecekan ownership/tenant-scoping pada file-file di temuan #1 sudah di-cast eksplisit ke `integer`.
- Tidak ada lagi perbandingan `===`/`!==` pada foreign key yang berpotensi type-mismatch tanpa cast di baliknya.
- Semua halaman pada temuan #3 memakai pola fetch-by-outlet yang aman dari race condition (response dari outlet yang sudah tidak dipilih tidak lagi bisa menimpa state outlet yang sedang aktif).
- `CustomerService::store()` (dan service lain yang ditemukan pada audit lanjutan poin 6) memvalidasi kepemilikan outlet/customer sebelum membuat data.
- Tidak ada regresi pada validasi ownership yang memang harus tetap menolak akses lintas-tenant.

## Suggested Tests

- Unit test model: untuk setiap model pada temuan #1, assert bahwa kolom FK yang relevan selalu bertipe `int` PHP setelah fetch, walau nilai mentah dari DB berupa string (mock/stub query result kalau perlu).
- Feature test per service pada temuan #1: owner dengan multi-outlet melakukan aksi valid pada outletnya sendiri → sukses; owner mencoba aksi sama pada outlet owner lain → tetap ditolak (regresi keamanan, bukan cuma type-safety).
- Test/QA manual frontend untuk setiap halaman pada temuan #3: throttle network di devtools, pilih outlet A lalu segera pilih outlet B sebelum fetch A selesai, pastikan data akhir yang tampil/tersimpan selalu sesuai outlet B.
- Feature test `CustomerService::store()`: owner mencoba membuat customer dengan `outletId` milik owner lain → harus ditolak setelah perbaikan.

## Files To Inspect During Plan

Backend (strict comparison / cast):
- `app/Services/AccountService.php`, `app/Services/CustomerService.php`, `app/Services/ExpenseService.php`, `app/Services/OutletService.php`, `app/Services/MembershipPlanService.php`, `app/Services/MembershipContractService.php`, `app/Services/PriveService.php`, `app/Services/TopupService.php`, `app/Services/WalletWithdrawalService.php`
- `app/Models/Employee.php`, `app/Models/Outlet.php`, `app/Models/Account.php`, `app/Models/Customer.php`, `app/Models/CustomerSubscription.php`, `app/Models/MembershipContract.php`, `app/Models/MembershipPlan.php`, `app/Models/CourierSchedule.php`, `app/Models/Prive.php`, `app/Models/Topup.php`, `app/Models/Expense.php`, `app/Models/WalletWithdrawal.php`
- `app/Policies/PositionPolicy.php`
- `app/Http/Controllers/Api/CourierScheduleController.php`, `app/Http/Controllers/Web/CustomerController.php`

Frontend (stale-response race condition):
- `resources/js/Pages/Dashboard/MembershipContracts/Create.tsx`
- `resources/js/Pages/Dashboard/ServicePackages/Create.tsx`
- `resources/js/Pages/Dashboard/FineLogs/Create.tsx`
- `resources/js/Pages/Dashboard/CustomerSubscriptions/Create.tsx`
- `resources/js/Pages/Dashboard/Loans/Create.tsx`
- `resources/js/Pages/Dashboard/Loans/Edit.tsx`
- `resources/js/Pages/Dashboard/Payrolls/Create.tsx`
- `resources/js/Pages/Dashboard/LaundryServices/Create.tsx`
- `resources/js/Pages/Dashboard/Expenses/Create.tsx`
- `resources/js/Pages/Dashboard/Expenses/Edit.tsx`
- `resources/js/Pages/Dashboard/Outlets/Courier/Partials/ZoneEditor.tsx`

Referensi:
- `docs/issue/owner_create_employee_position_production_failure_issue.md` (insiden asal yang memicu audit ini)
