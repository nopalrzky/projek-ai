# Implementation Plan: App Lifecycle, Navigation Fixes & Setup Outlet Redesign

## Latar Belakang

Plan ini menggabungkan dua area perbaikan dari hasil code review:

1. **App Lifecycle, Auth Flow, Navigation, dan Notification Routing** — 10 issue (LCN-01 s/d LCN-10), mencakup bug kritis pada re-auth PIN, session persistence, protected route, notification routing, dan arsitektur navigasi.
2. **Setting & Setup Outlet Design Flow** — 12 issue (UX-SET-01 s/d UX-SET-12), mencakup redesign UX Setup Outlet agar menjadi hub konfigurasi yang modern, fix navigasi bottom navbar, dan standarisasi pola master data.

Kedua area ini saling terkait karena beberapa perbaikan navigasi (LCN-03, LCN-07) secara langsung memengaruhi struktur route Setup Outlet (UX-SET-11, UX-SET-12).

---

## Ringkasan Prioritas Gabungan

| ID | Prioritas | Area | Ringkasan |
|---|---|---|---|
| UX-SET-11 | P0 | Navigation | Route Setup Outlet keluar dari shell, bottom navbar hilang. |
| LCN-01 | P0 | Auth lifecycle | Re-auth PIN sukses tidak keluar dari `/re-auth-pin`. |
| LCN-02 | P0 | Session lifecycle | Session stale tidak persist saat cold start. |
| LCN-03 | P1 | Auth routing | Protected route tidak lengkap, blank page untuk unauthenticated. |
| LCN-04 | P1 | Navigation | Query `/orders?status=...` tidak dikonsumsi Orders Screen. |
| LCN-05 | P1 | Push notification | Notification tap punya dua jalur dan bypass outlet guard. |
| LCN-06 | P1 | Notification session | Switch employee tidak menghentikan session notifikasi lama. |
| UX-SET-01 | P1 | Setup Outlet IA | Setup Outlet masih berupa list menu datar. |
| UX-SET-02 | P1 | Guided setup | Tidak ada urutan setup atau readiness state. |
| UX-SET-03 | P1 | Module grouping | Item dicampur tanpa grouping operasional. |
| UX-SET-04 | P1 | CRUD ergonomics | Kategori/layanan masih terasa CRUD generik. |
| UX-SET-05 | P1 | Dependency UX | Form layanan tidak membantu saat kategori belum tersedia. |
| UX-SET-12 | P1 | Header/back UX | Index screen memakai drawer/menu bukan back navigation. |
| LCN-07 | P2 | Navigation architecture | GoRouter dan Navigator.push bercampur tanpa aturan. |
| LCN-08 | P2 | Resource lifecycle | Cubit/service tidak ditutup pada dispose root app. |
| LCN-09 | P2 | Routing maintainability | `AuthGuard` tidak dipakai, guard logic tersebar. |
| LCN-10 | P2 | Splash/router ownership | Splash dan router sama-sama mengambil keputusan redirect. |
| UX-SET-06 | P2 | Read-only clarity | Paket/membership kurang jelas read-only atau editable. |
| UX-SET-07 | P2 | Responsive layout | Modul setup belum memakai pola master-detail. |
| UX-SET-08 | P2 | Consistency | Visual dan interaction pattern antar modul belum konsisten. |
| UX-SET-09 | P2 | Safety | Delete/edit belum memberi impact preview. |
| UX-SET-10 | P2 | Search/filter | Search, filter, sort, dan status management belum seragam. |

---

## Fase 1 — P0: Critical Bug Fixes (Auth & Navigation Shell)

Fase ini harus dikerjakan terlebih dahulu karena menyentuh fondasi navigasi dan auth yang dipakai seluruh app.

---

### 1.1 Fix LCN-01: Re-auth PIN Sukses Tidak Keluar dari `/re-auth-pin`

**File yang dimodifikasi:**

#### [MODIFY] `app_router.dart`
- `lib/core/router/app_router.dart`
- Tambahkan `/re-auth-pin` ke dalam daftar route yang diredirect ke `/home` saat state menjadi `Authenticated`.
- Saat ini hanya `/login`, `/onboarding`, `/setup-pin`, `/access-denied` yang diredirect ke `/home` pada state `Authenticated`. `/re-auth-pin` harus masuk daftar yang sama.
- Implementasikan mekanisme "intended destination": saat redirect ke `/re-auth-pin`, simpan route asal di `extra` atau query parameter. Setelah `Authenticated`, redirect ke intended destination, atau fallback ke `/home`.

