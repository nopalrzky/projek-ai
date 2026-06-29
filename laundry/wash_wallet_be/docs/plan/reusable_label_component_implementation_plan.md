# Implementation Plan: Komponen Reusable `Label`

## Referensi

- User Need: [`docs/user_need/reusable_label_component_user_need.md`](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/docs/user_need/reusable_label_component_user_need.md)
- Komponen referensi: [`resources/js/Components/Badge/`](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/resources/js/Components/Badge/)
- Komponen referensi: [`resources/js/Components/Button/`](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/resources/js/Components/Button/)

---

## Latar Belakang

Berdasarkan audit komponen existing di `resources/js/Components`, codebase sudah memiliki pola folder per komponen yang konsisten (`Badge`, `Button`, `Card`, dll.) dengan pemisahan antara `ComponentName.tsx`, `types.ts`, dan `index.ts`. Komponen `Badge` sudah tersedia untuk kebutuhan status, tag, dan indikator visual, namun belum ada komponen `Label` yang berdiri sendiri sebagai primitive form dan metadata.

Saat ini label pada form dan metadata dibuat secara ad-hoc dengan class Tailwind langsung, menyebabkan ketidakkonsistenan tampilan antar halaman. Plan ini mendefinisikan langkah-langkah untuk membuat komponen `Label` yang type-safe, ringan, dan konsisten dengan pola komponen existing.

---

## Audit Kondisi Existing

### Pola Komponen yang Akan Diikuti

Berdasarkan audit `Badge` dan `Button`:

| Aspek | Badge | Button | Label (target) |
|---|---|---|---|
| File utama | `Badge.tsx` | `Button.tsx` | `Label.tsx` |
| Type definitions | `types.ts` | `types.ts` | `types.ts` |
| Export barrel | `index.ts` | `index.ts` | `index.ts` |
| Class merger | `cn` dari `@/lib/utils` | `cn` dari `@/lib/utils` | `cn` dari `@/lib/utils` |
| Token warna | CSS vars `var(--color-*)` | CSS vars `var(--color-*)` | CSS vars `var(--color-*)` |
| Props native | `React.HTMLAttributes<HTMLSpanElement>` | `ButtonHTMLAttributes<HTMLButtonElement>` | `React.LabelHTMLAttributes<HTMLLabelElement>` + custom |

### Gap yang Diidentifikasi

| # | Gap | FR |
|---|---|---|
| G1 | Tidak ada komponen `Label` standalone di `resources/js/Components/Label` | FR-01 |
| G2 | Tidak ada type contract untuk props `Label` (size, tone, required, optional, helper, icon) | FR-10 |
| G3 | Tidak ada pembedaan eksplisit antara mode form (`<label>`) dan non-form (`<span>`) | FR-02, FR-03 |
| G4 | Tidak ada export barrel `index.ts` di folder `Label` | FR-01 |
| G5 | Tidak ada dokumentasi minimal kapan menggunakan `Label` vs `Badge` | FR-12 |

---

## Keputusan Desain

### D1 — Pendekatan Polymorphic Element

`Label` akan menggunakan prop `as` yang terbatas pada dua nilai: `"label"` (default, untuk form) dan `"span"` (untuk non-form/metadata). Ini lebih predictable dibanding polymorphic `as` prop yang menerima semua elemen HTML, dan mencegah penyalahgunaan semantic element.

```tsx
// Mode form (default)
<Label htmlFor="input-name">Nama Outlet</Label>

// Mode non-form
<Label as="span">Outlet</Label>
```

### D2 — Tone Berbeda dari Badge Variant

`Label` menggunakan tone berbasis warna teks (bukan warna background penuh seperti Badge). Tujuannya agar `Label` tidak terlihat seperti status badge:

- `default`  → `--color-text-primary`
- `muted`    → `--color-text-tertiary`
- `primary`  → `--color-primary-700`
- `success`  → `--color-success-700`
- `warning`  → `--color-warning-700`
- `danger`   → `--color-error-700`
- `info`     → `--color-info-700`

### D3 — Required vs Optional Tidak Boleh Aktif Bersamaan

Jika keduanya diberikan, `required` diutamakan dan `optional` diabaikan. Implementasi runtime mengikuti aturan ini dengan kondisi `!required && optional`.

### D4 — Tidak Ada Dependency Baru

Komponen murni menggunakan React, TypeScript, dan Tailwind CSS class melalui `cn`. Tidak ada library animasi atau icon library yang diimport — caller yang menyediakan ikon sebagai `ReactNode`.

---

## Kontrak Props Final

### `LabelSize`

```ts
type LabelSize = "sm" | "md" | "lg";
```

| Size | Font class | Line Height | Gap Ikon |
|---|---|---|---|
| `sm` | `text-xs` (12px) | `leading-4` | `gap-1` |
| `md` | `text-sm` (14px) | `leading-5` | `gap-1.5` |
| `lg` | `text-base` (16px) | `leading-6` | `gap-2` |

Default: `md`.

### `LabelTone`

```ts
type LabelTone = "default" | "muted" | "primary" | "success" | "warning" | "danger" | "info";
```

