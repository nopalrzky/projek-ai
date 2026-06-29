# Revisi Setting Screen, Setup PIN dengan Confirmation Terpisah, dan Re-auth PIN Stale Session

## Latar Belakang & Alur

Fitur ini mencakup tiga area utama:

1. **Setting Screen** — Menambahkan item menu keamanan PIN yang jelas.
2. **Setup PIN + Confirmation** — Memisahkan alur setup PIN menjadi dua layar: input PIN pertama, lalu confirmation PIN di layar terpisah sebelum disimpan.
3. **Re-auth PIN (Stale Session)** — Meminta kasir memasukkan PIN kembali setelah tidak ada aktivitas selama 4 jam, menggunakan state `AuthenticatedStale` yang sudah ada.

Seluruh layar PIN (setup, confirmation, re-auth) didesain ulang dengan tampilan berbasis kotak-kotak (box input), ilustrasi laundry WashWallet di bagian atas, dan pesan validasi yang jelas. Tidak ada perubahan pada layer domain (usecase/repository) karena API `setupPin` dan `verifyPin` sudah ada.

---

### Alur Setup PIN Baru (Dipisah Dua Layar)

```
Login/CheckAuth → hasPin == false
        │
        ▼
[SetupPinScreen]          ← Layar 1: Input PIN 6 digit pertama
  - Ilustrasi laundry
  - 6 box input PIN
  - Validasi: kosong / belum 6 digit
  - Tombol "Lanjutkan"
        │
        ▼
[ConfirmPinScreen]        ← Layar 2 (push): Input PIN confirmation
  - Ilustrasi laundry (berbeda)
  - 6 box input PIN
  - Validasi: kosong / belum 6 digit / tidak cocok
  - Tombol "Simpan PIN"
        │
        ├── PIN cocok → cubit.setupPin(pin, confirmation) → Authenticated
        └── PIN tidak cocok → pesan error, user tetap di ConfirmPinScreen
```

### Alur Re-auth PIN (Stale Session)

```
App resume / tidak aktif > 4 jam
        │
        ▼
AuthCubit mendeteksi stale → emit AuthenticatedStale
        │
        ▼
Router redirect ke /re-auth-pin (layar re-auth)
        │
[ReAuthPinScreen]         ← Layar re-auth
  - Ilustrasi laundry
  - Nama kasir yang sedang aktif
  - 6 box input PIN
  - Validasi: kosong / belum 6 digit / PIN salah
  - Tombol "Verifikasi"
        │
        ├── PIN benar → cubit.verifyPin() → Authenticated → kembali ke sebelumnya
        └── PIN salah → pesan error, input dibersihkan, user coba lagi
```

---

## Keputusan Desain

| Area | Keputusan | Catatan |
|---|---|---|
| Alur setup PIN | **Dua layar terpisah** (SetupPin → ConfirmPin) | Sesuai user need: user dikonfirmasi sebelum disimpan |
| Setup PIN - navigation | `SetupPinScreen` push ke `ConfirmPinScreen` | PIN awal diteruskan sebagai constructor param |
| ConfirmPin backend call | `cubit.setupPin(pin, pinConfirmation)` di `ConfirmPinScreen` | Domain usecase sudah menerima dua param |
| Stale detection | `AuthCubit` lacak `lastActivityAt` via `AppLifecycleObserver` di `main.dart` | Reset timer setiap ada aktivitas app (resume) |
| Re-auth route | Route `/re-auth-pin` baru, redirect dari router saat state `AuthenticatedStale` | Setelah sukses, router redirect ke `/home` |
| Input PIN UI | **6 box terpisah** (seperti OTP tapi konteks kasir) | Pakai `PinBoxWidget` yang dapat dipakai ulang |
| Ilustrasi layar | **`Image.asset`** atau SVG dari asset laundry WashWallet | Gunakan ilustrasi mesin cuci / pakaian sesuai konteks |
| Setting - keamanan PIN | Tambah item menu baru di `IndexSettingScreen` | Navigate ke halaman info PIN (belum ada sub-setting PIN) |
| Design system | Gunakan `context.colors`, `context.typography`, `context.space`, `context.radius` | Konsisten dengan layar lain |

---

## Proposed Changes

### Layer 0 — Shared Widget

#### [NEW] [pin_box_input.dart](file:///C:/Bimo/Project/wash_wallet/apps/cashier/lib/features/auth/presentation/widgets/pin_box_input.dart)

