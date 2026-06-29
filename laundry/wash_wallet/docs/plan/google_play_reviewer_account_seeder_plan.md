# Plan: Google Play Reviewer Account Seeder

Tanggal: 2026-06-25
Referensi User Need: `docs/user_need/google_play_reviewer_account_seeder_user_need.md`

---

## Ringkasan

Plan ini mendefinisikan implementasi `GooglePlayReviewerSeeder` yang berjalan di production database secara idempotent, membuat satu tenant demo terisolasi (owner + outlet `GPREVIEW`) lengkap dengan data operasional dummy agar Google Play reviewer dapat menguji ketiga aplikasi WashWallet (Customer, Cashier, Production) tanpa OTP, tanpa menyentuh data nyata, dan dengan credential statis.

Plan ini juga mencakup perbaikan kecil pada UI Customer app untuk menampilkan jalur password login yang lebih mudah ditemukan.

---

## Keputusan Desain

| Poin | Keputusan |
|------|-----------|
| Nama seeder baru | `GooglePlayReviewerSeeder` |
| `ReviewerSeeder.php` lama | Dibiarkan ada tapi tidak dipanggil oleh `DatabaseSeeder` (dead code, boleh dihapus di refactor berikutnya) |
| Identifier owner | `email = googleplay.owner@washwallet.test` |
| Identifier outlet | `code = GPREVIEW` |
| Identifier employee | `username = googleplay.reviewer` |
| Identifier customer | `phone = 081100009001` |
| Env variable password | `GOOGLE_PLAY_REVIEWER_PASSWORD` |
| PIN employee statis | `112233` (hash bcrypt di seeder) |
| Cara membuat posisi | Menggunakan `Position::updateOrCreate` dengan slug stabil + sync permission via `PositionPermission::firstOrCreate` (idempotent manual, tidak memanggil `PositionService::createDefaultPositionsForOutlet` karena service tersebut memerlukan `Auth::user()` yang tidak tersedia di seeder konteks CLI) |
| Password update policy | Seeder hanya meng-update password jika record baru (via `firstOrCreate`). Jika record sudah ada, password tidak direset kecuali ada flag `--force` |
| `DatabaseSeeder` | **Tidak** memanggil `GooglePlayReviewerSeeder` secara otomatis — dijalankan manual dengan `php artisan db:seed --class=GooglePlayReviewerSeeder` |

---

## Catatan Penting untuk AI Implementor

> [!IMPORTANT]
> Seeder harus selalu menggunakan `DB::transaction()` dengan `try/catch`. Jika salah satu langkah gagal, seluruh seeder di-rollback agar database tidak tertinggal dalam keadaan parsial.

> [!IMPORTANT]
> Seeder **tidak boleh** memanggil `Outlet::first()` atau query random. Semua lookup harus menggunakan identifier stabil (code, username, phone, email).

> [!WARNING]
> `PositionService::createDefaultPositionsForOutlet()` memanggil `Auth::id()` di dalam body-nya. Saat seeder berjalan via CLI, `Auth::id()` bernilai `null`. Gunakan Eloquent langsung (`Position::updateOrCreate`, `PositionPermission::firstOrCreate`) untuk membuat posisi dan permission secara idempotent tanpa memanggil service tersebut.

> [!WARNING]
> `LaundryBusinessSeeder` (seeder existing) membuat outlet dan data via `Outlet::create()` tanpa `firstOrCreate`. Seeder reviewer **harus mencari outlet berdasarkan `code = GPREVIEW`** dan tidak bergantung pada urutan seeder atau data yang dibuat seeder lain.

---

## Struktur Perubahan

### Component 1: Backend — Seeder Baru

---

#### [NEW] `GooglePlayReviewerSeeder.php`

Path: `webapp/wash_wallet_be/database/seeders/GooglePlayReviewerSeeder.php`

Seeder ini adalah satu-satunya file PHP baru yang perlu dibuat. Ia harus dijalankan dengan:

```bash
php artisan db:seed --class=GooglePlayReviewerSeeder
```

Seeder ini dijalankan secara manual di production dan tidak termasuk dalam `DatabaseSeeder::run()`.