### `LabelElement`

```ts
type LabelElement = "label" | "span";
```

### `LabelProps`

```ts
interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
    children: React.ReactNode;
    as?: LabelElement;          // default: "label"
    size?: LabelSize;           // default: "md"
    tone?: LabelTone;           // default: "default"
    htmlFor?: string;           // hanya relevan saat as="label"
    required?: boolean;
    optional?: boolean;         // diabaikan jika required=true
    helperSuffix?: string;      // teks kecil di samping kanan label
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    className?: string;
}
```

> **Catatan:** `LabelProps` extends `React.LabelHTMLAttributes<HTMLLabelElement>` agar props native label seperti `id`, `aria-label`, `data-*` tetap bisa diteruskan. Saat `as="span"`, `htmlFor` tidak akan dirender ke DOM.

---

## Struktur File Target

```
resources/js/Components/Label/
├── Label.tsx      <- komponen utama
├── types.ts       <- LabelSize, LabelTone, LabelElement, LabelProps
└── index.ts       <- export barrel
```

---

## Langkah Implementasi

### Tahap 1 — Buat `types.ts`

**File:** `resources/js/Components/Label/types.ts`

```ts
import React from "react";

export type LabelSize = "sm" | "md" | "lg";

export type LabelTone =
    | "default"
    | "muted"
    | "primary"
    | "success"
    | "warning"
    | "danger"
    | "info";

export type LabelElement = "label" | "span";

export interface LabelProps
    extends React.LabelHTMLAttributes<HTMLLabelElement> {
    children: React.ReactNode;
    as?: LabelElement;
    size?: LabelSize;
    tone?: LabelTone;
    required?: boolean;
    optional?: boolean;
    helperSuffix?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    className?: string;
}
```

---

### Tahap 2 — Buat `Label.tsx`

**File:** `resources/js/Components/Label/Label.tsx`

**Mapping size ke class Tailwind:**

```ts
const sizeClasses: Record<LabelSize, string> = {
    sm: "text-xs leading-4 gap-1",
    md: "text-sm leading-5 gap-1.5",
    lg: "text-base leading-6 gap-2",
};
```

**Mapping tone ke CSS variable:**

```ts
const toneClasses: Record<LabelTone, string> = {
    default: "text-[var(--color-text-primary)]",
    muted:   "text-[var(--color-text-tertiary)]",
    primary: "text-[var(--color-primary-700)]",
    success: "text-[var(--color-success-700)]",
    warning: "text-[var(--color-warning-700)]",
    danger:  "text-[var(--color-error-700)]",
    info:    "text-[var(--color-info-700)]",
};
```

**Struktur render komponen:**

```tsx
const Label: React.FC<LabelProps> = ({
    children,
    as = "label",
    size = "md",
    tone = "default",
    htmlFor,
    required = false,
    optional = false,
    helperSuffix,
    leftIcon,
    rightIcon,
    className,
    ...props
}) => {
    const Component = as;

    // Saat as="span", htmlFor tidak diteruskan ke DOM
    const elementProps = as === "label" ? { htmlFor, ...props } : { ...props };

    return (
        <Component
            className={cn(
                "inline-flex items-center font-medium select-none",
                sizeClasses[size],
                toneClasses[tone],
                className,
            )}
            {...elementProps}
        >
            {leftIcon && (
                <span className="flex-shrink-0 inline-flex">{leftIcon}</span>
            )}

            <span className="inline-flex items-baseline gap-1">
                {children}

                {/* Required marker — prioritas lebih tinggi dari optional */}
                {required && (
                    <span
                        aria-hidden="true"
                        className="text-[var(--color-error-500)] font-semibold"
                    >
                        *
                    </span>
                )}

                {/* Optional indicator — hanya tampil jika required=false */}
                {!required && optional && (
                    <span className="text-[var(--color-text-tertiary)] font-normal text-[0.75em]">
                        Opsional
                    </span>
                )}

                {/* Helper suffix */}
                {helperSuffix && (
                    <span className="text-[var(--color-text-tertiary)] font-normal text-[0.75em]">
                        {helperSuffix}
                    </span>
                )}
            </span>

            {rightIcon && (
                <span className="flex-shrink-0 inline-flex">{rightIcon}</span>
            )}
        </Component>
    );
};

Label.displayName = "Label";
export default Label;
```

---

### Tahap 3 — Buat `index.ts`

**File:** `resources/js/Components/Label/index.ts`

```ts
export { default as Label } from "./Label";
export type { LabelProps, LabelSize, LabelTone, LabelElement } from "./types";
```

Pola ini konsisten dengan `Badge/index.ts` dan `Button/index.ts` di codebase.

---

### Tahap 4 — Validasi Build

Setelah ketiga file dibuat, jalankan validasi berikut:

1. **TypeScript check:**
   ```bash
   npx tsc --noEmit
   ```
   Tidak boleh ada error TypeScript baru yang berkaitan dengan komponen `Label`.

2. **Vite build / dev check:**
   ```bash
   npm run build
   ```
   Tidak boleh ada error compile.

