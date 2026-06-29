# Splash Screen, Onboarding & Welcome Screen — Flutter Implementation Plan

## Overview

Menambahkan tiga layar awal sebelum user masuk ke alur autentikasi:

```
App Launch
    ↓
SplashScreen (1.5–2 detik, cek kondisi awal)
    ↓
┌─ First launch? ──── Ya ──→ OnboardingScreen (3 slides) ──→ WelcomeScreen
└─ Bukan first launch? ────────────────────────────────────→ WelcomeScreen
                                                                  │
                                          ┌───────────────────────┤
                                          ↓                       ↓
                                     LoginScreen           OtpScreen (register)
                                   (masuk via OTP)        (daftar via OTP)
                                          │
                                          ↓
                                     (existing auth flow...)
```

> Jika user **sudah login** (token valid), `SplashScreen` langsung redirect ke `/home` tanpa menampilkan onboarding/welcome.

---

## Keputusan Desain

> [!IMPORTANT]
> **Apakah onboarding hanya tampil sekali (first-launch)?**
> Plan ini mengasumsikan: **ya**, onboarding hanya tampil pada install pertama. Disimpan via `SharedPreferences` dengan key `onboarding_completed`. Mohon konfirmasi jika berbeda.

> [!IMPORTANT]
> **Berapa jumlah slide onboarding?**
> Plan ini mengusulkan **3 slide**. Mohon konfirmasi atau sesuaikan konten slide.

> [!NOTE]
> **Apakah WelcomeScreen perlu tombol "Lanjut sebagai Tamu"?**
> Jika ada fitur guest mode di masa depan, tombol ini bisa ditambahkan. Saat ini plan tidak menyertakannya.

---

## Proposed Changes

### 1. Feature: `onboarding` (BARU)

Buat feature folder baru sejajar dengan `auth`, `home`, dll:

```
lib/features/onboarding/
├── presentation/
│   ├── bloc/
│   │   ├── onboarding_cubit.dart
│   │   └── onboarding_state.dart
│   ├── screens/
│   │   ├── splash_screen.dart
│   │   ├── onboarding_screen.dart
│   │   └── welcome_screen.dart
│   └── providers/
│       └── onboarding_provider.dart
```

---

#### [NEW] `onboarding_state.dart`

```dart
abstract class OnboardingState extends Equatable {
  const OnboardingState();

  @override
  List<Object?> get props => [];
}

class OnboardingInitial extends OnboardingState {}

class OnboardingChecking extends OnboardingState {}

/// User sudah pernah onboarding → lompat ke WelcomeScreen
class OnboardingAlreadyCompleted extends OnboardingState {}

/// User baru, harus lihat onboarding
class OnboardingRequired extends OnboardingState {}

/// User menyelesaikan onboarding
class OnboardingCompleted extends OnboardingState {}
```

#### [NEW] `onboarding_cubit.dart`

```dart
class OnboardingCubit extends Cubit<OnboardingState> {
  final SharedPreferences _prefs;
  static const _key = 'onboarding_completed';

  OnboardingCubit(this._prefs) : super(OnboardingInitial());

  /// Dipanggil dari SplashScreen setelah splash duration selesai
  Future<void> checkOnboardingStatus() async {
    emit(OnboardingChecking());
    final completed = _prefs.getBool(_key) ?? false;
    await Future.delayed(const Duration(milliseconds: 100));
    emit(completed ? OnboardingAlreadyCompleted() : OnboardingRequired());
  }

  /// Dipanggil setelah user swipe slide terakhir / tap "Mulai"
  Future<void> completeOnboarding() async {
    await _prefs.setBool(_key, true);
    emit(OnboardingCompleted());
  }
}
```

#### [NEW] `onboarding_provider.dart`

```dart
class OnboardingProvider {
  static Future<OnboardingCubit> create() async {
    final prefs = await SharedPreferences.getInstance();
    return OnboardingCubit(prefs);
  }
}
```

---

### 2. Screens

---

#### [NEW] `splash_screen.dart`

**Tujuan:** Branding awal + cek auth status + cek onboarding status.

