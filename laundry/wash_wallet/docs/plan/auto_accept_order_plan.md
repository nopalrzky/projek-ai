# Implementation Plan: Auto Accept Order per Outlet

**Tanggal:** 2026-06-13
**Referensi:** `docs/user_need/auto_accept_order_user_need.md`

---

## Ringkasan

Fitur ini memungkinkan Owner mengaktifkan konfigurasi **Auto Accept Order** per outlet. Ketika aktif, order customer-app berstatus `requested` yang tidak berubah selama 24 jam sejak dibuat akan otomatis berubah menjadi `accepted` oleh sistem. Perubahan ini harus tercatat sebagai tindakan `Sistem otomatis` (bukan employee), dan harus mengikuti seluruh konsekuensi bisnis accept manual (notifikasi, FCM, broadcast, count order cashier).

---

## Kondisi Codebase Saat Ini

### 1. Setting Outlet — Gap yang Perlu Diselesaikan

Terdapat **inkonsistensi** pada data layer pengaturan outlet:

- **Database schema** (`outlet_settings` table): menggunakan relasi `outlet_id + setting_id` (FK ke tabel `settings`).
- **`OutletSettingService::setValue()`**: memanggil `updateOrCreate` dengan `['outlet_id' => ..., 'key' => ...]` — ini **salah karena kolom `key` tidak ada di tabel `outlet_settings`**.
- **`OutletSettingService::getValueByKey()`**: melakukan query ke tabel `settings` by key terlebih dahulu, lalu menggunakan `setting_id` — ini sudah benar.
- **Frontend (`OutletSettingsTab.tsx`)**: mengakses `outlet.outletSettings` dan melakukan `find((s) => s.setting?.key === key)` — mengasumsikan relasi `setting` di-load.
- **`OutletController` (Web)**: belum load `outletSettings.setting` secara eksplisit (perlu dicek lebih lanjut).

Gap ini **harus diselesaikan** sebelum atau bersamaan dengan penambahan setting baru.

### 2. `OrderStatusHistory` — Tidak Mendukung Aktor Otomatis

- Saat ini `logStatusHistory` di `OrderObserver` selalu set `employee_id` (bisa dari `updated_by`, `Auth::id()`, `order->employee_id`, atau fallback ke `1`).
- Untuk auto accept, tidak ada employee yang melakukan perubahan. Perlu pendekatan yang membedakan tindakan otomatis dari tindakan employee.
- Kolom `employee_id` kemungkinan merupakan FK NOT NULL ke tabel `employees`. Tidak bisa diisi `null` tanpa migration.

### 3. `OrderService::accept()` — Sudah Lengkap

- Method `accept(orderId, employeeId)` sudah menangani: ubah status, update order items, WA notification, FCM customer, FCM courier, broadcast event.
- Logika ini **harus direplikasi** oleh auto accept agar konsekuensi bisnis setara.

### 4. Scheduler — Sudah Tersedia

- Laravel scheduler sudah digunakan untuk `CheckFeatureExpiry`, `CleanupExpiredOtps`, dll.
- Perlu menambahkan command baru untuk auto accept dan mendaftarkannya ke scheduler.

---

## Perubahan yang Diperlukan

---

### A. Database

#### [NEW] Migration: Seed Setting `auto_accept_order`

Buat migration untuk menambahkan entri ke tabel `settings`:

```
key         = 'auto_accept_order'
name        = 'Auto Accept Order'
description = 'Order dari customer-app dengan status requested yang tidak berubah selama 24 jam sejak dibuat akan diterima otomatis.'
```

Gunakan `DB::table('settings')->insertOrIgnore([...])` di dalam `up()` agar idempotent.

#### [NEW] Migration: Tambah Kolom di `order_status_histories`

Untuk membedakan tindakan otomatis dari tindakan employee:

1. Ubah kolom `employee_id` menjadi **nullable**.
2. Tambah kolom `actor_type` tipe `string` default `'employee'`:
   - Nilai `'employee'` → perubahan oleh employee.
   - Nilai `'system'` → perubahan oleh sistem otomatis.
3. Tambah kolom `actor_label` tipe `string` nullable:
   - Ketika `actor_type = 'system'`, isi dengan `'Sistem otomatis'`.
   - Ketika `actor_type = 'employee'`, bisa null (fallback ke nama employee).

> **Penting:** Pastikan migration backward-compatible. Untuk SQLite (dev), jika ALTER COLUMN tidak didukung, gunakan pendekatan recreate table.

---

### B. Backend — Laravel (`webapp/wash_wallet_be`)

#### [MODIFY] `app/Models/OrderStatusHistory.php`

