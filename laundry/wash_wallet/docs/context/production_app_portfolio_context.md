# Context: WashWallet Production App untuk Portofolio

Tanggal review: 2026-06-14

Dokumen ini adalah context brief untuk AI model lain yang akan menyusun materi portofolio WashWallet Production App. Fokus dokumen ini bukan membuat copy final, tetapi memberi konteks produk, fitur, workflow, angle cerita, dan batas klaim yang aman berdasarkan kode aplikasi production yang ada di repository.

## Ringkasan Produk

WashWallet Production App adalah aplikasi operasional internal untuk staf laundry yang menangani proses produksi dan penjemputan order. Aplikasi ini menjembatani order yang dibuat dari customer/cashier dengan eksekusi di lapangan: staf produksi melihat antrean kerja, memulai order, memproses item per tahap, menyelesaikan order, mencetak struk/label, sedangkan staf kurir melihat jadwal pickup, memulai penjemputan, mengirim notifikasi WhatsApp, dan mengunggah bukti foto.

Platform target mengikuti Flutter multi-platform: Android, iOS, Web, Windows, macOS, dan Linux. Dalam portofolio, aplikasi ini paling relevan diposisikan sebagai mobile/tablet operational app untuk staf produksi dan kurir outlet.

## Masalah yang Diselesaikan

- Operasional laundry tidak cukup hanya punya POS. Setelah order dibuat, bisnis butuh workflow produksi yang bisa dipantau dari antrean sampai selesai.
- Staf produksi perlu mengetahui order mana yang siap diproses, order mana yang sedang berjalan, item apa saja yang harus dikerjakan, dan tahap proses apa yang boleh dimulai atau diselesaikan.
- Kurir pickup membutuhkan daftar jadwal harian, filter outlet, alamat pelanggan, navigasi ke lokasi, bukti foto, dan notifikasi customer agar proses penjemputan lebih tertib.
- Manajemen membutuhkan traceability: order, item, proses, status, waktu pengerjaan, dan bukti operasional harus terekam di backend, bukan hanya dicatat manual.

## Fitur Utama yang Perlu Disajikan

### 1. Auth dan Permission-Aware Access

- Login employee memakai username dan password.
- Token disimpan melalui secure storage, dengan integrasi auth interceptor pada Dio.
- Router melakukan redirect berdasarkan status auth: splash, onboarding, login, home, no-permission, order, item, dan pickup schedule.
- Akses aplikasi dikontrol oleh permission:
  - `production.view` untuk fitur produksi.
  - `courier.view` atau `courier.manage` untuk fitur kurir.
- Bottom navigation bersifat dinamis. Item "Produksi" hanya muncul untuk employee dengan akses production, dan item "Kurir" hanya muncul untuk employee dengan akses courier.
- Jika employee authenticated tetapi tidak punya akses yang sesuai, aplikasi menampilkan no-permission screen, bukan membiarkan user masuk ke route yang tidak boleh diakses.

### 2. Dashboard Produksi

- Dashboard menampilkan identitas employee dan outlet.
- Summary metrik produksi:
  - order hari ini
  - order in progress
  - order ready for pickup
  - order completed
- Process queue menampilkan daftar proses dan jumlah order per proses.
- Active order list menampilkan order yang sedang dikerjakan, customer, service, quantity, current process, dan started time.
- Priority order card menampilkan order prioritas, status, dan deadline.
- Quick action panel sudah tersedia sebagai area ekstensi workflow.

Portfolio angle:
Dashboard dapat disajikan sebagai command center lantai produksi, bukan sekadar halaman statistik.

### 3. Manajemen Order Produksi

- Screen "Manajemen Order" memiliki tab:
  - `Siap Dikerjakan`, mengambil order status `ready_to_process`.
  - `Sedang Dikerjakan`, mengambil order status `in_progress`.
- Data order di-refresh saat aplikasi kembali ke foreground.
- Detail order menampilkan:
  - nomor order
  - status order
  - payment status
  - tanggal order
  - estimasi selesai
  - daftar item order
  - ringkasan pembayaran
  - catatan order jika tersedia