#### [MODIFY] `re_auth_pin_screen.dart`
- `lib/features/auth/presentation/screens/re_auth_pin_screen.dart`
- Tambahkan handler `Authenticated` di listener BlocListener.
- Saat state berubah ke `Authenticated`, panggil `context.go(intendedDestination ?? '/home')`.

**Acceptance Criteria:**
- Setelah PIN re-auth benar, user keluar dari `/re-auth-pin` dan menuju route yang aman.
- User tidak bisa tersangkut di `/re-auth-pin` dengan back button dinonaktifkan.
- Test router: dari `/re-auth-pin`, state `Authenticated` -> hasil route bukan `/re-auth-pin`.
- Test widget `ReAuthPinScreen`: sukses PIN -> navigasi dipulihkan.

---

### 1.2 Fix LCN-02: Session Stale Tidak Persist Setelah App Restart

**File yang dimodifikasi:**

#### [MODIFY] `auth_cubit.dart`
- `lib/features/auth/presentation/bloc/auth_cubit.dart`
- Ganti `_lastActivityAt` dari field memory menjadi membaca dari storage persisten.
- Pada `recordActivity()`: simpan `DateTime.now().toIso8601String()` ke `SharedPreferences` dengan key misalnya `last_activity_at`.
- Pada `checkAuthStatus()`: setelah token valid dan employee didapat, baca timestamp dari `SharedPreferences`. Jika selisih `DateTime.now() - lastActivityAt > 4 jam`, emit `AuthenticatedStale` bukan langsung `Authenticated`.
- Gunakan injectable clock/time provider (`abstract class Clock { DateTime now(); }`) agar test tidak bergantung waktu real.
- Pertimbangkan lifecycle `inactive` dan `hidden` selain `paused` untuk platform yang relevan.

#### [MODIFY] `app_lifecycle_observer.dart`
- `lib/core/services/app_lifecycle_observer.dart`
- Review lifecycle state yang memanggil `recordActivity()`. Pastikan `paused`, `inactive`, dan `detached` ditangani sesuai platform.

#### [NEW] `clock.dart` (tambahkan ke `lib/core/utils/` atau `lib/core/services/`)
- Interface `Clock` dan implementasi `SystemClock` untuk dependency injection.
- Gunakan `MockClock` di test untuk mengontrol waktu secara deterministik.

**Acceptance Criteria:**
- App yang dibuka kembali setelah idle lebih dari 4 jam (meski proses mati) tetap meminta PIN.
- Test: mock clock dimajukan 5 jam, cold start -> state harus `AuthenticatedStale`.

---

### 1.3 Fix UX-SET-11: Route Setup Outlet Keluar dari Bottom Navbar Shell

Ini adalah P0 dari sisi UX dan harus diselesaikan sebelum perbaikan UX lain di area Setup Outlet karena sebagian besar item Fase 2 bergantung pada struktur route yang benar.

**File yang dimodifikasi:**

#### [MODIFY] `app_router.dart`
- `lib/core/router/app_router.dart`
- Pindahkan route `/categories`, `/laundry-services`, `/service-packages`, `/membership-plans`, `/customers` dari top-level route menjadi **nested route di bawah branch Setting** dalam `StatefulShellRoute.indexedStack`.
- Struktur route yang dituju:
  ```
  /settings
    /settings/setup-outlet
    /settings/setup-outlet/categories
    /settings/setup-outlet/categories/:id
    /settings/setup-outlet/categories/:id/edit
    /settings/setup-outlet/laundry-services
    /settings/setup-outlet/laundry-services/create
    /settings/setup-outlet/laundry-services/:id
    /settings/setup-outlet/laundry-services/:id/edit
    /settings/setup-outlet/service-packages
    /settings/setup-outlet/membership-plans
    /settings/setup-outlet/customers
    /settings/setup-outlet/customers/:id
  ```
- Pertahankan route top-level lama atau tambahkan redirect jika ada deep link/quick action dari fitur lain (misal Home/Order yang membuka `/customers`). Untuk kasus tersebut, putuskan secara eksplisit apakah memakai nested setting route atau route fokus tanpa bottom nav.

#### [MODIFY] `setup_outlet_setting_screen.dart`
- `lib/features/setting/presentation/screens/setup_outlet_setting_screen.dart`
- Update semua `context.push('/categories')` menjadi `context.push('/settings/setup-outlet/categories')` (dan route lain sesuai path baru).

