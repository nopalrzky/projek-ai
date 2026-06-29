# Penggabungan Tab Kurir menjadi Satu Tab Unified

Menggabungkan 2 tab yang terpisah (**Jadwal Kurir** + **Pengaturan Kurir**) menjadi **satu tab "Kurir"** dengan 3 section: **Harga**, **Jadwal**, dan **Pengaturan Lainnya**.

## User Review Required

> [!IMPORTANT]
> **Perubahan Tab Index**: Menghapus 2 tab (Jadwal Kurir + Pengaturan Kurir) dan menggantinya dengan 1 tab "Kurir" akan mengubah semua `TAB_INDICES` di `useOutletTabs.tsx`. Semua referensi yang menggunakan tab index lama (termasuk localStorage user) perlu diperhatikan.

> [!NOTE]
> **COD toggle tetap di tab "Pengaturan"** — tidak dipindahkan karena bukan courier-specific setting.

---

## Proposed Changes

### Tab Structure (Show.tsx + useOutletTabs.tsx)

#### [MODIFY] [Show.tsx](file:///c:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/resources/js/Pages/Dashboard/Outlets/Show.tsx)

- Hapus tab "Jadwal Kurir" (index 3) dan "Pengaturan Kurir" (index 12) dari `tabsConfig`
- Tambah tab baru **"Kurir"** dengan icon `Truck` menggantikan keduanya
- Hapus render `<OutletCourierSchedulesIndex>` dan `<OutletCourierSettingIndex>` yang terpisah
- Tambah render komponen baru `<OutletCourierTab>` untuk tab unified
- Hapus import yang tidak dipakai, tambah import baru

#### [MODIFY] [useOutletTabs.tsx](file:///c:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/resources/js/Hooks/useOutletTabs.tsx)

- Update `TAB_INDICES` constant: hapus `COURIER_SCHEDULES` dan `APP_CONFIG`, tambah `COURIER`
- Index baru:
  ```
  OVERVIEW: 0
  FEATURES_ACTIVATION: 1
  OPERATIONAL_DAYS: 2
  COURIER: 3              ← NEW unified tab
  POSITIONS: 4
  EMPLOYEES: 5
  CUSTOMERS: 6
  CATEGORIES: 7
  LAUNDRY_SERVICES: 8
  FINES: 9
  MEMBERSHIP: 10
  SERVICE_PACKAGES: 11
  SETTINGS: 12
  ```

---

### Komponen Baru — OutletCourierTab

**Arsitektur file:**
```
CourierTab/
├── Index.tsx                          // Main tab wrapper (3 sections)
├── Partials/
│   ├── CourierPricingSection.tsx       // Section Harga
│   ├── CourierScheduleSection.tsx      // Section Jadwal (refaktor)
│   ├── CourierOtherSettingsSection.tsx // Section Pengaturan Lainnya
│   └── AddScheduleModal.tsx           // Modal tambah jadwal (simplified)
```

#### [NEW] [Index.tsx](file:///c:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/resources/js/Pages/Dashboard/Outlets/CourierTab/Index.tsx)

Komponen utama tab unified "Kurir":
- Cek fitur courier_schedule unlocked/locked (pola existing)
- Jika locked → tampilkan state "Fitur Terkunci" + tombol aktivasi (re-use pola dari `CourierSchedules/Index.tsx`)
- Jika unlocked → render 3 section berurutan dengan spacing `space-y-8`

---

### Section 1: Harga — CourierPricingSection

#### [NEW] [CourierPricingSection.tsx](file:///c:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/resources/js/Pages/Dashboard/Outlets/CourierTab/Partials/CourierPricingSection.tsx)

Menampilkan **ringkasan harga aktif saat ini** dari `outlet.courierSetting`:

| Data | Sumber |
|------|--------|
| Strategi aktif | `courierSetting.pricingMethod` → label: "Flat Fee", "Base + Per KM", dll |
| Biaya utama | `flatFee` / `baseFee` / `perKmFee` (tergantung strategi aktif) |
| Status | Badge "Dikonfigurasi" / "Belum Dikonfigurasi" |