- Order dapat diselesaikan dari detail saat status sudah `in_progress`.
- Tombol cetak tersedia untuk order `in_progress` atau `completed`.

Portfolio angle:
Fitur ini menunjukkan transisi dari cashier/front desk ke production floor. Order tidak berhenti di transaksi, tetapi masuk ke antrean kerja yang bisa ditindaklanjuti.

### 4. Item-Level Production Tracking

- Detail item order tersedia pada route `/order-items/:id`.
- Tracking dilakukan pada level item, bukan hanya level order.
- Screen detail item menampilkan:
  - informasi item order
  - status item
  - daftar proses item
  - action button untuk mulai atau menyelesaikan item
- Order item process memiliki aksi start dan complete terpisah.
- Proses item memakai state loading, success, dan error sehingga tindakan operasional tidak dianggap sukses sebelum backend mengonfirmasi.
- Pada detail order, item hanya clickable saat order sedang `in_progress`, sehingga workflow produksi tidak bisa lompat dari order yang belum dimulai.

Portfolio angle:
Ini adalah fitur pembeda yang kuat. Banyak sistem laundry hanya melacak status order secara global, sedangkan Production App melacak pengerjaan sampai granular ke item dan process step.

### 5. Courier Pickup Schedule

- Modul kurir tersedia melalui route `/pickup-schedule`.
- Screen "Jadwal Penjemputan" menampilkan jadwal berdasarkan tanggal yang dipilih.
- Ada filter outlet berdasarkan outlet yang dapat diakses employee.
- Jadwal dibagi menjadi dua tab:
  - `Siap Dijemput`
  - `Dalam Perjalanan`
- Order pickup dikelompokkan berdasarkan slot waktu.
- Order yang melewati jadwal tampil sebagai section `Segera Dijemput`.
- Pull-to-refresh dan reload otomatis dilakukan saat ada notifikasi pickup baru.

Portfolio angle:
Fitur courier membuat Production App tidak hanya dipakai di ruang produksi, tetapi juga mendukung operasi lapangan dari customer ke outlet.

### 6. Pickup Detail, Navigation, and Proof of Work

- Detail penjemputan menampilkan:
  - data customer
  - alamat pickup
  - outlet tujuan
  - jadwal pickup
  - daftar item
  - catatan order
- Aplikasi menyediakan tombol terkait alamat/maps melalui pickup address widgets.
- Kurir dapat memulai pickup dari bottom sheet.
- Konfirmasi pengambilan membutuhkan foto bukti pengambilan.
- Konfirmasi tiba di outlet mendukung foto bukti tiba, tetapi fotonya opsional.
- Image picker mendukung kamera dan galeri, dengan permission camera.
- Setelah konfirmasi sukses, jadwal pickup di-refresh.

Portfolio angle:
Ini bisa disajikan sebagai proof-of-work workflow: bukan hanya tombol status, tetapi ada bukti foto untuk mengurangi dispute dan meningkatkan akuntabilitas.

### 7. Realtime Pickup Notification

- App menggunakan Firebase Messaging untuk foreground, background, opened app, dan initial notification flow.
- App juga terhubung ke Pusher private channel per outlet untuk event `courier.new-pickup`.
- Event pickup baru diproses menjadi payload yang memuat order id, nomor order, outlet, customer, alamat, jadwal, dan status.
- Sistem melakukan deduplication event dalam window 60 detik.
- Notifikasi dapat memutar suara dan menampilkan local notification.
- Tapping notification diarahkan ke `/pickup-schedule` setelah user authenticated dan router siap.
- FCM token diregistrasikan ke backend bersama device id, dan dibersihkan saat logout.

Portfolio angle:
Highlight ini menunjukkan operational responsiveness. Kurir tidak perlu refresh manual untuk mengetahui order pickup baru.

### 8. WhatsApp Notification untuk Pickup

