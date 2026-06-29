# Context: WashWallet Cashier App untuk Portofolio

Tanggal review: 2026-06-14

Dokumen ini adalah context brief untuk AI model lain yang akan menyusun materi portofolio WashWallet Cashier App. Fokus dokumen ini adalah memberi gambaran produk, fitur, alur, nilai bisnis, dan highlight teknis berdasarkan codebase `apps/cashier`.

Gunakan dokumen ini sebagai bahan mentah untuk membuat case study, slide deck, landing portfolio, copywriting project page, atau script presentasi. Dokumen ini bukan materi final portofolio.

## 1. Ringkasan Produk

**Nama produk:** WashWallet Cashier App

**Kategori:** POS dan operational front-office app untuk outlet laundry.

**Peran dalam ekosistem WashWallet:** Aplikasi ini adalah interface utama kasir/frontliner outlet. Jika customer app dipakai pelanggan dan production app dipakai staf produksi, cashier app adalah pusat penerimaan order, validasi transaksi, manajemen pelanggan, pembayaran, pencetakan nota, dan pencatatan dana outlet.

**Platform:** Flutter multi-platform. Target realistis untuk portofolio: Android tablet/phone, web, dan desktop outlet. Codebase juga mendukung target Flutter lain seperti iOS, Windows, macOS, dan Linux.

**Target user:**

- Kasir outlet laundry.
- Frontliner yang menerima cucian dari pelanggan.
- Supervisor outlet yang perlu melihat transaksi dan keuangan dasar.
- Admin operasional outlet yang mengelola layanan, kategori, pelanggan, membership, deposit, dan printer.

**One-liner portfolio:**

WashWallet Cashier App adalah aplikasi POS laundry berbasis Flutter yang membantu kasir menerima order, menghitung harga otomatis berdasarkan layanan, membership, dan deposit pelanggan, mengelola pembayaran, mencetak struk/label thermal, serta memantau keuangan outlet dalam satu workflow operasional.

## 2. Masalah yang Diselesaikan

Laundry outlet punya workflow yang rawan error jika masih manual:

- Kasir harus mencatat customer, item cucian, layanan, berat/quantity, catatan khusus, dan estimasi selesai.
- Harga dapat berubah karena layanan berbeda, minimum quantity, diskon membership, kuota paket/deposit, pickup fee, delivery fee, tax, dan pembayaran sebagian.
- Order online atau pickup perlu diterima/ditolak cepat agar customer mendapat kepastian.
- Struk dan label perlu dicetak langsung di outlet.
- Owner perlu melihat arus uang kasir, petty cash, dan pengeluaran tanpa menunggu rekap manual.
- Kasir perlu notifikasi pesanan baru tanpa terus refresh layar.

Cashier app menjawab masalah ini dengan satu sistem POS yang terhubung ke backend, printer, notifikasi, dan modul finansial outlet.

## 3. Fitur Utama yang Layak Ditampilkan

### 3.1 Authentication dan Session Management

Fitur:

- Login kasir menggunakan username dan password.
- Splash screen untuk pengecekan sesi.
- Route guard berbasis `AuthCubit` dan `go_router`.
- Token disimpan menggunakan secure storage dengan backup `SharedPreferences`.
- Auto redirect antara `/login`, `/home`, dan protected routes.
- Logout membersihkan session dan menghentikan sesi notifikasi.
- Setelah login, aplikasi mendaftarkan FCM token dan device ID untuk notifikasi kasir.

Nilai portofolio:

- Menunjukkan aplikasi internal yang punya authentication flow lengkap.
- Menunjukkan integrasi session dengan notifikasi dan outlet context, bukan login UI sederhana.

Source yang direview:

- `apps/cashier/lib/features/auth/presentation/bloc/auth_cubit.dart`
- `apps/cashier/lib/core/router/app_router.dart`
- `apps/cashier/lib/main.dart`

### 3.2 Dashboard Operasional Kasir

Fitur:

- Dashboard home untuk kasir yang sudah login.
- Menampilkan identitas employee/kasir.
- Ringkasan transaksi outlet:
  - saldo kas,
  - order dalam produksi,
  - order belum diambil,
  - order sudah diambil.
- Quick actions:
  - buat transaksi,
  - lihat transaksi,
  - kelola pelanggan,
  - kelola dana dan keuangan.
