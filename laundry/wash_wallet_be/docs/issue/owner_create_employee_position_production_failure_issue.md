# Issue: Owner Tidak Bisa Membuat Employee dan Position di Production (Local/Dev Normal)

## Context

Laporan dari production (`storage/logs/laravel.log`), tanggal kejadian 2026-07-03:

```txt
[2026-07-03 08:58:40] production.ERROR: [EmployeeController] Failed to create employee {"error":"Posisi 'Kasir' tidak memiliki permission kurir dan tidak dapat ditugaskan ke outlet lain.", ...}
[2026-07-03 09:01:43] production.ERROR: [PositionController] Failed to create position via web {"error":"Unauthorized.","user_id":1,"type":"position_controller_error", ...}
[2026-07-03 09:03:25] production.INFO: Customer created successfully {"customer_id":151,"customer_name":"Test pelanggan","outlet_id":1,"user_id":... }
```

User (owner, `user_id: 1`, dipastikan sudah login) melaporkan:

1. Tidak bisa membuat employee baru — gagal dengan pesan soal permission kurir posisi "Kasir".
2. Tidak bisa membuat position baru — gagal dengan pesan "Unauthorized.".
3. Bisa membuat customer baru — berhasil normal.
4. Ketiga flow ini berjalan normal di development dengan codebase yang sama. Masalah hanya muncul di production.

Tugas ini murni debugging/root-cause analysis. Tidak ada perubahan kode yang dibuat. Temuan di bawah disusun sebagai acuan untuk AI model lain yang akan menyusun implementation plan perbaikan.

## Findings

### 1. Titik gagal employee create — `EmployeeService::validatePositionsForEmployee()`

File: `app/Services/EmployeeService.php:1662-1688`

```php
protected function validatePositionsForEmployee(?Employee $employee, array $positionIds, int $primaryOutletId): void
{
    ...
    $positions = $this->position->whereIn('id', $positionIds)->with(['outlet', 'permissions'])->get();
    ...
    foreach ($positions as $position) {
        if ($position->outlet->owner_id !== $ownerId) {
            throw new Exception("Posisi '{$position->name}' bukan milik outlet dari owner yang sama.");
        }

        if (!$position->hasCourierPermission() && $position->outlet_id !== $primaryOutletId) {
            throw new Exception(
                "Posisi '{$position->name}' tidak memiliki permission kurir dan tidak dapat ditugaskan ke outlet lain."
            );
        }
    }
}
```

Dipanggil dari `store()` di `app/Services/EmployeeService.php:153`:

```php
$this->validatePositionsForEmployee(null, $data['positionIds'], (int) $data['outletId']);
```

Pesan error di log **persis sama** dengan pesan pada baris 1683-1685, artinya kondisi `!$position->hasCourierPermission() && $position->outlet_id !== $primaryOutletId` bernilai `true` untuk posisi "Kasir". Ini logic dari fitur yang baru saja diimplementasikan (lihat `docs/plan/cross_outlet_employee_position_courier_permission_plan.md`) — sebelumnya rule ini berbasis slug (`slug !== 'kurir'`), sekarang berbasis permission kurir (`hasCourierPermission()`).

### 2. Titik gagal position create — `PositionService::store()`

File: `app/Services/PositionService.php:127-134`

```php
public function store(array $data): Position
{
    $authUser = Auth::user();
    $outlet = \App\Models\Outlet::findOrFail($data['outletId']);
    if (!($authUser instanceof \App\Models\User) || 
        (!$authUser->hasRole('super_admin') && $outlet->owner_id !== $authUser->id)) {
        throw new \Illuminate\Auth\Access\AuthorizationException('Unauthorized.');
    }
    ...
```

Pesan `'Unauthorized.'` di log persis sama dengan literal string pada baris ini. `Web\PositionController::store()` (`app/Http/Controllers/Web/PositionController.php:103-126`) memanggil `PositionService::store()` langsung, **tanpa** `Gate::authorize()` — semua otorisasi ada di dalam service ini.

### 3. Kontras — Customer create tidak punya guard sejenis sama sekali

File: `app/Services/CustomerService.php:114-148`

