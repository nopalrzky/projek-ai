# Implementation Plan: Employee Permission per Position (Owner Flow)

> Baca seluruh plan ini sebelum menulis kode apapun.
> Setiap langkah implementasi wajib merujuk ke spesifikasi di `docs/spec/`.

---

## ⚠️ Peringatan Wajib untuk AI Model

Sebelum menulis satu baris kode pun, AI model **wajib membaca** file-file berikut:

| File Spec | Alasan |
|---|---|
| `docs/spec/controller_spec.md` | Standar penulisan controller & Web controller |
| `docs/spec/service_spec.md` | Standar penulisan service, transaksi, error handling |
| `docs/spec/model_spec.md` | Standar penulisan Eloquent model |
| `docs/spec/api_resource_spec.md` | Standar penulisan API Resources |

**Aturan Kode Wajib:**
- ❌ Jangan hardcode warna — selalu gunakan CSS variable dari `resources/css/app.css` (`var(--color-*)`)
- ❌ Jangan tulis kode panjang dalam satu file — pecah ke komponen/Partials
- ❌ Jangan tulis comment — tulis clean code yang self-explanatory
- ✅ Gunakan komponen reusable yang sudah ada: `Card`, `Button`, `Input`, `Alert`, `Badge`, `Form`
- ✅ Taruh semua sub-komponen form di folder `Partials/`
- ✅ Ikuti pattern yang ada di file `Create.tsx` dan `Edit.tsx` yang sudah ada

---

## Ringkasan Gap

| Layer | File | Status |
|---|---|---|
| Backend Request | `StorePositionRequest.php` | ✅ Implemented (validation `permissions`) |
| Backend Request | `UpdatePositionRequest.php` | ✅ Implemented (validation `permissions`) |
| Backend Controller | `OutletController::createPosition` | ✅ Implemented (passes `permissionCatalog`) |
| Backend Controller | `OutletController::editPosition` | ✅ Implemented (passes `permissionCatalog`, eager-load permissions) |
| Frontend Types | `OutletPositionFormData` | ✅ Implemented (field `permissions` added; consider making required) |
| Frontend Page | `Create.tsx` | ✅ Implemented (uses PermissionSelector partial) |
| Frontend Page | `Edit.tsx` | ✅ Implemented (uses PermissionSelector partial, preselects permissions) |
| Frontend Partial | `PermissionSelector.tsx` | ✅ Implemented (grouped checklist, select-all/reset) |

> Note: This plan file has been updated to reflect recent implementation. See "Remaining Gaps" below for outstanding items and test plan.

---

## Fase 1 — Backend

### 1.1 Update `StorePositionRequest.php`

**File:** `app/Http/Requests/Outlet/Position/StorePositionRequest.php`

Tambahkan validasi `permissions` ke method `rules()`:

```php
'permissions'   => ['nullable', 'array'],
'permissions.*' => ['string', Rule::in(array_column(Permission::cases(), 'value'))],
```

Tambahkan import:
```php
use App\Enums\Permission;
use Illuminate\Validation\Rule;
```

Tambahkan ke `attributes()`:
```php
'permissions'   => 'daftar permission',
'permissions.*' => 'permission',
```

Tambahkan ke `messages()`:
```php
'permissions.*.in' => 'Permission yang dipilih tidak valid.',
```

---

### 1.2 Update `UpdatePositionRequest.php`

**File:** `app/Http/Requests/Outlet/Position/UpdatePositionRequest.php`

Tambahkan validasi yang sama dengan StorePositionRequest untuk `permissions`.

---

### 1.3 Update `OutletController::createPosition`

**File:** `app/Http/Controllers/Web/OutletController.php`

Tambahkan `permissionCatalog` ke data yang dikirim ke Inertia view:

```php
public function createPosition(int $outletId): Response|RedirectResponse
{
    try {
        $outlet = $this->outletService->getById($outletId);

        return Inertia::render('Dashboard/Outlets/Positions/Create', [
            'outlet'            => (new OutletResource($outlet))->resolve(),
            'permissionCatalog' => $this->positionService->getPermissionCatalog(),
        ]);
    } catch (Throwable $e) {
        // ... existing error handling
    }
}
```

