# Web Owner — Gratis Ongkir Semua: Implementation Plan

Fitur ini memungkinkan owner outlet memilih **mode gratis ongkir** yang jelas: tidak ada, bersyarat minimum order, atau gratis semua order. Perubahan ini meliputi backend (Laravel), resource API, pricing engine, dan frontend (React/Inertia).

---

## Keputusan Desain

### Schema: Boolean Tambahan, Bukan Enum

Berdasarkan rekomendasi di user need (bagian 14), plan ini menggunakan **boolean baru** `unconditional_free_shipping_enabled` pada tabel `courier_settings`. Alasannya:

- Kompatibel dengan data existing — tidak perlu ALTER column yang berisiko pada enum.
- `free_shipping_enabled` (bersyarat min order) tetap ada.
- Mode UI dipetakan di frontend:
  - `none` → `free_shipping_enabled = false`, `unconditional_free_shipping_enabled = false`
  - `min_order` → `free_shipping_enabled = true`, `unconditional_free_shipping_enabled = false`
  - `all` → `unconditional_free_shipping_enabled = true` (dan `free_shipping_enabled` tidak relevan)
- `minOrderFreeShipping` dibiarkan tersimpan saat mode `all` (tidak dihapus), hanya tidak dipakai oleh pricing engine.

### Migration Path untuk Data Existing

Data existing dengan `free_shipping_enabled = true` → tetap mode `min_order`. Data existing dengan `free_shipping_enabled = false` → tetap mode `none`. Tidak ada data yang otomatis menjadi `all`.

---

## Proposed Changes

### Layer 1: Database

---

#### [NEW] Migration: `add_unconditional_free_shipping_to_courier_settings`

Tambahkan kolom boolean `unconditional_free_shipping_enabled` (default `false`) ke tabel `courier_settings`.

```sql
$table->boolean('unconditional_free_shipping_enabled')->default(false)->after('min_order_free_shipping');
```

---

### Layer 2: Backend — Model

---

#### [MODIFY] [CourierSetting.php](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/app/Models/CourierSetting.php)

- Tambahkan `'unconditional_free_shipping_enabled'` ke array `$fillable`.
- Tambahkan `'unconditional_free_shipping_enabled' => 'boolean'` ke method `casts()`.
- Tambahkan helper method:

```php
public function freeShippingMode(): string
{
    if ($this->unconditional_free_shipping_enabled) return 'all';
    if ($this->free_shipping_enabled) return 'min_order';
    return 'none';
}
```

---

### Layer 3: Backend — Service

---

#### [MODIFY] [OutletService.php](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/app/Services/OutletService.php) — method `updateCourierSetting`

Tambahkan handling `freeShippingMode` yang dikirim frontend:

```php
if (isset($data['freeShippingMode'])) {
    $mode = $data['freeShippingMode'];
    $setting->unconditional_free_shipping_enabled = $mode === 'all';
    $setting->free_shipping_enabled = $mode === 'min_order';
}
```

Backend juga tetap menerima `unconditionalFreeShippingEnabled` secara langsung sebagai fallback jika dibutuhkan.

---

#### [MODIFY] [CourierPricingEngine.php](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/app/Services/CourierPricingEngine.php) — method `calculate`

Pindahkan pengecekan `unconditional_free_shipping_enabled` ke **sebelum** `free_shipping_enabled` dan **sebelum** membership check:

```php
// Prioritas 1: Gratis ongkir semua (unconditional)
if ($isServiceable && $setting->unconditional_free_shipping_enabled) {
    return $this->createZeroFeeResult($setting, $distanceKm, 'outlet_free_shipping_all');
}

// Prioritas 2: Gratis ongkir bersyarat (min order)
if ($isServiceable && $setting->free_shipping_enabled) {
    if ($orderTotal !== null && $setting->min_order_free_shipping !== null && $orderTotal >= $setting->min_order_free_shipping) {
        return $this->createZeroFeeResult($setting, $distanceKm, 'free_shipping_global');
    }
}

// Prioritas 3: Membership free shipping
if ($isServiceable && $customerId !== null) { ... }
```

> [!IMPORTANT]
> `outlet_free_shipping_all` menjadi nilai `discountSource` yang dikirim ke customer app dan ditampilkan di order detail.

---

### Layer 4: Backend — Request Validation

---

#### [MODIFY] [UpdateCourierSettingRequest.php](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/app/Http/Requests/Outlet/CourierSetting/UpdateCourierSettingRequest.php)

Tambahkan validasi field baru:

```php
'freeShippingMode'                 => ['nullable', 'string', 'in:none,min_order,all'],
'unconditionalFreeShippingEnabled' => ['nullable', 'boolean'],
```

`minOrderFreeShipping` tetap nullable — backend tidak memaksanya wajib karena validasi wajib/tidak ada di UI. Jika butuh validasi server-side: gunakan `required_if:freeShippingMode,min_order`.

---

### Layer 5: Backend — API Resources

---

#### [MODIFY] [CourierSettingResource.php](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/app/Http/Resources/CourierSetting/CourierSettingResource.php)

Tambahkan dua field baru ke `toArray()`:

```php
'unconditionalFreeShippingEnabled' => (bool) $this->unconditional_free_shipping_enabled,
'freeShippingMode'                 => $this->freeShippingMode(),
```

`freeShippingMode` memudahkan frontend untuk langsung tahu mode aktif tanpa harus menderivasi dari dua boolean.

---

#### [MODIFY] [OutletResource.php](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/app/Http/Resources/Outlet/OutletResource.php)

Ganti field `hasFreeShipping` (baris 144–146) agar hanya `true` untuk unconditional, dan tambah field `hasUnconditionalFreeShipping`:

```php
'hasFreeShipping' => $this->relationLoaded('courierSetting') && $this->courierSetting
    ? (bool) $this->courierSetting->unconditional_free_shipping_enabled
    : false,
'hasUnconditionalFreeShipping' => $this->relationLoaded('courierSetting') && $this->courierSetting
    ? (bool) $this->courierSetting->unconditional_free_shipping_enabled
    : false,
```

> [!IMPORTANT]
> `hasFreeShipping` kini **hanya true untuk unconditional**. Ini adalah breaking change yang disengaja: field lama yang mengacu ke `free_shipping_enabled` (bersyarat) tidak boleh lagi membuat customer app menampilkan badge. Customer app plan sudah mengacu ke `hasUnconditionalFreeShipping`.

---

### Layer 6: Frontend — TypeScript Types

---

#### [MODIFY] [courier_setting.ts](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/resources/js/types/courier_setting.ts)

Tambahkan tipe baru dan field baru:

```typescript
export type FreeShippingMode = 'none' | 'min_order' | 'all';

// Tambahkan ke interface CourierSetting:
unconditionalFreeShippingEnabled?: boolean;
freeShippingMode?: FreeShippingMode;

// Tambahkan ke interface CourierSettingFormData:
freeShippingMode: FreeShippingMode;
```

---

### Layer 7: Frontend — FreeShippingModeSelector (Komponen Baru)

---

#### [NEW] [FreeShippingModeSelector.tsx](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/resources/js/Pages/Dashboard/Outlets/Courier/Partials/FreeShippingModeSelector.tsx)

Komponen pemilih mode gratis ongkir. Dipisahkan dari `ModifierForm` untuk menjaga ukuran file.

```
Props:
  value: FreeShippingMode
  onChange: (mode: FreeShippingMode) => void
  minOrderValue?: number | null
  onMinOrderChange?: (value: number | null) => void
  errors?: any
```

Tampilan: tiga card opsi yang bisa diklik. Setiap card memiliki icon, judul, dan deskripsi. Mode yang aktif mendapat border highlight dan background tinted.

| Mode | Icon | Label | Deskripsi |
|------|------|-------|-----------|
| `none` | `X` / `Ban` | Tidak ada gratis ongkir | Ongkir dihitung normal |
| `min_order` | `ShoppingCart` | Gratis ongkir minimum order | Gratis jika total order ≥ minimum |
| `all` | `Truck` / `Gift` | Gratis ongkir semua order | Customer tidak membayar ongkir. Biaya ditanggung outlet. |

Saat mode `min_order` dipilih: tampilkan `NumberInput "Minimal Order"` di bawah card.

Saat mode `all` dipilih: tampilkan Alert info kecil:
> "Semua order kurir yang valid akan mendapatkan ongkir gratis. Pengaturan ini tidak mengaktifkan kurir jika fitur kurir outlet nonaktif."

---

### Layer 8: Frontend — ModifierForm Update

---

#### [MODIFY] [ModifierForm.tsx](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/resources/js/Pages/Dashboard/Outlets/Courier/Partials/ModifierForm.tsx)

Ganti blok `ToggleSwitch "Aktifkan Free Shipping Global"` + `NumberInput "Minimal Order"` dengan:

```tsx
<FreeShippingModeSelector
    value={data.freeShippingMode}
    onChange={(val) => setData('freeShippingMode', val)}
    minOrderValue={data.minOrderFreeShipping}
    onMinOrderChange={(val) => setData('minOrderFreeShipping', val)}
    errors={errors}
/>
```