- Pull-to-refresh dashboard.
- Bottom navigation untuk Home, Dana & Keuangan, Transaksi, dan Setting.
- Notification badge di header.
- Banner pesanan baru yang bisa ditap untuk membuka detail order.

Nilai portofolio:

- Dashboard bukan hanya dekoratif, tetapi menjadi command center kasir.
- Cocok divisualkan sebagai screen pembuka portfolio karena langsung menunjukkan konteks operasional outlet.

Source yang direview:

- `apps/cashier/lib/features/home/presentation/screens/home_screen.dart`
- `apps/cashier/lib/features/home/presentation/sections/*`

### 3.3 Real-Time New Order Notification

Fitur:

- Integrasi Firebase Messaging untuk foreground, background, dan notification tap.
- Integrasi Pusher private channel per outlet: `private-outlet.{outletId}`.
- Event `cashier.new-order.created` diproses menjadi payload order baru.
- Local notification untuk foreground event.
- Audio notification menggunakan asset sound.
- Badge count untuk order baru.
- Deduplication window agar order yang sama tidak muncul berkali-kali.
- Tap notifikasi atau banner membuka detail order.
- Saat app reconnect, badge disinkronkan ulang dari backend menggunakan `getNewOrderCount`.

Nilai portofolio:

- Ini adalah highlight teknis kuat karena menggabungkan push notification, realtime channel, local notification, sound feedback, deduplication, dan deep link ke detail order.
- Bisa diposisikan sebagai solusi untuk mengurangi missed order di outlet.

Source yang direview:

- `apps/cashier/lib/core/services/notification_service.dart`
- `apps/cashier/lib/core/navigation/push_notification_coordinator.dart`
- `apps/cashier/lib/features/home/presentation/widgets/new_order_banner.dart`
- `apps/cashier/lib/features/order/presentation/bloc/order_cubit.dart`

### 3.4 POS Order Workflow

Fitur utama order:

- Daftar order outlet dengan search dan filter.
- Detail order dengan customer card, item, timeline, financial summary, notes, dan action buttons.
- Order dari customer dapat diterima atau ditolak oleh kasir.
- Rejection dapat menyertakan alasan.
- Order yang sudah diterima bisa masuk ke flow timbang.
- Order yang stuck lebih dari threshold tertentu dapat diselesaikan manual dengan konfirmasi.
- Order yang statusnya sudah siap diproses/berjalan dapat dicetak struk atau label.
- WhatsApp notification modal tersedia dari detail order.

Flow pembuatan order:

1. Kasir memilih customer.
2. Jika customer belum ada, kasir dapat quick add customer.
3. Kasir memilih laundry service.
4. Kasir menginput quantity dan catatan item.
5. Draft order disimpan lokal per customer agar flow bisa dilanjutkan.
6. Kasir masuk ke review order.
7. Sistem menghitung harga berdasarkan layanan, membership, dan subscription/deposit.
8. Kasir memilih status pembayaran dan metode pembayaran.
9. Kasir submit order.
10. Jika sukses, aplikasi membuka success screen dan order dapat dicetak.

Nilai portofolio:

- POS flow ini menunjukkan kompleksitas bisnis nyata, bukan CRUD order biasa.
- Alur bertahap cocok dijadikan carousel atau diagram workflow dalam portfolio.

Source yang direview:

- `apps/cashier/lib/features/order/presentation/screens/select_customer_for_order_screen.dart`
- `apps/cashier/lib/features/order/presentation/screens/select_laundry_service_for_order_screen.dart`
- `apps/cashier/lib/features/order/presentation/screens/input_order_item_screen.dart`
- `apps/cashier/lib/features/order/presentation/screens/review_order_screen.dart`
- `apps/cashier/lib/features/order/presentation/screens/show_order_screen.dart`
- `apps/cashier/lib/features/order/presentation/bloc/order_cubit.dart`

### 3.5 Smart Pricing: Membership, Deposit, dan Payment

Fitur:

