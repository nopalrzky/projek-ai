# Filter Definitions — Standardization Spec

## Overview

Spec ini mendefinisikan standar penulisan file `filters.tsx` di setiap modul halaman index dashboard. File ini mengekspor satu fungsi `createEntityFilters()` yang mengembalikan array `FilterConfig[]`.

---

## 1. Lokasi & Nama File

```
Pages/Dashboard/{ModuleName}/filters.tsx
```

Nama file selalu lowercase: `filters.tsx` (bukan `Filters.tsx`).

---

## 2. Struktur Dasar

```tsx
import { FilterConfig } from "@/Components/Filters";
import { SomeType } from "@/types";

export const createEntityFilters = (
    // parameter dari filterOptions yang dibutuhkan
    outlets: Outlet[],
    positions?: Position[],
): FilterConfig[] => [
    // array filter configs
];
```

### Aturan:
- Selalu ekspor sebagai **named export** (`export const`)
- Nama fungsi: `create{Entity}Filters` — camelCase, PascalCase entity
- Parameter: hanya terima data yang benar-benar dibutuhkan dari `filterOptions`
- Return type: `FilterConfig[]`

---

## 3. Tipe Filter yang Tersedia

### `"select"` — Dropdown Pilihan

```tsx
{
    type: "select",
    key: "outletId",
    label: "Outlet",
    placeholder: "Semua Outlet",
    options: outlets.map((o) => ({
        value: o.id,
        label: `${o.name} (${o.code})`,
    })),
    clearable: true,
    searchable: true,    // tambahkan jika opsi banyak (>10)
},
```

### `"select"` — Status Boolean

```tsx
{
    type: "select",
    key: "isActive",
    label: "Status",
    placeholder: "Semua Status",
    options: [
        { value: "true",  label: "Aktif" },
        { value: "false", label: "Nonaktif" },
    ],
    clearable: true,
},
```

### `"select"` — Enum (Status, Gender, dll.)

```tsx
{
    type: "select",
    key: "status",
    label: "Status",
    placeholder: "Semua Status",
    options: [
        { value: "pending",   label: "Menunggu" },
        { value: "approved",  label: "Disetujui" },
        { value: "rejected",  label: "Ditolak" },
    ],
    clearable: true,
},
```

### `"date_range"` — Rentang Tanggal

```tsx
{
    type: "date_range",
    key: "createdDate",
    label: "Tanggal Dibuat",
    placeholder: "Pilih rentang tanggal",
    clearable: true,
},
```

### `"number_range"` — Rentang Angka

```tsx
{
    type: "number_range",
    key: "amount",
    label: "Jumlah",
    placeholder: { min: "Min", max: "Max" },
    clearable: true,
},
```

### `"text"` — Input Teks Bebas

```tsx
{
    type: "text",
    key: "phone",
    label: "Nomor Telepon",
    placeholder: "Cari nomor telepon...",
    clearable: true,
},
```

---

## 4. Urutan Filter (Prioritas)

Urutkan filter dari yang paling **sering digunakan** ke yang paling **spesifik**:

1. **Outlet** (jika halaman adalah super_admin/multi-outlet)
2. **Status utama** (isActive, status, paymentStatus)
3. **Relasi** (posisi, kategori, dsb.)
4. **Rentang tanggal**
5. **Rentang angka**
6. **Filter tambahan** (gender, dll.)

---

## 5. Konvensi `key`

Key filter harus **sama persis** dengan field yang diterima controller backend:

| Key Filter       | Controller Parameter    |
|------------------|-------------------------|
| `outletId`       | `outletId`              |
| `positionId`     | `positionId`            |
| `isActive`       | `isActive`              |
| `status`         | `status`                |
| `gender`         | `gender`                |
| `createdDate`    | `startDate` + `endDate` |
| `orderDate`      | `orderDateFrom` + `orderDateTo` |
| `totalAmount`    | `totalAmountMin` + `totalAmountMax` |

> **Date range & number range**: key di filter adalah satu key (e.g. `createdDate`), tapi dikirim ke server sebagai dua field terpisah. Mapping ini terjadi di DataView/filter component, bukan di sini.

---

## 6. Konvensi `label` & `placeholder`

| Situasi               | Label               | Placeholder             |
|-----------------------|---------------------|-------------------------|
| Filter outlet         | `"Outlet"`          | `"Semua Outlet"`        |
| Filter status aktif   | `"Status"`          | `"Semua Status"`        |
| Filter gender         | `"Gender"`          | `"Semua Gender"`        |
| Filter status order   | `"Status Order"`    | `"Semua Status"`        |
| Filter status bayar   | `"Status Bayar"`    | `"Semua Status"`        |
| Filter tanggal dibuat | `"Tanggal Dibuat"`  | `"Pilih rentang tanggal"` |
| Filter posisi         | `"Posisi"`          | `"Semua Posisi"`        |

