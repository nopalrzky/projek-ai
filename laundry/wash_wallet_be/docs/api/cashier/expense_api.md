# Expense API (Mobile Cashier) - Flutter Guide

Dokumentasi ini untuk endpoint Expense API pada mobile cashier.

Base path:

- `/api/mobile/cashier/expenses`

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
        "amount": ["Jumlah pengeluaran harus diisi."]
    }
}
```

---

## Endpoint Tersedia

1. `GET /api/mobile/cashier/expenses` -> `index`
2. `GET /api/mobile/cashier/expenses/{id}` -> `show`
3. `POST /api/mobile/cashier/expenses` -> `store`
4. `PUT /api/mobile/cashier/expenses/{id}` -> `update`

Catatan:

- Route `DELETE /api/mobile/cashier/expenses/{id}` sudah terdaftar di route file, tetapi method `destroy` belum tersedia di `ExpenseController` saat ini.

---

## 1) List Expenses (index)

- Method: `GET`
- URL: `/api/mobile/cashier/expenses`

### Query Params

- `search` (string, optional)
- `outletId` (int, optional)
- `employeeId` (int, optional)
- `expenseAccountId` (int, optional)
- `sourceAccountId` (int, optional)
- `status` (string, optional)
- `startDate` (date, optional, format `YYYY-MM-DD`)
- `endDate` (date, optional, format `YYYY-MM-DD`)
- `minAmount` (number, optional)
- `maxAmount` (number, optional)
- `hasAttachment` (bool, optional)
- `sortBy` (string, optional, default `date`)
- `sortDirection` (string, optional, default `desc`)
- `page` (int, optional, default `1`)
- `perPage` (int, optional, default `15`)

### Example Request

```http
GET /api/mobile/cashier/expenses?outletId=1&status=pending&startDate=2026-04-01&endDate=2026-04-30&page=1&perPage=10
```

### Example Response 200

```json
{
    "success": true,
    "message": "Expenses retrieved successfully",
    "data": [
        {
            "id": 101,
            "code": "EXP-202604-0001",
            "outletId": 1,
            "userId": 3,
            "employeeId": 9,
            "expenseAccountId": 12,
            "sourceAccountId": 5,
            "amount": 150000,
            "date": "2026-04-18",
            "description": "Beli deterjen",
            "attachment": "expenses/attachments/exp-101.jpg",
            "attachmentUrl": "https://your-domain/storage/expenses/attachments/exp-101.jpg",
            "hasAttachment": true,
            "status": "pending",
            "approvedBy": null,
            "approvedAt": null,
            "rejectionReason": null,
            "journalEntryId": null,
            "createdAt": "2026-04-18T08:30:00.000000Z",
            "updatedAt": "2026-04-18T08:30:00.000000Z",
            "deletedAt": null,
            "formattedAmount": "Rp 150.000",
            "formattedDate": "18 Apr 2026",
            "statusLabel": "Menunggu Persetujuan",
            "statusColor": "warning",
            "isPending": true,
            "isApproved": false,
            "isRejected": false,
            "canBeApproved": true,
            "canBeRejected": true,
            "canBeCancelled": true,
            "outlet": null,
            "employee": null,
            "user": null,
            "expenseAccount": null,
            "sourceAccount": null,
            "approver": null,
            "journalEntry": null
        }
    ],
    "meta": {
        "currentPage": 1,
        "lastPage": 3,
        "perPage": 10,
        "total": 24
    }
}
```

---

## 2) Expense Detail (show)

- Method: `GET`
- URL: `/api/mobile/cashier/expenses/{id}`

### Path Param

- `id` (int, required)

### Example Response 200

```json
{
    "success": true,
    "message": "Expense retrieved successfully",
    "data": {
        "id": 101,
        "code": "EXP-202604-0001",
        "outletId": 1,
        "userId": 3,
        "employeeId": 9,
        "expenseAccountId": 12,
        "sourceAccountId": 5,
        "amount": 150000,
        "date": "2026-04-18",
        "description": "Beli deterjen",
        "attachment": "expenses/attachments/exp-101.jpg",
        "attachmentUrl": "https://your-domain/storage/expenses/attachments/exp-101.jpg",
        "hasAttachment": true,
        "status": "pending",
        "approvedBy": null,
        "approvedAt": null,
        "rejectionReason": null,
        "journalEntryId": null,
        "createdAt": "2026-04-18T08:30:00.000000Z",
        "updatedAt": "2026-04-18T08:30:00.000000Z",
        "deletedAt": null,
        "formattedAmount": "Rp 150.000",
        "formattedDate": "18 Apr 2026",
        "statusLabel": "Menunggu Persetujuan",
        "statusColor": "warning",
        "isPending": true,
        "isApproved": false,
        "isRejected": false,
        "canBeApproved": true,
        "canBeRejected": true,
        "canBeCancelled": true,
        "outlet": null,
        "employee": null,
        "user": null,
        "expenseAccount": null,
        "sourceAccount": null,
        "approver": null,
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

---

## 3) Create Expense (store)

- Method: `POST`
- URL: `/api/mobile/cashier/expenses`
- Content-Type: `multipart/form-data` (jika upload attachment)

### Body

- `outletId` (int, required)
- `expenseAccountId` (int, required, account type harus `expense`)
- `sourceAccountId` (int, conditional)
    - Wajib untuk owner
    - Optional untuk employee yang login via sanctum
- `amount` (number, required, min 1, max 999999999.99)
- `date` (date, required, <= today)
- `description` (string, optional, max 500)
- `attachment` (file image optional: jpeg/jpg/png/gif/webp, max 2MB)

### Example Request (JSON tanpa file)

```json
{
    "outletId": 1,
    "expenseAccountId": 12,
    "sourceAccountId": 5,
    "amount": 150000,
    "date": "2026-04-18",
    "description": "Beli deterjen"
}
```

### Example Response 201

```json
{
    "success": true,
    "message": "Expense created successfully",
    "data": {
        "id": 101,
        "code": "EXP-202604-0001",
        "outletId": 1,
        "expenseAccountId": 12,
        "sourceAccountId": 5,
        "amount": 150000,
        "date": "2026-04-18",
        "description": "Beli deterjen",
        "status": "pending",
        "hasAttachment": false,
        "createdAt": "2026-04-18T08:30:00.000000Z",
        "updatedAt": "2026-04-18T08:30:00.000000Z"
    }
}
```

---

## 4) Update Expense (update)

- Method: `PUT`
- URL: `/api/mobile/cashier/expenses/{id}`
- Content-Type: `multipart/form-data` (jika upload attachment)

### Path Param

- `id` (int, required)

### Body

Sama dengan `store`, tambahan:

- `removeAttachment` (bool, optional)

### Example Request (JSON tanpa file)

```json
{
    "outletId": 1,
    "expenseAccountId": 12,
    "sourceAccountId": 5,
    "amount": 200000,
    "date": "2026-04-19",
    "description": "Beli pewangi",
    "removeAttachment": false
}
```

### Example Response 200

```json
{
    "success": true,
    "message": "Expense updated successfully",
    "data": {
        "id": 101,
        "code": "EXP-202604-0001",
        "outletId": 1,
        "expenseAccountId": 12,
        "sourceAccountId": 5,
        "amount": 200000,
        "date": "2026-04-19",
        "description": "Beli pewangi",
        "status": "pending",
        "hasAttachment": true,
        "updatedAt": "2026-04-19T09:30:00.000000Z"
    }
}
```

---

## Field Mapping untuk Flutter

Model `Expense`:

- `id`: int
- `code`: String
- `outletId`: int
- `userId`: int?
- `employeeId`: int?
- `expenseAccountId`: int
- `sourceAccountId`: int
- `amount`: double
- `date`: String? (YYYY-MM-DD)
- `description`: String?
- `attachment`: String?
- `attachmentUrl`: String?
- `hasAttachment`: bool
- `status`: String
- `approvedBy`: int?
- `approvedAt`: DateTime?
- `rejectionReason`: String?
- `journalEntryId`: int?
- `formattedAmount`: String
- `formattedDate`: String?
- `statusLabel`: String
- `statusColor`: String
- `isPending`: bool
- `isApproved`: bool
- `isRejected`: bool
- `canBeApproved`: bool
- `canBeRejected`: bool
- `canBeCancelled`: bool
- `outlet`: Object?
- `employee`: Object?
- `user`: Object?
- `expenseAccount`: Object?
- `sourceAccount`: Object?
- `approver`: Object?
- `journalEntry`: Object?
- `createdAt`: DateTime?
- `updatedAt`: DateTime?
- `deletedAt`: DateTime?

## cURL Quick Test

```bash
curl --location 'https://your-domain/api/mobile/cashier/expenses?outletId=1&perPage=10' \
  --header 'Authorization: Bearer <access_token>' \
  --header 'Accept: application/json'
```