- `OrderPriceCalculator` menghitung subtotal, diskon kuota, diskon membership, dan total.
- Membership aktif customer dimuat saat review order.
- Customer subscription/deposit aktif dimuat saat review order.
- Jika kuota paket menanggung seluruh order, payment status menjadi `paid_by_package`.
- Item order dapat membawa metadata:
  - `discountAmount`,
  - `isPackageUsage`,
  - `customerSubscriptionId`,
  - `quotaUsed`.
- Mendukung payment status:
  - `unpaid`,
  - `paid`,
  - `partial`,
  - `paid_by_package`.
- Mendukung payment method:
  - `cash`,
  - `transfer`,
  - `qris`.
- Untuk transfer/QRIS, kasir harus memilih source account/rekening tujuan.
- Paid amount otomatis disinkronkan saat status payment berubah.

Nilai portofolio:

- Ini bisa menjadi USP utama: sistem bukan hanya mencatat order, tetapi membantu kasir mengambil keputusan pembayaran berdasarkan benefit customer.
- Highlight ini menunjukkan kemampuan membangun business logic kompleks di mobile app.

Source yang direview:

- `apps/cashier/lib/features/order/domain/services/order_price_calculator.dart`
- `apps/cashier/lib/features/order/presentation/screens/review_order_screen.dart`
- `apps/cashier/lib/features/order/presentation/widgets/order_review/*`

### 3.6 Weighing Flow dan Koreksi Item

Fitur:

- Screen `Timbang Pesanan` untuk order yang sudah diterima.
- Kasir dapat mengubah item berdasarkan hasil timbang aktual.
- Kasir dapat menambah layanan baru atau mengganti service item.
- Quantity mengikuti minimum quantity service.
- Ada notes customer dan internal notes.
- Ada upload foto kondisi cucian/order saat timbang.
- Harga direkalkulasi saat item/quantity berubah.
- Membership dan subscription/deposit tetap dipakai dalam perhitungan ulang.
- Payload timbang dikirim multipart karena dapat menyertakan foto.

Nilai portofolio:

- Laundry POS punya kebutuhan unik: item dan berat sering baru pasti setelah diterima. Fitur timbang menunjukkan adaptasi terhadap proses bisnis laundry yang realistis.
- Cocok dijadikan bagian "domain-specific problem solving".

Source yang direview:

- `apps/cashier/lib/features/order/presentation/screens/weigh_order_screen.dart`
- `apps/cashier/lib/features/order/data/datasources/order_remote_datasource.dart`
- `apps/cashier/lib/features/order/domain/models/weigh_draft_item.dart`

### 3.7 Customer Management dan CRM Ringan

Fitur:

- List customer.
- Search customer.
- Create customer.
- Edit customer.
- Detail customer.
- Delete customer.
- Quick add customer dari flow order.
- Detail customer menampilkan ringkasan:
  - jumlah transaksi,
  - jumlah membership contract,
  - jumlah deposit/subscription.
- Dari detail customer, kasir bisa membuka:
  - riwayat order customer,
  - membership customer,
  - deposit/subscription customer.

Nilai portofolio:

- Menunjukkan POS yang terintegrasi dengan CRM dasar.
- Bukan hanya transaksi anonim, tetapi customer history dan loyalty context ikut dipakai.

Source yang direview:

- `apps/cashier/lib/features/customer/presentation/screens/index_customers_screen.dart`
- `apps/cashier/lib/features/customer/presentation/screens/show_customer_screen.dart`
- `apps/cashier/lib/features/customer/presentation/screens/create_customer_screen.dart`
- `apps/cashier/lib/features/customer/presentation/screens/edit_customer_screen.dart`

### 3.8 Membership dan Customer Deposit/Subscription

Fitur:

- Menampilkan membership plan per outlet.
- Detail membership plan.
- Menampilkan membership contract customer.
- Upgrade atau membuat membership contract untuk customer.
- Menampilkan service package.
- Detail service package.
- Membuat customer subscription/deposit dari service package.
- Menampilkan subscription/deposit milik customer.
- Data membership dan subscription dipakai dalam pricing order.

Nilai portofolio:

- Modul loyalty bukan tempelan. Benefit membership dan deposit benar-benar memengaruhi checkout.
- Ini memperlihatkan integrasi antara sales, retention, dan POS.

Source yang direview:

- `apps/cashier/lib/features/membership_plan/*`
- `apps/cashier/lib/features/membership_contract/*`
- `apps/cashier/lib/features/customer_subscription/*`
- `apps/cashier/lib/features/service_package/*`

