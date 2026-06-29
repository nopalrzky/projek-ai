# Column Definitions — Standardization Spec

## Overview

Spec ini mendefinisikan standar penulisan file `columns.tsx` di setiap modul halaman index dashboard. File ini mengekspor satu fungsi `createEntityColumns()` yang mengembalikan array `ColumnDef<Entity>[]`.

---

## 1. Lokasi & Nama File

```
Pages/Dashboard/{ModuleName}/columns.tsx
```

Nama file selalu lowercase: `columns.tsx` (bukan `Columns.tsx`).

---

## 2. Struktur Dasar

```tsx
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import { Eye, Edit, Trash2, SomeIcon } from "lucide-react";
import { Entity } from "@/types";
import { formatDate, formatCurrency } from "@/lib/utils";

export const createEntityColumns = (
    onView:   (entity: Entity) => void,
    onEdit:   (entity: Entity) => void,
    onDelete: (entity: Entity) => void,
    // tambahan handler jika perlu, misal onApprove
): ColumnDef<Entity>[] => [
    // column definitions
];
```

### Aturan:
- Selalu ekspor sebagai **named export** (`export const`)
- Nama fungsi: `create{Entity}Columns` — camelCase, PascalCase entity
- Parameter: hanya handler yang benar-benar digunakan oleh kolom
- Return type: `ColumnDef<Entity>[]`

---

## 3. Anatomi Kolom

### Kolom Data Sederhana

```tsx
{
    accessorKey: "name",
    header: "Nama",
    cell: ({ row }) => (
        <span
            className="text-sm font-medium"
            style={{ color: "var(--color-text-primary)" }}
        >
            {row.original.name}
        </span>
    ),
    enableSorting: true,
},
```

### Kolom dengan Sub-info (stacked)

```tsx
{
    accessorKey: "name",
    header: "Karyawan",
    cell: ({ row }) => (
        <div className="flex flex-col gap-1">
            <span
                className="text-sm font-medium"
                style={{ color: "var(--color-text-primary)" }}
            >
                {row.original.name}
            </span>
            <span
                className="text-xs"
                style={{ color: "var(--color-text-tertiary)" }}
            >
                @{row.original.username}
            </span>
        </div>
    ),
    enableSorting: true,
},
```

### Kolom Avatar + Nama

```tsx
{
    accessorKey: "name",
    header: "Karyawan",
    cell: ({ row }) => (
        <div className="flex items-center gap-3">
            {row.original.avatar ? (
                <img
                    src={row.original.avatar}
                    alt={row.original.name}
                    className="w-10 h-10 rounded-full object-cover border-2"
                    style={{ borderColor: "var(--color-border)" }}
                />
            ) : (
                <div
                    className="w-10 h-10 rounded-full flex items-center justify-center border-2"
                    style={{
                        backgroundColor: "var(--color-primary-100)",
                        borderColor: "var(--color-border)",
                    }}
                >
                    <User
                        className="w-5 h-5"
                        style={{ color: "var(--color-primary-600)" }}
                    />
                </div>
            )}
            <div className="flex flex-col gap-1">
                <span
                    className="text-sm font-medium"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    {row.original.name}
                </span>
                <span
                    className="text-xs"
                    style={{ color: "var(--color-text-tertiary)" }}
                >
                    @{row.original.username}
                </span>
            </div>
        </div>
    ),
    enableSorting: true,
},
```

### Kolom Badge Status

```tsx
{
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
        <Badge
            variant={row.original.isActive ? "success" : "error"}
            size="sm"
        >
            {row.original.isActive ? "Aktif" : "Nonaktif"}
        </Badge>
    ),
    enableSorting: true,
},
```

### Kolom Badge Enum

```tsx
{
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
        const statusMap: Record<string, { variant: BadgeVariant; label: string }> = {
            pending:  { variant: "warning",   label: "Menunggu" },
            approved: { variant: "success",   label: "Disetujui" },
            rejected: { variant: "error",     label: "Ditolak" },
            active:   { variant: "success",   label: "Aktif" },
            inactive: { variant: "secondary", label: "Nonaktif" },
        };
        const config = statusMap[row.original.status] ?? {
            variant: "secondary",
            label: row.original.status,
        };
        return (
            <Badge variant={config.variant} size="sm">
                {config.label}
            </Badge>
        );
    },
    enableSorting: true,
},
```

### Kolom Tanggal

```tsx
{
    accessorKey: "createdAt",
    header: "Dibuat",
    cell: ({ row }) => (
        <div className="flex flex-col gap-1">
            <span
                className="text-sm"
                style={{ color: "var(--color-text-secondary)" }}
            >
                {formatDate(row.original.createdAt, "DD MMMM YYYY")}
            </span>
            <span
                className="text-xs"
                style={{ color: "var(--color-text-tertiary)" }}
            >
                {formatDate(row.original.createdAt, "HH:mm")}
            </span>
        </div>
    ),
    enableSorting: true,
},
```

