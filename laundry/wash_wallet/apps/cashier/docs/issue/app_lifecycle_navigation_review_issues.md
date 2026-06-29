# Review Issue: App Lifecycle, Auth Flow, Navigation, dan Notification Routing

## Scope Review

Review ini hanya berisi feedback dan issue. Tidak ada perubahan implementasi pada kode aplikasi.

Area yang direview:

- App bootstrap dan dependency lifecycle.
- Auth state machine, session stale, re-auth PIN.
- GoRouter redirect, root shell navigation, nested navigation.
- Push notification lifecycle dan routing.
- Query route dan protected route behavior.

## Ringkasan Prioritas

| ID | Prioritas | Area | Ringkasan |
|---|---|---|---|
| LCN-01 | P0 | Auth lifecycle | Re-auth PIN yang sukses tetap tertahan di `/re-auth-pin`. |
| LCN-02 | P0 | Session lifecycle | Session stale hanya disimpan di memory, sehingga cold start bisa bypass re-auth 4 jam. |
| LCN-03 | P1 | Auth routing | Protected route tidak lengkap; beberapa route unauthenticated hanya menampilkan blank page. |
| LCN-04 | P1 | Navigation | Query `/orders?status=...` dikirim dari Home tetapi tidak dikonsumsi oleh router/screen. |
| LCN-05 | P1 | Push notification | Notification tap ditangani oleh dua jalur dan bypass GoRouter/outlet validation. |
| LCN-06 | P1 | Notification session | Switch employee tidak menghentikan session notifikasi employee/outlet sebelumnya. |
| LCN-07 | P2 | Navigation architecture | Navigasi bercampur antara GoRouter dan `Navigator.push`, membuat URL/back stack tidak konsisten. |
| LCN-08 | P2 | Resource lifecycle | Cubit/service dibuat manual tetapi tidak ditutup pada dispose root app. |
| LCN-09 | P2 | Routing maintainability | `AuthGuard` tidak dipakai, sementara guard logic tersebar di `AppRouter`. |
| LCN-10 | P2 | Splash/router ownership | Splash dan router sama-sama mengambil keputusan redirect auth. |

---

## LCN-01 - Re-auth PIN Sukses Tidak Keluar dari `/re-auth-pin`

Prioritas: P0

### Bukti kode

- `lib/core/services/app_lifecycle_observer.dart:11-12` memanggil `authCubit.checkIfStale()` saat app resume.
- `lib/features/auth/presentation/bloc/auth_cubit.dart:94-102` mengubah state dari `Authenticated` menjadi `AuthenticatedStale`.
- `lib/core/router/app_router.dart:89-91` mengarahkan `AuthenticatedStale` ke `/re-auth-pin`.
- `lib/features/auth/presentation/screens/re_auth_pin_screen.dart:40` memanggil `context.read<AuthCubit>().verifyPin(pin: _pin)`.
- `lib/features/auth/presentation/bloc/auth_cubit.dart:163-179` membuat verifikasi PIN sukses menjadi `Authenticated`.
- `lib/core/router/app_router.dart:94-101` hanya mengarahkan `Authenticated` dari `/login`, `/onboarding`, `/setup-pin`, dan `/access-denied` ke `/home`. `/re-auth-pin` tidak termasuk.
- `lib/features/auth/presentation/screens/re_auth_pin_screen.dart:58-67` listener hanya menangani `AuthFailureState`; tidak ada navigasi saat `Authenticated`.

### Dampak

User yang session-nya stale diminta memasukkan PIN. Setelah PIN benar, state sudah `Authenticated`, tetapi screen tetap berada di `/re-auth-pin`. Karena app bar juga menonaktifkan back button (`automaticallyImplyLeading: false`), user berisiko tersangkut di halaman verifikasi sesi.

### Rekomendasi

