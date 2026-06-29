# Courier Schedule Mobile Customer API

Dokumentasi API untuk jadwal kurir (pickup/delivery) yang digunakan pada aplikasi Mobile Customer.

## Get All Schedules

Mengambil daftar jadwal kurir berdasarkan outlet, hari, dan tipe.

- **URL**: `/api/mobile/customer/courier-schedules`
- **Method**: `GET`
- **Authentication**: Required (Bearer Token)

### Query Parameters

| Parameter | Tipe | Wajib | Deskripsi |
|-----------|------|-------|-----------|
| `outletId` | `integer` | Ya | ID dari outlet |
| `dayOfWeek` | `string` | Tidak | Nama hari (lowercase: `monday`, `tuesday`, dll) |
| `type` | `string` | Tidak | Tipe jadwal (`pickup` atau `delivery`) |
| `page` | `integer` | Tidak | Nomor halaman (default: 1) |
| `perPage` | `integer` | Tidak | Jumlah item per halaman (default: 15) |

### Success Response

- **Code**: `200 OK`
- **Content**:

```json
{
    "success": true,
    "message": "Courier schedules retrieved successfully",
    "data": [
        {
            "id": 7,
            "outletId": 3,
            "dayOfWeek": "friday",
            "dayLabel": "Jumat",
            "type": "pickup",
            "typeLabel": "Ambil",
            "startTime": "08:00",
            "endTime": "10:00",
            "isActive": true,
            "createdAt": "2026-04-30T11:10:48.000000Z",
            "updatedAt": "2026-04-30T11:10:48.000000Z"
        }
    ],
    "meta": {
        "pagination": {
            "total": 1,
            "count": 1,
            "per_page": 15,
            "current_page": 1,
            "total_pages": 1,
            "links": {}
        }
    }
}
```

### Error Response

- **Code**: `401 Unauthorized`
  - **Content**: `{"message": "Unauthenticated."}`

- **Code**: `500 Internal Server Error`
  - **Content**: `{"success": false, "message": "Failed to retrieve courier schedules"}`