Widget reusable untuk input PIN berbasis kotak-kotak, dipakai oleh semua layar PIN.

```dart
// Signature
class PinBoxInput extends StatelessWidget {
  final int length;           // default: 6
  final String currentValue;  // nilai pin saat ini (string digit)
  final bool obscure;         // true untuk menyembunyikan angka
  final String? errorText;    // pesan error, null = tidak ada error
  // ...
}
```

Desain tiap box:
- `Container` dengan `border` dan `borderRadius` dari design system
- Jika terisi: tampil `●` (jika obscure) atau angka
- Jika box aktif (index == currentValue.length): border berwarna primary
- Jika error: border merah + `errorText` di bawah row box
- Tidak mengekspos `TextEditingController`; parent menyediakan `currentValue` dan update via callback

---

#### [NEW] [pin_numpad_widget.dart](file:///C:/Bimo/Project/wash_wallet/apps/cashier/lib/features/auth/presentation/widgets/pin_numpad_widget.dart)

Numpad 3×4 (angka 1–9, tombol hapus, 0, submit opsional) sebagai alternatif keyboard sistem.

> [!NOTE]
> Penggunaan numpad custom vs keyboard sistem dapat disesuaikan. Jika tim memilih keyboard sistem, file ini bisa diskip.

---

### Layer 1 — Presentation: Auth Screens

#### [MODIFY] [setup_pin_screen.dart](file:///C:/Bimo/Project/wash_wallet/apps/cashier/lib/features/auth/presentation/screens/setup_pin_screen.dart)

Revisi total layar setup PIN:

- **Hapus** dua `TextField` lama (PIN + konfirmasi dalam satu layar).
- **Tambah** ilustrasi laundry di bagian atas (misalnya mesin cuci atau hanger).
- **Tambah** judul dan deskripsi singkat: *"Buat PIN Kasir Anda"* dan *"Masukkan 6 digit PIN untuk mengamankan akun."*
- **Pakai** `PinBoxInput` untuk input 6 digit PIN pertama.
- **Tambah** validasi lokal: PIN kosong → error, PIN belum 6 digit → error.
- **Tombol "Lanjutkan"** — jika validasi lokal OK, push ke `ConfirmPinScreen` dengan meneruskan PIN sebagai parameter.
- **Tidak** melakukan API call di layar ini.

```dart
// Navigasi ke confirmation
context.push('/confirm-pin', extra: {'initialPin': _pin});
```

---

#### [NEW] [confirm_pin_screen.dart](file:///C:/Bimo/Project/wash_wallet/apps/cashier/lib/features/auth/presentation/screens/confirm_pin_screen.dart)

Layar baru untuk konfirmasi PIN sebelum disimpan ke backend:

- Menerima `initialPin` (String) sebagai parameter dari `SetupPinScreen`.
- Ilustrasi laundry (berbeda dari setup, misalnya ikon kunci + gelembung).
- Judul: *"Konfirmasi PIN Anda"* dan deskripsi: *"Masukkan kembali PIN yang sudah dibuat."*
- `PinBoxInput` untuk input 6 digit confirmation.
- `BlocListener<AuthCubit, AuthState>`:
  - `AuthLoading` → tampilkan loading.
  - `AuthFailureState` → tampilkan `errorText` dari `failure.message`, bersihkan input.
  - `Authenticated` → router otomatis redirect (tidak perlu navigate manual).
- **Validasi lokal**:
  - Confirmation kosong → error `"Konfirmasi PIN tidak boleh kosong."`
  - Confirmation belum 6 digit → error `"PIN harus 6 digit."`
  - Confirmation tidak sama dengan `initialPin` → error `"PIN tidak cocok. Coba lagi."`
- **Tombol "Simpan PIN"** — panggil `cubit.setupPin(pin: initialPin, pinConfirmation: _confirmPin)`.

---

#### [NEW] [re_auth_pin_screen.dart](file:///C:/Bimo/Project/wash_wallet/apps/cashier/lib/features/auth/presentation/screens/re_auth_pin_screen.dart)

Layar re-auth untuk sesi stale (tidak aktif > 4 jam):

