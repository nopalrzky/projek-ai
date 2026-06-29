# Dashboard Index Page — Standardization Spec

## Overview

Spec ini mendefinisikan struktur, pola, dan konvensi standar untuk **semua halaman index** di dalam direktori `resources/js/Pages/Dashboard/`. Tujuannya adalah agar setiap halaman index memiliki tampilan, struktur kode, dan behaviour yang konsisten.

---

## 1. Struktur File

Setiap modul memiliki direktori sendiri dengan struktur berikut:

```
Pages/Dashboard/{ModuleName}/
├── Index.tsx           ← Halaman index utama
├── columns.tsx         ← Definisi kolom tabel
├── filters.tsx         ← Definisi filter
├── types.ts            ← Type & interface khusus modul
└── Partials/
    ├── Delete{Entity}Modal.tsx
    └── (modal lain sesuai kebutuhan)
```

---

## 2. Urutan Import

```tsx
// 1. React hooks
import { useCallback, useMemo, useState } from "react";

// 2. Inertia
import { Head, router } from "@inertiajs/react";

// 3. Animasi
import { motion } from "framer-motion";

// 4. Lucide icons
import { Plus, SomeIcon } from "lucide-react";

// 5. Layout
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";

// 6. Shared components
import { DataView } from "@/Components/DataView";
import { Alert } from "@/Components/Alert";
import { PageHeader, PageStats } from "@/Components/Page";

// 7. Types global
import { EntityName } from "@/types";

// 8. Types lokal
import { EntityIndexProps } from "./types";

// 9. Columns & Filters lokal
import { createEntityColumns } from "./columns";
import { createEntityFilters } from "./filters";

// 10. Modals lokal
import DeleteEntityModal from "./Partials/DeleteEntityModal";

// 11. Service
import entityService from "@/Services/entity.service";
```

---

## 3. Props Interface (di `types.ts`)

```ts
export interface EntityIndexProps {
    entities: {
        data: Entity[];
        meta: PaginationMeta;
    };
    stats?: Array<{
        // opsional jika ada
        label: string;
        value: string | number;
        subValue?: string;
        icon: string;
        variant?: "primary" | "success" | "info" | "warning" | "danger";
        trend?: string;
        unit?: string;
        progress?: number;
    }>;
    filterOptions: {
        outlets?: Outlet[];
        // ...opsi filter lainnya
    };
    filters: EntityFilters;
    flash?: {
        success?: string;
        error?: string;
    };
}
```

---

## 4. State Management

### Modal State Pattern

Gunakan **single state object per modal**:

```tsx
// ✅ BENAR
const [deleteModal, setDeleteModal] = useState<{
    show: boolean;
    entity?: Entity;
}>({ show: false });

const [approveModal, setApproveModal] = useState<{
    show: boolean;
    entity?: Entity;
}>({ show: false });

// ❌ SALAH — jangan pisahkan show dan data
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [selectedEntity, setSelectedEntity] = useState<Entity | undefined>();
```

### Loading State per Aksi

```tsx
const [isDeleting, setIsDeleting] = useState(false);
const [isApproving, setIsApproving] = useState(false);
```

---

## 5. Konvensi Penamaan Handler

| Handler                   | Kegunaan                                   |
| ------------------------- | ------------------------------------------ |
| `handleView`              | Navigasi ke halaman detail                 |
| `handleEdit`              | Navigasi ke halaman edit                   |
| `handleDelete`            | Membuka modal konfirmasi delete            |
| `handleConfirmDelete`     | Eksekusi HTTP delete                       |
| `handleCloseDeleteModal`  | Menutup modal delete (cek loading)         |
| `handleApprove`           | Membuka modal approve                      |
| `handleConfirmApprove`    | Eksekusi HTTP approve                      |
| `handleCloseApproveModal` | Menutup modal approve                      |
| `handleReject`            | Membuka modal reject                       |
| `handleConfirmReject`     | Eksekusi HTTP reject                       |
| `handleCloseRejectModal`  | Menutup modal reject                       |
| `handleCreate`            | Navigasi ke create (jika tidak pakai href) |
| `handleImport`            | Memulai flow import                        |
| `handleExport`            | Memulai flow export                        |

