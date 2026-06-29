# Implementation Plan: Halaman Akun Customer MVP

> Berdasarkan: `docs/user_need/customer_account_profile_mvp_user_need.md`  
> Scope: Customer App (`apps/customer`) — presentation layer only, read-only

---

## ⚠️ Instruksi Wajib untuk AI Model

Sebelum menulis kode apapun, **selalu baca** spec berikut:

- `docs/spec/cubit_spec.md` — pola Cubit & `result.when()`
- `docs/spec/state_spec.md` — pola State & sealed class
- `docs/spec/usecase_spec.md` — pola Usecase & Params class

**Aturan ketat yang tidak boleh dilanggar:**

1. **Gunakan `context.colors.*`** — jangan hardcode warna (`Color(0xFF...)` atau `Colors.red`)
2. **Gunakan `context.typography.*`** — jangan hardcode `TextStyle`
3. **Gunakan `context.space.*`** — jangan hardcode angka spacing
4. **Gunakan `context.radius.*`** — jangan hardcode `BorderRadius`
5. **Gunakan shared UI components** dari `wash_wallet_ui` — `AppCard`, `AppButton`, `AppLoadingIndicator`, `AppSnackbar`, `AppHeader`, `AppLayout`, `AppDialog`, `AppBadge`, `AppListTile`, dll.
6. **Pecah widget besar** menjadi widget-widget kecil di folder `widgets/`
7. **Tidak ada comment** — tulis clean code yang self-explanatory
8. **Gunakan named parameters** di constructor
9. **Tidak boleh membuat** `ProfileCubit`, `ProfileRepository`, atau endpoint backend baru

---

## Ringkasan Perubahan

| File | Aksi | Keterangan |
|------|------|------------|
| `profile_screen.dart` | MODIFY | Ganti placeholder dengan halaman Akun lengkap (StatefulWidget) |
| `profile_account_header_widget.dart` | NEW | Widget header "Akun Saya" |
| `profile_summary_card_widget.dart` | NEW | Card ringkasan profil (avatar, nama, HP, badge verifikasi) |
| `profile_wallet_card_widget.dart` | NEW | Card saldo deposit + CTA Topup & Riwayat |
| `profile_status_card_widget.dart` | NEW | Closable status card untuk kondisi profil belum lengkap |
| `profile_quick_actions_widget.dart` | NEW | Grid shortcut ke fitur utama |
| `profile_recent_activity_widget.dart` | NEW | Section aktivitas terbaru (reuse `HomeDashboardCubit`) |
| `profile_menu_section_widget.dart` | NEW | Daftar menu akun dengan item aktif dan disabled |
| `profile_logout_button_widget.dart` | NEW | Tombol logout dengan confirmation dialog |

---

## Fase 1 — Persiapan: Baca State yang Tersedia

Sebelum implementasi, pahami data source yang dipakai:

### 1.1 `CustomerAuthCubit` (global, tersedia di seluruh app)

**File:** `apps/customer/lib/features/auth/presentation/bloc/customer_auth_cubit.dart`

```
CustomerAuthCubit
  └── state: CustomerAuthState
        ├── CustomerAuthAuthenticated(customer: CustomerAccount)
        ├── CustomerAuthLoading
        └── CustomerAuthUnauthenticated
```

`CustomerAuthCubit.logout()` sudah tersedia dan memanggil `CustomerLogoutUsecase` → emit `CustomerAuthUnauthenticated`.

### 1.2 `CustomerAccount` entity (data profil)

**File:** `packages/wash_wallet_domain/lib/src/entities/customer_account.dart`

```dart
class CustomerAccount {
  final int id;
  final String phone;
  final String name;
  final String? email;
  final String? gender;
  final String? avatar;
  final String? dateOfBirth;
  final bool isVerified;
  final bool isActive;
  final String? lastLoginAt;
  final String? fcmToken;
  final int depositBalance; // dalam satuan rupiah (int)
}
```

### 1.3 `HomeDashboardCubit` (global, tersedia di seluruh app)

**File:** `apps/customer/lib/features/home/presentation/bloc/home_dashboard_cubit.dart`