### 3.9 Master Data Outlet

Fitur:

- Category laundry:
  - list,
  - create,
  - detail,
  - edit,
  - delete.
- Laundry service:
  - list,
  - create,
  - detail,
  - edit,
  - delete,
  - filter berdasarkan outlet/category/unit,
  - price dan minimum quantity.
- Unit service digunakan untuk quantity dan perhitungan harga.
- Service package dan membership plan dapat dilihat untuk kebutuhan penjualan/operasional outlet.

Nilai portofolio:

- Menunjukkan aplikasi kasir tidak bergantung sepenuhnya pada admin web untuk setup operasional harian.
- Cocok disebut sebagai "outlet self-management capability".

Source yang direview:

- `apps/cashier/lib/features/category/*`
- `apps/cashier/lib/features/laundry_service/*`
- `apps/cashier/lib/features/unit/*`
- `apps/cashier/lib/features/service_package/*`
- `apps/cashier/lib/features/membership_plan/*`

### 3.10 Dana dan Keuangan Outlet

Fitur:

- Menu Dana & Keuangan sebagai pusat akses modul finansial.
- Setoran Kasir:
  - list,
  - search/filter,
  - create deposit,
  - detail deposit,
  - account tujuan,
  - nominal,
  - catatan,
  - lampiran bukti.
- Petty Cash:
  - list,
  - search/filter,
  - create request kas kecil.
- Expense:
  - list,
  - search/filter,
  - create expense,
  - tanggal,
  - nominal,
  - description,
  - expense account,
  - lampiran bukti.
- Integrasi account module untuk source account dan expense account.

Nilai portofolio:

- Menghubungkan transaksi outlet dengan kontrol keuangan.
- Bisa diposisikan sebagai solusi akuntabilitas kasir dan pengurangan kebocoran dana.

Source yang direview:

- `apps/cashier/lib/features/finances/presentation/screens/index_finances_screen.dart`
- `apps/cashier/lib/features/deposit/*`
- `apps/cashier/lib/features/petty_cash/*`
- `apps/cashier/lib/features/expense/*`
- `apps/cashier/lib/features/account/*`

### 3.11 Thermal Printing: Receipt dan Label

Fitur:

- Print info order diambil dari backend.
- Kasir dapat memilih cetak struk atau label.
- Proses print memakai coin deduction data dari backend:
  - `coin_deducted`,
  - `coin_source`,
  - `remaining_coin`.
- Setting printer:
  - scan Bluetooth devices,
  - connect/disconnect,
  - simpan default printer,
  - test print.
- Printer setting UI menampilkan status terhubung dan default.
- Cocok untuk printer thermal 58mm.

Nilai portofolio:

- Ini membuat aplikasi benar-benar POS, bukan hanya CRUD app.
- Hardware integration adalah bukti technical breadth yang kuat untuk portfolio.

Source yang direview:

- `apps/cashier/lib/features/print/presentation/bloc/print_cubit.dart`
- `apps/cashier/lib/features/print/presentation/widgets/print_modal.dart`
- `apps/cashier/lib/features/setting/presentation/screens/printer_setting_screen.dart`
- `apps/cashier/lib/features/setting/presentation/bloc/printer_setting_cubit.dart`

### 3.12 WhatsApp Notification Support

Fitur:

- Detail order memiliki action kirim notifikasi WhatsApp.
- Modal WhatsApp notification tersedia di order detail.
- API endpoint untuk preview dan send notifikasi:
  - `orders/{id}/wa-notification-preview`,
  - `orders/{id}/send-wa-notification`.

Nilai portofolio:

- Memperlihatkan customer communication masuk ke workflow kasir.
- Cocok ditampilkan sebagai bagian "post-checkout communication".

Source yang direview:

- `apps/cashier/lib/features/order/presentation/widgets/wa_notification_modal.dart`
- `apps/cashier/lib/features/wa_notification/*`
- `packages/wash_wallet_core/lib/src/network/api/api_endpoints.dart`

## 4. Alur Operasional yang Bisa Dijadikan Storyline Portfolio

### Storyline A: From New Order to Accepted Order

