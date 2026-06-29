# Context: WashWallet Customer App untuk Portofolio

Tanggal review: 2026-06-14

Dokumen ini adalah context brief untuk AI model lain yang akan menyusun materi portofolio WashWallet Customer App. Tujuannya memberi konteks produk, fitur, alur pengguna, technical highlights, materi visual yang disarankan, serta batas klaim yang aman berdasarkan kode aplikasi customer di repository.

## Ringkasan Produk

WashWallet Customer App adalah aplikasi konsumen untuk mencari outlet laundry, memilih layanan, membuat pesanan, mengatur pickup/delivery, membayar pesanan, mengelola saldo, alamat, profil, dan memantau status order. Aplikasi ini adalah sisi customer-facing dari ekosistem WashWallet, terhubung dengan Cashier App dan Production App melalui backend yang sama.

Platform target mengikuti Flutter multi-platform: Android, iOS, Web, Windows, macOS, dan Linux. Untuk portofolio, aplikasi ini paling relevan diposisikan sebagai mobile customer app untuk pemesanan laundry on-demand dan self-service account management.

## Masalah yang Diselesaikan

- Customer tidak perlu datang langsung ke outlet hanya untuk melihat layanan, harga, promo, atau membuat order.
- Customer bisa memilih outlet dan layanan berdasarkan lokasi, pencarian, rating, kategori, harga, dan dukungan kurir.
- Proses pickup dan delivery dibuat lebih jelas: customer memilih alamat, tanggal, slot jadwal, metode pengambilan, dan metode pengantaran.
- Customer punya kontrol atas pembayaran, saldo deposit, topup, histori pesanan, invoice, pembatalan, penjadwalan delivery, dan review.
- Outlet mendapatkan order yang lebih terstruktur karena pilihan layanan, alamat, jadwal, catatan, dan metode pembayaran sudah dikirim dari aplikasi customer.

## Fitur Utama yang Perlu Disajikan

### 1. Onboarding dan Auth Customer

- App memiliki splash, onboarding, welcome, login, register start, OTP, register, dan login password flow.
- Auth customer mendukung:
  - request OTP berdasarkan nomor HP
  - verify OTP
  - register customer baru setelah OTP valid
  - login dengan password untuk customer yang sudah punya password
  - logout
  - check auth status saat app dibuka
- Setelah authenticated, app mengarahkan user ke `/home`.
- Jika customer belum authenticated, route protected diarahkan ke welcome/auth flow.
- Customer dapat membuat password setelah login OTP agar login berikutnya lebih praktis.
- FCM token customer dikirim ke backend setelah authenticated.

Portfolio angle:
Auth flow ini menggabungkan OTP-first onboarding dengan opsi password, sehingga cocok untuk customer Indonesia yang biasa login memakai nomor HP tetapi tetap bisa punya login lebih cepat.

### 2. Home Dashboard Customer

- Home dashboard mengambil data dari backend melalui customer home dashboard endpoint.
- Informasi utama di home:
  - alamat primary customer
  - saldo deposit/customer wallet
  - jumlah recent/active orders
  - shortcut topup
  - shortcut order history
  - pending payment shortcut jika ada order unpaid
  - promo section
- Header home menyediakan akses ke address management, cart/order summary, dan search.

Portfolio angle:
Home berfungsi sebagai personal command center: customer langsung melihat alamat aktif, saldo, order berjalan, payment pending, dan promo.

### 3. Search dan Discovery Outlet/Layanan

- Search screen menyimpan histori pencarian lokal.
- Ada default suggestion seperti cuci kiloan, cuci kering, express, setrika, karpet, bed cover, sepatu, dan jas.
- Discovery screen mendukung:
  - rekomendasi outlet berdasarkan lokasi
  - pencarian service
  - quick filter
  - sort selector
  - infinite scroll/load more
  - refresh
  - corrected query dari backend jika tersedia
  - filter berdasarkan outlet, category, unit, price, free shipping eligible, courier support, currently open, minimum rating, dan payment method melalui `DiscoveryFilter`
- Discovery memakai lokasi aktif dari address/location picker jika tersedia, atau mencoba current GPS position.
- Dari hasil discovery, customer bisa membuka outlet atau langsung membuka service tertentu di outlet.

