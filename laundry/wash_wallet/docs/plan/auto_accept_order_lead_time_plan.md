# Implementation Plan: Auto Accept Order Berdasarkan Lead Time dan Batas Jarak Pickup

**Tanggal:** 2026-06-16  
**Referensi:**
- `docs/user_need/auto_accept_order_lead_time_user_need.md` (dokumen utama)
- `docs/user_need/auto_accept_order_user_need.md` (v1, sebagai konteks)
- `docs/plan/auto_accept_order_plan.md` (plan v1, sudah diimplementasi)

---

## Sebelum Mengerjakan

Baca semua file spec di `docs/spec/` terlebih dahulu:
`cubit_spec.md`, `state_spec.md`, `provider_spec.md`, `remote_datasource_spec.md`,
`repository_spec.md`, `repository_impl_spec.md`, `usecase_spec.md`.

Aturan coding yang wajib diikuti:
- Gunakan shared widget dari `packages/wash_wallet_ui/lib/src/components/`
- Gunakan `Theme.of(context).colorScheme` untuk warna, tidak hardcode warna apapun
- Pecah widget panjang ke folder `widgets/` di dalam folder screen yang relevan
- Tidak ada comment di dalam kode
- Ikuti prinsip clean code: nama variabel/method yang jelas, fungsi kecil, hindari duplikasi
- Pastikan semua perubahan backend sudah diuji dengan unit test dan integration test yang memadai
- Pastikan semua perubahan frontend sudah diuji dengan widget test dan manual test yang memadai

---

## Ringkasan

Fitur ini memperluas Auto Accept Order dengan dua dimensi kontrol baru yang bisa dikonfigurasi per outlet:

1. **Lead time waktu** — auto accept terjadi X menit/jam sebelum jadwal jemput kurir (contoh: 30 menit, 1 jam, 2 jam)
2. **Batas maksimal jarak** — order yang jaraknya melebihi batas tidak boleh auto accepted, walaupun sudah masuk window waktu

Kedua kontrol bersifat **AND**: order baru di-accept otomatis jika memenuhi **keduanya**. Jika outlet tidak mengonfigurasi salah satu atau keduanya, sistem memakai perilaku default auto accept yang sudah ada (fallback 24 jam sejak order dibuat).

---

## Kondisi Codebase Saat Ini (Baseline Setelah v1)

### Sudah Tersedia

| Komponen | Keterangan |
|---|---|
| `migrations/2026_06_13_000001_seed_auto_accept_order_setting.php` | Setting `auto_accept_order` di tabel `settings` |
| `migrations/2026_06_13_000002_alter_order_status_histories_system_actor.php` | Kolom `actor_type`, `actor_label`, `employee_id` nullable |
| `app/Models/OrderStatusHistory.php` | `logSystemStatusChange()`, konstanta ACTOR_TYPE_SYSTEM |
| `app/Models/Order.php` | Flag `public bool $wasAutoAccepted = false`, relasi `customerAddress` |
| `app/Models/Outlet.php` | Field `latitude`, `longitude`, `scopeNearby()` dengan formula Haversine |
| `app/Models/CustomerAddress.php` | Field `latitude`, `longitude` |
| `app/Services/OutletSettingService.php` | `isAutoAcceptOrderEnabled()` |
| `app/Observers/OrderObserver.php` | Routing log berdasarkan `wasAutoAccepted` |
| `app/Services/AutoAcceptOrderService.php` | Logic evaluasi 24 jam + `acceptOrder()` |
| `app/Console/Commands/AutoAcceptOrders.php` | Command `orders:auto-accept` |
| Frontend `OutletSettingsTab.tsx` | Card Auto Accept Order dengan toggle |

### Gap yang Perlu Diselesaikan

| # | Gap | Dampak |
|---|---|---|
| 1 | Tidak ada setting `auto_accept_lead_time_minutes` | Owner tidak bisa pilih waktu lead time |
| 2 | Tidak ada setting `auto_accept_max_distance_km` | Owner tidak bisa batasi jarak |
| 3 | `AutoAcceptOrderService::run()` hanya evaluasi 24 jam | Tidak ada jalur evaluasi lead time + jarak |
| 4 | Scheduler belum terdaftar di `routes/console.php` | Command tidak berjalan otomatis (bug v1 yang tertunda) |
| 5 | Frontend hanya punya toggle on/off | Tidak ada UI pilihan lead time dan batas jarak |