```
HomeDashboardCubit
  └── state: HomeDashboardState
        ├── HomeDashboardSuccess(dashboard: HomeDashboard)
        │     └── dashboard.recentOrders: List<RecentOrder>
        ├── HomeDashboardLoading
        ├── HomeDashboardInitial
        └── HomeDashboardFailure
```

`RecentOrder` memiliki field: `id`, `orderNumber`, `status`, `paymentStatus`, `totalAmount`, `outletName`, `orderDate`.

### 1.4 Route yang tersedia dan siap dipakai

| Route | Tujuan |
|-------|--------|
| `/customer-addresses` | Halaman alamat |
| `/orders` | Daftar pesanan |
| `/promos` | Halaman promo |
| `/topup` | Riwayat topup |
| `/topup/create` | Buat topup baru |
| `/orders/:id` | Detail order (gunakan `context.push('/orders/$id')`) |

---

## Fase 2 — `ProfileScreen` (StatefulWidget)

**File:** `apps/customer/lib/features/profile/presentation/screens/profile_screen.dart`

Ganti `StatelessWidget` placeholder menjadi `StatefulWidget`. Screen ini membaca auth state via `BlocBuilder<CustomerAuthCubit, CustomerAuthState>`.

### 2.1 Struktur layout

```
Scaffold
  └── AppLayout (atau SafeArea + CustomScrollView)
        └── Column / SingleChildScrollView
              ├── ProfileAccountHeaderWidget          ← Fase 3.1
              ├── _StatusCardSection                  ← Fase 3.2 (conditional)
              ├── ProfileSummaryCardWidget             ← Fase 3.3
              ├── ProfileWalletCardWidget              ← Fase 3.4
              ├── ProfileQuickActionsWidget            ← Fase 3.5
              ├── ProfileRecentActivityWidget          ← Fase 3.6
              ├── ProfileMenuSectionWidget             ← Fase 3.7
              └── ProfileLogoutButtonWidget            ← Fase 3.8
```

### 2.2 State management di ProfileScreen

```dart
class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  String? _dismissedStatusCardSignature;

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<CustomerAuthCubit, CustomerAuthState>(
      builder: (context, authState) {
        if (authState is! CustomerAuthAuthenticated) {
          return const Scaffold(
            body: Center(child: AppLoadingIndicator()),
          );
        }

        final customer = authState.customer;
        final statusSignature = _buildStatusSignature(customer);
        final showStatusCard = statusSignature != null &&
            statusSignature != _dismissedStatusCardSignature;

        return Scaffold(
          backgroundColor: context.colors.background,
          body: SafeArea(
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  ProfileAccountHeaderWidget(),
                  if (showStatusCard)
                    ProfileStatusCardWidget(
                      customer: customer,
                      onDismiss: () {
                        setState(() {
                          _dismissedStatusCardSignature = statusSignature;
                        });
                      },
                    ),
                  ProfileSummaryCardWidget(customer: customer),
                  ProfileWalletCardWidget(customer: customer),
                  ProfileQuickActionsWidget(),
                  ProfileRecentActivityWidget(),
                  ProfileMenuSectionWidget(),
                  ProfileLogoutButtonWidget(),
                  SizedBox(height: context.space.xxl),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  String? _buildStatusSignature(CustomerAccount customer) {
    final conditions = <String>[];
    if (customer.email == null || customer.email!.isEmpty) {
      conditions.add('missing_email');
    }
    if (customer.dateOfBirth == null || customer.dateOfBirth!.isEmpty) {
      conditions.add('missing_birthdate');
    }
    if (customer.gender == null || customer.gender!.isEmpty) {
      conditions.add('missing_gender');
    }
    if (!customer.isVerified) {
      conditions.add('not_verified');
    }
    if (!customer.isActive) {
      conditions.add('inactive');
    }
    return conditions.isEmpty ? null : conditions.join('|');
  }
}
```

**Catatan penting:**
- `_dismissedStatusCardSignature` disimpan di local state (in-memory). Ketika app di-restart, card bisa muncul kembali — ini valid untuk MVP.
- Jika kondisi berubah (misalnya customer mengisi email dari halaman lain), `statusSignature` akan berubah → card muncul kembali.

---

## Fase 3 — Widget-widget Baru