Portfolio angle:
Ini bisa disajikan sebagai marketplace-style discovery untuk layanan laundry, bukan hanya list outlet statis.

### 4. Outlet Detail dan Service Selection

- Customer dapat melihat daftar outlet dan outlet detail.
- Outlet list mendukung nearby outlet berdasarkan latitude/longitude.
- Outlet detail menampilkan banner outlet, kategori layanan, layanan populer, dan section layanan per kategori.
- Customer dapat membuka detail layanan dalam bottom sheet.
- Customer dapat menambahkan service ke cart.
- Cart dibatasi per outlet aktif. Jika customer mencoba menambahkan layanan dari outlet lain, app menampilkan konfirmasi untuk mengganti outlet dan menghapus pilihan sebelumnya.
- Service yang tidak mendukung courier ditandai dan memengaruhi eligibility checkout courier.
- Outlet info screen menampilkan detail outlet, rating summary, rating filter, dan list ulasan dengan pagination.

Portfolio angle:
Fitur outlet/service selection menunjukkan UX e-commerce yang disesuaikan untuk laundry: layanan dipilih dari outlet, dikategorikan, dan cart menjaga konsistensi outlet.

### 5. Cart Persisted per Outlet

- Cart state disimpan di `SharedPreferences` agar tidak hilang saat app dibuka ulang.
- Cart menyimpan:
  - active outlet id
  - active outlet name
  - selected service ids
  - service ids yang tidak mendukung courier
- Cart mendeteksi konflik outlet.
- Cart mendukung add service, remove service, switch outlet and add, clear cart, dan clear all carts.

Portfolio angle:
Cart dibuat sederhana tetapi operasional: menjaga agar satu order hanya berasal dari satu outlet, sambil tetap persist antar sesi.

### 6. Order Summary dan Checkout

- Checkout berada di `/order-summary`.
- App memuat detail outlet, alamat customer, courier schedule, courier pricing, dan selected services.
- Checkout menampilkan:
  - outlet info
  - layanan terpilih
  - metode pengambilan baju kotor
  - jadwal pickup kurir jika courier dipilih
  - metode pengantaran baju bersih
  - estimasi/fee courier
  - metode pembayaran
  - catatan optional
- Pickup type mendukung courier dan self dropoff.
- Delivery type mendukung pickup sendiri atau delivery tergantung dukungan outlet/courier.
- Jika courier dipakai, customer wajib memilih alamat, tanggal pickup, dan slot schedule.
- Courier fee dihitung dari outlet, koordinat alamat, customer, address id, dan order total.
- Jika outlet tidak mendukung courier atau service tidak mendukung courier, checkout menampilkan warning/banner dan mengarahkan flow ke self dropoff.
- Setelah order berhasil dibuat, cart dibersihkan dan customer diarahkan ke order success.

Portfolio angle:
Checkout bisa ditonjolkan sebagai flow yang adaptif: UI dan validasi berubah sesuai kemampuan outlet, layanan, alamat, dan pengaturan courier.

### 7. Order History, Detail, Invoice, Payment, dan Review

- Customer dapat melihat daftar order miliknya dengan pagination, search, status filter, dan refresh.
- Detail order menampilkan:
  - status order
  - instruksi pending dropoff jika order perlu diantar customer ke outlet
  - informasi order
  - item order
  - ringkasan harga
  - action button kontekstual
- Aksi order yang tersedia tergantung status dan backend flags:
  - cancel order untuk status requested, pending, atau pending_dropoff
  - pay now jika order bisa dibayar
  - schedule delivery jika delivery masih bisa dijadwalkan
  - complete order saat status delivered
  - submit review melalui usecase review
- Invoice screen mendukung:
  - payment method summary
  - wallet/deposit balance summary
  - payment confirmation bottom sheet
  - external payment URL untuk payment tertentu
  - COD instruction
  - redirect ke schedule delivery setelah payment success
- Jika wallet balance tidak cukup, app menampilkan CTA topup saldo.

