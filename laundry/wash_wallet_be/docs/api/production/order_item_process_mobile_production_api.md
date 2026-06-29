# Order Item Process API (Mobile Production)

Dokumentasi ini untuk endpoint Order Item Process yang ditangani oleh `OrderItemProcessController`.

Base path yang tersedia:

- `/api/mobile/production/order-item-processes`
- `/api/order-item-processes`

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

---

## 1) Start Order Item Process (start)

- Method: `POST`
- URL: `/api/mobile/production/order-item-processes/{id}/start`
- Body: tidak ada

### Path Param

- `id` (int, required) = ID `order_item_processes`

### Business Rules

- Hanya employee yang memiliki akses ke process terkait yang bisa memulai proses.
- Proses harus berstatus `pending`.
- Sequence proses sebelumnya harus sudah selesai.

### Example Response 200

```json
{
    "success": true,
    "message": "Proses berhasil dimulai",
    "data": {
        "process": {
            "id": 911,
            "status": "processing",
            "startedAt": "2026-04-23T10:20:00.000000Z",
            "employeeId": 7,
            "employeeName": "Budi"
        },
        "orderItem": {
            "id": 700,
            "orderId": 201,
            "status": "processing",
            "orderItemProcesses": []
        }
    }
}
```

### Example Response 403

```json
{
    "success": false,
    "message": "Employee tidak memiliki akses untuk mengerjakan proses ini"
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
    "message": "Gagal memulai proses"
}
```

---

## 2) Complete Order Item Process (complete)

- Method: `POST`
- URL: `/api/mobile/production/order-item-processes/{id}/complete`
- Body: tidak ada

### Path Param

- `id` (int, required) = ID `order_item_processes`

### Business Rules

- Hanya employee yang memiliki akses ke process terkait yang bisa menyelesaikan proses.
- Proses harus sudah pernah dimulai (`started_at` tidak null).
- Proses yang sudah `done` tidak bisa diselesaikan ulang.

### Example Response 200

```json
{
    "success": true,
    "message": "Proses berhasil diselesaikan",
    "data": {
        "process": {
            "id": 911,
            "status": "done",
            "completedAt": "2026-04-23T10:40:00.000000Z",
            "employeeId": 7,
            "employeeName": "Budi"
        },
        "orderItem": {
            "id": 700,
            "orderId": 201,
            "status": "processing",
            "orderItemProcesses": []
        }
    }
}
```

### Example Response 403

```json
{
    "success": false,
    "message": "Employee tidak memiliki akses untuk mengerjakan proses ini"
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
    "message": "Gagal menyelesaikan proses"
}
```

---

## Catatan Integrasi Frontend

- Field `orderItem` pada response dihasilkan dari `OrderItemResource` sehingga field detailnya mengikuti struktur resource terbaru.
- Untuk update UI proses per langkah, gunakan payload `data.process` sebagai sumber status real-time (`pending` → `processing` → `done`).