Semua widget baru diletakkan di:  
`apps/customer/lib/features/profile/presentation/widgets/`

### 3.1 `profile_account_header_widget.dart`

Header halaman dengan judul `Akun Saya`. Tidak ada tombol back (ini tab bottom navigation).

```dart
class ProfileAccountHeaderWidget extends StatelessWidget {
  const ProfileAccountHeaderWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.fromLTRB(
        context.space.lg,
        context.space.lg,
        context.space.lg,
        context.space.md,
      ),
      child: Text(
        'Akun Saya',
        style: context.typography.headlineMedium.copyWith(
          fontWeight: FontWeight.w700,
          color: context.colors.textPrimary,
        ),
      ),
    );
  }
}
```

### 3.2 `profile_status_card_widget.dart`

Card yang menampilkan kondisi profil yang perlu perhatian. Bisa di-dismiss.

**Props:** `customer: CustomerAccount`, `onDismiss: VoidCallback`

**Logika kondisi:**
- Email kosong: tampilkan pesan `Tambahkan email agar akun lebih lengkap`
- Tanggal lahir kosong: tampilkan pesan `Tambahkan tanggal lahir`
- Gender kosong: tampilkan pesan `Lengkapi data gender kamu`
- `isVerified == false`: tampilkan pesan `Akun belum terverifikasi`
- `isActive == false`: tampilkan pesan `Akun kamu tidak aktif, hubungi admin`
- Jika ada beberapa kondisi, tampilkan yang paling penting (prioritaskan `inactive` → `not_verified` → `missing_email` → `missing_birthdate` → `missing_gender`) atau tampilkan semuanya dalam list

**Desain card:**
```
┌─────────────────────────────────────────┐
│ ⚠️  Profil belum lengkap          [✕]  │
│                                         │
│ • Tambahkan email untuk melengkapi akun │
│ • Tanggal lahir belum diisi             │
└─────────────────────────────────────────┘
```

Gunakan `AppCard` dengan warna `colors.warningSurface` atau `colors.primarySurface`.  
Gunakan `AppButton` atau `IconButton` dengan icon `Icons.close` untuk tombol tutup.

```dart
class ProfileStatusCardWidget extends StatelessWidget {
  final CustomerAccount customer;
  final VoidCallback onDismiss;

  const ProfileStatusCardWidget({
    super.key,
    required this.customer,
    required this.onDismiss,
  });

  @override
  Widget build(BuildContext context) {
    final messages = _buildMessages(customer);
    if (messages.isEmpty) return const SizedBox.shrink();

    return Padding(
      padding: EdgeInsets.symmetric(
        horizontal: context.space.lg,
        vertical: context.space.sm,
      ),
      child: AppCard(
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(Icons.info_outline, color: context.colors.warning, size: 20),
            SizedBox(width: context.space.sm),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Profil belum lengkap',
                    style: context.typography.labelMedium.copyWith(
                      fontWeight: FontWeight.w600,
                      color: context.colors.textPrimary,
                    ),
                  ),
                  SizedBox(height: context.space.xs),
                  ...messages.map((msg) => Text(
                    '• $msg',
                    style: context.typography.bodySmall.copyWith(
                      color: context.colors.textSecondary,
                    ),
                  )),
                ],
              ),
            ),
            IconButton(
              icon: Icon(Icons.close, size: 18, color: context.colors.textSecondary),
              onPressed: onDismiss,
              padding: EdgeInsets.zero,
              constraints: const BoxConstraints(),
            ),
          ],
        ),
      ),
    );
  }

  List<String> _buildMessages(CustomerAccount customer) {
    final messages = <String>[];
    if (!customer.isActive) messages.add('Akun tidak aktif, hubungi admin');
    if (!customer.isVerified) messages.add('Akun belum terverifikasi');
    if (customer.email == null || customer.email!.isEmpty) {
      messages.add('Tambahkan email untuk melengkapi profil');
    }
    if (customer.dateOfBirth == null || customer.dateOfBirth!.isEmpty) {
      messages.add('Tanggal lahir belum diisi');
    }
    if (customer.gender == null || customer.gender!.isEmpty) {
      messages.add('Gender belum diisi');
    }
    return messages;
  }
}
```