### Kolom Nominal / Currency

```tsx
{
    accessorKey: "amount",
    header: "Nominal",
    cell: ({ row }) => (
        <span
            className="text-sm font-medium"
            style={{ color: "var(--color-text-primary)" }}
        >
            {formatCurrency(row.original.amount)}
        </span>
    ),
    enableSorting: true,
},
```

### Kolom Kontak (email + phone)

```tsx
{
    accessorKey: "email",
    header: "Kontak",
    cell: ({ row }) => (
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
                <Mail
                    className="w-3.5 h-3.5"
                    style={{ color: "var(--color-text-tertiary)" }}
                />
                <span
                    className="text-xs"
                    style={{ color: "var(--color-text-secondary)" }}
                >
                    {row.original.email ?? "-"}
                </span>
            </div>
            <div className="flex items-center gap-2">
                <Phone
                    className="w-3.5 h-3.5"
                    style={{ color: "var(--color-text-tertiary)" }}
                />
                <span
                    className="text-xs"
                    style={{ color: "var(--color-text-secondary)" }}
                >
                    {row.original.phone ?? "-"}
                </span>
            </div>
        </div>
    ),
    enableSorting: false,
},
```

### Kolom Aksi — WAJIB kolom terakhir

```tsx
{
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => (
        <div className="flex items-center gap-2">
            <Button
                variant="info"
                size="sm"
                onClick={() => onView(row.original)}
                leftIcon={<Eye className="w-4 h-4" />}
                title="Lihat detail"
            />
            <Button
                variant="warning"
                size="sm"
                onClick={() => onEdit(row.original)}
                leftIcon={<Edit className="w-4 h-4" />}
                title="Edit"
            />
            <Button
                variant="danger"
                size="sm"
                onClick={() => onDelete(row.original)}
                leftIcon={<Trash2 className="w-4 h-4" />}
                title="Hapus"
            />
        </div>
    ),
    enableSorting: false,
},
```

---

## 4. Standar Warna via CSS Variables

**Selalu gunakan CSS variables** untuk warna, bukan kelas Tailwind hardcoded:

```tsx
// ✅ BENAR
style={{ color: "var(--color-text-primary)" }}
style={{ color: "var(--color-text-secondary)" }}
style={{ color: "var(--color-text-tertiary)" }}
style={{ backgroundColor: "var(--color-primary-100)" }}
style={{ borderColor: "var(--color-border)" }}

// ❌ SALAH — hardcoded Tailwind warna
className="text-gray-900"
className="text-gray-500"
className="bg-blue-100"
```

### Referensi CSS Variables Warna Teks

| Variable                   | Kegunaan                          |
|----------------------------|-----------------------------------|
| `--color-text-primary`     | Teks utama / judul                |
| `--color-text-secondary`   | Teks pendukung                    |
| `--color-text-tertiary`    | Teks sub-info / icon              |
| `--color-primary-100`      | Background avatar placeholder     |
| `--color-primary-600`      | Icon di dalam avatar placeholder  |
| `--color-border`           | Border umum                       |

---

## 5. Standar Ukuran Teks

| Konteks              | Class        |
|----------------------|--------------|
| Judul / nama utama   | `text-sm font-medium` |
| Info sekunder        | `text-sm`    |
| Sub-info / metadata  | `text-xs`    |
| Badge                | Otomatis via `size="sm"` |

---

## 6. Standar `enableSorting`

| Kolom                    | `enableSorting` |
|--------------------------|-----------------|
| Nama / judul utama       | `true`          |
| Tanggal                  | `true`          |
| Nominal / angka          | `true`          |
| Status / badge enum      | `true`          |
| Kontak (email/phone)     | `false`         |
| Relasi (nama outlet/dll) | `false`         |
| Kolom aksi               | `false`         |
| Kolom stacked kompleks   | `false`         |

---

## 7. Kolom `id: "actions"` — Aturan

- Selalu gunakan `id: "actions"` (bukan `accessorKey`)
- Selalu kolom **paling terakhir**
- Tombol urutan: **View (info) → Edit (warning) → Delete (danger)**
- Tambahkan tombol aksi khusus **sebelum** Delete jika ada (Approve, Reject, dll.)
- Gunakan `size="sm"` dan `leftIcon` saja (icon-only button dengan `title` tooltip)

### Contoh dengan aksi tambahan:

```tsx
{
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => (
        <div className="flex items-center gap-2">
            <Button variant="info"    size="sm" onClick={() => onView(row.original)}    leftIcon={<Eye className="w-4 h-4" />}     title="Lihat detail" />
            <Button variant="success" size="sm" onClick={() => onApprove(row.original)} leftIcon={<Check className="w-4 h-4" />}   title="Setujui" />
            <Button variant="warning" size="sm" onClick={() => onReject(row.original)}  leftIcon={<X className="w-4 h-4" />}       title="Tolak" />
            <Button variant="danger"  size="sm" onClick={() => onDelete(row.original)}  leftIcon={<Trash2 className="w-4 h-4" />}  title="Hapus" />
        </div>
    ),
    enableSorting: false,
},
```

---

## 8. Kolom Nullable — Gunakan `?? "-"`

Jika nilai bisa `null` atau `undefined`, selalu tampilkan `-` sebagai fallback:

```tsx
// ✅ BENAR
{row.original.email ?? "-"}
{row.original.phone ?? "-"}
{row.original.outlet?.name ?? "-"}

// ❌ SALAH — bisa menyebabkan blank/kosong
{row.original.email}
```

---

## 9. Contoh File Lengkap

```tsx
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import { Eye, Edit, Trash2, User, Mail, Phone } from "lucide-react";
import { Employee } from "@/types";
import { formatDate } from "@/lib/utils";

export const createEmployeeColumns = (
    onView:   (employee: Employee) => void,
    onEdit:   (employee: Employee) => void,
    onDelete: (employee: Employee) => void,
): ColumnDef<Employee>[] => [
    {
        accessorKey: "name",
        header: "Karyawan",
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                {row.original.avatar ? (
                    <img
                        src={row.original.avatar}
                        alt={row.original.name}
                        className="w-10 h-10 rounded-full object-cover border-2"
                        style={{ borderColor: "var(--color-border)" }}
                    />
                ) : (
                    <div
                        className="w-10 h-10 rounded-full flex items-center justify-center border-2"
                        style={{
                            backgroundColor: "var(--color-primary-100)",
                            borderColor: "var(--color-border)",
                        }}
                    >
                        <User
                            className="w-5 h-5"
                            style={{ color: "var(--color-primary-600)" }}
                        />
                    </div>
                )}
                <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                        {row.original.name}
                    </span>
                    <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                        @{row.original.username}
                    </span>
                </div>
            </div>
        ),
        enableSorting: true,
    },
    {
        accessorKey: "email",
        header: "Kontak",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5" style={{ color: "var(--color-text-tertiary)" }} />
                    <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                        {row.original.email ?? "-"}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5" style={{ color: "var(--color-text-tertiary)" }} />
                    <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                        {row.original.phone ?? "-"}
                    </span>
                </div>
            </div>
        ),
        enableSorting: false,
    },
    {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => (
            <Badge variant={row.original.isActive ? "success" : "error"} size="sm">
                {row.original.isActive ? "Aktif" : "Nonaktif"}
            </Badge>
        ),
        enableSorting: true,
    },
    {
        accessorKey: "startDate",
        header: "Mulai Kerja",
        cell: ({ row }) => (
            <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                {formatDate(row.original.startDate, "DD MMMM YYYY")}
            </span>
        ),
        enableSorting: true,
    },
    {
        id: "actions",
        header: "Aksi",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <Button variant="info"    size="sm" onClick={() => onView(row.original)}   leftIcon={<Eye className="w-4 h-4" />}    title="Lihat detail" />
                <Button variant="warning" size="sm" onClick={() => onEdit(row.original)}   leftIcon={<Edit className="w-4 h-4" />}   title="Edit karyawan" />
                <Button variant="danger"  size="sm" onClick={() => onDelete(row.original)} leftIcon={<Trash2 className="w-4 h-4" />} title="Hapus karyawan" />
            </div>
        ),
        enableSorting: false,
    },
];
```

---

## 10. Inconsistencies yang Harus Diperbaiki

| Masalah                                                     | Perbaikan                                          |
|-------------------------------------------------------------|----------------------------------------------------|
| Beberapa kolom masih menggunakan className Tailwind hardcoded untuk warna | Ganti ke `style={{ color: "var(--color-text-...)" }}` |
| Badge variant tidak konsisten (`"secondary"` vs `"error"` untuk nonaktif) | Standarkan: aktif = `"success"`, nonaktif = `"error"` |
| Kolom nilai `null` tidak dihandle dengan fallback           | Tambahkan `?? "-"` untuk semua nilai nullable      |
| Beberapa file import `BadgeVariant` tapi tidak define type statusMap | Definisikan statusMap dengan tipe `Record<string, { variant: BadgeVariant; label: string }>` |