Portfolio angle:
Order lifecycle customer tidak berhenti di checkout. Customer bisa membayar, membatalkan, menjadwalkan delivery, menyelesaikan pesanan, dan memberi review.

### 8. Address Book

- Customer dapat mengelola alamat pada route `/customer-addresses`.
- Address management mendukung:
  - list address
  - create address
  - edit address
  - delete address
  - mark primary address
  - pagination/search/filter primary
- Data address mencakup:
  - label
  - recipient name
  - recipient phone
  - street
  - notes
  - latitude dan longitude
  - province/regency/district/village id dan name
  - primary flag
- Home dan checkout menggunakan primary address sebagai default.

Portfolio angle:
Address book penting untuk laundry pickup/delivery karena alamat bukan sekadar teks, tetapi membawa koordinat dan data wilayah untuk fee dan schedule.

### 9. Courier Pickup dan Delivery Scheduling

- Customer dapat memilih courier pickup saat checkout jika outlet dan service mendukung.
- App mengambil schedule courier berdasarkan outlet, day of week, type, dan date.
- Customer memilih tanggal dan slot waktu pickup.
- Customer dapat menjadwalkan delivery untuk order tertentu setelah memenuhi kondisi backend.
- Delivery schedule screen:
  - memilih tanggal pengiriman
  - menampilkan disabled days dari setting courier
  - mengambil slot delivery berdasarkan hari dan tanggal
  - menampilkan alamat pengiriman berdasarkan delivery/pickup address order
  - submit jadwal delivery ke backend
- Courier pricing mengambil setting summary dan menghitung fee berdasarkan alamat serta order total.

Portfolio angle:
Scheduling membuat customer experience lebih predictable: customer bisa memilih kapan pakaian dijemput dan kapan pakaian bersih dikirim.

### 10. Topup dan Wallet/Deposit

- Customer memiliki saldo deposit/wallet.
- Topup flow memiliki route:
  - `/topup`
  - `/topup/create`
  - `/topup/:id`
  - `/topup/payment/:id`
- Customer dapat membuat topup dengan nominal dan metode pembayaran.
- Jika metode bank transfer dipilih, customer harus memilih bank.
- Setelah topup dibuat, customer diarahkan ke payment instruction screen.
- Payment screen melakukan polling status setiap 10 detik sebagai fallback.
- Payment screen juga mendengarkan FCM foreground message `topup_success`.
- Jika topup sukses, customer melihat success state dan kembali ke riwayat.

Portfolio angle:
Topup menunjukkan closed-loop payment UX: create topup, instruction, status polling, FCM update, success feedback, dan saldo dapat dipakai untuk order.

### 11. Profile, Account Health, dan Security

- Profile screen menggunakan `CustomerAuthAuthenticated.customer` sebagai sumber data auth customer.
- Profile menampilkan:
  - account header
  - status card jika profile belum lengkap, belum verified, atau inactive
  - summary customer dengan edit profile entry point
  - password setup card jika customer belum punya password
  - wallet card
  - quick actions
  - recent activity
  - menu section
  - logout button
- Edit profile mendukung update:
  - name
  - email
  - gender
  - date of birth
- Phone ditampilkan sebagai identifier yang tidak bisa diubah.
- Validasi edit profile:
  - name wajib
  - email format valid jika diisi
  - gender hanya male/female
  - date of birth tidak boleh tanggal masa depan
- Set password screen memvalidasi minimal 8 karakter dan password confirmation.

Portfolio angle:
Profile bukan hanya halaman data diri, tetapi juga account health checklist agar customer melengkapi data yang dibutuhkan untuk transaksi.

### 12. Push Notification Customer

- App menggunakan Firebase Messaging dan local notifications.
- Payload yang terkonfirmasi: `customer_order_accepted`.
- Saat order diterima outlet, customer menerima notification "Pesanan Anda Diterima".
- Body notification menampilkan jadwal pickup jika tersedia.
- Notification foreground memicu local notification dan stream `onOrderAccepted`.
- Notification tap diarahkan ke `/orders/{orderId}` setelah user authenticated dan router siap.
- Deduplication event dilakukan dalam window 60 detik.