---

## 6. Handler Pattern

### View / Edit — gunakan service

```tsx
const handleView = useCallback((entity: Entity) => {
    entityService.goToView(entity.id);
}, []);

const handleEdit = useCallback((entity: Entity) => {
    entityService.goToEdit(entity.id);
}, []);
```

### Delete — selalu buka modal dulu, lalu konfirmasi

```tsx
// Membuka modal
const handleDelete = useCallback((entity: Entity) => {
    setDeleteModal({ show: true, entity });
}, []);

// Eksekusi setelah konfirmasi
const handleConfirmDelete = useCallback((entity: Entity) => {
    setIsDeleting(true);
    router.delete(route("entities.destroy", entity.id), {
        preserveScroll: true,
        onSuccess: () => {
            setDeleteModal({ show: false });
        },
        onError: (errors) => {
            console.error("Delete entity error:", errors);
        },
        onFinish: () => {
            setIsDeleting(false);
        },
    });
}, []);

// Menutup modal (prevent close saat loading)
const handleCloseDeleteModal = useCallback(() => {
    if (!isDeleting) {
        setDeleteModal({ show: false });
    }
}, [isDeleting]);
```

---

## 7. Columns & Filters — `useMemo`

```tsx
const columns = useMemo(
    () => createEntityColumns(handleView, handleEdit, handleDelete),
    [handleView, handleEdit, handleDelete],
);

const filters = useMemo(
    () => createEntityFilters(filterOptions.outlets),
    [filterOptions.outlets],
);
```

---

## 8. `processedInitialFilters`

Selalu definisikan sebagai variabel bernama `processedInitialFilters` sebelum `return`:

```tsx
const processedInitialFilters = {
    search: serverFilters?.search || "",
    outletId: serverFilters?.outletId,
    // ...field filter lainnya
    sortBy: serverFilters?.sortBy || "created_at",
    sortDirection: serverFilters?.sortDirection || "desc",
    page: serverFilters?.page || 1,
    perPage: serverFilters?.perPage || 15,
};
```

> **Date range** — gunakan format objek:
>
> ```tsx
> createdDate: {
>     from: serverFilters?.startDate ? new Date(serverFilters.startDate) : undefined,
>     to:   serverFilters?.endDate   ? new Date(serverFilters.endDate)   : undefined,
> },
> ```

---

## 9. Struktur JSX

```tsx
return (
    <>
        {/* 1. Head title — Bahasa Indonesia */}
        <Head title="Manajemen [Entity]" />

        {/* 2. Wrapper animasi — wajib */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="p-6"
        >
            <div className=" mx-auto space-y-6">
                {/* 3. PageHeader — wajib */}
                <PageHeader
                    title="Manajemen [Entity]"
                    subtitle={`Deskripsi (${entities.meta.total} items)`}
                    icon={SomeIcon}
                    animate={true}
                    variant="default"
                />

                {/* 4. Flash messages — wajib */}
                {flash?.success && (
                    <Alert
                        variant="success"
                        title="Berhasil"
                        description={flash.success}
                    />
                )}
                {flash?.error && (
                    <Alert
                        variant="error"
                        title="Error"
                        description={flash.error}
                    />
                )}

                {/* 5. PageStats — jika ada data statistik */}
                {stats && (
                    <PageStats stats={stats} columns={3} animate={true} />
                )}

                {/* 6. DataView — wajib */}
                <DataView<Entity>
                    route={route("entities.index")}
                    actionButton={{
                        label: "Tambah [Entity]",
                        href: route("entities.create"),
                        icon: <Plus className="w-4 h-4" />,
                        variant: "primary",
                    }}
                    data={entities.data}
                    meta={entities.meta}
                    columns={columns}
                    filters={filters}
                    initialFilters={processedInitialFilters}
                    enableSorting={true}
                    enablePagination={true}
                    enableFilters={true}
                    showFilterContainer={true}
                    useFilterBar={true}
                    pageSize={processedInitialFilters.perPage}
                    emptyTitle="Belum ada [entity]"
                    emptyMessage="Mulai dengan menambahkan [entity] pertama Anda"
                    searchPlaceholder="Cari [field]..."
                />
            </div>
        </motion.div>

        {/* 7. Modal — di luar motion.div, setelah penutup fragment */}
        <DeleteEntityModal
            isOpen={deleteModal.show}
            entity={deleteModal.entity}
            onClose={handleCloseDeleteModal}
            onConfirm={handleConfirmDelete}
            isLoading={isDeleting}
        />
    </>
);
```

