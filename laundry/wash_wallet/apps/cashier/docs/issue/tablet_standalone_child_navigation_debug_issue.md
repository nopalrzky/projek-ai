# Issue: Tablet create/show/edit masih memakai prefix `/settings/setup-outlet`

## Scope

Dokumen ini hanya mencatat hasil debug. Tidak ada perubahan implementasi routing atau navigasi yang dilakukan.

Tanggal debug: 2026-06-30

## Ringkasan

Pada tampilan tablet, user masuk ke modul master data lewat sidebar tablet. Sidebar sudah mengarah ke route pendek/standalone seperti:

```text
/customers
/categories
/laundry-services
/service-packages
/membership-plans
```

Namun setelah berada di halaman index modul tersebut, action create/show/edit masih melakukan `context.push(...)` ke path lama di bawah:

```text
/settings/setup-outlet/...
```

Akibatnya flow yang seharusnya tetap memakai route pendek seperti `/customers/create` atau `/categories/1/edit` justru diarahkan ke `/settings/setup-outlet/customers/create`, `/settings/setup-outlet/categories/1/edit`, dan pola sejenis.

## Root Cause

Root cause ada di handler navigasi pada screen index master data. `AppRouter` sudah mendefinisikan route canonical/standalone untuk beberapa modul, tetapi tombol atau row action di screen index masih hardcoded ke route nested lama.

Contoh route canonical yang tersedia di router:

- `lib/core/router/app_router.dart:535` -> `/customers`
- `lib/core/router/app_router.dart:547` -> `/customers/create`
- `lib/core/router/app_router.dart:559` -> `/customers/:id`
- `lib/core/router/app_router.dart:571` -> `/customers/:id/edit`
- `lib/core/router/app_router.dart:585` -> `/categories`
- `lib/core/router/app_router.dart:597` -> `/categories/create`
- `lib/core/router/app_router.dart:609` -> `/categories/:id`
- `lib/core/router/app_router.dart:621` -> `/categories/:id/edit`
- `lib/core/router/app_router.dart:635` -> `/laundry-services`
- `lib/core/router/app_router.dart:647` -> `/laundry-services/create`
- `lib/core/router/app_router.dart:659` -> `/laundry-services/:id`
- `lib/core/router/app_router.dart:671` -> `/laundry-services/:id/edit`
- `lib/core/router/app_router.dart:685` -> `/service-packages`
- `lib/core/router/app_router.dart:697` -> `/service-packages/:id`
- `lib/core/router/app_router.dart:711` -> `/membership-plans`

Tetapi action pada screen berikut masih memakai path lama:

- `lib/features/customer/presentation/screens/index_customers_screen.dart:271` -> `/settings/setup-outlet/customers/create`
- `lib/features/customer/presentation/screens/index_customers_screen.dart:277` -> `/settings/setup-outlet/customers/${customer.id}`
- `lib/features/customer/presentation/screens/index_customers_screen.dart:284` -> `/settings/setup-outlet/customers/${customer.id}/edit`
- `lib/features/category/presentation/screens/index_categories_screen.dart:264` -> `/settings/setup-outlet/categories/create`
- `lib/features/category/presentation/screens/index_categories_screen.dart:270` -> `/settings/setup-outlet/categories/$id`
- `lib/features/category/presentation/screens/index_categories_screen.dart:277` -> `/settings/setup-outlet/categories/${category.id}/edit`
- `lib/features/laundry_service/presentation/screens/index_laundry_services_screen.dart:439` -> `/settings/setup-outlet/laundry-services/create`
- `lib/features/laundry_service/presentation/screens/index_laundry_services_screen.dart:445` -> `/settings/setup-outlet/laundry-services/${service.id}`
- `lib/features/laundry_service/presentation/screens/index_laundry_services_screen.dart:452` -> `/settings/setup-outlet/laundry-services/${service.id}/edit`
- `lib/features/service_package/presentation/screens/index_service_packages_screen.dart:216` -> `/settings/setup-outlet/service-packages/${package.id}`
- `lib/features/membership_plan/presentation/screens/index_membership_plan_screen.dart:237` -> `/settings/setup-outlet/membership-plans/${plan.id}`