```
Scaffold (background: gradient teal600 → teal800)
└── Center
    ├── [Logo/Icon WashWallet]  ← SVG atau Icon besar, warna putih
    ├── SizedBox(height: space.md)
    ├── Text("WashWallet")
    │   style: displayLarge, color: white, fontWeight: bold
    └── Text("Laundry lebih mudah")
        style: bodyMedium, color: white.withOpacity(0.7)
```

**Durasi & Logic:**
- Tampilkan selama `1.5 detik` menggunakan `Future.delayed`
- Selama itu, jalankan **dua operasi paralel**:
  1. `authCubit.checkAuthStatus()` — cek token di secure storage
  2. `onboardingCubit.checkOnboardingStatus()` — cek first launch
- Setelah splash selesai, routing berdasarkan hasil:

```dart
@override
void initState() {
  super.initState();
  _startSplash();
}

Future<void> _startSplash() async {
  // Jalankan paralel
  await Future.wait([
    Future.delayed(const Duration(milliseconds: 1500)),
    _checkConditions(),
  ]);
  // Router redirect akan handle sisanya via GoRouter redirect
}
```

**Catatan:** Router redirect yang menangani navigasi, bukan `SplashScreen` itu sendiri, agar konsisten dengan pola `GoRouter` yang sudah ada.

**Animasi:**
- Logo fade-in: `AnimatedOpacity` dari 0 → 1 dalam 800ms
- Text slide-up: `AnimatedSlide` dari offset(0, 0.3) → offset(0, 0) dalam 600ms

---

#### [NEW] `onboarding_screen.dart`

**Tujuan:** 3 slide perkenalan fitur aplikasi, tampil hanya sekali.

**Struktur slide (3 slide):**

| Slide | Ikon/Ilustrasi | Judul | Deskripsi |
|-------|----------------|-------|-----------|
| 1 | 🧺 (Icons.local_laundry_service) | "Laundry Tanpa Antri" | "Pesan layanan laundry dari mana saja, kapan saja." |
| 2 | 📍 (Icons.location_on) | "Temukan Outlet Terdekat" | "Kami tunjukkan outlet laundry terpercaya di sekitarmu." |
| 3 | ✅ (Icons.check_circle) | "Pantau Pesananmu" | "Lacak status laundry secara real-time hingga selesai." |

**Layout setiap slide:**
```
Scaffold (background: context.colors.background)
└── Column
    ├── [Spacer]
    ├── Container(ilustrasi/ikon besar, 200×200)
    │   warna: context.colors.primarySurface
    │   radius: 24
    ├── SizedBox(h: space.xxl)
    ├── Text(judul) — titleLarge, bold, center
    ├── SizedBox(h: space.sm)
    ├── Text(deskripsi) — bodyMedium, textSecondary, center
    ├── [Spacer]
    └── [Bottom Controls]
        ├── PageIndicator (dots) — warna active: primary
        ├── SizedBox(h: space.xl)
        ├── AppButton.primary (isFullWidth) — "Lanjut" / "Mulai"
        └── TextButton — "Lewati" (hanya slide 1 & 2, hilang di slide 3)
```

**Navigasi slide:**
- Gunakan `PageView` dengan `PageController`
- Tombol "Lanjut" → next slide
- Tombol "Mulai" (slide terakhir) → `onboardingCubit.completeOnboarding()`
- Tombol "Lewati" → langsung `onboardingCubit.completeOnboarding()`
- Swipe horizontal juga bisa digunakan

**Animasi halaman:**
- Gunakan `PageView` bawaan (built-in swipe animation)
- Dots indicator: `AnimatedContainer` untuk smooth width transition active dot

---

#### [NEW] `welcome_screen.dart`

**Tujuan:** Halaman pilihan masuk atau daftar. Entry point ke auth flow.

