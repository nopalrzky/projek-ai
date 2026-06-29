# Context: WashWallet Cashier App untuk Flow Design

Tanggal review: 2026-06-19

Dokumen ini adalah context brief untuk AI model lain yang akan menyusun flow dan redesign tampilan aplikasi WashWallet Cashier. Fokus dokumen ini bukan portofolio, melainkan memberi konteks produk, fitur aktual, struktur navigasi, aturan bisnis, state penting, dan batasan current-state agar desain flow yang dibuat akurat terhadap codebase.

Gunakan dokumen ini sebagai bahan input untuk membuat user flow, information architecture, wireframe brief, design direction, screen priority, atau UX audit aplikasi kasir.

## 1. Ringkasan Produk

**Nama produk:** WashWallet Cashier App

**Kategori:** POS/front-office app untuk outlet laundry.

**Platform:** Flutter multi-platform. Current codebase memakai app Flutter di `apps/cashier` dengan shared package internal:

- `wash_wallet_core`: network, API endpoints, auth interceptor, storage, failure/result utilities, printer service.
- `wash_wallet_domain`: shared entities/models/usecases.
- `wash_wallet_data`: data layer shared untuk beberapa app.
- `wash_wallet_ui`: design system internal.

**Peran dalam ekosistem WashWallet:**

- Customer App dipakai pelanggan untuk membuat order, pickup/delivery, pembayaran, dan tracking.
- Cashier App dipakai kasir/frontliner outlet untuk menerima order, membuat transaksi walk-in, mengelola pelanggan, menghitung harga, mengelola pembayaran, mencetak struk/label, mengirim notifikasi WhatsApp, dan mencatat dana outlet.
- Production App dipakai staf produksi/kurir untuk mengeksekusi order setelah diterima dan siap diproses.

**Target user utama:**

- Kasir outlet laundry.
- Frontliner yang menerima cucian dari pelanggan.
- Supervisor outlet yang perlu melihat transaksi dan dana harian.
- Admin operasional ringan yang mengelola pelanggan, layanan, membership/deposit, dan printer.

**Prinsip desain utama:**

Ini adalah internal operational tool. Desain harus cepat dipindai, stabil, jelas statusnya, minim distraksi, dan mengutamakan tindakan kasir berikutnya. Jangan membuat tampilan seperti landing page atau dashboard analytics besar. Prioritaskan flow POS dan order handling.

## 2. Current Architecture dan Stack

Cashier App memakai pendekatan Clean Architecture per feature:

- `presentation`: screen, widget, Cubit/BLoC state.
- `domain`: repository contract, usecase, business params.
- `data`: remote datasource, local datasource, repository implementation.

State management:

- `flutter_bloc` Cubit/BLoC.
- Banyak feature memiliki state loading, loaded, failure, action success.

Routing:

- `go_router` dipakai untuk route utama: splash, onboarding, login, home, orders, customers, categories, laundry services, service packages, membership plans, settings.
- Banyak flow operasional masih memakai `Navigator.push`, khususnya create order, order detail, finance, customer detail, membership/deposit customer, print modal, dan weighing.

Network:

- `dio` dengan `AuthInterceptor` dan `LoggingInterceptor`.
- Base URL default: `http://10.0.2.2:8000/api`.
- API endpoints cashier memakai `ApiEndpoints.cashier()`.
- Response API umumnya memakai envelope `success`, `message`, `data`, dan `meta` untuk pagination.

Local persistence:

- Auth token memakai secure storage.
- `SharedPreferences` dipakai untuk local draft order, onboarding/session fallback, notification device id, dan printer default.
- Hive di-init saat startup, tetapi current cashier flow yang direview lebih banyak memakai SharedPreferences.

Notification:

- Firebase Messaging untuk push notification.
- Flutter Local Notifications untuk foreground/system notification.
- Pusher private channel per outlet untuk event order baru.
- Audio notification memakai asset `assets/sounds/notification.mp3`.

Hardware:

- Bluetooth thermal printer via `ThermalPrinterService`.
- Print receipt dan label dengan coin confirmation/deduction dari backend.

## 3. Current Navigation Model

### Entry dan Auth

