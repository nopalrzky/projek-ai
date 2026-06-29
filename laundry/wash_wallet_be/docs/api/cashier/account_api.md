# Account API (Mobile Cashier) - Flutter Guide

Dokumentasi ini khusus untuk endpoint Account pada mobile cashier:

- `index`

Base path:

- `/api/mobile/cashier/accounts`

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
    "data": {}
}
```

Catatan:

- Endpoint ini saat ini mengembalikan list tanpa `meta` pagination karena controller memanggil `getAll(..., page: null, perPage: null)`.

### Error (controller)

```json
{
    "success": false,
    "message": "..."
}
```

### Validation Error (422)

Untuk validasi request query pada endpoint `index`, format 422 mengikuti default Laravel:

```json
{
    "message": "The given data was invalid.",
    "errors": {
        "outletId": ["The outlet id field is required."],
        "type": ["The selected type is invalid."]
    }
}
```

---

## 1) List Accounts (index)

- Method: `GET`
- URL: `/api/mobile/cashier/accounts`

### Query Params

- `outletId` (int, required, exists: `outlets.id`)
- `type` (string, required)
    - allowed: `funding`, `expense`, `transfer`

### Mapping Filter Internal

Controller akan mengubah query di atas menjadi filter internal:

- Base filter (semua type):
    - `includeCommonOutletAccounts=true`
    - `isTransactional=true`
    - `isActive=true`
    - `sortBy=code`
    - `sortDirection=asc`
- Tambahan per type:
    - `funding` -> `type=asset`, `accountRoles=[cash, bank, ewallet]`
    - `expense` -> `type=expense`
    - `transfer` -> `type=asset`, `accountRoles=[bank, ewallet]`, `sortBy=account_role`

### Example Request

```http
GET /api/mobile/cashier/accounts?outletId=1&type=funding
```

### Example Response 200

```json
{
    "success": true,
    "message": "Accounts retrieved successfully",
    "data": [
        {
            "id": 11,
            "ownerId": 2,
            "parentId": 3,
            "code": "1-01-0001",
            "name": "Kas Besar",
            "slug": "master_cash",
            "type": "asset",
            "typeLabel": "Aset",
            "variant": "success",
            "level": 3,
            "isActive": true,
            "isSystem": true,
            "isTransactional": true,
            "createdAt": "2026-04-20T08:00:00.000000Z",
            "updatedAt": "2026-04-20T08:00:00.000000Z",
            "deletedAt": null,
            "owner": null,
            "journalDetails": [],
            "parent": null,
            "children": [],
            "hasChildren": false,
            "childrensCount": 0
        },
        {
            "id": 25,
            "ownerId": 2,
            "parentId": 3,
            "code": "1-01-0005",
            "name": "Bank BCA",
            "slug": "bank_bca",
            "type": "asset",
            "typeLabel": "Aset",
            "variant": "success",
            "level": 3,
            "isActive": true,
            "isSystem": true,
            "isTransactional": true,
            "createdAt": "2026-04-20T08:00:00.000000Z",
            "updatedAt": "2026-04-20T08:00:00.000000Z",
            "deletedAt": null,
            "owner": null,
            "journalDetails": [],
            "parent": null,
            "children": [],
            "hasChildren": false,
            "childrensCount": 0
        }
    ]
}
```

### Example Response 404

```json
{
    "success": false,
    "message": "Outlet tidak ditemukan"
}
```

### Example Response 500

```json
{
    "success": false,
    "message": "Gagal memuat daftar akun"
}
```

---

## Field Mapping untuk Flutter

Model `Account`:

- `id`: int
- `ownerId`: int|null
- `parentId`: int|null
- `code`: string
- `name`: string
- `slug`: string
- `type`: string
- `typeLabel`: string
- `variant`: string
- `level`: int
- `isActive`: bool
- `isSystem`: bool
- `isTransactional`: bool
- `createdAt`: string (ISO 8601)|null
- `updatedAt`: string (ISO 8601)|null
- `deletedAt`: string (ISO 8601)|null
- `owner`: object|null
- `journalDetails`: array
- `parent`: object|null
- `children`: array
- `hasChildren`: bool|null
- `childrensCount`: int|null

---

## Catatan Implementasi Saat Ini

- Endpoint ini difokuskan untuk dropdown/opsi akun berdasarkan `type` dan `outletId`.
- Hanya akun aktif (`isActive=true`) dan transaksional (`isTransactional=true`) yang dikembalikan.
- Untuk type `funding` dan `transfer`, sistem hanya mengembalikan role akun tertentu sesuai konstanta di service.