**UI:**
- `Card` dengan header "Harga Kurir" + icon `Coins`
- Info strategi aktif + harga utama formatted (Rp format)
- Tombol **"Atur Harga"** → `navigateToOutletTab(outletId, TAB_INDICES.COURIER)` + internal state, atau langsung render `OutletCourierSettingIndex` secara inline via expand/collapse

> [!IMPORTANT]
> Karena tab Pengaturan Kurir sudah dihapus, tombol **"Atur Harga"** akan mengarahkan user ke halaman terpisah via `router.visit()` menggunakan route baru, ATAU menampilkan `OutletCourierSettingIndex` secara inline/expandable di bawah ringkasan. **Pendekatan yang dipilih: navigate ke route terpisah** menggunakan route `outlets.courier-settings.update` yang sudah ada — namun karena ini hanya `PUT`, kita akan membuat **halaman dedicated baru** `outlets.courier-settings.edit` atau alternatifnya: **menampilkan full form secara expandable** di dalam section ini.
>
> **Keputusan final: Tombol "Atur Harga" → expand/collapse `OutletCourierSettingIndex` langsung di bawah ringkasan**, karena tidak perlu route baru dan UX lebih smooth.

---

### Section 2: Jadwal — CourierScheduleSection

#### [NEW] [CourierScheduleSection.tsx](file:///c:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/resources/js/Pages/Dashboard/Outlets/CourierTab/Partials/CourierScheduleSection.tsx)

Refaktor dari `CourierSchedules/Index.tsx` dengan perubahan UX utama:

**Perubahan UX:**
- **Tombol plus (+) pindah ke samping label tipe** (bukan di samping hari)
- Layout per hari:
  ```
  ┌─────────────────────────────────────────────┐
  │ 📅 Senin                                     │
  ├─────────────────────────────────────────────┤
  │ 📦 Ambil (Pickup)                      [+]  │
  │ [08:00-10:00] [10:00-12:00]                  │
  │                                              │
  │ 🧭 Antar (Delivery)                    [+]  │
  │ [13:00-15:00]                                │
  └─────────────────────────────────────────────┘
  ```
- Klik `+` → buka `AddScheduleModal` dengan **day + type sudah preset**
- Schedule chips tetap menggunakan pola existing (edit/delete on hover)
- Grid responsive: `grid-cols-1 lg:grid-cols-2 xl:grid-cols-3`

**Re-use dari existing:**
- `ScheduleChip` pattern (inline di komponen ini)
- `DeleteCourierScheduleModal` dari `CourierSchedules/Partials/`
- `CourierScheduleModal` dari `CourierSchedules/Partials/` (untuk **edit**)
- Data helper: `dayLabels`, `getSchedulesForDay()`

#### [NEW] [AddScheduleModal.tsx](file:///c:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/resources/js/Pages/Dashboard/Outlets/CourierTab/Partials/AddScheduleModal.tsx)

Modal **simplified** khusus untuk tambah jadwal baru:

| Field | Nilai |
|-------|-------|
| dayOfWeek | Auto-set dari context (readonly, hidden) |
| type | Auto-set dari context (readonly, hidden) |
| startTime | Input `TimeInput` |
| endTime | Input `TimeInput` |
| isActive | Default `true` (hidden) |

**UI:**
- Gunakan `Modal` dari `@/Components/Modal`
- Title: "Tambahkan Jadwal"
- Info text: "Tambahkan jadwal **pickup** pada hari **Senin**" (dynamic berdasarkan type + day)
- Hanya 2 field: start time + end time
- Submit via `router.post()` ke `outlets.courier-schedules.store`
- Gunakan `useForm` dari `@inertiajs/react`

---

### Section 3: Pengaturan Lainnya — CourierOtherSettingsSection

#### [NEW] [CourierOtherSettingsSection.tsx](file:///c:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/resources/js/Pages/Dashboard/Outlets/CourierTab/Partials/CourierOtherSettingsSection.tsx)

Menampilkan **ringkasan modifier/surcharges** dari `outlet.courierSetting`:

| Item | Data | Format |
|------|------|--------|
| Surge Pricing | `surgeEnabled`, `surgeMultiplier` | Aktif (1.2x) / Nonaktif |
| Biaya Malam | `nightSurcharge`, `nightStartTime`, `nightEndTime` | Rp 5.000 (21:00 - 06:00) |
| Biaya Akhir Pekan | `weekendSurcharge` | Rp 3.000 |
| Free Shipping | `freeShippingEnabled`, `minOrderFreeShipping` | Aktif (min Rp 50.000) / Nonaktif |
| Subsidi Merchant | `merchantSubsidy`, `merchantSubsidyType` | Rp 2.000 / 10% |
| Jarak Maksimal | `maxDistanceKm` | 15 KM / Tidak dibatasi |

**UI:**
- `Card` dengan header "Pengaturan Lainnya" + icon `Settings`
- List item key-value dengan layout compact
- Badge hijau/abu-abu untuk status aktif/nonaktif
- Tombol **"Atur Pengaturan"** → Sama seperti "Atur Harga", expand/collapse `OutletCourierSettingIndex` atau scroll ke section harga yang sudah expand

> [!NOTE]
> Karena section Harga dan Pengaturan Lainnya keduanya mengarah ke `OutletCourierSettingIndex` yang sama, **tombol "Atur Pengaturan" akan scroll ke section Harga dan expand form di sana** (jika belum terbuka), sehingga tidak ada duplikasi form.

---

### File Existing yang Dipertahankan (tidak dihapus)

| File | Alasan |
|------|--------|
| `CourierSettings/Index.tsx` | Di-render inline saat "Atur Harga" di-expand |
| `CourierSettings/Partials/*` | Sub-komponen form harga (StrategySelector, TierEditor, ZoneEditor, ModifierForm) |
| `CourierSchedules/Partials/CourierScheduleModal.tsx` | Digunakan untuk **edit** jadwal (field lengkap) |
| `CourierSchedules/Partials/DeleteCourierScheduleModal.tsx` | Digunakan untuk konfirmasi hapus |
| `CourierSchedules/types.ts` | Type definitions masih dipakai |

### File yang Bisa Dihapus (optional cleanup)

| File | Alasan |
|------|--------|
| `CourierSchedules/Index.tsx` | Diganti oleh `CourierScheduleSection.tsx` |

---

## Catatan Implementasi untuk AI Model Lain

> [!IMPORTANT]
> **Wajib diikuti saat mengimplementasikan:**
> 1. **Baca component reusable terlebih dahulu** — Selalu baca source code komponen di `@/Components/` (Button, Card, Modal, Input, Badge, Alert, Tabs) sebelum menulis code, untuk memastikan penggunaan props yang benar
> 2. **Gunakan CSS theme dari `app.css`** — Gunakan variabel CSS (`var(--color-*)`, `var(--radius-*)`, `var(--shadow-*)`) atau Tailwind classes yang sudah di-map ke theme (seperti `text-text-primary`, `bg-surface`, `border-border`, dll). **Jangan hardcode warna**
> 3. **Mobile-first approach** — Mulai design dari mobile, tambahkan responsive breakpoints (`md:`, `lg:`) untuk tablet/desktop
> 4. **Clean code — NO COMMENTS** — Jangan tambahkan comment apapun di code
> 5. **Gunakan pola yang konsisten** dengan file existing:
>    - `style={{ color: "var(--color-*)" }}` untuk inline CSS variables
>    - Tailwind classes untuk layout dan spacing
>    - `motion.div` dari framer-motion untuk animasi entry
>    - `useForm` dari `@inertiajs/react` untuk form state
>    - `router` dari `@inertiajs/react` untuk navigation

---

## Verification Plan

### Automated Tests
- `npm run build` — pastikan tidak ada TypeScript error

### Browser Verification
- Tab "Kurir" muncul di posisi index 3 dan bisa diklik
- **Section Harga**: strategi aktif tampil, tombol "Atur Harga" expand form pengaturan
- **Section Jadwal**: tombol `+` di samping tipe buka modal sederhana, submit berhasil, jadwal muncul di list
- **Section Pengaturan**: ringkasan modifier tampil, tombol "Atur Pengaturan" scroll/expand ke form
- Tab "Pengaturan" (yang terakhir) masih menampilkan WA notifikasi + COD
- Semua tab lain render konten yang benar (index tidak geser salah)

### Responsive & Theme
- Mobile view (375px width) — layout 1 kolom, scrollable
- Dark mode — semua section tampil benar