### 3.3 `profile_summary_card_widget.dart`

Card ringkasan identitas customer.

**Props:** `customer: CustomerAccount`

```
┌──────────────────────────────────────────────────┐
│  [Avatar / Initial]   Budi Santoso               │
│                       +62 812 3456 7890           │
│                       ✓ Terverifikasi  (badge)    │
│                       budi@email.com              │
└──────────────────────────────────────────────────┘
```

**Aturan avatar:**
- Jika `customer.avatar != null` → tampilkan `Image.network(customer.avatar!)`
- Jika `customer.avatar == null` → tampilkan initial dari `customer.name` (ambil huruf pertama tiap kata, maksimal 2 huruf) dalam `CircleAvatar` dengan background `colors.primary`

**Aturan email:**
- Jika `customer.email != null` → tampilkan email
- Jika null/kosong → tampilkan label `Email belum ditambahkan` dengan warna `colors.textTertiary`

**Badge verifikasi:**
- Gunakan `AppBadge` jika tersedia, atau `Container` dengan style pill
- `isVerified == true` → badge hijau `Terverifikasi`
- `isVerified == false` → badge kuning/oranye `Belum Terverifikasi`

### 3.4 `profile_wallet_card_widget.dart`

Card saldo deposit dengan CTA.

**Props:** `customer: CustomerAccount`

```
┌──────────────────────────────────────────────────┐
│  Saldo Deposit                                    │
│  Rp 250.000                          💰          │
│                                                   │
│  [Topup]                    [Riwayat]             │
└──────────────────────────────────────────────────┘
```

**Format saldo:**
Gunakan `NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0)` dari package `intl` untuk format Rupiah. Lihat file lain di app untuk memastikan cara format yang konsisten.

**CTA:**
- `Topup` → `context.push('/topup/create')`
- `Riwayat` → `context.push('/topup')`

Gunakan `AppButton` atau `AppCard` sesuai pola desain existing.

### 3.5 `profile_quick_actions_widget.dart`

Grid shortcut ke fitur utama.

**Props:** tidak ada (navigasi langsung)

```
┌──────────┬──────────┬──────────┬──────────┐
│ 📍       │ 📋       │ 🏷️        │ 💳       │
│ Alamat   │ Pesanan  │ Promo     │ Topup    │
└──────────┴──────────┴──────────┴──────────┘
```

4 item dalam `Row` atau `GridView`:
- `Alamat` → `context.push('/customer-addresses')`
- `Pesanan` → `context.push('/orders')`
- `Promo` → `context.push('/promos')`
- `Topup` → `context.push('/topup/create')`

Setiap item adalah `InkWell` + `Column(Icon, Text)` dengan visual yang konsisten.

### 3.6 `profile_recent_activity_widget.dart`

Section aktivitas terbaru yang reuse `HomeDashboardCubit`.

**Props:** tidak ada (baca dari context)

Baca state `HomeDashboardCubit` dari context (sudah tersedia global):

```dart
BlocBuilder<HomeDashboardCubit, HomeDashboardState>(
  builder: (context, state) {
    if (state is HomeDashboardLoading || state is HomeDashboardInitial) {
      return const _RecentActivityLoading();
    }

    if (state is HomeDashboardFailure) {
      return const SizedBox.shrink(); // Tidak tampilkan error, halaman tetap berguna
    }

    if (state is HomeDashboardSuccess) {
      final recentOrders = state.dashboard.recentOrders.take(5).toList();
      if (recentOrders.isEmpty) {
        return const _RecentActivityEmpty();
      }
      return _RecentActivityList(orders: recentOrders);
    }

    return const SizedBox.shrink();
  },
);
```

**Item aktivitas (per `RecentOrder`):**
```
┌─────────────────────────────────────────────────┐
│ 📋  #ORD-001   Outlet WashWallet               →│
│     Lunas     Rp 45.000          12 Jun 2026    │
└─────────────────────────────────────────────────┘
```

- Tap item → `context.push('/orders/${order.id}')`
- `status` dan `paymentStatus` ditampilkan dengan `OrderStatusBadge` dan `PaymentStatusBadge` dari `wash_wallet_ui`
- `totalAmount` diformat Rupiah
- `orderDate` ditampilkan dalam format singkat