- `/splash`: initial route, mengecek session/auth status.
- `/login`: login kasir dengan username/password.
- `/onboarding`: route tersedia, tetapi cashier daily flow utama adalah splash/login/home.
- Setelah authenticated, user diarahkan ke `/home`.
- Protected routes akan redirect ke login jika unauthenticated.

### Bottom Navigation di Home

Home memakai bottom bar dengan 4 item:

- Home
- Dana & Keuangan
- Transaksi
- Setting

Catatan desain:

- Bottom bar adalah navigasi harian utama kasir.
- Dana & Keuangan dan Transaksi dibuka via `Navigator.push`, bukan nested shell route.
- Setting memakai `go_router` ke `/settings`.

### Drawer Menu

`AppLayout` otomatis menyediakan drawer jika `showMenuButton` aktif. Drawer saat ini berisi:

**Transaksi**

- Dashboard
- Pesanan

**Data Master**

- Pelanggan
- Kategori
- Layanan
- Paket Deposit
- Membership

**Pengaturan**

- Pengaturan

Catatan desain:

- Ada overlap antara bottom navigation dan drawer.
- Redesign perlu mempertahankan akses cepat ke Home, Transaksi, Dana & Keuangan, Setting, tetapi dapat merapikan Data Master sebagai secondary area.
- Jangan menjadikan kategori/layanan/paket/membership sebagai aksi harian utama kasir kecuali brief redesign memang ingin mengubah prioritas.

## 4. Design System yang Sudah Ada

Gunakan style dan komponen dari `wash_wallet_ui` sebagai basis desain:

- `AppLayout`
- `AppHeader`
- `AppBottomBar`
- `AppDrawer`
- `AppButton`
- `AppCard`
- `AppBottomSheet`
- `AppSnackbar`
- `AppTextField`
- `AppDropdown`
- `AppBadge`
- `OrderStatusBadge`
- `PaymentStatusBadge`
- `AppLoadingIndicator`
- `AppEmptyState`
- `AppErrorState`

Theme:

- Material 3.
- Light/dark theme tersedia.
- Font app: Satoshi.
- Primary color family: teal/green.
- Semantic colors: success, warning, error, info, neutral.

Design direction yang cocok:

- Operational, utilitarian, clean.
- Tap target besar untuk mobile/tablet outlet.
- Status badge jelas.
- Sticky bottom action untuk tindakan utama.
- Bottom sheet untuk pilihan cepat dan konfirmasi.
- Loading/empty/error state harus tetap eksplisit.

Hindari:

- Hero marketing layout.
- Grafik dekoratif besar.
- Visual yang mengorbankan kecepatan kasir.
- Flow checkout yang terlalu panjang tanpa ringkasan sticky.

## 5. User Role dan Konteks Kerja

Kasir bekerja dalam konteks outlet tertentu. Setelah login, employee membawa `outletId`, `employee.id`, nama, dan nomor telepon.

Kebutuhan utama kasir:

- Melihat pesanan baru masuk.
- Menerima atau menolak order online/customer.
- Membuat order walk-in.
- Mencari atau menambahkan pelanggan cepat.
- Memilih layanan dan quantity.
- Menghitung total dengan membership/deposit quota.
- Mencatat status pembayaran dan metode bayar.
- Mencetak struk/label.
- Menimbang ulang item jika quantity aktual belum pasti.
- Mencatat setoran, petty cash, dan expense.
- Mengelola data pelanggan dan data layanan dasar.

## 6. Dashboard Home

Home adalah operational command center. Current dashboard memuat:

- Header "Wash Wallet" dan subtitle "Selamat Bekerja".
- Nama user/employee pada layout/drawer.
- Notification badge.
- Employee info section.
- Ringkasan transaksi:
  - cash balance
  - orders in production
  - orders not picked up
  - orders picked up
- Quick actions:
  - Buat Transaksi
  - Lihat Transaksi
  - Customer
  - Dana & Keuangan
- Pull-to-refresh.
- New order banner yang muncul saat event realtime masuk.

Constraint desain:

- Dashboard bukan analytics lengkap.
- Fokuskan pada status operasional dan shortcut.
- Notification badge harus mengarah ke daftar order status `requested`.
- Banner order baru harus bisa membuka detail order.

Current issue kecil:

- Handler `onSetorTap` pada dashboard masih kosong, walaupun finance menu sudah punya Setoran Kasir. Redesign bisa menyarankan CTA setor langsung ke create deposit atau finance deposit list.