1. Tambahkan `actor_type` dan `actor_label` ke `$fillable`.
2. Tambahkan konstanta:

```php
const ACTOR_TYPE_EMPLOYEE = 'employee';
const ACTOR_TYPE_SYSTEM   = 'system';
const ACTOR_LABEL_SYSTEM  = 'Sistem otomatis';
```

3. Tambahkan static helper baru `logSystemStatusChange()`:
   - `employee_id = null`
   - `actor_type = 'system'`
   - `actor_label = 'Sistem otomatis'`
4. Update `logStatusChange()` agar menerima optional `actorType` dan `actorLabel` dengan default `'employee'`.
5. Update accessor `statusChangeDescription()` agar menampilkan `actor_label` jika `actor_type = 'system'`.

#### [MODIFY] `app/Observers/OrderObserver.php`

- Tambahkan logika pada `logStatusHistory()` untuk mendukung aktor sistem.
- **Pendekatan yang direkomendasikan:** Tambahkan property non-persisted `public bool $wasAutoAccepted = false` pada Order model. Di-set `true` oleh `AutoAcceptOrderService` sebelum save. Observer membaca flag ini untuk memilih `logSystemStatusChange()` vs `logStatusChange()`.

#### [MODIFY] `app/Services/OutletSettingService.php`

**Bug Fix (wajib sebelum fitur baru):** Perbaiki `setValue()` yang menggunakan `'key'` sebagai kolom `outlet_settings` (padahal kolom ini tidak ada):

```php
public function setValue(int $outletId, string $key, string $value): OutletSetting
{
    $setting = Setting::firstOrCreate(['key' => $key]);
    return OutletSetting::updateOrCreate(
        ['outlet_id' => $outletId, 'setting_id' => $setting->id],
        ['value' => $value]
    );
}
```

Tambahkan method:

```php
public function isAutoAcceptOrderEnabled(int $outletId): bool
{
    return $this->getValue($outletId, 'auto_accept_order', 'false') === 'true';
}
```

#### [NEW] `app/Services/AutoAcceptOrderService.php`

Service baru dengan method `run()`:

```
1. Query outlet yang memiliki OutletSetting -> setting.key = 'auto_accept_order' dengan value = 'true'
2. Untuk setiap outlet:
   a. Query orders:
      - outlet_id = outlet->id
      - source = 'customer_app'
      - status = 'requested'
      - created_at <= now()->subHours(24)
   b. Untuk setiap order (dalam try-catch per order):
      - Set $order->wasAutoAccepted = true
      - Update status ke 'accepted'
      - Update order_items ke status 'pending'
      - Log history via OrderStatusHistory::logSystemStatusChange()
      - WA notification (try-catch terpisah, kegagalan tidak membatalkan)
      - Dispatch CustomerOrderAccepted event
      - Dispatch SendCustomerOrderAcceptedFcm::dispatch($order->id)->afterCommit()
      - Dispatch SendCourierNewPickupNotification::dispatch($order->id)->afterCommit()
3. Return ['processed' => int, 'skipped' => int, 'failed' => int]
```

#### [NEW] `app/Console/Commands/AutoAcceptOrders.php`

```
Signature   : orders:auto-accept
Description : Auto accept customer-app orders in requested status for 24+ hours for outlets with auto accept enabled.
```

- Panggil `AutoAcceptOrderService::run()`.
- Output summary ke console dan log.

#### [MODIFY] `routes/console.php`

```php
Schedule::command('orders:auto-accept')->everyFifteenMinutes();
```

#### [MODIFY] `app/Http/Controllers/Web/OutletController.php`

Pastikan `show()` men-load:

```php
->with(['outletSettings.setting', ...])
```

#### [MODIFY] API Resource / Status History Response

Jika ada endpoint yang mengembalikan riwayat status order (untuk cashier app atau customer app), tambahkan field `actor_type` dan `actor_label` ke response agar Flutter app dapat menampilkan "Sistem otomatis".

---

### C. Frontend — Web Dashboard (`resources/js`)

#### [MODIFY] `resources/js/Pages/Dashboard/Outlets/Partials/OutletSettingsTab.tsx`

1. Baca nilai setting:

```ts
const isAutoAcceptEnabled = getSettingValue('auto_accept_order') === 'true';
```

2. Tambahkan Card baru dengan:
   - **Icon:** `Clock` atau `RefreshCw` dari lucide-react
   - **Judul:** `Auto Accept Order`
   - **Gradient header:** warna yang berbeda dari WA (primary) dan COD (success), misalnya amber/warning
   - **Badge status:** Aktif / Nonaktif (pola sama dengan existing)
   - **Deskripsi:** "Order dari customer app yang masih dalam status Diajukan selama lebih dari 24 jam sejak dibuat akan diterima otomatis oleh sistem."
   - **Toggle:** `ToggleSwitch` dengan `onChange => handleToggle('auto_accept_order', checked)`