**Urutan eksekusi dalam seeder:**

**Step 1 — Buat Owner Demo**

```php
$owner = User::firstOrCreate(
    ['email' => 'googleplay.owner@washwallet.test'],
    [
        'name'     => 'Google Play Demo Owner',
        'username' => 'googleplay.owner',
        'password' => Hash::make(env('GOOGLE_PLAY_REVIEWER_PASSWORD', 'DemoPass@2024')),
        'status'   => 'active',
    ]
);

// Assign role 'owner' jika belum punya (via Spatie Permission)
if (!$owner->hasRole('owner')) {
    $owner->assignRole('owner');
}
```

**Step 2 — Buat Outlet Demo**

```php
$outlet = Outlet::firstOrCreate(
    ['code' => 'GPREVIEW'],
    [
        'owner_id'      => $owner->id,
        'name'          => 'WashWallet Demo Outlet - Google Play Review',
        'email'         => 'demo@washwallet.test',
        'phone'         => '021000099001',
        'street'        => 'Jl. Demo WashWallet No. 1, Jakarta Selatan',
        'province_name' => 'DKI Jakarta',
        'city_name'     => 'Jakarta Selatan',
        'district_name' => 'Kebayoran Baru',
        'village_name'  => 'Senayan',
        'latitude'      => -6.2297,
        'longitude'     => 106.8081,
        'status'        => 'active',
        'timezone'      => 'Asia/Jakarta',
    ]
);
```

**Step 3 — Buat Akun COA (Chart of Account) Outlet Demo**

Gunakan `AccountService` yang sudah ada. Sebelum memanggil setiap method, cek apakah account dengan `outlet_id` dan role COA yang sesuai sudah ada. Jika sudah ada, skip. Ini mencegah duplikasi karena `AccountService` mungkin tidak idempotent.

Method yang dipanggil:
```
- AccountService::createCashAccountForOutlet($owner->id, $outlet->id, $outlet->name)
- AccountService::createReceivableAccountForOutlet($owner->id, $outlet->id, $outlet->name)
- AccountService::createLoanAccountForOutlet($owner->id, $outlet->id, $outlet->name)
- AccountService::createFineAccountForOutlet($owner->id, $outlet->id, $outlet->name)
```

> [!NOTE]
> Baca implementasi `AccountService` sebelum memanggil method-nya. Pastikan cara checking idempotent yang tepat sesuai dengan cara AccountService menyimpan data (apakah pakai `firstOrCreate` sendiri atau tidak).

**Step 4 — Buat Operational Days**

```php
foreach (array_keys(OperationalDay::DAYS_OF_WEEK) as $day) {
    OperationalDay::firstOrCreate(
        ['outlet_id' => $outlet->id, 'day_of_week' => $day],
        ['open_time' => '07:00:00', 'close_time' => '21:00:00', 'is_open' => true]
    );
}
```

**Step 5 — Buat Unit (jika belum ada)**

```php
$units = [
    ['name' => 'Kilogram', 'symbol' => 'kg'],
    ['name' => 'Pieces',   'symbol' => 'pcs'],
];
foreach ($units as $u) {
    Unit::firstOrCreate(['symbol' => $u['symbol']], $u);
}
```

**Step 6 — Buat Posisi dan Permission (Idempotent)**

Buat tiga posisi pada outlet demo dengan slug stabil. Untuk setiap posisi, sync permission sesuai `Permission::defaultForSlug()`:

```php
$positionSlugs = [
    ['slug' => 'kasir',    'name' => 'Kasir',    'is_default' => true],
    ['slug' => 'produksi', 'name' => 'Produksi', 'is_default' => false],
    ['slug' => 'kurir',    'name' => 'Kurir',    'is_default' => false],
];

$positions = [];
foreach ($positionSlugs as $posData) {
    $position = Position::updateOrCreate(
        ['outlet_id' => $outlet->id, 'slug' => $posData['slug']],
        [
            'name'       => $posData['name'],
            'is_default' => $posData['is_default'],
            'is_active'  => true,
        ]
    );

    // Sync permission secara idempotent
    $permissionKeys = Permission::defaultForSlug($posData['slug']);
    foreach ($permissionKeys as $key) {
        PositionPermission::firstOrCreate(
            ['position_id' => $position->id, 'permission_key' => $key]
        );
    }

    $positions[$posData['slug']] = $position;
}
```

