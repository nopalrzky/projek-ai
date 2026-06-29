# Flutter Context - Customer Outlet Feature

## Wash Wallet Customer App

**Versi Dokumen:** 1.0  
**Tanggal:** 2026-04-26  
**Untuk:** Tim Frontend / Flutter  
**Status Backend:** Siap dipakai

---

## Tujuan Context Ini

Dokumen ini memberi gambaran backend yang perlu diketahui Flutter untuk layar pemilihan outlet customer.

Prioritas saat ini:

1. Mendukung fallback list outlet tanpa GPS.
2. Tetap bisa memakai flow outlet terdekat jika GPS tersedia.
3. Menjaga filtering outlet exposure agar customer hanya melihat outlet yang boleh ditampilkan.

---

## Ringkasan Endpoint Outlet Customer

Semua endpoint berada di prefix:

- `/api/mobile/customer/outlets`

Semua endpoint butuh:

- `Authorization: Bearer <customer_token>`

Endpoint yang tersedia:

1. `GET /outlets`
2. `GET /outlets/nearby`
3. `GET /outlets/{id}`

---

## Rekomendasi Flow UI Flutter

### A. Fallback Tanpa GPS (sementara)

Gunakan endpoint list:

- `GET /api/mobile/customer/outlets?is_exposure=1`

Hasil:

- Semua outlet active yang exposure aktif.

Flow UI:

1. Buka layar daftar outlet.
2. Langsung fetch list exposure (`is_exposure=1`).
3. Render paginated list.
4. Saat user tap outlet, buka detail (`GET /outlets/{id}`).

### B. Dengan GPS (jika sudah siap)

Gunakan endpoint nearby:

- `GET /api/mobile/customer/outlets/nearby?latitude=...&longitude=...&radius=...`

Hasil:

- Outlet active + exposure aktif, diurutkan berdasarkan jarak.

Fallback saat GPS gagal/ditolak:

- Panggil `GET /outlets?is_exposure=1`.

---

## Contract Filter Penting

Parameter `is_exposure` di endpoint `GET /outlets` bersifat optional.

Perilaku backend:

1. `is_exposure` tidak dikirim: semua outlet active.
2. `is_exposure=1` atau `true`: hanya outlet active dengan exposure aktif.
3. `is_exposure=0` atau `false`: sama seperti tidak kirim filter.

Saran implementasi Flutter saat fase ini:

- Selalu kirim `is_exposure=1` agar list publik tetap konsisten.

---

## Pagination Contract

List outlet memakai pagination standar backend.

Query:

- `page` default `1`
- `perPage` default `15`, valid `1..100`

Saran state management Flutter:

1. Simpan `currentPage`, `lastPage`, `isLoading`, `isLoadMore`.
2. Gunakan append data saat load more.
3. Hentikan load more saat `currentPage >= lastPage`.

---

## Error Handling yang Perlu Disiapkan Flutter

1. `401 Unauthorized`
2. Token tidak valid / expired
3. Aksi: hapus token lokal, arahkan ke login.

4. `422 Validation Error`
5. Contoh: `perPage` di luar rentang atau parameter numerik tidak valid.
6. Aksi: tampilkan message dari API, fallback ke nilai default aman.

7. `404 Not Found` pada detail outlet
8. Aksi: tampilkan snackbar "Outlet tidak tersedia" lalu kembali ke list.

9. `500 Internal Server Error`
10. Aksi: tampilkan state retry.

---

## Checklist Integrasi Flutter

1. Tambah service method `getOutlets({bool exposureOnly = true, int page = 1, int perPage = 15})`.
2. Tambah service method `getNearbyOutlets({required double lat, required double lng, double radius = 10})`.
3. Tambah service method `getOutletDetail(int id)`.
4. Untuk fase sekarang, default layar outlet memakai `getOutlets(exposureOnly: true)`.
5. Pastikan semua request menyertakan Bearer token customer.

---

## Referensi Dokumen API

Lihat detail teknis request/response di:

- `docs/api/outlet_mobile_customer_api.md`
- `docs/context/flutter_context_customer_auth.md`