**Layout:**
```
Scaffold (background: gradient subtle teal50 → white)
└── SafeArea
    └── Padding(horizontal: space.xl)
        ├── [Spacer / top 20%]
        ├── [Logo + Nama App]
        │   ├── Icon/Image — WashWallet
        │   ├── Text("WashWallet") — displayLarge, bold, primary
        │   └── Text("Teman laundry terpercayamu") — bodyMedium, textSecondary
        ├── [Spacer]
        ├── [Ilustrasi hero] — opsional, Icon besar atau gambar
        ├── [Spacer]
        └── [Bottom Actions]
            ├── AppButton.primary(isFullWidth) — "Masuk"
            │   onPressed: context.go('/login')
            ├── SizedBox(h: space.md)
            ├── AppButton.outlined(isFullWidth) — "Daftar"
            │   onPressed: context.go('/register-start')
            └── SizedBox(h: space.lg)
                Text("Dengan mendaftar, kamu menyetujui Syarat & Ketentuan")
                style: labelSmall, textTertiary, center
```

> **Catatan "Daftar":** Tombol ini akan membuka `LoginScreen` dengan flag `intent: register` — artinya user diminta input nomor HP, lalu OTP dikirim dengan intent register. Alternatif: buat route `/register-start` yang langsung ke `LoginScreen` dengan pre-set intent register.

---

### 3. Router — `app_router.dart`

#### Update route list — tambah 3 route baru:

```dart
GoRoute(path: '/splash', builder: (context, state) => const SplashScreen()),
GoRoute(path: '/onboarding', builder: (context, state) => const OnboardingScreen()),
GoRoute(path: '/welcome', builder: (context, state) => const WelcomeScreen()),
```

#### Update `initialLocation`:

```dart
// Sebelumnya:
initialLocation: '/login',

// Sesudah:
initialLocation: '/splash',
```

#### Update `redirect` logic:

```dart
redirect: (context, state) {
  final authState = authCubit.state;
  final onboardingState = onboardingCubit.state;

  final authRoutes = ['/login', '/otp', '/register', '/login-password'];
  final preAuthRoutes = ['/splash', '/onboarding', '/welcome'];
  final isGoingToAuth = authRoutes.contains(state.matchedLocation);
  final isGoingToPreAuth = preAuthRoutes.contains(state.matchedLocation);

  // 1. Selalu izinkan splash
  if (state.matchedLocation == '/splash') return null;

  // 2. Jika auth masih loading/initial → tunggu
  if (authState is CustomerAuthInitial || authState is CustomerAuthLoading) {
    return null;
  }

  // 3. Jika sudah authenticated → langsung home (bypass semua)
  if (authState is CustomerAuthAuthenticated) {
    if (!isGoingToAuth && !isGoingToPreAuth) return null;
    return '/home';
  }

  // 4. Jika onboarding belum selesai → ke onboarding
  if (onboardingState is OnboardingRequired &&
      state.matchedLocation != '/onboarding') {
    return '/onboarding';
  }

  // 5. Setelah onboarding selesai / skip → ke welcome
  if ((onboardingState is OnboardingAlreadyCompleted ||
       onboardingState is OnboardingCompleted) &&
      isGoingToPreAuth &&
      state.matchedLocation != '/welcome') {
    return '/welcome';
  }

  // 6. Pola auth lainnya (existing)
  if (authState is CustomerAuthUnauthenticated && !isGoingToAuth && !isGoingToPreAuth) {
    return '/welcome';
  }
  if (authState is CustomerAuthOtpRequested && state.matchedLocation != '/otp') {
    return '/otp';
  }
  if (authState is CustomerAuthOtpVerifiedNewUser && state.matchedLocation != '/register') {
    return '/register';
  }

  return null;
},
```

#### Update `AppRouter` constructor — inject `OnboardingCubit`:

```dart
class AppRouter {
  final CustomerAuthCubit authCubit;
  final OnboardingCubit onboardingCubit;  // NEW

  AppRouter({
    required this.authCubit,
    required this.onboardingCubit,  // NEW
  });

  // Tambah ke refreshListenable:
  refreshListenable: GoRouterRefreshStream(
    Rx.merge([authCubit.stream, onboardingCubit.stream]), // gunakan rxdart
    // atau buat MultiStream helper manual
  ),
}
```

> [!NOTE]
> Untuk `refreshListenable` dengan 2 stream, bisa gunakan `rxdart` (`Rx.merge`) atau buat helper `MultiGoRouterRefreshStream`.