> [!NOTE]
> Permission yang sudah ada tidak dihapus. Ini mencegah gangguan ke posisi non-demo jika suatu saat outlet demo memiliki posisi tambahan. Permission extra yang tidak ada di default dibiarkan apa adanya.

**Step 7 — Buat Employee Reviewer**

```php
$employee = Employee::firstOrCreate(
    ['username' => 'googleplay.reviewer'],
    [
        'outlet_id'  => $outlet->id,
        'name'       => 'Google Play Reviewer',
        'password'   => Hash::make(env('GOOGLE_PLAY_REVIEWER_PASSWORD', 'DemoPass@2024')),
        'pin_hash'   => Hash::make('112233'),
        'pin_set_at' => now(),
        'phone'      => '081100009002',
        'is_active'  => true,
        'start_date' => now()->toDateString(),
    ]
);

// Update outlet_id dan is_active jika record sudah ada (pastikan tidak drift)
$employee->update([
    'outlet_id' => $outlet->id,
    'is_active' => true,
]);
```

**Step 8 — Assign Employee ke Semua Posisi Demo**

```php
foreach (['kasir', 'produksi', 'kurir'] as $slug) {
    $position = $positions[$slug];
    EmployeePosition::firstOrCreate(
        ['employee_id' => $employee->id, 'position_id' => $position->id],
        ['is_active' => true]
    );
}
```

**Step 9 — Buat CustomerAccount Reviewer**

```php
$customerAccount = CustomerAccount::firstOrCreate(
    ['phone' => '081100009001'],
    [
        'name'            => 'Google Play Reviewer Customer',
        'email'           => 'googleplay.customer@washwallet.test',
        'password'        => Hash::make(env('GOOGLE_PLAY_REVIEWER_PASSWORD', 'DemoPass@2024')),
        'is_verified'     => true,
        'is_active'       => true,
        'deposit_balance' => 150000,
    ]
);

// Pastikan selalu aktif dan verified
$customerAccount->update(['is_verified' => true, 'is_active' => true]);
```

**Step 10 — Buat Customer (relasi ke outlet demo)**

```php
$customer = Customer::firstOrCreate(
    ['outlet_id' => $outlet->id, 'customer_account_id' => $customerAccount->id],
    [
        'name'      => 'Google Play Reviewer Customer',
        'phone'     => '081100009001',
        'email'     => 'googleplay.customer@washwallet.test',
        'is_active' => true,
    ]
);
```

**Step 11 — Buat CustomerAddress (Primary)**

```php
CustomerAddress::firstOrCreate(
    ['customer_account_id' => $customerAccount->id, 'is_primary' => true],
    [
        'label'           => 'Rumah Demo',
        'recipient_name'  => 'Google Play Reviewer',
        'recipient_phone' => '081100009001',
        'street'          => 'Jl. Demo WashWallet No. 100',
        'province_name'   => 'DKI Jakarta',
        'regency_name'    => 'Jakarta Selatan',
        'district_name'   => 'Kebayoran Baru',
        'village_name'    => 'Senayan',
        'latitude'        => -6.2300,
        'longitude'       => 106.8085,
        'is_primary'      => true,
    ]
);
```

**Step 12 — Buat Kategori dan LaundryService Demo**

Gunakan `slug` dengan prefix `gpreview-` agar mudah diidentifikasi sebagai data demo:

```php
$categories = [
    ['name' => 'Pakaian', 'slug' => 'gpreview-pakaian'],
    ['name' => 'Sepatu',  'slug' => 'gpreview-sepatu'],
    ['name' => 'Karpet',  'slug' => 'gpreview-karpet'],
];

$categoryMap = [];
foreach ($categories as $catData) {
    $categoryMap[$catData['slug']] = Category::firstOrCreate(
        ['outlet_id' => $outlet->id, 'slug' => $catData['slug']],
        ['name' => $catData['name'], 'is_active' => true]
    );
}
```

LaundryService minimal:

| Nama | Kategori | Unit | Harga | supports_courier |
|------|----------|------|-------|-----------------|
| Cuci Reguler | Pakaian | kg | 8000 | true |
| Cuci Express | Pakaian | kg | 15000 | true |
| Cuci Sepatu | Sepatu | pcs | 25000 | false |
| Cuci Karpet | Karpet | m | 20000 | false |

Setiap service menggunakan `slug` dengan prefix `gpreview-` dan `firstOrCreate` dengan key `slug` agar idempotent.

**Step 13 — Buat Customer Dummy untuk Cashier View**

```php
$dummyCustomers = [
    ['name' => 'Budi Demo', 'phone' => '081100009010'],
    ['name' => 'Ani Demo',  'phone' => '081100009011'],
];

foreach ($dummyCustomers as $dc) {
    Customer::firstOrCreate(
        ['outlet_id' => $outlet->id, 'phone' => $dc['phone']],
        array_merge($dc, ['is_active' => true])
    );
}
```

**Step 14 — Buat Order Demo dengan Berbagai Status**

Gunakan `order_number` dengan pattern stabil `GPREVIEW-{KEY}` agar idempotent:

| order_number | status | payment_status | delivery_type | customer_account_id |
|---|---|---|---|---|
| GPREVIEW-REQUESTED | requested | unpaid | pickup | $customerAccount->id |
| GPREVIEW-ACCEPTED | accepted | unpaid | pickup | $customerAccount->id |
| GPREVIEW-RECEIVED | received | unpaid | dropoff | $customerAccount->id |
| GPREVIEW-WEIGHING | weighing | not_yet_priced | dropoff | $customerAccount->id |
| GPREVIEW-READY-PROCESS | ready_to_process | unpaid | dropoff | null |
| GPREVIEW-IN-PROGRESS | in_progress | unpaid | dropoff | null |
| GPREVIEW-READY | ready | unpaid | dropoff | $customerAccount->id |
| GPREVIEW-DELIVERING | delivering | partial | delivery | $customerAccount->id |
| GPREVIEW-COMPLETED | completed | paid | dropoff | $customerAccount->id |
| GPREVIEW-CANCELLED | cancelled | unpaid | dropoff | null |

Setiap order harus memiliki:
- `outlet_id = $outlet->id`
- `employee_id = $employee->id`
- `customer_id = $customer->id` (untuk order yang punya customer_account_id)
- `source = 'customer_app'` untuk order dengan `customer_account_id`, `source = 'cashier'` untuk yang lain

```php
foreach ($ordersData as $od) {
    $order = Order::firstOrCreate(
        ['order_number' => $od['order_number']],
        array_merge($od, [
            'outlet_id'   => $outlet->id,
            'employee_id' => $employee->id,
        ])
    );

    // Buat minimal 1 OrderItem per order jika belum ada
    if ($order->orderItems()->count() === 0) {
        $order->orderItems()->create([
            'laundry_service_id'    => $cuciRegulerService->id,
            'category_snapshot'     => 'Pakaian',
            'service_name_snapshot' => 'Cuci Reguler',
            'unit_snapshot'         => 'kg',
            'quantity'              => 2,
            'price_snapshot'        => 8000,
            'subtotal'              => 16000,
        ]);
    }
}
```

> [!NOTE]
> Baca model `OrderItem` untuk memastikan semua kolom required diisi dengan benar. Sesuaikan nama kolom snapshot (`category_snapshot`, `service_name_snapshot`, dll.) dengan skema aktual di database.

**Step 15 — Buat CourierSetting dan CourierSchedule Demo**

```php
$courierSetting = CourierSetting::firstOrCreate(
    ['outlet_id' => $outlet->id],
    [
        'is_active'     => true,
        'pickup_radius' => 10,
        // field lain sesuai skema CourierSetting — baca model sebelum mengisi
    ]
);

// Buat schedule Senin-Sabtu
$scheduleDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
foreach ($scheduleDays as $day) {
    CourierSchedule::firstOrCreate(
        ['outlet_id' => $outlet->id, 'day_of_week' => $day],
        [
            'pickup_start_time' => '08:00',
            'pickup_end_time'   => '12:00',
            'is_active'         => true,
        ]
    );
}
```