Portfolio angle:
Notification membuat status order lebih proaktif. Customer tidak perlu terus membuka app untuk tahu bahwa order sudah diterima.

## Alur End-to-End yang Bisa Diceritakan

1. Customer membuka app, melewati onboarding, lalu login/register memakai nomor HP dan OTP.
2. Customer melihat home dashboard berisi alamat utama, saldo, order aktif, pending payment, dan promo.
3. Customer mencari layanan atau outlet melalui search/discovery.
4. Customer membuka outlet, melihat layanan per kategori, lalu menambahkan layanan ke cart.
5. Customer masuk checkout, memilih pickup courier/self dropoff, alamat, jadwal pickup, delivery type, payment method, dan catatan.
6. App menghitung courier fee bila diperlukan.
7. Customer membuat order dan masuk ke order success.
8. Jika perlu bayar, customer membuka invoice dan membayar dengan wallet/payment link/COD sesuai metode.
9. Customer memantau order di order detail/history.
10. Jika delivery tersedia, customer menjadwalkan pengantaran pakaian bersih.
11. Customer mendapat push notification ketika order diterima.
12. Setelah order delivered, customer mengonfirmasi selesai dan dapat memberi review.

## Technical Highlights

- Flutter app dengan target multi-platform.
- Clean Architecture per feature: data, domain, presentation.
- State management memakai `flutter_bloc` Cubit.
- Routing memakai `go_router` dengan auth/onboarding-aware redirect dan `StatefulShellRoute` untuk bottom navigation.
- Network layer memakai `dio`, `AuthInterceptor`, `LoggingInterceptor`, dan `ApiEndpoints.customer()`.
- Shared packages:
  - `wash_wallet_core`
  - `wash_wallet_domain`
  - `wash_wallet_ui`
- Secure auth token storage memakai `flutter_secure_storage`.
- Local persistence memakai `SharedPreferences` untuk cart dan search history.
- Firebase Messaging untuk customer push notification dan topup success signal.
- Flutter Local Notifications untuk system notification.
- Location integration untuk discovery dan address/location context.
- `intl` locale `id_ID` dan `en_US` untuk tanggal, currency, dan schedule day mapping.
- URL launcher dipakai untuk membuka external payment URL.
- UI memakai design system internal: `AppLayout`, `AppHeader`, `AppButton`, `AppCard`, `AppBottomSheet`, `AppSnackbar`, loading, empty, dan error state.

## API/Backend Surface yang Relevan

Endpoint prefix customer: `/mobile/customer`.

Endpoint yang tampak dari shared `ApiEndpoints` dan app customer:

- `POST /mobile/customer/auth/login`
- `POST /mobile/customer/auth/logout`
- `GET /mobile/customer/auth/me`
- `GET /mobile/customer/auth/validate`
- `POST /mobile/customer/auth/fcm-token`
- `GET /mobile/customer/dashboard/home`
- `GET /mobile/customer/outlets`
- `GET /mobile/customer/outlets/nearby`
- `GET /mobile/customer/outlets/{id}`
- `GET /mobile/customer/outlets/{id}/reviews`
- `GET /mobile/customer/outlets/{id}/review-summary`
- `GET /mobile/customer/categories`
- `GET /mobile/customer/laundry-services`
- `GET /mobile/customer/addresses`
- `POST /mobile/customer/addresses`
- `GET /mobile/customer/addresses/{id}`
- `PATCH/PUT /mobile/customer/addresses/{id}`
- `DELETE /mobile/customer/addresses/{id}`
- `GET /mobile/customer/orders`
- `POST /mobile/customer/orders`
- `GET /mobile/customer/orders/{id}`
- `POST /mobile/customer/orders/{id}/cancel`
- `POST /mobile/customer/orders/{id}/pay`
- `POST /mobile/customer/orders/{id}/schedule-delivery`
- `POST /mobile/customer/orders/{id}/complete`
- `GET /mobile/customer/courier-schedules`
- `GET /mobile/customer/courier-settings/{outletId}`
- `POST /mobile/customer/courier-settings/{outletId}/calculate-fee`
- `GET /mobile/customer/order-reviews`
- `POST /mobile/customer/order-reviews`
- `GET /mobile/customer/topups`
- `POST /mobile/customer/topups`
- `GET /mobile/customer/topups/{id}`

