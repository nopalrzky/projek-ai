# Implementation Plan: Permission Granular Cashier App Berbasis Position

**Sumber user need:** [`cashier_granular_position_permission_user_need.md`](file:///C:/Bimo/Project/wash_wallet/docs/user_need/cashier_granular_position_permission_user_need.md)
**Tanggal:** 2026-06-29

---

## Ringkasan

Plan ini menguraikan perubahan teknis untuk memperbarui sistem permission cashier agar lebih granular. Perubahan mencakup tiga lapisan: **Backend Laravel** (enum, middleware, routes), **Website Owner** (catalog endpoint & PermissionSelector), dan **Flutter Cashier App** (auth gate, navigation, route guard, no-permission UX).

Permission lama yang kasar (`order.manage`, `payment.manage`, `service.manage`, `customer.manage`) dipecah menjadi permission granular per fitur dan per action. Posisi existing akan dimigrasikan otomatis sehingga tidak kehilangan akses.

---

## Keputusan Teknis yang Ditetapkan Plan Ini

### D-01: Nama Key Final Permission

Permission baru menggunakan nama berikut (final, tidak berubah lagi di PR ini):

| Key | Label Indonesia |
|-----|----------------|
| `cashier_dashboard.view` | Lihat Dashboard Kasir |
| `order.view` | Lihat Order |
| `order.create` | Buat Order |
| `order.update` | Edit Order |
| `order.delete` | Hapus Order |
| `order.accept` | Terima Order |
| `order.reject` | Tolak Order |
| `order.start` | Mulai Order |
| `order.complete` | Selesaikan Order |
| `order.weigh` | Timbang Order |
| `order.payment.manage` | Kelola Pembayaran Order |
| `order.print` | Cetak Struk dan Label |
| `order.wa_notification.preview` | Preview Notifikasi WA |
| `order.wa_notification.send` | Kirim Notifikasi WA |
| `customer.view` | Lihat Customer |
| `customer.create` | Buat Customer |
| `customer.update` | Edit Customer |
| `customer.delete` | Hapus Customer |
| `customer_subscription.view` | Lihat Subscription Customer |
| `customer_subscription.create` | Buat Subscription Customer |
| `customer_subscription.update` | Edit Subscription Customer |
| `customer_subscription.delete` | Hapus Subscription Customer |
| `membership_plan.view` | Lihat Paket Membership |
| `membership_contract.view` | Lihat Kontrak Membership |
| `membership_contract.create` | Buat Kontrak Membership |
| `category.view` | Lihat Kategori Layanan |
| `category.create` | Buat Kategori Layanan |
| `category.update` | Edit Kategori Layanan |
| `category.delete` | Hapus Kategori Layanan |
| `laundry_service.view` | Lihat Layanan Laundry |
| `laundry_service.create` | Buat Layanan Laundry |
| `laundry_service.update` | Edit Layanan Laundry |
| `laundry_service.delete` | Hapus Layanan Laundry |
| `service_package.view` | Lihat Paket Layanan |
| `unit.view` | Lihat Unit |
| `account.view` | Lihat Akun Keuangan |
| `deposit.view` | Lihat Setoran |
| `deposit.create` | Buat Setoran |
| `deposit.update` | Edit Setoran |
| `petty_cash.view` | Lihat Petty Cash |
| `petty_cash.create` | Buat Petty Cash |
| `petty_cash.update` | Edit Petty Cash |
| `expense.view` | Lihat Pengeluaran Outlet |
| `expense.create` | Buat Pengeluaran Outlet |
| `expense.update` | Edit Pengeluaran Outlet |
| `expense.delete` | Hapus Pengeluaran Outlet |

> **Catatan `expense.delete`:** Hanya diaktifkan di Permission enum jika endpoint `DELETE /expenses/{id}` sudah tersedia di backend. Saat ini route terdaftar tapi controller destroy belum tersedia—implementer harus verifikasi dan menambahkan atau menonaktifkan permission ini.

### D-02: Strategi Compatibility Permission Lama

**Pilihan: Migrasi data langsung via Laravel migration** (bukan alias runtime).

Setelah deploy, setiap row di `position_permissions` yang masih memakai key lama akan digantikan dengan banyak key granular sesuai mapping. Tidak ada alias runtime di enum agar tidak menambah kompleksitas jangka panjang.

Mapping migrasi:

| Permission lama (dihapus) | Permission granular baru (ditambahkan) |
|--------------------------|---------------------------------------|
| `order.view` | `cashier_dashboard.view`, `order.view` |
| `order.create` | `order.create` |
| `order.manage` | `order.update`, `order.delete`, `order.accept`, `order.reject`, `order.start`, `order.complete`, `order.weigh`, `order.wa_notification.preview`, `order.wa_notification.send` |
| `payment.manage` | `account.view`, `order.payment.manage`, `deposit.view`, `deposit.create`, `deposit.update`, `petty_cash.view`, `petty_cash.create`, `petty_cash.update`, `expense.view`, `expense.create`, `expense.update` |
| `customer.view` | `customer.view`, `customer_subscription.view`, `membership_plan.view`, `membership_contract.view` |
| `customer.manage` | `customer.create`, `customer.update`, `customer.delete`, `customer_subscription.create`, `customer_subscription.update`, `customer_subscription.delete`, `membership_contract.create` |
| `service.view` | `category.view`, `laundry_service.view`, `service_package.view`, `unit.view` |
| `service.manage` | `category.create`, `category.update`, `category.delete`, `laundry_service.create`, `laundry_service.update`, `laundry_service.delete` |

Permission lama `production.view`, `production.manage`, `courier.view`, `courier.manage` **tidak diubah** karena di luar scope.

### D-03: Gate Masuk Cashier App

Gate lama: `employee.hasOrderViewPermission` (hanya cek `order.view`).

Gate baru: employee boleh masuk jika punya **minimal satu** dari daftar permission operasional cashier berikut:

```
cashier_dashboard.view, order.view, order.create, order.update, order.delete,
order.accept, order.reject, order.start, order.complete, order.weigh,
order.payment.manage, order.print, order.wa_notification.preview, order.wa_notification.send,
customer.view, customer.create, customer.update, customer.delete,
customer_subscription.view, customer_subscription.create, customer_subscription.update, customer_subscription.delete,
membership_plan.view, membership_contract.view, membership_contract.create,
category.view, category.create, category.update, category.delete,
laundry_service.view, laundry_service.create, laundry_service.update, laundry_service.delete,
service_package.view, unit.view, account.view,
deposit.view, deposit.create, deposit.update,
petty_cash.view, petty_cash.create, petty_cash.update,
expense.view, expense.create, expense.update, expense.delete
```

Permission setting lokal (profile, PIN, printer) tidak masuk hitungan gate karena sifatnya akun pribadi.

### D-04: Read Dependency Form Create/Edit

| Form | Strategi dependency |
|------|---------------------|
| Create Order | `order.create` mengizinkan baca list customer, laundry service, membership plan, account, unit via endpoint konteks (tanpa cek permission view dependency). Backend: gunakan middleware permissive atau endpoint konteks terpisah. |
| Create Laundry Service | `laundry_service.create` mengizinkan baca list category tanpa `category.view` (via endpoint read-only category yang diproteksi `laundry_service.create`). |
| Create Customer Subscription | `customer_subscription.create` mengizinkan baca membership plan tanpa `membership_plan.view`. |
| Create Membership Contract | `membership_contract.create` — customer sudah ada di context. |

Pendekatan: buat atau gunakan **endpoint konteks** yang ada (seperti `GET /orders/context-info`) yang diproteksi permission create/update yang relevan, bukan permission view dependency. Implementer harus menentukan endpoint konteks mana yang perlu ditambahkan.

### D-05: `order.print` Permission

`order.print` adalah permission tersendiri dan **tidak** otomatis ikut `order.view`. Route print di `routes/api.php` menggunakan middleware `position.permission:order.manage` (untuk receipt dan label) dan `order.view` (untuk info). Ketiga middleware ini harus diubah ke `order.print`.

---

## Komponen yang Diubah

---

### Komponen 1: Backend — Permission Enum

#### [MODIFY] [`Permission.php`](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/app/Enums/Permission.php)

- Tambah 46 case baru granular cashier (lihat D-01, termasuk `order.print`).
- Pertahankan case lama `production.view`, `production.manage`, `courier.view`, `courier.manage`.
- Hapus case lama yang akan digantikan: `OrderManage`, `PaymentManage`, `CustomerManage`, `ServiceView`, `ServiceManage`. **Perhatian:** penghapusan ini membuat validasi request menolak key lama secara otomatis. Ini intentional karena data sudah dimigrasikan.
- Update method `label()` untuk semua case baru.
- Update method `defaultForSlug('kasir')` agar menggunakan permission granular yang setara dengan kasir full-access (semua permission cashier kecuali production/courier).
- Pertahankan `defaultForSlug('produksi')` dan `defaultForSlug('kurir')` apa adanya.

**Contoh struktur case baru:**

```php
// Dashboard
case CashierDashboardView = 'cashier_dashboard.view';

// Order granular
case OrderUpdate   = 'order.update';
case OrderDelete   = 'order.delete';
case OrderAccept   = 'order.accept';
case OrderReject   = 'order.reject';
case OrderStart    = 'order.start';
case OrderComplete = 'order.complete';
case OrderWeigh    = 'order.weigh';
case OrderPaymentManage = 'order.payment.manage';
case OrderPrint    = 'order.print';
case OrderWaNotificationPreview = 'order.wa_notification.preview';
case OrderWaNotificationSend    = 'order.wa_notification.send';

// Customer granular
case CustomerCreate = 'customer.create';
case CustomerUpdate = 'customer.update';
case CustomerDelete = 'customer.delete';
case CustomerSubscriptionView   = 'customer_subscription.view';
case CustomerSubscriptionCreate = 'customer_subscription.create';
case CustomerSubscriptionUpdate = 'customer_subscription.update';
case CustomerSubscriptionDelete = 'customer_subscription.delete';
case MembershipPlanView     = 'membership_plan.view';
case MembershipContractView   = 'membership_contract.view';
case MembershipContractCreate = 'membership_contract.create';

// Category granular
case CategoryView   = 'category.view';
case CategoryCreate = 'category.create';
case CategoryUpdate = 'category.update';
case CategoryDelete = 'category.delete';

// Laundry service granular
case LaundryServiceView   = 'laundry_service.view';
case LaundryServiceCreate = 'laundry_service.create';
case LaundryServiceUpdate = 'laundry_service.update';
case LaundryServiceDelete = 'laundry_service.delete';

// Service package & unit
case ServicePackageView = 'service_package.view';
case UnitView           = 'unit.view';

// Finance granular
case AccountView      = 'account.view';
case DepositView      = 'deposit.view';
case DepositCreate    = 'deposit.create';
case DepositUpdate    = 'deposit.update';
case PettyCashView    = 'petty_cash.view';
case PettyCashCreate  = 'petty_cash.create';
case PettyCashUpdate  = 'petty_cash.update';
case ExpenseView      = 'expense.view';
case ExpenseCreate    = 'expense.create';
case ExpenseUpdate    = 'expense.update';
case ExpenseDelete    = 'expense.delete'; // Hanya jika controller destroy tersedia
```

#### [MODIFY] [`PermissionCatalogController.php`](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/app/Http/Controllers/Api/PermissionCatalogController.php)

- Update response agar permission dikelompokkan per fitur. Tambahkan method `group()` di `Permission` enum atau lakukan grouping di controller.

Contoh response grouped:

```json
[
  {
    "group": "Dashboard Kasir",
    "permissions": [
      { "key": "cashier_dashboard.view", "label": "Lihat Dashboard Kasir" }
    ]
  },
  {
    "group": "Order",
    "permissions": [
      { "key": "order.view", "label": "Lihat Order" },
      { "key": "order.create", "label": "Buat Order" }
    ]
  }
]
```

---

### Komponen 2: Backend — Migration Data

#### [NEW] `database/migrations/YYYY_MM_DD_HHMMSS_migrate_cashier_position_permissions.php`

Migration mengkonversi permission lama ke granular baru. Pseudocode logic:

```php
// up():
// Gunakan DB::transaction()
// Untuk setiap mapping (key lama => [key granular baru...]):
//   1. Ambil semua position_id yang punya key lama di position_permissions
//   2. Untuk setiap position_id tersebut, insertOrIgnore semua key granular baru
//   3. Hapus semua row dengan key lama

// down():
// Log warning bahwa rollback tidak bisa dikembalikan sempurna
// Tidak ada operasi data (tidak rollback)
```

**Penting:** migration harus idempotent — gunakan `insertOrIgnore` agar aman dijalankan dua kali.

---

### Komponen 3: Backend — Routes API Cashier

#### [MODIFY] [`routes/api_mobile_cashier.php`](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/routes/api_mobile_cashier.php)

Tabel perubahan middleware per route:

| Route | Middleware Lama | Middleware Baru |
|-------|----------------|----------------|
| `GET /dashboard` | `order.view` | `cashier_dashboard.view,order.view` |
| `GET /accounts` | `payment.manage` | `account.view` |
| `GET /categories` | `service.view` | `category.view` |
| `GET /categories/{id}` | `service.view` | `category.view` |
| `POST /categories` | `service.manage` | `category.create` |
| `PUT /categories/{id}` | `service.manage` | `category.update` |
| `DELETE /categories/{id}` | `service.manage` | `category.delete` |
| `POST /categories/{categoryId}/laundry-services` | `service.manage` | `laundry_service.create` |
| `PUT /categories/{categoryId}/laundry-services/{id}` | `service.manage` | `laundry_service.update` |
| `DELETE /categories/{categoryId}/laundry-services/{id}` | `service.manage` | `laundry_service.delete` |
| `GET /laundry-services` | `service.view,order.manage` | `laundry_service.view,order.create,order.update` |
| `GET /laundry-services/{id}` | `service.view,order.manage` | `laundry_service.view,order.create,order.update` |
| `POST /laundry-services` | `service.manage` | `laundry_service.create` |
| `PUT /laundry-services/{id}` | `service.manage` | `laundry_service.update` |
| `DELETE /laundry-services/{id}` | `service.manage` | `laundry_service.delete` |
| `GET /customers` | `customer.view` | `customer.view` *(tidak berubah)* |
| `GET /customers/{id}` | `customer.view` | `customer.view` *(tidak berubah)* |
| `POST /customers` | `customer.manage` | `customer.create` |
| `PUT /customers/{id}` | `customer.manage` | `customer.update` |
| `DELETE /customers/{id}` | `customer.manage` | `customer.delete` |
| `POST /customers/{id}/customer-subscriptions` | `customer.manage` | `customer_subscription.create` |
| `PUT /customers/{id}/customer-subscriptions/{subId}` | `customer.manage` | `customer_subscription.update` |
| `POST /customers/{id}/membership-contracts` | `customer.manage` | `membership_contract.create` |
| `GET /customer-subscriptions` | `customer.view,order.manage` | `customer_subscription.view,order.create` |
| `GET /customer-subscriptions/{id}` | `customer.view,order.manage` | `customer_subscription.view,order.create` |
| `POST /customer-subscriptions` | `customer.manage` | `customer_subscription.create` |
| `PUT /customer-subscriptions/{id}` | `customer.manage` | `customer_subscription.update` |
| `DELETE /customer-subscriptions/{id}` | `customer.manage` | `customer_subscription.delete` |
| `GET /deposits` | `payment.manage` | `deposit.view` |
| `GET /deposits/{id}` | `payment.manage` | `deposit.view` |
| `POST /deposits` | `payment.manage` | `deposit.create` |
| `PUT /deposits/{id}` | `payment.manage` | `deposit.update` |
| `GET /expenses` | `payment.manage` | `expense.view` |
| `GET /expenses/{id}` | `payment.manage` | `expense.view` |
| `POST /expenses` | `payment.manage` | `expense.create` |
| `PUT /expenses/{id}` | `payment.manage` | `expense.update` |
| `DELETE /expenses/{id}` | `payment.manage` | `expense.delete` |
| `GET /membership-contracts` | `customer.view,order.manage` | `membership_contract.view,order.create` |
| `GET /membership-contracts/{id}` | `customer.view,order.manage` | `membership_contract.view,order.create` |
| `GET /membership-plans` | `customer.view` | `membership_plan.view` |
| `GET /membership-plans/{id}` | `customer.view` | `membership_plan.view` |
| `GET /orders` | `order.view` | `order.view` *(tidak berubah)* |
| `POST /orders` | `order.create` | `order.create` *(tidak berubah)* |
| `GET /orders/new-count` | `order.view` | `order.view` *(tidak berubah)* |
| `GET /orders/{id}` | `order.view` | `order.view` *(tidak berubah)* |
| `PUT /orders/{id}` | `order.manage` | `order.update` |
| `DELETE /orders/{id}` | `order.manage` | `order.delete` |
| `POST /orders/{id}/start` | `order.manage` | `order.start` |
| `POST /orders/{id}/complete` | `order.manage` | `order.complete` |
| `POST /orders/{id}/accept` | `order.manage` | `order.accept` |
| `POST /orders/{id}/reject` | `order.manage` | `order.reject` |
| `POST /orders/{id}/weigh` | `order.manage` | `order.weigh` |
| `POST /orders/{id}/mark-cod-paid` | `payment.manage` | `order.payment.manage` |
| `GET /orders/{id}/wa-notification-preview` | `order.view` | `order.wa_notification.preview` |
| `POST /orders/{id}/send-wa-notification` | `order.manage` | `order.wa_notification.send` |
| `GET /petty-cashes` | `payment.manage` | `petty_cash.view` |
| `GET /petty-cashes/{id}` | `payment.manage` | `petty_cash.view` |
| `POST /petty-cashes` | `payment.manage` | `petty_cash.create` |
| `PUT /petty-cashes/{id}` | `payment.manage` | `petty_cash.update` |
| `GET /service-packages` | `service.view` | `service_package.view` |
| `GET /service-packages/{id}` | `service.view` | `service_package.view` |
| `GET /units` | `service.view` | `unit.view` |
| `GET /orders/context-info/{customerId}` | `order.view` | `order.view,order.create` |

#### [MODIFY] [`routes/api.php`](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/routes/api.php)

| Route | Middleware Lama | Middleware Baru |
|-------|----------------|----------------|
| `GET /print/info` | `position.permission:order.view` | `position.permission:order.print` |
| `POST /print/receipt` | `position.permission:order.manage` | `position.permission:order.print` |
| `POST /print/label` | `position.permission:order.manage` | `position.permission:order.print` |

---

### Komponen 4: Backend — Validation Request

#### [MODIFY] [`app/Http/Requests/Outlet/Position/StorePositionRequest.php`](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/app/Http/Requests/Outlet/Position/StorePositionRequest.php)

- Tidak ada perubahan kode. Rule `Rule::in(array_column(Permission::cases(), 'value'))` sudah dinamis dan akan otomatis menerima key baru serta menolak key lama setelah enum diperbarui.

#### [MODIFY] `app/Http/Requests/Outlet/Position/UpdatePositionRequest.php`

- Sama — validasi sudah dinamis dari enum.

#### [MODIFY] `app/Http/Requests/Position/StorePositionRequest.php`

- Sama — validasi sudah dinamis dari enum.

---

### Komponen 5: Website Owner — PermissionSelector

#### [MODIFY] `PermissionSelector.tsx` (website owner)

- Update komponen agar merender group baru dari catalog endpoint.
- Jika catalog sudah mengembalikan struktur `{ group, permissions[] }`, pastikan PermissionSelector merender header group untuk setiap group baru (Dashboard Kasir, Order, Customer, Layanan Laundry, Keuangan, dst.).
- Tidak ada perubahan API/props yang breaking; hanya update rendering group.

---

### Komponen 6: Flutter Cashier — `CashierPermissions` Constants

#### [NEW] `apps/cashier/lib/core/permissions/cashier_permissions.dart`

File constants yang mendaftarkan semua key permission cashier dan list operasional untuk gate masuk app.

```dart
class CashierPermissions {
  // Dashboard
  static const cashierDashboardView = 'cashier_dashboard.view';

  // Order
  static const orderView    = 'order.view';
  static const orderCreate  = 'order.create';
  static const orderUpdate  = 'order.update';
  static const orderDelete  = 'order.delete';
  static const orderAccept  = 'order.accept';
  static const orderReject  = 'order.reject';
  static const orderStart   = 'order.start';
  static const orderComplete = 'order.complete';
  static const orderWeigh   = 'order.weigh';
  static const orderPaymentManage = 'order.payment.manage';
  static const orderPrint   = 'order.print';
  static const orderWaNotificationPreview = 'order.wa_notification.preview';
  static const orderWaNotificationSend    = 'order.wa_notification.send';

  // Customer
  static const customerView   = 'customer.view';
  static const customerCreate = 'customer.create';
  static const customerUpdate = 'customer.update';
  static const customerDelete = 'customer.delete';

  // Customer Subscription
  static const customerSubscriptionView   = 'customer_subscription.view';
  static const customerSubscriptionCreate = 'customer_subscription.create';
  static const customerSubscriptionUpdate = 'customer_subscription.update';
  static const customerSubscriptionDelete = 'customer_subscription.delete';

  // Membership
  static const membershipPlanView     = 'membership_plan.view';
  static const membershipContractView   = 'membership_contract.view';
  static const membershipContractCreate = 'membership_contract.create';

  // Category
  static const categoryView   = 'category.view';
  static const categoryCreate = 'category.create';
  static const categoryUpdate = 'category.update';
  static const categoryDelete = 'category.delete';

  // Laundry Service
  static const laundryServiceView   = 'laundry_service.view';
  static const laundryServiceCreate = 'laundry_service.create';
  static const laundryServiceUpdate = 'laundry_service.update';
  static const laundryServiceDelete = 'laundry_service.delete';

  // Service Package & Unit
  static const servicePackageView = 'service_package.view';
  static const unitView           = 'unit.view';

  // Finance
  static const accountView    = 'account.view';
  static const depositView    = 'deposit.view';
  static const depositCreate  = 'deposit.create';
  static const depositUpdate  = 'deposit.update';
  static const pettyCashView   = 'petty_cash.view';
  static const pettyCashCreate = 'petty_cash.create';
  static const pettyCashUpdate = 'petty_cash.update';
  static const expenseView    = 'expense.view';
  static const expenseCreate  = 'expense.create';
  static const expenseUpdate  = 'expense.update';
  static const expenseDelete  = 'expense.delete';

  /// Semua permission operasional cashier untuk gate masuk app.
  static const List<String> allCashierOperationalPermissions = [
    cashierDashboardView,
    orderView, orderCreate, orderUpdate, orderDelete,
    orderAccept, orderReject, orderStart, orderComplete, orderWeigh,
    orderPaymentManage, orderPrint, orderWaNotificationPreview, orderWaNotificationSend,
    customerView, customerCreate, customerUpdate, customerDelete,
    customerSubscriptionView, customerSubscriptionCreate,
    customerSubscriptionUpdate, customerSubscriptionDelete,
    membershipPlanView, membershipContractView, membershipContractCreate,
    categoryView, categoryCreate, categoryUpdate, categoryDelete,
    laundryServiceView, laundryServiceCreate, laundryServiceUpdate, laundryServiceDelete,
    servicePackageView, unitView, accountView,
    depositView, depositCreate, depositUpdate,
    pettyCashView, pettyCashCreate, pettyCashUpdate,
    expenseView, expenseCreate, expenseUpdate, expenseDelete,
  ];
}
```

---

### Komponen 7: Flutter Cashier — `CashierPermissionChecker`

#### [NEW] `apps/cashier/lib/core/permissions/cashier_permission_checker.dart`

Mengikuti pola [`PermissionChecker`](file:///C:/Bimo/Project/wash_wallet/apps/production/lib/core/utils/permission_checker.dart) di production app.

```dart
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'cashier_permissions.dart';

class CashierPermissionChecker {
  // ─── Gate masuk app ───────────────────────────────────────────────
  static bool hasAnyCashierAccess(AuthEmployee employee) =>
    employee.hasAnyPermission(CashierPermissions.allCashierOperationalPermissions);

  // ─── Section menu ─────────────────────────────────────────────────
  static bool hasDashboardAccess(AuthEmployee employee) =>
    employee.hasAnyPermission([CashierPermissions.cashierDashboardView, CashierPermissions.orderView]);

  static bool hasOrderSectionAccess(AuthEmployee employee) =>
    employee.hasAnyPermission([
      CashierPermissions.orderView, CashierPermissions.orderCreate,
      CashierPermissions.orderUpdate, CashierPermissions.orderDelete,
    ]);

  static bool hasCustomerSectionAccess(AuthEmployee employee) =>
    employee.hasAnyPermission([
      CashierPermissions.customerView, CashierPermissions.customerCreate,
      CashierPermissions.customerUpdate, CashierPermissions.customerDelete,
      CashierPermissions.customerSubscriptionView,
      CashierPermissions.membershipPlanView, CashierPermissions.membershipContractView,
    ]);

  static bool hasLaundryServiceSectionAccess(AuthEmployee employee) =>
    employee.hasAnyPermission([
      CashierPermissions.laundryServiceView, CashierPermissions.laundryServiceCreate,
      CashierPermissions.laundryServiceUpdate, CashierPermissions.laundryServiceDelete,
    ]);

  static bool hasCategorySectionAccess(AuthEmployee employee) =>
    employee.hasAnyPermission([
      CashierPermissions.categoryView, CashierPermissions.categoryCreate,
      CashierPermissions.categoryUpdate, CashierPermissions.categoryDelete,
    ]);

  static bool hasFinanceSectionAccess(AuthEmployee employee) =>
    employee.hasAnyPermission([
      CashierPermissions.depositView, CashierPermissions.depositCreate,
      CashierPermissions.pettyCashView, CashierPermissions.pettyCashCreate,
      CashierPermissions.expenseView, CashierPermissions.expenseCreate,
    ]);

  // ─── Order actions ────────────────────────────────────────────────
  static bool canCreateOrder(AuthEmployee e) => e.hasPermission(CashierPermissions.orderCreate);
  static bool canUpdateOrder(AuthEmployee e) => e.hasPermission(CashierPermissions.orderUpdate);
  static bool canDeleteOrder(AuthEmployee e) => e.hasPermission(CashierPermissions.orderDelete);
  static bool canAcceptOrder(AuthEmployee e) => e.hasPermission(CashierPermissions.orderAccept);
  static bool canRejectOrder(AuthEmployee e) => e.hasPermission(CashierPermissions.orderReject);
  static bool canStartOrder(AuthEmployee e)  => e.hasPermission(CashierPermissions.orderStart);
  static bool canCompleteOrder(AuthEmployee e) => e.hasPermission(CashierPermissions.orderComplete);
  static bool canWeighOrder(AuthEmployee e)  => e.hasPermission(CashierPermissions.orderWeigh);
  static bool canManageOrderPayment(AuthEmployee e) => e.hasPermission(CashierPermissions.orderPaymentManage);
  static bool canPrintOrder(AuthEmployee e)  => e.hasPermission(CashierPermissions.orderPrint);
  static bool canPreviewWaNotification(AuthEmployee e) => e.hasPermission(CashierPermissions.orderWaNotificationPreview);
  static bool canSendWaNotification(AuthEmployee e) => e.hasPermission(CashierPermissions.orderWaNotificationSend);

  // ─── Customer actions ─────────────────────────────────────────────
  static bool canCreateCustomer(AuthEmployee e) => e.hasPermission(CashierPermissions.customerCreate);
  static bool canUpdateCustomer(AuthEmployee e) => e.hasPermission(CashierPermissions.customerUpdate);
  static bool canDeleteCustomer(AuthEmployee e) => e.hasPermission(CashierPermissions.customerDelete);
  static bool canCreateSubscription(AuthEmployee e) => e.hasPermission(CashierPermissions.customerSubscriptionCreate);
  static bool canCreateMembershipContract(AuthEmployee e) => e.hasPermission(CashierPermissions.membershipContractCreate);

  // ─── Category actions ─────────────────────────────────────────────
  static bool canCreateCategory(AuthEmployee e) => e.hasPermission(CashierPermissions.categoryCreate);
  static bool canUpdateCategory(AuthEmployee e) => e.hasPermission(CashierPermissions.categoryUpdate);
  static bool canDeleteCategory(AuthEmployee e) => e.hasPermission(CashierPermissions.categoryDelete);

  // ─── Laundry Service actions ──────────────────────────────────────
  static bool canCreateLaundryService(AuthEmployee e) => e.hasPermission(CashierPermissions.laundryServiceCreate);
  static bool canUpdateLaundryService(AuthEmployee e) => e.hasPermission(CashierPermissions.laundryServiceUpdate);
  static bool canDeleteLaundryService(AuthEmployee e) => e.hasPermission(CashierPermissions.laundryServiceDelete);

  // ─── Finance actions ──────────────────────────────────────────────
  static bool canCreateDeposit(AuthEmployee e) => e.hasPermission(CashierPermissions.depositCreate);
  static bool canUpdateDeposit(AuthEmployee e) => e.hasPermission(CashierPermissions.depositUpdate);
  static bool canCreatePettyCash(AuthEmployee e) => e.hasPermission(CashierPermissions.pettyCashCreate);
  static bool canCreateExpense(AuthEmployee e) => e.hasPermission(CashierPermissions.expenseCreate);
  static bool canUpdateExpense(AuthEmployee e) => e.hasPermission(CashierPermissions.expenseUpdate);
  static bool canDeleteExpense(AuthEmployee e) => e.hasPermission(CashierPermissions.expenseDelete);
}
```

---

### Komponen 8: Flutter Cashier — Auth Gate

#### [MODIFY] [`apps/cashier/lib/features/auth/presentation/bloc/auth_cubit.dart`](file:///C:/Bimo/Project/wash_wallet/apps/cashier/lib/features/auth/presentation/bloc/auth_cubit.dart)

Ubah method `_handleAuthSuccess` (baris 61-63):

```dart
// Lama:
if (!employee.hasOrderViewPermission) {
  emit(AuthAccessDenied(employee));
  return;
}

// Baru:
if (!CashierPermissionChecker.hasAnyCashierAccess(employee)) {
  emit(AuthAccessDenied(employee));
  return;
}
```

#### [MODIFY] `apps/cashier/lib/features/auth/presentation/screens/access_denied_screen.dart`

- Update pesan: `"Anda tidak memiliki izin untuk mengakses aplikasi kasir. Silakan hubungi owner outlet Anda untuk meminta akses."`
- Tambahkan tombol **Cek Ulang Akses** yang memanggil `context.read<AuthCubit>().refreshMe()`.
- Pertahankan tombol **Keluar** yang ada.

#### [MODIFY] [`packages/wash_wallet_domain/lib/src/entities/auth_employee.dart`](file:///C:/Bimo/Project/wash_wallet/packages/wash_wallet_domain/lib/src/entities/auth_employee.dart)

- Verifikasi apakah getter `hasOrderViewPermission` dipakai di tempat lain selain `auth_cubit.dart` cashier.
- Jika tidak, hapus getter tersebut. Jika masih dipakai di tempat lain, biarkan untuk backward compat dan tambahkan comment bahwa getter ini deprecated.

---

### Komponen 9: Flutter Cashier — Navigation Dinamis

#### [MODIFY] [`apps/cashier/lib/core/navigation/cashier_navigation_config.dart`](file:///C:/Bimo/Project/wash_wallet/apps/cashier/lib/core/navigation/cashier_navigation_config.dart)

Ubah signature `buildSections()` dari `static List<SidebarMenuSection> buildSections()` menjadi menerima `AuthEmployee`:

```dart
static List<SidebarMenuSection> buildSections(AuthEmployee employee) {
  final operational = <SidebarMenuItem>[];

  if (CashierPermissionChecker.hasOrderSectionAccess(employee)) {
    operational.add(SidebarMenuItem(id: 'orders', label: 'Transaksi', ...));
  }
  if (CashierPermissionChecker.hasCustomerSectionAccess(employee)) {
    operational.add(SidebarMenuItem(id: 'customers', label: 'Pelanggan', ...));
  }
  if (CashierPermissionChecker.hasLaundryServiceSectionAccess(employee)) {
    operational.add(SidebarMenuItem(id: 'laundry-services', label: 'Layanan Laundry', ...));
  }
  if (CashierPermissionChecker.hasCategorySectionAccess(employee)) {
    operational.add(SidebarMenuItem(id: 'categories', label: 'Kategori', ...));
  }
  if (employee.hasPermission(CashierPermissions.servicePackageView)) {
    operational.add(SidebarMenuItem(id: 'service-packages', label: 'Paket Layanan', ...));
  }
  if (employee.hasAnyPermission([CashierPermissions.membershipPlanView, CashierPermissions.membershipContractView])) {
    operational.add(SidebarMenuItem(id: 'membership-plans', label: 'Membership', ...));
  }

  final finance = <SidebarMenuItem>[];
  if (employee.hasAnyPermission([CashierPermissions.depositView, CashierPermissions.depositCreate])) {
    finance.add(SidebarMenuItem(id: 'deposits', label: 'Setoran', ...));
  }
  if (employee.hasAnyPermission([CashierPermissions.pettyCashView, CashierPermissions.pettyCashCreate])) {
    finance.add(SidebarMenuItem(id: 'petty-cashes', label: 'Petty Cash', ...));
  }
  if (employee.hasAnyPermission([CashierPermissions.expenseView, CashierPermissions.expenseCreate])) {
    finance.add(SidebarMenuItem(id: 'expenses', label: 'Pengeluaran Outlet', ...));
  }

  return [
    SidebarMenuSection(items: [/* home, profile */]),
    if (operational.isNotEmpty) SidebarMenuSection(title: 'Operasional', items: operational),
    if (finance.isNotEmpty) SidebarMenuSection(title: 'Dana & Keuangan', items: finance),
    SidebarMenuSection(title: 'Setting', items: [/* printer, pin-security */]),
  ];
}
```

#### [MODIFY] `apps/cashier/lib/core/navigation/main_shell_screen.dart`

- Pastikan pemanggilan `buildSections()` disertai employee dari `context.read<AuthCubit>().state`.

---

### Komponen 10: Flutter Cashier — Route Guard

#### [MODIFY] [`apps/cashier/lib/core/router/app_router.dart`](file:///C:/Bimo/Project/wash_wallet/apps/cashier/lib/core/router/app_router.dart)

Tambahkan helper method `_resolveEmployee()` yang mengambil `AuthEmployee` dari state AuthCubit saat ini. Tambahkan guard di dalam `redirect` callback global atau di dalam `pageBuilder` masing-masing route.

Pola redirect dalam `redirect` callback:

```dart
// Di dalam redirect callback, setelah cek Authenticated:
final employee = _resolveEmployeeFromState(authState);
if (employee != null) {
  if (currentLocation == '/orders' && !employee.hasPermission(CashierPermissions.orderView)) {
    return '/no-permission?context=Transaksi';
  }
  if (currentLocation.startsWith('/orders/') && currentLocation.endsWith('/create') 
      && !employee.hasPermission(CashierPermissions.orderCreate)) {
    return '/no-permission?context=buat order';
  }
  // ... ulangi untuk setiap route operasional
}
```

**Route yang perlu guard (di dalam `pageBuilder` atau `redirect`):**

| Route | Permission dibutuhkan |
|-------|----------------------|
| `/orders` | `order.view` |
| `/customers` | `customer.view` |
| `/customers/create` | `customer.create` |
| `/categories` | `category.view` |
| `/categories/create` | `category.create` |
| `/laundry-services` | `laundry_service.view` |
| `/laundry-services/create` | `laundry_service.create` |
| `/service-packages` | `service_package.view` |
| `/membership-plans` | `membership_plan.view` |
| `/deposits` | `deposit.view` |
| `/petty-cashes` | `petty_cash.view` |
| `/expenses` | `expense.view` |
| `/finances` | salah satu finance view/create |

**Tambah route baru untuk no-permission screen:**

```dart
GoRoute(
  path: '/no-permission',
  pageBuilder: (context, state) {
    final featureContext = state.uri.queryParameters['context'] ?? 'fitur ini';
    return state.slidePage(
      CashierNoPermissionScreen(featureContext: featureContext),
    );
  },
),
```

---

### Komponen 11: Flutter Cashier — No-Permission Screen

#### [NEW] `apps/cashier/lib/features/no_permission/presentation/screens/cashier_no_permission_screen.dart`

Mirip dengan [`NoPermissionScreen`](file:///C:/Bimo/Project/wash_wallet/apps/production/lib/features/no_permission/presentation/screens/no_permission_screen.dart) di production app.

Parameters:
- `featureContext` (String): nama fitur/action yang ditolak, contoh: `"Layanan Laundry"`, `"buat order"`.
- `isAppLevel` (bool, default false): jika true, tampil pesan app-level tanpa tombol Kembali.

Pesan otomatis berdasarkan konteks:
- Feature-level: `"Anda tidak memiliki izin untuk membuka {featureContext}. Silakan hubungi owner outlet Anda untuk meminta akses."`
- App-level: `"Anda tidak memiliki izin untuk mengakses aplikasi kasir. Silakan hubungi owner outlet Anda untuk meminta akses."`

Aksi:
1. **Kembali** (jika bukan app-level) — `context.pop()`.
2. **Cek Ulang Akses** — panggil `authCubit.refreshMe()`. Jika `hasAnyCashierAccess` menjadi true, navigate ke `/home`. Jika tidak, tampilkan snackbar: `"Akses belum tersedia. Silakan hubungi owner outlet Anda."`.
3. **Keluar** — `authCubit.logout()`.

#### [NEW] `apps/cashier/lib/features/no_permission/presentation/widgets/cashier_no_permission_action_button.dart`

Widget tombol reusable untuk trigger action yang terlindungi permission.

---

### Komponen 12: Flutter Cashier — Action Button Permission Guard

#### Pola Implementasi di Setiap Screen

**Opsi A: Sembunyikan button (direkomendasikan):**

```dart
if (CashierPermissionChecker.canCreateLaundryService(employee))
  FloatingActionButton(onPressed: _handleCreate, child: const Icon(Icons.add))
```

**Opsi B: Disable dan beri pesan (jika discoverability penting):**

```dart
IconButton(
  onPressed: CashierPermissionChecker.canDeleteLaundryService(employee)
    ? () => _handleDelete()
    : () => _showNoPermissionSnackbar('menghapus layanan laundry'),
  icon: const Icon(Icons.delete),
)
```

**Screen yang harus menerapkan guard:**

| Screen | Action yang perlu guard |
|--------|------------------------|
| `IndexOrdersScreen` | Tombol buat order baru |
| `ShowOrderScreen` | Tombol accept, reject, start, complete, weigh, edit, delete, payment, print, WA preview, WA send |
| `IndexCustomersScreen` | Tombol buat customer |
| `ShowCustomerScreen` | Tombol edit customer, hapus customer, buat subscription, buat membership contract |
| `IndexCategoriesScreen` | Tombol buat kategori |
| `ShowCategoryScreen` | Tombol edit, hapus |
| `IndexLaundryServicesScreen` | Tombol buat layanan |
| `ShowLaundryServiceScreen` | Tombol edit, hapus |
| `IndexDepositScreen` | Tombol buat setoran |
| `IndexPettyCashScreen` | Tombol buat petty cash |
| `IndexExpenseScreen` | Tombol buat expense |

---

### Komponen 13: Flutter Cashier — 403 Error Handling

#### [NEW] `packages/wash_wallet_domain/lib/src/failures/no_permission_failure.dart`

```dart
class NoPermissionFailure extends Failure {
  const NoPermissionFailure([String message = 'Akses ditolak']) : super(message);
}
```

#### [MODIFY] Repository/Datasource Cashier (semua fitur)

Setiap repository yang memanggil API cashier harus menangkap status 403:

```dart
if (response.statusCode == 403) {
  return Result.failure(const NoPermissionFailure());
}
```

#### [MODIFY] BLoC/Cubit semua fitur cashier

Setiap cubit harus menangkap `NoPermissionFailure` dan emit state khusus:

```dart
result.when(
  success: (data) => emit(FeatureLoaded(data)),
  failure: (failure) {
    if (failure is NoPermissionFailure) {
      emit(const FeatureNoPermission());
    } else {
      emit(FeatureError(failure.message));
    }
  },
);
```

#### [MODIFY] Screen cashier — handling 403 in-screen

Jika 403 terjadi pada action di dalam screen yang sudah terbuka (bukan saat load data):
- Tampilkan `SnackBar` dengan pesan no-permission.
- Jangan ubah state data yang sudah ditampilkan.
- Jangan paksa navigate ke route lain.

---

### Komponen 14: Backend — Test Coverage

#### [NEW] `tests/Feature/Permission/CashierPermissionCatalogTest.php`

- Test bahwa `GET /api/permissions/catalog` mengembalikan semua key baru (minimal 46 key).
- Test bahwa key lama (`order.manage`, `payment.manage`, `service.manage`, `service.view`, `customer.manage`) tidak ada di catalog.
- Test grouping catalog jika endpoint mengembalikan response grouped.

#### [NEW] `tests/Feature/Permission/CashierRoutePermissionTest.php`

Pola test per endpoint:

```php
// Untuk setiap fitur, buat test:
// 1. Employee dengan permission yang tepat → 200
// 2. Employee dengan permission yang kurang → 403
// 3. Employee tanpa permission → 403

// Contoh untuk laundry service:
test('employee dengan laundry_service.view bisa GET /laundry-services', ...);
test('employee dengan laundry_service.create bisa POST /laundry-services', ...);
test('employee dengan hanya laundry_service.view tidak bisa POST /laundry-services → 403', ...);
test('employee dengan laundry_service.delete bisa DELETE /laundry-services/{id}', ...);
test('employee tanpa permission tidak bisa akses semua route laundry service → 403', ...);
```

Endpoint yang harus dicover: semua route order action, customer, category, laundry service, deposit, petty cash, expense, membership, dan print.

#### [MODIFY] `tests/Feature/Position/PermissionCatalogApiTest.php`

- Update ekspektasi jumlah permission dari 12 ke jumlah aktual baru.
- Tambahkan assertion untuk key-key baru yang wajib ada.

#### [NEW] `tests/Feature/Permission/CashierMigrationTest.php`

- Test migration mengkonversi `order.manage` → key granular order.
- Test migration mengkonversi `service.manage` → key granular laundry/category.
- Test migration idempotent (dijalankan dua kali tidak duplikat data).

---

### Komponen 15: Flutter Cashier — Test Coverage

#### [NEW] `apps/cashier/test/core/permissions/cashier_permission_checker_test.dart`

```dart
// Test gate masuk app
test('hasAnyCashierAccess returns false jika allPermissions kosong');
test('hasAnyCashierAccess returns true jika punya order.view');
test('hasAnyCashierAccess returns true jika punya laundry_service.view saja');
test('hasAnyCashierAccess returns false jika hanya punya production.view');

// Test aksi
test('canCreateOrder hanya true jika punya order.create');
test('canDeleteLaundryService hanya true jika punya laundry_service.delete');
// ... dst.
```

#### [NEW] `apps/cashier/test/core/navigation/cashier_navigation_config_test.dart`

```dart
test('menu Transaksi tidak muncul jika tidak punya order permission');
test('menu Layanan Laundry muncul jika punya laundry_service.view');
test('menu Dana dan Keuangan tidak muncul jika tidak punya finance permission');
test('menu Kategori muncul jika punya category.create walaupun tidak punya category.view');
```

#### [NEW] Widget test `AccessDeniedScreen`

```dart
test('tombol Cek Ulang Akses memanggil authCubit.refreshMe()');
test('tombol Keluar memanggil authCubit.logout()');
test('pesan app-level no-permission ditampilkan dengan benar');
```

---

## Urutan Implementasi (Recommended)

1. **Backend Enum** — Tambah case baru di `Permission.php`, update `label()`, update `defaultForSlug('kasir')`.
2. **Backend Migration** — Buat migration konversi data dan jalankan di development dulu.
3. **Backend Routes** — Update middleware di `api_mobile_cashier.php` dan `api.php`.
4. **Backend Catalog** — Update `PermissionCatalogController` untuk grouping.
5. **Backend Tests** — Jalankan dan pastikan semua backend test hijau.
6. **Website Owner** — Update `PermissionSelector.tsx` untuk group baru.
7. **Flutter Constants** — Buat `cashier_permissions.dart`.
8. **Flutter PermissionChecker** — Buat `cashier_permission_checker.dart`.
9. **Flutter Auth Gate** — Update `auth_cubit.dart`, update `access_denied_screen.dart`.
10. **Flutter Navigation** — Update `cashier_navigation_config.dart` dan `main_shell_screen.dart`.
11. **Flutter Route Guard** — Update `app_router.dart`, tambah route `/no-permission`.
12. **Flutter No-Permission Screen** — Buat `cashier_no_permission_screen.dart` dan widgets.
13. **Flutter 403 Handling** — Buat `NoPermissionFailure`, update repository/cubit semua fitur.
14. **Flutter Action Buttons** — Tambah permission guard di setiap screen.
15. **Flutter Tests** — Buat unit test dan widget test.

---

## Verification Plan

### Automated Tests (Backend)

```bash
php artisan test --filter=CashierPermissionCatalogTest
php artisan test --filter=CashierRoutePermissionTest
php artisan test --filter=CashierMigrationTest
php artisan test --filter=PermissionCatalogApiTest
```

### Automated Tests (Flutter)

```bash
flutter test apps/cashier/test/core/permissions/
flutter test apps/cashier/test/core/navigation/
```

### Skenario Manual

1. **Owner memberi `laundry_service.view` saja:**
   - Employee login → boleh masuk app (ada 1 permission operasional).
   - Menu Layanan Laundry muncul; tombol create/edit/delete tidak ada.
   - Deep link ke `/laundry-services/create` → tampil no-permission screen.
   - API `POST /laundry-services` langsung → 403.

2. **Owner memberi `laundry_service.create` tanpa `laundry_service.view`:**
   - Employee login → boleh masuk app.
   - Menu Layanan Laundry **tidak** muncul (karena tidak punya `laundry_service.view`).
   - Backend: `POST /laundry-services` berhasil jika ada `laundry_service.create`.

3. **Employee tanpa permission cashier apapun:**
   - Login berhasil secara autentikasi.
   - App menampilkan `AuthAccessDenied` → access-denied screen.
   - Pesan: `"Anda tidak memiliki izin untuk mengakses aplikasi kasir. Silakan hubungi owner outlet Anda untuk meminta akses."`

4. **Permission dicabut saat session aktif:**
   - Owner cabut `laundry_service.view`.
   - Employee klik menu Layanan Laundry → API 403.
   - App tampilkan no-permission, bukan data.
   - Employee klik "Cek Ulang Akses" → `me` endpoint dipanggil → menu Layanan Laundry hilang.

5. **Posisi kasir existing setelah deploy:**
   - Cek `position_permissions` → permission granular sudah ada (hasil migration).
   - Employee posisi kasir lama tetap bisa menjalankan workflow kasir penuh.

---

## Edge Case dan Resolusi

| Edge Case | Resolusi |
|-----------|----------|
| `expense.delete` — controller belum tersedia | Permission enum tetap didaftarkan. Implementer harus memastikan controller `ExpenseController@destroy` ada dan berfungsi sebelum middleware `expense.delete` aktif. Jika belum siap, comment middleware sementara. |
| `laundry_service.create` tanpa `laundry_service.view` | Employee tidak melihat menu list di Flutter. Backend tetap mengizinkan `POST` jika punya `laundry_service.create`. |
| Employee hanya punya permission setting lokal (profile, PIN, printer) | `hasAnyCashierAccess` = false → `AuthAccessDenied`. Setting lokal tidak dihitung sebagai operational permission. |
| Permission dari outlet lain | `CheckPositionPermission` middleware sudah menggunakan outlet context. Tidak perlu perubahan middleware. |
| Double migration (dijalankan dua kali) | Migration menggunakan `insertOrIgnore` → idempotent, aman dijalankan dua kali. |
| Route loop splash → login → no-permission → home | `app_router.dart` harus memastikan `AuthAccessDenied` state selalu redirect ke `/access-denied`, tidak ke `/home`. Verifikasi dengan test. |
| `order.print` tidak ada di mapping compatibility lama | Permission `order.print` adalah permission baru yang tidak ada di permission lama (`order.view` atau `order.manage`). Setelah migrasi, posisi kasir default perlu mendapatkan `order.print` secara eksplisit melalui `defaultForSlug('kasir')`. |

---

## File Summary

### Backend — Modified Files

| File | Perubahan |
|------|-----------|
| [`app/Enums/Permission.php`](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/app/Enums/Permission.php) | Tambah ~46 case baru, hapus 5 case lama, update `label()`, update `defaultForSlug('kasir')` |
| [`routes/api_mobile_cashier.php`](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/routes/api_mobile_cashier.php) | Update semua middleware permission |
| [`routes/api.php`](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/routes/api.php) | Update middleware 3 print routes |
| `app/Http/Controllers/Api/PermissionCatalogController.php` | Update response dengan grouping |
| `tests/Feature/Position/PermissionCatalogApiTest.php` | Update ekspektasi jumlah permission |

### Backend — New Files

| File | Keterangan |
|------|-----------|
| `database/migrations/YYYY_..._migrate_cashier_position_permissions.php` | Migration data konversi permission lama |
| `tests/Feature/Permission/CashierPermissionCatalogTest.php` | Test catalog granular |
| `tests/Feature/Permission/CashierRoutePermissionTest.php` | Test endpoint per permission |
| `tests/Feature/Permission/CashierMigrationTest.php` | Test konversi data |

### Flutter Cashier — New Files

| File | Keterangan |
|------|-----------|
| `apps/cashier/lib/core/permissions/cashier_permissions.dart` | Constants semua key permission |
| `apps/cashier/lib/core/permissions/cashier_permission_checker.dart` | Logic checker |
| `apps/cashier/lib/features/no_permission/presentation/screens/cashier_no_permission_screen.dart` | Screen no-permission |
| `apps/cashier/lib/features/no_permission/presentation/widgets/cashier_no_permission_action_button.dart` | Widget tombol reusable |
| `packages/wash_wallet_domain/lib/src/failures/no_permission_failure.dart` | Failure class untuk 403 |
| `apps/cashier/test/core/permissions/cashier_permission_checker_test.dart` | Unit test checker |
| `apps/cashier/test/core/navigation/cashier_navigation_config_test.dart` | Navigation test |

### Flutter Cashier — Modified Files

| File | Perubahan |
|------|-----------|
| [`apps/cashier/lib/features/auth/presentation/bloc/auth_cubit.dart`](file:///C:/Bimo/Project/wash_wallet/apps/cashier/lib/features/auth/presentation/bloc/auth_cubit.dart) | Ganti gate `hasOrderViewPermission` dengan `CashierPermissionChecker.hasAnyCashierAccess` |
| `apps/cashier/lib/features/auth/presentation/screens/access_denied_screen.dart` | Update pesan, tambah tombol Cek Ulang Akses |
| [`apps/cashier/lib/core/navigation/cashier_navigation_config.dart`](file:///C:/Bimo/Project/wash_wallet/apps/cashier/lib/core/navigation/cashier_navigation_config.dart) | Tambah parameter `AuthEmployee`, filter menu dinamis |
| `apps/cashier/lib/core/navigation/main_shell_screen.dart` | Pass employee ke `buildSections()` |
| [`apps/cashier/lib/core/router/app_router.dart`](file:///C:/Bimo/Project/wash_wallet/apps/cashier/lib/core/router/app_router.dart) | Tambah route guard per route, tambah route `/no-permission` |
| [`packages/wash_wallet_domain/lib/src/entities/auth_employee.dart`](file:///C:/Bimo/Project/wash_wallet/packages/wash_wallet_domain/lib/src/entities/auth_employee.dart) | Review/hapus getter `hasOrderViewPermission` |
| Semua repository cashier | Tambah penanganan 403 → `NoPermissionFailure` |
| Semua cubit cashier | Tambah handling `NoPermissionFailure` → emit state `NoPermission` |
| Semua screen cashier dengan action button | Tambah permission guard di setiap action button |
