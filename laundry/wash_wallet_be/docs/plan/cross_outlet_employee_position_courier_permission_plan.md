# Implementation Plan: Cross-Outlet Employee Position by Courier Permission

> Baca seluruh plan ini sebelum menulis kode apapun.
> Setiap langkah implementasi wajib merujuk ke spesifikasi di `docs/spec/`.

---

## ⚠️ Peringatan Wajib untuk AI Model

Sebelum menulis satu baris kode pun, AI model **wajib membaca** file-file berikut:

| File Spec | Alasan |
|---|---|
| `docs/spec/controller_spec.md` | Standar penulisan controller |
| `docs/spec/service_spec.md` | Standar penulisan service, transaksi, error handling |
| `docs/spec/model_spec.md` | Standar penulisan Eloquent model |
| `docs/spec/cross_outlet_employee_position_by_courier_permission_user_need.md` | User need utama fitur ini |
| `docs/spec/employee_permission_owner_flow_user_need.md` | Konteks RBAC permission per position |

**Aturan Kode Wajib:**
- ❌ Jangan hardcode warna — gunakan CSS variable dari `resources/css/app.css`
- ❌ Jangan tulis kode panjang dalam satu file — pecah ke komponen/Partials
- ❌ Jangan tulis comment — tulis clean code yang self-explanatory
- ✅ Gunakan komponen reusable yang sudah ada
- ✅ Ikuti pattern yang ada di file-file service dan model yang sudah ada

---

## Ringkasan Gap

| Layer | File | Masalah |
|---|---|---|
| Model | `Position.php` | `isKurir()` masih berbasis slug, belum ada `hasCourierPermission()` |
| Model | `Employee.php` | `validatePositionOwnership()` masih berbasis `isKurir()` (slug-based) |
| Model | `Employee.php` | `isKurirOnOutlet()` masih berbasis slug, belum berbasis permission |
| Service | `EmployeeService.php` | `validatePositionsForEmployee()` masih cek `slug !== 'kurir'` |
| Test | — | Belum ada test coverage untuk rule permission-based cross-outlet |

---

## Keputusan Bisnis yang Harus Dikunci Sebelum Implementasi

**Definisi "position memiliki permission kurir":**

Position dianggap memiliki permission kurir jika memiliki **setidaknya satu** dari:
- `courier.view`
- `courier.manage`

Definisi ini konsisten dengan `Permission::defaultForSlug('kurir')` yang sudah ada dan dipakai di seluruh codebase.

---

## Fase 1 — Model Layer

### 1.1 Update `Position.php`

**File:** `app/Models/Position.php`

Tambahkan method `hasCourierPermission()` sebagai pengganti logika `isKurir()` untuk keperluan eligibility lintas outlet:

```php
public function hasCourierPermission(): bool
{
    return $this->permissions()
        ->whereIn('permission_key', [
            \App\Enums\Permission::CourierView->value,
            \App\Enums\Permission::CourierManage->value,
        ])
        ->exists();
}
```

> `isKurir()` tetap ada dan tidak dihapus — masih boleh dipakai untuk kebutuhan UI/label/default setup, tapi bukan sebagai penentu eligibility lintas outlet.

---

### 1.2 Update `Employee.php`

**File:** `app/Models/Employee.php`

**Ubah `validatePositionOwnership()`** dari berbasis slug ke berbasis permission kurir:

Sebelumnya:
```php
if (!$position->isKurir() && $position->outlet_id !== $this->outlet_id) {
    throw new \InvalidArgumentException(
        "Non-kurir position must belong to employee's primary outlet."
    );
}

if ($position->isKurir()) {
    // ... cek owner sama
}
```

Sesudahnya:
```php
private function validatePositionOwnership(int $positionId): void
{
    $position = Position::with('permissions')->find($positionId);

    if (!$position) {
        throw new \InvalidArgumentException("Position ID {$positionId} not found.");
    }

    if (!$position->hasCourierPermission() && $position->outlet_id !== $this->outlet_id) {
        throw new \InvalidArgumentException(
            "Position tanpa permission kurir hanya boleh diberikan pada outlet utama employee."
        );
    }

    if ($position->hasCourierPermission() && $position->outlet_id !== $this->outlet_id) {
        $ownerId = Outlet::where('id', $this->outlet_id)->value('owner_id');

        if ($ownerId === null) {
            throw new \InvalidArgumentException('Employee outlet not found.');
        }

        $ownerOutletIds = Outlet::where('owner_id', $ownerId)->pluck('id')->toArray();

        if (!in_array($position->outlet_id, $ownerOutletIds, true)) {
            throw new \InvalidArgumentException(
                "Position kurir harus berasal dari outlet milik owner yang sama."
            );
        }
    }
}
```

**Ubah `isKurirOnOutlet()`** menjadi `hasCourierPermissionOnOutlet()`:

> Method lama `isKurirOnOutlet()` masih bisa dipertahankan untuk kompatibilitas, namun tambahkan method baru berbasis permission.

```php
public function hasCourierPermissionOnOutlet(int $outletId): bool
{
    return $this->positions()
        ->where('employee_positions.is_active', true)
        ->where('positions.is_active', true)
        ->where('positions.outlet_id', $outletId)
        ->whereHas('permissions', function (Builder $q) {
            $q->whereIn('permission_key', [
                \App\Enums\Permission::CourierView->value,
                \App\Enums\Permission::CourierManage->value,
            ]);
        })
        ->exists();
}
```