---

## 10. Layout Assignment

Selalu di bawah function component, sebelum `export default`:

```tsx
EntitiesIndex.layout = withAuthenticatedLayout({
    title: "[Entity Label]",
    searchable: true,
    breadcrumbs: [{ label: "[Entity Label]", href: route("entities.index") }],
});

export default EntitiesIndex;
```

---

## 11. `DataView` Props — Aturan

| Prop                  | Nilai Standar                     | Keterangan                                        |
| --------------------- | --------------------------------- | ------------------------------------------------- |
| `route`               | wajib                             | Route index saat ini                              |
| `data`                | wajib                             | Array data dari server                            |
| `meta`                | wajib                             | Pagination meta                                   |
| `columns`             | wajib                             | Dari `createEntityColumns`                        |
| `filters`             | wajib                             | Dari `createEntityFilters`                        |
| `initialFilters`      | wajib                             | `processedInitialFilters`                         |
| `enableSorting`       | `true`                            |                                                   |
| `enablePagination`    | `true`                            |                                                   |
| `enableFilters`       | `true`                            |                                                   |
| `showFilterContainer` | `true`                            |                                                   |
| `useFilterBar`        | `true`                            |                                                   |
| `filterLayout`        | `"bar"` (default)                 | Gunakan `"grid"` jika filter > 4 item             |
| `pageSize`            | `processedInitialFilters.perPage` | Jangan hardcode angka                             |
| `actionButton`        | opsional                          | Untuk satu tombol utama (Tambah)                  |
| `actions`             | opsional                          | Untuk multi-action (Import, Export, Tambah, dll.) |

> **`actionButton` vs `actions`:**
>
> - Gunakan `actionButton` jika hanya ada **satu tombol** (Tambah).
> - Gunakan `actions` (JSX) jika ada **lebih dari satu tombol**.

---

## 12. Inconsistencies yang Harus Diperbaiki

| Halaman          | Masalah                                                        | Perbaikan                                                       |
| ---------------- | -------------------------------------------------------------- | --------------------------------------------------------------- |
| `Outlets/Index`  | `handleDelete` langsung `router.delete`, tidak buka modal dulu | Pisahkan ke `handleDelete` (buka modal) + `handleConfirmDelete` |
| `Outlets/Index`  | Tidak ada `animate={true}` di `PageHeader`                     | Tambahkan `animate={true}`                                      |
| `Outlets/Index`  | Tidak ada `PageStats`                                          | Tambahkan jika ada stats dari controller                        |
| `Orders/Index`   | `Head title` dalam bahasa Inggris (`"Orders Management"`)      | Ganti ke `"Manajemen Order"`                                    |
| `Orders/Index`   | `DataView` tidak menggunakan generic `<Order>`                 | Ganti ke `<DataView<Order>`                                     |
| Beberapa halaman | `pageSize` hardcoded `15`                                      | Gunakan `processedInitialFilters.perPage`                       |
| Beberapa halaman | Penamaan handler tidak konsisten (`handleOpenDeleteModal`)     | Gunakan `handleDelete` untuk buka modal                         |
| `Fines/Index`    | Tidak ada generic type di `DataView`                           | Tambahkan `<DataView<Fine>`                                     |
