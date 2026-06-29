# WashWallet Portfolio Context

Dokumen ini adalah konteks siap pakai untuk AI lain yang akan menyusun materi portfolio/case study tentang project WashWallet. Gunakan ini sebagai sumber fakta utama. Jangan menambahkan angka bisnis, jumlah user, revenue, atau status production/live jika tidak diberikan secara eksplisit.

## Ringkasan Singkat

WashWallet adalah ekosistem aplikasi laundry berbasis SaaS untuk mengelola operasional multi-outlet dari sisi owner/admin, kasir, produksi/kurir, dan customer. Project ini berbentuk monorepo Flutter + Laravel:

- Web dashboard dan public landing page untuk owner/admin laundry.
- Mobile app kasir untuk transaksi outlet, customer, service, membership, pembayaran, notifikasi, dan cetak struk/label.
- Mobile app produksi/kurir untuk queue cucian, proses item, pickup/delivery, dan cetak.
- Mobile app customer untuk discovery outlet, alamat, order laundry, jadwal pickup/delivery, invoice, topup, dan review.
- Shared packages untuk core networking, domain model, data layer, dan UI kit.

Positioning portfolio yang paling kuat: "full-stack multi-role laundry operations platform", bukan sekadar aplikasi kasir laundry.

## Problem Yang Diselesaikan

Bisnis laundry biasanya punya masalah operasional manual:

- Data order, customer, status cucian, dan pembayaran tersebar.
- Koordinasi kasir, produksi, dan kurir tidak sinkron.
- Owner sulit memantau performa multi-outlet.
- Laporan keuangan, payroll, membership, dan promo sering dikerjakan terpisah.
- Customer tidak punya pengalaman digital untuk mencari outlet, menjadwalkan pickup/delivery, dan memantau pesanan.

WashWallet menyatukan workflow tersebut dalam satu platform dengan dashboard web, aplikasi role-specific, API backend, dan sistem pembayaran/notification/printing.

## Target Pengguna

- Owner laundry: mengelola outlet, service, harga, membership, payroll, laporan, wallet, dan fitur berbayar.
- Kasir/outlet staff: membuat order, mengelola customer, menerima pembayaran, mencetak struk/label, dan mengirim notifikasi.
- Staf produksi: melihat antrean proses, memulai/menyelesaikan proses cucian, dan memprioritaskan order urgent.
- Kurir: melihat jadwal pickup/delivery dan menjalankan status pickup/delivery.
- Customer laundry: mencari outlet, membuat pesanan, mengatur alamat, memilih pickup/delivery, membayar, topup, dan memberi review.
- Super admin/platform admin: mengelola bank withdrawal, fitur, dan konfigurasi platform.

## Product Surface

### 1. Web Dashboard Owner/Admin

Backend web berada di `webapp/wash_wallet_be` dengan Laravel + Inertia React. Dashboard memiliki modul:

- Outlet management, termasuk activation, feature access, courier settings, operational days, service, employee, customer, and positions.
- Order management, order item detail, payment logs, and manual payment handling.
- Customer management, subscription, membership contract, quota.
- Laundry service, category, unit, process, service package.
- Finance/accounting: chart of accounts, journal entries, general ledger, profit loss, balance sheet, deposits, expenses, petty cash, topup, prive.
- HR/payroll: employees, positions, salaries, attendance-related payroll, fines, loans, payroll items.
- Wallet and withdrawal: owner wallet balance, bank accounts, wallet withdrawal request, admin processing.
- Feature catalog/outlet feature exposure and trial/unlock flow.
- Notifications dashboard.
- Import/export flows for outlets, categories, customers, and laundry services.
- Public marketing site with feature pages for operations, accounting, coin system, HR/payroll, membership, and affiliate program.

### 2. Mobile App Kasir

Located at `apps/cashier`. Main features:

- Employee login using backend token auth.
- Cashier dashboard with cash balance and order status summary.
- Customer, category, laundry service, service package, membership plan, membership contract, customer subscription.
- Order CRUD and order actions: start, complete, accept, reject, weigh, mark COD paid.
- Deposit, expense, petty cash, account, unit.
- WhatsApp notification preview/send.
- Thermal printer settings and printing receipt/label via Bluetooth printer.

### 3. Mobile App Customer

Located at `apps/customer`. Main features:

- Onboarding, welcome, OTP auth, registration, password login.
- Firebase initialization and FCM token update.
- Home dashboard with customer, primary address, order summary, recent orders, featured outlets.
- Outlet discovery, search, nearby outlet, outlet detail, rating/review summary.
- Customer address CRUD with location/map-related support.
- Cart and order summary.
- Customer order lifecycle: create order, cancel, pay, schedule delivery, complete, review.
- Courier schedule and courier pricing calculation.
- Customer topup flow with payment page.
- Invoice and order detail screens.