## 7. Realtime New Order Notification

New order notification adalah fitur realtime utama yang terkonfirmasi.

Sumber event:

- Firebase Messaging.
- Pusher private channel: `private-outlet.{outletId}`.
- Pusher event: `cashier.new-order.created` atau `.cashier.new-order.created`.

Payload order baru:

- `type`: harus `cashier_new_order`.
- `eventId`
- `orderId`
- `orderNumber`
- `outletId`
- `status`, default `requested`
- `customerName`
- `deliveryType`
- `createdAt`

Perilaku:

- Event dideduplicate selama 60 detik per `orderId`.
- Badge count bertambah saat order baru diterima.
- App memainkan notification sound.
- Foreground FCM dapat menampilkan local notification.
- Tap notification atau banner membuka `ShowOrderScreen`.
- Saat reconnect/resume, badge disinkronkan dari backend melalui `getNewOrderCount()`.

Design implication:

- Pesanan baru harus terlihat sebagai urgent but controllable alert.
- Kasir perlu quick path ke "Diajukan/requested".
- Jangan menyebut seluruh dashboard realtime. Yang realtime kuat adalah notifikasi order baru.

## 8. Order Status dan Payment Vocabulary

### Order status yang dipakai list/filter cashier

- `requested`: Diajukan
- `accepted`: Diterima
- `picking_up`: Dalam Perjalanan/Sedang Dijemput
- `picked_up`: Sudah Diambil
- `received`: Di outlet
- `ready_to_process`: Siap Dikerjakan
- `in_progress`: Diproses/Sedang Dikerjakan
- `ready`: Siap Ambil/Siap Diantar
- `completed`: Selesai

### Status lain yang dikenali shared badge/domain

- `pending_dropoff`: Menunggu Drop-off
- `weighing`: Ditimbang
- `queued`: Siap Dikerjakan
- `processing`: Sedang Dikerjakan
- `delivering`: Sedang Diantar
- `delivered`: Terkirim
- `cancelled`: Dibatalkan
- `on_hold`: Ditahan
- `pending`: Menunggu

Catatan penting:

- API docs lama masih menyebut beberapa status umum seperti `pending`, `processing`, `ready`, `delivered`. Current UI cashier memakai filter yang lebih spesifik seperti `requested`, `received`, dan `ready_to_process`.
- Desain harus mengikuti status yang muncul di UI saat ini, dan menyarankan validasi status backend sebelum implementasi final.

### Payment status

- `not_yet_priced`: Belum Dihargai
- `unpaid`: Belum Bayar
- `partial`: Sebagian/DP
- `paid`: Lunas
- `paid_by_package`: Paket
- `refunded`: Refund
- `cod`: Bayar di Tempat

### Payment method di UI cashier

- `cash`
- `transfer`
- `qris`

Constraint:

- Jika status bayar `unpaid`, payment method dan paid amount dikosongkan.
- Jika status bayar `paid`, paid amount otomatis diisi total.
- Jika status bayar `partial`, kasir wajib input nominal bayar.
- Jika method `transfer` atau `qris`, kasir wajib memilih rekening tujuan/source account.
- QRIS ditampilkan sebagai opsi UI, tetapi current `StoreParams.toMap()` mengirim `qris` ke backend sebagai `transfer`.
- Jika seluruh order tertutup quota paket, payment status otomatis `paid_by_package`; method, account, dan paid amount tidak diperlukan.

## 9. Core Flow A: Order Baru dari Customer

Flow ini dimulai dari order yang dibuat di channel lain, lalu masuk ke cashier app.

1. Customer membuat order.
2. Cashier app menerima event realtime atau push notification.
3. Badge notification bertambah dan banner "Pesanan baru masuk" muncul.
4. Kasir membuka order dari banner/notifikasi atau dari list status `requested`.
5. Detail order menampilkan:
   - header order
   - customer card
   - item list
   - timeline
   - financial summary
   - notes
   - action buttons
6. Jika status order `requested`, kasir dapat:
   - accept order
   - reject order dengan optional reason
7. Setelah diterima, order lanjut mengikuti lifecycle pickup/received/weigh/process sesuai status dari backend.
8. Jika status order `received`, tombol `Timbang Pesanan` muncul.
9. Jika status sudah printable, kasir dapat cetak struk/label.