**Empty state:**
```
Belum ada aktivitas terbaru
```
Tampilkan teks ringan, tidak perlu ilustrasi besar.

**Loading state:**
Tampilkan `AppLoadingIndicator` kecil atau shimmer ringan.

**Section title:** Tampilkan judul `Aktivitas Terbaru` di atas list.

### 3.7 `profile_menu_section_widget.dart`

Daftar menu akun.

**Props:** tidak ada

**Menu aktif (punya route):**

| Label | Route | Icon |
|-------|-------|------|
| Alamat Saya | `/customer-addresses` | `Icons.location_on_outlined` |
| Riwayat Pesanan | `/orders` | `Icons.receipt_long_outlined` |
| Promo | `/promos` | `Icons.local_offer_outlined` |
| Saldo Deposit | `/topup` | `Icons.account_balance_wallet_outlined` |

**Menu disabled (belum punya route/backend):**

| Label | Icon |
|-------|------|
| Edit Profil | `Icons.edit_outlined` |
| Keamanan Akun | `Icons.lock_outlined` |
| Notifikasi | `Icons.notifications_outlined` |
| Bantuan | `Icons.help_outline` |
| Tentang Aplikasi | `Icons.info_outline` |

**Behavior item disabled:**
- Tampilkan dengan opacity reduced (`Opacity(opacity: 0.5, child: ...)`) atau warna `colors.textDisabled`
- Tap item disabled → tampilkan `AppSnackbar` dengan pesan `Segera hadir` atau tidak melakukan apa pun
- Jangan arahkan ke route apapun

**Struktur tiap item:**
Gunakan `AppListTile` jika tersedia, atau `ListTile` dengan styling manual:
```
[Icon]  Label                              [›]
```

Berikan separator (`AppDivider`) antar item atau gunakan `Divider` tipis.

### 3.8 `profile_logout_button_widget.dart`

Tombol logout dengan confirmation dialog.

**Props:** tidak ada (akses `CustomerAuthCubit` dari context)

```
┌──────────────────────────────────────────────────┐
│              [Keluar / Logout]                    │
└──────────────────────────────────────────────────┘
```

**Confirmation dialog:**
Gunakan `AppDialog` atau `showDialog` dengan `AlertDialog`:
```
Keluar dari Akun?
Kamu akan keluar dari aplikasi.

[Batal]        [Keluar]
```

**Logika:**
```dart
Future<void> _showLogoutDialog(BuildContext context) async {
  final confirmed = await showDialog<bool>(
    context: context,
    builder: (dialogContext) => AlertDialog(
      title: Text('Keluar dari Akun?', style: context.typography.titleMedium),
      content: Text(
        'Kamu akan keluar dari aplikasi.',
        style: context.typography.bodyMedium,
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(dialogContext).pop(false),
          child: const Text('Batal'),
        ),
        TextButton(
          onPressed: () => Navigator.of(dialogContext).pop(true),
          child: const Text('Keluar'),
        ),
      ],
    ),
  );

  if (confirmed == true && context.mounted) {
    context.read<CustomerAuthCubit>().logout();
  }
}
```

**Saat logout loading:**
- Pantau state `CustomerAuthLoading` dari `BlocBuilder<CustomerAuthCubit, CustomerAuthState>`
- Saat loading, tampilkan `AppLoadingIndicator` di tombol atau disable tombol

**Setelah logout:**
- Router menangani redirect ke `/welcome` atau `/login` secara otomatis melalui GoRouter redirect yang sudah ada di `app_router.dart`

---

## Fase 4 — Format Rupiah

Cek cara format Rupiah yang sudah dipakai di app lain sebagai referensi.  
Contoh dari `index_topup_screen.dart` atau `order_card.dart`:

```dart
import 'package:intl/intl.dart';

final formatter = NumberFormat.currency(
  locale: 'id_ID',
  symbol: 'Rp ',
  decimalDigits: 0,
);

// Penggunaan:
formatter.format(customer.depositBalance) // → "Rp 250.000"
```

Jika ada utility formatter yang sudah ada di app, gunakan yang sudah ada daripada membuat baru.