### 4. Mobile App Produksi/Kurir

Located at `apps/production`. Main features:

- Employee login and auth guard.
- Production dashboard with summary, process queue, active orders, and priority orders.
- Order list/detail, pickup schedule, pickup confirmation.
- Order item detail.
- Order item process start/complete.
- Courier-specific order pickup and confirm-pickup API routes.
- Thermal printer support reused from shared core service.

### 5. Shared Flutter Packages

Located at `packages`.

- `wash_wallet_core`: Dio setup, auth interceptor, token storage, failure/result types, onboarding service, secure storage, thermal printer service.
- `wash_wallet_domain`: shared domain models generated with Freezed/JSON serialization, including order, outlet, customer, subscription, quota, active order, process queue, topup, review, RBAC access model, etc.
- `wash_wallet_data`: shared repository/data implementations for common auth/unit flows.
- `wash_wallet_ui`: shared UI theme and reusable components: button, card, text field, dropdown, snackbar, drawer, layout, tab bar, dialog, chip, empty/error/loading states, divider, list tile, badge, bottom sheet.

## Backend Architecture

Backend is in `webapp/wash_wallet_be`.

Core backend stack:

- Laravel 13.
- PHP 8.4.
- Laravel Sanctum for token auth.
- Inertia Laravel + React + TypeScript for dashboard UI.
- Tailwind CSS and Vite for frontend assets.
- Spatie Permission/query builder packages.
- Midtrans PHP SDK for payment gateway integration.
- Firebase/Kreait for FCM push notification.
- Maatwebsite Excel for import/export.
- Pest/PHPUnit for tests.

Backend architectural patterns:

- Service layer in `app/Services` for business logic.
- Controller layer split into `Api`, `Web`, `Import`, and `Admin`.
- API Resources in `app/Http/Resources` for normalized API responses.
- Eloquent models in `app/Models` with relationships, scopes, helper methods, casts, and soft deletes.
- Multi-tenant scoping in `BaseService` based on super admin, owner, employee, and outlet access.
- Position-based employee permission middleware via `position.permission:*`.
- Multiple auth contexts: web user, employee mobile auth, and customer mobile auth.
- Mobile API routes are separated by app: `api_mobile_cashier.php`, `api_mobile_customer.php`, `api_mobile_production.php`.
- Database migrations model a fairly complete laundry business domain.

## Key Backend Domains

### Order Lifecycle

Order data supports:

- Source: cashier or customer app.
- Status flow: requested, cancelled, accepted, rejected, picking_up, received, weighing, ready_to_process, in_progress, ready, delivering, delivered, completed.
- Payment status: not_yet_priced, unpaid, partial, paid, refunded, paid_by_package, cod.
- Pickup/delivery address, schedule, and fees.
- Midtrans order/transaction metadata.
- Order item snapshots: category name, service name, unit, quantity, price, package usage, quota used.
- Order item process records for production workflow.
- Status history and payment logs.

Relevant service: `OrderService`, with actions such as store, storeCustomer, accept, reject, weight, start, complete, pay, webhook handling, pickup, confirmPickup, startDelivery, finishDelivery, userComplete, markCodPaid.

### Courier and Delivery

Courier features include:

- Courier settings per outlet.
- Pricing methods: flat, free radius flat, base per km, tiered, progressive, base per km with free radius, zone based.
- Tiers and zones for delivery fee.
- Surge multiplier, night surcharge, weekend surcharge, merchant subsidy, free shipping, minimum order free shipping.
- Operational schedule validation and default bookable date resolution.
- Customer-facing fee calculation API.
- Courier eligibility flag on laundry services.
- Multi-outlet courier permission support.

Relevant services: `CourierPricingEngine`, `CourierSettingService`, `CourierScheduleService`, `CourierScheduleAvailabilityService`.

### Payments, Wallet, Topup

Payment-related features include:

- Midtrans charge and webhook handling for orders/topups.
- Customer topup with pending/success/failed status and Midtrans metadata.
- Owner wallet balance on user account.
- Wallet transactions as a ledger: order transfer income, order wallet income, withdrawal request, refund, manual adjustment.
- Wallet withdrawal flow: pending, processing, paid, rejected, cancelled.
- Owner bank accounts and admin withdrawal bank management.

Relevant services: `MidtransService`, `CustomerTopupService`, `WalletBalanceService`, `WalletWithdrawalService`.

### Notification and Communication

Communication features include:

- WhatsApp OTP storage and verification.
- WhatsApp message sending through Fonnte.
- Order notification template resolution.
- Coin deduction for WhatsApp notification usage.
- Firebase Cloud Messaging for customer notifications.
- Laravel database notifications for dashboard.

Relevant services: `CustomerAuthService`, `FonnteService`, `WaNotificationService`, `FcmNotificationService`.

