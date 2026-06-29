# Implementation Plan: Konsolidasi Migration untuk Production Fresh Install

**Referensi User Need:** [`production_migration_consolidation_user_need.md`](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/docs/user_need/production_migration_consolidation_user_need.md)

**Tanggal:** 2026-06-16

---

## 1. Ringkasan

Project akan masuk production dengan database kosong. Migration folder berisi 99 file, termasuk 18 migration `Schema::table` historis, 3 migration seed data, beberapa migration raw SQL, dan pasangan create/drop tabel obsolete. Tujuan plan ini adalah mengkonsolidasikan semua perubahan historis ke migration `create_*_table` masing-masing, menghapus migration redundant, memindahkan seed data ke seeder, dan memastikan `php artisan migrate:fresh --seed` berjalan bersih tanpa error.

---

## 2. Keputusan Desain

| # | Topik | Keputusan |
|---|-------|-----------|
| D1 | Database production target | MySQL/MariaDB. Test memakai SQLite in-memory (phpunit.xml: `DB_CONNECTION=sqlite`, `DB_DATABASE=:memory:`) |
| D2 | Kolom enum vs string | Semua kolom `enum` yang sering berubah (`pricing_method`, `merchant_subsidy_type`, `status` order) **diganti menjadi `string`** agar tidak perlu raw SQL migration di masa depan dan kompatibel dengan SQLite test |
| D3 | `courier_pricing_zones.location_type` | **Tidak perlu mendukung `regency`**. Schema final memakai `string` dengan nilai `district` dan `village` (sesuai service saat ini) |
| D4 | `position_roles` | **Obsolete dan aman dihapus**. Tidak ada referensi di model, service, controller, factory, seeder, atau frontend. Migration create dan drop keduanya dihapus |
| D5 | Tabel `withdrawals` lama | **Dipertahankan**. Model `Withdrawal` masih dipakai oleh `AppServiceProvider` (morph map `'withdrawal' => Withdrawal::class`) dan referenced di beberapa service. Tabel `withdrawals` tetap ada |
| D6 | Data setting default | Semua setting (termasuk auto accept) dipindahkan ke `SettingSeeder` yang sudah ada. Tidak perlu seeder baru terpisah |
| D7 | Field `day_of_week` di `courier_schedules` | **Dipertahankan** sebagai fallback compatibility. Tidak ada referensi code yang menghapusnya |
| D8 | Urutan timestamp migration | Timestamp existing dipertahankan. Tidak ada perubahan urutan karena foreign key dependency sudah valid |
| D9 | `settings` table | Sudah memiliki `key`, `name`, `description` dari create table asal — migration add_name_and_description merupakan **no-op yang bisa langsung dihapus** |
| D10 | Backup sebelum hapus | Implementer wajib membuat **branch baru** sebelum memulai konsolidasi |

---

## 3. Audit Migration: Mapping Konsolidasi

### 3.1 Migration yang Harus DIHAPUS (setelah dikonsolidasikan)

