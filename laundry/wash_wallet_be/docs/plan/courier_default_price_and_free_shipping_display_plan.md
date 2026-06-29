# Courier Default Price & Free Shipping Display — Implementation Plan

## ⚠️ INSTRUKSI WAJIB UNTUK AI MODEL

> [!CAUTION]
> **SEBELUM MENULIS KODE APAPUN**, baca file-file berikut secara menyeluruh:
>
> - `docs/spec/model_spec.md` — standar Model Eloquent (section headers, `$fillable`, `$casts`, scopes, helpers)
> - `docs/spec/service_spec.md` — standar Service (BaseService, constructor injection, logging, transactions)
> - `docs/spec/controller_spec.md` — standar Controller (API vs Web, error handling, getFilters)
> - `docs/spec/api_resource_spec.md` — standar Resource (camelCase, strict casting, `whenLoaded`)
> - Contoh model existing: `CourierSetting.php`
> - Contoh resource existing: `CourierSettingResource.php`
> - Contoh partial existing: `FreeShippingModeSelector.tsx`, `CourierSettingsOverviewSection.tsx`
> - Contoh form page existing: `Edit.tsx` di `Outlets/Courier/`
>
> **Semua kode HARUS mengikuti pola standarisasi di atas. Tidak boleh menyimpang.**

> [!IMPORTANT]
> **Aturan Frontend yang WAJIB diikuti:**
>
> - Gunakan **theme color dari `app.css`** untuk semua warna — jangan hardcode warna seperti `text-blue-500`, `bg-green-100`, dsb.
> - Gunakan class token seperti `text-text-primary`, `bg-surface`, `text-primary-600`, `border-border`, dsb.
> - Setiap komponen baru **wajib dipisah ke file Partial tersendiri** di folder `Partials/`.
> - **Tidak ada komentar/comment** di dalam kode — clean code.
> - Gunakan komponen reusable yang sudah ada: `Button`, `Card`, `Alert`, `Badge`, `Tabs`, `NumberInput`.
> - Panjang per file dijaga minimum — jika satu komponen bisa berdiri sendiri, pisahkan ke Partial baru.

---

## Ringkasan

Plan ini menambahkan dua hal:

1. **Default Price** pada strategi harga kurir — tarif fallback saat alamat customer tidak match zona atau radius bertingkat.
2. **Tampilan Locked State** pada tab Strategi Harga dan Detail Outlet saat `Gratis Ongkir Semua` aktif — mencegah owner salah paham bahwa strategi harga masih berdampak ke customer.

---

## Keputusan Desain

> [!NOTE]
> **Field database**: `default_price` — nama pendek, konsisten dengan naming kolom existing (`flat_fee`, `min_fee`, `max_fee`).

> [!NOTE]
> **Default price wajib** hanya untuk metode `zone_based` dan `tiered`. Metode `flat_rate` dan `distance_based` tidak memerlukan fallback karena selalu menghasilkan tarif.

> [!NOTE]
> **Modifier tetap diterapkan di atas default price** — sesuai flow kalkulasi existing (min_fee floor, max_fee cap, surge, surcharge, merchant subsidy).

> [!NOTE]
> **Max distance tetap hard limit** — default price tidak membuat order yang melebihi max distance menjadi serviceable.

> [!NOTE]
> **Source kalkulasi**: `pricingSource` ditambahkan ke `CourierPricingResult`. Nilai yang tersedia: `flat`, `distance_based`, `zone`, `tier`, `default_price`, `outlet_free_shipping_all`, `free_shipping_global`, `membership`. Ini terpisah dari field `discountSource` yang sudah ada.

> [!NOTE]
> **Locked state UI**: Saat `Gratis Ongkir Semua` aktif, tab Strategi Harga menampilkan `PricingLockedState` (Partial baru). Owner diarahkan ke tab Pengaturan Lainnya via tombol shortcut. Data strategi harga lama **tidak dihapus**.

> [!NOTE]
> **Detail outlet**: Saat `Gratis Ongkir Semua` aktif, `CourierSettingsOverviewSection` menampilkan `FreeShippingActiveCard` (Partial baru) dan menyembunyikan detail strategi harga aktif.

---

## Proposed Changes

### Phase 1 — Database Migration

---

#### [NEW] `database/migrations/xxxx_add_default_price_to_courier_settings.php`

Tambah satu kolom ke tabel `courier_settings`:

| Kolom | Tipe | Default | Keterangan |
|---|---|---|---|
| `default_price` | decimal(15,2) | 0 | Tarif fallback untuk zona/tier yang tidak match |

```php
$table->decimal('default_price', 15, 2)->default(0)->after('unconditional_free_shipping_enabled');
```

---

### Phase 2 — Backend: Model

---

#### [MODIFY] [CourierSetting.php](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/app/Models/CourierSetting.php)

Section `TABLE & CONFIGURATION`:

- Tambah `'default_price'` ke `$fillable`
- Tambah `'default_price' => 'decimal:2'` ke `casts()`

Section `HELPERS` — tambah helper baru:

```php
public function usesDefaultPriceFallback(): bool
{
    return in_array($this->pricing_method, ['zone_based', 'tiered']);
}
```

---

### Phase 3 — Backend: DTO & Pricing Engine

---

#### [MODIFY] [CourierPricingResult.php](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/app/DTOs/CourierPricingResult.php)

Tambah field publik:

```php
public string $pricingSource = 'flat';
```

Nilai yang valid: `flat`, `distance_based`, `zone`, `tier`, `default_price`, `outlet_free_shipping_all`, `free_shipping_global`, `membership`.

---

#### [MODIFY] [CourierPricingEngine.php](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/app/Services/CourierPricingEngine.php)

**`calculateZoneBased()`** — tambah fallback:

```
Jika tidak ada zona yang cocok dengan alamat customer:
  → return $setting->default_price sebagai fee
  → set $result->pricingSource = 'default_price'
Jika ada zona yang cocok:
  → set $result->pricingSource = 'zone'
```

**`calculateTiered()`** — tambah fallback:

```
Jika tidak ada tier yang cocok dengan jarak customer:
  → return $setting->default_price sebagai fee
  → set $result->pricingSource = 'default_price'
Jika ada tier yang cocok:
  → set $result->pricingSource = 'tier'
```

**Semua path `calculate()` lainnya** — isi `pricingSource` yang sesuai:

| Return path | pricingSource |
|---|---|
| `unconditional_free_shipping_enabled` | `outlet_free_shipping_all` |
| `free_shipping_enabled` + min order terpenuhi | `free_shipping_global` |
| Membership free shipping | `membership` |
| `flat` | `flat` |
| `base_per_km` / `distance_based` | `distance_based` |

---

### Phase 4 — Backend: Request Validation

---

#### [MODIFY] [UpdateCourierSettingRequest.php](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/app/Http/Requests/Outlet/CourierSetting/UpdateCourierSettingRequest.php)

Tambah satu rule ke `rules()`:

```php
'defaultPrice' => ['nullable', 'numeric', 'min:0'],
```

---

### Phase 5 — Backend: API Resource

---

#### [MODIFY] [CourierSettingResource.php](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/app/Http/Resources/CourierSetting/CourierSettingResource.php)

Tambah satu field ke `toArray()` — letakkan setelah `minOrderFreeShipping`:

```php
'defaultPrice' => (float) $this->default_price,
```

---

### Phase 6 — Backend: Service

---

#### [MODIFY] [OutletService.php](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/app/Services/OutletService.php)

Di method `updateCourierSetting` — tambah handling `defaultPrice`:

```php
if (array_key_exists('defaultPrice', $data)) {
    $setting->default_price = $data['defaultPrice'] ?? 0;
}
```

---

### Phase 7 — Frontend: TypeScript Types

---

#### [MODIFY] [courier_setting.ts](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/resources/js/types/courier_setting.ts)

Tambah ke `interface CourierSetting`:

```typescript
defaultPrice?: number | null;
```

Tambah ke `interface CourierSettingFormData`:

```typescript
defaultPrice: number | null;
```

---

### Phase 8 — Frontend: Tiga Komponen Partial Baru

---

#### [NEW] `resources/js/Pages/Dashboard/Outlets/Courier/Partials/PricingLockedState.tsx`

Ditampilkan di tab Strategi Harga saat `freeShippingMode === 'all'`.

```
Props:
  onGoToSettings: () => void
```