Design priorities:

- Detail order harus jelas menampilkan next action.
- Accept/reject harus punya confirmation.
- Reject reason optional tetapi harus mudah diisi.
- Order baru perlu visual urgency, tetapi jangan mengganggu pekerjaan kasir secara permanen.

## 10. Core Flow B: Order Walk-in di Outlet

Flow utama POS untuk customer datang langsung ke outlet.

### Step 1: Pilih Pelanggan

Screen: `SelectCustomerForOrderScreen`

Fitur:

- Search pelanggan aktif by outlet.
- Loading, error, empty state.
- Menampilkan jumlah pelanggan ditemukan.
- Menampilkan count member dari hasil pencarian.
- FAB "Tambah Pelanggan".
- Jika pelanggan belum ada, kasir dapat membuat customer baru.

Data customer penting:

- name
- phone
- email
- address
- gender
- date of birth
- active status
- count orders
- count membership contracts
- count customer subscriptions/deposits

Design implication:

- Search customer harus cepat.
- Tambah customer harus ringan, idealnya bisa quick add dari context order.
- Customer dengan membership/deposit aktif harus mudah dikenali.

### Step 2: Pilih Layanan

Screen: `SelectLaundryServiceForOrderScreen`

Fitur:

- Load active laundry services by outlet.
- Load units.
- Load local draft order per customer.
- Search layanan.
- Pilih layanan membuka input quantity.
- Cart summary sticky bottom jika item sudah ada.
- Draft disimpan otomatis ke local storage setiap update.

Item draft:

- `laundryServiceId`
- `quantity`
- `notes`

Design implication:

- Layanan harus mudah discan berdasarkan nama, harga, kategori, unit, durasi, dan min quantity.
- Cart summary perlu selalu terlihat setelah ada item.
- Jika draft lama ditemukan, desain harus memberi indikasi "lanjutkan draft" atau langsung memuat item seperti current behavior.

### Step 3: Input Quantity dan Notes Item

Screen: `InputOrderItemScreen`

Fitur:

- Menampilkan harga satuan.
- Menampilkan estimasi durasi service jika ada.
- Quantity dengan tombol plus/minus dan input angka.
- Catatan tambahan item.
- Jika item sudah ada, user bisa simpan perubahan atau hapus.

Constraint:

- Quantity tidak boleh invalid.
- Current input memakai integer/digits only, walaupun domain quantity mendukung double di beberapa tempat.
- Redesign perlu mempertimbangkan apakah layanan kiloan membutuhkan decimal input; validasi final harus mengikuti backend/domain.

### Step 4: Review Pesanan

Screen: `ReviewOrderScreen`

Data yang diload:

- Active membership contracts customer.
- Active customer subscriptions/deposit.
- Transfer accounts jika payment method transfer/QRIS.

Informasi review:

- Customer card.
- Item list dan price breakdown.
- Context info jika ada discount/quota.
- Payment section.
- Estimated completion date.
- Notes.
- Summary total.
- Submit button sticky bottom.

Pricing:

- `OrderPriceCalculator` menghitung:
  - subtotal
  - quota discount
  - membership discount
  - total
  - per item breakdown
- Active membership dipilih dari contract status `active`, `aktif`, atau `ongoing`, dan tidak expired.
- Active quota dikumpulkan dari customer subscriptions aktif dan belum expired.
- Quota hanya berlaku untuk matching `laundryServiceId`.
- Membership discount dihitung terhadap payable subtotal setelah quota.
- Jika seluruh quantity tertutup quota, status menjadi `paid_by_package`.

Submit payload:

- `customerId`
- `employeeId`
- `paymentMethod`
- `paymentStatus`
- `paidAmount`
- `sourceAccountId`
- `notes`
- `estimatedCompletion`
- `orderItems`
- Per item dapat membawa:
  - `laundryServiceId`
  - `quantity`
  - `itemNotes`
  - `discountAmount`
  - `isPackageUsage`
  - `customerSubscriptionId`
  - `quotaUsed`

Design implication:

- Review harus menonjolkan total dan benefit yang dipakai.
- Payment status/method harus mudah dipahami oleh kasir.
- Akun/rekening tujuan harus muncul hanya saat diperlukan.
- Jangan menyembunyikan alasan submit disabled: pricing belum selesai, account belum dipilih, nominal belum valid.

### Step 5: Success Order

Screen: `OrderSuccessScreen`

Fitur:

- Success state.
- Informasi order:
  - order number
  - customer
  - date
  - estimated completion
  - item count
  - status
  - total
  - paid amount
  - remaining amount
- Aksi:
  - Cetak Struk / Label
  - Kirim Notifikasi WhatsApp
  - Kembali ke Daftar Pesanan

Design implication:

- Success screen adalah moment untuk print dan WA.
- Jangan hanya memberi "done"; kasir perlu next operational action.

## 11. Core Flow C: Weigh Order dan Koreksi Item

Screen: `WeighOrderScreen`

Kapan muncul:

- Dari order detail jika status order `received`.

Tujuan:

- Mengubah item dan quantity berdasarkan hasil timbang aktual.
- Menambah item/layanan baru jika ditemukan saat proses terima cucian.
- Menghitung ulang harga dan benefit membership/deposit.
- Menyimpan foto kondisi cucian/order.

Fitur:

- Header order.
- Photo section.
- Item list.
- Add item button.
- Select service bottom sheet untuk tambah/ganti layanan.
- Edit quantity per item.
- Edit item notes.
- Delete item.
- Notes customer.
- Internal notes.
- Price summary.
- Sticky bottom total estimasi dan submit.

Payload:

- `orderId`
- `employeeId`
- `notes`
- `internalNotes`
- `orderItems`
- optional `photoPath`

Teknis:

- Submit menggunakan multipart form-data.
- Data nested di-flatten agar backend menerima array field.
- Foto dikirim sebagai `photo`.

Constraint:

- Minimal 1 item.
- Session employee harus authenticated.
- Service list harus tersedia sebelum ganti/tambah item.
- Quantity mengikuti minimum quantity service saat service diganti.

Design implication:

- Weighing adalah flow domain-specific laundry. Ini harus mendapat perhatian khusus.
- Kasir perlu membandingkan kondisi order awal vs hasil timbang aktual.
- Foto dan internal notes harus terasa seperti proof/context, bukan hambatan utama.

## 12. Core Flow D: Print Receipt dan Label

Entry point:

- Order detail action print.
- Order success action print.

Modal:

- `showPrintModal(context, orderId)`
- Bottom sheet title: "Cetak Struk & Label"
- Subtitle: "Pilih jenis cetak dan konfirmasi pemakaian coin"

Flow:

1. Load print info dari backend.
2. Tampilkan pilihan receipt/struk dan label.
3. Kasir memilih jenis cetak.
4. Tampilkan confirmation sheet.
5. Confirmation menjelaskan coin akan dipotong saat konfirmasi.
6. Backend memproses receipt/label dan mengembalikan:
   - `coin_deducted`
   - `coin_source`
   - `remaining_coin`
7. App mencetak via `ThermalPrinterService`.
8. Success snackbar, modal ditutup.

Receipt data:

- outlet name/address
- order number
- order date
- cashier name
- customer name/phone
- items
- subtotal
- discount
- tax
- total
- paid amount
- remaining amount
- payment status
- estimated completion

Label data:

- outlet name
- order number
- order date
- customer name/phone
- items
- estimated completion

Design constraint:

- Jangan desain tombol print langsung tanpa konfirmasi coin.
- Print butuh printer connected/default dari settings.
- Jangan klaim semua printer didukung. Aman: Bluetooth thermal printer compatible dengan service yang dipakai.

## 13. Printer Setting

Screen: `PrinterSettingScreen`

Fitur:

- Load printer settings.
- Scan devices.
- Empty state jika tidak ada printer paired.
- List Bluetooth devices.
- Status:
  - Terhubung
  - Default
- Aksi:
  - Hubungkan
  - Putuskan
  - Test Print Struk

Design implication:

- Printer setting harus mudah diakses dari Setting.
- Jika print gagal karena printer belum tersambung, UX harus mengarahkan ke setting printer.
- Kasir outlet butuh status koneksi yang sangat jelas.

## 14. WhatsApp Notification

Entry point:

- Order detail action WhatsApp jika status bukan `requested`.
- Order success action WhatsApp.