3. Tambahkan poin catatan penting:
   - "Hanya berlaku untuk order dari aplikasi customer."
   - "Order self drop-off tidak terpengaruh."
   - "Riwayat order akan menampilkan perubahan sebagai 'Sistem otomatis'."
   - "Menonaktifkan fitur ini tidak mengembalikan order yang sudah terlanjur diterima otomatis."

4. Letakkan Card ini setelah Card COD, sebelum section "Informasi Penting".

#### [MODIFY] TypeScript Types (`resources/js/types/outlet.ts` atau setara)

Pastikan tipe mendukung:

```ts
outletSettings?: Array<{
  id: number;
  outlet_id: number;
  setting_id: number;
  value: string;
  setting?: {
    id: number;
    key: string;
    name: string;
    description?: string | null;
  };
}>;
```

---

## Urutan Implementasi

1. **[DB]** Migration: seed setting `auto_accept_order` ke tabel `settings`
2. **[DB]** Migration: alter `order_status_histories` (actor_type, actor_label, nullable employee_id)
3. **[BE]** Update `OrderStatusHistory` model (fillable, konstanta, logSystemStatusChange)
4. **[BE]** Fix bug `OutletSettingService::setValue()` ← **prioritas tinggi**
5. **[BE]** Tambah `isAutoAcceptOrderEnabled()` ke `OutletSettingService`
6. **[BE]** Update `OrderObserver::logStatusHistory()` untuk flag auto accept
7. **[BE]** Buat `AutoAcceptOrderService`
8. **[BE]** Buat `AutoAcceptOrders` Artisan command
9. **[BE]** Daftarkan command ke scheduler di `routes/console.php`
10. **[BE]** Update `OutletController::show()` untuk load `outletSettings.setting`
11. **[BE]** Tambah `actor_type` dan `actor_label` ke API resource status history
12. **[FE]** Update TypeScript types jika belum sesuai
13. **[FE]** Tambahkan Card Auto Accept Order di `OutletSettingsTab.tsx`

---

## Aturan Bisnis yang Harus Dijaga

| Aturan | Detail |
|--------|--------|
| Default nonaktif | Setting hanya aktif jika owner mengaktifkan. Outlet existing dan baru tidak terpengaruh tanpa keputusan owner. |
| Hanya `source = 'customer_app'` | Order dari cashier/POS tidak boleh diproses. |
| Hanya status `requested` | Order `pending_dropoff`, `accepted`, atau status lain tidak diproses. |
| Batas 24 jam dari `created_at` | Gunakan `created_at <= now()->subHours(24)`, bukan `pickup_schedule`. |
| Isolasi per outlet | Query per-outlet. Setting outlet A tidak memengaruhi order outlet B. |
| Idempotent | Order yang sudah bukan `requested` tidak diproses ulang. |
| Konsekuensi setara accept manual | Dispatch event dan job yang sama: CustomerOrderAccepted, SendCustomerOrderAcceptedFcm, SendCourierNewPickupNotification, WA notification. |
| Kegagalan notifikasi tidak ambiguous | Status order tetap `accepted` meskipun notifikasi gagal. |
| Audit jelas | `actor_type = 'system'`, `actor_label = 'Sistem otomatis'`, `employee_id = null`. |
| Perubahan setting real-time | Setting dicek saat evaluasi. Setting yang baru diaktifkan dapat memproses order lama yang masih `requested` — sesuai aturan bisnis. |
| Tidak rollback | Menonaktifkan setting tidak mengubah kembali order yang sudah auto accepted. |

---

## Edge Cases yang Harus Dicover

| Edge Case | Penanganan |
|-----------|------------|
| Setting nonaktif saat evaluasi | Skip outlet tersebut. |
| Order sudah berubah status sebelum 24 jam | Filter `status = 'requested'` mengecualikan ini secara natural. |
| Order `pending_dropoff` | Tidak masuk query karena filter `status = 'requested'`. |
| Evaluasi berjalan berulang | Idempotent — setelah status berubah, tidak masuk filter lagi. |
| Notifikasi gagal | Try-catch terpisah per notifikasi, status tidak rollback. |
| Employee_id null di history | Diizinkan setelah migration nullable. |
| Setting diaktifkan setelah order berumur >24 jam dan masih `requested` | Diproses di evaluasi berikutnya — sesuai aturan bisnis. |
| Setting dimatikan setelah order dibuat tapi belum 24 jam | Order tidak diproses karena setting nonaktif saat evaluasi. |