---

### 4. `main.dart` — Init `OnboardingCubit`

```dart
// Tambah di _initializeDependencies():
final onboardingCubit = await OnboardingProvider.create();
final appRouter = AppRouter(
  authCubit: authCubit,
  onboardingCubit: onboardingCubit,  // NEW
);

// Tambah di AppDependencies:
final OnboardingCubit onboardingCubit;

// Tambah di MultiBlocProvider:
BlocProvider<OnboardingCubit>.value(value: dependencies.onboardingCubit),
```

---

## Flow Diagram Lengkap

```
App Launch
    │
    ▼
/splash ──── (1.5 detik paralel: checkAuth + checkOnboarding)
    │
    ├─ token valid ──────────────────────────────────────► /home
    │
    ├─ first launch (OnboardingRequired) ───────────────► /onboarding
    │       └── slide 1 → slide 2 → slide 3 → "Mulai"
    │               └── completeOnboarding() ───────────► /welcome
    │
    └─ bukan first launch (OnboardingAlreadyCompleted) ─► /welcome
            │
            ├── [Masuk] ──────────────────────────────► /login
            │       └── (existing auth flow)
            │
            └── [Daftar] ─────────────────────────────► /login (intent: register)
                    └── OTP → /register → /home
```

---

## Panduan Shared UI

Semua screen menggunakan token dari `wash_wallet_ui`:

| Elemen | Token |
|--------|-------|
| Warna latar splash | `AppColors.teal600` → `AppColors.teal800` (gradient) |
| Warna teks splash | `Colors.white` + `Colors.white.withOpacity(0.7)` |
| Latar welcome | `context.colors.background` / soft gradient |
| Tombol utama | `AppButton.primary(isFullWidth: true)` |
| Tombol sekunder | `AppButton.outlined(isFullWidth: true)` |
| Teks link | `TextButton` dengan `context.colors.primary` |
| Spacing | `context.space.xs/sm/md/lg/xl/xxl` |
| Typography | `context.typography.displayLarge/.titleLarge/.bodyMedium/.labelSmall` |
| Warna primary | `context.colors.primary` (teal600) |
| Warna surface | `context.colors.primarySurface` (teal50, untuk bg ilustrasi) |

---

## Urutan Pengerjaan

```
1.  Buat OnboardingState (abstract + subclasses)
2.  Buat OnboardingCubit (checkOnboardingStatus + completeOnboarding)
3.  Buat OnboardingProvider (SharedPreferences init)
4.  Update main.dart (init OnboardingCubit + inject ke AppRouter + BlocProvider)
5.  Update AppRouter (inject OnboardingCubit, initialLocation: /splash, tambah routes, update redirect)
6.  Buat SplashScreen (gradient bg, animasi fade+slide, trigger checkAuthStatus + checkOnboardingStatus)
7.  Buat OnboardingScreen (PageView 3 slide, dots indicator, tombol Lanjut/Lewati/Mulai)
8.  Buat WelcomeScreen (logo, 2 tombol: Masuk & Daftar)
```

---

## Verification Plan

### Manual — First Launch (install baru)
1. Buka app → `SplashScreen` (~1.5 detik)
2. → `OnboardingScreen` slide 1 → swipe/tap Lanjut → slide 2 → slide 3 → "Mulai"
3. → `WelcomeScreen` [Masuk] → `LoginScreen`

### Manual — Bukan First Launch (sudah onboarding)
1. Buka app → `SplashScreen`
2. → Langsung `WelcomeScreen` (skip onboarding)
3. [Daftar] → `LoginScreen` (intent: register) → OTP → `RegisterScreen` → `HomeScreen`

### Manual — Already Logged In
1. Buka app → `SplashScreen`
2. → Langsung `HomeScreen` (bypass onboarding & welcome)

### Manual — Tombol Lewati
1. `OnboardingScreen` slide 1 → tap "Lewati"
2. → `WelcomeScreen` (onboarding ditandai completed)
3. Buka ulang app → langsung `WelcomeScreen` (tidak muncul onboarding lagi)