- Tentukan intended destination saat redirect ke `/re-auth-pin`, misalnya melalui query/extra atau state route.
- Setelah `Authenticated`, redirect dari `/re-auth-pin` ke intended destination atau minimal `/home`.
- Tambahkan test router untuk skenario: mulai dari `/re-auth-pin`, state berubah `Authenticated`, hasil route harus keluar dari `/re-auth-pin`.
- Tambahkan test widget `ReAuthPinScreen` untuk memastikan sukses PIN memulihkan navigasi.

---

## LCN-02 - Session Stale Tidak Persist Setelah App Restart atau Process Kill

Prioritas: P0

### Bukti kode

- `lib/features/auth/presentation/bloc/auth_cubit.dart:26-27` menyimpan `_lastActivityAt` sebagai field memory dan threshold 4 jam.
- `lib/features/auth/presentation/bloc/auth_cubit.dart:90-102` hanya membandingkan `DateTime.now()` dengan `_lastActivityAt`.
- `lib/core/services/app_lifecycle_observer.dart:13-15` hanya memanggil `recordActivity()` saat lifecycle `paused`.
- `lib/features/auth/presentation/bloc/auth_cubit.dart:77-88` `checkAuthStatus()` langsung memanggil `_handleAuthSuccess(employee)` tanpa mengecek timestamp inactive yang persisten.

### Dampak

Jika app masuk background lalu OS membunuh proses, `_lastActivityAt` hilang. Saat app dibuka lagi setelah lebih dari 4 jam, `checkAuthStatus()` dapat langsung mengembalikan `Authenticated`, sehingga re-auth PIN tidak muncul walaupun requirement UI menyebut verifikasi ulang setelah 4 jam tidak aktif.

### Rekomendasi

- Simpan timestamp terakhir inactive/paused ke storage persisten (`SharedPreferences` cukup untuk timestamp non-rahasia).
- Pada bootstrap auth (`checkAuthStatus()`), setelah token valid dan employee didapat, cek timestamp tersebut sebelum emit `Authenticated`.
- Pertimbangkan lifecycle state lain selain `paused`, terutama `inactive`, `hidden`, atau `detached` untuk platform desktop/web/mobile yang didukung project.
- Gunakan injectable clock/time provider agar test session stale tidak bergantung pada waktu real.

---

## LCN-03 - Protected Route Coverage Tidak Lengkap dan Fallback Blank Page

Prioritas: P1

### Bukti kode

- `lib/core/router/app_router.dart:104-112` saat unauthenticated hanya menjaga `/home`, `/orders`, `/customers`, `/settings`, `/finances`, dan `/outlets`.
- Route protected lain seperti `/categories`, `/laundry-services`, `/service-packages`, dan `/membership-plans` tidak masuk daftar redirect.
- Page builder untuk route tersebut mengembalikan blank fallback saat auth state bukan `Authenticated`/`AuthenticatedStale`:
  - `lib/core/router/app_router.dart:306`
  - `lib/core/router/app_router.dart:322`
  - `lib/core/router/app_router.dart:338`
  - `lib/core/router/app_router.dart:354`
  - `lib/core/router/app_router.dart:370`

### Dampak

Deep link atau navigasi langsung ke route setup outlet ketika user belum auth dapat menghasilkan layar kosong, bukan diarahkan ke login/switch employee. Ini sulit dipahami user dan menyulitkan debugging karena route terlihat valid tetapi kontennya `SizedBox`.

### Rekomendasi

- Definisikan daftar protected route secara eksplisit dan lengkap.
- Hindari fallback `SizedBox` untuk route yang butuh auth; lebih baik redirect ke auth flow.
- Jika ingin mendukung return-to-destination setelah login, simpan intended route sebelum redirect.
- Integrasikan atau hapus `AuthGuard` agar tidak ada dua konsep guard yang berbeda.

---

## LCN-04 - Query `/orders?status=...` Tidak Dikonsumsi oleh Orders Screen

Prioritas: P1

### Bukti kode

- Home mengirim query status:
  - `lib/features/home/presentation/screens/home_screen.dart:216-218`
  - `lib/features/home/presentation/screens/home_screen.dart:265`