- Membaca nama kasir dari state `AuthenticatedStale` via `context.read<AuthCubit>().state`.
- Ilustrasi laundry (misalnya jam + mesin cuci atau struk + kasir).
- Judul: *"Sesi Tidak Aktif"* dan deskripsi: *"Masukkan PIN Anda untuk melanjutkan sebagai [nama kasir]."*
- `PinBoxInput` untuk input 6 digit PIN.
- `BlocListener<AuthCubit, AuthState>`:
  - `AuthLoading` → tampilkan loading.
  - `AuthFailureState` → tampilkan error, bersihkan input. *(Tidak redirect ke login).*
  - `Authenticated` → router otomatis redirect ke `/home`.
- **Validasi lokal**: PIN kosong / belum 6 digit → error inline.
- **Tombol "Verifikasi"** → panggil `cubit.verifyPin(pin: _pin)` (tanpa `employeeId`/`username` karena kasir sudah diketahui dari state).
- **Tidak ada tombol logout** di layar ini (sesuai user need: alur re-auth tetap ringan).

---

#### [MODIFY] [pin_entry_screen.dart](file:///C:/Bimo/Project/wash_wallet/apps/cashier/lib/features/auth/presentation/screens/pin_entry_screen.dart)

Revisi tampilan untuk alur ganti kasir (switch employee):

- Ganti `TextField` biasa dengan `PinBoxInput`.
- Tambah ilustrasi ringan di atas.
- Judul: *"Masukkan PIN"* dan sub-judul: *"Login sebagai: [nama kasir]"*.
- Pertahankan logika existing (`cubit.switchEmployee()`).
- Validasi lokal: PIN kosong / belum 6 digit → error.

---

### Layer 2 — State & Cubit

#### [MODIFY] [auth_state.dart](file:///C:/Bimo/Project/wash_wallet/apps/cashier/lib/features/auth/presentation/bloc/auth_state.dart)

Tidak ada perubahan pada state yang ada. State `AuthenticatedStale` sudah tersedia dan cukup untuk re-auth flow.

> [!NOTE]
> Tidak perlu menambahkan state baru. `AuthenticatedStale` sudah ada di baris 89–94.

---

#### [MODIFY] [auth_cubit.dart](file:///C:/Bimo/Project/wash_wallet/apps/cashier/lib/features/auth/presentation/bloc/auth_cubit.dart)

Tambahkan mekanisme deteksi sesi stale:

```dart
// Field baru
DateTime? _lastActivityAt;
static const _staleThreshold = Duration(hours: 4);

// Method baru: dipanggil setiap kali app di-resume
void recordActivity() {
  _lastActivityAt = DateTime.now();
}

// Method baru: dipanggil saat app di-resume dari background
void checkIfStale() {
  final currentState = state;
  if (currentState is! Authenticated) return;
  if (_lastActivityAt == null) return;

  final elapsed = DateTime.now().difference(_lastActivityAt!);
  if (elapsed >= _staleThreshold) {
    emit(AuthenticatedStale(currentState.employee));
  }
}
```

> [!IMPORTANT]
> Method `recordActivity()` dan `checkIfStale()` perlu dipanggil dari `AppLifecycleObserver` yang didaftarkan di `main.dart` atau dari `WidgetsBindingObserver` di widget root.

---

### Layer 3 — App Lifecycle Observer

#### [NEW] [app_lifecycle_observer.dart](file:///C:/Bimo/Project/wash_wallet/apps/cashier/lib/core/services/app_lifecycle_observer.dart)

Kelas `WidgetsBindingObserver` yang dipasang di `MainApp` untuk memantau lifecycle aplikasi:

```dart
class AppLifecycleObserver extends WidgetsBindingObserver {
  final AuthCubit authCubit;

  AppLifecycleObserver({required this.authCubit});

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      authCubit.checkIfStale();
    } else if (state == AppLifecycleState.paused) {
      authCubit.recordActivity();
    }
  }
}
```

Didaftarkan di `MainApp._initLifecycle()` dengan `WidgetsBinding.instance.addObserver(observer)`.

---

#### [MODIFY] [main.dart](file:///C:/Bimo/Project/wash_wallet/apps/cashier/lib/main.dart)

Tambahkan registrasi `AppLifecycleObserver` di `MainApp` (StatefulWidget):

- Ubah `MainApp` dari `StatelessWidget` menjadi `StatefulWidget`.
- Di `initState`: buat dan register `AppLifecycleObserver`.
- Di `dispose`: unregister observer.

