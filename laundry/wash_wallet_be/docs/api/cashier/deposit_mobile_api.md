# Deposit API (Mobile Cashier) - Flutter Guide

Dokumentasi ini untuk endpoint Deposit pada mobile cashier.

Base path:

- `/api/mobile/cashier/deposits`

Auth:

- Wajib Bearer Token (Sanctum)

Header umum:

```http
Authorization: Bearer <access_token>
Accept: application/json
```

Catatan content-type:

- `store` dan `update` support upload file (`attachment`), jadi gunakan `multipart/form-data`.

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

- `meta` hanya muncul pada endpoint list (`index`) karena pagination.

### Error (controller)

```json
{
    "success": false,
    "message": "..."
}
```

### Validation Error (422)

```json
{
    "message": "The given data was invalid.",
    "errors": {
        "amount": ["Jumlah setoran minimal Rp 1"]
    }
}
```

---

## Endpoint Tersedia

Di route mobile cashier saat ini, endpoint Deposit yang aktif adalah:

- `GET /deposits` (index)
- `GET /deposits/{id}` (show)
- `POST /deposits` (store)
- `PUT /deposits/{id}` (update)

Catatan:

- Tidak ada endpoint `DELETE /deposits/{id}` pada route mobile cashier saat ini.

---

## 1) List Deposits (index)

- Method: `GET`
- URL: `/api/mobile/cashier/deposits`

### Query Params

- `search` (string, optional)
- `outletId` (int, optional)
- `cashierId` (int, optional)
- `ownerId` (int, optional)
- `status` (string, optional)
- `sortBy` (string, optional, default: `created_at`)
- `sortDirection` (string, optional: `asc|desc`, default: `desc`)
- `page` (int, optional, default: `1`)
- `perPage` (int, optional, default: `15`)

### Example Request

```http
GET /api/mobile/cashier/deposits?outletId=1&status=pending&page=1&perPage=10
```

### Example Response 200

```json
{
    "success": true,
    "message": "Deposits retrieved successfully",
    "data": [
        {
            "id": 55,
            "code": "DPS-20260419-0001",
            "ownerId": 1,
            "outletId": 1,
            "cashierId": 9,
            "sourceAccountId": 11,
            "destinationAccountId": 3,
            "amount": 250000,
            "formattedAmount": "Rp250.000",
            "notes": "Setoran shift pagi",
            "attachmentPath": "deposits/proof-1.jpg",
            "attachmentUrl": "https://your-domain/storage/deposits/proof-1.jpg",
            "status": "pending",
            "statusLabel": "Pending",
            "statusColor": "warning",
            "approvedBy": null,
            "approvedAt": null,
            "approvedAtFormatted": null,
            "rejectionReason": null,
            "journalEntryId": null,
            "createdAt": "2026-04-19 09:00:00",
            "updatedAt": "2026-04-19 09:00:00",
            "createdAtFormatted": "19 Apr 2026 09:00",
            "createdAtHuman": "1 hour ago",
            "cashier": {
                "id": 9,
                "name": "Kasir A"
            },
            "outlet": {
                "id": 1,
                "name": "Outlet A"
            },
            "sourceAccount": {
                "id": 11,
                "name": "Kas Outlet A"
            },
            "destinationAccount": {
                "id": 3,
                "name": "Bank BCA"
            },
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
        "path": "https://your-domain/api/mobile/cashier/deposits",
        "firstPageUrl": "https://your-domain/api/mobile/cashier/deposits?page=1",
        "lastPageUrl": "https://your-domain/api/mobile/cashier/deposits?page=1",
        "nextPageUrl": null,
        "prevPageUrl": null
    }
}
```

---

## 2) Deposit Detail (show)

- Method: `GET`
- URL: `/api/mobile/cashier/deposits/{id}`

### Path Param

- `id` (int, required)

### Example Response 200