- `IndexOrdersScreen` sudah punya parameter `initialStatusFilter`:
  - `lib/features/order/presentation/screens/index_orders_screen.dart:14-22`
  - `lib/features/order/presentation/screens/index_orders_screen.dart:48-51`
- `AppRouter` membuat `IndexOrdersScreen(outletId: ...)` tanpa membaca `state.uri.queryParameters['status']`:
  - `lib/core/router/app_router.dart:213-226`

### Dampak

Tap KPI dari Home seperti produksi, belum diambil, sudah diambil, atau requested mengubah URL menjadi `/orders?status=...`, tetapi list order tetap memakai filter default. User mengira filter sudah aktif karena navigasi berasal dari metrik spesifik, tetapi data yang tampil tidak sesuai konteks.

### Rekomendasi

- Di route `/orders`, pass `state.uri.queryParameters['status']` ke `IndexOrdersScreen.initialStatusFilter`.
- Karena `StatefulShellRoute.indexedStack` mempertahankan widget tree, tambahkan handling saat query berubah setelah screen sudah hidup, misalnya `didUpdateWidget` atau listener route state untuk memperbarui `_selectedStatus` dan reload data.
- Tambahkan test untuk navigasi `/orders?status=requested` dan pastikan `OrderCubit.getAll(status: 'requested')` dipanggil.

---

## LCN-05 - Notification Tap Punya Dua Jalur dan Bypass Router/Outlet Guard

Prioritas: P1

### Bukti kode

- `PushNotificationCoordinator` mendaftarkan listener `FirebaseMessaging.onMessageOpenedApp`:
  - `lib/core/navigation/push_notification_coordinator.dart:14-16`
- `NotificationService` juga mendaftarkan listener `FirebaseMessaging.onMessageOpenedApp`:
  - `lib/core/services/notification_service.dart:318-323`
- Initial message juga dibaca dua kali:
  - `lib/core/navigation/push_notification_coordinator.dart:18-23`
  - `lib/core/services/notification_service.dart:325-332`
- Coordinator membuka detail order dengan `Navigator.of(context).push(MaterialPageRoute(...))`, bukan GoRouter:
  - `lib/core/navigation/push_notification_coordinator.dart:54-62`
- Home juga membuka detail order dari stream notification tap dengan `Navigator.push`:
  - `lib/features/home/presentation/screens/home_screen.dart:49-52`
  - `lib/features/home/presentation/screens/home_screen.dart:269-285`
- Coordinator tidak menolak payload outlet yang berbeda dari outlet authenticated; `payloadOutletId ?? outletId` tetap dipakai:
  - `lib/core/navigation/push_notification_coordinator.dart:46-51`

### Dampak

Satu tap notifikasi dapat diproses oleh dua jalur yang berbeda, terutama saat app sudah berada di foreground/background dengan Home aktif. Risiko yang muncul:

- Detail order terbuka ganda.
- Back stack tidak konsisten karena bypass GoRouter.
- Payload outlet yang tidak sesuai dengan outlet session saat ini tetap bisa membuka `ShowOrderScreen`.
- Initial notification behavior sulit diprediksi karena `getInitialMessage()` dipanggil lebih dari satu tempat.

### Rekomendasi

- Jadikan satu service sebagai pemilik tunggal notification tap routing.
- Buat route GoRouter untuk detail order, misalnya `/orders/:orderId`, atau named route yang menerima `orderId` dan `outletId`.
- Validasi `payloadOutletId == authenticatedOutletId`; jika berbeda, abaikan payload atau tampilkan error yang aman.
- Pisahkan "event new order" untuk badge/banner dari "tap navigation" agar tidak saling menduplikasi.
- Tambahkan test coordinator untuk payload outlet mismatch dan duplicate listener behavior.

---

## LCN-06 - Switch Employee Tidak Menghentikan Notification Session Lama

Prioritas: P1

### Bukti kode

- `switchEmployee()` saat sukses langsung memanggil `_handleAuthSuccess(employee)`:
  - `lib/features/auth/presentation/bloc/auth_cubit.dart:182-215`