**Acceptance Criteria:**
- Dari `Setting -> Setup Outlet -> Kategori`, bottom navbar tetap terlihat.
- User bisa tap Home/Dana/Transaksi/Setting tanpa harus back terlebih dahulu.
- Back dari Kategori kembali ke Setup Outlet.

---

## Fase 2 — P1: Navigation & Auth Completeness + Setup Outlet UX

---

### 2.1 Fix LCN-03: Protected Route Coverage Tidak Lengkap

#### [MODIFY] `app_router.dart`
- `lib/core/router/app_router.dart`
- Definisikan konstanta atau `Set<String>` untuk semua protected route secara eksplisit, termasuk route yang baru dipindahkan ke nested setting (Fase 1.3).
- Hilangkan fallback `SizedBox` (blank page) untuk route yang memerlukan auth. Ganti dengan redirect ke auth flow.
- Jika ingin mendukung return-to-destination setelah login, simpan `intendedRoute` di state/extra sebelum redirect.
- Integrasikan atau hapus `AuthGuard` agar tidak ada dua konsep guard yang berbeda (lihat juga LCN-09 di Fase 3).

**Acceptance Criteria:**
- Deep link ke route setup outlet ketika unauthenticated -> diredirect ke login, bukan blank page.
- Semua protected route terdokumentasi dalam satu konstanta atau daftar.

---

### 2.2 Fix LCN-04: Query `/orders?status=...` Tidak Dikonsumsi Orders Screen

#### [MODIFY] `app_router.dart`
- `lib/core/router/app_router.dart` baris 213-226.
- Pada builder route `/orders`, baca `state.uri.queryParameters['status']` dan pass ke `IndexOrdersScreen.initialStatusFilter`.

#### [MODIFY] `index_orders_screen.dart`
- `lib/features/order/presentation/screens/index_orders_screen.dart`
- Karena `StatefulShellRoute.indexedStack` mempertahankan widget tree, tambahkan mekanisme pembaruan filter saat query berubah setelah screen sudah hidup:
  - Implementasikan `RouteObserver` atau gunakan `didUpdateWidget` / `didChangeDependencies` untuk mendeteksi perubahan `queryParameters`.
  - Saat query berubah, update `_selectedStatus` dan panggil ulang `OrderCubit.getAll(status: newStatus)`.

**Acceptance Criteria:**
- Tap KPI "requested" di Home -> `IndexOrdersScreen` memakai filter `requested`.
- Test: navigasi `/orders?status=requested` -> `OrderCubit.getAll(status: 'requested')` dipanggil.

---

### 2.3 Fix LCN-05: Notification Tap Punya Dua Jalur dan Bypass Outlet Guard

#### [MODIFY] `push_notification_coordinator.dart`
- `lib/core/navigation/push_notification_coordinator.dart`
- Jadikan `PushNotificationCoordinator` sebagai **satu-satunya pemilik** notification tap routing.
- Hapus atau nonaktifkan listener `FirebaseMessaging.onMessageOpenedApp` dan pembacaan `getInitialMessage()` dari `NotificationService`.
- Validasi `payloadOutletId == authenticatedOutletId`; jika berbeda, abaikan payload atau tampilkan snackbar informatif yang aman.
- Ganti navigasi `Navigator.of(context).push(MaterialPageRoute(...))` dengan GoRouter route (contoh: `context.push('/orders/$orderId')`). Ini memerlukan route GoRouter untuk detail order (lihat LCN-07 Fase 3).
- Pisahkan event "new order" (untuk badge/banner) dari "tap navigation" agar tidak saling menduplikasi.

#### [MODIFY] `notification_service.dart`
- `lib/core/services/notification_service.dart`
- Hapus listener `FirebaseMessaging.onMessageOpenedApp` (baris 318-323) dan duplikasi `getInitialMessage()` (baris 325-332).
- `NotificationService` tetap bertanggung jawab untuk menampilkan notifikasi foreground/badge, bukan routing navigasi.

#### [MODIFY] `home_screen.dart`
- `lib/features/home/presentation/screens/home_screen.dart`
- Hapus atau refactor handler tap notifikasi (baris 49-52, 269-285) yang menduplikasi logika coordinator.
- Jika Home perlu merespons event "new order" (badge, banner), pakai stream event terpisah dari coordinator, bukan listener navigasi.

**Acceptance Criteria:**
- Satu tap notifikasi hanya membuka satu detail order.
- Payload outlet yang tidak cocok dengan outlet session diabaikan dengan aman.
- `getInitialMessage()` hanya dipanggil dari satu tempat.