---

## Fase 2 — Service Layer

### 2.1 Update `EmployeeService.php`

**File:** `app/Services/EmployeeService.php`

**Ubah `validatePositionsForEmployee()`** pada baris 1563–1587:

Sebelumnya:
```php
if ($position->slug !== 'kurir' && $position->outlet_id !== $primaryOutletId) {
    throw new Exception("Hanya posisi Kurir yang dapat ditugaskan ke outlet lain.");
}
```

Sesudahnya:
```php
protected function validatePositionsForEmployee(?Employee $employee, array $positionIds, int $primaryOutletId): void
{
    if (empty($positionIds)) {
        return;
    }

    $primaryOutlet = $this->outlet->findOrFail($primaryOutletId);
    $ownerId = $primaryOutlet->owner_id;

    $positions = $this->position->whereIn('id', $positionIds)->with(['outlet', 'permissions'])->get();

    if ($positions->count() !== count(array_unique($positionIds))) {
        throw new Exception('Satu atau lebih posisi tidak ditemukan.');
    }

    foreach ($positions as $position) {
        if ($position->outlet->owner_id !== $ownerId) {
            throw new Exception("Posisi '{$position->name}' bukan milik outlet dari owner yang sama.");
        }

        if (!$position->hasCourierPermission() && $position->outlet_id !== $primaryOutletId) {
            throw new Exception(
                "Posisi '{$position->name}' tidak memiliki permission kurir dan tidak dapat ditugaskan ke outlet lain."
            );
        }
    }
}
```

> Perubahan utama:
> - `->with(['outlet', 'permissions'])` ditambahkan agar `hasCourierPermission()` tidak N+1 query.
> - Kondisi slug `!== 'kurir'` diganti dengan `!$position->hasCourierPermission()`.
> - Pesan error lebih informatif.

---

## Fase 3 — Test Coverage

**File baru:** `tests/Feature/CrossOutletPositionPermissionTest.php`

### Skenario yang wajib dicakup:

| # | Skenario | Ekspektasi |
|---|---|---|
| 1 | Position dengan permission kurir, outlet berbeda, owner sama | ✅ Diizinkan |
| 2 | Position tanpa permission kurir, outlet berbeda, owner sama | ❌ Ditolak |
| 3 | Position dengan slug `kurir` tapi tidak ada permission kurir | ❌ Ditolak |
| 4 | Position bukan slug `kurir` tapi punya permission `courier.view` | ✅ Diizinkan |
| 5 | Position dengan permission kurir, outlet berbeda, owner berbeda | ❌ Ditolak |
| 6 | Position apapun, outlet sama dengan outlet utama employee | ✅ Diizinkan |
| 7 | Duplikasi assignment position | ❌ Ditolak |
| 8 | create employee dengan cross-outlet position valid | ✅ Diizinkan |
| 9 | update employee dengan cross-outlet position invalid | ❌ Ditolak |
| 10 | sync positions dengan campuran valid dan invalid | ❌ Ditolak seluruh request |

### Struktur test:

```php
class CrossOutletPositionPermissionTest extends TestCase
{
    use RefreshDatabase;

    private function makeOwner(): User { ... }
    private function makeOutlet(int $ownerId): Outlet { ... }
    private function makePosition(int $outletId, array $permissions = []): Position { ... }
    private function makeEmployee(int $outletId): Employee { ... }
}
```

Setiap skenario dibuat sebagai method test tersendiri dengan nama deskriptif.

---

## Fase 4 — Verifikasi Tidak Ada Regresi

Pastikan perubahan ini tidak mematahkan flow-flow berikut:

| Flow | Cara Verifikasi |
|---|---|
| Default position outlet (kasir, produksi, kurir) | Kasir & produksi tetap hanya bisa di outlet sendiri, kurir (dengan permission) bisa lintas outlet |
| Employee permission per position (owner flow) | Edit permission position masih berjalan normal |
| Effective permission employee | `getPermissionsForOutlet()` tetap mengembalikan union permission dari semua position aktif yang valid |
| Eligibility produksi | `isEligibleForProduction()` tidak terdampak — masih berbasis slug `produksi` |
| Login payload | Token permission tidak berubah strukturnya |

Jalankan test suite penuh setelah implementasi:

```bash
php artisan test
```

---

## Urutan Pengerjaan yang Direkomendasikan

1. **`Position.php`** — Tambah `hasCourierPermission()`
2. **`Employee.php`** — Update `validatePositionOwnership()` + tambah `hasCourierPermissionOnOutlet()`
3. **`EmployeeService.php`** — Update `validatePositionsForEmployee()`
4. **`CrossOutletPositionPermissionTest.php`** — Tulis semua skenario test
5. Jalankan `php artisan test` — pastikan semua test hijau
6. Review apakah ada reference lain ke `isKurir()` dalam konteks validasi lintas outlet yang perlu diupdate

---

## Referensi

- `docs/spec/cross_outlet_employee_position_by_courier_permission_user_need.md`
- `docs/spec/employee_permission_owner_flow_user_need.md`
- `app/Enums/Permission.php`
- `app/Models/Employee.php`
- `app/Models/Position.php`
- `app/Services/EmployeeService.php`