`CustomerService::store()` langsung `$this->customer->create([...])` tanpa pengecekan apa pun terhadap kepemilikan outlet. Tidak ada perbandingan `owner_id`/`outlet_id` di flow ini. Inilah sebabnya create customer "berhasil" — bukan karena flow customer lebih benar, tapi karena flow ini memang tidak memiliki authorization check berbasis perbandingan atribut sama sekali (lihat juga catatan di bagian 8, ini gap terpisah yang perlu diwaspadai, bukan bukti bahwa flow customer sudah aman).

### 4. Pola akar yang sama di kedua bug: strict comparison (`===`/`!==`) pada foreign key yang tidak di-cast eksplisit

Baik `Position.outlet_id` maupun `Outlet.owner_id` **tidak terdaftar** di method `casts()` model masing-masing:

`app/Models/Position.php:39-48`:
```php
protected function casts(): array
{
    return [
        'is_active'  => 'boolean',
        'is_default' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];
}
```

`app/Models/Outlet.php:56-68`:
```php
protected function casts(): array
{
    return [
        'status'       => 'string',
        'coin_balance' => 'integer',
        'latitude'     => 'double',
        'longitude'    => 'double',
        'balance'      => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];
}
```

Karena tidak ada cast, tipe PHP dari `$position->outlet_id` dan `$outlet->owner_id` setelah fetch dari database bergantung sepenuhnya pada bagaimana driver/koneksi DB mengembalikan kolom integer (bisa `int`, bisa `string`, tergantung konfigurasi PDO/driver di server yang menjalankannya). Kode di kedua titik gagal di atas membandingkan nilai ini dengan operator **strict** (`===`/`!==`), yang di PHP membedakan tipe selain nilai — `1 !== "1"` bernilai `true`.

Poin penting yang membuat ini konsisten dengan gejala "gagal total di production, normal di local":

- Di `PositionService::store()`, `$authUser->id` dan `$outlet->owner_id` **sama-sama** diambil lewat Eloquent fetch biasa dari koneksi yang sama, sehingga secara teori tipe keduanya seharusnya konsisten dalam satu environment. Namun dropdown outlet pada form create position (`resources/js/Pages/Dashboard/Positions/Create.tsx`) mendapatkan daftar outlet dari `OutletService::getAll()` yang di-scope lewat `applyTenantScope()` (`app/Services/BaseService.php:52-100`) memakai **SQL `WHERE owner_id = ?`** — perbandingan di level SQL yang otomatis melakukan type coercion dan selalu benar terlepas dari tipe PHP. Sedangkan pengecekan di `PositionService::store()` memakai perbandingan **PHP murni** setelah data sudah di-fetch. Artinya outlet yang tampil di dropdown dijamin benar milik owner (lewat SQL), tapi pengecekan ulang saat submit bisa saja gagal kalau representasi PHP dari kedua sisi ternyata tidak identik tipenya pada environment tertentu. Ini pola klasik "SQL-level check benar, PHP-level re-check strict gagal" yang hanya muncul kalau ada perbedaan how-the-driver-returns-integers antara satu fetch dengan fetch lain, atau antara environment satu dengan lainnya.
- Di `EmployeeService::validatePositionsForEmployee()`, `$primaryOutletId` dipaksa `(int)` secara eksplisit di titik pemanggilan (`(int) $data['outletId']`, baris 153) — sisi ini **dijamin** `int`. Sisi lain, `$position->outlet_id`, diambil dari `$this->position->whereIn(...)->get()` tanpa cast apa pun. Kalau di production nilai ini kembali sebagai string, maka `int !== string` akan **selalu** `true` untuk setiap posisi non-kurir yang dipilih, terlepas apakah posisi itu benar-benar dari outlet yang sama atau tidak. Ini cocok dengan laporan user: gagal total, bukan gagal sesekali.
- **Sudah diverifikasi secara empiris** di environment local (koneksi `mysql`, `PDO::ATTR_EMULATE_PREPARES=false`, sama seperti konfigurasi default Laravel): `Position::first()->outlet_id`, `Outlet::first()->owner_id`, dan `User::first()->id` semuanya kembali sebagai PHP `integer` asli, bukan string. Artinya **di local, bug ini tidak reproducible** — konsisten dengan laporan user. Ini TIDAK membuktikan bug tidak ada di production; ini membuktikan bahwa kalau memang ini akar masalahnya, penyebabnya ada di sisi konfigurasi PHP/PDO/MySQL production (versi ekstensi `pdo_mysql`, ada/tidaknya `mysqlnd`, connection pooler/proxy, atau setting hosting) yang berbeda dari local, bukan di kode PHP itu sendiri. Ini perlu diverifikasi langsung di production (lihat bagian "Recommended Fix Direction" poin 3) sebelum implementer memastikan ini benar-benar akar masalah utama.

