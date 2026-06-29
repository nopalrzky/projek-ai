# Feature Context - Operational Management

## Tujuan Context

Dokumen ini adalah content brief untuk AI lain yang akan menulis konten page feature Operational Management WashWallet.

Gaya yang harus dipakai: Actual + Guardrail. Copy boleh menjual manfaat bisnis, tetapi klaim utama harus bisa ditarik ke route, service, model, migration, atau resource yang ada di codebase. Jika capability hanya muncul di copy marketing lama dan tidak terlihat sebagai flow aktif, masukkan ke guardrail.

## Ringkasan Feature

Operational Management adalah pondasi operasional laundry di WashWallet: owner mengatur outlet, layanan, kategori, unit, role karyawan, fitur outlet, order dari kasir atau customer app, workflow produksi, courier pickup/delivery, notifikasi WhatsApp, print receipt/label, dan dashboard mobile/web untuk peran terkait.

Narasi aman: WashWallet membantu outlet laundry mengelola order dari masuk sampai selesai, memecah pekerjaan per item/proses, memberi akses mobile untuk kasir/produksi/kurir/customer, dan menjaga akses data lewat permission per posisi.

## Capability yang Aman Diklaim

- Manajemen outlet dan multi-outlet context:
  - Owner dapat mengelola outlet, setting outlet, operational days, courier setting, courier schedule, feature activation, dan exposure outlet.
  - Employee dapat punya akses posisi di outlet yang relevan, termasuk helper multi-outlet untuk kurir.

- Master data layanan:
  - Kategori, laundry service, unit, process, laundry service process, dan service package tersedia sebagai data operasional.
  - Laundry service memiliki flag `supports_courier` untuk membatasi layanan yang bisa memakai flow kurir.

- Order intake dari kasir dan customer:
  - Mobile cashier memiliki endpoint untuk list, create, update, accept, reject, weigh, start, complete, mark COD paid, dan lihat order context customer.
  - Mobile customer dapat membuat order, melihat order, cancel, pay, schedule delivery, complete, dan review.
  - Order menyimpan `source` (`cashier` atau `customer_app`), customer, outlet, employee, item, pembayaran, pickup/delivery schedule, address, dan notes.

- Status order dan tracking:
  - Status order mencakup requested, accepted, rejected, picking_up, received, weighing, ready_to_process, in_progress, ready, delivering, delivered, completed, cancelled, dan pending_dropoff pada model.
  - Riwayat status order tersedia lewat `OrderStatusHistory`.
  - Order item memiliki status pending, processing, done, cancelled serta progress berdasarkan process.

- Tracking produksi per item/proses:
  - Order item dapat di-start/complete.
  - Order item process dapat di-start/complete, menyimpan employee, qty processed, timestamp, evidence attachment, dan urutan process.
  - Completion process dapat mencatat work log/commission jika employee memiliki rule komisi proses.

- Courier pickup/delivery:
  - Courier setting mendukung konfigurasi biaya pickup/delivery, metode pricing, zone/tier, free shipping, dan toggle courier.
  - Courier schedule tersedia untuk kasir/customer/production/courier.
  - Production/courier route mendukung pickup, confirm pickup, confirm arrived, dan list schedule.
  - Customer route mendukung calculate delivery fee, outlet nearby, address, dan schedule delivery.

- Notifikasi:
  - WhatsApp notification tersedia untuk preview/send per order, memakai template status dan coin deduction.
  - FCM token employee/customer dan job/event tertentu tersedia untuk order baru, order diterima customer, dan courier pickup notification.

- Print operasional:
  - API print menyediakan info order serta process receipt dan label.
  - Print receipt/label memakai coin pricing, coin transaction, dan journal entry.

- Role dan permission:
  - Route mobile memakai middleware `position.permission:*`.
  - Position permission memiliki catalog, default positions, dan permission key per posisi.
  - Employee memiliki helper untuk cek permission per outlet dan akses outlet.

- Feature activation per outlet:
  - Feature catalog dan outlet feature mendukung trial, unlock, activate, exposure, auto renewal exposure, dan activate courier.

- Dashboard:
  - Web dashboard dan mobile dashboard untuk cashier, production, dan customer tersedia.
  - Dashboard aman disebut sebagai context operasional multi-outlet/per-role, tetapi jangan klaim analytics lanjutan yang tidak terlihat.

## Source of Truth dari Codebase

- Route web dashboard dan resource operasional ada di `routes/web.php`.
- Route mobile cashier ada di `routes/api_mobile_cashier.php`.
- Route mobile production/courier ada di `routes/api_mobile_production.php`.
- Route mobile customer ada di `routes/api_mobile_customer.php`.
- Route WA notification dan print ada di `routes/api.php`.
- Core flow order ada di `app/Services/OrderService.php` dan `app/Http/Controllers/Api/OrderController.php`.
- Item/process tracking ada di `app/Services/OrderItemService.php`, `app/Http/Controllers/Api/OrderItemController.php`, dan `app/Http/Controllers/Api/OrderItemProcessController.php`.
- Model status dan entity utama ada di `app/Models/Order.php`, `app/Models/OrderItem.php`, `app/Models/OrderItemProcess.php`, dan `app/Models/OrderStatusHistory.php`.
- WA notification ada di `app/Services/WaNotificationService.php` dan `app/Http/Controllers/Api/WaNotificationController.php`.
- Print receipt/label ada di `app/Services/PrintService.php` dan `app/Http/Controllers/Api/PrintController.php`.
- Permission per posisi ada di `app/Http/Middleware/CheckPositionPermission.php`, `app/Models/Position.php`, `app/Models/PositionPermission.php`, dan `app/Services/PositionService.php`.
- Feature lock per outlet ada di `app/Http/Middleware/CheckFeatureAccess.php`.
- Courier setting/pricing ada di `app/Services/CourierSettingService.php`, `app/Services/CourierPricingEngine.php`, `app/Models/CourierSetting.php`, `app/Models/CourierSchedule.php`, `app/Models/CourierPricingZone.php`, dan `app/Models/CourierPricingTier.php`.
- Feature/outlet feature ada di `app/Services/FeatureService.php`, `app/Services/OutletFeatureService.php`, `app/Models/Feature.php`, dan `app/Models/OutletFeature.php`.

