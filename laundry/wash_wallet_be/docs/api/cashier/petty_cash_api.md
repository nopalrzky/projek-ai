# Petty Cash API (Mobile Cashier) - Flutter Guide

Dokumentasi ini untuk endpoint Petty Cash pada mobile cashier.

Base path:

- `/api/mobile/cashier/petty-cashes`

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

- `meta` hanya ada pada endpoint list (`index`) karena pagination.

### Error (controller)

```json
{
    "success": false,
    "message": "..."
}
```

### Validation Error (422)

Untuk request validation (`StorePettyCashRequest`, `UpdatePettyCashRequest`), format 422 mengikuti default Laravel:

```json
{
    "message": "The given data was invalid.",
    "errors": {
        "amount": ["Jumlah minimal Rp 1"]
    }
}
```

---

## 1) List Petty Cashes (index)

- Method: `GET`
- URL: `/api/mobile/cashier/petty-cashes`

### Query Params

- `search` (string, optional)
- `outletId` (int, optional)
- `cashierId` (int, optional)
- `ownerId` (int, optional)
- `status` (string, optional)
    - allowed: `pending`, `approved`, `rejected`
- `sortBy` (string, optional, default: `created_at`)
    - allowed: `code`, `amount`, `status`, `requestDate`, `createdAt`, `updatedAt`
- `sortDirection` (string, optional: `asc|desc`, default: `desc`)
- `page` (int, optional, default: `1`)
- `perPage` (int, optional, default: `15`)

### Example Request

```http
GET /api/mobile/cashier/petty-cashes?status=pending&outletId=1&page=1&perPage=10
```

### Example Response 200

```json
{
    "success": true,
    "message": "Petty cashes retrieved successfully",
    "data": [
        {
            "id": 12,
            "code": "PTY-20260419-0001",
            "ownerId": 2,
            "outletId": 1,
            "cashierId": 7,
            "sourceAccountId": null,
            "amount": 250000,
            "formattedAmount": "Rp250.000",
            "description": "Dana operasional kas kecil",
            "requestDate": "2026-04-19T00:00:00.000000Z",
            "requestDateFormatted": "19 Apr 2026",
            "status": "pending",
            "statusLabel": "Menunggu Persetujuan",
            "statusColor": "warning",
            "approvedBy": null,
            "approvedAt": null,
            "approvedAtFormatted": null,
            "rejectionReason": null,
            "journalEntryId": null,
            "createdAt": "2026-04-19T08:00:00.000000Z",
            "updatedAt": "2026-04-19T08:00:00.000000Z",
            "createdAtFormatted": "19 Apr 2026 08:00",
            "createdAtHuman": "1 hour ago",
            "cashier": {
                "id": 7,
                "name": "Kasir A"
            },
            "outlet": {
                "id": 1,
                "name": "Outlet Utama"
            },
            "sourceAccount": null,
            "approvedByUser": null,
            "journalEntry": null
        }
    ],
    "meta": {
        "currentPage": 1,
        "from": 1,
        "lastPage": 1,
        "perPage": 10,
        "to": 1,
        "total": 1,
        "path": "https://your-domain/api/mobile/cashier/petty-cashes"
    }
}
```

---

## 2) Petty Cash Detail (show)

- Method: `GET`
- URL: `/api/mobile/cashier/petty-cashes/{id}`

### Path Param

- `id` (int, required)

### Example Response 200

```json
{
    "success": true,
    "message": "Petty cash retrieved successfully",
    "data": {
        "id": 12,
        "code": "PTY-20260419-0001",
        "ownerId": 2,
        "outletId": 1,
        "cashierId": 7,
        "sourceAccountId": 4,
        "amount": 250000,
        "formattedAmount": "Rp250.000",
        "description": "Dana operasional kas kecil",
        "requestDate": "2026-04-19T00:00:00.000000Z",
        "requestDateFormatted": "19 Apr 2026",
        "status": "approved",
        "statusLabel": "Disetujui",
        "statusColor": "success",
        "approvedBy": 2,
        "approvedAt": "2026-04-19T09:00:00.000000Z",
        "approvedAtFormatted": "19 Apr 2026 09:00",
        "rejectionReason": null,
        "journalEntryId": 99,
        "createdAt": "2026-04-19T08:00:00.000000Z",
        "updatedAt": "2026-04-19T09:00:00.000000Z",
        "createdAtFormatted": "19 Apr 2026 08:00",
        "createdAtHuman": "1 hour ago",
        "cashier": {
            "id": 7,
            "name": "Kasir A"
        },
        "outlet": {
            "id": 1,
            "name": "Outlet Utama"
        },
        "sourceAccount": {
            "id": 4,
            "name": "Kas Utama"
        },
        "approvedByUser": {
            "id": 2,
            "name": "Owner"
        },
        "journalEntry": {
            "id": 99,
            "transactionNumber": "JV-20260419-0001"
        }
    }
}
```

### Example Response 404

```json
{
    "success": false,
    "message": "Data tidak ditemukan"
}
```

### Example Response 500

```json
{
    "success": false,
    "message": "Gagal memuat data petty cash"
}
```

---

## 3) Create Petty Cash (store)

- Method: `POST`
- URL: `/api/mobile/cashier/petty-cashes`

### Body (JSON)

- `amount` (number, required, min 1)
- `description` (string, required, max 1000)
- `requestDate` (date, required)