> [!NOTE]
> Baca model `CourierSetting` dan `CourierSchedule` terlebih dahulu untuk memastikan semua kolom required diisi. Sesuaikan key `firstOrCreate` dengan unique constraint yang ada di skema.

---

#### [MODIFY] `DatabaseSeeder.php`

Path: `webapp/wash_wallet_be/database/seeders/DatabaseSeeder.php`

**Tidak ada perubahan.** `GooglePlayReviewerSeeder` **tidak** ditambahkan ke `DatabaseSeeder::run()`. Seeder dijalankan secara manual dan terkontrol.

---

### Component 2: Customer App — Password Login Entry Point

---

#### [MODIFY] `login_screen.dart`

Path: `apps/customer/lib/features/auth/presentation/screens/login_screen.dart`

**Kondisi saat ini:** `LoginScreen` hanya menampilkan input nomor WhatsApp dan tombol "Kirim OTP". Tidak ada tombol atau link langsung ke password login dari halaman ini. Tombol password login baru muncul di `OtpScreen` jika backend mengembalikan `has_password = true`.

**Perubahan yang diperlukan:** Tambahkan link teks "Masuk dengan Password" di bawah tombol "Kirim OTP". Link ini langsung menavigasi ke `/login-password` tanpa perlu meminta OTP terlebih dahulu.

Tambahkan widget berikut setelah widget `AppButton.primary` (tombol Kirim OTP) di dalam Column:

```dart
SizedBox(height: context.space.sm),
Center(
  child: TextButton(
    onPressed: () => context.go('/login-password'),
    child: Text(
      'Masuk dengan Password',
      style: context.typography.bodyMedium.copyWith(
        color: context.colors.primary,
        decoration: TextDecoration.underline,
      ),
    ),
  ),
),
```

> [!IMPORTANT]
> Route `/login-password` sudah ada berdasarkan user need (section 3.1 poin 3). Pastikan route tersebut sudah terdaftar di router customer app sebelum menambahkan navigasi ini. Cek file router customer app sebelum implementasi.

> [!NOTE]
> Perubahan ini hanya menambahkan link teks di bawah tombol utama. Tidak mengubah alur OTP yang sudah ada. Reviewer yang ingin login dengan password dapat langsung klik link ini tanpa melewati layar OTP.

---

### Component 3: Dokumentasi Google Play Console

---

#### [NEW] `docs/google_play_reviewer_credentials.md`

Path: `docs/google_play_reviewer_credentials.md`

File dokumentasi ini berisi template lengkap untuk mengisi formulir "Add Sign-in Details" di Google Play Console. File ini **tidak boleh** berisi password final — hanya placeholder.

Konten file harus mencakup:

1. **Peringatan security** — bahwa nilai password harus diambil dari secret production, tidak boleh di-commit ke repo.

2. **Sign-in Details untuk WashWallet Customer:**
   - Name: `Google Play Reviewer - WashWallet Customer`
   - Username/Phone: `081100009001`
   - Password: `<nilai GOOGLE_PLAY_REVIEWER_PASSWORD production>`
   - Instructions: Instruksi untuk langsung memilih "Masuk dengan Password" dari halaman login (link tersedia di bawah tombol Kirim OTP).

3. **Sign-in Details untuk WashWallet Cashier:**
   - Name: `Google Play Reviewer - WashWallet Cashier`
   - Username: `googleplay.reviewer`
   - Password: `<nilai GOOGLE_PLAY_REVIEWER_PASSWORD production>`
   - Instructions: Jika layar meminta PIN (re-auth sesi), gunakan PIN `112233`.

4. **Sign-in Details untuk WashWallet Production:**
   - Name: `Google Play Reviewer - WashWallet Production`
   - Username: `googleplay.reviewer`
   - Password: `<nilai GOOGLE_PLAY_REVIEWER_PASSWORD production>`
   - Instructions: Akun memiliki akses Produksi dan Kurir. Jika diminta PIN, gunakan `112233`.

5. **Cara menjalankan seeder di production:**
   ```bash
   # Pastikan GOOGLE_PLAY_REVIEWER_PASSWORD sudah diset di .env production
   php artisan db:seed --class=GooglePlayReviewerSeeder
   ```

