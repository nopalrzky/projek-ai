# User Need RBAC Employee Permission (Master Permission Fixed)

Tanggal: 2026-05-25

## 1. Tujuan

Membangun sistem RBAC untuk karyawan dengan prinsip:

1. Daftar permission adalah master tetap (fixed) yang dikelola tim produk/engineering.
2. Owner tidak membuat permission baru, owner hanya memilih permission yang menempel pada position.
3. Permission dievaluasi per outlet context untuk mendukung multi-outlet.

## 2. Aktor

1. `super_admin`: mengelola konfigurasi global dan audit.
2. `owner`: mengatur position dan permission untuk outlet miliknya.
3. `employee`: mengakses fitur sesuai permission pada position yang aktif.
4. `system`: memvalidasi permission key, menolak akses, dan mencatat audit.

## 3. Master Permission Catalog (Fixed)

Sumber master: `App\Enums\Permission`.

| Key                 | Label             | Domain     | Level                |
| ------------------- | ----------------- | ---------- | -------------------- |
| `order.create`      | Buat Order        | Order      | Create               |
| `order.view`        | Lihat Order       | Order      | Read                 |
| `order.manage`      | Kelola Order      | Order      | Update/Delete/Action |
| `payment.manage`    | Kelola Pembayaran | Payment    | Manage               |
| `production.view`   | Lihat Produksi    | Production | Read                 |
| `production.manage` | Kelola Produksi   | Production | Manage               |
| `courier.view`      | Lihat Kurir       | Courier    | Read                 |
| `courier.manage`    | Kelola Kurir      | Courier    | Manage               |
| `customer.view`     | Lihat Customer    | Customer   | Read                 |
| `customer.manage`   | Kelola Customer   | Customer   | Manage               |
| `service.view`      | Lihat Layanan     | Service    | Read                 |
| `service.manage`    | Kelola Layanan    | Service    | Manage               |

## 4. User Need (Functional)

### FR-01 Master Permission Ditampilkan Konsisten

1. Sistem harus menyediakan daftar permission master (`key`, `label`) untuk form create/edit position.
2. Daftar ini hanya readonly bagi owner.

### FR-02 Owner Dapat Menentukan Permission per Position

1. Saat membuat position, owner dapat memilih banyak permission dari master list.
2. Saat mengubah position, owner dapat menambah/menghapus permission tanpa membuat key baru.
3. Penyimpanan dilakukan di `position_permissions (position_id, permission_key)`.

### FR-03 Validasi Permission Key Wajib Ketat

1. Request create/update position yang mengirim `permissions` wajib lolos validasi enum.
2. Jika key tidak terdaftar di master, request ditolak dengan error validasi yang jelas.

### FR-04 Enforcement pada Endpoint Employee

1. Setiap endpoint mobile employee harus dilindungi middleware `position.permission:{key}`.
2. Akses ditentukan berdasarkan outlet context (`X-Outlet-ID`/payload/default outlet employee).
3. Untuk endpoint agregat lintas outlet (contoh kurir), sistem mendukung mode `aggregate`.

### FR-05 Sinkronisasi Permission ke Payload Login

1. Login employee dan endpoint `me` harus mengembalikan:
    - `accessibleOutlets` beserta posisi aktif.
    - `allPermissions` hasil union permission dari posisi aktif.

### FR-06 Default Position Memiliki Default Permission

1. Saat outlet dibuat, default position (`kasir`, `produksi`, `kurir`) otomatis dibentuk.
2. Masing-masing default position mendapat permission default sesuai slug.

### FR-07 Audit Perubahan Permission

1. Setiap perubahan permission pada position wajib tercatat:
    - `who` (user id),
    - `position_id`,
    - daftar permission akhir.

## 5. User Need (Non-Functional)

### NFR-01 Security dan Tenant Isolation

1. Owner hanya boleh mengelola position pada outlet miliknya.
2. Employee tidak boleh mengakses endpoint manajemen position owner.

### NFR-02 Konsistensi Data

1. Update permission harus atomik (transaction).
2. Tidak boleh ada duplikasi (`position_id`, `permission_key`) untuk kombinasi yang sama.

### NFR-03 Maintainability

1. Penambahan permission baru cukup lewat enum master dan mapping label.
2. Route guard harus memakai key master yang sama untuk mencegah typo.

## 6. Acceptance Criteria

1. Jika owner menyimpan position dengan `permissions = ['order.view', 'order.create']`, maka tabel `position_permissions` berisi tepat dua key tersebut.
2. Jika owner mengirim `permissions = ['order.view', 'order.hack']`, request ditolak.
3. Jika employee tidak memiliki permission yang dipersyaratkan route, respons `403`.
4. Jika employee kurir memiliki `courier.view` pada salah satu outlet akses, endpoint agregat kurir dapat diakses.
5. Jika employee login, payload memuat `allPermissions` dan `accessibleOutlets`.

## 7. Review Implementasi Saat Ini (Codebase)

### Sudah Sesuai User Need

1. Master permission fixed sudah ada di enum: `app/Enums/Permission.php`.
2. Validasi request `permissions.*` sudah pakai enum:
    - `app/Http/Requests/Position/StorePositionRequest.php`
    - `app/Http/Requests/Position/UpdatePositionRequest.php`
3. Mapping permission ke route employee sudah aktif di:
    - `routes/api_mobile_cashier.php`
    - `routes/api_mobile_production.php`
4. Middleware outlet-aware dan aggregate-aware sudah ada:
    - `app/Http/Middleware/CheckPositionPermission.php`
5. Login/me payload sudah memuat `accessibleOutlets` dan `allPermissions`:
    - `app/Http/Resources/Employee/LoginEmployeeResource.php`

### Status Gap & Otorisasi

Seluruh gap prioritas tinggi telah diimplementasikan dan diverifikasi pada 2026-05-26:

1. **Sync Permissions**: Endpoint API `PositionController` telah menyimpan/update `permissions` saat `store` dan `update` via `PositionService`.
2. **Otorisasi API**: Operasi manajemen position dilindungi `PositionPolicy` berbasis owner-outlet.
3. **Tenant Guard**: Service layer (`PositionService`) memverifikasi kepemilikan tenant (`owner_id`) sebelum mutasi data.

## 8. Rekomendasi Implementasi Lanjutan (Closed)

Seluruh rekomendasi lanjutan telah diselesaikan:

1. **Catalog Endpoint**: Endpoint `GET /api/permissions/catalog` telah diimplementasikan ([PermissionCatalogController](file:///c:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/app/Http/Controllers/Api/PermissionCatalogController.php)) dan terdaftar di [web.php](file:///c:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/routes/web.php).
2. **Position Policy**: `PositionPolicy` telah didefinisikan ([PositionPolicy](file:///c:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/app/Policies/PositionPolicy.php)) dan digunakan di API Controller.
3. **Penyelarasan web & API**: Alur `store` dan `update` telah memproses field `permissions`.
4. **Feature Tests**: Coverage lengkap telah ditambahkan untuk validasi key, kepemilikan owner, dan penolakan akses employee ([PositionPermissionSyncTest](file:///c:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/tests/Feature/Position/PositionPermissionSyncTest.php), [PermissionCatalogApiTest](file:///c:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/tests/Feature/Position/PermissionCatalogApiTest.php)).