1. Customer membuat order dari channel lain.
2. Cashier app menerima realtime notification.
3. Badge dan banner pesanan baru muncul.
4. Kasir membuka detail order dari notifikasi.
5. Kasir accept atau reject order.
6. Jika accept, order masuk ke tahap diterima dan siap ditimbang/diproses.

Kenapa menarik:

- Menunjukkan realtime operations dan responsiveness outlet.
- Cocok untuk case study tentang mengurangi missed order.

### Storyline B: In-Outlet Checkout

1. Customer datang ke outlet.
2. Kasir membuat transaksi baru dari dashboard.
3. Kasir mencari atau menambahkan customer.
4. Kasir memilih layanan laundry.
5. Kasir mengisi quantity dan catatan item.
6. Sistem menghitung harga dengan membership/deposit.
7. Kasir memilih status bayar dan metode pembayaran.
8. Order sukses dibuat.
9. Kasir mencetak struk/label.

Kenapa menarik:

- Menunjukkan POS core flow.
- Bisa divisualkan dalam 5-7 screenshot.

### Storyline C: Weighing and Price Correction

1. Order sudah diterima.
2. Kasir membuka detail order.
3. Kasir masuk ke `Timbang Pesanan`.
4. Kasir menyesuaikan layanan/quantity berdasarkan cucian aktual.
5. Kasir menambahkan foto dan catatan internal.
6. Sistem menghitung ulang total dan benefit paket.
7. Perubahan tersimpan ke backend.

Kenapa menarik:

- Menunjukkan pemahaman terhadap domain laundry yang tidak dimiliki POS generik.

### Storyline D: Daily Cash Accountability

1. Kasir membuka menu Dana & Keuangan.
2. Kasir mencatat setoran kas.
3. Kasir mengajukan petty cash.
4. Kasir mencatat expense outlet dengan lampiran bukti.
5. Data dapat diaudit oleh owner/admin.

Kenapa menarik:

- Menunjukkan aplikasi mendukung operasi harian, bukan hanya sales.

## 5. Technical Highlights untuk Portfolio

Gunakan bagian ini untuk menjelaskan kualitas engineering.

### Architecture

- Flutter app dengan pendekatan Clean Architecture.
- Struktur per fitur memisahkan:
  - `presentation`,
  - `domain`,
  - `data`.
- State management menggunakan Cubit/BLoC.
- Repository dan usecase membatasi UI dari detail API.
- Shared internal packages:
  - `wash_wallet_core` untuk Dio, endpoints, storage, result/failure, utilities,
  - `wash_wallet_domain` untuk entities/models/usecases shared,
  - `wash_wallet_data` untuk data layer shared di beberapa app,
  - `wash_wallet_ui` untuk design system.

### Network dan Error Handling

- HTTP client menggunakan Dio.
- Auth interceptor menambahkan token.
- Logging interceptor untuk debug request.
- Network retry dipakai pada beberapa datasource penting.
- Error dipetakan ke `Failure` seperti network, validation, auth, server, dan cache.

### Local State dan Persistence

- Secure token storage.
- Shared preferences untuk fallback dan setting.
- Hive initialized untuk local storage.
- Draft order disimpan lokal per customer.
- Printer default dan device setting disimpan lokal.

### Realtime dan Notification

- Firebase Messaging untuk push.
- Flutter local notifications untuk foreground notification.
- Pusher private channel untuk realtime outlet event.
- Audio cue untuk order baru.
- Badge count dan deduplication window.

### Hardware Integration

- Thermal printer service untuk cetak struk/label.
- Bluetooth printer scan/connect/disconnect.
- Test print dari settings.

### UX System

- Shared design system `wash_wallet_ui`.
- Reusable layout, header, bottom bar, card, button, text field, empty state, loading state, error state.
- Light/dark theme dari shared app theme.
- Workflow dibuat step-by-step agar cocok untuk kasir yang butuh kecepatan dan kepastian.

## 6. Materi Visual yang Disarankan

AI penyusun portofolio sebaiknya meminta atau menyusun screenshot/mockup berikut:

1. Splash/login screen untuk menunjukkan app identity dan auth.
2. Dashboard kasir dengan metric cards dan quick actions.
3. Notification badge atau banner pesanan baru.
4. Order list dengan search/filter.
5. Detail order dengan timeline dan action buttons.
6. Select customer atau quick add customer.
7. Select laundry service.
8. Review order dengan smart pricing dan payment method.
9. Weigh order screen dengan item, foto, dan price summary.
10. Print modal untuk receipt/label.
11. Printer setting screen dengan connected/default printer.
12. Finance menu: Setoran Kasir, Petty Cash, Pengeluaran Outlet.
13. Customer detail dengan riwayat order, membership, dan deposit.

Jika hanya memilih 6 gambar utama, prioritaskan:

1. Dashboard,
2. Order detail,
3. Review order,
4. Weigh order,
5. Printer setting/print modal,
6. Finance menu.

## 7. Portfolio Angle yang Direkomendasikan

### Angle Utama

Front-office POS untuk laundry outlet yang menyatukan transaksi, customer loyalty, pembayaran, printer thermal, notifikasi order baru, dan kontrol keuangan harian.

### Positioning

- Bukan POS generik.
- Dibuat khusus untuk workflow laundry.
- Menangani kebutuhan outlet yang unik: timbang ulang, membership quota, deposit package, thermal label, notification order pickup, dan daily cash accountability.

### Kata kunci yang cocok

- Laundry POS
- Operational workflow
- Smart pricing
- Customer loyalty integration
- Realtime order notification
- Thermal printer integration
- Cashier productivity
- Outlet cash accountability
- Clean Architecture Flutter
- Multi-platform internal tool

### Tone

Profesional, pragmatic, dan product-driven. Jangan terlalu banyak buzzword. Tampilkan bahwa aplikasi ini menyelesaikan workflow nyata yang rumit.

## 8. Struktur Materi Portofolio yang Disarankan

AI model lain dapat menyusun output final dengan struktur berikut:

1. **Project Title**
   - WashWallet Cashier App: Laundry POS and Outlet Operations.

2. **Short Description**
   - 2-3 kalimat tentang POS laundry untuk kasir outlet.

3. **Problem**
   - Order manual rawan salah hitung.
   - Kasir perlu menangani order online dan offline.
   - Membership/deposit sulit dihitung manual.
   - Printer dan rekap keuangan sering terpisah.

4. **Solution**
   - Cashier app sebagai hub outlet: order, pricing, payment, printing, finance, notification.

5. **My Role / Contribution**
   - Jika portfolio pribadi, tulis sebagai full-stack/mobile engineer sesuai kontribusi nyata user.
   - Jangan mengklaim role yang tidak diberikan user.

6. **Core Features**
   - Dashboard.
   - POS order workflow.
   - Smart pricing.
   - Customer management.
   - Membership/deposit.
   - Finance.
   - Printing.
   - Realtime notification.

7. **Technical Implementation**
   - Flutter multi-platform.
   - Clean Architecture.
   - BLoC/Cubit.
   - Dio + auth interceptor.
   - Firebase/Pusher notification.
   - Bluetooth thermal printer.
   - Shared design system.

8. **Business Impact**
   - Faster checkout.
   - Reduced calculation errors.
   - Better order visibility.
   - Better customer loyalty handling.
   - More accountable cash handling.

9. **Screens / Demo Flow**
   - Dashboard -> new order -> review -> print -> finance.

10. **Challenges**
   - Complex price calculation.
   - Handling order state transitions.
   - Printer and notification integration.
   - Keeping UX simple for cashier.

11. **Result**
   - Internal app ready for outlet operations.
   - More integrated workflow across customer, cashier, production, and owner/admin.

## 9. Batasan dan Hal yang Jangan Dioverclaim

Untuk menjaga portfolio tetap akurat:

- Jangan menyebut semua fitur sudah realtime. Yang jelas realtime adalah notifikasi order baru via Firebase/Pusher. Data dashboard/order tetap dimuat via API dan refresh.
- Jangan menyebut semua finance detail sudah sempurna jika tidak ada screenshot final. Sebut sebagai modul pencatatan setoran, petty cash, dan expense.
- Jangan menyebut app ini menggantikan sistem accounting penuh. Lebih tepat: mendukung pencatatan dan akuntabilitas keuangan outlet.
- Jangan menyebut printer support semua model. Lebih tepat: mendukung printer thermal Bluetooth yang compatible dengan service yang digunakan app.
- Jangan menyebut AI/ML karena tidak ada indikasi fitur AI.
- Jangan klaim offline-first penuh. Yang ada: token/session persistence, local draft order, dan local printer setting.
- Jangan klaim pembayaran online gateway jika tidak ada bukti gateway settlement. Metode pembayaran yang terlihat adalah cash, transfer, QRIS, payment status, paid amount, dan account destination.

