# Plan: Fix Hardcoded Route Lama pada Action Handler Index Screen Master Data

## Referensi Issue

- **Issue:** `docs/issue/tablet_standalone_child_navigation_debug_issue.md`
- **Tanggal dibuat:** 2026-06-30

---

## Latar Belakang

Sidebar tablet sudah mengarah ke route standalone yang benar (`/customers`, `/categories`, dll.).
Namun setelah user berada di halaman index modul tersebut, action handler untuk
create/show/edit masih memanggil `context.push(...)` ke path lama dengan prefix
`/settings/setup-outlet/...`.

Akibatnya:
- Navigation history menjadi tidak konsisten.
- Beberapa path lama tidak punya definisi route aktif di `AppRouter`, sehingga
  berpotensi menghasilkan error GoRouter.
- Guard permission yang mengecek path pendek (`/customers/create`, dll.) tidak
  terpicu, karena path aktual berbeda.
- Highlight sidebar tablet bisa jatuh ke item `settings` alih-alih item fitur
  yang sedang aktif.

---

## Scope Pekerjaan

### File yang HARUS diubah

| # | File | Baris yang Terpengaruh | Keterangan |
|---|---|---|---|
| 1 | `lib/features/customer/presentation/screens/index_customers_screen.dart` | ~271, ~277, ~284 | Ganti path create/show/edit |
| 2 | `lib/features/category/presentation/screens/index_categories_screen.dart` | ~264, ~270, ~277 | Ganti path create/show/edit |
| 3 | `lib/features/laundry_service/presentation/screens/index_laundry_services_screen.dart` | ~439, ~445, ~452 | Ganti path create/show/edit |
| 4 | `lib/features/service_package/presentation/screens/index_service_packages_screen.dart` | ~216 | Ganti path show |
| 5 | `lib/features/membership_plan/presentation/screens/index_membership_plan_screen.dart` | ~237 | Ganti path show |

### File yang TIDAK perlu diubah

- `lib/core/router/app_router.dart` — route canonical sudah terdefinisi dengan benar.
- `lib/core/navigation/cashier_navigation_config.dart` — sidebar sudah benar.
- `lib/core/navigation/main_shell_screen.dart` — shell navigation sudah benar.
- File screen create/edit/show masing-masing modul — tidak ada perubahan public API.

---

## Aturan Umum Penggantian Route

Setiap kemunculan prefix lama harus diganti dengan path canonical pendek:

| Path Lama (prefix) | Path Baru (standalone) |
|---|---|
| `/settings/setup-outlet/customers/create` | `/customers/create` |
| `/settings/setup-outlet/customers/${id}` | `/customers/${id}` |
| `/settings/setup-outlet/customers/${id}/edit` | `/customers/${id}/edit` |
| `/settings/setup-outlet/categories/create` | `/categories/create` |
| `/settings/setup-outlet/categories/$id` | `/categories/$id` |
| `/settings/setup-outlet/categories/${id}/edit` | `/categories/${id}/edit` |
| `/settings/setup-outlet/laundry-services/create` | `/laundry-services/create` |
| `/settings/setup-outlet/laundry-services/${id}` | `/laundry-services/${id}` |
| `/settings/setup-outlet/laundry-services/${id}/edit` | `/laundry-services/${id}/edit` |
| `/settings/setup-outlet/service-packages/${id}` | `/service-packages/${id}` |
| `/settings/setup-outlet/membership-plans/${id}` | `/membership-plans/${id}` |

> **Catatan:** Jangan mengubah tipe method navigasi (push/go/replace). Jika sebelumnya
> memakai `context.push(...)`, tetap gunakan `context.push(...)`. Perubahan hanya pada
> string path-nya saja.

---

## Detail Perubahan Per File

### 1. `lib/features/customer/presentation/screens/index_customers_screen.dart`

Cari semua kemunculan string `/settings/setup-outlet/customers` dan ganti sesuai
tabel di atas.

**Perubahan yang diharapkan (diff konseptual):**

```diff
- context.push('/settings/setup-outlet/customers/create');
+ context.push('/customers/create');

- context.push('/settings/setup-outlet/customers/${customer.id}');
+ context.push('/customers/${customer.id}');

- context.push('/settings/setup-outlet/customers/${customer.id}/edit');
+ context.push('/customers/${customer.id}/edit');
```

**Cara verifikasi:**
Pastikan tidak ada lagi string `/settings/setup-outlet/customers` di dalam file ini
setelah perubahan.

---

### 2. `lib/features/category/presentation/screens/index_categories_screen.dart`

Cari semua kemunculan string `/settings/setup-outlet/categories` dan ganti sesuai
tabel di atas.

**Perubahan yang diharapkan (diff konseptual):**

```diff
- context.push('/settings/setup-outlet/categories/create');
+ context.push('/categories/create');

- context.push('/settings/setup-outlet/categories/$id');
+ context.push('/categories/$id');

- context.push('/settings/setup-outlet/categories/${category.id}/edit');
+ context.push('/categories/${category.id}/edit');
```

**Cara verifikasi:**
Pastikan tidak ada lagi string `/settings/setup-outlet/categories` di dalam file ini
setelah perubahan.

---

### 3. `lib/features/laundry_service/presentation/screens/index_laundry_services_screen.dart`

Cari semua kemunculan string `/settings/setup-outlet/laundry-services` dan ganti
sesuai tabel di atas.

**Perubahan yang diharapkan (diff konseptual):**