## Flow / Entity Utama

1. Owner membuat atau mengatur outlet, setting, operational day, layanan, kategori, unit, process, posisi, permission, dan fitur outlet.
2. Employee login ke mobile cashier atau mobile production memakai token Sanctum dan permission position.
3. Kasir atau customer membuat order. Order menyimpan source, outlet, customer, payment status, pickup/delivery data, dan order items.
4. Order diproses melalui accept/reject, weigh, start, complete, atau flow pickup/delivery sesuai status.
5. Order item dan order item process dapat dikerjakan per tahapan, dengan employee, timestamp, evidence, dan work log commission.
6. Kurir dapat mengambil, confirm pickup, confirm arrived, dan melihat schedule jika punya permission courier.
7. WA notification dan print receipt/label dapat dipakai sebagai aksi tambahan dengan coin deduction dan pencatatan transaksi.

## Angle Konten untuk Feature Page

- "Dari order masuk sampai siap antar, semua status ada di satu sistem."
- "Kasir, produksi, dan kurir memakai workflow yang sama, tapi dengan akses sesuai posisi."
- "Owner punya kontrol outlet, layanan, fitur, dan permission dari dashboard."
- "Order tidak hanya tercatat sebagai transaksi, tetapi bisa dipantau per item dan per proses kerja."
- "Courier dan customer app menjadi bagian dari operasional, bukan modul terpisah."

## Batas Klaim / Jangan Diklaim

- Jangan klaim offline-capable atau auto-sync saat internet kembali. Tidak terlihat sebagai capability backend.
- Jangan klaim SMS otomatis. Yang terlihat adalah WhatsApp/Fonnte dan FCM.
- Jangan klaim auto-assign tim produksi, smart queue, escalation otomatis, atau AI prioritization.
- Jangan klaim inventory, stock opname, atau bahan baku.
- Jangan klaim backup otomatis, end-to-end encryption, atau disaster recovery.
- Jangan klaim analytics detail seperti average turnaround time, peak hour analysis, productivity score, atau customer satisfaction trending kecuali dibuat berbasis data yang memang tersedia.
- Jangan klaim shift scheduling atau attendance management sebagai bagian aktif operational page.
- Jangan klaim semua notifikasi otomatis untuk semua status. Yang aman: preview/send WA status order dan beberapa FCM event/job yang ada.

## Saran Section Page

- Hero: "Operasional laundry dari kasir, produksi, sampai kurir dalam satu alur."
- Problem: order tercecer, status tidak sinkron, tim bingung prioritas, customer sering bertanya status.
- Feature block 1: Order intake dan status lifecycle.
- Feature block 2: Tracking per item dan process produksi.
- Feature block 3: Mobile role access untuk kasir, produksi, kurir, customer.
- Feature block 4: Courier, WhatsApp notification, dan print receipt/label.
- Feature block 5: Outlet setting, feature activation, dan permission.
- Guardrail note internal: hindari angka outcome seperti "+40%" kecuali ada data customer/testimonial.

## Referensi Kode

- `routes/web.php`
- `routes/api.php`
- `routes/api_mobile_cashier.php`
- `routes/api_mobile_production.php`
- `routes/api_mobile_customer.php`
- `app/Http/Controllers/Api/OrderController.php`
- `app/Http/Controllers/Api/OrderItemController.php`
- `app/Http/Controllers/Api/OrderItemProcessController.php`
- `app/Http/Controllers/Api/WaNotificationController.php`
- `app/Http/Controllers/Api/PrintController.php`
- `app/Services/OrderService.php`
- `app/Services/OrderItemService.php`
- `app/Services/WaNotificationService.php`
- `app/Services/PrintService.php`
- `app/Services/CourierSettingService.php`
- `app/Services/CourierPricingEngine.php`
- `app/Services/OutletFeatureService.php`
- `app/Http/Middleware/CheckPositionPermission.php`
- `app/Http/Middleware/CheckFeatureAccess.php`
- `app/Models/Order.php`
- `app/Models/OrderItem.php`
- `app/Models/OrderItemProcess.php`
- `app/Models/OrderStatusHistory.php`
- `app/Models/CourierSetting.php`
- `app/Models/CourierSchedule.php`
- `app/Models/Feature.php`
- `app/Models/OutletFeature.php`
- `resources/js/Data/Features/OperationalManagement.tsx` sebagai copy pembanding, bukan source of truth jika bertentangan dengan backend.
