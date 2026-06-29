# Membership Contract API (Mobile Cashier) - Flutter Guide

Dokumentasi ini untuk API kontrak membership pada mobile cashier.

Base path utama:

- /api/mobile/cashier/membership-contracts

Endpoint terkait create:

- /api/mobile/cashier/customers/{customerId}/membership-contracts

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

- meta hanya ada pada endpoint list yang menggunakan pagination.

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
        "membershipPlanId": ["Paket membership harus dipilih."]
    }
}
```

---

## 1) List Membership Contracts (index)

- Method: GET
- URL: /api/mobile/cashier/membership-contracts

### Query Params

- search (string, optional)
- customerId (int, optional)
- outletId (int, optional)
- membershipPlanId (int, optional)
- status (string, optional)
- totalPaidMin (float, optional)
- totalPaidMax (float, optional)
- sortBy (string, optional, default: createdAt)
    - allowed: id, startAt, expiredAt, totalPaid, status, createdAt, updatedAt
- sortDirection (string, optional, default: desc)
    - allowed: asc, desc
- page (int, optional, default: 1)
- perPage (int, optional, default: 15)

### Example Request

```http
GET /api/mobile/cashier/membership-contracts?outletId=1&status=active&page=1&perPage=10
```

### Example Response 200

```json
{
    "success": true,
    "message": "Membership contracts retrieved successfully",
    "data": [
        {
            "id": 55,
            "customerId": 10,
            "outletId": 1,
            "membershipPlanId": 3,
            "startAt": "2026-04-20T00:00:00.000000Z",
            "expiredAt": "2026-05-20T00:00:00.000000Z",
            "status": "active",
            "totalPaid": 250000,
            "formattedTotalPaid": "Rp. 250.000,00",
            "createdAt": "2026-04-19T10:00:00.000000Z",
            "updatedAt": "2026-04-19T10:00:00.000000Z",
            "customer": null,
            "outlet": null,
            "membershipPlan": null
        }
    ],
    "meta": {
        "currentPage": 1,
        "from": 1,
        "lastPage": 1,
        "perPage": 10,
        "to": 1,
        "total": 1,
        "path": "https://your-domain/api/mobile/cashier/membership-contracts"
    }
}
```

---

## 2) Membership Contract Detail (show)

- Method: GET
- URL: /api/mobile/cashier/membership-contracts/{id}

### Path Param

- id (int, required)

### Example Response 200

```json
{
    "success": true,
    "message": "Membership contract retrieved successfully",
    "data": {
        "id": 55,
        "customerId": 10,
        "outletId": 1,
        "membershipPlanId": 3,
        "startAt": "2026-04-20T00:00:00.000000Z",
        "expiredAt": "2026-05-20T00:00:00.000000Z",
        "status": "active",
        "totalPaid": 250000,
        "formattedTotalPaid": "Rp. 250.000,00",
        "createdAt": "2026-04-19T10:00:00.000000Z",
        "updatedAt": "2026-04-19T10:00:00.000000Z",
        "customer": {
            "id": 10,
            "name": "Budi Santoso"
        },
        "outlet": {
            "id": 1,
            "name": "Outlet Utama"
        },
        "membershipPlan": {
            "id": 3,
            "name": "Paket Bulanan"
        }
    }
}
```

### Example Response Error

```json
{
    "success": false,
    "message": "Gagal memuat data kontrak membership"
}
```

Catatan:

- Saat ini method show menangani error umum dengan pesan di atas.

---

## 3) Create Membership Contract (related endpoint)

Endpoint create kontrak membership saat ini disediakan pada Customer API, bukan di MembershipContractController.

- Method: POST
- URL: /api/mobile/cashier/customers/{customerId}/membership-contracts

### Path Param

- customerId (int, required)

### Body (JSON)

- membershipPlanId (int, required, membership plan harus aktif)
- startAt (date, optional, jika dikirim harus >= hari ini)
- totalPaid (number, optional, min 0)

### Example Request

```json
{
    "membershipPlanId": 3,
    "startAt": "2026-04-20",
    "totalPaid": 250000
}
```

### Example Response 201

```json
{
    "success": true,
    "message": "Membership contract created successfully",
    "data": {
        "id": 10,
        "name": "Budi Santoso",
        "membershipContracts": [
            {
                "id": 55,
                "membershipPlanId": 3,
                "status": "active",
                "totalPaid": 250000
            }
        ]
    }
}
```

### Example Response 404

```json
{
    "success": false,
    "message": "Pelanggan tidak ditemukan"
}
```

---

## Status Values

Status kontrak membership yang tersedia di model:

- active
- expired

---

## Field Mapping untuk Flutter

Model MembershipContract:

- id: int
- customerId: int
- outletId: int
- membershipPlanId: int
- startAt: DateTime?
- expiredAt: DateTime?
- status: String
- totalPaid: double
- formattedTotalPaid: String
- customer: Object?
- outlet: Object?
- membershipPlan: Object?
- createdAt: DateTime?
- updatedAt: DateTime?

## cURL Quick Test

```bash
curl --location 'https://your-domain/api/mobile/cashier/membership-contracts?outletId=1&status=active' \
  --header 'Authorization: Bearer <access_token>' \
  --header 'Accept: application/json'
```