---

## Urutan Implementasi

```
1. profile_account_header_widget.dart     (paling sederhana)
2. profile_status_card_widget.dart        (logika condition + dismiss)
3. profile_summary_card_widget.dart       (avatar fallback + badge)
4. profile_wallet_card_widget.dart        (saldo + format Rupiah + CTA)
5. profile_quick_actions_widget.dart      (grid navigasi)
6. profile_recent_activity_widget.dart    (reuse HomeDashboardCubit)
7. profile_menu_section_widget.dart       (menu aktif + disabled)
8. profile_logout_button_widget.dart      (dialog + auth cubit)
9. profile_screen.dart                    (rakit semua widget, state management)
```

---

## Catatan Khusus: Struktur File

Semua file baru berada di:

```
apps/customer/lib/features/profile/
  └── presentation/
        ├── screens/
        │     └── profile_screen.dart            ← MODIFY (ganti placeholder)
        └── widgets/                             ← BARU (buat folder ini)
              ├── profile_account_header_widget.dart
              ├── profile_status_card_widget.dart
              ├── profile_summary_card_widget.dart
              ├── profile_wallet_card_widget.dart
              ├── profile_quick_actions_widget.dart
              ├── profile_recent_activity_widget.dart
              ├── profile_menu_section_widget.dart
              └── profile_logout_button_widget.dart
```

---

## Catatan Khusus: Import

```dart
// Wajib diimport di semua file presentation
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

// Import cubit auth
import '../../../auth/presentation/bloc/customer_auth_cubit.dart';
import '../../../auth/presentation/bloc/customer_auth_state.dart';

// Import home dashboard (untuk recent activity)
import '../../../home/presentation/bloc/home_dashboard_cubit.dart';
import '../../../home/presentation/bloc/home_dashboard_state.dart';
import '../../../home/domain/entities/home_dashboard.dart'; // untuk RecentOrder
```

---

## Non-Goals (Jangan dikerjakan)

- `ProfileCubit`, `ProfileRepository`, atau endpoint backend baru
- Upload avatar
- Edit profil penuh
- Ubah password
- Banner "Belum membuat password" (tidak ada field `hasPassword` di `CustomerAccount`)
- Riwayat transaksi gabungan lintas order dan topup
- Persistensi dismissal status card lintas app restart (kecuali dipilih secara eksplisit)
- Perubahan pada `MainNavigationScreen` atau bottom navigation
- Perubahan pada auth flow

---

## Acceptance Criteria (Checklist Verifikasi)

- [ ] Tab `Akun` di bottom nav membuka halaman non-placeholder
- [ ] Header menampilkan `Akun Saya`
- [ ] Nama customer dari `customer.name` ditampilkan
- [ ] Nomor HP dari `customer.phone` ditampilkan
- [ ] Badge verifikasi sesuai `customer.isVerified`
- [ ] Saldo dari `customer.depositBalance` ditampilkan format Rupiah
- [ ] Status card muncul jika ada kondisi yang relevan
- [ ] Status card bisa ditutup (dismiss)
- [ ] Status card yang ditutup tidak muncul lagi selama signature sama
- [ ] Shortcut/menu ke `/customer-addresses` berfungsi
- [ ] Shortcut/menu ke `/orders` berfungsi
- [ ] Shortcut/menu ke `/promos` berfungsi
- [ ] Shortcut/menu ke `/topup` dan `/topup/create` berfungsi
- [ ] Recent activity menampilkan 3-5 item jika data ada
- [ ] Recent activity menampilkan empty state ringan jika kosong
- [ ] Halaman tetap berguna jika `HomeDashboardCubit` gagal
- [ ] Menu disabled tidak menyebabkan broken navigation
- [ ] Tombol logout menampilkan confirmation dialog
- [ ] Dialog batal tidak mengubah auth state
- [ ] Dialog keluar memanggil `CustomerAuthCubit.logout()`
- [ ] Setelah logout, router redirect ke unauthenticated flow
- [ ] Tidak ada `ProfileCubit` baru
- [ ] Tidak ada `ProfileRepository` baru
- [ ] Tidak ada backend call baru untuk data profil
