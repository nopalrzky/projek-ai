# Issue: APK release terlalu besar untuk distribusi langsung

## Scope Review

Dokumen ini adalah handoff untuk penyusunan implementation plan berikutnya. Tidak ada perubahan kode yang dilakukan di tahap review ini.

Target distribusi yang diasumsikan adalah APK langsung/manual, bukan Play Store AAB. Karena itu ukuran file `app-release.apk` yang diterima user menjadi metrik utama.

## Kondisi Saat Ini

Artifact release yang ditemukan:

```text
build/app/outputs/flutter-apk/app-release.apk
size: 64,747,552 bytes / 61.75 MB
```

Ukuran tersebut berasal dari universal APK yang membawa native library untuk beberapa ABI sekaligus.

Breakdown native library di dalam APK:

```text
lib/arm64-v8a    19.66 MB
lib/armeabi-v7a  17.67 MB
lib/x86_64       21.07 MB
```

## Root Cause Utama

Release APK saat ini adalah single universal APK tanpa ABI filtering atau split per ABI. Untuk direct APK distribution ke device Android fisik, bundling `x86_64` biasanya tidak diperlukan karena ABI tersebut terutama dipakai emulator atau perangkat x86 tertentu.

Dengan menghapus `x86_64` dari release direct-distribution APK, ukuran APK diperkirakan turun dari `61.75 MB` ke kisaran `40 MB-an`, sebelum cleanup lain.

## Bukti Kode dan Artifact

### 1. APK release universal berisi 3 ABI

Isi `build/app/outputs/flutter-apk/app-release.apk` menunjukkan folder native library:

```text
lib/arm64-v8a
lib/armeabi-v7a
lib/x86_64
```

Total native library per ABI:

```text
arm64-v8a    19.66 MB
armeabi-v7a  17.67 MB
x86_64       21.07 MB
```

### 2. Gradle belum mengatur ABI filtering release

`android/app/build.gradle.kts` memakai konfigurasi Flutter/Android default pada `defaultConfig` dan `buildTypes.release`. Tidak terlihat konfigurasi seperti:

```kotlin
ndk {
    abiFilters += listOf("arm64-v8a", "armeabi-v7a")
}
```

atau konfigurasi split per ABI untuk release APK.

### 3. Firebase Analytics ditambahkan di Android native dependencies

`android/app/build.gradle.kts`:

```kotlin
implementation("com.google.firebase:firebase-analytics")
```

Namun pencarian di Dart code tidak menemukan pemakaian `firebase_analytics`. Dependency ini perlu diaudit. Jangan hapus hanya berdasarkan dokumen ini, karena bisa saja dipakai secara native, akan dipakai nanti, atau dibutuhkan oleh kebijakan analytics project.

### 4. Asset Windows BLE ikut terbawa ke Android assets

APK berisi file:

```text
assets/flutter_assets/packages/win_ble/assets/BLEServer.exe
size: 527,872 bytes
```

Ini kemungkinan berasal dari dependency transitif atau package yang membawa asset Windows. Ukurannya bukan penyebab utama dibanding native ABI, tetapi tetap layak diaudit karena file `.exe` tidak berguna untuk runtime Android.

### 5. Beberapa dependency langsung perlu diaudit

`pubspec.yaml` memiliki sejumlah direct dependencies. Sebagian terlihat tidak jelas pemakaiannya dari pencarian cepat di `lib` dan `test`, tetapi perlu audit dependency yang rapi sebelum dihapus.

Contoh kategori yang perlu dicek:

- Dependency UI/helper yang mungkin sudah tidak di-import langsung.
- Dependency yang hanya dipakai transitif oleh package internal.
- Dependency yang mungkin dipakai via generated code, platform side, atau build tooling.

Catatan penting: jangan melakukan cleanup dependency secara buta. Prioritaskan ABI filtering karena dampaknya paling besar dan paling jelas.

## Rekomendasi Arah Implementasi

Prioritas utama:

1. Buat release APK direct-distribution tanpa `x86_64`.
2. Putuskan apakah tetap membuat universal APK untuk kebutuhan emulator/internal QA atau hanya release physical-device APK.
3. Pertimbangkan split per ABI jika tim ingin menyediakan APK lebih kecil per arsitektur.

Cleanup lanjutan:

1. Audit kebutuhan `firebase-analytics` di `android/app/build.gradle.kts`.
2. Telusuri kenapa `packages/win_ble/assets/BLEServer.exe` terbundle dalam Android assets dan apakah bisa dikecualikan dengan aman.
3. Audit direct dependencies di `pubspec.yaml` berdasarkan import aktual, generated code, platform integration, dan package internal.

## Acceptance Criteria

Implementation plan berikutnya sebaiknya memastikan:

- Release APK untuk direct distribution tidak lagi membawa `lib/x86_64`.
- Ukuran APK release turun signifikan dari baseline `61.75 MB`.
- Jika `arm64-v8a` dan `armeabi-v7a` tetap dibundle dalam satu APK, ukuran akhir realistis berada di kisaran `40 MB-an`.
- Jika split per ABI dipilih, ukuran masing-masing APK dicatat dan strategi distribusinya dijelaskan.
- App tetap bisa diinstall dan dijalankan di perangkat Android fisik target.
- Emulator/development workflow tetap punya cara build yang jelas jika `x86_64` dikeluarkan dari release APK.

## Verification Plan

Verifikasi minimum:

1. Catat ulang ukuran current universal APK dari `build/app/outputs/flutter-apk/app-release.apk`.
2. Build release APK tanpa `x86_64`.
3. Inspect isi APK dan pastikan `lib/x86_64` tidak ada.
4. Catat ukuran APK baru.
5. Install dan jalankan APK pada real Android device.

Verifikasi opsional:

1. Build split-per-ABI APK.
2. Catat ukuran `arm64-v8a` dan `armeabi-v7a` APK.
3. Pastikan masing-masing APK bisa diinstall pada device ABI yang sesuai.

## Catatan Test Review

Tidak ada automated test valid yang diperoleh dalam review ini. Catatan dari sesi review: command berikut sempat dijalankan tetapi timeout, sehingga hasilnya tidak bisa dipakai sebagai bukti regresi atau keberhasilan:

```text
flutter test test/features/auth/presentation/bloc/auth_cubit_test.dart test/core/router/app_router_test.dart
flutter test test/features/auth/presentation/bloc/auth_cubit_test.dart
```
