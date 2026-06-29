# Modal Components — Standardization Spec

## Overview

Spec ini mendefinisikan standar penulisan semua modal dialog di dalam folder `Partials/` setiap modul dashboard. Modal menggunakan komponen `<Modal>` dari `@/Components/Modal` sebagai wrapper dasar.

---

## 1. Lokasi & Nama File

```
Pages/Dashboard/{ModuleName}/Partials/
├── Delete{Entity}Modal.tsx     ← Konfirmasi hapus
├── Approve{Entity}Modal.tsx    ← Konfirmasi setujui
├── Reject{Entity}Modal.tsx     ← Konfirmasi tolak / dengan input alasan
└── {Action}{Entity}Modal.tsx   ← Aksi lainnya
```

**Konvensi penamaan:**
- `Delete` — penghapusan data
- `Approve` — persetujuan
- `Reject` — penolakan (biasanya memiliki input alasan)
- `Confirm{Action}` — aksi konfirmasi lainnya

---

## 2. Props Interface (di `types.ts` modul)

```ts
// Delete
export interface Delete{Entity}ModalProps {
    isOpen: boolean;
    entity?: Entity;
    onClose: () => void;
    onConfirm: (entity: Entity) => void;
    isLoading?: boolean;
}

// Approve
export interface Approve{Entity}ModalProps {
    isOpen: boolean;
    entity?: Entity;
    onClose: () => void;
    onConfirm: (entity: Entity) => void;
    isLoading?: boolean;
}

// Reject — dengan alasan
export interface Reject{Entity}ModalProps {
    isOpen: boolean;
    entity?: Entity;
    onClose: () => void;
    onConfirm: (entity: Entity, reason: string) => void;
    isLoading?: boolean;
}
```

---

## 3. Struktur Komponen Dasar

```tsx
import React from "react";
import { Modal } from "@/Components/Modal";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { Badge } from "@/Components/Badge";
import { AlertTriangle, Trash2 } from "lucide-react";
import { Delete{Entity}ModalProps } from "../types";

const Delete{Entity}Modal: React.FC<Delete{Entity}ModalProps> = ({
    isOpen,
    entity,
    onClose,
    onConfirm,
    isLoading = false,
}) => {
    // Guard: jangan render jika data belum ada
    if (!entity) return null;

    const handleConfirm = () => {
        onConfirm(entity);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Hapus [Entity]"
            size="md"
            variant="danger"
            loading={isLoading}
            preventClose={isLoading}
            closeOnOverlayClick={!isLoading}
            closeOnEscape={!isLoading}
        >
            {/* konten modal */}
        </Modal>
    );
};

export default Delete{Entity}Modal;
```

---

## 4. `<Modal>` Props — Referensi

| Prop                 | Tipe       | Wajib | Keterangan                                      |
|----------------------|------------|-------|-------------------------------------------------|
| `isOpen`             | `boolean`  | ✅     | Kontrol visibilitas modal                       |
| `onClose`            | `() => void` | ✅   | Dipanggil saat overlay/ESC diklik               |
| `title`              | `string`   | ✅     | Judul modal                                     |
| `size`               | `"sm" \| "md" \| "lg" \| "xl"` | ✅ | Lebar modal          |
| `variant`            | `"default" \| "danger" \| "warning" \| "success"` | ✅ | Warna header |
| `loading`            | `boolean`  | ❌     | Tampilkan spinner di header                     |
| `preventClose`       | `boolean`  | ❌     | Cegah penutupan saat sedang proses              |
| `closeOnOverlayClick`| `boolean`  | ❌     | Default: `true`                                 |
| `closeOnEscape`      | `boolean`  | ❌     | Default: `true`                                 |

### Mapping `variant` ke aksi:

| Aksi          | `variant`   |
|---------------|-------------|
| Delete/Hapus  | `"danger"`  |
| Reject/Tolak  | `"warning"` |
| Approve/Setuju| `"success"` |
| Info/Detail   | `"default"` |

---

## 5. Pola Konten Modal

### Delete Modal

