# Issue: Outlet Position Permission Update Fails Unique Validation and Missing Soft Delete Restore Flow

## Context

Page yang terdampak adalah nested outlet position page:

- Create: `outlets.positions.create`
- Edit: `outlets.positions.edit`
- Update: `outlets.positions.update`
- Delete: `outlets.positions.destroy`

User flow yang bermasalah:

1. Owner membuka edit posisi dari outlet, misalnya `outlets.positions.edit`.
2. Owner tidak mengganti nama posisi.
3. Owner hanya mengubah daftar permission.
4. Submit update gagal validasi dengan pesan nama posisi sudah digunakan.

User expectation:

- Mengubah permission saja tidak boleh terkena validasi duplicate name untuk row posisi yang sama.
- Saat posisi dihapus, row `positions` hanya soft deleted / diberi `deleted_at`.
- Saat owner membuat posisi baru dengan nama yang sama di outlet yang sama dan sebelumnya ada row soft deleted, sistem sebaiknya restore row lama, bukan membuat duplicate row baru.
- Permission yang dipilih pada nested outlet position form harus tersimpan.

## Findings

### 1. Unique validation pada edit memakai route parameter yang salah

File: `app/Http/Requests/Outlet/Position/UpdatePositionRequest.php`

Kode saat ini membaca ID posisi dari:

```php
$positionId = $this->route('id') ?? $this->route('position')?->id;
```

Route nested outlet position di `routes/web.php` memakai parameter:

```php
/{positionId}/edit
/{positionId}
```

Akibatnya `$positionId` di request menjadi `null`. Rule ini:

```php
Rule::unique('positions', 'name')->ignore($positionId)
```

tidak meng-ignore row posisi yang sedang diedit. Saat user submit nama lama yang sama, validasi melihat nama itu sudah ada di tabel `positions`, lalu mengembalikan error duplicate.

Root cause langsung untuk bug user: route parameter mismatch antara `{positionId}` dan request validation.

### 2. Unique validation belum dibatasi per outlet dan belum mengabaikan soft deleted row

Rule update saat ini unique secara global ke seluruh tabel `positions`:

```php
Rule::unique('positions', 'name')->ignore($positionId)
```

Masalah:

- Nama posisi yang sama di outlet berbeda ikut dianggap duplicate.
- Row yang sudah soft deleted masih ikut dianggap duplicate.
- Ini tidak cocok dengan model data karena `positions` punya `outlet_id` dan `deleted_at`.

Expected rule untuk nested outlet position seharusnya scoped ke outlet aktif:

```php
Rule::unique('positions', 'name')
    ->where(fn ($query) => $query
        ->where('outlet_id', $outletId)
        ->whereNull('deleted_at')
    )
    ->ignore($positionId)
```

`$positionId` harus dibaca dari `$this->route('positionId')`.

`$outletId` harus dibaca dari `$this->route('outletId')`, atau dari posisi yang sedang diedit bila ingin memastikan route outlet dan row posisi konsisten.

### 3. Store validation nested outlet position belum mencegah duplicate active position

File: `app/Http/Requests/Outlet/Position/StorePositionRequest.php`

Saat ini field `name` hanya:

```php
'name' => ['required', 'string', 'max:255']
```

Tidak ada validasi unique untuk posisi aktif pada outlet yang sama. Karena migration `positions` juga belum punya unique index untuk kombinasi `outlet_id`, `name`, dan active/non-deleted state, duplicate active position bisa dibuat dari nested page.

Catatan schema:

- `database/migrations/2025_10_05_030955_create_positions_table.php` sudah memakai `softDeletes()`.
- Tidak ada unique constraint yang melindungi duplicate active name per outlet.

### 4. Nested outlet service belum menyimpan permission

File: `app/Services/OutletService.php`

Method yang dipakai nested outlet pages:

- `storePosition(int $outletId, array $data)`
- `updatePosition(int $outletId, int $positionId, array $data)`

Kedua method menerima `$data` dari request yang sudah memvalidasi `permissions`, tetapi service hanya membuat / mengubah field:

- `name`
- `description`
- `is_active`

Tidak ada pemanggilan sync permission di nested flow. Akibatnya setelah validasi diperbaiki, perubahan permission dari `outlets.positions.edit` tetap tidak akan tersimpan kecuali service juga diperbaiki.

Pembanding: `app/Services/PositionService.php` sudah punya `updatePermissions(int $positionId, array $permissionKeys)` dan global position flow memakai method tersebut.

### 5. Delete sudah soft delete, tetapi create belum restore row lama

Model `App\Models\Position` memakai `SoftDeletes`, dan `OutletService::destroyPosition()` memanggil:

```php
$position->delete();
```

Itu berarti delete sudah berupa soft delete, bukan hard delete.

Masalah yang tersisa ada di create flow:

- `OutletService::storePosition()` selalu melakukan `$outlet->positions()->create(...)`.
- Query relasi `positions()` default-nya mengecualikan row soft deleted.
- Jika nama yang sama pernah dihapus, create akan membuat row baru, bukan restore row lama.

Desired behavior:

1. Saat create posisi, cek dulu row `positions` dengan `withTrashed()` untuk outlet dan nama yang sama.
2. Jika ditemukan row aktif / belum deleted, return validation error duplicate.
3. Jika ditemukan row soft deleted, restore row tersebut.
4. Setelah restore, update field `description`, `is_active`, dan sync permission dari input terbaru.
5. Jika tidak ada row lama, buat posisi baru dan sync permission.