---

## Keputusan Produk (Menyelesaikan Konflik Default)

### Konflik yang Perlu Diselesaikan (User Need Bagian 11)

User need lama menyebut aturan 24 jam sejak order dibuat. User need baru meminta opsi lead time sebelum pickup dan batas jarak. Keputusan yang diambil dalam plan ini:

> **Keputusan Default:** Jika outlet mengaktifkan `auto_accept_order` **tanpa** mengatur lead time atau batas jarak khusus, sistem tetap menggunakan aturan fallback **24 jam sejak order dibuat** (perilaku v1 yang sudah ada). Ini menjaga backward compatibility penuh.

### Matriks Evaluasi Per Order

| Kondisi Outlet | Kondisi Order | Evaluasi yang Dipakai |
|---|---|---|
| Lead time = 0, max jarak = 0 | Semua `requested` | 24 jam sejak created_at (fallback v1) |
| Lead time > 0, max jarak = 0 | Punya `pickup_schedule` | Lead time saja (tanpa cek jarak) |
| Lead time > 0, max jarak = 0 | Tidak punya `pickup_schedule` | 24 jam sejak created_at (fallback) |
| Lead time = 0, max jarak > 0 | Semua `requested` | 24 jam sejak created_at + cek jarak |
| Lead time > 0, max jarak > 0 | Punya `pickup_schedule` | Lead time + cek jarak (keduanya harus terpenuhi) |
| Lead time > 0, max jarak > 0 | Tidak punya `pickup_schedule` | 24 jam sejak created_at + cek jarak (fallback) |

### Keputusan untuk Order Tanpa Data Jarak

Jika outlet mengatur batas jarak (`max_distance_km > 0`) tetapi data jarak tidak tersedia (customer address tidak ada, atau lat/lng kosong):

> **Keputusan:** Order **tidak di-auto-accept**. Sistem melewati order tersebut agar cashier dapat memutuskan manual. Ini konsisten dengan user need Rule 14: "Order yang jaraknya tidak tersedia atau tidak dapat dipastikan tidak boleh auto accepted."

### Keputusan Sumber Data Jarak

Jarak dihitung dari koordinat `CustomerAddress` (lat/lng) ke koordinat `Outlet` (lat/lng) menggunakan formula **Haversine** (sama dengan `scopeNearby()` yang sudah ada di `Outlet` model). Ini konsisten dengan data yang sudah ada di codebase tanpa memerlukan integrasi pihak ketiga.

---

## Perubahan yang Diperlukan

---

### A. Database

#### [NEW] Migration: Seed Setting `auto_accept_lead_time_minutes`

```
key         = 'auto_accept_lead_time_minutes'
name        = 'Lead Time Auto Accept Order (Menit)'
description = 'Jumlah menit sebelum jadwal pickup kurir untuk mulai auto accept. Nilai 0 berarti tidak menggunakan lead time pickup (fallback ke 24 jam).'
```

Nilai valid di `outlet_settings.value`:
- `'0'` — tidak pakai lead time, fallback ke 24 jam
- `'30'` — 30 menit sebelum pickup
- `'60'` — 1 jam sebelum pickup
- `'120'` — 2 jam sebelum pickup

#### [NEW] Migration: Seed Setting `auto_accept_max_distance_km`

```
key         = 'auto_accept_max_distance_km'
name        = 'Batas Maksimal Jarak Auto Accept Order (KM)'
description = 'Jarak maksimal dalam km antara alamat pickup customer dan outlet agar order boleh auto accepted. Nilai 0 berarti tidak ada batas jarak.'
```

Nilai valid di `outlet_settings.value`:
- `'0'` — tidak ada batas jarak
- `'5'` — maksimal 5 km
- `'10'` — maksimal 10 km
- `'15'` — maksimal 15 km
- `'20'` — maksimal 20 km

> Gunakan `DB::table('settings')->insertOrIgnore([...])` agar idempotent untuk kedua migration.

---

### B. Backend — Laravel (`webapp/wash_wallet_be`)

