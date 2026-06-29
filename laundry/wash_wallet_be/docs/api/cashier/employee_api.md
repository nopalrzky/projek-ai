# Employee API (Mobile Cashier) - Flutter Guide

Dokumentasi ini untuk endpoint Employee API terbaru (sudah pakai pola `index/show/update`).

Base path:

- `/api/mobile/cashier/employees`

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
        "name": ["Nama Karyawan wajib diisi."]
    }
}
```

---

## Endpoint Tersedia

1. `GET /api/mobile/cashier/employees` -> `index`
2. `GET /api/mobile/cashier/employees/{id}` -> `show`
3. `PUT /api/mobile/cashier/employees/{id}` -> `update`

---

## 1) List Employees (index)

- Method: `GET`
- URL: `/api/mobile/cashier/employees`

### Query Params

- `outletId` (int, optional)

### Example Request

```http
GET /api/mobile/cashier/employees?outletId=1
```

### Example Response 200

```json
{
    "success": true,
    "message": "Employees fetched successfully",
    "data": [
        {
            "id": 9,
            "name": "Kasir A",
            "username": "kasir.a",
            "email": null,
            "phone": "08120000001",
            "gender": "male",
            "formattedGender": "Laki-laki",
            "address": "Bandung",
            "age": 25,
            "startDate": "2026-01-01",
            "dateOfBirth": "2001-01-01",
            "isActive": true,
            "outletId": 1,
            "cutoffDays": 30,
            "lastLoginAt": "2026-04-19T08:00:00.000000Z",
            "outlet": null,
            "employeeSalaries": [],
            "employeePositions": [],
            "employeeProcesses": [],
            "fineLogs": [],
            "loans": [],
            "orders": [],
            "employeePositionsCount": 0,
            "employeeProcessesCount": 0,
            "employeeSalariesCount": 0,
            "fineLogsCount": 0,
            "loansCount": 0,
            "ordersCount": 0,
            "createdAt": "2026-01-01T00:00:00.000000Z",
            "updatedAt": "2026-04-19T08:00:00.000000Z",
            "deletedAt": null
        }
    ]
}
```

---

## 2) Employee Detail (show)

- Method: `GET`
- URL: `/api/mobile/cashier/employees/{id}`

### Path Param

- `id` (int, required)

### Example Response 200

```json
{
    "success": true,
    "message": "Employee fetched successfully",
    "data": {
        "id": 9,
        "name": "Kasir A",
        "username": "kasir.a",
        "email": null,
        "phone": "08120000001",
        "gender": "male",
        "formattedGender": "Laki-laki",
        "address": "Bandung",
        "age": 25,
        "startDate": "2026-01-01",
        "dateOfBirth": "2001-01-01",
        "isActive": true,
        "outletId": 1,
        "cutoffDays": 30,
        "lastLoginAt": "2026-04-19T08:00:00.000000Z",
        "outlet": null,
        "employeeSalaries": [],
        "employeePositions": [],
        "employeeProcesses": [],
        "fineLogs": [],
        "loans": [],
        "orders": [],
        "employeePositionsCount": 0,
        "employeeProcessesCount": 0,
        "employeeSalariesCount": 0,
        "fineLogsCount": 0,
        "loansCount": 0,
        "ordersCount": 0,
        "createdAt": "2026-01-01T00:00:00.000000Z",
        "updatedAt": "2026-04-19T08:00:00.000000Z",
        "deletedAt": null
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

## 3) Update Employee (update)

- Method: `PUT`
- URL: `/api/mobile/cashier/employees/{id}`

### Path Param

- `id` (int, required)

### Body (JSON)

Field utama:

- `name` (string, required, min 2, max 255)
- `startDate` (date, required, <= today)
- `cutoffDays` (int, required, 1..365)
- `isActive` (bool, optional)
- `phone` (string, optional, regex nomor telepon)
- `address` (string, optional, max 500)
- `gender` (string, optional: `male|female`)
- `avatar` (file, optional, jpeg/jpg/png/webp, max 2MB)

Field relasi (optional):

- `positionIds` (array int)
- `employeeSalaries` (array)
- `employeeSalaries[].salaryId` (int, required jika item ada)
- `employeeSalaries[].amount` (number, required jika item ada, min 0)
- `employeeProcessCommissions` (array)
- `employeeProcessCommissions[].processId` (int, required)
- `employeeProcessCommissions[].commissionType` (`per_item|per_kg|percentage|flat`)
- `employeeProcessCommissions[].commissionValue` (number, min 0, max 100 jika type `percentage`)
- `employeeProcessCommissions[].hasTarget` (bool, required)
- `employeeProcessCommissions[].targetThreshold` (int, required jika hasTarget=true)
- `employeeProcessCommissions[].bonusAmount` (number, required jika hasTarget=true)
- `employeeProcessCommissions[].effectiveDate` (date, optional)
- `employeeProcessCommissions[].isActive` (bool, required)

### Example Request

```json
{
    "name": "Kasir A Update",
    "startDate": "2026-01-01",
    "cutoffDays": 30,
    "isActive": true,
    "phone": "08120000002",
    "address": "Bandung",
    "gender": "male",
    "positionIds": [1, 2],
    "employeeSalaries": [
        {
            "salaryId": 1,
            "amount": 2500000
        }
    ],
    "employeeProcessCommissions": [
        {
            "processId": 1,
            "commissionType": "percentage",
            "commissionValue": 10,
            "hasTarget": false,
            "targetThreshold": null,
            "bonusAmount": null,
            "effectiveDate": "2026-04-01",
            "isActive": true
        }
    ]
}
```

### Example Response 200

```json
{
    "success": true,
    "message": "Employee updated successfully",
    "data": {
        "id": 9,
        "name": "Kasir A Update",
        "username": "kasir.a",
        "email": null,
        "phone": "08120000002",
        "gender": "male",
        "formattedGender": "Laki-laki",
        "address": "Bandung",
        "age": 25,
        "startDate": "2026-01-01",
        "dateOfBirth": "2001-01-01",
        "isActive": true,
        "outletId": 1,
        "cutoffDays": 30,
        "lastLoginAt": "2026-04-19T08:00:00.000000Z",
        "createdAt": "2026-01-01T00:00:00.000000Z",
        "updatedAt": "2026-04-19T09:30:00.000000Z",
        "deletedAt": null
    }
}
```

---

## Field Mapping untuk Flutter

Mapping model `Employee`:

- `id`: int
- `name`: String
- `username`: String
- `email`: String?
- `phone`: String?
- `gender`: String?
- `formattedGender`: String
- `address`: String?
- `age`: int?
- `startDate`: String?
- `dateOfBirth`: String?
- `isActive`: bool
- `outletId`: int?
- `cutoffDays`: int?
- `lastLoginAt`: DateTime?
- `outlet`: Object?
- `employeeSalaries`: List
- `employeePositions`: List
- `employeeProcesses`: List
- `fineLogs`: List
- `loans`: List
- `orders`: List
- `employeePositionsCount`: int
- `employeeProcessesCount`: int
- `employeeSalariesCount`: int
- `fineLogsCount`: int
- `loansCount`: int
- `ordersCount`: int
- `createdAt`: DateTime?
- `updatedAt`: DateTime?
- `deletedAt`: DateTime?

## cURL Quick Test

```bash
curl --location 'https://your-domain/api/mobile/cashier/employees?outletId=1' \
  --header 'Authorization: Bearer <access_token>' \
  --header 'Accept: application/json'
```