```diff
- context.push('/settings/setup-outlet/laundry-services/create');
+ context.push('/laundry-services/create');

- context.push('/settings/setup-outlet/laundry-services/${service.id}');
+ context.push('/laundry-services/${service.id}');

- context.push('/settings/setup-outlet/laundry-services/${service.id}/edit');
+ context.push('/laundry-services/${service.id}/edit');
```

**Cara verifikasi:**
Pastikan tidak ada lagi string `/settings/setup-outlet/laundry-services` di dalam file ini
setelah perubahan.

---

### 4. `lib/features/service_package/presentation/screens/index_service_packages_screen.dart`

Cari kemunculan string `/settings/setup-outlet/service-packages` dan ganti.

**Perubahan yang diharapkan (diff konseptual):**

```diff
- context.push('/settings/setup-outlet/service-packages/${package.id}');
+ context.push('/service-packages/${package.id}');
```

**Cara verifikasi:**
Pastikan tidak ada lagi string `/settings/setup-outlet/service-packages` di dalam
file ini setelah perubahan.

---

### 5. `lib/features/membership_plan/presentation/screens/index_membership_plan_screen.dart`

Cari kemunculan string `/settings/setup-outlet/membership-plans` dan ganti.

**Perubahan yang diharapkan (diff konseptual):**

```diff
- context.push('/settings/setup-outlet/membership-plans/${plan.id}');
+ context.push('/membership-plans/${plan.id}');
```

**Cara verifikasi:**
Pastikan tidak ada lagi string `/settings/setup-outlet/membership-plans` di dalam
file ini setelah perubahan.

---

## Langkah Verifikasi Keseluruhan

### Langkah 1 — Global Search

Jalankan search global di seluruh project untuk memastikan tidak ada lagi sisa
hardcoded path lama yang berkaitan dengan master data:

```
/settings/setup-outlet/customers
/settings/setup-outlet/categories
/settings/setup-outlet/laundry-services
/settings/setup-outlet/service-packages
/settings/setup-outlet/membership-plans
```

> **Catatan:** Path `/settings/setup-outlet` yang muncul di
> `lib/features/setting/presentation/screens/` (yaitu `index_setting_screen.dart`
> dan `setup_outlet_setting_screen.dart`) **di luar scope plan ini** dan tidak boleh
> diubah.

### Langkah 2 — Konfirmasi Route Terdaftar di AppRouter

Pastikan semua path target berikut sudah terdaftar di `lib/core/router/app_router.dart`:

| Path | Baris Referensi |
|---|---|
| `/customers/create` | app_router.dart:547 |
| `/customers/:id` | app_router.dart:559 |
| `/customers/:id/edit` | app_router.dart:571 |
| `/categories/create` | app_router.dart:597 |
| `/categories/:id` | app_router.dart:609 |
| `/categories/:id/edit` | app_router.dart:621 |
| `/laundry-services/create` | app_router.dart:647 |
| `/laundry-services/:id` | app_router.dart:659 |
| `/laundry-services/:id/edit` | app_router.dart:671 |
| `/service-packages/:id` | app_router.dart:697 |
| `/membership-plans/:id` | app_router.dart:711 (perlu dikonfirmasi, belum pasti ada) |

> Jika `/membership-plans/:id` belum terdaftar di `AppRouter`, tambahkan route
> tersebut sebelum atau bersamaan dengan perubahan di
> `index_membership_plan_screen.dart`. Definisikan dengan pola yang sama seperti
> route modul lain.

### Langkah 3 — Manual Test (Tablet Viewport)

1. Jalankan aplikasi pada viewport tablet/non-compact.
2. Dari sidebar, buka **Pelanggan**.
3. Pastikan halaman index berada di `/customers`.
4. Tekan aksi **tambah pelanggan** → harus navigate ke `/customers/create`.
5. Kembali ke index, tekan row pelanggan → harus navigate ke `/customers/{id}`.
6. Dari halaman detail, tekan edit → harus navigate ke `/customers/{id}/edit`.
7. Ulangi langkah 2–6 untuk modul **Kategori**, **Layanan Laundry**, **Paket Layanan**,
   dan **Membership**.
8. Pastikan highlight sidebar tetap pada item fitur yang sedang aktif selama seluruh
   flow (tidak berpindah ke item `Settings`).

---

## Checklist Sebelum Selesai

- [ ] `index_customers_screen.dart` — tidak ada `/settings/setup-outlet/customers`
- [ ] `index_categories_screen.dart` — tidak ada `/settings/setup-outlet/categories`
- [ ] `index_laundry_services_screen.dart` — tidak ada `/settings/setup-outlet/laundry-services`
- [ ] `index_service_packages_screen.dart` — tidak ada `/settings/setup-outlet/service-packages`
- [ ] `index_membership_plan_screen.dart` — tidak ada `/settings/setup-outlet/membership-plans`
- [ ] `/membership-plans/:id` terdaftar di `AppRouter` (konfirmasi atau tambahkan)
- [ ] Semua route target sudah diverifikasi terdaftar di `AppRouter`
- [ ] Flutter build tidak ada error kompilasi
- [ ] Manual test tablet flow berhasil untuk semua 5 modul
- [ ] Sidebar highlight tetap benar di setiap step

---

## Catatan Tambahan

- Perubahan ini bersifat **surgical** — hanya string path yang diganti, tidak ada
  perubahan logika, widget tree, atau state management.
- Tidak perlu menyentuh file setting (`index_setting_screen.dart`,
  `setup_outlet_setting_screen.dart`) — path lama di sana memang sudah tidak aktif
  di router, tetapi pembersihan tersebut di luar scope issue ini.
- Tidak perlu menambahkan atau menghapus route di `AppRouter` kecuali untuk
  `/membership-plans/:id` yang perlu dikonfirmasi keberadaannya.