---

### 1.4 Update `OutletController::editPosition`

**File:** `app/Http/Controllers/Web/OutletController.php`

Tambahkan `permissionCatalog` ke data yang dikirim ke Inertia view:

```php
public function editPosition(int $outletId, int $positionId): Response|RedirectResponse
{
    try {
        $position = $this->positionService->getById($positionId, ['outlet', 'permissions']);

        return Inertia::render('Dashboard/Outlets/Positions/Edit', [
            'outlet'            => (new OutletResource($position->outlet))->resolve(),
            'position'          => (new PositionResource($position))->resolve(),
            'permissionCatalog' => $this->positionService->getPermissionCatalog(),
        ]);
    } catch (Throwable $e) {
        // ... existing error handling
    }
}
```

---

### 1.5 Tambah `getPermissionCatalog()` ke `PositionService`

**File:** `app/Services/PositionService.php`

Tambahkan method baru di section Read Methods:

```php
public function getPermissionCatalog(): array
{
    return array_map(
        fn(Permission $p) => ['key' => $p->value, 'label' => $p->label()],
        Permission::cases()
    );
}
```

Method ini menjadi **single source of truth** untuk catalog permission.

---

## Fase 2 — Frontend Types

### 2.1 Update `OutletPositionFormData` type

**File:** `resources/js/types/outlet.ts` atau di mana `OutletPositionFormData` didefinisikan

Cek lokasi definisi `OutletPositionFormData`. Tambahkan field `permissions`:

```typescript
export interface OutletPositionFormData {
    name: string;
    description?: string;
    isActive?: boolean;
    permissions: string[];
}
```

---

### 2.2 Tambah type `PermissionCatalogItem`

**File:** `resources/js/types/permission.ts`

```typescript
export interface PermissionCatalogItem {
    key: string;
    label: string;
}
```

---

## Remaining Gaps

- Verify that `OutletService::storePosition()` and `OutletService::updatePosition()` forward `permissions` into `PositionService` write methods (store/update). If not, update those wrappers to forward the field.
- Add unit/integration tests covering validation and permission sync (see Test Plan below).
- Decide business rule: whether a position may be created with zero permissions. This affects validation (required vs optional) and UI copy.

## Decision (applied in repo)

Per review recommendation, the repo has been updated to treat `permissions` consistently as an array initialized by the form and the TypeScript type is now required (`permissions: string[]`). If you prefer the business rule "position must have at least one permission", update backend validation to add `required|array|min:1` for `permissions`.

## Error handling note for frontend

Laravel may return validation keys like `permissions.0`, `permissions.1` for per-item errors. The frontend must therefore map those keys into a user-visible message. Implementation notes:

- Pass the full Inertia `errors` object into `PermissionSelector`.
- `PermissionSelector` should display any `errors.permissions` string/array, or aggregate `permissions.*` keys into a single message.

## Test Plan (minimum)

1. Validation
    - Request validation rejects permission keys not in `Permission::cases()` (422 + message).
    - If business rule requires at least one permission, test `permissions` min:1.

2. Create/Update persistence
    - Creating a position with selected permissions persists relation entries.
    - Updating a position syncs permissions (adds/removes correctly).

3. Frontend behavior
    - `Create` page: permission catalog displays; selecting sends `permissions` array; server returns validation errors shown under permission selector when invalid.
    - `Edit` page: existing permissions preselected; updates send correct payload.

4. Permission mapping/middleware
    - Employee with multiple positions receives union of permissions.
    - Middleware checks per-outlet permissions still enforce correctly.

Suggested test files and targets:

- `tests/Feature/PositionPermissionValidationTest.php`
- `tests/Feature/PositionPermissionSyncTest.php`
- Frontend: simple Cypress/PestJS (or integration) to exercise Create/Edit flows.


---

## Fase 3 — Frontend Partials