6. **Tabel identifiers demo yang stabil:**

| Entitas | Identifier | Nilai |
|---------|-----------|-------|
| Owner | email | googleplay.owner@washwallet.test |
| Outlet | code | GPREVIEW |
| Employee | username | googleplay.reviewer |
| Customer | phone | 081100009001 |
| PIN | statik | 112233 |
| Env password | nama var | GOOGLE_PLAY_REVIEWER_PASSWORD |

---

## Urutan Implementasi yang Disarankan

1. Baca dan pahami model berikut sebelum menulis kode seeder:
   - `CustomerAccount`, `Customer`, `CustomerAddress`
   - `Employee`, `EmployeePosition`
   - `Position`, `PositionPermission`, `Permission` (enum)
   - `Outlet`, `OperationalDay`
   - `LaundryService`, `Category`, `Unit`
   - `Order`, `OrderItem`
   - `CourierSetting`, `CourierSchedule`
   - `Account`, `AccountService` (untuk COA)

2. Buat `GooglePlayReviewerSeeder.php` mengikuti urutan Step 1–15 di atas dalam satu `DB::transaction()`.

3. Jalankan seeder di lingkungan dev/staging untuk validasi:
   ```bash
   php artisan db:seed --class=GooglePlayReviewerSeeder
   # Jalankan kedua kali untuk verifikasi idempotency
   php artisan db:seed --class=GooglePlayReviewerSeeder
   # Tidak boleh ada error atau duplikasi
   ```

4. Cek router customer app, tambahkan route `/login-password` jika belum ada.

5. Modifikasi `login_screen.dart` untuk menambahkan link password login.

6. Buat file `docs/google_play_reviewer_credentials.md`.

---

## Verification Plan

### Backend Verification

**Jalankan seeder dua kali dan pastikan tidak ada error duplikasi:**
```bash
php artisan db:seed --class=GooglePlayReviewerSeeder
php artisan db:seed --class=GooglePlayReviewerSeeder
# Tidak boleh ada error / exception
```

**Verifikasi via Artisan Tinker:**
```bash
php artisan tinker

# Employee
>>> $e = App\Models\Employee::where('username', 'googleplay.reviewer')->firstOrFail();
>>> $e->is_active                                       // harus true
>>> $e->outlet->code                                    // harus 'GPREVIEW'
>>> $e->positions()->get()->pluck('slug')               // harus ['kasir', 'produksi', 'kurir']

# CustomerAccount
>>> $ca = App\Models\CustomerAccount::where('phone', '081100009001')->firstOrFail();
>>> $ca->is_verified                                    // harus true
>>> $ca->is_active                                      // harus true
>>> $ca->deposit_balance                                // harus > 0
>>> $ca->addresses()->where('is_primary', true)->exists() // harus true

# Outlet demo
>>> $outlet = App\Models\Outlet::where('code', 'GPREVIEW')->firstOrFail();
>>> $outlet->orders()->count()                          // >= 10
>>> $outlet->positions()->count()                       // >= 3
>>> $outlet->laundryServices()->count()                 // >= 4
```

**Smoke test API manual (opsional, jalankan di staging):**
```bash
# Login employee
curl -X POST https://{domain}/api/employee/auth/login \
  -d '{"username":"googleplay.reviewer","password":"<REVIEWER_PASSWORD>"}' \
  -H 'Content-Type: application/json'
# Response harus 200 dengan token

# Login customer dengan password
curl -X POST https://{domain}/api/customer/auth/login-password \
  -d '{"phone":"081100009001","password":"<REVIEWER_PASSWORD>"}' \
  -H 'Content-Type: application/json'
# Response harus 200 dengan token
```

### Flutter / Mobile Verification

**Customer App:**
- [ ] Buka `LoginScreen`, pastikan ada link/tombol "Masuk dengan Password" di bawah tombol Kirim OTP
- [ ] Tap link → masuk ke `LoginPasswordScreen` tanpa melalui OTP
- [ ] Login dengan nomor `081100009001` dan password reviewer
- [ ] Berhasil masuk ke home; tampil discovery/outlet, order history, address, profile