Struktur UI:
- Container centered, padding besar (`py-16 px-6 text-center`)
- Lingkaran icon: `w-20 h-20 rounded-full bg-success-100 dark:bg-success-900/30 text-success-600`
- Icon `Truck` dari lucide-react ukuran `w-10 h-10`
- Badge `success` kecil: `Gratis Ongkir Semua Aktif`
- Judul `h3`: `Ongkir seluruhnya gratis` — `text-text-primary font-bold text-xl`
- Deskripsi: `Strategi harga tidak digunakan karena Gratis Ongkir Semua sedang aktif.` — `text-text-secondary text-sm`
- Sub-deskripsi: `Untuk mengatur tarif zona, radius, atau default price, ubah pengaturan gratis ongkir pada tab Pengaturan Lainnya.` — `text-text-tertiary text-sm`
- Tombol `Button` variant `secondary` dengan icon `Settings`: `Ubah Pengaturan Gratis Ongkir` → panggil `onGoToSettings`

---

#### [NEW] `resources/js/Pages/Dashboard/Outlets/Courier/Partials/DefaultPriceInput.tsx`

Ditampilkan di bawah form Strategi Harga (di dalam card yang sama) untuk metode `zone_based` dan `tiered`.

```
Props:
  value: number | null
  onChange: (value: number | null) => void
  pricingMethod: PricingMethod
  errors?: Record<string, string | string[] | undefined>
```

Struktur UI:
- Hanya render jika `pricingMethod === 'zone_based' || pricingMethod === 'tiered'`
- Wrapper: `div` dengan `pt-8 border-t border-border`
- Judul section: `h3` — `Default Price`
- Deskripsi section: `p` — teks singkat tentang kapan default price dipakai
- `Alert` variant `info` (dari `@/Components/Alert`): menjelaskan bahwa default price berlaku saat alamat tidak cocok dengan zona/tier yang dikonfigurasi, selama order masih serviceable
- `NumberInput` label `Default Price`, prefix `Rp `, `thousandSeparator=","`, value, onValueChange, error dari `errors?.defaultPrice`

---

#### [NEW] `resources/js/Pages/Dashboard/Outlets/Courier/Partials/FreeShippingActiveCard.tsx`

Ditampilkan di `CourierSettingsOverviewSection` menggantikan detail strategi harga saat `freeShippingMode === 'all'`.

```
Props:
  (tidak ada)
```

Struktur UI:
- Card dengan border `border-success-500/20 dark:border-success-500/10` dan background `bg-success-50 dark:bg-success-500/10 rounded-2xl p-5`
- Flex row: icon + teks + badge
- Icon `Truck` dalam lingkaran: `w-10 h-10 rounded-xl bg-success-100 dark:bg-success-500/20 text-success-600 dark:text-success-400`
- Teks kiri:
  - Label kecil uppercase: `Gratis Ongkir` — `text-[10px] font-bold text-success-600 uppercase tracking-wider`
  - Judul: `Ongkir seluruh order kurir valid ditanggung outlet.` — `text-sm font-semibold text-text-primary`
  - Sub-teks: `Strategi harga disimpan, tetapi tidak aktif selama Gratis Ongkir Semua dipilih.` — `text-xs text-text-tertiary mt-1`
- Badge `success` di kanan: `Gratis Ongkir Semua`

---

### Phase 9 — Frontend: Modifikasi Edit.tsx

---

#### [MODIFY] [Edit.tsx](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/resources/js/Pages/Dashboard/Outlets/Courier/Edit.tsx)

**Import tambahan:**

```typescript
import PricingLockedState from "./Partials/PricingLockedState";
import DefaultPriceInput from "./Partials/DefaultPriceInput";
```

**Init form data — tambah `defaultPrice`:**

```typescript
defaultPrice: courierSetting?.defaultPrice ?? null,
```

**Tab Strategi Harga — bungkus dengan kondisi `freeShippingMode`:**

```tsx
{data.freeShippingMode === 'all' ? (
    <PricingLockedState onGoToSettings={() => setActiveTab(1)} />
) : (
    <>
        <StrategySelector ... />

        {data.pricingMethod === 'tiered' && (
            <div className="pt-8 border-t border-border animate-slideDown">
                ...
                <TierEditor ... />
            </div>
        )}

        {data.pricingMethod === 'zone_based' && (
            <div className="pt-8 border-t border-border animate-slideDown">
                ...
                <ZoneEditor ... />
            </div>
        )}

        <DefaultPriceInput
            value={data.defaultPrice}
            onChange={(val) => setData('defaultPrice', val)}
            pricingMethod={data.pricingMethod}
            errors={errors}
        />
    </>
)}
```

> [!IMPORTANT]
> Ketika `PricingLockedState` ditampilkan, tombol `Simpan Perubahan` di luar Tabs tetap visible — owner masih bisa save jika ada perubahan di tab lain.

---