```dart
// Contoh penambahan
class _MainAppState extends State<MainApp> with WidgetsBindingObserver {
  late final AppLifecycleObserver _lifecycleObserver;

  @override
  void initState() {
    super.initState();
    _lifecycleObserver = AppLifecycleObserver(
      authCubit: widget.dependencies.authCubit,
    );
    WidgetsBinding.instance.addObserver(_lifecycleObserver);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(_lifecycleObserver);
    super.dispose();
  }
}
```

---

### Layer 4 — Router

#### [MODIFY] [app_router.dart](file:///C:/Bimo/Project/wash_wallet/apps/cashier/lib/core/router/app_router.dart)

Perubahan pada redirect logic dan routes:

**Redirect logic** — Tambahkan guard untuk `AuthenticatedStale`:

```dart
if (authState is AuthenticatedStale) {
  if (currentLocation != '/re-auth-pin') return '/re-auth-pin';
  return null;
}
```

Pastikan `AuthenticatedStale` tidak di-redirect ke `/home` (hapus dari kondisi `Authenticated || AuthenticatedStale` di baris 76 saat ini).

**Routes baru**:

```dart
GoRoute(
  path: '/confirm-pin',
  pageBuilder: (context, state) {
    final extra = state.extra as Map<String, dynamic>? ?? {};
    return state.fadePage(ConfirmPinScreen(
      initialPin: extra['initialPin'] as String? ?? '',
    ));
  },
),
GoRoute(
  path: '/re-auth-pin',
  pageBuilder: (context, state) => state.fadePage(const ReAuthPinScreen()),
),
```

**Guard setup-pin** — Pastikan `/confirm-pin` hanya bisa diakses dari `/setup-pin`:

> [!NOTE]
> Tidak perlu guard ketat di router untuk `/confirm-pin`; `SetupPinScreen` hanya push ke sana jika PIN awal valid.

---

### Layer 5 — Setting Screen

#### [MODIFY] [index_setting_screen.dart](file:///C:/Bimo/Project/wash_wallet/apps/cashier/lib/features/setting/presentation/screens/index_setting_screen.dart)

Tambahkan item menu baru untuk keamanan PIN:

```dart
_buildSettingItem(
  context,
  icon: Icons.lock_outline,
  title: 'Keamanan PIN',
  subtitle: 'PIN digunakan untuk login cepat dan verifikasi ulang sesi kasir',
  onTap: () => context.push('/settings/pin-security'),
),
```

> [!NOTE]
> Route `/settings/pin-security` menampilkan halaman informasi sederhana (lihat di bawah). Tidak ada fungsionalitas ubah PIN dalam iterasi ini, sesuai scope user need.

---

#### [NEW] [pin_security_setting_screen.dart](file:///C:/Bimo/Project/wash_wallet/apps/cashier/lib/features/setting/presentation/screens/pin_security_setting_screen.dart)

Layar informasi keamanan PIN di Settings:

- Menampilkan status PIN kasir (sudah diset atau belum).
- Deskripsi singkat: *"PIN Anda digunakan untuk login cepat antar kasir dan verifikasi ulang sesi setelah aplikasi tidak aktif selama 4 jam."*
- Jika kasir belum punya PIN: tampilkan `ElevatedButton` *"Buat PIN Sekarang"* → push ke `/setup-pin`.
- Jika kasir sudah punya PIN: tampilkan status aktif dengan ikon hijau.
- Membaca `employee.hasPin` dari `context.read<AuthCubit>().state`.

---

#### [MODIFY] [app_router.dart](file:///C:/Bimo/Project/wash_wallet/apps/cashier/lib/core/router/app_router.dart) *(untuk setting route)*

Tambahkan sub-route `/settings/pin-security`:

```dart
GoRoute(
  path: 'pin-security',
  pageBuilder: (context, state) =>
      state.slidePage(const PinSecuritySettingScreen()),
),
```

---

## Ringkasan File yang Diubah

### File Baru

| File | Keterangan |
|---|---|
| `lib/features/auth/presentation/widgets/pin_box_input.dart` | Widget reusable input PIN kotak-kotak |
| `lib/features/auth/presentation/widgets/pin_numpad_widget.dart` | Numpad custom (opsional) |
| `lib/features/auth/presentation/screens/confirm_pin_screen.dart` | Layar konfirmasi PIN (sebelum simpan) |
| `lib/features/auth/presentation/screens/re_auth_pin_screen.dart` | Layar re-auth PIN saat sesi stale |
| `lib/features/setting/presentation/screens/pin_security_setting_screen.dart` | Layar info keamanan PIN di Settings |
| `lib/core/services/app_lifecycle_observer.dart` | Observer lifecycle untuk deteksi stale |