```json
{
    "success": true,
    "message": "Deposit retrieved successfully",
    "data": {
        "id": 55,
        "code": "DPS-20260419-0001",
        "ownerId": 1,
        "outletId": 1,
        "cashierId": 9,
        "sourceAccountId": 11,
        "destinationAccountId": 3,
        "amount": 250000,
        "formattedAmount": "Rp250.000",
        "notes": "Setoran shift pagi",
        "attachmentPath": "deposits/proof-1.jpg",
        "attachmentUrl": "https://your-domain/storage/deposits/proof-1.jpg",
        "status": "pending",
        "statusLabel": "Pending",
        "statusColor": "warning",
        "approvedBy": null,
        "approvedAt": null,
        "approvedAtFormatted": null,
        "rejectionReason": null,
        "journalEntryId": null,
        "createdAt": "2026-04-19 09:00:00",
        "updatedAt": "2026-04-19 09:00:00",
        "createdAtFormatted": "19 Apr 2026 09:00",
        "createdAtHuman": "1 hour ago",
        "cashier": { "id": 9, "name": "Kasir A" },
        "outlet": { "id": 1, "name": "Outlet A" },
        "sourceAccount": { "id": 11, "name": "Kas Outlet A" },
        "destinationAccount": { "id": 3, "name": "Bank BCA" },
        "approvedByUser": null,
        "journalEntry": null
    }
}
```

### Example Response 404

```json
{
    "success": false,
    "message": "Deposit tidak ditemukan"
}
```

---

## 3) Create Deposit (store)

- Method: `POST`
- URL: `/api/mobile/cashier/deposits`
- Content-Type: `multipart/form-data`

### Body (form-data)

- `destinationAccountId` (int, required, exists:accounts,id)
- `amount` (number, required, min 1)
- `notes` (string, optional, max 1000)
- `attachment` (file, optional: jpg/jpeg/png/pdf, max 5MB)

### Example Request (form-data)

- `destinationAccountId`: `3`
- `amount`: `250000`
- `notes`: `Setoran shift pagi`
- `attachment`: `<file.jpg>`

### Example Response 201

```json
{
    "success": true,
    "message": "Deposit created successfully",
    "data": {
        "id": 55,
        "code": "DPS-20260419-0001",
        "ownerId": 1,
        "outletId": 1,
        "cashierId": 9,
        "sourceAccountId": 11,
        "destinationAccountId": 3,
        "amount": 250000,
        "formattedAmount": "Rp250.000",
        "notes": "Setoran shift pagi",
        "status": "pending"
    }
}
```

---

## 4) Update Deposit (update)

- Method: `PUT`
- URL: `/api/mobile/cashier/deposits/{id}`
- Content-Type: `multipart/form-data`

### Path Param

- `id` (int, required)

### Body (form-data)

- `destination_account_id` (int, optional, exists:accounts,id)
- `amount` (number, optional, min 1)
- `notes` (string, optional, max 1000)
- `attachment` (file, optional: jpg/jpeg/png/pdf, max 5MB)

### Penting (konsistensi field)

- Pada `store` field memakai `destinationAccountId` (camelCase).
- Pada `update` field memakai `destination_account_id` (snake_case).

Gunakan nama field persis sesuai endpoint agar update berhasil.

### Example Request (form-data)

- `amount`: `300000`
- `notes`: `Revisi nominal setoran`
- `attachment`: `<proof.pdf>`

### Example Response 200

```json
{
    "success": true,
    "message": "Deposit updated successfully",
    "data": {
        "id": 55,
        "code": "DPS-20260419-0001",
        "amount": 300000,
        "formattedAmount": "Rp300.000",
        "notes": "Revisi nominal setoran",
        "status": "pending"
    }
}
```

---

## Field Mapping untuk Flutter

Mapping model `Deposit`:

- `id`: int
- `code`: String
- `ownerId`: int?
- `outletId`: int?
- `cashierId`: int?
- `sourceAccountId`: int?
- `destinationAccountId`: int?
- `amount`: double
- `formattedAmount`: String
- `notes`: String?
- `attachmentPath`: String?
- `attachmentUrl`: String?
- `status`: String
- `statusLabel`: String
- `statusColor`: String
- `approvedBy`: int?
- `approvedAt`: String?
- `approvedAtFormatted`: String?
- `rejectionReason`: String?
- `journalEntryId`: int?
- `createdAt`: String
- `updatedAt`: String
- `createdAtFormatted`: String
- `createdAtHuman`: String
- `cashier`: Object?
- `outlet`: Object?
- `sourceAccount`: Object?
- `destinationAccount`: Object?
- `approvedByUser`: Object?
- `journalEntry`: Object?

## cURL Quick Test

```bash
curl --location 'https://your-domain/api/mobile/cashier/deposits?page=1&perPage=10' \
  --header 'Authorization: Bearer <access_token>' \
  --header 'Accept: application/json'
```