### Example Request

```json
{
    "amount": 250000,
    "description": "Dana operasional kas kecil",
    "requestDate": "2026-04-19"
}
```

### Example Response 201

```json
{
    "success": true,
    "message": "Petty cash created successfully",
    "data": {
        "id": 12,
        "code": "PTY-20260419-0001",
        "ownerId": 2,
        "outletId": 1,
        "cashierId": 7,
        "sourceAccountId": null,
        "amount": 250000,
        "formattedAmount": "Rp250.000",
        "description": "Dana operasional kas kecil",
        "requestDate": "2026-04-19T00:00:00.000000Z",
        "requestDateFormatted": "19 Apr 2026",
        "status": "pending",
        "statusLabel": "Menunggu Persetujuan",
        "statusColor": "warning",
        "approvedBy": null,
        "approvedAt": null,
        "approvedAtFormatted": null,
        "rejectionReason": null,
        "journalEntryId": null,
        "createdAt": "2026-04-19T08:00:00.000000Z",
        "updatedAt": "2026-04-19T08:00:00.000000Z",
        "createdAtFormatted": "19 Apr 2026 08:00",
        "createdAtHuman": "just now",
        "cashier": {
            "id": 7,
            "name": "Kasir A"
        },
        "outlet": {
            "id": 1,
            "name": "Outlet Utama"
        },
        "sourceAccount": null,
        "approvedByUser": null,
        "journalEntry": null
    }
}
```

### Example Response 422

```json
{
    "message": "The given data was invalid.",
    "errors": {
        "amount": ["Jumlah minimal Rp 1"],
        "description": ["Deskripsi harus diisi"],
        "requestDate": ["Tanggal permintaan harus diisi"]
    }
}
```

---

## 4) Update Petty Cash (update)

- Method: `PUT`
- URL: `/api/mobile/cashier/petty-cashes/{id}`

### Path Param

- `id` (int, required)

### Body (JSON)

- `amount` (number, optional, min 1)
- `description` (string, optional, max 1000)
- `requestDate` (date, optional)

### Example Request

```json
{
    "amount": 300000,
    "description": "Dana operasional kas kecil - revisi"
}
```

### Example Response 200

```json
{
    "success": true,
    "message": "Petty cash updated successfully",
    "data": {
        "id": 12,
        "code": "PTY-20260419-0001",
        "ownerId": 2,
        "outletId": 1,
        "cashierId": 7,
        "sourceAccountId": null,
        "amount": 300000,
        "formattedAmount": "Rp300.000",
        "description": "Dana operasional kas kecil - revisi",
        "requestDate": "2026-04-19T00:00:00.000000Z",
        "requestDateFormatted": "19 Apr 2026",
        "status": "pending",
        "statusLabel": "Menunggu Persetujuan",
        "statusColor": "warning",
        "approvedBy": null,
        "approvedAt": null,
        "approvedAtFormatted": null,
        "rejectionReason": null,
        "journalEntryId": null,
        "createdAt": "2026-04-19T08:00:00.000000Z",
        "updatedAt": "2026-04-19T08:10:00.000000Z",
        "createdAtFormatted": "19 Apr 2026 08:00",
        "createdAtHuman": "10 minutes ago",
        "cashier": {
            "id": 7,
            "name": "Kasir A"
        },
        "outlet": {
            "id": 1,
            "name": "Outlet Utama"
        },
        "sourceAccount": null,
        "approvedByUser": null,
        "journalEntry": null
    }
}
```

### Example Response 404

```json
{
    "success": false,
    "message": "Data tidak ditemukan"
}
```

### Example Response 500

```json
{
    "success": false,
    "message": "Gagal memperbarui petty cash"
}
```

---

## Status Values

Status petty cash yang tersedia di model:

- `pending`
- `approved`
- `rejected`

Status label:

- `pending` -> `Menunggu Persetujuan`
- `approved` -> `Disetujui`
- `rejected` -> `Ditolak`

---

## Field Mapping untuk Flutter

Model `PettyCash`:

- `id`: int
- `code`: string|null
- `ownerId`: int|null
- `outletId`: int|null
- `cashierId`: int|null
- `sourceAccountId`: int|null
- `amount`: number
- `formattedAmount`: string
- `description`: string|null
- `requestDate`: string (ISO 8601)
- `requestDateFormatted`: string
- `status`: string
- `statusLabel`: string
- `statusColor`: string
- `approvedBy`: int|null
- `approvedAt`: string (ISO 8601)|null
- `approvedAtFormatted`: string|null
- `rejectionReason`: string|null
- `journalEntryId`: int|null
- `createdAt`: string (ISO 8601)
- `updatedAt`: string (ISO 8601)
- `createdAtFormatted`: string|null
- `createdAtHuman`: string|null
- `cashier`: object|null
- `outlet`: object|null
- `sourceAccount`: object|null
- `approvedByUser`: object|null
- `journalEntry`: object|null

---

## Catatan Implementasi Saat Ini

- Endpoint approval, rejection, cancellation, dan deletion tidak diekspos di controller mobile cashier ini.
- Update hanya dapat dilakukan selama petty cash masih dapat disetujui, yaitu saat status masih `pending`.
- Nomor petty cash dibuat otomatis dengan format `PTY-YYYYMMDD-0001`.