---

### 2.4 Fix LCN-06: Switch Employee Tidak Menghentikan Notification Session Lama

#### [MODIFY] `auth_cubit.dart`
- `lib/features/auth/presentation/bloc/auth_cubit.dart`
- Pada `switchEmployee()`, sebelum memanggil `_handleAuthSuccess(employee)`, panggil `_stopNotificationSession()` terlebih dahulu.
- Simpan metadata employee/outlet yang sedang diregister (misalnya field `_currentNotificationEmployee`) agar unregister bisa tepat sasaran.
- Pastikan `_stopNotificationSession()` dipanggil di: `logout()`, `switchEmployee()`, dan saat dispose jika diperlukan.

**Acceptance Criteria:**
- Test `AuthCubit.switchEmployee()`: session notifikasi lama dihentikan sebelum session baru didaftarkan.
- Tidak ada duplikasi token/session aktif untuk employee berbeda di device yang sama.

---

### 2.5 Fix UX-SET-12: Index Screen Memakai Drawer/Menu, Bukan Back Navigation

Bergantung pada Fase 1.3 (route baru di bawah shell Setting).

#### [MODIFY] `index_categories_screen.dart`
- `lib/features/category/presentation/screens/index_categories_screen.dart`
- Ganti `showMenuButton: true` dengan back button (`onBackPressed: () => context.pop()` atau `context.go('/settings/setup-outlet')`).
- Bottom navbar tetap terlihat karena route sudah di dalam shell (hasil Fase 1.3).

#### [MODIFY] `index_laundry_services_screen.dart`
- `lib/features/laundry_service/presentation/screens/index_laundry_services_screen.dart`
- Ganti `showMenuButton: true` dengan back button ke Setup Outlet.

#### [MODIFY] `index_service_packages_screen.dart`
- `lib/features/service_package/presentation/screens/index_service_packages_screen.dart`
- Ganti `showMenuButton: true` dengan back button ke Setup Outlet.

#### [MODIFY] `index_membership_plan_screen.dart`
- `lib/features/membership_plan/presentation/screens/index_membership_plan_screen.dart`
- Ganti `showMenuButton: true` dengan back button ke Setup Outlet.

#### [MODIFY] `index_customers_screen.dart`
- `lib/features/customer/presentation/screens/index_customers_screen.dart`
- Ganti `showMenuButton: true` dengan back button ke Setup Outlet (jika dibuka dari Setup Outlet).
- Header harus context-aware: jika dibuka dari Setup Outlet -> back ke Setup Outlet; jika dari quick action -> back/pop sesuai stack.

**Header pattern yang direkomendasikan:**
- Title: nama modul (misal `Kategori`)
- Subtitle/context kecil: `Setup Outlet`
- Leading: back arrow ke `/settings/setup-outlet`
- Actions: search / filter / tambah jika relevan
- Bottom navbar: tetap visible

**Acceptance Criteria:**
- Tidak ada drawer/menu pada screen yang dibuka dari Setup Outlet.
- Back button jelas dan membawa user kembali ke Setup Outlet.

---

### 2.6 Redesign UX-SET-01, UX-SET-02, UX-SET-03: Setup Outlet sebagai Setup Center

#### [MODIFY] `setup_outlet_setting_screen.dart`
- `lib/features/setting/presentation/screens/setup_outlet_setting_screen.dart`
- Ubah dari `ListView` menu datar menjadi **Setup Center dashboard kecil**.
- Struktur tampilan baru:
  1. **Header section**: nama outlet, status readiness ("Siap transaksi" / "Setup belum lengkap").
  2. **Readiness checklist** (guided setup, UX-SET-02): stepper atau checklist dengan urutan natural:
     - Buat kategori layanan
     - Tambahkan layanan laundry dan harga
     - Cek paket layanan dari owner/admin
     - Cek membership plan
     - Tambahkan pelanggan atau mulai transaksi
  3. **Section `Master Layanan`**: card Kategori + card Layanan Laundry, masing-masing menampilkan count aktif/nonaktif, status, dan CTA.
  4. **Section `Produk dan Promo`**: card Paket Layanan + card Paket Membership (dengan badge `Dikelola owner` jika read-only).
  5. **Section `Relasi Pelanggan`**: card Database Pelanggan.
  6. **Section `Perlu Perhatian`** (opsional): tampilkan jika ada masalah seperti layanan tanpa kategori.