## 10. Feature Inventory Ringkas

Gunakan daftar ini untuk checklist materi:

- Auth login/logout/session.
- Dashboard cashier.
- Notification badge dan new order banner.
- FCM + Pusher realtime order notification.
- Order list dengan search/filter.
- Order detail dengan timeline dan financial summary.
- Accept/reject customer order.
- Create order flow.
- Local order draft per customer.
- Customer search dan quick add.
- Laundry service selection.
- Quantity dan item notes.
- Review order.
- Smart price calculation.
- Membership discount.
- Subscription/deposit quota usage.
- Payment method cash/transfer/QRIS.
- Payment status unpaid/paid/partial/paid by package.
- Source account selection for transfer/QRIS.
- Weigh order flow.
- Photo attachment on weighing.
- Receipt and label printing.
- Printer scan/connect/test print/default setting.
- WhatsApp notification modal.
- Customer CRUD.
- Customer detail with order/membership/deposit summaries.
- Membership plan list/detail.
- Customer membership contract.
- Service package list/detail.
- Customer subscription/deposit.
- Category CRUD.
- Laundry service CRUD.
- Unit support.
- Finance menu.
- Cash deposit/setoran kasir.
- Petty cash request.
- Expense recording.
- Account integration for finance.
- Shared UI design system.
- Clean Architecture with Cubit/BLoC.

## 11. Suggested Final Copy Snippets

### Short Version

WashWallet Cashier App is a Flutter-based POS for laundry outlets, designed for frontliners to handle orders, customers, payments, loyalty benefits, receipt printing, and daily cash accountability in one workflow. The app integrates smart pricing with membership and deposit quota, realtime new-order notifications, Bluetooth thermal printing, and modular Clean Architecture for maintainable product growth.

### Indonesian Version

WashWallet Cashier App adalah aplikasi POS laundry berbasis Flutter untuk kasir outlet. Aplikasi ini membantu kasir menerima pesanan, menghitung harga otomatis berdasarkan layanan, membership, dan deposit pelanggan, mengelola pembayaran, mencetak struk/label thermal, menerima notifikasi pesanan baru, serta mencatat dana operasional outlet dalam satu workflow yang terintegrasi.

### Case Study Hook

Laundry operations are deceptively complex: pricing depends on service type, weight, package quota, membership discount, payment status, and actual weighing after pickup. WashWallet Cashier App turns that operational complexity into a guided POS workflow that helps cashier teams move faster with fewer manual errors.

## 12. Source Files Reviewed

Primary files reviewed for this context:

- `apps/cashier/README.md`
- `apps/cashier/lib/main.dart`
- `apps/cashier/lib/core/router/app_router.dart`
- `apps/cashier/lib/core/services/notification_service.dart`
- `apps/cashier/lib/core/navigation/push_notification_coordinator.dart`
- `apps/cashier/lib/features/auth/presentation/bloc/auth_cubit.dart`
- `apps/cashier/lib/features/home/presentation/screens/home_screen.dart`
- `apps/cashier/lib/features/order/presentation/bloc/order_cubit.dart`
- `apps/cashier/lib/features/order/presentation/screens/review_order_screen.dart`
- `apps/cashier/lib/features/order/presentation/screens/show_order_screen.dart`
- `apps/cashier/lib/features/order/presentation/screens/weigh_order_screen.dart`
- `apps/cashier/lib/features/order/data/datasources/order_remote_datasource.dart`
- `apps/cashier/lib/features/customer/presentation/screens/show_customer_screen.dart`
- `apps/cashier/lib/features/finances/presentation/screens/index_finances_screen.dart`
- `apps/cashier/lib/features/print/presentation/bloc/print_cubit.dart`
- `apps/cashier/lib/features/setting/presentation/screens/printer_setting_screen.dart`
- `packages/wash_wallet_core/lib/src/network/api/api_endpoints.dart`