**Aturan:**
- `label`: singkat, title case Bahasa Indonesia
- `placeholder`: selalu diawali "Semua ..." untuk select, "Pilih ..." untuk date/range

---

## 7. Kapan Menambahkan `searchable: true`

Tambahkan `searchable: true` pada filter `"select"` jika jumlah opsi berpotensi **lebih dari 10 item** (outlet list, customer list, dll.):

```tsx
// Banyak opsi — tambahkan searchable
{
    type: "select",
    key: "outletId",
    searchable: true,   // ✅
    ...
}

// Sedikit opsi — tidak perlu searchable
{
    type: "select",
    key: "gender",
    // tidak perlu searchable: true
    ...
}
```

---

## 8. Aturan `clearable`

Hampir **semua filter harus `clearable: true`** karena user perlu bisa menghapus filter yang dipilih. Pengecualian hanya jika filter bersifat wajib (jarang terjadi di index page).

---

## 9. Contoh Lengkap

### Sederhana (Employees)

```tsx
import { FilterConfig } from "@/Components/Filters";
import { Outlet, Position } from "@/types";

export const createEmployeeFilters = (
    outlets: Outlet[],
    positions: Position[],
): FilterConfig[] => [
    {
        type: "select",
        key: "outletId",
        label: "Outlet",
        placeholder: "Semua Outlet",
        options: outlets.map((o) => ({
            value: o.id,
            label: `${o.name} (${o.code})`,
        })),
        clearable: true,
        searchable: true,
    },
    {
        type: "select",
        key: "positionId",
        label: "Posisi",
        placeholder: "Semua Posisi",
        options: positions.map((p) => ({
            value: p.id,
            label: p.name,
        })),
        clearable: true,
        searchable: true,
    },
    {
        type: "select",
        key: "gender",
        label: "Gender",
        placeholder: "Semua Gender",
        options: [
            { value: "male",   label: "Laki-laki" },
            { value: "female", label: "Perempuan" },
        ],
        clearable: true,
    },
    {
        type: "select",
        key: "isActive",
        label: "Status",
        placeholder: "Semua Status",
        options: [
            { value: "true",  label: "Aktif" },
            { value: "false", label: "Nonaktif" },
        ],
        clearable: true,
    },
];
```

### Kompleks (Orders)

```tsx
import { FilterConfig } from "@/Components/Filters";
import { OrderFilterOptions } from "./types";

export const createOrderFilters = (
    filterOptions: OrderFilterOptions,
): FilterConfig[] => [
    {
        type: "select",
        key: "outletId",
        label: "Outlet",
        placeholder: "Semua Outlet",
        options: filterOptions.outlets.map((o) => ({
            value: o.id,
            label: `${o.name} (${o.code})`,
        })),
        clearable: true,
        searchable: true,
    },
    {
        type: "select",
        key: "status",
        label: "Status Order",
        placeholder: "Semua Status",
        options: filterOptions.statuses.map((s) => ({
            value: s.value,
            label: s.label,
        })),
        clearable: true,
    },
    {
        type: "select",
        key: "paymentStatus",
        label: "Status Bayar",
        placeholder: "Semua Status",
        options: filterOptions.paymentStatuses.map((s) => ({
            value: s.value,
            label: s.label,
        })),
        clearable: true,
    },
    {
        type: "date_range",
        key: "orderDate",
        label: "Tanggal Order",
        placeholder: "Pilih rentang tanggal",
        clearable: true,
    },
    {
        type: "number_range",
        key: "totalAmount",
        label: "Total Nominal",
        placeholder: { min: "Min (Rp)", max: "Max (Rp)" },
        clearable: true,
    },
];
```

---

## 10. Inconsistencies yang Harus Diperbaiki

| Halaman          | Masalah                                                          | Perbaikan                                 |
|------------------|------------------------------------------------------------------|-------------------------------------------|
| Beberapa halaman | `filterOptions` seluruhnya diteruskan sebagai satu objek        | Destructure sesuai kebutuhan atau terima sebagai objek `filterOptions` bertype spesifik |
| Beberapa halaman | Label filter dalam bahasa Inggris                               | Ganti ke Bahasa Indonesia                 |
| Beberapa halaman | Tidak ada `searchable: true` pada filter outlet yang banyak data| Tambahkan `searchable: true`              |
| Beberapa halaman | Opsi gender ditulis berulang di banyak file                     | Pertimbangkan shared constant di `@/constants/filterOptions.ts` |