3. **Lint check** (jika ESLint dikonfigurasi di repo):
   ```bash
   npx eslint resources/js/Components/Label/
   ```

---

## Contoh Penggunaan

### Form Field (mode default `as="label"`)

```tsx
import { Label } from "@/Components/Label";
import { Info } from "lucide-react";

// Label form standar dengan required
<Label htmlFor="outlet-name" required>
    Nama Outlet
</Label>

// Label dengan optional indicator
<Label htmlFor="phone" optional>
    Nomor Telepon
</Label>

// Label dengan helper suffix
<Label htmlFor="bio" helperSuffix="Maks. 200 karakter">
    Deskripsi
</Label>

// Label ukuran kecil dengan ikon kiri
<Label
    htmlFor="period"
    size="sm"
    tone="muted"
    leftIcon={<Info className="w-3 h-3" />}
>
    Periode
</Label>
```

### Metadata Non-Form (mode `as="span"`)

```tsx
// Label metadata di panel ringkasan
<Label as="span" size="sm" tone="muted">
    Total Order
</Label>

// Label filter di toolbar
<Label as="span" size="sm" tone="muted">
    Cabang
</Label>

// Label dengan tone primary untuk highlight
<Label as="span" tone="primary">
    Outlet Utama
</Label>
```

---

## Kapan Menggunakan `Label` vs `Badge`

| Kondisi | Komponen |
|---|---|
| Nama field form | `Label` |
| Keterangan nilai informasi (owner, outlet, tanggal) | `Label` |
| Caption kecil di atas angka ringkasan | `Label` |
| Penanda kontrol filter | `Label` |
| Status transaksi (Aktif, Pending, Selesai) | `Badge` |
| Tag kategori atau chip | `Badge` |
| Indikator online/offline | `Badge.Status` |
| Counter angka kecil | `Badge.Count` |

---

## Batasan — Hal yang Tidak Dilakukan Plan Ini

1. **Tidak mengubah komponen `Badge`** — `Badge` tetap digunakan untuk status dan tag.
2. **Tidak mengubah komponen `Input` existing** — Label yang ada di dalam `Input` tidak dimigrasi pada tahap ini.
3. **Tidak melakukan migrasi seluruh halaman** — Halaman existing tidak diubah. Komponen `Label` baru tersedia untuk dipakai di fitur baru atau saat refactor bertahap.
4. **Tidak menambah dependency baru** — Tidak ada package tambahan yang diinstall.
5. **Tidak membuat dokumentasi visual (Storybook)** — Contoh penggunaan cukup di komentar kode dan dokumen ini.

---

## Acceptance Criteria Implementasi

| # | Kriteria | Cara Verifikasi |
|---|---|---|
| AC-01 | File `Label.tsx`, `types.ts`, `index.ts` ada di `resources/js/Components/Label/` | Cek file system |
| AC-02 | `import { Label } from "@/Components/Label"` berjalan tanpa error | TypeScript check |
| AC-03 | `<Label htmlFor="x">Teks</Label>` merender elemen `<label for="x">` di DOM | Inspeksi HTML |
| AC-04 | `<Label as="span">Teks</Label>` merender `<span>` tanpa atribut `for` | Inspeksi HTML |
| AC-05 | `required={true}` merender marker `*` berwarna error | Visual check |
| AC-06 | `optional={true}` merender teks `Opsional` berwarna muted | Visual check |
| AC-07 | `required={true} optional={true}` hanya merender marker `*`, tidak merender `Opsional` | Visual check |
| AC-08 | `helperSuffix="Maks. 50 karakter"` merender teks suffix | Visual check |
| AC-09 | `leftIcon` dan `rightIcon` merender node yang diberikan caller | Visual check |
| AC-10 | `className` override berhasil digabung dengan class bawaan | Inspeksi DOM class |
| AC-11 | Tiga size (`sm`, `md`, `lg`) menghasilkan ukuran font yang berbeda | Visual check |
| AC-12 | Tujuh tone menghasilkan warna teks yang berbeda | Visual check |
| AC-13 | `npx tsc --noEmit` dan `npm run build` tidak menghasilkan error baru | Terminal output |
| AC-14 | Komponen tidak mengimport dependency baru | Cek import di `Label.tsx` dan `types.ts` |

---

## Catatan untuk Implementasi Berikutnya

1. **Integrasi ke `Input`:** Jika diputuskan untuk mengganti label internal `Input` dengan komponen `Label`, buat plan terpisah. Ini memengaruhi banyak form di semua halaman dan butuh testing regresi.
2. **Dark mode:** Semua token warna yang dipakai (`--color-*-700`, `--color-text-*`) sudah memiliki pasangan dark mode di `app.css`. Komponen otomatis dark-mode compatible tanpa perubahan tambahan.
3. **Aksesibilitas:** Penggunaan elemen native `<label>` dengan `htmlFor` sudah memenuhi aksesibilitas dasar WCAG 2.1 AA. Required marker `*` dilengkapi `aria-hidden="true"` karena informasi required harus juga disampaikan melalui `aria-required` di elemen input terkait.