### 5. Pola strict-comparison yang sama diulang di 7 tempat berbeda (bukan cuma 1 baris)

Semua tempat ini memakai pola identik `$outlet->owner_id !== $authUser->id` atau `$position->outlet->owner_id !== $authUser->id` / `=== $user->id`:

1. `app/Services/PositionService.php:131-134` (`store()`)
2. `app/Services/PositionService.php:177-180` (`update()`)
3. `app/Services/PositionService.php:218-221` (`destroy()`)
4. `app/Services/PositionService.php:252-255` (`restore()`)
5. `app/Services/PositionService.php:288-291` (`forceDestroy()`)
6. `app/Services/PositionService.php:373-376` (`updatePermissions()`)
7. `app/Models/Outlet.php:396-399` (`isOwner()` — helper ini ada tapi tidak dipakai sama sekali oleh `PositionService`, sehingga logic yang sama ditulis ulang manual 6 kali)

Selain itu, `app/Policies/PositionPolicy.php` (satu-satunya Policy class di aplikasi ini) juga memakai pola identik (`$position->outlet->owner_id === $user->id`) di method `update`, `destroy`, `restore`, `forceDestroy`, `updatePermissions` — tapi method `store()` di Policy ini **tidak** mengecek kepemilikan outlet sama sekali (hanya `$user instanceof User`), karena saat store belum ada instance `Position` untuk dicek. Policy ini hanya dipakai oleh `Api\PositionController` (lewat `Gate::authorize(...)`); `Web\PositionController` tidak memanggil Policy sama sekali dan mengandalkan penuh pengecekan manual di dalam `PositionService`.

Duplikasi 7 tempat ini membuat perilaku otorisasi Position sulit diaudit dan rawan tidak konsisten — kalaupun root cause utama ternyata bukan type-coercion, konsolidasi ke satu tempat tetap jadi perbaikan struktural yang bernilai.

### 6. Temuan tambahan (independen) — race condition di frontend Employee Create yang bisa memicu gejala yang sama

File: `resources/js/Pages/Dashboard/Employees/Create.tsx:85-122`

```tsx
const loadPositionsByOutlet = useCallback(
    async (outletId: number) => {
        if (outletId === 0) {
            setPositions([]);
            return;
        }
        try {
            setLoadingPositions(true);
            setPositionsError(null);
            const fetchedPositions = await positionService.getPositionsByOutletId(outletId, true);
            setPositions(fetchedPositions);
            setData("positionIds", []);
        } catch (error: any) { ... }
        finally { setLoadingPositions(false); }
    },
    [setData],
);

useEffect(() => {
    if (data.outletId) {
        loadPositionsByOutlet(data.outletId);
    } else {
        setPositions([]);
        setData("positionIds", []);
    }
}, [data.outletId, loadPositionsByOutlet]);
```

`loadPositionsByOutlet` adalah fetch asynchronous tanpa guard terhadap **out-of-order response**: tidak ada `AbortController`, tidak ada pengecekan apakah `outletId` saat response datang masih sama dengan `data.outletId` saat itu. Kalau owner mengganti pilihan outlet dua kali dengan cepat (misalnya salah pilih lalu koreksi), dan response fetch untuk outlet pertama datang **setelah** response untuk outlet kedua (urutan network response terbalik — hal yang wajar di kondisi jaringan production yang lebih variatif dibanding local), maka `setPositions(...)` dari outlet pertama akan menimpa daftar posisi outlet kedua yang sebenarnya sudah benar, padahal `data.outletId` di form sudah mengarah ke outlet kedua.