> Semua partial berada di `resources/js/Pages/Dashboard/Outlets/Positions/Partials/`
> Jangan tulis comment. Gunakan nama yang self-explanatory.
> Gunakan `var(--color-*)` untuk semua warna.
> Gunakan komponen reusable: `Card`, `Badge`, `Button`.

### 3.1 Buat `PositionInfoSection.tsx`

**Tujuan:** Menampilkan field Nama dan Deskripsi posisi.

**Props:**
```typescript
interface Props {
    name: string;
    description: string;
    errors: { name?: string; description?: string };
    processing: boolean;
    onChange: (key: 'name' | 'description', value: string) => void;
}
```

**Konten:** Input nama + TextAreaInput deskripsi — dipindahkan dari Create/Edit page.

---

### 3.2 Buat `PermissionSelector.tsx`

**Tujuan:** Menampilkan daftar master permission sebagai grouped checklist.

**Props:**
```typescript
interface Props {
    catalog: PermissionCatalogItem[];
    selected: string[];
    onChange: (permissions: string[]) => void;
    disabled?: boolean;
    error?: string;
}
```

**UI Design (tanpa hardcode warna):**
- Section header dengan icon `ShieldCheck` dan judul "Hak Akses (Permissions)"
- Badge counter: "X / Y dipilih" menggunakan `var(--color-primary-500)` via CSS variable
- Daftar checkbox per permission, layout grid 2 kolom
- Setiap item: custom checkbox + label permission
- Tombol "Pilih Semua" dan "Reset"
- Gunakan `var(--color-primary-100)` sebagai background item yang tercentang
- Gunakan `var(--color-border)` untuk border

**Logika:**
```typescript
const toggle = (key: string) => {
    const next = selected.includes(key)
        ? selected.filter(k => k !== key)
        : [...selected, key];
    onChange(next);
};

const selectAll = () => onChange(catalog.map(p => p.key));
const reset = () => onChange([]);
```

---

### 3.3 Buat `PositionStatusSection.tsx`

**Tujuan:** Menampilkan toggle isActive (hanya untuk Edit).

**Props:**
```typescript
interface Props {
    isActive: boolean;
    onChange: (value: boolean) => void;
    disabled?: boolean;
}
```

**Konten:** Dipindahkan dari Edit.tsx — checkbox isActive + Alert warning jika nonaktif.

---

### 3.4 Buat `PositionFormActions.tsx`

**Tujuan:** Tombol Batal dan Submit di bagian bawah form.

**Props:**
```typescript
interface Props {
    processing: boolean;
    isValid: boolean;
    submitLabel: string;
    isDirty?: boolean;
    hasUnsavedChanges?: boolean;
    onCancel: () => void;
}
```

**Konten:** Dipindahkan dari Create/Edit.tsx — tombol Batal + tombol Submit dengan loading state.

---

## Fase 4 — Update Pages

### 4.1 Update `Create.tsx`

**File:** `resources/js/Pages/Dashboard/Outlets/Positions/Create.tsx`

**Props baru:**
```typescript
interface PositionCreateProps {
    outlet: Outlet;
    permissionCatalog: PermissionCatalogItem[];
}
```

**Form data baru:**
```typescript
useForm<OutletPositionFormData>({
    name: '',
    description: '',
    permissions: [],
});
```

**Layout baru (menggunakan Partials):**
```tsx
<Card className="p-8">
    <Form onSubmit={handleSubmit} className="space-y-8">
        <PositionInfoSection ... />
        <PermissionSelector
            catalog={permissionCatalog}
            selected={data.permissions}
            onChange={(p) => handleDataChange('permissions', p)}
            disabled={processing}
            error={errors.permissions}
        />
        <PositionFormActions
            processing={processing}
            isValid={!!data.name.trim()}
            submitLabel="Buat Posisi"
            onCancel={() => window.history.back()}
        />
    </Form>
</Card>
```

---

### 4.2 Update `Edit.tsx`

**File:** `resources/js/Pages/Dashboard/Outlets/Positions/Edit.tsx`