Catatan: auth OTP/register/password/update profile endpoints ada melalui domain usecases dan provider customer auth; path persisnya perlu dicek di datasource auth jika materi portofolio ingin menampilkan endpoint secara detail.

## Materi Visual yang Disarankan

- Splash/onboarding/welcome screen.
- Login OTP dan register flow.
- Home dashboard dengan alamat utama, saldo, active order, pending payment, dan promo.
- Search screen dengan history dan suggestions.
- Discovery screen dengan filter/sort dan rekomendasi outlet/layanan.
- Outlet detail dengan kategori, popular services, dan floating cart button.
- Service detail bottom sheet.
- Cart conflict dialog saat pindah outlet.
- Order summary checkout dengan pickup/delivery selector, schedule, fee estimate, payment method, dan notes.
- Order success screen.
- Order detail dengan actions: pay, cancel, schedule delivery, complete.
- Invoice/payment screen, termasuk wallet insufficient state dan topup CTA.
- Address book create/edit.
- Topup create dan topup payment instruction/success state.
- Profile screen dengan status card, wallet card, edit profile, dan set password.
- Push notification order accepted.

## Angle Portofolio yang Kuat

- Customer self-service: customer bisa mencari, memesan, membayar, menjadwalkan, dan melacak order tanpa bergantung penuh pada kasir.
- Marketplace-like laundry discovery: search, filter, recommendation, nearby outlets, service categories, and ratings.
- Courier-aware checkout: flow checkout berubah mengikuti outlet capability, service courier support, alamat, schedule, dan fee.
- Connected ecosystem: order dari Customer App masuk ke backend yang diproses oleh Cashier/Production/Courier workflow.
- Trust and transparency: invoice, payment status, order detail, notification, review, dan profile completeness.
- Wallet-first retention: topup/deposit balance membuat customer bisa menyimpan saldo untuk transaksi berikutnya.

## Struktur Materi Portofolio yang Disarankan

1. Problem: customer laundry butuh cara mudah mencari layanan, membuat order, dan mengatur pickup/delivery.
2. Product role: Customer App sebagai front door ekosistem WashWallet.
3. Discovery: search, nearby outlet, filter, service categories, ratings.
4. Order journey: outlet -> service -> cart -> checkout -> payment -> order tracking.
5. Courier experience: address, pickup schedule, delivery schedule, fee calculation.
6. Account experience: profile, password, wallet/topup, address book, notification.
7. Technical architecture: Flutter, Clean Architecture, Cubit, GoRouter, Dio, Firebase, shared packages.
8. Business impact: meningkatkan order conversion, mengurangi input manual outlet, memperbaiki komunikasi customer, dan memperkuat retention lewat wallet/promo.

## Anti-Overclaim

Jangan klaim hal berikut kecuali ada bukti tambahan:

- Jangan klaim semua pembayaran sudah otomatis real-time. Yang terkonfirmasi: topup screen memakai polling 10 detik dan FCM `topup_success`; order payment dapat membuka external payment URL atau wallet/COD flow.
- Jangan klaim delivery selalu tersedia. App mengecek outlet courier setting dan service courier support.
- Jangan klaim cart mendukung multi-outlet checkout. Cart justru menjaga satu active outlet.
- Jangan klaim notification mencakup semua status order. Payload yang terkonfirmasi di service adalah `customer_order_accepted`.
- Jangan klaim review selalu tersedia untuk semua order. Review harus mengikuti backend/order state.
- Jangan tampilkan data customer nyata, nomor HP, alamat, payment URL private, atau API credential dalam portofolio.

## Feature Inventory Singkat