- Pada detail pickup, tombol WhatsApp muncul saat order berstatus `picking_up` dan customer memiliki nomor telepon.
- Modal WhatsApp mengambil preview dari backend sebelum dikirim.
- Preview menampilkan recipient, informasi coin, dan isi pesan.
- Tombol kirim disable jika customer tidak punya phone atau coin tidak cukup.
- Setelah berhasil, modal ditutup dan user mendapat feedback.
- Backend mengembalikan informasi coin deducted, coin source, dan remaining coin.

Portfolio angle:
Fitur ini dapat diceritakan sebagai komunikasi operasional yang terkendali: pesan tidak diketik manual oleh kurir, tetapi dibuat dari template/backend dan memperhitungkan saldo coin.

### 9. Thermal Printing untuk Struk dan Label

- Detail order menyediakan modal "Cetak Struk & Label".
- App mengambil print info dari backend sebelum mencetak.
- User dapat memilih cetak struk/nota atau label.
- Sebelum cetak, app menampilkan konfirmasi pemakaian coin.
- Backend memproses request print dan mengembalikan coin deducted, coin source, serta remaining coin.
- Setelah backend mengonfirmasi, app mencetak via `ThermalPrinterService`.
- Data struk mencakup outlet, order number, order date, cashier, customer, items, subtotal, discount, tax, total, paid amount, remaining amount, payment status, dan estimated completion.
- Data label mencakup outlet, order number, customer, phone, items, dan estimated completion.

Portfolio angle:
Ini menghubungkan workflow digital dengan kebutuhan fisik operasional laundry: struk untuk customer dan label untuk identifikasi barang.

## Alur End-to-End yang Bisa Diceritakan

1. Customer/cashier membuat order.
2. Order masuk ke antrean produksi dengan status siap dikerjakan.
3. Staf produksi membuka dashboard, melihat queue, active order, dan priority order.
4. Staf membuka tab "Siap Dikerjakan" dan masuk ke detail order.
5. Saat order berjalan, staf membuka item dan menjalankan proses start/complete per item.
6. Jika order membutuhkan pickup, kurir mendapat notifikasi pickup baru dari Firebase/Pusher.
7. Kurir membuka jadwal pickup, melihat order berdasarkan tanggal, outlet, dan slot waktu.
8. Kurir memulai pickup, mengirim WhatsApp ke customer jika diperlukan, lalu mengonfirmasi pickup dengan foto.
9. Saat tiba di outlet, kurir mengonfirmasi kedatangan.
10. Order dapat dicetak sebagai struk atau label untuk kebutuhan operasional.

## Technical Highlights

- Flutter app dengan target multi-platform.
- Clean Architecture per feature: data, domain, presentation.
- State management memakai `flutter_bloc` Cubit.
- Routing memakai `go_router` dengan auth-aware redirect dan custom transition.
- Network layer memakai `dio`, `AuthInterceptor`, dan shared `ApiEndpoints.production()`.
- Shared packages digunakan untuk menjaga konsistensi:
  - `wash_wallet_core`
  - `wash_wallet_domain`
  - `wash_wallet_ui`
- Secure token handling memakai `flutter_secure_storage`.
- Local preference memakai `SharedPreferences`, termasuk default printer MAC dan notification device id.
- Internationalization date memakai locale `id_ID`.
- Push/realtime stack:
  - Firebase Core
  - Firebase Messaging
  - Flutter Local Notifications
  - Pusher Channels
  - Audio notification
- Device capability:
  - image picker
  - camera permission
  - thermal printer service
- UI memakai design system internal berbasis Material 3, termasuk `AppLayout`, `AppHeader`, `AppButton`, `AppCard`, `AppBottomSheet`, `AppSnackbar`, loading, empty, dan error state.

## API/Backend Surface yang Relevan

Endpoint prefix production: `/mobile/production`.

Endpoint yang tampak dari app:

- `POST /mobile/production/auth/login`
- `POST /mobile/production/auth/logout`
- `GET /mobile/production/auth/me`
- `GET /mobile/production/auth/validate`
- `POST /mobile/production/auth/fcm-token`
- `GET /mobile/production/dashboard`
- `GET /mobile/production/orders`
- `GET /mobile/production/orders/{id}`
- `POST /mobile/production/orders/{id}/start`
- `POST /mobile/production/orders/{id}/complete`
- `POST /mobile/production/orders/{id}/pickup`
- `POST /mobile/production/orders/{id}/confirm-pickup`
- `POST /mobile/production/orders/{id}/confirm-arrived`
- `GET /mobile/production/order-items/{id}`
- `POST /mobile/production/order-items/{id}/start`
- `POST /mobile/production/order-items/{id}/complete`
- `POST /mobile/production/order-item-processes/{id}/start`
- `POST /mobile/production/order-item-processes/{id}/complete`
- `GET /mobile/production/orders/{id}/wa-notification-preview`
- `POST /mobile/production/orders/{id}/send-wa-notification`
- print info/receipt/label endpoint dipakai melalui print datasource dan `ApiEndpoints` untuk mengambil data cetak dan memproses pemotongan coin.

## Materi Visual yang Disarankan

- Screenshot login employee.
- Screenshot no-permission untuk menunjukkan permission-aware app.
- Screenshot dashboard produksi dengan summary, process queue, active orders, dan priority orders.
- Screenshot tab "Siap Dikerjakan" dan "Sedang Dikerjakan".
- Screenshot detail order dengan item list dan payment summary.
- Screenshot detail item order dengan process list dan action buttons.
- Screenshot modal cetak struk/label dan konfirmasi coin.
- Screenshot jadwal penjemputan dengan date selector, outlet filter, tab, dan grouping slot waktu.
- Screenshot detail pickup, alamat customer, item, notes, dan tombol WhatsApp.
- Screenshot konfirmasi pickup dengan upload foto.
- Diagram sederhana end-to-end: Cashier/Customer Order -> Production Queue -> Item Process -> Pickup/Courier -> Print/Notification.

## Angle Portofolio yang Kuat

- Operational workflow automation: aplikasi tidak hanya menampilkan data, tetapi mengatur tindakan operasional staf.
- Traceability: pengerjaan order dapat ditelusuri dari order, item, process, waktu, staf, sampai bukti foto pickup.
- Permission-aware internal tool: fitur yang tampil mengikuti akses employee.
- Realtime operational response: FCM dan Pusher membuat kurir cepat menerima pickup baru.
- Online-to-offline bridge: sistem digital tetap mendukung kebutuhan fisik seperti label laundry dan struk thermal.
- Modular monorepo: production app berbagi domain, core, dan UI package dengan aplikasi WashWallet lain.

## Struktur Materi Portofolio yang Disarankan

1. Problem: laundry butuh kontrol produksi dan pickup yang lebih tertib setelah order dibuat.
2. Role of the app: Production App sebagai operational execution layer.
3. Core workflow: dashboard, queue, order detail, item process, complete order.
4. Courier workflow: pickup schedule, realtime notification, proof photo, WA notification.
5. Operational tools: thermal print, coin confirmation, permission-aware navigation.
6. Architecture: Flutter, Clean Architecture, Cubit, Dio, shared packages, Firebase/Pusher.
7. Impact: mengurangi miss communication, memperjelas prioritas, mempercepat respons pickup, meningkatkan akuntabilitas.

## Anti-Overclaim

Jangan klaim hal berikut kecuali ada bukti tambahan dari demo/data produksi:

- Jangan klaim "real-time dashboard produksi" jika yang dimaksud dashboard summary. Yang terkonfirmasi realtime kuat adalah notifikasi pickup via Firebase/Pusher.
- Jangan klaim semua proses produksi otomatis mengubah status customer app tanpa verifikasi backend flow end-to-end. Lebih aman: app mengirim aksi start/complete ke backend.
- Jangan klaim semua role production/courier bisa melihat semua outlet. Aplikasi justru memfilter berdasarkan accessible outlets dan permission employee.
- Jangan klaim WhatsApp dikirim manual oleh aplikasi chat. Yang ada adalah preview dan send notification melalui backend.
- Jangan klaim print gratis. Ada coin confirmation dan coin deduction untuk print/WA flow.
- Jangan tampilkan credential, URL backend private, atau data customer nyata dalam materi portofolio.