### 6. Nested update/delete belum cukup scoped ke outlet route

`OutletService::updatePosition()` mengambil posisi dengan:

```php
$this->position->byId($positionId)->firstOrFail();
```

`OutletService::destroyPosition()` juga mengambil by ID saja. Untuk nested route, service seharusnya memastikan:

- `positions.id = $positionId`
- `positions.outlet_id = $outletId`

Tanpa scope outlet, route `/outlets/{outletId}/positions/{positionId}` bisa menerima kombinasi outlet dan position yang tidak cocok. Authorization memang ada pada delete melalui `authorizePositionAccess($position)`, tetapi update nested bahkan belum memanggil authorization di potongan yang dicek. Tetap lebih benar jika lookup nested memakai outlet scope.

## Recommended Fix Direction

### Validation

- Di `Outlet\Position\UpdatePositionRequest`, baca route parameter yang benar:
  - `$positionId = (int) $this->route('positionId');`
  - `$outletId = (int) $this->route('outletId');`
- Scope unique update ke outlet dan non-deleted row.
- Di `Outlet\Position\StorePositionRequest`, tambahkan validasi unique untuk active/non-deleted row per outlet.
- Jika create akan restore soft deleted row, pastikan validasi store tidak menolak row yang sudah soft deleted.

### Service

- Jadikan nested outlet flow memakai satu source of truth untuk permission sync.
- Opsinya:
  - inject/use `PositionService::updatePermissions()`, atau
  - ekstrak helper permission sync yang bisa dipakai `PositionService` dan `OutletService`.
- `storePosition()`:
  - cari position `withTrashed()` berdasarkan `outlet_id` dan normalized `name`;
  - restore jika trashed;
  - create jika tidak ada;
  - reject duplicate jika ada active row;
  - sync permissions setelah create/restore.
- `updatePosition()`:
  - lookup posisi berdasarkan `id` dan `outlet_id`;
  - authorize akses;
  - update field;
  - sync permissions jika key `permissions` ada di payload.
- `destroyPosition()`:
  - lookup posisi berdasarkan `id` dan `outlet_id`;
  - authorize akses;
  - gunakan soft delete.

### Permission Sync Semantics

Untuk update permission:

- Permission input adalah full replacement dari form edit.
- Permission yang ada di DB tapi tidak ada di input harus dihapus dari `position_permissions`.
- Permission yang ada di input tapi belum ada di DB harus dibuat.
- Permission yang sudah ada tidak perlu dibuat ulang.

`PositionService::updatePermissions()` sudah mendekati behavior ini:

```php
$position->permissions()->whereNotIn('permission_key', $permissionKeys)->delete();
$position->permissions()->firstOrCreate(['permission_key' => $key]);
```

Pastikan nested outlet flow benar-benar memanggil logic ini.

## Acceptance Criteria

- Edit posisi di `outlets.positions.edit` dengan nama tidak berubah dan permission berubah berhasil tanpa error `Nama posisi sudah digunakan`.
- Permission yang dipilih pada nested outlet position create tersimpan di `position_permissions`.
- Permission yang dipilih pada nested outlet position update tersinkron penuh:
  - permission baru dibuat;
  - permission yang di-uncheck dihapus;
  - permission yang tetap dipilih tidak duplicate.
- Delete nested outlet position mengisi `positions.deleted_at`, bukan hard delete row.
- Create nested outlet position dengan nama yang sama seperti row soft deleted di outlet yang sama melakukan restore row lama.
- Create nested outlet position dengan nama yang sama seperti row aktif di outlet yang sama tetap gagal duplicate validation.
- Nama posisi yang sama boleh dipakai di outlet berbeda selama tidak duplicate dalam outlet yang sama.
- Route outlet dan position mismatch tidak bisa mengubah atau menghapus posisi milik outlet lain.

## Suggested Tests

- Feature test untuk nested web update:
  - existing position `Kasir Senior`;
  - submit update dengan name sama dan permissions berbeda;
  - assert redirect success;
  - assert tidak ada validation error `name`;
  - assert `position_permissions` berubah sesuai input.
- Feature test create duplicate active:
  - active position dengan nama sama di outlet yang sama;
  - submit create;
  - assert validation error `name`.
- Feature test create same name different outlet:
  - active position dengan nama sama di outlet lain;
  - submit create pada outlet target;
  - assert success.
- Feature test restore soft deleted:
  - soft delete position;
  - submit create dengan nama sama di outlet yang sama;
  - assert row lama restored;
  - assert tidak membuat row baru;
  - assert description, is_active, dan permissions mengikuti payload baru.
- Feature test nested outlet mismatch:
  - position milik outlet A;
  - hit update/delete route memakai outlet B;
  - assert 404 atau 403 sesuai pola authorization project.

## Files To Inspect During Plan

- `routes/web.php`
- `app/Http/Requests/Outlet/Position/StorePositionRequest.php`
- `app/Http/Requests/Outlet/Position/UpdatePositionRequest.php`
- `app/Http/Controllers/Web/OutletController.php`
- `app/Services/OutletService.php`
- `app/Services/PositionService.php`
- `app/Models/Position.php`
- `app/Models/PositionPermission.php`
- `database/migrations/2025_10_05_030955_create_positions_table.php`
- `database/migrations/2026_05_25_000002_create_position_permissions_table.php`