**Cashier App:**
- [ ] Login dengan `googleplay.reviewer` dan password reviewer
- [ ] Tidak diarahkan ke setup PIN atau access denied
- [ ] Dashboard cashier tampil dengan data demo
- [ ] Menu order, customer, service, finance/payment dapat dibuka

**Production App:**
- [ ] Login dengan `googleplay.reviewer` dan password reviewer
- [ ] Tidak diarahkan ke no-permission
- [ ] Area Produksi dapat dibuka (ada order demo dengan status `ready_to_process` / `in_progress`)
- [ ] Area Kurir dapat dibuka (ada order demo dengan status `delivering`)

---

## Daftar Lengkap File

### File Baru (NEW)

| File | Keterangan |
|------|------------|
| `webapp/wash_wallet_be/database/seeders/GooglePlayReviewerSeeder.php` | Seeder utama — tenant demo terisolasi, production-safe, idempotent |
| `docs/google_play_reviewer_credentials.md` | Template Play Console sign-in details + panduan menjalankan seeder |

### File Dimodifikasi (MODIFY)

| File | Perubahan |
|------|-----------|
| `apps/customer/lib/features/auth/presentation/screens/login_screen.dart` | Tambah link "Masuk dengan Password" di bawah tombol Kirim OTP |

### File Tidak Diubah

| File | Status |
|------|--------|
| `webapp/wash_wallet_be/database/seeders/ReviewerSeeder.php` | Tidak diubah, tidak dipanggil — dapat dihapus di refactor berikutnya |
| `webapp/wash_wallet_be/database/seeders/DatabaseSeeder.php` | Tidak diubah — seeder reviewer dijalankan manual |

---

## Acceptance Criteria Checklist

- [ ] Tersedia `GooglePlayReviewerSeeder` yang dapat dijalankan dengan `php artisan db:seed --class=GooglePlayReviewerSeeder`
- [ ] Seeder dapat dijalankan dua kali tanpa duplikasi atau error
- [ ] Outlet demo dengan `code = GPREVIEW` dibuat dan aktif
- [ ] Owner `googleplay.owner@washwallet.test` dibuat dengan role `owner`
- [ ] Employee `googleplay.reviewer` memiliki posisi aktif `kasir`, `produksi`, dan `kurir` pada outlet demo
- [ ] Permission `order.create`, `order.view`, `order.manage`, `payment.manage`, `customer.view`, `customer.manage`, `service.view` tersedia di posisi kasir
- [ ] Permission `production.view`, `production.manage` tersedia di posisi produksi
- [ ] Permission `courier.view`, `courier.manage` tersedia di posisi kurir
- [ ] `pin_hash` employee reviewer berisi hash dari PIN `112233`
- [ ] `CustomerAccount` dengan `phone = 081100009001` dibuat, `is_verified = true`, `is_active = true`, `deposit_balance > 0`
- [ ] Customer reviewer memiliki minimal 1 primary address di `customer_addresses`
- [ ] Customer reviewer memiliki relasi ke outlet demo via tabel `customers`
- [ ] Outlet demo memiliki minimal 3 LaundryService aktif, minimal 2 mendukung courier
- [ ] Outlet demo memiliki minimal 10 order demo dengan status bervariasi
- [ ] Setidaknya beberapa order dengan `customer_account_id = $customerAccount->id` ada
- [ ] `CourierSetting` dan minimal 6 `CourierSchedule` (Senin–Sabtu) demo sudah dibuat
- [ ] Seeder tidak mengambil data dari outlet non-demo (`Outlet::first()` tidak dipakai)
- [ ] `LoginScreen` Customer app menampilkan link/tombol langsung ke `/login-password`
- [ ] File `docs/google_play_reviewer_credentials.md` tersedia dengan instruksi Play Console
- [ ] Tidak ada password atau PIN plain text yang di-commit ke repository
- [ ] Seeder aman dijalankan di production (tidak destructive, tidak mengubah data di luar outlet `GPREVIEW`)
- [ ] Reviewer tidak perlu OTP, biometrik, QR code, lokasi, atau approval manual untuk login