#### [MODIFY] `app/Services/OutletSettingService.php`

Tambahkan empat method baru:

```php
public function getAutoAcceptLeadTimeMinutes(int $outletId): int
{
    return (int) $this->getValue($outletId, 'auto_accept_lead_time_minutes', '0');
}

public function hasAutoAcceptLeadTime(int $outletId): bool
{
    return $this->getAutoAcceptLeadTimeMinutes($outletId) > 0;
}

public function getAutoAcceptMaxDistanceKm(int $outletId): float
{
    return (float) $this->getValue($outletId, 'auto_accept_max_distance_km', '0');
}

public function hasAutoAcceptMaxDistance(int $outletId): bool
{
    return $this->getAutoAcceptMaxDistanceKm($outletId) > 0;
}
```

#### [NEW] `app/Services/DistanceCalculatorService.php`

Service khusus untuk kalkulasi jarak dengan formula Haversine. Dipisah agar dapat diuji secara independen dan digunakan ulang.

```
Method: calculateKm(float $lat1, float $lng1, float $lat2, float $lng2): float
- Gunakan formula Haversine (sama dengan scopeNearby di Outlet model)
- Radius bumi: 6371 km
- Return jarak dalam km

Method: calculateFromOrderToOutlet(Order $order, Outlet $outlet): ?float
- Ambil lat/lng dari $order->customerAddress
- Jika customerAddress null atau lat/lng null: return null
- Jika outlet->latitude atau outlet->longitude null: return null
- Return calculateKm(customerAddress.lat, customerAddress.lng, outlet.lat, outlet.lng)
```

#### [MODIFY] `app/Services/AutoAcceptOrderService.php`

Ini adalah perubahan paling substansial. Inject `OutletSettingService` dan `DistanceCalculatorService` via constructor.

**Struktur baru method `run()`:**

```
1. Query outletIds yang memiliki outlet_settings -> setting.key = 'auto_accept_order', value = 'true'
2. Untuk setiap outletId:
   a. Load outlet beserta relasi yang dibutuhkan
   b. Ambil leadTimeMinutes = OutletSettingService::getAutoAcceptLeadTimeMinutes(outletId)
   c. Ambil maxDistanceKm = OutletSettingService::getAutoAcceptMaxDistanceKm(outletId)
   d. Jika leadTimeMinutes > 0:
      - Jalankan evaluateByPickupLeadTime(outlet, leadTimeMinutes, maxDistanceKm)
      - Jalankan evaluateBy24Hours(outlet, maxDistanceKm, withoutPickupScheduleOnly: true)
   e. Jika leadTimeMinutes == 0:
      - Jalankan evaluateBy24Hours(outlet, maxDistanceKm, withoutPickupScheduleOnly: false)
3. Return summary {processed, skipped, failed}
```

**Method baru `evaluateByPickupLeadTime(Outlet $outlet, int $leadTimeMinutes, float $maxDistanceKm, array &$summary)`:**

```
- $pickupThreshold = now()->addMinutes($leadTimeMinutes)
- Query orders:
    outlet_id = outlet->id
    source = 'customer_app'
    status = 'requested'
    pickup_schedule IS NOT NULL
    pickup_schedule <= $pickupThreshold
  Eager load: with(['customerAddress', 'outlet'])
- Untuk setiap order: panggil processOrderIfEligible(order, outlet, maxDistanceKm)
```

**Refactor `evaluateBy24Hours(Outlet $outlet, float $maxDistanceKm, bool $withoutPickupScheduleOnly, array &$summary)`:**

```
- $cutoff = now()->subHours(24)
- Query orders:
    outlet_id = outlet->id
    source = 'customer_app'
    status = 'requested'
    created_at <= $cutoff
    jika withoutPickupScheduleOnly === true: whereNull('pickup_schedule')
  Eager load: with(['customerAddress', 'outlet'])
- Untuk setiap order: panggil processOrderIfEligible(order, outlet, maxDistanceKm)
```

**Method baru `processOrderIfEligible(Order $order, Outlet $outlet, float $maxDistanceKm)`:**