---

## Rencana Verifikasi

### Test Skenario (Manual via Artisan)

```bash
php artisan orders:auto-accept
```

| # | Kondisi | Hasil Diharapkan |
|---|---------|-----------------|
| 1 | Outlet tanpa setting auto accept | Tidak ada order diproses |
| 2 | Outlet setting aktif, order `requested` < 24 jam | Tidak diproses |
| 3 | Outlet setting aktif, order `requested` >= 24 jam | Status → `accepted` |
| 4 | Outlet setting aktif, order `pending_dropoff` >= 24 jam | Tidak diproses |
| 5 | Order sudah `accepted` sebelumnya | Tidak diproses ulang |
| 6 | Evaluasi dijalankan dua kali berturut-turut | Idempotent, tidak duplikasi |
| 7 | Status history setelah auto accept | `actor_type = 'system'`, `employee_id = null` |
| 8 | Order outlet A vs setting outlet B | Terisolasi |

### Manual QA

1. **Owner:** Tab Pengaturan → Card Auto Accept Order terlihat → toggle aktif/nonaktif.
2. **Cashier:** Setelah auto accept → order tidak muncul di daftar `requested` → count berkurang.
3. **Customer:** Status order berubah ke accepted → notifikasi FCM diterima.
4. **Audit:** Riwayat order menampilkan "Sistem otomatis" tanpa nama employee.
5. **Setting nonaktif:** Command dijalankan → order lama tidak diproses.

---

## Catatan Penting untuk Implementor

**[WAJIB — Bug Fix Prioritas Tinggi]**
Perbaiki `OutletSettingService::setValue()` SEBELUM fitur baru. Method ini menggunakan `'key'` sebagai kolom di tabel `outlet_settings`, padahal kolom tersebut tidak ada. Setting yang disimpan melalui toggle di frontend tidak tersimpan dengan benar.

**[WAJIB — Migration Hati-hati]**
Migration `employee_id` nullable harus backward-compatible. Untuk SQLite (dev), `ALTER COLUMN` mungkin tidak didukung langsung — gunakan pendekatan recreate table atau tambah kolom baru saja.

**[PENTING — Jangan Gunakan OrderService::accept()]**
Method tersebut mewajibkan `employeeId`. `AutoAcceptOrderService` harus membuat path sendiri yang mereplikasi logika bisnis accept manual tanpa assignment employee.

**[PENTING — Scope v1]**
`pending_dropoff` tidak masuk scope ini. Filter `status = 'requested'` sudah cukup, tetapi dokumentasikan di kode bahwa `pending_dropoff` secara intentional tidak diproses.

**[NOTE — Setting Key]**
Gunakan key `'auto_accept_order'` (konsisten dengan `'auto_wa_notification'` dan `'cod_enabled'`).

---

## Ringkasan File

### Backend (Laravel)

| File | Status | Keterangan |
|------|--------|------------|
| `database/migrations/YYYY_auto_accept_order_setting_seed.php` | **[NEW]** | Seed data setting ke tabel `settings` |
| `database/migrations/YYYY_alter_order_status_histories_system_actor.php` | **[NEW]** | Tambah `actor_type`, `actor_label`, nullable `employee_id` |
| `app/Models/OrderStatusHistory.php` | **[MODIFY]** | Fillable, konstanta, logSystemStatusChange() |
| `app/Services/OutletSettingService.php` | **[MODIFY]** | Fix bug setValue(), tambah isAutoAcceptOrderEnabled() |
| `app/Observers/OrderObserver.php` | **[MODIFY]** | Dukung flag auto accept untuk routing logging |
| `app/Services/AutoAcceptOrderService.php` | **[NEW]** | Service utama evaluasi dan eksekusi auto accept |
| `app/Console/Commands/AutoAcceptOrders.php` | **[NEW]** | Artisan command `orders:auto-accept` |
| `routes/console.php` | **[MODIFY]** | Daftarkan command ke scheduler |
| `app/Http/Controllers/Web/OutletController.php` | **[MODIFY]** | Load `outletSettings.setting` di `show()` |
| API Resource status history | **[MODIFY]** | Tambah `actor_type`, `actor_label` ke response |

### Frontend (React/TypeScript)

| File | Status | Keterangan |
|------|--------|------------|
| `resources/js/Pages/Dashboard/Outlets/Partials/OutletSettingsTab.tsx` | **[MODIFY]** | Tambah Card Auto Accept Order |
| TypeScript types (`outlet.ts` atau setara) | **[MODIFY]** | Pastikan tipe `OutletSetting.setting` sudah benar |