| # | File Migration (dihapus) | Konsolidasi ke |
|---|--------------------------|----------------|
| 1 | `2026_05_09_123428_add_name_and_description_to_settings_table.php` | Tidak perlu dikonsolidasi — `create_settings_table` sudah punya `name` dan `description`. Hapus saja file ini |
| 2 | `2026_05_15_045300_add_location_fields_to_customer_addresses_table.php` | `2025_10_05_163000_create_customer_addresses_table.php` |
| 3 | `2026_05_15_045343_alter_courier_pricing_zones_location_type.php` | `2026_05_09_000003_create_courier_pricing_zones_table.php` |
| 4 | `2026_05_15_101137_change_location_id_to_string_in_courier_pricing_zones_table.php` | `2026_05_09_000003_create_courier_pricing_zones_table.php` |
| 5 | `2026_05_15_111806_add_disabled_days_to_courier_settings_table.php` | **Hapus saja** — field ini kemudian di-drop. Tidak perlu ada di schema final |
| 6 | `2026_05_18_030945_rename_hybrid_to_tiered_in_courier_settings.php` | `2026_04_29_164242_create_courier_settings_table.php` (nilai enum/string final sudah `tiered`, bukan `hybrid`) |
| 7 | `2026_05_12_082830_alter_courier_settings_enum_columns.php` | `2026_04_29_164242_create_courier_settings_table.php` (schema final langsung string) |
| 8 | `2026_05_20_182158_add_operational_day_id_to_courier_schedules.php` | `2026_04_29_164336_create_courier_schedules_table.php` |
| 9 | `2026_05_20_182201_remove_disabled_days_from_courier_settings.php` | **Hapus saja** — tidak ada yang perlu dilakukan di schema final |
| 10 | `2026_05_22_070003_add_is_courier_enabled_to_courier_settings_table.php` | `2026_04_29_164242_create_courier_settings_table.php` |
| 11 | `2026_05_22_123000_convert_courier_settings_enum_to_string_for_sqlite.php` | `2026_04_29_164242_create_courier_settings_table.php` (schema final langsung string, no raw SQL needed) |
| 12 | `2026_05_25_000001_add_slug_and_is_default_to_positions_table.php` | `2025_10_05_030955_create_positions_table.php` |
| 13 | `2026_05_25_000003_add_unique_to_employee_positions.php` | `2025_10_06_033129_create_employee_positions_table.php` |
| 14 | `2026_05_25_000004_drop_position_roles_table.php` | **Hapus** bersama `2025_10_06_033140_create_position_roles_table.php` |
| 15 | `2025_10_06_033140_create_position_roles_table.php` | **Hapus** (obsolete — drop dilakukan di migration #14 di atas) |
| 16 | `2026_05_29_000000_add_supports_courier_to_laundry_services_table.php` | `2025_10_05_155510_create_laundry_services_table.php` |
| 17 | `2026_05_29_143246_add_pending_dropoff_status_to_orders_table.php` | `2025_10_05_165703_create_orders_table.php` |
| 18 | `2026_05_29_151708_add_timezone_to_outlets_table.php` | `2025_10_04_032435_create_outlets_table.php` |
| 19 | `2026_05_30_000001_add_wallet_balance_to_users_table.php` | `0001_01_01_000000_create_users_table.php` |
| 20 | `2026_06_06_000001_add_unconditional_free_shipping_to_courier_settings.php` | `2026_04_29_164242_create_courier_settings_table.php` |
| 21 | `2026_06_06_000002_add_default_price_to_courier_settings.php` | `2026_04_29_164242_create_courier_settings_table.php` |
| 22 | `2026_06_12_000001_add_device_id_to_employee_device_tokens_table.php` | `2026_06_11_000001_create_employee_device_tokens_table.php` |
| 23 | `2026_06_13_000002_alter_order_status_histories_system_actor.php` | `2025_11_08_023312_create_order_status_histories_table.php` |
| 24 | `2026_06_13_000001_seed_auto_accept_order_setting.php` | **Pindahkan ke `SettingSeeder`**, lalu hapus file ini |
| 25 | `2026_06_16_000001_seed_auto_accept_lead_time_setting.php` | **Pindahkan ke `SettingSeeder`**, lalu hapus file ini |
| 26 | `2026_06_16_000002_seed_auto_accept_max_distance_setting.php` | **Pindahkan ke `SettingSeeder`**, lalu hapus file ini |

**Total migration yang dihapus: 26 file** (dari 99 → tersisa 73 file)

---

## 4. Perubahan Detail per File Create Table

### 4.1 `0001_01_01_000000_create_users_table.php`

**Tambahkan field:**
```php
$table->decimal('wallet_balance', 15, 2)->default(0.00)->after('reward_balance');
```

**Sumber:** `2026_05_30_000001_add_wallet_balance_to_users_table.php`

---

### 4.2 `2025_10_04_032435_create_outlets_table.php`

**Tambahkan field:**
```php
$table->string('timezone')->default('Asia/Jakarta')->after('coin_balance');
```

**Sumber:** `2026_05_29_151708_add_timezone_to_outlets_table.php`

---

### 4.3 `2025_10_05_030955_create_positions_table.php`

**Tambahkan field dan index:**
```php
$table->string('slug')->nullable()->after('name');
$table->boolean('is_default')->default(false)->after('is_active');
$table->index('slug');
```

**Sumber:** `2026_05_25_000001_add_slug_and_is_default_to_positions_table.php`

---

### 4.4 `2025_10_06_033129_create_employee_positions_table.php`

**Tambahkan unique constraint:**
```php
$table->unique(['employee_id', 'position_id']);
```

**Sumber:** `2026_05_25_000003_add_unique_to_employee_positions.php`

---

### 4.5 `2025_10_05_163000_create_customer_addresses_table.php`

**Tambahkan field lokasi:**
```php
$table->string('province_id')->nullable()->after('street');
$table->string('regency_id')->nullable()->after('province_id');
$table->string('district_id')->nullable()->after('regency_id');
$table->string('village_id')->nullable()->after('district_id');
$table->string('province_name')->nullable()->after('village_id');
$table->string('regency_name')->nullable()->after('province_name');
$table->string('district_name')->nullable()->after('regency_name');
$table->string('village_name')->nullable()->after('district_name');
```

> [!NOTE]
> Cek field name yang dipakai model `CustomerAddress` untuk memastikan urutan dan nama field konsisten. Sesuaikan dengan `$fillable` model.

**Sumber:** `2026_05_15_045300_add_location_fields_to_customer_addresses_table.php`

---

### 4.6 `2025_10_05_155510_create_laundry_services_table.php`

**Tambahkan field:**
```php
$table->boolean('supports_courier')->default(false)->after('is_active');
```

**Sumber:** `2026_05_29_000000_add_supports_courier_to_laundry_services_table.php`

---

### 4.7 `2025_10_05_165703_create_orders_table.php`

**Perubahan — Tambah status `picked_up` dan `pending_dropoff`, ubah enum ke string:**

Create table awal tidak punya `picked_up` dan `pending_dropoff`. Migration alter untuk `pending_dropoff` sudah menangani SQLite dengan cara mengubah ke string. Schema final langsung pakai string.

```php
// SEBELUM (enum, tidak lengkap):
$table->enum('status', [
    'requested', 'cancelled', 'accepted', 'rejected',
    'picking_up', 'received', 'weighing', 'ready_to_process',
    'in_progress', 'ready', 'delivering', 'delivered', 'completed'
])->default('ready_to_process');

// SESUDAH (string — lebih maintainable, kompatibel SQLite, mencakup semua status):
$table->string('status')->default('ready_to_process');
```

Semua status yang harus didukung (dari `Order::STATUS_*` constants):
`requested`, `cancelled`, `accepted`, `rejected`, `picking_up`, `picked_up`, `received`, `weighing`, `ready_to_process`, `in_progress`, `ready`, `delivering`, `delivered`, `completed`, `pending_dropoff`

> [!NOTE]
> Dengan string, semua status di atas otomatis didukung tanpa perlu update migration jika ada status baru ke depannya.

**Sumber:** `2026_05_29_143246_add_pending_dropoff_status_to_orders_table.php`

---

### 4.8 `2025_11_08_023312_create_order_status_histories_table.php`

**Perubahan yang diperlukan:**

1. Jadikan `employee_id` **nullable** (untuk mendukung system actor):
```php
// SEBELUM:
$table->foreignId('employee_id')->constrained('employees')->onDelete('restrict');

// SESUDAH:
$table->foreignId('employee_id')->nullable()->constrained('employees')->onDelete('restrict');
```

2. Tambahkan field untuk system actor:
```php
$table->string('actor_type')->default('employee')->after('employee_id');
$table->string('actor_label')->nullable()->after('actor_type');
```

**Sumber:** `2026_06_13_000002_alter_order_status_histories_system_actor.php`

---

### 4.9 `2026_04_29_164242_create_courier_settings_table.php`

Ini adalah migration yang paling banyak perubahan. Schema final harus:

1. **Ganti `pricing_method` dari enum ke string** dengan nilai final yang sudah terverifikasi dari migration:
```php
// SEBELUM (enum lama dengan nilai legacy):
$table->enum('pricing_method', [
    'flat', 'free_radius_flat', 'base_per_km', 'tiered',
    'progressive', 'base_per_km_free_radius', 'zone_based'
])->default('flat');

// SESUDAH (string, nilai final yang dipakai aplikasi):
$table->string('pricing_method')->default('flat_rate');
```

> [!NOTE]
> Nilai `pricing_method` final yang dipakai aplikasi (berdasarkan `alter_courier_settings_enum_columns.php` dan `convert_courier_settings_enum_to_string_for_sqlite.php`): `flat_rate`, `distance_based`, `zone_based`, `tiered`. Default adalah `flat_rate`.

2. **Ganti `merchant_subsidy_type` dari enum ke string:**
```php
// SEBELUM (enum):
$table->enum('merchant_subsidy_type', ['fixed', 'percentage'])->default('fixed');

// SESUDAH (string, nilai final yang terverifikasi dari migration):
$table->string('merchant_subsidy_type')->default('fixed_amount');
```

> [!NOTE]
> Nilai `merchant_subsidy_type` final: `fixed_amount` dan `percentage`. Default adalah `fixed_amount` (migration alter mengubah dari `fixed` ke `fixed_amount`).

3. **Hapus `disabled_days`** — field ini ditambahkan lalu dihapus, tidak ada di schema final.

4. **Tambahkan field yang hilang (posisi sesuai migration alter):**
```php
// is_courier_enabled — posisi after outlet_id (migration: add_is_courier_enabled)
$table->boolean('is_courier_enabled')->default(true)->after('outlet_id');

// default_price — posisi after per_km_fee (migration: add_default_price)
$table->decimal('default_price', 15, 2)->default(0)->after('per_km_fee');

// unconditional_free_shipping_enabled — posisi after min_order_free_shipping (migration: add_unconditional_free_shipping)
$table->boolean('unconditional_free_shipping_enabled')->default(false)->after('min_order_free_shipping');
```

**Schema final `courier_settings` setelah semua perubahan** (field yang ada dan posisinya):
```
id, outlet_id, is_courier_enabled, pickup_fee, delivery_fee, pricing_method(string),
flat_fee, base_fee, per_km_fee, default_price, free_radius_km, min_fee, max_fee, max_distance_km,
surge_enabled, surge_multiplier, night_surcharge, night_start_time, night_end_time,
weekend_surcharge, merchant_subsidy, merchant_subsidy_type(string),
free_shipping_enabled, min_order_free_shipping, unconditional_free_shipping_enabled,
created_at, updated_at
```
(Field `disabled_days` TIDAK ada di schema final)

**Sumber:** Multiple — `alter_courier_settings_enum_columns`, `rename_hybrid_to_tiered`, `add_disabled_days`, `remove_disabled_days`, `add_is_courier_enabled`, `convert_enum_to_string_for_sqlite`, `add_unconditional_free_shipping`, `add_default_price`

---

### 4.10 `2026_04_29_164336_create_courier_schedules_table.php`

**Tambahkan `operational_day_id` nullable:**
```php
$table->foreignId('operational_day_id')
    ->nullable()
    ->constrained('operational_days')
    ->onDelete('set null')
    ->after('outlet_id');
```

> [!NOTE]
> Perhatikan bahwa migration alter lama memiliki backfill data SQL — hal ini **tidak diperlukan** untuk database kosong. Cukup tambahkan kolom nullable langsung ke create table.

**Sumber:** `2026_05_20_182158_add_operational_day_id_to_courier_schedules.php`

---

### 4.11 `2026_05_09_000003_create_courier_pricing_zones_table.php`

**Schema final:**
```php
Schema::create('courier_pricing_zones', function (Blueprint $table) {
    $table->id();
    $table->foreignId('courier_setting_id')->constrained('courier_settings')->onDelete('cascade');
    $table->string('location_type');              // string, nilai: 'district', 'village'
    $table->string('location_id');                // string (bukan integer)
    $table->string('parent_district_id')->nullable(); // tambahan dari alter
    $table->string('location_name');
    $table->decimal('fee', 15, 2);
    $table->integer('sort_order')->default(0);
    $table->timestamps();
});
```

> [!IMPORTANT]
> Cek apakah `parent_district_id` ada di model `CourierPricingZone`. Jika tidak, jangan tambahkan. Implementer wajib verifikasi field exact dari `$fillable` model.

**Sumber:** `alter_courier_pricing_zones_location_type` + `change_location_id_to_string`

---

### 4.12 `2026_06_11_000001_create_employee_device_tokens_table.php`

**Schema final:**
```php
Schema::create('employee_device_tokens', function (Blueprint $table) {
    $table->id();
    $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
    $table->string('token', 512)->unique();   // panjang 512
    $table->string('device_id')->nullable();  // tambahan
    $table->string('device_name')->nullable();
    $table->timestamp('last_used_at')->nullable();
    $table->timestamps();

    $table->index('employee_id');
    $table->index(['employee_id', 'device_id']); // composite index
});
```

**Sumber:** `2026_06_12_000001_add_device_id_to_employee_device_tokens_table.php`

---

## 5. Perubahan Seeder

### 5.1 `database/seeders/SettingSeeder.php` — [MODIFY]

Tambahkan 3 setting auto accept yang saat ini ada di migration seed:

```php
// Setting yang sudah ada (pertahankan):
// - auto_wa_notification
// - cod_enabled

// Setting yang dipindahkan dari migration (tambahkan — nilai exact dari migration seed):
[
    'key'         => 'auto_accept_order',
    'name'        => 'Auto Accept Order',
    'description' => 'Order dari customer-app dengan status requested yang tidak berubah selama 24 jam sejak dibuat akan diterima otomatis.',
],
[
    'key'         => 'auto_accept_lead_time_minutes',
    'name'        => 'Lead Time Auto Accept Order (Menit)',
    'description' => 'Jumlah menit sebelum jadwal pickup kurir untuk mulai auto accept. Nilai 0 berarti tidak menggunakan lead time pickup (fallback ke 24 jam).',
],
[
    'key'         => 'auto_accept_max_distance_km',
    'name'        => 'Batas Maksimal Jarak Auto Accept Order (KM)',
    'description' => 'Jarak maksimal dalam km antara alamat pickup customer dan outlet agar order boleh auto accepted. Nilai 0 berarti tidak ada batas jarak.',
],
```

> [!IMPORTANT]
> Cek nilai `value` dari ketiga migration seed (`seed_auto_accept_order_setting.php`, `seed_auto_accept_lead_time_setting.php`, `seed_auto_accept_max_distance_setting.php`) sebelum menghapus file tersebut. Salin nilai persis ke seeder.

> [!NOTE]
> Seeder sudah menggunakan `updateOrCreate` sehingga idempotent. Tidak perlu mengubah pattern ini.

---

## 6. Daftar Lengkap File yang Dimodifikasi / Dihapus

### Migration yang DIMODIFIKASI (create table)

| File | Perubahan |
|------|-----------|
| [`0001_01_01_000000_create_users_table.php`](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/database/migrations/0001_01_01_000000_create_users_table.php) | Tambah `wallet_balance` |
| [`2025_10_04_032435_create_outlets_table.php`](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/database/migrations/2025_10_04_032435_create_outlets_table.php) | Tambah `timezone` |
| [`2025_10_05_030955_create_positions_table.php`](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/database/migrations/2025_10_05_030955_create_positions_table.php) | Tambah `slug`, `is_default`, index `slug` |
| [`2025_10_06_033129_create_employee_positions_table.php`](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/database/migrations/2025_10_06_033129_create_employee_positions_table.php) | Tambah unique constraint `employee_id`+`position_id` |
| [`2025_10_05_163000_create_customer_addresses_table.php`](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/database/migrations/2025_10_05_163000_create_customer_addresses_table.php) | Tambah 8 field lokasi |
| [`2025_10_05_155510_create_laundry_services_table.php`](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/database/migrations/2025_10_05_155510_create_laundry_services_table.php) | Tambah `supports_courier` |
| [`2025_10_05_165703_create_orders_table.php`](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/database/migrations/2025_10_05_165703_create_orders_table.php) | Ubah `status` dari `enum` ke `string` (tambah `picked_up`, `pending_dropoff`) |
| [`2025_11_08_023312_create_order_status_histories_table.php`](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/database/migrations/2025_11_08_023312_create_order_status_histories_table.php) | `employee_id` nullable, tambah `actor_type`, `actor_label` |
| [`2026_04_29_164242_create_courier_settings_table.php`](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/database/migrations/2026_04_29_164242_create_courier_settings_table.php) | Ganti enum ke string, hapus `disabled_days`, tambah `is_courier_enabled`, `unconditional_free_shipping_enabled`, `default_price` |
| [`2026_04_29_164336_create_courier_schedules_table.php`](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/database/migrations/2026_04_29_164336_create_courier_schedules_table.php) | Tambah `operational_day_id` nullable FK ke `operational_days` |
| [`2026_05_09_000003_create_courier_pricing_zones_table.php`](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/database/migrations/2026_05_09_000003_create_courier_pricing_zones_table.php) | Ubah `location_type` ke `string`, `location_id` ke `string`, tambah `parent_district_id` nullable |
| [`2026_06_11_000001_create_employee_device_tokens_table.php`](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/database/migrations/2026_06_11_000001_create_employee_device_tokens_table.php) | Ubah `token` ke panjang 512, tambah `device_id`, composite index |

### Seeder yang DIMODIFIKASI

| File | Perubahan |
|------|-----------|
| [`database/seeders/SettingSeeder.php`](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/database/seeders/SettingSeeder.php) | Tambah 3 setting auto accept |

### Migration yang DIHAPUS (26 file)

```
database/migrations/
├── 2026_05_09_123428_add_name_and_description_to_settings_table.php
├── 2026_05_15_045300_add_location_fields_to_customer_addresses_table.php
├── 2026_05_15_045343_alter_courier_pricing_zones_location_type.php
├── 2026_05_15_101137_change_location_id_to_string_in_courier_pricing_zones_table.php
├── 2026_05_15_111806_add_disabled_days_to_courier_settings_table.php
├── 2026_05_18_030945_rename_hybrid_to_tiered_in_courier_settings.php
├── 2026_05_12_082830_alter_courier_settings_enum_columns.php
├── 2026_05_20_182158_add_operational_day_id_to_courier_schedules.php
├── 2026_05_20_182201_remove_disabled_days_from_courier_settings.php
├── 2026_05_22_070003_add_is_courier_enabled_to_courier_settings_table.php
├── 2026_05_22_123000_convert_courier_settings_enum_to_string_for_sqlite.php
├── 2026_05_25_000001_add_slug_and_is_default_to_positions_table.php
├── 2026_05_25_000003_add_unique_to_employee_positions.php
├── 2026_05_25_000004_drop_position_roles_table.php    ← drop obsolete
├── 2025_10_06_033140_create_position_roles_table.php  ← create obsolete
├── 2026_05_29_000000_add_supports_courier_to_laundry_services_table.php
├── 2026_05_29_143246_add_pending_dropoff_status_to_orders_table.php
├── 2026_05_29_151708_add_timezone_to_outlets_table.php
├── 2026_05_30_000001_add_wallet_balance_to_users_table.php
├── 2026_06_06_000001_add_unconditional_free_shipping_to_courier_settings.php
├── 2026_06_06_000002_add_default_price_to_courier_settings.php
├── 2026_06_12_000001_add_device_id_to_employee_device_tokens_table.php
├── 2026_06_13_000002_alter_order_status_histories_system_actor.php
├── 2026_06_13_000001_seed_auto_accept_order_setting.php
├── 2026_06_16_000001_seed_auto_accept_lead_time_setting.php
└── 2026_06_16_000002_seed_auto_accept_max_distance_setting.php
```

---

## 7. Urutan Pengerjaan

> [!CAUTION]
> Buat branch baru sebelum memulai. Jangan kerjakan langsung di branch utama.

### Step 1 — Persiapan

```bash
git checkout -b feat/migration-consolidation
```

### Step 2 — Update SettingSeeder

1. Buka ketiga file migration seed:
   - `2026_06_13_000001_seed_auto_accept_order_setting.php`
   - `2026_06_16_000001_seed_auto_accept_lead_time_setting.php`
   - `2026_06_16_000002_seed_auto_accept_max_distance_setting.php`
2. Salin nilai (`key`, `name`, `description`, `value` jika ada) ke `SettingSeeder.php`.
3. Jangan hapus file migration seed dulu.

### Step 3 — Modifikasi Create Table Migrations (urutan yang direkomendasikan)

Kerjakan satu per satu untuk mengurangi risiko konflik:

1. `create_users_table.php` — tambah `wallet_balance`
2. `create_outlets_table.php` — tambah `timezone`
3. `create_positions_table.php` — tambah `slug`, `is_default`
4. `create_employee_positions_table.php` — tambah unique constraint
5. `create_customer_addresses_table.php` — tambah 8 field lokasi
6. `create_laundry_services_table.php` — tambah `supports_courier`
7. `create_orders_table.php` — ubah `status` enum ke string, tambah status yang kurang
8. `create_order_status_histories_table.php` — nullable `employee_id`, tambah `actor_type`, `actor_label`
9. `create_courier_settings_table.php` — perubahan terbesar (enum → string, tambah field, hapus `disabled_days`)
10. `create_courier_schedules_table.php` — tambah `operational_day_id`
11. `create_courier_pricing_zones_table.php` — ubah `location_type` dan `location_id`
12. `create_employee_device_tokens_table.php` — ubah token length, tambah `device_id`

### Step 4 — Verifikasi Awal (sebelum hapus migration)

```bash
php artisan migrate:fresh
```

Jika berhasil tanpa error, lanjut ke step 5.

### Step 5 — Hapus Migration Historis

Hapus 26 file migration satu per satu atau sekaligus, setelah yakin create table sudah benar.

```bash
# Contoh (Windows PowerShell):
Remove-Item database/migrations/2026_05_09_123428_add_name_and_description_to_settings_table.php
Remove-Item database/migrations/2026_05_15_045300_add_location_fields_to_customer_addresses_table.php
# ... dst untuk semua 26 file
```

### Step 6 — Verifikasi Final

```bash
php artisan migrate:fresh
php artisan migrate:fresh --seed
```

Pastikan keduanya berjalan tanpa error.

### Step 7 — Jalankan Test

```bash
php artisan test
# atau
./vendor/bin/pest
```

---

## 8. Checklist Verifikasi Implementer

Setelah selesai, verifikasi checklist berikut:

### Schema Integrity

- [ ] `users` memiliki `wallet_balance`
- [ ] `outlets` memiliki `timezone` dengan default `Asia/Jakarta`
- [ ] `positions` memiliki `slug` dan `is_default`
- [ ] `employee_positions` memiliki unique constraint `(employee_id, position_id)`
- [ ] `customer_addresses` memiliki 8 field lokasi (`province_id`, `regency_id`, `district_id`, `village_id`, `*_name`)
- [ ] `laundry_services` memiliki `supports_courier`
- [ ] `orders.status` adalah string dan mencakup semua status termasuk `picked_up` dan `pending_dropoff`
- [ ] `order_status_histories` memiliki `employee_id nullable`, `actor_type`, `actor_label`
- [ ] `courier_settings` memiliki `is_courier_enabled`, `unconditional_free_shipping_enabled`, `default_price`
- [ ] `courier_settings` tidak memiliki `disabled_days`
- [ ] `courier_settings.pricing_method` dan `merchant_subsidy_type` adalah string (bukan enum)
- [ ] `courier_schedules` memiliki `operational_day_id` nullable
- [ ] `courier_pricing_zones.location_type` adalah string (bukan enum)
- [ ] `courier_pricing_zones.location_id` adalah string (bukan integer)
- [ ] `employee_device_tokens` memiliki `device_id` dan `token` panjang 512
- [ ] Tabel `position_roles` TIDAK ada
- [ ] Tabel `settings` memiliki `key`, `name`, `description`

### Seeder

- [ ] `SettingSeeder` mencakup `auto_wa_notification`, `cod_enabled`, `auto_accept_order`, `auto_accept_lead_time_minutes`, `auto_accept_max_distance_km`
- [ ] `DatabaseSeeder` masih memanggil `SettingSeeder`
- [ ] Seeder idempotent (menggunakan `updateOrCreate`)

### Migration Cleanup

- [ ] Tidak ada lagi migration `Schema::table` untuk alter historis yang sudah dikonsolidasikan
- [ ] Tidak ada migration raw SQL enum conversion
- [ ] Tidak ada migration yang hanya seed data setting
- [ ] Tidak ada pasangan create+drop tabel `position_roles`

### Eksekusi

- [ ] `php artisan migrate:fresh` — PASS tanpa error
- [ ] `php artisan migrate:fresh --seed` — PASS tanpa error
- [ ] `php artisan test` (atau `./vendor/bin/pest`) — PASS

### Pencarian Residual (jalankan setelah cleanup)

```bash
# Tidak boleh ada hasil:
grep -r "Schema::table" database/migrations/
grep -r "dropColumn\|->change()" database/migrations/
grep -r "DB::statement\|DB::unprepared" database/migrations/
grep -r "Setting::create\|Setting::insert\|DB::table('settings')" database/migrations/
```

---

## 9. Catatan Penting untuk Implementer

> [!WARNING]
> **`courier_settings` — Verifikasi Nilai Enum Final**
> Sebelum menulis schema final, buka `app/Models/CourierSetting.php` dan `app/Services/CourierPricingEngine.php`. Catat semua nilai `pricing_method` yang dipakai. Nilai yang diketahui adalah `flat_rate`, `distance_based`, `zone_based`, `tiered` — tapi harus diverifikasi dari kode aktual.

> [!WARNING]
> **`orders.status` — Verifikasi Semua Status**
> Buka `app/Models/Order.php` dan catat semua konstanta `STATUS_*`. Pastikan semua nilai tersebut masuk ke schema final. Status yang diketahui kurang dari create table awal adalah `picked_up` dan `pending_dropoff`.

> [!IMPORTANT]
> **`courier_pricing_zones.parent_district_id`**
> Field `parent_district_id` mungkin ada di schema alter tapi belum tentu ada di model. Periksa `app/Models/CourierPricingZone.php` dan `$fillable`. Jika field tidak dipakai model, jangan tambahkan ke create table final.

> [!NOTE]
> **Tabel `withdrawals` tetap dipertahankan**
> Model `Withdrawal` masih di-register di morph map `AppServiceProvider` dan dipakai oleh beberapa service. Jangan hapus migration `create_withdrawals_table.php`.

> [!NOTE]
> **Test menggunakan SQLite in-memory**
> Dengan mengubah enum ke string, test SQLite tidak perlu workaround khusus lagi. `convert_courier_settings_enum_to_string_for_sqlite.php` sudah tidak diperlukan.

---

## 10. Acceptance Criteria

- [ ] `php artisan migrate:fresh` selesai tanpa error
- [ ] `php artisan migrate:fresh --seed` selesai tanpa error
- [ ] `php artisan test` selesai tanpa failure baru
- [ ] Tidak ada kolom yang dipakai aplikasi yang hilang
- [ ] Tidak ada migration `Schema::table` alter historis yang masih berdiri sendiri
- [ ] Tidak ada migration raw SQL enum conversion
- [ ] Tidak ada migration yang meng-insert data setting
- [ ] `SettingSeeder` mencakup semua 5 setting yang dibutuhkan
- [ ] Tabel `position_roles` tidak dibuat lalu di-drop — keduanya tidak ada
- [ ] `git diff --stat` menunjukkan hanya penghapusan migration historis dan modifikasi create table + seeder