## Feature Inventory Singkat

- Auth: login, logout, validate token, get me, secure token storage.
- Permission: production access, courier access, dynamic bottom nav, no-permission route.
- Dashboard: summary metrics, process queue, active orders, priority orders.
- Orders: list ready-to-process, list in-progress, refresh on resume, detail, complete order.
- Order items: detail item, item status, process list, start/complete item.
- Order item process: start/complete process.
- Courier: pickup schedule, date selector, outlet filter, overdue section, grouped time slots.
- Pickup action: start pickup, confirm pickup with required photo, confirm arrived with optional photo.
- Notification: Firebase Messaging, local notification, Pusher private outlet channel, deduplication, notification tap routing.
- WhatsApp: preview, recipient info, message preview, coin check, send notification.
- Print: print info, receipt, label, coin confirmation, thermal printer.
- UX states: loading, empty, error, success snackbar, modal bottom sheets.

## Copy Snippet Kandidat

"WashWallet Production App is the execution layer of the laundry workflow. It turns cashier/customer orders into production queues, item-level process tracking, courier pickup schedules, proof-of-work photos, WhatsApp notifications, and thermal printing for daily outlet operations."

"The app was designed for staff who need fast operational clarity: what to process, what to pick up, what is overdue, and which action is allowed next based on backend-confirmed order status."

"A key differentiator is item-level production tracking. Instead of treating a laundry order as one generic status, each order item can expose its own process list and operational actions."

## Source Files Reviewed

- `apps/production/README.md`
- `apps/production/lib/main.dart`
- `apps/production/lib/core/router/app_router.dart`
- `apps/production/lib/core/utils/permission_checker.dart`
- `apps/production/lib/core/utils/bottom_bar_items_builder.dart`
- `apps/production/lib/core/services/production_notification_service.dart`
- `apps/production/lib/core/navigation/production_push_notification_coordinator.dart`
- `apps/production/lib/features/auth/presentation/bloc/auth_cubit.dart`
- `apps/production/lib/features/auth/presentation/screens/login_screen.dart`
- `apps/production/lib/features/no_permission/presentation/screens/no_permission_screen.dart`
- `apps/production/lib/features/home/presentation/screens/home_screen.dart`
- `apps/production/lib/features/home/domain/entities/home.dart`
- `apps/production/lib/features/home/domain/entities/home_summary.dart`
- `apps/production/lib/features/home/domain/entities/process_queue.dart`
- `apps/production/lib/features/home/domain/entities/active_order.dart`
- `apps/production/lib/features/home/domain/entities/priority_order.dart`
- `apps/production/lib/features/order/presentation/bloc/order_cubit.dart`
- `apps/production/lib/features/order/presentation/screens/index_order_screen.dart`
- `apps/production/lib/features/order/presentation/screens/show_order_screen.dart`
- `apps/production/lib/features/order/presentation/screens/pickup_schedule_screen.dart`
- `apps/production/lib/features/order/presentation/screens/pickup_order_detail_screen.dart`
- `apps/production/lib/features/order/presentation/screens/pickup_confirmation_screen.dart`
- `apps/production/lib/features/order_item/presentation/bloc/order_item_cubit.dart`
- `apps/production/lib/features/order_item/presentation/screens/show_order_item_screen.dart`
- `apps/production/lib/features/order_item_process/presentation/bloc/order_item_process_cubit.dart`
- `apps/production/lib/features/print/presentation/bloc/print_cubit.dart`
- `apps/production/lib/features/print/presentation/widgets/print_modal.dart`
- `apps/production/lib/features/wa_notification/presentation/bloc/wa_notification_cubit.dart`
- `apps/production/lib/features/wa_notification/presentation/widgets/wa_notification_modal.dart`
- `packages/wash_wallet_core/lib/src/network/api/api_endpoints.dart`