Ini relevan karena setiap outlet punya baris "Kasir"/"Produksi"/"Kurir" **miliknya sendiri** (dibuat oleh `PositionService::createDefaultPositionsForOutlet()`, `app/Services/PositionService.php:322-366`, dipanggil per outlet). Kalau owner punya 2+ outlet dan memilih "Kasir" dari daftar yang sebenarnya milik outlet lain (akibat race condition ini), maka `positionIds` yang terkirim ke backend berisi posisi dengan `outlet_id` berbeda dari `outletId` form — dan validasi di temuan #1 akan menolaknya dengan pesan **persis sama** seperti yang dilaporkan.

Bug ini **tidak mungkin muncul** di dev/local kalau seed data dev hanya punya satu outlet (tidak ada outlet lain untuk "race"), tapi **mudah muncul** di production kalau owner sudah punya lebih dari satu outlet — cocok dengan pola "normal di dev, gagal di production".

### 7. Tidak ditemukan indikasi stale deployment/cache

Pesan error di log (`"Posisi '{$position->name}' tidak memiliki permission kurir dan tidak dapat ditugaskan ke outlet lain."`) hanya ada di versi kode **terbaru** `validatePositionsForEmployee()` (versi lama memakai pesan `"Hanya posisi Kurir yang dapat ditugaskan ke outlet lain."` berbasis slug, sesuai `docs/plan/cross_outlet_employee_position_courier_permission_plan.md`). Ini memastikan production sudah menjalankan kode terbaru, bukan versi lama yang ter-cache (OPcache/config cache stale bisa disingkirkan dari daftar kemungkinan).

### 8. Gap terpisah yang ikut ditemukan — bukan penyebab insiden ini, tapi berisiko

`CustomerService::store()` (`app/Services/CustomerService.php:114-148`) tidak memvalidasi bahwa `outletId` yang dikirim benar-benar outlet milik owner yang sedang login. Ini di luar scope insiden hari ini (customer create justru "berhasil"), tapi ini gap keamanan/tenant-isolation yang terpisah dan sebaiknya dicatat untuk plan perbaikan lanjutan, bukan diabaikan hanya karena flow ini kebetulan tidak error hari ini.

## Recommended Fix Direction

### Perbaikan tipe data (kandidat akar masalah utama)

1. Tambahkan cast eksplisit `'outlet_id' => 'integer'` pada `Position::casts()` (`app/Models/Position.php`).
2. Tambahkan cast eksplisit `'owner_id' => 'integer'` pada `Outlet::casts()` (`app/Models/Outlet.php`).
3. Pertimbangkan juga `Employee::casts()` untuk `outlet_id` karena pola pemanggilan `validatePositionsForEmployee($employee, ..., $employee->outlet_id)` (`app/Services/EmployeeService.php:261, 563, 608`) memakai atribut yang sama tanpa cast eksplisit di titik pemanggilan (berbeda dari `store()` yang eksplisit `(int)`).
4. Cast ini adalah perbaikan defensif yang aman diterapkan terlepas dari apakah root cause production benar-benar type-coercion atau bukan — efeknya adalah Eloquent akan selalu menormalkan nilai ini ke `int` PHP asli, membuat seluruh perbandingan `===`/`!==` di codebase pada kolom ini otomatis aman ke depannya.

### Verifikasi langsung di production sebelum implementer menganggap ini pasti akar masalah

5. Sebelum menutup investigasi, sebaiknya implementer menjalankan pengecekan tipe langsung di production (misalnya lewat `php artisan tinker` di server, atau log sementara), setara dengan:
   ```php
   $position = \App\Models\Position::first();
   logger()->info('debug-type-check', [
       'outlet_id_value' => $position->outlet_id,
       'outlet_id_type'  => gettype($position->outlet_id),
   ]);
   ```
   Kalau hasilnya `string`, ini mengonfirmasi teori type-coercion sebagai akar masalah utama. Kalau hasilnya `integer` (sama seperti local), maka fokus perbaikan perlu bergeser sepenuhnya ke temuan #6 (race condition frontend) sebagai penyebab utama, dan investigasi lanjutan perlu menelusuri log request production (payload `outletId` vs `positionIds` yang benar-benar terkirim) untuk kasus yang gagal.

### Perbaikan struktural (independen dari root cause di atas)