**Props baru:**
```typescript
interface PositionEditProps {
    outlet: Outlet;
    position: Position;
    permissionCatalog: PermissionCatalogItem[];
}
```

**Form data baru:**
```typescript
useForm<OutletPositionFormData>({
    name: position.name || '',
    description: position.description || '',
    isActive: position.isActive ?? true,
    permissions: position.permissions || [],
});
```

**Layout baru (menggunakan Partials):**
```tsx
<Card className="p-8">
    <Form onSubmit={handleSubmit} className="space-y-8">
        <PositionInfoSection ... />
        <PermissionSelector
            catalog={permissionCatalog}
            selected={data.permissions}
            onChange={(p) => handleDataChange('permissions', p)}
            disabled={processing}
        />
        <PositionStatusSection
            isActive={data.isActive!}
            onChange={(v) => handleDataChange('isActive', v)}
            disabled={processing}
        />
        <PositionFormActions
            processing={processing}
            isValid={!!data.name.trim()}
            submitLabel="Simpan Perubahan"
            isDirty={isDirty}
            hasUnsavedChanges={hasUnsavedChanges}
            onCancel={() => window.history.back()}
        />
    </Form>
</Card>
```

---

### 4.3 Update `types.ts`

**File:** `resources/js/Pages/Dashboard/Outlets/Positions/types.ts`

Update `PositionCreateProps` dan `PositionEditProps` dengan tambahan `permissionCatalog`.

---

## Urutan Implementasi

```
1. docs/spec/controller_spec.md        — Baca dulu
2. docs/spec/service_spec.md           — Baca dulu
3. docs/spec/model_spec.md             — Baca dulu
4. app/Enums/Permission.php            — Review (sudah ada, jangan ubah)
5. StorePositionRequest.php            — Tambah validasi permissions
6. UpdatePositionRequest.php           — Tambah validasi permissions
7. PositionService::getPermissionCatalog() — Tambah method
8. OutletController::createPosition    — Tambah permissionCatalog ke props
9. OutletController::editPosition      — Tambah permissionCatalog ke props
10. types/permission.ts                — Tambah PermissionCatalogItem
11. types/outlet.ts / form_data.ts     — Update OutletPositionFormData
12. Partials/PositionInfoSection.tsx   — Buat komponen baru
13. Partials/PermissionSelector.tsx    — Buat komponen baru
14. Partials/PositionStatusSection.tsx — Buat komponen baru
15. Partials/PositionFormActions.tsx   — Buat komponen baru
16. Pages/.../Positions/types.ts       — Update props interface
17. Pages/.../Positions/Create.tsx     — Refactor pakai Partials
18. Pages/.../Positions/Edit.tsx       — Refactor pakai Partials
```

---

## Checklist Sebelum Commit

- [ ] Tidak ada warna hardcode (semua pakai `var(--color-*)`)
- [ ] Tidak ada comment di kode
- [ ] Semua partial ada di folder `Partials/`
- [ ] `PermissionSelector` menggunakan komponen `Badge` dan `Card` yang sudah ada
- [ ] `permissions` terkirim saat submit (baik Create maupun Edit)
- [ ] Edit page menampilkan permission yang sudah tersimpan (preselected)
- [ ] Validasi backend menolak permission key yang tidak valid
- [ ] `getPermissionCatalog()` menggunakan `Permission::cases()` sebagai source of truth
- [ ] Tidak ada logika bisnis di komponen React — hanya di service

---

## Referensi File Penting

| File | Tujuan Review |
|---|---|
| `app/Enums/Permission.php` | Master list permission |
| `app/Services/PositionService.php` | Logic store/update sudah handle permissions |
| `resources/css/app.css` | Semua CSS variable yang bisa dipakai |
| `resources/js/Components/Card/Card.tsx` | Pattern komponen Card |
| `resources/js/Components/Badge/` | Untuk badge counter |
| `resources/js/Pages/Dashboard/Outlets/Positions/Partials/DeletePositionModal.tsx` | Contoh Partial yang sudah ada |