```tsx
<Modal
    isOpen={isOpen}
    onClose={onClose}
    title="Hapus [Entity]"
    size="md"
    variant="danger"
    loading={isLoading}
    preventClose={isLoading}
    closeOnOverlayClick={!isLoading}
    closeOnEscape={!isLoading}
>
    <div className="space-y-4">
        {/* 1. Alert peringatan */}
        <Alert
            variant="error"
            title="Peringatan"
            description="Tindakan ini akan menghapus data secara permanen dan tidak dapat dibatalkan."
            icon={<AlertTriangle className="w-5 h-5" />}
        />

        {/* 2. Preview data yang akan dihapus */}
        <div
            className="p-4 rounded-lg border"
            style={{
                backgroundColor: "var(--color-surface-secondary)",
                borderColor: "var(--color-border)",
            }}
        >
            <div className="flex items-center gap-3">
                {/* Avatar / Icon */}
                <div className="flex-shrink-0">
                    {/* avatar atau icon placeholder */}
                </div>

                {/* Info data */}
                <div className="flex-1 min-w-0">
                    <h4
                        className="font-medium truncate"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        {entity.name}
                    </h4>
                    <p
                        className="text-sm truncate"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        {entity.code ?? entity.email ?? ""}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                        <Badge variant={entity.isActive ? "success" : "secondary"} className="text-xs">
                            {entity.isActive ? "Aktif" : "Nonaktif"}
                        </Badge>
                    </div>
                </div>
            </div>
        </div>

        {/* 3. Pertanyaan konfirmasi */}
        <p
            className="text-sm"
            style={{ color: "var(--color-text-secondary)" }}
        >
            Apakah Anda yakin ingin menghapus{" "}
            <span
                className="font-semibold"
                style={{ color: "var(--color-text-primary)" }}
            >
                {entity.name}
            </span>
            ?
        </p>

        {/* 4. Footer tombol */}
        <div className="flex items-center justify-end gap-3 pt-4">
            <Button
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
            >
                Batal
            </Button>
            <Button
                variant="danger"
                onClick={handleConfirm}
                leftIcon={<Trash2 className="w-4 h-4" />}
                loading={isLoading}
                disabled={isLoading}
            >
                {isLoading ? "Menghapus..." : "Hapus [Entity]"}
            </Button>
        </div>
    </div>
</Modal>
```

### Approve Modal

```tsx
<Modal
    isOpen={isOpen}
    onClose={onClose}
    title="Setujui [Entity]"
    size="md"
    variant="success"
    loading={isLoading}
    preventClose={isLoading}
    closeOnOverlayClick={!isLoading}
    closeOnEscape={!isLoading}
>
    <div className="space-y-4">
        {/* Alert informasi */}
        <Alert
            variant="success"
            title="Konfirmasi Persetujuan"
            description="Tindakan ini akan menyetujui [entity] dan memproses hasilnya."
            icon={<CheckCircle className="w-5 h-5" />}
        />

        {/* Preview data */}
        {/* ... sama seperti delete modal ... */}

        {/* Pertanyaan konfirmasi */}
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Apakah Anda yakin ingin menyetujui [entity]{" "}
            <span className="font-semibold" style={{ color: "var(--color-text-primary)" }}>
                {entity.name}
            </span>?
        </p>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
                Batal
            </Button>
            <Button
                variant="success"
                onClick={handleConfirm}
                leftIcon={<Check className="w-4 h-4" />}
                loading={isLoading}
                disabled={isLoading}
            >
                {isLoading ? "Memproses..." : "Setujui"}
            </Button>
        </div>
    </div>
</Modal>
```

### Reject Modal (dengan input alasan)

```tsx
import { useState } from "react";
import { Textarea } from "@/Components/Input";

const Reject{Entity}Modal = ({ isOpen, entity, onClose, onConfirm, isLoading = false }) => {
    const [reason, setReason] = useState("");

    if (!entity) return null;

    const handleConfirm = () => {
        onConfirm(entity, reason);
    };

    const handleClose = () => {
        if (!isLoading) {
            setReason(""); // reset alasan saat ditutup
            onClose();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Tolak [Entity]"
            size="md"
            variant="warning"
            loading={isLoading}
            preventClose={isLoading}
            closeOnOverlayClick={!isLoading}
            closeOnEscape={!isLoading}
        >
            <div className="space-y-4">
                <Alert
                    variant="warning"
                    title="Konfirmasi Penolakan"
                    description="Masukkan alasan penolakan untuk dikirim ke pihak terkait."
                    icon={<AlertTriangle className="w-5 h-5" />}
                />

                {/* Preview data */}
                {/* ... */}

                {/* Input alasan */}
                <div>
                    <label
                        className="block text-sm font-medium mb-2"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Alasan Penolakan
                    </label>
                    <Textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Masukkan alasan penolakan..."
                        rows={3}
                        disabled={isLoading}
                    />
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 pt-4">
                    <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                        Batal
                    </Button>
                    <Button
                        variant="warning"
                        onClick={handleConfirm}
                        leftIcon={<X className="w-4 h-4" />}
                        loading={isLoading}
                        disabled={isLoading || !reason.trim()}
                    >
                        {isLoading ? "Memproses..." : "Tolak"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
```

---

## 6. Standar Footer Tombol

**Urutan tombol:** Batal (kiri) → Aksi utama (kanan)

```tsx
<div className="flex items-center justify-end gap-3 pt-4">
    {/* Batal — selalu kiri */}
    <Button
        variant="outline"
        onClick={onClose}
        disabled={isLoading}
    >
        Batal
    </Button>

    {/* Aksi utama — selalu kanan */}
    <Button
        variant="danger"   // atau success / warning
        onClick={handleConfirm}
        leftIcon={<ActionIcon className="w-4 h-4" />}
        loading={isLoading}
        disabled={isLoading}
    >
        {isLoading ? "Memproses..." : "Label Aksi"}
    </Button>
</div>
```