- Onboarding: splash, onboarding, welcome.
- Auth: OTP request/verify, register, login password, logout, auth status check, FCM token update.
- Home: primary address, wallet/deposit balance, active/recent order, pending payment shortcut, promo section.
- Search: search history, suggestions, redirect to discovery.
- Discovery: recommendations, service search, filter, sort, location context, infinite scroll.
- Outlet: list/nearby, detail, categories, popular services, service bottom sheet, outlet info, ratings/reviews.
- Cart: persisted selected services, active outlet, conflict handling, non-courier service tracking.
- Checkout: selected services, pickup type, delivery type, address, schedule, courier fee, payment method, notes, create order.
- Orders: history, detail, invoice, pay, cancel, schedule delivery, complete, submit review.
- Address: list, create, edit, delete, primary address, coordinate and region metadata.
- Topup: create topup, history, detail, payment instruction, polling, FCM topup success.
- Profile: summary, status card, wallet card, edit profile, set password, logout.
- Notification: order accepted notification, local notification, notification tap deep link.

## Copy Snippet Kandidat

"WashWallet Customer App is the consumer-facing layer of the WashWallet ecosystem, allowing customers to discover laundry outlets, select services, schedule pickup and delivery, pay orders, top up wallet balance, and track laundry status from one mobile app."

"The checkout flow adapts to outlet and service capabilities: if courier is available, customers can choose address, date, pickup slot, delivery preference, and see fee estimation; otherwise the app guides them to self drop-off."

"Customer App connects discovery, ordering, payment, notification, and account management into one journey, reducing manual order entry for outlets while giving customers clearer control over their laundry process."

## Source Files Reviewed

- `apps/customer/README.md`
- `apps/customer/lib/main.dart`
- `apps/customer/lib/core/router/app_router.dart`
- `apps/customer/lib/core/services/customer_notification_service.dart`
- `apps/customer/lib/core/navigation/customer_push_notification_coordinator.dart`
- `apps/customer/lib/features/auth/presentation/bloc/customer_auth_cubit.dart`
- `apps/customer/lib/features/auth/presentation/screens/login_screen.dart`
- `apps/customer/lib/features/auth/presentation/screens/otp_screen.dart`
- `apps/customer/lib/features/auth/presentation/screens/register_screen.dart`
- `apps/customer/lib/features/auth/presentation/screens/login_password_screen.dart`
- `apps/customer/lib/features/home/presentation/bloc/home_dashboard_cubit.dart`
- `apps/customer/lib/features/home/presentation/screens/home_screen.dart`
- `apps/customer/lib/features/home/domain/entities/home_dashboard.dart`
- `apps/customer/lib/features/search/presentation/screens/search_screen.dart`
- `apps/customer/lib/features/discovery/presentation/bloc/discovery_cubit.dart`
- `apps/customer/lib/features/discovery/presentation/screens/discovery_screen.dart`
- `apps/customer/lib/features/outlet/presentation/bloc/outlet_cubit.dart`
- `apps/customer/lib/features/outlet/presentation/screens/show_outlet_screen.dart`
- `apps/customer/lib/features/outlet/presentation/screens/outlet_info_screen.dart`
- `apps/customer/lib/features/order/presentation/bloc/cart_cubit.dart`
- `apps/customer/lib/features/order/presentation/bloc/order_cubit.dart`
- `apps/customer/lib/features/order/presentation/screens/order_summary_screen.dart`
- `apps/customer/lib/features/order/presentation/screens/show_order_screen.dart`
- `apps/customer/lib/features/order/presentation/screens/order_invoice_screen.dart`
- `apps/customer/lib/features/order/presentation/screens/delivery_schedule_screen.dart`
- `apps/customer/lib/features/order/presentation/widgets/order_detail_actions_widget.dart`
- `apps/customer/lib/features/customer_address/presentation/bloc/customer_address_list_cubit.dart`
- `apps/customer/lib/features/customer_address/presentation/bloc/customer_address_action_cubit.dart`
- `apps/customer/lib/features/topup/presentation/bloc/topup_cubit.dart`
- `apps/customer/lib/features/topup/presentation/screens/create_topup_screen.dart`
- `apps/customer/lib/features/topup/presentation/screens/topup_payment_screen.dart`
- `apps/customer/lib/features/profile/presentation/screens/profile_screen.dart`
- `apps/customer/lib/features/profile/presentation/screens/edit_profile_screen.dart`
- `apps/customer/lib/features/profile/presentation/screens/set_password_screen.dart`
- `packages/wash_wallet_core/lib/src/network/api/api_endpoints.dart`