Update juga **Info Card "Urutan Kalkulasi"**:

```
1. Cek Max Distance.
2. Cek Gratis Ongkir Semua (ditanggung outlet, prioritas tertinggi).
3. Cek Gratis Ongkir Minimum Order.
4. Cek Membership Free Shipping.
5. Hitung Harga Dasar.
6. Terapkan Min/Max Fee.
7. Terapkan Surge Multiplier.
8. Tambahkan Surcharge (Malam/Weekend).
9. Potong Subsidi Merchant.
```

---

### Layer 9: Frontend — Edit.tsx Form Init

---

#### [MODIFY] [Edit.tsx](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/resources/js/Pages/Dashboard/Outlets/Courier/Edit.tsx)

Tambahkan derivasi `freeShippingMode` saat init form data:

```typescript
freeShippingMode: (courierSetting?.freeShippingMode ?? 'none') as FreeShippingMode,
```

---

### Layer 10: Frontend — Overview & Order Detail

---

#### [MODIFY] [CourierSettingsOverviewSection.tsx](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/resources/js/Pages/Dashboard/Outlets/Courier/Partials/CourierSettingsOverviewSection.tsx)

Tambahkan tampilan mode gratis ongkir pada bagian summary promo/subsidi:

- Mode `all` → Badge `success` "Gratis Ongkir Semua"
- Mode `min_order` → Badge `warning` "Gratis ≥ Rp X.XXX"
- Mode `none` → tampilan minimalis atau tidak ditampilkan

---

#### [MODIFY] [OrderOverview.tsx](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/resources/js/Pages/Dashboard/Orders/Partials/OrderOverview.tsx)

Jika order memiliki `pickupFee = 0` atau `deliveryFee = 0` dan ada `discountSource`, tampilkan label **"Gratis Ongkir Outlet"** di samping Rp 0 dalam warna success. Jika `discountSource` tidak tersedia (order lama), cukup tampilkan Rp 0 biasa.

> [!NOTE]
> Ini memerlukan penambahan `pickupFee`, `deliveryFee`, dan `discountSource` ke `Order` TypeScript type dan ke `OrderResource` Laravel. Jika terlalu besar untuk MVP, batasi ke langkah ini sebagai fase 2.

---

## Verification Plan

### Backend

| Skenario | Expected |
|---|---|
| Owner simpan mode `all` | `unconditional_free_shipping_enabled = true`, `free_shipping_enabled = false` |
| Owner simpan mode `min_order` | `unconditional_free_shipping_enabled = false`, `free_shipping_enabled = true` |
| Owner simpan mode `none` | kedua boolean `false` |
| Pricing engine, mode `all`, order valid | `customerPays = 0`, `discountSource = outlet_free_shipping_all` |
| Pricing engine, mode `all`, customer punya membership | kuota membership tidak berkurang |
| API outlet (customer), mode `all` | `hasUnconditionalFreeShipping = true`, `hasFreeShipping = true` |
| API outlet (customer), mode `min_order` | `hasUnconditionalFreeShipping = false`, `hasFreeShipping = false` |
| Data existing `free_shipping_enabled = true` | dibaca sebagai mode `min_order`, `unconditional = false` |

### Frontend

1. Buka halaman Edit Courier Setting → Tab "Pengaturan Lainnya" → bagian "Promo & Subsidi" menampilkan 3 pilihan mode.
2. Pilih "Gratis ongkir semua order" → field minimum order hilang → Alert info tampil → simpan → reload → mode terbaca kembali.
3. Pilih "Gratis ongkir minimum order" → field minimum order muncul → simpan → reload → mode dan nilai minimum terbaca.
4. Overview section menampilkan badge mode yang tepat.

---

## Open Questions

> [!IMPORTANT]
> **Keputusan yang perlu dikonfirmasi:**
>
> 1. **Order detail label** (FR-09): Apakah label "Gratis Ongkir Outlet" di halaman order web owner wajib di MVP pertama, atau cukup Rp 0 tanpa label dulu?
>
> 2. **`minOrderFreeShipping` saat mode `all`**: Apakah backend perlu set `null` ke DB saat owner beralih ke mode `all`, atau biarkan nilai lama tersimpan?
>    - **Rekomendasi plan ini:** biarkan tersimpan — tidak ada efek ke pricing, dan owner tidak kehilangan nilai lama.
>
> 3. **Validasi server-side `minOrderFreeShipping`**: Apakah perlu `required_if:freeShippingMode,min_order` di request validation, atau cukup nullable dan UI yang memvalidasi?