### Phase 10 — Frontend: Modifikasi CourierSettingsOverviewSection.tsx

---

#### [MODIFY] [CourierSettingsOverviewSection.tsx](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/resources/js/Pages/Dashboard/Outlets/Courier/Partials/CourierSettingsOverviewSection.tsx)

**Import tambahan:**

```typescript
import FreeShippingActiveCard from "./FreeShippingActiveCard";
```

**Section Strategi Harga — bungkus dengan kondisi `freeShippingMode`:**

```tsx
{freeShippingMode === 'all' ? (
    <FreeShippingActiveCard />
) : (
    <>
        {/* Grid metode harga & ringkasan biaya — kode existing */}
        {/* Detail tier — kode existing */}
        {/* Detail zona — kode existing */}
    </>
)}
```

> [!WARNING]
> File ini panjang (649 baris). Buat perubahan minimal — hanya tambah import dan bungkus section Strategi Harga dengan kondisional. Jangan refactor bagian lain.

---

## Urutan Implementasi

### Backend

1. Buat migration → jalankan `php artisan migrate`
2. Update `CourierSetting.php` — `$fillable`, `casts()`, `usesDefaultPriceFallback()`
3. Update `CourierPricingResult.php` — tambah `pricingSource`
4. Update `CourierPricingEngine.php` — fallback di `calculateZoneBased()` dan `calculateTiered()`, isi `pricingSource` di semua path
5. Update `UpdateCourierSettingRequest.php` — tambah `defaultPrice`
6. Update `CourierSettingResource.php` — tambah `defaultPrice`
7. Update `OutletService.php` — handle `defaultPrice`

### Frontend

8. Update `courier_setting.ts` — tambah `defaultPrice` ke dua interfaces
9. Buat `PricingLockedState.tsx`
10. Buat `DefaultPriceInput.tsx`
11. Buat `FreeShippingActiveCard.tsx`
12. Update `Edit.tsx` — import, init `defaultPrice`, kondisi locked state, `DefaultPriceInput`
13. Update `CourierSettingsOverviewSection.tsx` — import, kondisi `FreeShippingActiveCard`

---

## Verification Plan

### Backend

| Skenario | Expected |
|---|---|
| Simpan `defaultPrice = 15000`, metode `zone_based` | DB: `default_price = 15000` |
| Simpan `defaultPrice = null`, metode `flat_rate` | DB: `default_price = 0` |
| `CourierSettingResource` dikembalikan | field `defaultPrice` ada, tipe float |
| Pricing engine, `zone_based`, alamat tidak match zona, order serviceable | fee = `default_price`, `pricingSource = 'default_price'` |
| Pricing engine, `tiered`, jarak tidak match tier, order serviceable | fee = `default_price`, `pricingSource = 'default_price'` |
| Pricing engine, `zone_based`, alamat cocok zona | fee = zone fee, `pricingSource = 'zone'` |
| Pricing engine, `tiered`, jarak cocok tier | fee = tier fee, `pricingSource = 'tier'` |
| Pricing engine, `unconditional_free_shipping = true` | fee = 0, `pricingSource = 'outlet_free_shipping_all'` |
| Pricing engine, jarak melewati `max_distance_km` | NOT SERVICEABLE, `default_price` tidak dipakai |
| Pricing engine, `default_price` dipakai | modifier (min_fee, max_fee, surge) tetap diterapkan di atasnya |

### Frontend

1. Edit Courier Setting → Tab Strategi Harga → `freeShippingMode = 'none'` → form strategi harga tampil normal ✅
2. Edit Courier Setting → Tab Strategi Harga → `freeShippingMode = 'all'` → `PricingLockedState` tampil, form tersembunyi ✅
3. Klik tombol `Ubah Pengaturan Gratis Ongkir` → pindah ke tab Pengaturan Lainnya (index 1) ✅
4. Pilih metode `tiered` atau `zone_based` → `DefaultPriceInput` muncul di bawah editor ✅
5. Pilih metode `flat_rate` atau `distance_based` → `DefaultPriceInput` tidak tampil ✅
6. Isi `defaultPrice` → simpan → reload → nilai terbaca dari `courierSetting.defaultPrice` ✅
7. Detail Outlet Tab Kurir → `freeShippingMode = 'all'` → `FreeShippingActiveCard` tampil, detail tier/zona tersembunyi ✅
8. Detail Outlet Tab Kurir → `freeShippingMode ≠ 'all'` → strategi harga tampil normal ✅