- Tambahkan CTA kontekstual berdasarkan state data:
  - Kategori kosong -> "Buat kategori pertama"
  - Kategori ada, layanan kosong -> "Tambah layanan pertama"
  - Ada layanan nonaktif -> "Review layanan nonaktif"
- Gunakan layout grid untuk tablet/desktop dan list untuk mobile.

#### [NEW] Cubit atau UseCase untuk Setup Outlet Readiness
- Buat cubit/state baru untuk mengambil summary data: count kategori aktif/nonaktif, count layanan aktif/nonaktif, count paket, count membership, count pelanggan.
- Dipakai oleh `SetupOutletSettingScreen` untuk menampilkan readiness cards dan checklist state.
- Nama yang disarankan: `SetupOutletReadinessCubit` atau gunakan `SetupOutletReadinessUseCase`.

**Acceptance Criteria:**
- `Setup Outlet` menampilkan overview readiness dan count data per modul.
- User bisa memahami urutan setup dari halaman ini tanpa membaca dokumentasi.
- CTA kontekstual muncul sesuai kondisi data real.

---

### 2.7 Fix UX-SET-04: CRUD Kategori/Layanan Masih Generik

#### [MODIFY] `index_categories_screen.dart` & `category_tile_card.dart`
- `lib/features/category/presentation/screens/index_categories_screen.dart`
- `lib/features/category/presentation/widgets/category_tile_card.dart`
- Tambahkan **quick toggle aktif/nonaktif** langsung dari card tanpa masuk ke halaman detail.
- Tambahkan info sekunder: jumlah layanan terkait per kategori.
- Secondary actions (edit/delete) masuk overflow menu.

#### [MODIFY] `index_laundry_services_screen.dart` & `laundry_service_card.dart`
- `lib/features/laundry_service/presentation/screens/index_laundry_services_screen.dart`
- `lib/features/laundry_service/presentation/widgets/laundry_service_card.dart`
- Card lebih padat: primary info = nama, harga/unit, kategori, status.
- Tambahkan fitur: **duplicate layanan**, **quick toggle aktif/nonaktif**.
- Untuk layar besar: gunakan table/list dense dengan kolom nama, kategori, satuan, harga, durasi, status, updated.
- Edit cepat via side sheet atau modal bottom sheet, bukan selalu full page navigate.

**Acceptance Criteria:**
- Quick toggle aktif/nonaktif bisa dilakukan tanpa membuka halaman detail.
- Duplicate layanan bisa dilakukan dari list.
- Layar besar menampilkan data lebih dense/tabel.

---

### 2.8 Fix UX-SET-05: Dependency UX Kategori/Satuan/Layanan Belum Membantu

#### [MODIFY] `laundry_service_form_section.dart`
- `lib/features/laundry_service/presentation/widgets/laundry_service_form_section.dart`
- Jika kategori kosong, ubah dropdown menjadi **empty state inline** dengan CTA `Buat kategori`.
- Tambahkan **quick-create category** dari form layanan via bottom sheet.
- Setelah quick-create kategori berhasil, langsung pilih kategori baru di dropdown form layanan.
- Jika datang dari halaman detail kategori, preselect kategori tersebut di form.
- Jika satuan gagal dimuat, tampilkan pesan jelas dan tombol retry.

#### [MODIFY] `create_laundry_service_screen.dart`
- `lib/features/laundry_service/presentation/screens/create_laundry_service_screen.dart`
- Tangani state "kategori kosong" di level screen untuk menampilkan banner informatif di atas form.

**Acceptance Criteria:**
- Jika kategori belum ada, user mendapat CTA inline untuk membuat kategori tanpa harus back.
- Setelah quick-create kategori, form layanan langsung terpilih kategori baru.

---

## Fase 3 — P2: Architecture Cleanup & UX Polish

---

### 3.1 Fix LCN-07: Aturan Navigation Ownership (GoRouter vs Navigator.push)

> **Catatan:** Ini adalah perbaikan arsitektur bertahap, bukan refactor total sekaligus. Prioritaskan route yang paling kritis untuk deep link, guard, dan notifikasi.

#### [MODIFY] Dokumentasi navigasi
- Tambahkan dokumentasi di `docs/` atau `AGENTS.md` yang mendefinisikan aturan navigation ownership:
  - **GoRouter**: untuk route yang perlu URL, guard, deep link, restore, dan notification target.
  - **Navigator imperative**: hanya untuk modal/local flow yang tidak perlu URL atau back stack global.

