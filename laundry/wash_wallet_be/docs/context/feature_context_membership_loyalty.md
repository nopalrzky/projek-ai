# Feature Context - Membership & Loyalty

## Tujuan Context

Dokumen ini adalah content brief untuk AI lain yang akan menulis konten page feature Membership & Loyalty WashWallet.

Gaya yang harus dipakai: Actual + Guardrail. Jelaskan capability yang terbukti dari codebase, lalu batasi klaim seperti points, digital card, tier rewards, barcode, atau automation campaign yang belum terlihat sebagai flow aktif.

## Ringkasan Feature

Membership & Loyalty di codebase WashWallet saat ini paling aman diposisikan sebagai sistem customer retention berbasis customer database, paket layanan prabayar, quota layanan, membership plan, membership contract, benefit diskon/free shipping, dan saldo deposit customer.

Narasi aman: WashWallet membantu outlet laundry membuat paket berlangganan, menjual paket ke customer, melacak sisa quota per layanan, memakai quota saat order, dan mengelola benefit membership seperti diskon dan free shipping quota.

## Capability yang Aman Diklaim

- Customer database:
  - Customer tersimpan per outlet dengan data kontak, alamat, dan akun customer.
  - Mobile cashier memiliki endpoint customer CRUD dan customer detail.
  - Mobile customer memiliki address management dan profile/auth flow.

- Customer account dan topup:
  - Customer account memiliki `deposit_balance`.
  - Customer mobile dapat membuat topup via Midtrans dan balance bertambah saat payment success.
  - Customer topup memiliki status, payment status, payment method/provider, payment data, Midtrans order id, dan expired time.

- Service package:
  - Outlet dapat membuat service package dengan nama, harga, masa berlaku, deskripsi, active flag, dan daftar item layanan.
  - Item package mengikat laundry service tertentu dengan quantity/quota.
  - Package yang sudah punya transaksi dilindungi dari perubahan langsung.

- Customer subscription/quota:
  - Customer subscription dibuat dari service package aktif.
  - Saat subscription dibuat, backend membuat `CustomerQuota` per service package item.
  - Subscription memiliki code, price paid, purchase date, expired date, dan status active/exhausted/expired/cancelled.
  - Quota tersimpan sebagai total quota dan remaining quota per laundry service.

- Penggunaan paket pada order:
  - Store order mendukung `isPackageUsage`, `customerSubscriptionId`, dan `quotaUsed` per item.
  - Validasi memastikan quota ada dan remaining quota cukup.
  - Saat order disimpan atau di-update, remaining quota dikurangi atau dikembalikan sesuai perubahan item.
  - Usage dicatat di `QuotaUsageLog`.
  - Payment status `paid_by_package` tersedia pada order.

- Membership plan:
  - Membership plan per outlet memiliki name, price, level, duration days, active flag, discount percentage, description, free shipping flag, free shipping quota, dan free shipping validity days.
  - Codebase mendukung CRUD/list/filter plan dan endpoint mobile cashier untuk membaca plan.

- Membership contract:
  - Membership contract mengikat customer, outlet, dan membership plan.
  - Contract menyimpan start, expired, status, total paid, free shipping used, dan free shipping expires at.
  - Helper `canUseFreeShipping`, `useFreeShipping`, dan remaining free shipping tersedia di model.

- Accounting untuk paket:
  - Penjualan customer subscription dicatat sebagai journal package sale.
  - Penggunaan quota package pada order dicatat sebagai package usage journal.
  - Expired package dapat mencatat package breakage journal.

## Source of Truth dari Codebase

- Route customer, customer subscription, membership plan/contract, service package ada di `routes/web.php`, `routes/api_mobile_cashier.php`, dan `routes/api_mobile_customer.php`.
- Customer subscription service ada di `app/Services/CustomerSubscriptionService.php`.
- Service package service ada di `app/Services/ServicePackageService.php`.
- Membership plan service ada di `app/Services/MembershipPlanService.php`.
- Membership contract service ada di `app/Services/MembershipContractService.php`.
- Customer topup ada di `app/Services/CustomerTopupService.php` dan `app/Http/Controllers/Api/CustomerTopupController.php`.
- Penggunaan package di order ada di `app/Services/OrderService.php` dan validasi request order.
- Accounting package ada di `app/Services/AccountingService.php`.
- Entity utama ada di `app/Models/Customer.php`, `app/Models/CustomerAccount.php`, `app/Models/CustomerSubscription.php`, `app/Models/CustomerQuota.php`, `app/Models/QuotaUsageLog.php`, `app/Models/ServicePackage.php`, `app/Models/ServicePackageItem.php`, `app/Models/MembershipPlan.php`, dan `app/Models/MembershipContract.php`.

