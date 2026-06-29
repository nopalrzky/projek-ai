# Unit API (Mobile Cashier) - Flutter Guide

Dokumentasi ini untuk endpoint Unit pada mobile cashier.

Base path:

- `/api/mobile/cashier/units`

Auth:

- Wajib Bearer Token (Sanctum)

Header wajib:

```http
Authorization: Bearer <access_token>
Accept: application/json
Content-Type: application/json
```

## Standard Response Envelope

### Success

```json
{
    "success": true,
    "message": "...",
    "data": {},
    "meta": {}
}
```

Catatan:

- Endpoint list unit mengembalikan data ter-pagination dari service.
- `meta` bisa tersedia jika helper response menyertakan pagination metadata.

### Error (controller)

```json
{
    "success": false,
    "message": "..."
}
```

### Validation Error (422)

Saat ini controller API Unit yang tersedia hanya endpoint list (`index`), sehingga tidak ada request body validation 422 dari endpoint ini.

---

## 1) List Units (index)

- Method: `GET`
- URL: `/api/mobile/cashier/units`

### Query Params

- `search` (string, optional)
- `sortBy` (string, optional, default dari controller: `createdAt`)
    - nilai yang didukung model: `name`, `symbol`, `description`, `is_active`, `created_at`, `updated_at`, `laundry_services_count`
- `sortDirection` (string, optional: `asc|desc`, default: `desc`)
- `page` (int, optional, default: `1`)
- `perPage` (int, optional, default: `15`)
- `per_page` (int, optional, alias untuk `perPage`)
- `isActive` (boolean, optional)

### Example Request

```http
GET /api/mobile/cashier/units?search=kg&sortBy=created_at&sortDirection=desc&page=1&perPage=10
```

### Example Response 200

```json
{
    "success": true,
    "message": "Units fetched successfully",
    "data": [
        {
            "id": 1,
            "name": "Kilogram",
            "symbol": "kg",
            "description": "Satuan berat untuk laundry kiloan",
            "laundryServices": [],
            "laundryServicesCount": 0,
            "createdAt": "2026-04-20T08:00:00.000000Z",
            "updatedAt": "2026-04-20T08:00:00.000000Z",
            "deletedAt": null
        },
        {
            "id": 2,
            "name": "Piece",
            "symbol": "pcs",
            "description": "Satuan per item",
            "laundryServices": [],
            "laundryServicesCount": 0,
            "createdAt": "2026-04-20T08:05:00.000000Z",
            "updatedAt": "2026-04-20T08:05:00.000000Z",
            "deletedAt": null
        }
    ],
    "meta": {
        "currentPage": 1,
        "from": 1,
        "lastPage": 1,
        "perPage": 10,
        "to": 2,
        "total": 2,
        "path": "https://your-domain/api/mobile/cashier/units"
    }
}
```

### Example Response 500

```json
{
    "success": false,
    "message": "Gagal memuat data satuan"
}
```

---

## Field Mapping untuk Flutter

Model `Unit`:

- `id`: int
- `name`: string|null
- `symbol`: string|null
- `description`: string|null
- `laundryServices`: array
- `laundryServicesCount`: int
- `createdAt`: string (ISO 8601)
- `updatedAt`: string (ISO 8601)
- `deletedAt`: string (ISO 8601)|null

---

## Catatan Implementasi Saat Ini

- Route mobile cashier menggunakan `Route::apiResource('units', UnitController::class)`, namun pada controller API ini yang terimplementasi baru method `index`.
- Filter `isActive` dibaca dari request, tetapi saat ini belum dipakai pada `UnitService::applyFilters`, sehingga belum mempengaruhi hasil query.
- Default `sortBy` dari controller adalah `createdAt`, sementara scope sort di model menggunakan kolom snake_case; bila tidak cocok maka fallback ke `created_at`.