### File Dimodifikasi

| File | Perubahan |
|---|---|
| `lib/features/auth/presentation/screens/setup_pin_screen.dart` | Revisi total: hapus confirmation field, pakai `PinBoxInput`, tambah ilustrasi, tombol "Lanjutkan" push ke ConfirmPin |
| `lib/features/auth/presentation/screens/pin_entry_screen.dart` | Revisi tampilan: ganti `TextField` dengan `PinBoxInput`, tambah ilustrasi |
| `lib/features/auth/presentation/bloc/auth_cubit.dart` | Tambah `recordActivity()`, `checkIfStale()`, field `_lastActivityAt` |
| `lib/features/setting/presentation/screens/index_setting_screen.dart` | Tambah item menu "Keamanan PIN" |
| `lib/core/router/app_router.dart` | Tambah routes `/confirm-pin`, `/re-auth-pin`, `/settings/pin-security`; revisi redirect guard untuk `AuthenticatedStale` |
| `lib/main.dart` | Ubah `MainApp` ke `StatefulWidget`, register `AppLifecycleObserver` |

---

## Urutan Pengerjaan yang Disarankan

1. **Buat `PinBoxInput` widget** — dasar untuk semua layar PIN.
2. **Revisi `SetupPinScreen`** — pakai `PinBoxInput`, hilangkan confirmation field lama, tambah tombol "Lanjutkan".
3. **Buat `ConfirmPinScreen`** — terima `initialPin`, validasi, panggil `cubit.setupPin`.
4. **Tambah routes** `/confirm-pin` di `AppRouter`.
5. **Tambah `recordActivity()` + `checkIfStale()`** di `AuthCubit`.
6. **Buat `AppLifecycleObserver`** dan register di `MainApp`.
7. **Buat `ReAuthPinScreen`** — gunakan `PinBoxInput`, panggil `cubit.verifyPin`.
8. **Tambah route + guard** `/re-auth-pin` dan revisi guard `AuthenticatedStale` di `AppRouter`.
9. **Update `IndexSettingScreen`** — tambah item "Keamanan PIN".
10. **Buat `PinSecuritySettingScreen`** dan daftarkan sub-route-nya.
11. **Revisi `PinEntryScreen`** — pakai `PinBoxInput` untuk switch employee.

---

## Verification Plan

### Automated
- Pastikan `flutter analyze` bersih setelah semua perubahan.
- Pastikan tidak ada `missing_required_param` atau `undefined_identifier`.

### Manual (Device/Emulator)

**Setup PIN + Confirmation:**
1. Login dengan akun yang belum punya PIN → diarahkan ke `SetupPinScreen`.
2. Ketik PIN kurang dari 6 digit → tombol "Lanjutkan" menampilkan error / disabled.
3. Ketik PIN 6 digit valid → tap "Lanjutkan" → masuk ke `ConfirmPinScreen`.
4. Ketik confirmation yang berbeda → tampil pesan error *"PIN tidak cocok"*, input bersih.
5. Ketik confirmation yang sama → tap "Simpan PIN" → masuk ke aplikasi (`/home`).

**Re-auth PIN Stale:**
1. Login dan masuk ke `/home`.
2. Simulasikan stale: set threshold sementara ke 1 menit untuk testing, background app, tunggu, foreground kembali.
3. Layar `ReAuthPinScreen` muncul.
4. Masukkan PIN salah → tampil error, input bersih, tetap di layar re-auth.
5. Masukkan PIN benar → kembali ke `/home` tanpa login ulang.
6. Kembali sebelum threshold → tidak muncul layar re-auth.

**Setting Screen:**
1. Buka tab Settings → item "Keamanan PIN" muncul di bawah item "Profil".
2. Tap "Keamanan PIN" → masuk ke `PinSecuritySettingScreen`.
3. Jika PIN sudah ada: status aktif tampil.
4. Jika PIN belum ada: tombol "Buat PIN Sekarang" muncul dan mengarahkan ke `SetupPinScreen`.

**Validasi Error:**
- PIN kosong → error jelas.
- PIN belum 6 digit → error jelas.
- PIN confirmation tidak cocok → error jelas + input bersih.
- PIN re-auth salah → error jelas + input bersih (tanpa redirect logout).