Endpoint yang dipakai:

- Preview: `orders/{id}/wa-notification-preview`
- Send: `orders/{id}/send-wa-notification`

Konsep:

- App mengambil preview dari backend sebelum dikirim.
- Backend mengelola template/coin/delivery logic.

Design implication:

- Jangan desain flow manual copy-paste WhatsApp.
- Treat as backend-driven notification with preview/confirmation.
- WA notification adalah post-order communication atau operational update.

## 15. Customer Management dan CRM Ringan

### Customer List

Screen: `IndexCustomersScreen`

Fitur:

- Search customer.
- List customer.
- Add customer.
- Tap detail.
- Edit.
- Delete dengan confirmation dialog.
- Loading, empty, error state.

### Create/Edit Customer

Fields:

- name
- email optional
- phone optional
- address optional
- gender optional
- date of birth optional
- active flag pada edit

Validation:

- name wajib.
- email/phone mengikuti backend validation.
- active status hanya saat edit.

### Customer Detail

Screen: `ShowCustomerScreen`

Fitur:

- Customer info card.
- Menu:
  - Riwayat Order
  - Membership
  - Deposit
- Menu menampilkan count:
  - ordersCount
  - membershipContractsCount
  - customerSubscriptionsCount

Design implication:

- Customer detail adalah mini CRM.
- Dari customer, kasir bisa melihat history dan loyalty context.
- Customer dengan benefit aktif harus mudah dikenali saat membuat order.

## 16. Membership dan Customer Deposit/Subscription

Membership/deposit bukan hanya data master; keduanya mempengaruhi pricing order.

### Membership Customer

Entry:

- Customer detail -> Membership.

List:

- Search.
- Filter status.
- Add membership.
- Empty/loading/error state.

Create membership fields:

- Membership plan.
- Total pembayaran optional.
- Tanggal mulai.

Membership plan info:

- harga
- durasi
- discount percentage
- level
- description

Current gap:

- Navigation ke membership detail belum diimplementasi (`_navigateToMembershipDetail` kosong).

### Customer Deposit/Subscription

Entry:

- Customer detail -> Deposit.

List:

- Search.
- Filter status.
- Add deposit.
- Empty/loading/error state.

Create deposit/subscription fields:

- Service package.
- Harga dibayar.
- Tanggal pembelian.
- Catatan optional.

Service package option shows:

- package name
- price
- validity days

Current gap:

- Navigation ke subscription detail masih TODO.

Design implication:

- Saat redesign, membership/deposit customer sebaiknya diposisikan sebagai loyalty/benefit context.
- Jika detail belum ada, desain bisa mengusulkan detail screen, tetapi jangan menganggap sudah tersedia.

## 17. Data Master Outlet

Data master mendukung operasional order, tetapi bukan flow harian utama untuk semua kasir.

### Category

Fitur:

- List/search.
- Create.
- Detail.
- Edit.
- Delete dengan confirmation.

Fields create:

- name
- description optional

### Laundry Service

Fitur:

- List/search.
- Filter category.
- Filter unit.
- Create.
- Detail.
- Edit.
- Delete dengan confirmation.

Fields create:

- category
- unit
- name
- description optional
- price
- duration hours
- minimum quantity

Laundry service attributes penting:

- price
- unit
- category
- duration hours
- min quantity
- active state
- courier support metadata exists in domain, but current cashier service screens focus on outlet service management.

### Unit

Unit dipakai sebagai satuan quantity, misalnya kg, pcs, atau unit lain.

### Service Package

Paket deposit/service package tersedia sebagai menu data master dan dipakai saat membuat customer subscription/deposit.

### Membership Plan

Membership plan tersedia sebagai menu data master dan dipakai saat membuat membership contract customer.

Design implication:

- Data master bisa dikelompokkan ke "Setup Outlet" atau "Layanan & Paket".
- Jangan jadikan semua data master sebagai bottom navigation utama.

## 18. Dana & Keuangan Outlet

Screen utama: `IndexFinancesScreen`

Menu:

- Setoran Kasir
- Saldo Petty Cash/Kas Kecil
- Pengeluaran Outlet

### Setoran Kasir

List:

- Search.
- Filter status.
- Create setoran.
- Empty/loading/error state.