## Flow / Entity Utama

1. Owner/outlet membuat service package berisi beberapa laundry service dan quota per layanan.
2. Kasir menjual package ke customer sebagai customer subscription.
3. Backend membuat quota per layanan dan memberi subscription code.
4. Saat order memakai paket, item order membawa subscription dan quota used.
5. Backend validasi remaining quota, mengurangi quota, mencatat usage log, dan menandai subscription exhausted jika tidak ada quota tersisa.
6. Membership plan/contract berjalan terpisah dari package quota: plan memberi diskon/free shipping benefit, contract menyimpan masa aktif dan pemakaian free shipping.
7. Customer dapat melakukan topup saldo deposit di mobile app.

## Angle Konten untuk Feature Page

- "Ubah pelanggan sekali datang menjadi pelanggan paket."
- "Jual paket layanan, pantau sisa quota, dan gunakan quota langsung saat transaksi."
- "Membership benefit bisa dibuat per outlet: diskon, durasi, dan free shipping quota."
- "Customer data, saldo deposit, package quota, dan order usage saling terhubung."
- "Cocok untuk laundry yang ingin mendorong repeat order tanpa spreadsheet quota manual."

## Batas Klaim / Jangan Diklaim

- Jangan klaim loyalty points atau point rewards. Tidak ada flow points aktif untuk customer membership.
- Jangan klaim digital membership card, barcode scan, QR scan membership, atau kartu shareable.
- Jangan klaim tier rewards/gamification seperti Silver/Gold/Platinum berbasis spending. Field `level` ada di membership plan, tetapi bukan engine reward tier otomatis.
- Jangan klaim targeted promo, birthday offer, win-back campaign, atau marketing automation.
- Jangan klaim referral sebagai bagian dari membership page. Referral adalah feature terpisah.
- Jangan klaim customer bisa redeem points atau voucher jika tidak ada flow aktif.
- Jangan klaim package quota otomatis sinkron dengan inventory.

## Saran Section Page

- Hero: "Paket dan membership untuk repeat order yang lebih mudah dilacak."
- Problem: quota paket dicatat manual, benefit member sulit dicek, saldo customer tidak rapi.
- Feature block 1: Customer database dan customer account.
- Feature block 2: Service package dan quota per layanan.
- Feature block 3: Subscription customer dan penggunaan quota saat order.
- Feature block 4: Membership plan, discount, free shipping quota, dan contract.
- Feature block 5: Accounting package sale/usage/breakage.
- Guardrail note internal: gunakan istilah "membership benefit" dan "paket quota", bukan "points reward engine".

## Referensi Kode

- `routes/web.php`
- `routes/api_mobile_cashier.php`
- `routes/api_mobile_customer.php`
- `app/Http/Controllers/Api/CustomerSubscriptionController.php`
- `app/Http/Controllers/Api/MembershipPlanController.php`
- `app/Http/Controllers/Api/MembershipContractController.php`
- `app/Http/Controllers/Api/ServicePackageController.php`
- `app/Http/Controllers/Api/CustomerTopupController.php`
- `app/Services/CustomerSubscriptionService.php`
- `app/Services/ServicePackageService.php`
- `app/Services/MembershipPlanService.php`
- `app/Services/MembershipContractService.php`
- `app/Services/CustomerTopupService.php`
- `app/Services/OrderService.php`
- `app/Services/AccountingService.php`
- `app/Models/Customer.php`
- `app/Models/CustomerAccount.php`
- `app/Models/CustomerSubscription.php`
- `app/Models/CustomerQuota.php`
- `app/Models/QuotaUsageLog.php`
- `app/Models/ServicePackage.php`
- `app/Models/ServicePackageItem.php`
- `app/Models/MembershipPlan.php`
- `app/Models/MembershipContract.php`
- `resources/js/Data/Features/Membership.tsx` sebagai copy pembanding, bukan source of truth jika bertentangan dengan backend.