- `_handleAuthSuccess()` selalu memulai session notifikasi baru:
  - `lib/features/auth/presentation/bloc/auth_cubit.dart:73-75`
- `_startNotificationSession()` mendaftarkan FCM token dan connect Pusher untuk outlet employee baru:
  - `lib/features/auth/presentation/bloc/auth_cubit.dart:250-277`
- `_stopNotificationSession()` hanya dipanggil dari `logout()`:
  - `lib/features/auth/presentation/bloc/auth_cubit.dart:217-228`
  - `lib/features/auth/presentation/bloc/auth_cubit.dart:280-292`

### Dampak

Saat user switch employee tanpa logout, token/session employee sebelumnya tidak secara eksplisit dilepas dari backend. Jika backend tidak melakukan upsert by token/device secara ketat, device bisa tetap menerima push untuk employee/outlet lama. Ini juga memperbesar risiko payload outlet mismatch yang disebut di LCN-05.

### Rekomendasi

- Saat switch employee dari user yang sudah authenticated, hentikan session notifikasi lama sebelum register session baru.
- Simpan metadata employee/outlet yang sedang diregister agar unregister bisa tepat.
- Pastikan backend registration bersifat idempotent by device/token, bukan menambah record duplikat.
- Tambahkan test AuthCubit untuk switch employee: old token removed/disconnected sebelum new token registered/connected.

---

## LCN-07 - Campuran GoRouter dan `Navigator.push` Membuat Back Stack/URL Tidak Konsisten

Prioritas: P2

### Bukti kode

- Root app memakai `MaterialApp.router` dan `GoRouter`:
  - `lib/main.dart:317-324`
  - `lib/core/router/app_router.dart:57-118`
- Root tab sudah memakai `StatefulShellRoute.indexedStack`:
  - `lib/core/router/app_router.dart:168-292`
- Beberapa flow utama tetap memakai `Navigator.push(MaterialPageRoute)`:
  - `lib/features/home/presentation/screens/home_screen.dart:274-282`
  - `lib/features/home/presentation/screens/home_screen.dart:295-302`
  - `lib/features/finances/presentation/screens/index_finances_screen.dart:284-303`
  - `lib/features/order/presentation/screens/index_orders_screen.dart:268-286`
  - Banyak CRUD setup outlet juga memakai `Navigator.push`.

### Dampak

Sebagian navigasi tidak tercermin di URL dan tidak bisa di-deep-link. Ini juga membuat guard/redirect GoRouter sulit menjadi satu sumber kebenaran, terutama untuk route detail/form yang dibuka secara imperative.

Catatan: Dalam beberapa kasus, push imperative di dalam branch navigator masih bisa mempertahankan stack tab. Issue ini bukan berarti semua `Navigator.push` harus dihapus, tetapi arsitektur saat ini belum punya aturan jelas kapan harus GoRouter dan kapan imperative.

### Rekomendasi

- Definisikan aturan navigation ownership:
  - GoRouter untuk route yang perlu URL, guard, restore, deep link, dan notification target.
  - Navigator imperative hanya untuk modal/local flow yang tidak perlu URL.
- Prioritaskan route detail order dan notification target untuk masuk GoRouter.
- Dokumentasikan behavior back stack per tab setelah `StatefulShellRoute`.

---

## LCN-08 - Cubit dan Service Root Tidak Ditutup pada Dispose

Prioritas: P2

### Bukti kode

- Dependencies dan cubit dibuat manual di `_initializeDependencies()`:
  - `lib/main.dart:101-150`
- Provider memakai `BlocProvider.value`, sehingga provider tidak memiliki ownership untuk close cubit:
  - `lib/main.dart:269-306`
- `_MainAppState.dispose()` hanya melepas lifecycle observer:
  - `lib/main.dart:257-260`
- `NotificationService.dispose()` tersedia tetapi tidak dipanggil dari root app:
  - `lib/core/services/notification_service.dart:274-283`

### Dampak