6. Konsolidasikan 7 titik duplikasi pengecekan `owner_id`/`outlet_id` (temuan #5) menjadi satu helper terpusat — gunakan kembali `Outlet::isOwner()` yang sudah ada (`app/Models/Outlet.php:396-399`) secara konsisten, atau pindahkan seluruh logic ke `PositionPolicy` dan panggil lewat `Gate::authorize()` di kedua controller (Web dan Api), bukan hanya Api.
7. `Web\PositionController::store()` sebaiknya juga memanggil `Gate::authorize('store', Position::class)` seperti `Api\PositionController::store()`, agar perilaku otorisasi Web dan Api konsisten.

### Perbaikan race condition frontend

8. Tambahkan guard stale-response di `loadPositionsByOutlet` (`resources/js/Pages/Dashboard/Employees/Create.tsx:85-113`) — bandingkan `outletId` yang dipakai saat fetch dimulai dengan `data.outletId` (lewat `ref`) saat response diterima, dan abaikan response yang sudah tidak relevan sebelum memanggil `setPositions`/`setData`. Pola yang sama perlu dicek juga di halaman Edit employee kalau ada logic serupa (`resources/js/Pages/Dashboard/Employees/Edit.tsx`).

### Gap terpisah (temuan #8)

9. Evaluasi apakah `CustomerService::store()` perlu validasi kepemilikan `outletId` terhadap owner yang login, konsisten dengan pola tenant-scoping yang dipakai flow lain.

## Acceptance Criteria

- Owner dengan 2 outlet atau lebih dapat membuat employee baru dengan memilih posisi non-kurir (misalnya "Kasir") milik outlet yang sedang dipilih, tanpa error courier permission yang salah.
- Owner dapat membuat position baru untuk outlet miliknya sendiri tanpa error "Unauthorized." selama outlet tersebut memang miliknya.
- Tidak ada regresi pada validasi cross-outlet courier permission yang memang harus menolak (posisi non-kurir yang benar-benar dari outlet lain tetap ditolak).
- Mengganti outlet dengan cepat pada form create employee tidak menyebabkan daftar posisi yang salah/tercampur ditampilkan.
- Perbandingan `owner_id`/`outlet_id` di seluruh codebase konsisten memakai nilai yang sudah dinormalisasi ke `int`.

## Suggested Tests

- Feature test: owner dengan 2 outlet, membuat employee di outlet B memakai posisi "Kasir" milik outlet B → sukses.
- Feature test: owner dengan 2 outlet, mencoba menugaskan posisi non-kurir milik outlet A ke employee outlet B → tetap ditolak (regresi guard).
- Feature test: owner membuat position baru untuk outlet miliknya sendiri → sukses, tidak Unauthorized.
- Feature test: owner mencoba membuat position untuk outlet yang bukan miliknya (manipulasi request) → tetap ditolak Unauthorized (regresi security).
- Unit test model: pastikan `Position::outlet_id` dan `Outlet::owner_id` selalu bertipe `int` setelah cast ditambahkan, walau nilai mentah dari DB berupa string.
- Test/QA manual frontend: pada form create employee, pilih outlet A lalu segera pilih outlet B sebelum daftar posisi outlet A selesai loading (throttle network di devtools), pastikan daftar posisi akhir selalu sesuai outlet B.

## Files To Inspect During Plan

- `app/Services/EmployeeService.php` (`validatePositionsForEmployee`, `store`, `update`)
- `app/Services/PositionService.php` (`store`, `update`, `destroy`, `restore`, `forceDestroy`, `updatePermissions`, `createDefaultPositionsForOutlet`)
- `app/Models/Position.php`
- `app/Models/Outlet.php`
- `app/Models/Employee.php`
- `app/Policies/PositionPolicy.php`
- `app/Http/Controllers/Web/PositionController.php`
- `app/Http/Controllers/Api/PositionController.php`
- `app/Services/BaseService.php` (`applyTenantScope`)
- `app/Services/CustomerService.php`
- `resources/js/Pages/Dashboard/Employees/Create.tsx`
- `resources/js/Pages/Dashboard/Employees/Edit.tsx`
- `resources/js/Pages/Dashboard/Positions/Create.tsx`
- `docs/plan/cross_outlet_employee_position_courier_permission_plan.md`