## Kenapa Terlihat di Tablet

Pada layout non-compact, `MainShellScreen` memakai `OperationalTabletShell`.

Bukti:

- `lib/core/navigation/main_shell_screen.dart:94` membaca `AppBreakpoints.of(context)`
- `lib/core/navigation/main_shell_screen.dart:95` menentukan `isCompact`
- `lib/core/navigation/main_shell_screen.dart:163` memakai `OperationalTabletShell`
- `lib/core/navigation/main_shell_screen.dart:172` membuka menu sidebar dengan `context.go(item.route!)`

Route sidebar tablet sendiri sudah benar:

- `lib/core/navigation/cashier_navigation_config.dart:32` -> `/customers`
- `lib/core/navigation/cashier_navigation_config.dart:44` -> `/laundry-services`
- `lib/core/navigation/cashier_navigation_config.dart:56` -> `/categories`
- `lib/core/navigation/cashier_navigation_config.dart:68` -> `/service-packages`
- `lib/core/navigation/cashier_navigation_config.dart:80` -> `/membership-plans`

Jadi tablet bukan sumber path lama. Tablet hanya membuat flow ini lebih sering terlihat karena user masuk lewat sidebar ke halaman index standalone, lalu action di dalam halaman tersebut masih melompat ke path lama.

## Path Lama Lain Yang Masih Tersisa

Selain action create/show/edit pada index screen, masih ada entry point lama di area setting:

- `lib/features/setting/presentation/screens/index_setting_screen.dart:67` -> `/settings/setup-outlet`
- `lib/features/setting/presentation/screens/setup_outlet_setting_screen.dart:90` -> `/settings/setup-outlet/categories`
- `lib/features/setting/presentation/screens/setup_outlet_setting_screen.dart:98` -> `/settings/setup-outlet/laundry-services`
- `lib/features/setting/presentation/screens/setup_outlet_setting_screen.dart:107` -> `/settings/setup-outlet/service-packages`
- `lib/features/setting/presentation/screens/setup_outlet_setting_screen.dart:132` -> `/settings/setup-outlet/customers`
- `lib/features/setting/presentation/screens/setup_outlet_setting_screen.dart:141` -> `/settings/setup-outlet/membership-plans`

Catatan penting: `SetupOutletSettingScreen` masih ada di source tree, tetapi pada kondisi router saat ini tidak ditemukan pendaftaran route `/settings/setup-outlet` di `lib/core/router/app_router.dart`.

## Dampak

- URL/navigation history menjadi tidak konsisten: index memakai route pendek, tetapi child flow create/show/edit memakai prefix lama.
- Beberapa path lama tidak punya definisi route aktif di `AppRouter`, sehingga berpotensi menghasilkan error GoRouter saat action ditekan.
- Guard permission saat ini mengecek path pendek seperti `/customers/create`, `/categories/create`, dan `/laundry-services/create`; path lama `/settings/setup-outlet/...` tidak masuk ke cabang guard fitur tersebut.
- Highlight sidebar tablet bisa jatuh ke `settings` jika location memakai `/settings/setup-outlet/...`, bukan tetap di item fitur seperti `customers`, `categories`, atau `laundry-services`.

## Reproduksi Yang Disarankan

1. Jalankan aplikasi pada viewport tablet/non-compact.
2. Dari sidebar, buka `Pelanggan`.
3. Pastikan halaman index berada di `/customers`.
4. Tekan aksi tambah pelanggan.
5. Amati route yang dipush: saat ini handler mengarah ke `/settings/setup-outlet/customers/create`, bukan `/customers/create`.

Pola yang sama berlaku untuk:

- `Kategori` -> create/show/edit
- `Layanan Laundry` -> create/show/edit
- `Paket Layanan` -> show
- `Membership` -> show

## Kesimpulan Debug

Bug bukan berasal dari sidebar tablet. Sidebar tablet sudah mengirim route standalone yang benar.

Bug berasal dari sisa hardcoded route lama pada action handler di screen index master data. Route child create/show/edit belum sinkron dengan struktur route standalone yang saat ini sudah didefinisikan di `AppRouter`.