### Coin and Printing

WashWallet includes a coin-based monetization/feature usage mechanism:

- Coin transactions.
- Coin deduction for printing or WhatsApp notification features.
- Accounting journal entries connected to coin usage.
- Thermal printer receipt and label flow in mobile apps.

Relevant services: `PrintService`, `WaNotificationService`, `ThermalPrinterService` in Flutter core.

### Accounting and HR

The backend contains:

- Chart of accounts.
- Journal entries and journal details.
- General ledger, profit/loss, balance sheet.
- Accounting periods.
- Expenses, deposits, petty cash, prive.
- Salaries, employee salary, payroll, payroll items.
- Loans, fines, fine logs.
- Employee processes and process commissions.

This is important for portfolio because it shows business depth beyond transaction CRUD.

## Flutter Architecture

Flutter stack:

- Dart/Flutter monorepo managed with Melos.
- Apps: `cashier`, `customer`, `production`.
- Shared packages: `core`, `domain`, `data`, `ui`.
- State management mostly with Flutter Bloc/Cubit.
- Navigation with GoRouter.
- API networking via Dio.
- Secure token storage with Flutter Secure Storage.
- Shared preferences/Hive for local state and onboarding/printer preferences.
- Freezed/json_serializable for immutable models.
- Firebase Core/Messaging in customer app.
- Google Maps/geolocation/geocoding in customer app.
- Bluetooth thermal printer integration through `print_bluetooth_thermal`.

Client-side pattern:

- Each feature typically follows `data/domain/presentation`.
- Repositories and usecases return `Result<T>` to avoid leaking exceptions to UI.
- Routes are guarded by auth/onboarding state.
- Shared UI kit enforces consistent theme, components, empty/error states, layout, and input controls across apps.

## Testing and Quality Signals

Local repository shows:

- Backend has 48 PHP test files under `webapp/wash_wallet_be/tests`.
- Test areas include courier pricing engine, courier schedule API/service, cross-outlet permission, employee login permissions, customer order creation/payment/cancel/schedule delivery, RBAC middleware, controller coverage, service coverage, and model coverage.
- Flutter has a small number of widget/model/datasource tests, mainly around app smoke tests and printing feature.
- Documentation includes specs for backend service/model/routing conventions and Flutter layer conventions.

Useful portfolio wording:

- "Implemented domain-driven service boundaries and reusable client packages."
- "Built role-specific mobile workflows backed by shared API and shared UI/domain packages."
- "Modeled order, payment, courier, membership, wallet, and accounting flows with relational data and explicit status lifecycles."
- "Added automated tests for backend business rules such as courier pricing, customer orders, and RBAC."

## Suggested Portfolio Framing

### Case Study Title Options

- WashWallet: Multi-Role SaaS Platform for Laundry Operations
- Building an End-to-End Laundry Operations Platform with Flutter and Laravel
- WashWallet: From Customer Ordering to Production Queue, Payment, and Owner Dashboard

### One-Liner

WashWallet is a full-stack laundry operations platform that connects customer ordering, cashier POS, production workflow, courier scheduling, payment, wallet, and owner analytics in a single multi-outlet system.

### Short Case Study Summary

I built WashWallet as a multi-role laundry business platform with Laravel, Inertia React, and Flutter. The system supports owner dashboards, cashier operations, customer ordering, production queues, courier scheduling, Midtrans payments, WhatsApp OTP/notifications, Firebase push notifications, thermal printing, wallet withdrawals, membership packages, and accounting reports. The project uses a monorepo structure with shared Flutter packages for networking, domain models, data access, and UI components, while the backend uses service-layer business logic, API resources, multi-tenant scoping, and position-based permissions.

### Strong Technical Highlights

- Designed a monorepo containing 3 Flutter apps plus shared core/domain/data/UI packages.
- Built a Laravel backend with role-specific mobile APIs for cashier, production/kurier, and customer.
- Implemented multi-tenant outlet scoping and position-based employee permissions.
- Modeled a complete order lifecycle from customer request to pickup, weighing, production, delivery, completion, and review.
- Built courier pricing engine with flat, distance-based, tiered, zone-based, surcharge, subsidy, and free-shipping support.
- Integrated Midtrans for order and customer topup payment flows.
- Integrated Fonnte WhatsApp OTP/message delivery and Firebase Cloud Messaging.
- Built Bluetooth thermal printer support for receipt and label printing from mobile apps.
- Added wallet ledger and withdrawal workflow for outlet owners.
- Built owner/admin dashboard with accounting, payroll, membership, import/export, notifications, and feature activation modules.
- Added backend tests for high-risk business rules including RBAC, customer order flows, and courier pricing.

## Suggested Case Study Structure For AI Writer

Use this structure when creating the final portfolio material:

1. Project overview: what WashWallet is and who it serves.
2. Problem: fragmented operations in laundry businesses.
3. Role-based solution: owner dashboard, cashier app, customer app, production/kurir app.
4. Architecture: Laravel backend, Inertia React dashboard, Flutter monorepo, shared packages.
5. Key workflows:
   - customer discovery to checkout;
   - cashier order management;
   - production queue;
   - courier scheduling;
   - payment/topup/wallet;
   - accounting/payroll dashboard.
6. Technical challenges:
   - synchronizing multi-role order lifecycle;
   - designing courier pricing and schedule validation;
   - enforcing multi-outlet RBAC;
   - keeping Flutter apps consistent with shared packages;
   - integrating payment, notification, and printing.
7. Outcome: use non-numeric outcome unless real metrics are provided.
8. Lessons learned: domain modeling, service boundaries, shared package design, status-driven workflow, test coverage for business rules.

## Claims To Avoid Unless Confirmed

Do not claim:

- Number of real users, outlets, transactions, revenue, or conversion.
- That the app is live in production or published to Play Store/App Store.
- That every module is fully finished or production-hardened.
- That all tests pass today unless they are actually run.
- That this was solo-built or team-built unless the owner confirms.

Safer wording:

- "Built/implemented a full-stack prototype/product system..."
- "Designed and developed the core modules..."
- "The codebase includes..."
- "The system supports..."
- "The project demonstrates..."

## Known Caveats For Honest Context

The repo includes an internal review file around multi-outlet RBAC. Some items in that review mention areas that needed or had needed follow-up, such as permission payload consistency and cross-outlet courier access behavior. When writing portfolio material, avoid saying "security is fully audited" or "RBAC is production-perfect". Use phrasing like "implemented position-based access control and multi-outlet scoping, with tests around key scenarios."

## Tech Stack Summary

Backend:

- Laravel 13, PHP 8.4, Sanctum, Inertia, Pest/PHPUnit.
- MySQL/relational schema implied by migrations.
- Midtrans, Firebase/Kreait, Fonnte, Maatwebsite Excel.

Frontend web:

- React 18, TypeScript, Inertia React, Tailwind CSS, Vite.
- Recharts, TanStack Table, Framer Motion, Lucide React.

Mobile:

- Flutter/Dart.
- Bloc/Cubit, GoRouter, Dio, Freezed, json_serializable.
- Flutter Secure Storage, Shared Preferences, Hive.
- Firebase Messaging, Google Maps, Geolocator/Geocoding.
- Bluetooth thermal printer packages.

Monorepo/tooling:

- Melos workspace.
- Shared packages for core, domain, data, and UI.

## Source Map

Useful paths if another AI or writer asks where facts came from:

- Root workspace config: `pubspec.yaml`.
- Flutter apps: `apps/cashier`, `apps/customer`, `apps/production`.
- Shared Flutter packages: `packages/wash_wallet_core`, `packages/wash_wallet_domain`, `packages/wash_wallet_data`, `packages/wash_wallet_ui`.
- Backend: `webapp/wash_wallet_be`.
- Backend routes: `webapp/wash_wallet_be/routes`.
- Backend services: `webapp/wash_wallet_be/app/Services`.
- Backend models: `webapp/wash_wallet_be/app/Models`.
- Backend migrations: `webapp/wash_wallet_be/database/migrations`.
- Web dashboard pages: `webapp/wash_wallet_be/resources/js/Pages/Dashboard`.
- Public landing/feature pages: `webapp/wash_wallet_be/resources/js/Pages/Home`, `webapp/wash_wallet_be/resources/js/Pages/Features`.
- Backend tests: `webapp/wash_wallet_be/tests`.

## Prompt For Another AI

Use this prompt with the context above:

```text
Saya ingin membuat materi portfolio/case study untuk project WashWallet. Gunakan konteks teknis dan produk yang saya berikan. Tulis sebagai case study profesional untuk software engineering portfolio, bukan copywriting marketing berlebihan.

Fokuskan narasi pada:
- full-stack multi-role laundry operations platform;
- Laravel backend + Inertia React dashboard + 3 Flutter mobile apps;
- role-specific workflows untuk owner/admin, kasir, customer, produksi, dan kurir;
- order lifecycle, courier pricing/scheduling, payment/topup/wallet, notification, thermal printing, accounting/payroll;
- arsitektur monorepo dan shared packages;
- technical challenges dan engineering decisions.

Jangan mengarang metrik, jumlah user, revenue, status live production, atau klaim security/audit. Jika butuh outcome, gunakan outcome kualitatif seperti "centralized operations", "reduced manual coordination", atau "demonstrates end-to-end domain modeling".

Buat output dalam bahasa Indonesia yang ringkas, tajam, dan cocok untuk portfolio developer.
```