#### [NEW/MODIFY] GoRouter route untuk detail order
- `lib/core/router/app_router.dart`
- Tambahkan route `/orders/:orderId` (atau nested di bawah `/orders`).
- Dipakai oleh notification coordinator (LCN-05), bukan `Navigator.push(MaterialPageRoute(...))`.

#### [MODIFY] Route detail/form yang menjadi target notifikasi atau deep link
- Prioritaskan `ShowOrderScreen` untuk masuk GoRouter.
- Route setup outlet sudah dipindahkan di Fase 1.3.
- Finance dan route lain bisa diiterasi di sprint berikutnya.

**Acceptance Criteria:**
- Detail order bisa dibuka via GoRouter route.
- Notification tap menggunakan `context.push('/orders/:orderId')`.
- Ada dokumentasi aturan kapan pakai GoRouter vs Navigator.

---

### 3.2 Fix LCN-08: Cubit dan Service Root Tidak Ditutup pada Dispose

#### [MODIFY] `main.dart`
- `lib/main.dart`
- Tambahkan method `dispose()` di `AppDependencies` yang menutup semua cubit dan service yang dibuat manual.
- Panggil `AppDependencies.dispose()` dari `_MainAppState.dispose()` setelah remove lifecycle observer.
- Pastikan `NotificationService.dispose()` dipanggil.
- Pastikan dispose aman dipanggil sekali dan idempotent.

**Acceptance Criteria:**
- Hot restart atau widget replacement tidak meninggalkan stream subscription atau cubit yang terbuka.
- `NotificationService.dispose()` terpanggil saat `_MainAppState.dispose()`.

---

### 3.3 Fix LCN-09 & LCN-10: AuthGuard Cleanup dan Splash Router Ownership

#### [MODIFY atau DELETE] `auth_guard.dart`
- `lib/core/router/auth_guard.dart`
- Pilih salah satu pendekatan (keputusan implementor):
  - **Opsi A (Recommended):** Pindahkan predicate guard dari `AppRouter.redirect` ke `AuthGuard` agar protection bisa diuji secara modular. Update `AppRouter` untuk menggunakan `AuthGuard`.
  - **Opsi B:** Hapus `AuthGuard` karena logic sudah inline di `AppRouter.redirect`, untuk menghilangkan ambiguitas.

#### [MODIFY] `splash_screen.dart`
- `lib/features/splash/screens/splash_screen.dart`
- Hapus navigasi manual (`context.go(...)`) berdasarkan auth state final dari splash.
- Splash hanya bertugas: menjalankan animasi + trigger `checkAuthStatus()`.
- Router (`AppRouter.redirect`) yang mengambil seluruh keputusan redirect auth.

#### [MODIFY] `splash_screen_test.dart`
- `test/features/splash/screens/splash_screen_test.dart`
- Update ekspektasi: `AuthenticatedStale` seharusnya diserahkan ke router untuk redirect ke `/re-auth-pin`, bukan splash yang navigasi ke `/home`.

**Acceptance Criteria:**
- Satu-satunya sumber kebenaran redirect auth adalah router.
- Splash tidak memanggil `context.go(...)` berdasarkan auth state final.
- Test splash tidak berkonflik dengan aturan router.

---

### 3.4 Fix UX-SET-06: Paket/Membership Kurang Jelas Read-only atau Editable

#### [MODIFY] `setup_outlet_setting_screen.dart`
- Ubah copy item paket/membership dari `Kelola` menjadi `Lihat paket layanan` / `Lihat membership plan` jika role cashier adalah read-only.
- Tambahkan badge `Dikelola owner` pada card paket/membership di Setup Center.

#### [MODIFY] `index_service_packages_screen.dart` & `index_membership_plan_screen.dart`
- `lib/features/service_package/presentation/screens/index_service_packages_screen.dart`
- `lib/features/membership_plan/presentation/screens/index_membership_plan_screen.dart`
- Update empty state agar actionable:
  - "Belum ada paket layanan. Paket dibuat oleh owner. Hubungi owner atau sinkronkan data."
  - Tombol: `Muat ulang` jika relevan.
- Tampilkan FAB tambah hanya jika role memiliki akses; jangan hilangkan tanpa penjelasan.

**Acceptance Criteria:**
- Empty state paket/membership informatif dan tidak menyesatkan user.
- Role-based visibility jelas: FAB hanya muncul untuk role yang berwenang.

---

### 3.5 Fix UX-SET-07: Responsive Master-detail untuk Admin Setup