### Label tombol aksi utama:

| Aksi    | Label Normal   | Label Loading    |
|---------|----------------|------------------|
| Delete  | `"Hapus [Entity]"` | `"Menghapus..."` |
| Approve | `"Setujui"`    | `"Memproses..."` |
| Reject  | `"Tolak"`      | `"Memproses..."` |
| Save    | `"Simpan"`     | `"Menyimpan..."` |
| Confirm | `"Konfirmasi"` | `"Memproses..."` |

---

## 7. Preview Data di Modal

Selalu tampilkan **preview data yang akan terpengaruh** sebelum tombol konfirmasi. Gunakan pola card berikut:

```tsx
<div
    className="p-4 rounded-lg border"
    style={{
        backgroundColor: "var(--color-surface-secondary)",
        borderColor: "var(--color-border)",
    }}
>
    <div className="flex items-center gap-3">
        {/* Avatar atau Icon entitas */}
        <div className="flex-shrink-0">
            {/* foto atau placeholder */}
        </div>

        {/* Info utama */}
        <div className="flex-1 min-w-0">
            <h4
                className="font-medium truncate"
                style={{ color: "var(--color-text-primary)" }}
            >
                {entity.name}
            </h4>
            <p
                className="text-sm"
                style={{ color: "var(--color-text-secondary)" }}
            >
                {entity.code ?? entity.email ?? ""}
            </p>
            <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="text-xs">
                    {/* info tambahan */}
                </Badge>
            </div>
        </div>
    </div>

    {/* Separator + info tambahan (opsional) */}
    <div
        className="pt-3 mt-3 border-t"
        style={{ borderColor: "var(--color-border)" }}
    >
        <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
            Info tambahan...
        </p>
    </div>
</div>
```

---

## 8. Guard — `if (!entity) return null`

Selalu tambahkan guard untuk mencegah render saat data `undefined`:

```tsx
const DeleteEntityModal = ({ isOpen, entity, onClose, onConfirm, isLoading = false }) => {
    // ✅ WAJIB
    if (!entity) return null;

    // ...
};
```

---

## 9. State Lokal di Modal

Untuk modal yang memiliki input (seperti Reject), state lokal harus direset saat modal ditutup:

```tsx
const handleClose = () => {
    if (!isLoading) {
        setReason("");      // reset state lokal
        setOtherInput(""); 
        onClose();
    }
};
```

---

## 10. Ukuran Modal — Kapan Menggunakan

| Ukuran | Kegunaan                                                 |
|--------|----------------------------------------------------------|
| `"sm"` | Konfirmasi sederhana tanpa preview (jarang digunakan)    |
| `"md"` | Standar: delete, approve, reject dengan preview data      |
| `"lg"` | Form lebih panjang: input banyak field                   |
| `"xl"` | Konten sangat banyak: preview dokumen, form kompleks      |

---

## 11. Inconsistencies yang Harus Diperbaiki

| Masalah                                                   | Perbaikan                                           |
|-----------------------------------------------------------|-----------------------------------------------------|
| Beberapa modal tidak memiliki `preventClose={isLoading}`  | Tambahkan selalu saat ada `isLoading`               |
| Beberapa modal tidak reset state lokal saat ditutup       | Tambahkan reset di `handleClose`                    |
| Label tombol tidak konsisten ("Delete" vs "Hapus")        | Gunakan Bahasa Indonesia untuk semua label          |
| Tidak semua modal menggunakan `Guard if (!entity)`        | Tambahkan guard di awal setiap modal                |
| Preview data tidak ada di beberapa modal                  | Tambahkan card preview sebelum tombol konfirmasi    |
| Beberapa modal menggunakan warna hardcoded Tailwind       | Ganti ke CSS variables `var(--color-...)`           |
| Footer tombol posisi tidak konsisten (centered vs right-aligned) | Standarkan ke `justify-end`                  |

---

## 12. Checklist Sebelum Merge Modal Baru

- [ ] `if (!entity) return null` ada di awal
- [ ] Props interface didefinisikan di `types.ts` modul
- [ ] `Modal` menggunakan `variant` yang sesuai aksi
- [ ] `preventClose={isLoading}` ditambahkan
- [ ] `closeOnOverlayClick={!isLoading}` ditambahkan
- [ ] `closeOnEscape={!isLoading}` ditambahkan
- [ ] Preview data entitas ditampilkan
- [ ] Alert peringatan/informasi ada di atas preview
- [ ] Tombol Batal di kiri, aksi di kanan (`justify-end`)
- [ ] Label tombol dalam Bahasa Indonesia
- [ ] Loading state ditangani di label tombol (`"Menghapus..." / "Memproses..."`)
- [ ] State lokal direset di `handleClose` (jika ada)
- [ ] Warna menggunakan CSS variables, bukan Tailwind hardcoded