Pada app mobile normal, proses app mungkin berakhir sehingga efeknya tidak langsung terasa. Namun untuk hot restart, integration test, app embedding, atau root widget replacement, stream subscription, cubit, audio player, Pusher, dan controller bisa tidak tertutup rapi.

### Rekomendasi

- Tambahkan method dispose di `AppDependencies` untuk close semua cubit/service yang dibuat manual.
- Panggil method tersebut dari `_MainAppState.dispose()` setelah remove observer.
- Alternatif: gunakan provider yang memiliki ownership (`BlocProvider(create: ...)`) untuk dependency yang tidak perlu dibuat sebelum `runApp`.
- Pastikan dispose aman dipanggil sekali dan tidak menutup singleton yang masih dipakai test lain tanpa reset eksplisit.

---

## LCN-09 - `AuthGuard` Tidak Dipakai

Prioritas: P2

### Bukti kode

- `lib/core/router/auth_guard.dart:3-21` mendefinisikan `AuthGuard`.
- Pencarian pemakaian menunjukkan logic guard aktual berada inline di `lib/core/router/app_router.dart:61-117`.

### Dampak

Ada dua tempat yang terlihat seperti sumber aturan auth, tetapi hanya satu yang aktif. Ini bisa menyesatkan model/engineer berikutnya saat memperbaiki protected route dan stale session.

### Rekomendasi

- Hapus `AuthGuard` jika memang tidak dipakai.
- Atau pindahkan predicate guard dari `AppRouter.redirect` ke `AuthGuard` agar route protection bisa diuji lebih kecil dan reusable.

---

## LCN-10 - Splash dan Router Sama-sama Mengambil Keputusan Redirect Auth

Prioritas: P2

### Bukti kode

- Router sudah memiliki redirect berdasarkan `AuthState`:
  - `lib/core/router/app_router.dart:61-117`
- Splash juga melakukan navigasi manual setelah `checkAuthStatus()`:
  - `lib/features/splash/screens/splash_screen.dart:63-83`
  - `lib/features/splash/screens/splash_screen.dart:85-102`
- Test splash saat ini mengharapkan `AuthenticatedStale` menuju `/home`:
  - `test/features/splash/screens/splash_screen_test.dart:177-185`
- Router justru punya rule `AuthenticatedStale` menuju `/re-auth-pin`:
  - `lib/core/router/app_router.dart:89-91`

### Dampak

Policy auth menjadi ambigu. Splash dan router bisa berkembang tidak sinkron, seperti terlihat pada perbedaan ekspektasi `AuthenticatedStale`. Ini juga membuat race/double navigation lebih mungkin terjadi karena splash memanggil `context.go(...)` sementara router redirect juga aktif dari stream auth.

### Rekomendasi

- Jadikan router sebagai satu-satunya pemilik redirect auth.
- Splash cukup menjalankan animasi dan memicu `checkAuthStatus()`, tanpa `context.go(...)` berdasarkan auth state final.
- Jika onboarding/remembered-account perlu keputusan async, pindahkan ke state auth eksplisit atau redirect helper yang dipakai router.
- Update test agar mencerminkan policy tunggal: stale session harus re-auth atau home, tetapi jangan dua-duanya.

---

## Saran Acceptance Criteria untuk Plan Berikutnya

- Re-auth stale session berhasil mengembalikan user ke route yang aman dan tidak tertahan di `/re-auth-pin`.
- App yang dibuka lagi setelah idle lebih dari 4 jam tetap meminta PIN walaupun proses sebelumnya mati.
- Semua protected route punya redirect yang konsisten dan tidak pernah menampilkan blank page untuk user unauthenticated.
- `/orders?status=requested` dan status lain benar-benar mengaktifkan filter orders.
- Tap push notification hanya membuka satu detail order dan hanya jika outlet payload sesuai outlet session.
- Switch employee membersihkan session notifikasi lama sebelum mendaftarkan session baru.
- Ada test untuk redirect auth, stale lifecycle, order query filter, dan notification routing.