#### [MODIFY] `index_categories_screen.dart`
- `lib/features/category/presentation/screens/index_categories_screen.dart`
- Implementasikan `ResponsiveLayout` (pola yang sudah ada di `IndexOrdersScreen`):
  - Compact: list -> detail page -> edit page.
  - Medium/expanded: split view — kiri list, kanan detail/editor.

#### [MODIFY] `index_laundry_services_screen.dart`
- `lib/features/laundry_service/presentation/screens/index_laundry_services_screen.dart`
- Implementasikan responsive split view yang sama.

#### [MODIFY] `index_customers_screen.dart`
- `lib/features/customer/presentation/screens/index_customers_screen.dart`
- Implementasikan responsive split view yang sama.

**Acceptance Criteria:**
- Di tablet/desktop, list dan detail tampil berdampingan.
- Edit/create tidak selalu full page; gunakan side drawer atau right panel di layar besar.

---

### 3.6 Fix UX-SET-08: Konsistensi Visual Antar Modul

#### [NEW] Shared components untuk master data
- Lokasi yang disarankan: `lib/shared/widgets/master_data/` atau `lib/core/widgets/`
- Komponen yang perlu dibuat:
  - `MasterDataListItem` — list item standar untuk master data.
  - `MasterDataHeader` — header dengan title, subtitle, actions.
  - `SearchFilterToolbar` — toolbar standar dengan search, filter, sort.
  - `StatusBadge` — badge untuk status aktif/nonaktif/read-only.
- Kurangi gradient dekoratif untuk list admin; prioritaskan alignment, density, status, dan aksi.
- Card radius mengikuti design system, tidak banyak variasi antar modul.

#### [MODIFY] Semua index screen & widget setup outlet
- Migrasi komponen lama ke shared components baru secara bertahap, mulai dari kategori dan layanan.

**Acceptance Criteria:**
- Semua modul setup menggunakan komponen dan pattern yang konsisten secara visual.
- Tidak ada variasi card radius atau gradient yang tidak mengikuti design system.

---

### 3.7 Fix UX-SET-09: Delete/Edit Belum Menampilkan Impact Preview

#### [MODIFY] `index_categories_screen.dart` & `show_category_screen.dart`
- `lib/features/category/presentation/screens/index_categories_screen.dart`
- `lib/features/category/presentation/screens/show_category_screen.dart`
- Dialog delete kategori: tampilkan jumlah layanan terkait sebelum konfirmasi.
- Jika kategori punya layanan aktif: default action adalah `Nonaktifkan`, bukan `Hapus`.
- Contoh copy dialog: "Kategori ini memiliki N layanan aktif. Nonaktifkan kategori akan menyembunyikan layanan terkait dari transaksi baru."

#### [MODIFY] `index_laundry_services_screen.dart` & `show_laundry_service_screen.dart`
- `lib/features/laundry_service/presentation/screens/index_laundry_services_screen.dart`
- `lib/features/laundry_service/presentation/screens/show_laundry_service_screen.dart`
- Dialog delete layanan: tampilkan apakah layanan pernah dipakai di order, paket, atau membership.
- Pisahkan aksi `Nonaktifkan` dan `Hapus permanen` sesuai kondisi data.

**Acceptance Criteria:**
- Dialog destructive menampilkan jumlah relasi terdampak sebelum konfirmasi.
- `Nonaktifkan` tersedia sebagai alternatif `Hapus` untuk data yang punya relasi.

---

### 3.8 Fix UX-SET-10: Search, Filter, Sort, dan Status Management Belum Seragam

#### [MODIFY] `index_categories_screen.dart`
- Tambahkan filter status (Semua / Aktif / Nonaktif).
- Tambahkan sort (Nama, Terbaru, Jumlah Layanan).

#### [MODIFY] `index_laundry_services_screen.dart`
- Standarisasi toolbar: search + filter kategori/satuan/range harga + filter status + sort.
- Tambahkan count hasil pencarian/filter.

#### [MODIFY] `index_membership_plan_screen.dart`
- Pindahkan search dari local widget ke datasource/cubit.
- Standarisasi toolbar dengan filter status dan sort.

#### [MODIFY] `index_service_packages_screen.dart` & `index_customers_screen.dart`
- Standarisasi toolbar sesuai pola yang sama.
- Pelanggan: tambahkan filter aktif/nonaktif dan sort terakhir transaksi / nama.

**Acceptance Criteria:**
- Semua modul setup memiliki toolbar search/filter/sort yang konsisten.
- Filter status (Semua/Aktif/Nonaktif) tersedia di semua modul.
- Search membership dilakukan di datasource, bukan hanya lokal di widget.