```
- Jika maxDistanceKm > 0:
    distance = DistanceCalculatorService::calculateFromOrderToOutlet(order, outlet)
    Jika distance === null:
        Log::warning('Auto accept skipped: distance unavailable', [...])
        $summary['skipped']++
        return
    Jika distance > maxDistanceKm:
        Log::info('Auto accept skipped: order exceeds max distance', ['distance' => distance, 'max' => maxDistanceKm])
        $summary['skipped']++
        return
- Panggil acceptOrder(order)
- Update summary (processed atau failed)
```

**Method `acceptOrder()` tidak perlu diubah** — sudah benar dengan lockForUpdate, konsekuensi bisnis accept, dan audit trail.

**Formula lead time (penting):**

```
pickup_schedule <= now()->addMinutes($leadTimeMinutes)
```

Artinya: "jadwal pickup sudah dalam atau kurang dari leadTimeMinutes menit dari sekarang."

Contoh konkret:
- Lead time = 60 menit, pickup = 09:00, evaluasi = 08:15 → 09:00 ≤ 09:15 → **eligible**
- Lead time = 60 menit, pickup = 09:00, evaluasi = 07:45 → 09:00 ≤ 08:45 → **tidak eligible**

#### [MODIFY] `routes/console.php`

Daftarkan scheduler yang belum ada sejak v1:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('orders:auto-accept')->everyFifteenMinutes();
```

> **Ini adalah bug fix dari v1 yang tertunda.** Tanpa baris ini, command tidak pernah berjalan secara otomatis di production.

#### [MODIFY] `app/Console/Commands/AutoAcceptOrders.php`

Update signature dan description:

```
Description: Auto accept customer-app orders by lead time before pickup (if configured) and max distance (if configured), with 24-hour fallback.
```

---

### C. Frontend — Web Dashboard (`resources/js`)

#### [MODIFY] `resources/js/Pages/Dashboard/Outlets/Partials/OutletSettingsTab.tsx`

**1. Baca nilai dua setting baru:**

```ts
const autoAcceptLeadTimeMinutes = getSettingValue('auto_accept_lead_time_minutes') ?? '0';
const autoAcceptMaxDistanceKm = getSettingValue('auto_accept_max_distance_km') ?? '0';
```

**2. Tambahkan handler untuk setting string (non-boolean):**

```ts
const handleSetting = (key: string, value: string) => {
    router.put(
        route('outlets.settings.update', outlet.id),
        { key, value },
        { preserveScroll: true }
    );
};
```

**3. Definisikan opsi lead time:**

```ts
const leadTimeOptions = [
    { value: '0',   label: 'Fallback 24 jam',          desc: 'Order belum diterima selama 24 jam sejak dibuat' },
    { value: '30',  label: '30 menit sebelum pickup',  desc: 'Auto accept 30 menit sebelum jadwal pickup kurir' },
    { value: '60',  label: '1 jam sebelum pickup',     desc: 'Auto accept 1 jam sebelum jadwal pickup kurir' },
    { value: '120', label: '2 jam sebelum pickup',     desc: 'Auto accept 2 jam sebelum jadwal pickup kurir' },
];
```

**4. Definisikan opsi batas jarak:**

```ts
const maxDistanceOptions = [
    { value: '0',  label: 'Tanpa batas jarak', desc: 'Semua order eligible tanpa filter jarak' },
    { value: '5',  label: 'Maksimal 5 km',     desc: 'Order lebih dari 5 km tidak auto accepted' },
    { value: '10', label: 'Maksimal 10 km',    desc: 'Order lebih dari 10 km tidak auto accepted' },
    { value: '15', label: 'Maksimal 15 km',    desc: 'Order lebih dari 15 km tidak auto accepted' },
    { value: '20', label: 'Maksimal 20 km',    desc: 'Order lebih dari 20 km tidak auto accepted' },
];
```

**5. Render kedua kontrol** (tampil hanya jika `isAutoAcceptEnabled === true`):
   - Kontrol lead time: radio button group dengan label `"Waktu Auto Accept"`
   - Kontrol batas jarak: radio button group dengan label `"Batas Jarak Maksimal"`
   - Keduanya diletakkan di bawah deskripsi utama card Auto Accept Order
   - Masing-masing punya handler: `handleSetting('auto_accept_lead_time_minutes', value)` dan `handleSetting('auto_accept_max_distance_km', value)`

**6. Update deskripsi card Auto Accept Order:**

```
Tentukan kapan order customer yang belum diterima akan disetujui otomatis.
Pilih window waktu sebelum pickup dan batas jarak maksimal agar hanya order
yang relevan secara operasional yang diterima otomatis.
```

**7. Update `importantNotes`** — tambahkan/perbarui poin-poin berikut:
- `"Lead time pickup hanya berlaku untuk order yang memiliki jadwal jemput kurir."`
- `"Order tanpa jadwal pickup tetap menggunakan aturan 24 jam jika lead time pickup dipilih."`
- `"Jarak dihitung dari alamat pickup customer ke lokasi outlet (garis lurus)."`
- `"Order yang jaraknya tidak dapat dihitung tidak akan auto accepted jika batas jarak diaktifkan."`
- Perbarui: `"Order self drop-off tidak terpengaruh Auto Accept Order."` tetap ada
- Perbarui: `"Menonaktifkan fitur ini tidak mengembalikan order yang sudah terlanjur diterima otomatis."` tetap ada

---

## Urutan Implementasi

> Ikuti urutan ini untuk menghindari dependency issue antar perubahan.

1. **[DB]** Migration: Seed setting `auto_accept_lead_time_minutes` ke tabel `settings`
2. **[DB]** Migration: Seed setting `auto_accept_max_distance_km` ke tabel `settings`
3. **[BE]** `OutletSettingService` — Tambah `getAutoAcceptLeadTimeMinutes()`, `hasAutoAcceptLeadTime()`, `getAutoAcceptMaxDistanceKm()`, `hasAutoAcceptMaxDistance()`
4. **[BE]** Buat `DistanceCalculatorService` dengan `calculateKm()` dan `calculateFromOrderToOutlet()`
5. **[BE]** `AutoAcceptOrderService` — Inject service baru, tambah `evaluateByPickupLeadTime()`, tambah `processOrderIfEligible()`, refactor `evaluateBy24Hours()`, update `run()`
6. **[BE]** `routes/console.php` — Daftarkan scheduler `orders:auto-accept`
7. **[BE]** `AutoAcceptOrders.php` — Update description command
8. **[FE]** `OutletSettingsTab.tsx` — Tambah handler, opsi lead time, opsi jarak, update notes
9. **[TEST]** Jalankan skenario verifikasi manual

---

## Aturan Bisnis yang Harus Dijaga

| Aturan | Detail |
|--------|--------|
| Hanya `source = 'customer_app'` | Order dari cashier/POS tidak diproses |
| Hanya status `requested` | Filter ketat, order status lain diabaikan |
| Syarat AND | Order harus memenuhi KEDUA syarat (waktu DAN jarak) jika keduanya dikonfigurasi |
| Jarak tidak tersedia = skip | Outlet dengan max jarak aktif: order tanpa lat/lng di-skip, bukan di-accept |
| Isolasi per outlet | Setting outlet A tidak mempengaruhi order outlet B |
| Idempotent | Lock for update di dalam transaksi, order bukan `requested` tidak diproses ulang |
| Fallback 24 jam | Jika lead time = 0, evaluasi 24 jam berjalan seperti v1 |
| Order tanpa pickup_schedule + lead time aktif | Fallback ke 24 jam (tapi tetap cek jarak jika ada) |
| Konsekuensi setara accept manual | WA notification, FCM customer, FCM courier, CustomerOrderAccepted event |
| Audit jelas | `actor_type = 'system'`, `actor_label = 'Sistem otomatis'`, `employee_id = null` |
| Tidak rollback | Mengubah/menonaktifkan setting tidak mengubah order yang sudah accepted |
| Perubahan setting real-time | Setting dicek saat evaluasi berjalan; perubahan berlaku di evaluasi berikutnya |

---

## Edge Cases yang Harus Dicover

| Edge Case | Penanganan |
|-----------|------------|
| `auto_accept_order` = false | Skip outlet, tidak ada order diproses |
| Lead time > 0, order tidak punya `pickup_schedule` | Fallback ke evaluasi 24 jam (+ cek jarak jika max jarak > 0) |
| Lead time > 0, `pickup_schedule` ada, belum masuk window | Tidak diproses |
| Lead time > 0, `pickup_schedule` ada, sudah masuk window | Lanjut ke cek jarak (jika ada) → di-accept |
| Max jarak > 0, jarak order < max | Lanjut ke accept (jika syarat waktu juga terpenuhi) |
| Max jarak > 0, jarak order > max | Skip, tidak diproses (cashier perlu putuskan manual) |
| Max jarak > 0, data lat/lng tidak tersedia | Skip dengan log warning, tidak di-accept |
| Max jarak = 0 | Cek jarak diabaikan, hanya cek waktu |
| Kedua setting = 0 | Evaluasi 24 jam persis seperti v1, backward-compatible |
| Order sudah manual accepted sebelum evaluasi | Lock for update + filter `status = 'requested'` mencegah duplikasi |
| Order reject/cancel | Filter `status = 'requested'` mengecualikan secara natural |
| Evaluasi berjalan berulang | Idempotent — setelah status berubah, tidak masuk filter |
| Owner ubah lead time setelah order dibuat | Berlaku di evaluasi berikutnya |
| Owner ubah max jarak setelah order dibuat | Berlaku di evaluasi berikutnya |
| Owner nonaktifkan setting setelah ada yang auto-accepted | Order sudah accepted tidak dikembalikan |
| Notifikasi gagal | Try-catch terpisah, status order tidak rollback |
| Overlap evaluasi lead time dan 24 jam pada outlet yang sama | Filter `whereNull('pickup_schedule')` pada evaluasi 24 jam saat lead time aktif mencegah double processing |

---

## Rencana Verifikasi

### Test Manual via Artisan

```bash
php artisan orders:auto-accept
```

| # | Kondisi | Hasil Diharapkan |
|---|---------|-----------------|
| 1 | Outlet tanpa `auto_accept_order` aktif | Tidak ada order diproses |
| 2 | Lead time = 0, max jarak = 0, order < 24 jam | Tidak diproses |
| 3 | Lead time = 0, max jarak = 0, order >= 24 jam | Status → `accepted` |
| 4 | Lead time = 60, max jarak = 0, pickup = 1 jam ke depan | Status → `accepted` |
| 5 | Lead time = 60, max jarak = 0, pickup = 2 jam ke depan | Tidak diproses |
| 6 | Lead time = 60, max jarak = 10, pickup = 1 jam ke depan, jarak = 8 km | Status → `accepted` |
| 7 | Lead time = 60, max jarak = 10, pickup = 1 jam ke depan, jarak = 15 km | Tidak diproses (jarak melebihi batas) |
| 8 | Lead time = 60, max jarak = 10, pickup = 1 jam ke depan, no customer address lat/lng | Tidak diproses (jarak tidak tersedia) |
| 9 | Lead time = 60, order tanpa `pickup_schedule`, created >= 24 jam, jarak = 8 km | Status → `accepted` (fallback + jarak ok) |
| 10 | Lead time = 60, order tanpa `pickup_schedule`, created >= 24 jam, jarak = 15 km | Tidak diproses (fallback ok tapi jarak > max) |
| 11 | Lead time = 0, max jarak = 10, order >= 24 jam, jarak = 8 km | Status → `accepted` |
| 12 | Lead time = 0, max jarak = 10, order >= 24 jam, jarak = 15 km | Tidak diproses |
| 13 | Order sudah accepted manual | Tidak diproses ulang |
| 14 | Evaluasi dua kali berturut-turut | Idempotent, tidak duplikasi |
| 15 | Status history setelah auto accept | `actor_type = 'system'`, `employee_id = null`, `actor_label = 'Sistem otomatis'` |
| 16 | `php artisan schedule:list` | `orders:auto-accept` muncul dengan interval `Every 15 minutes` |

### Manual QA

1. **Owner:** Tab Pengaturan → Card Auto Accept Order → toggle aktif → muncul pilihan lead time dan batas jarak → pilih "1 jam sebelum pickup" dan "Maksimal 10 km" → tersimpan.
2. **Owner:** Ubah lead time atau max jarak → tidak mempengaruhi order yang sudah accepted.
3. **Cashier:** Setelah auto accept → order tidak muncul di daftar `requested` → count berkurang.
4. **Customer:** Status order berubah ke accepted → notifikasi FCM diterima.
5. **Cashier (jarak melebihi batas):** Order dengan jarak > max masih muncul di daftar `requested` → cashier dapat putuskan manual.
6. **Audit:** Riwayat order menampilkan "Sistem otomatis" tanpa nama employee.
7. **Scheduler:** `php artisan schedule:list` → `orders:auto-accept` terdaftar `Every 15 minutes`.

---

## Ringkasan File

### Backend (Laravel)

| File | Status | Keterangan |
|------|--------|------------|
| `database/migrations/YYYY_seed_auto_accept_lead_time_setting.php` | [NEW] | Seed setting `auto_accept_lead_time_minutes` |
| `database/migrations/YYYY_seed_auto_accept_max_distance_setting.php` | [NEW] | Seed setting `auto_accept_max_distance_km` |
| `app/Services/OutletSettingService.php` | [MODIFY] | Tambah 4 method baru untuk lead time dan max distance |
| `app/Services/DistanceCalculatorService.php` | [NEW] | Kalkulasi Haversine antara dua koordinat |
| `app/Services/AutoAcceptOrderService.php` | [MODIFY] | Inject service baru, tambah path evaluasi lead time + jarak |
| `routes/console.php` | [MODIFY] | Daftarkan `orders:auto-accept` ke scheduler |
| `app/Console/Commands/AutoAcceptOrders.php` | [MODIFY] | Update description command |

### Frontend (React/TypeScript)

| File | Status | Keterangan |
|------|--------|------------|
| `resources/js/Pages/Dashboard/Outlets/Partials/OutletSettingsTab.tsx` | [MODIFY] | Tambah UI pilihan lead time, batas jarak, handler, update notes |

---

## Catatan Penting untuk Implementor

**[WAJIB — Fix Scheduler yang Tertunda dari v1]**
`routes/console.php` masih kosong. Scheduler belum berjalan di production. Harus diperbaiki dalam implementasi ini.

**[PENTING — Lock For Update Sudah Ada di `acceptOrder()`]**
Jangan ubah pola `lockForUpdate()` di dalam transaksi DB. Idempotency sudah terjaga. Cek jarak dilakukan di LUAR transaksi (di `processOrderIfEligible`) sebelum memanggil `acceptOrder()`.

**[PENTING — Syarat AND untuk Waktu DAN Jarak]**
Jangan lakukan short-circuit yang salah. Urutan evaluasi yang benar:
1. Cek apakah order masuk window waktu → jika tidak, skip
2. Cek apakah jarak memenuhi batas → jika tidak, skip
3. Panggil `acceptOrder()`

**[PENTING — Jarak Tidak Tersedia = Skip, Bukan Accept]**
Jika `DistanceCalculatorService::calculateFromOrderToOutlet()` return `null`, order **tidak boleh** di-accept secara otomatis selama `max_distance_km > 0`. Ini adalah keputusan produk eksplisit sesuai User Need Rule 14.

**[PENTING — Formula Lead Time Tidak Boleh Dibalik]**
Formula: `pickup_schedule <= now()->addMinutes($leadTimeMinutes)`.
Ini berarti "pickup sudah dalam window lead time". Jangan dibalik menjadi `>= now() - lead_time` karena hasilnya berbeda.

**[NOTE — Formula Haversine Sudah Ada di Codebase]**
`Outlet::scopeNearby()` menggunakan formula Haversine yang sama. `DistanceCalculatorService` harus mengimplementasi formula yang identik untuk konsistensi. Radius bumi: 6371 km.

**[NOTE — Backward Compatibility Terjaga]**
Outlet dengan `auto_accept_order = true` dan lead time = 0, max jarak = 0 → evaluasi 24 jam berjalan persis seperti v1. Tidak ada perubahan perilaku untuk outlet yang sudah ada.

**[NOTE — Nilai Valid untuk Setting]**
Lead time: `0`, `30`, `60`, `120` (menit). Max jarak: `0`, `5`, `10`, `15`, `20` (km). Casting ke `(int)` dan `(float)` di service method sudah cukup sebagai safety net.