Create fields:

- Rekening tujuan/destination account.
- Jumlah setoran.
- Keterangan optional.
- Bukti setoran optional image/file.

Behavior:

- Load transfer accounts by outlet.
- Setoran akan menunggu persetujuan admin/owner.
- Attachment support ada di API.

Current gap:

- UI detail deposit sudah ada file `show_deposit_screen.dart`, tetapi navigation dari list masih dikomentari.

### Petty Cash

List:

- Search.
- Filter status.
- Create request.
- Empty/loading/error state.

Create fields:

- Tanggal permintaan.
- Jumlah permintaan.
- Deskripsi kebutuhan.

Behavior:

- Permintaan kas kecil akan direview pemilik.

Current gap:

- Tap detail petty cash saat ini hanya snackbar placeholder.

### Expense

List:

- Search.
- Filter status.
- Create expense.
- Empty/loading/error state.

Create fields:

- Akun pengeluaran.
- Tanggal pengeluaran.
- Jumlah pengeluaran.
- Keterangan.
- Bukti pengeluaran optional image.

Behavior:

- Load expense accounts by outlet.
- Expense langsung dicatat dalam sistem, dengan status mengikuti backend.

Current gap:

- Tap detail expense saat ini hanya snackbar placeholder.
- API docs menyebut route delete terdaftar tetapi controller destroy belum tersedia.

Design implication:

- Finance harus membantu accountability kasir.
- Karena beberapa detail belum wired, redesign dapat mengusulkan detail finance screens sebagai improvement.
- Jangan klaim app menggantikan full accounting system.

## 19. Error, Empty, Loading, dan Confirmation Patterns

Pola yang sudah konsisten:

- Loading memakai `AppLoadingIndicator`.
- Error memakai `AppErrorState` dengan retry.
- Empty memakai `AppEmptyState` dengan action jika relevan.
- Success/failure action memakai snackbar.
- Delete/complete/accept memakai dialog atau bottom sheet confirmation.
- Bottom action/sticky submit dipakai di checkout/review/weigh.
- Search/filter biasanya berada di atas list.

Design implication:

- Redesign harus mempertahankan state handling ini.
- Jangan membuat screen hanya ideal state.
- Untuk kasir, error harus memberi next action jelas: retry, kembali, pilih ulang account/printer, atau simpan draft.

## 20. Prioritas Screen untuk Redesign

Jika AI lain perlu membuat flow design, prioritaskan:

1. Home dashboard operational command center.
2. New order notification and requested order handling.
3. Order list with status filters and search.
4. Order detail with contextual next action.
5. Create order flow:
   - select customer
   - select service
   - input quantity/item notes
   - review payment/pricing
   - success with print/WA
6. Weigh order flow.
7. Print modal and printer setting.
8. Finance menu and create forms.
9. Customer detail, membership, and deposit/subscription context.
10. Data master grouping.

## 21. Suggested Information Architecture

Recommended IA for redesign:

- **Home**
  - daily summary
  - new order alert/badge
  - quick actions
  - urgent order queue shortcut
- **Transaksi**
  - list orders
  - requested/new orders
  - order detail
  - create order flow
  - weigh order
- **Customer**
  - list/search customer
  - customer detail
  - order history
  - membership
  - deposit/subscription
- **Dana**
  - finance overview
  - setoran kasir
  - petty cash
  - expense
- **Setup Outlet**
  - categories
  - laundry services
  - service packages
  - membership plans
- **Setting**
  - printer
  - profile
  - logout/account actions

This IA is a design recommendation. Current implementation uses bottom bar plus drawer; redesign can improve hierarchy but must preserve reachable features.

## 22. UX Constraints untuk AI Designer

Design should:

- Make the next action obvious per order status.
- Keep order totals and payment state visible in review/detail.
- Support fast customer search and quick customer creation.
- Make membership/deposit benefit visible at pricing time.
- Show disabled submit reasons.
- Keep print coin confirmation.
- Keep printer status visible before/when printing.
- Use sticky bottom actions for checkout/weigh/save flows.
- Use bottom sheets for selection and confirmation where current app already does.
- Maintain loading/empty/error states.
- Be comfortable for mobile and tablet outlet usage.

Design should not:

- Assume every order starts from customer app.
- Hide offline/local draft behavior.
- Merge customer deposit/subscription with cash deposit/setoran; these are different concepts.
- Claim full realtime data refresh beyond new order notifications.
- Claim payment gateway settlement or online payment automation unless separately confirmed.
- Claim full accounting replacement.
- Claim universal printer support.
- Remove confirmation from destructive or money-related actions.

## 23. Important Current Gaps and Mismatches

Tell the design AI these are current-state realities:

- Finance detail screens are incomplete or not fully wired from list taps.
- Membership contract detail navigation is empty.
- Customer subscription detail navigation is TODO.
- Dashboard "Setor" handler is currently empty.
- QRIS UI maps to backend transfer method.
- Some API docs mention old/common status and payment values; current UI filters and badges should be treated as source of truth for redesign.
- Quantity input in create order item is integer-only, while weighing/domain can handle decimal-like quantities; this needs validation if redesign proposes decimal input for kg.
- App is not offline-first. It has local session/token persistence, order draft, printer settings, and device id persistence.

## 24. API Surface Ringkas

Cashier mobile base paths from docs:

- `/api/mobile/cashier/orders`
- `/api/mobile/cashier/customers`
- `/api/mobile/cashier/categories`
- `/api/mobile/cashier/laundry-services`
- `/api/mobile/cashier/units`
- `/api/mobile/cashier/service-packages`
- `/api/mobile/cashier/membership-plans`
- `/api/mobile/cashier/membership-contracts`
- `/api/mobile/cashier/customer-subscriptions`
- `/api/mobile/cashier/deposits`
- `/api/mobile/cashier/petty-cashes`
- `/api/mobile/cashier/expenses`
- `/api/mobile/cashier/accounts`
- order WA notification preview/send endpoints
- print info/receipt/label endpoints through shared `ApiEndpoints`

Common API behavior:

- Auth required via Bearer token.
- List endpoints support pagination.
- Many list endpoints support search and status filter.
- File upload uses multipart/form-data for weighing photo, deposit proof, and expense proof.

## 25. Suggested Design Deliverable for the Other AI

Ask the other AI model to produce:

- Primary cashier user journey.
- Redesigned IA.
- Screen inventory.
- Flow diagrams for:
  - new online order
  - walk-in order
  - weighing
  - print
  - finance
- Per-screen content hierarchy.
- Main CTA and secondary actions per status.
- Edge cases and empty/error/loading states.
- Notes for existing component reuse from `wash_wallet_ui`.

Expected tone:

- Product-driven.
- Operational.
- Specific to laundry POS.
- Avoid generic SaaS dashboard language.

## 26. Source Areas Reviewed

Primary app files:

- `apps/cashier/lib/main.dart`
- `apps/cashier/lib/core/router/app_router.dart`
- `apps/cashier/lib/core/services/notification_service.dart`
- `apps/cashier/lib/core/navigation/push_notification_coordinator.dart`
- `apps/cashier/lib/features/auth/*`
- `apps/cashier/lib/features/home/*`
- `apps/cashier/lib/features/order/*`
- `apps/cashier/lib/features/customer/*`
- `apps/cashier/lib/features/membership_contract/*`
- `apps/cashier/lib/features/customer_subscription/*`
- `apps/cashier/lib/features/service_package/*`
- `apps/cashier/lib/features/category/*`
- `apps/cashier/lib/features/laundry_service/*`
- `apps/cashier/lib/features/deposit/*`
- `apps/cashier/lib/features/petty_cash/*`
- `apps/cashier/lib/features/expense/*`
- `apps/cashier/lib/features/print/*`
- `apps/cashier/lib/features/setting/*`

Shared packages:

- `packages/wash_wallet_ui/lib`
- `packages/wash_wallet_domain/lib`
- `packages/wash_wallet_core/lib/src/network/api/api_endpoints.dart`

Backend/API docs:

- `webapp/wash_wallet_be/docs/api/cashier/order_api.md`
- `webapp/wash_wallet_be/docs/api/cashier/customer_api.md`
- `webapp/wash_wallet_be/docs/api/cashier/deposit_mobile_api.md`
- `webapp/wash_wallet_be/docs/api/cashier/expense_api.md`
- other cashier API docs under `webapp/wash_wallet_be/docs/api/cashier`