---

## Urutan Eksekusi yang Direkomendasikan

```
Fase 1 (P0) — Dikerjakan paralel jika memungkinkan:
  [1.1] LCN-01: Fix re-auth PIN redirect
  [1.2] LCN-02: Fix session stale persistence
  [1.3] UX-SET-11: Fix route shell (paling banyak blocking item lain)

Fase 2 (P1) — Setelah Fase 1 selesai:
  [2.1] LCN-03: Lengkapi protected route
  [2.2] LCN-04: Fix query /orders?status=
  [2.3] LCN-05: Fix notification tap routing
  [2.4] LCN-06: Fix switch employee notification session
  [2.5] UX-SET-12: Fix back navigation index screens (bergantung 1.3)
  [2.6] UX-SET-01/02/03: Setup Outlet Setup Center redesign
  [2.7] UX-SET-04: CRUD ergonomics kategori/layanan
  [2.8] UX-SET-05: Dependency UX form layanan

Fase 3 (P2) — Setelah Fase 2 stabil:
  [3.1] LCN-07: Navigation ownership rules + GoRouter order detail route
  [3.2] LCN-08: Root dispose lifecycle
  [3.3] LCN-09/10: AuthGuard cleanup + splash router ownership
  [3.4] UX-SET-06: Read-only clarity paket/membership
  [3.5] UX-SET-07: Responsive master-detail
  [3.6] UX-SET-08: Konsistensi visual (shared components)
  [3.7] UX-SET-09: Impact preview delete/edit
  [3.8] UX-SET-10: Standarisasi search/filter/sort
```

---

## Acceptance Criteria Global

Semua item berikut harus terpenuhi sebelum plan dianggap selesai:

### Auth & Lifecycle
- [ ] Re-auth PIN sukses mengembalikan user ke route yang aman, tidak tersangkut di `/re-auth-pin`.
- [ ] App yang dibuka setelah idle lebih dari 4 jam (meski proses mati) tetap meminta PIN.
- [ ] Semua protected route redirect ke auth flow, tidak pernah menampilkan blank page.
- [ ] Satu sumber kebenaran untuk redirect auth: router, bukan splash.

### Navigation & Notification
- [ ] Query `/orders?status=...` benar-benar mengaktifkan filter orders.
- [ ] Tap push notification hanya membuka satu detail order, hanya jika outlet sesuai.
- [ ] Switch employee membersihkan session notifikasi lama sebelum mendaftarkan session baru.
- [ ] GoRouter route untuk detail order tersedia.

### Setup Outlet Navigation
- [ ] Dari `Setting -> Setup Outlet -> Kategori`, bottom navbar tetap terlihat.
- [ ] Dari `Setting -> Setup Outlet -> Layanan Laundry`, bottom navbar tetap terlihat.
- [ ] User bisa pindah ke Home/Dana/Transaksi/Setting dari screen kategori/layanan tanpa harus back dulu.
- [ ] Back button dari screen setup outlet jelas dan kembali ke Setup Outlet.
- [ ] Drawer/menu tidak dipakai untuk flow Setup Outlet.

### Setup Outlet UX
- [ ] `Setup Outlet` menampilkan overview readiness dan count data per modul.
- [ ] User memahami urutan setup dari halaman Setup Outlet tanpa dokumentasi.
- [ ] Form layanan membantu membuat kategori jika belum tersedia (inline CTA / quick-create).
- [ ] Paket dan membership jelas apakah read-only atau editable berdasarkan role.
- [ ] Layar besar memakai layout master-detail atau table-like untuk data setup.
- [ ] Search/filter/sort/status control konsisten antar modul setup.
- [ ] Delete/nonaktif data master menampilkan impact preview atau jumlah relasi terdampak.

### Testing
- [ ] Test router: redirect auth state, stale lifecycle, order query filter, notification routing.
- [ ] Test `AuthCubit`: switch employee, session stale persistence, notification stop/start.
- [ ] Test `ReAuthPinScreen`: sukses PIN -> navigasi dipulihkan.

---

## Referensi Issue

- [app_lifecycle_navigation_review_issues.md](../issue/app_lifecycle_navigation_review_issues.md) — LCN-01 s/d LCN-10
- [setting_setup_outlet_design_flow_review_issues.md](../issue/setting_setup_outlet_design_flow_review_issues.md) — UX-SET-01 s/d UX-SET-12
