# Plan: Persiapan Rilis 3 Aplikasi WashWallet ke Google Play Store

## Ringkasan Kondisi Saat Ini (Hasil Scanning)

Berdasarkan hasil inspeksi langsung terhadap codebase, berikut adalah kondisi aktual setiap app:

### Customer App (`apps/customer`)
| Item | Kondisi Saat Ini | Target |
|------|-----------------|--------|
| `applicationId` | `com.washwallet.customer` ✅ | `com.washwallet.customer` |
| `namespace` | `com.washwallet.customer` ✅ | `com.washwallet.customer` |
| `MainActivity.kt` package | `com.washwallet.customer` ✅ | `com.washwallet.customer` |
| File path MainActivity | `com/example/wash_wallet_customer/` ⚠️ | Nama folder saja, tidak mempengaruhi runtime |
| `google-services.json` | Ada, package_name = `com.washwallet.customer` ✅ | Valid |
| Release signing | Debug signing ❌ | Release signing |
| `android:label` | `wash_wallet_customer` ❌ | `WashWallet Customer` |
| `INTERNET` permission | Tidak ada ❌ | Harus ditambahkan |
| `usesCleartextTraffic` | `true` ❌ | Harus dihapus untuk release |
| `POST_NOTIFICATIONS` | Tidak ada ❌ | Harus ditambahkan (Firebase Messaging) |
| Google Maps API key | Exposed langsung di Manifest ⚠️ | Pertimbangkan pindah ke secrets |
| `strings.xml` | Tidak ada (hanya `styles.xml`) ⚠️ | Buat untuk label app |
| App title di `main.dart` | `WashWallet Customer` ✅ | Valid |
| API base URL default | `http://10.0.2.2:8000/api` ❌ | Baca dari `--dart-define` |

### Cashier App (`apps/cashier`)
| Item | Kondisi Saat Ini | Target |
|------|-----------------|--------|
| `applicationId` | `com.example.app_new` ❌ | `com.washwallet.cashier` |
| `namespace` | `com.example.app_new` ❌ | `com.washwallet.cashier` |
| `MainActivity.kt` package | `com.example.app_new` ❌ | `com.washwallet.cashier` |
| File path MainActivity | `com/example/app_new/` ❌ | Harus dipindah ke `com/washwallet/cashier/` |
| `google-services.json` | Ada, package_name = `com.example.app_new` ❌ | Update ke `com.washwallet.cashier` |
| Release signing | Debug signing ❌ | Release signing |
| `android:label` | `Wash Wallet` ❌ | `WashWallet Cashier` |
| `INTERNET` permission | Ada ✅ | Valid |
| `POST_NOTIFICATIONS` | Ada ✅ | Valid |
| Java version | 11 ⚠️ | Upgrade ke 17 (konsistensi) |
| `strings.xml` | Tidak ada ⚠️ | Buat untuk label app |
| Firebase plugin di `settings.gradle.kts` | Ada ✅ | Valid |
| App title di `main.dart` | `WashWallet POS` ⚠️ | Ubah ke `WashWallet Cashier` |
| API base URL default | `http://10.0.2.2:8000/api` ❌ | Baca dari `--dart-define` |

### Production App (`apps/production`)
| Item | Kondisi Saat Ini | Target |
|------|-----------------|--------|
| `applicationId` | `com.example.wash_wallet_production` ❌ | `com.washwallet.production` |
| `namespace` | `com.example.wash_wallet_production` ❌ | `com.washwallet.production` |
| `MainActivity.kt` package | `com.example.wash_wallet_production` ❌ | `com.washwallet.production` |
| File path MainActivity | `com/example/wash_wallet_produksi/` ❌ | Harus dipindah ke `com/washwallet/production/` |
| `google-services.json` | Tidak ada ❌ | Harus disediakan developer |
| Google Services Gradle plugin | Tidak ada ❌ | Harus ditambahkan |
| Release signing | Debug signing ❌ | Release signing |
| `android:label` | `wash_wallet_production` ❌ | `WashWallet Production` |
| `INTERNET` permission | Ada ✅ | Valid |
| `POST_NOTIFICATIONS` | Tidak ada ❌ | Harus ditambahkan (Firebase Messaging digunakan) |
| `strings.xml` | Tidak ada ⚠️ | Buat untuk label app |
| App title di `main.dart` | `WashWallet Produksi` ⚠️ | Ubah ke `WashWallet Production` |
| API base URL default | `http://10.0.2.2:8000/api` ❌ | Baca dari `--dart-define` |

### Backend (`webapp/wash_wallet_be`)
| Item | Kondisi Saat Ini | Status |
|------|-----------------|--------|
| Route `/privacy` | Tidak ada ❌ | Harus dibuat |
| Route `/terms` | Tidak ada ❌ | Harus dibuat |
| Route `/account-deletion` | Tidak ada ❌ | Harus dibuat |
| Demo/Reviewer seeders | Ada seeders umum tapi tidak spesifik reviewer ⚠️ | Perlu ReviewerSeeder |

---

## Item yang Memerlukan Input Manual dari Developer

> [!IMPORTANT]
> Item-item berikut TIDAK bisa dikerjakan oleh AI karena memerlukan credential atau asset nyata dari developer.
> AI hanya mendokumentasikan placeholder-nya, bukan membuat credential palsu.

1. **Upload Keystore** — Developer harus membuat keystore untuk setiap app:
   - `apps/customer/android/customer-upload-key.jks`
   - `apps/cashier/android/cashier-upload-key.jks`
   - `apps/production/android/production-upload-key.jks`
2. **`google-services.json` untuk Production app** — Harus didapatkan dari Firebase Console dengan package name `com.washwallet.production`
3. **`google-services.json` untuk Cashier** — Setelah package name berubah ke `com.washwallet.cashier`, file ini harus di-regenerate dari Firebase Console
4. **Final launcher icons** — File icon PNG untuk semua resolusi (mipmap-*)
5. **Google Maps API Key restriction** — Untuk production, sebaiknya dibatasi di Google Cloud Console
6. **Production domain** — URL API production yang akan digunakan di `--dart-define`
7. **Pusher/Reverb config** — Untuk Cashier dan Production app
8. **Privacy policy contact email** — Untuk halaman legal

---

## Urutan Implementasi

### Phase 1: Android Identity & Package Name Fix

#### Step 1.1 — Cashier: Update package name dan pindah MainActivity
**Risiko: MEDIUM** — Perubahan package name mempengaruhi banyak file

**File yang dimodifikasi:**

`apps/cashier/android/app/build.gradle.kts`
- Ubah `namespace` dari `com.example.app_new` ke `com.washwallet.cashier`
- Ubah `applicationId` dari `com.example.app_new` ke `com.washwallet.cashier`
- Upgrade `JavaVersion.VERSION_11` ke `JavaVersion.VERSION_17` (konsistensi dengan apps lain)
- Tambah Firebase BoM dependencies (seperti customer app)

`apps/cashier/android/app/src/main/kotlin/com/example/app_new/MainActivity.kt`
- Ubah package declaration baris 1: `package com.example.app_new` ke `package com.washwallet.cashier`

**Aksi file:**
- Buat direktori baru: `apps/cashier/android/app/src/main/kotlin/com/washwallet/cashier/`
- Pindahkan `MainActivity.kt` ke direktori baru tersebut
- Hapus direktori lama `com/example/app_new/` (setelah pindah)

#### Step 1.2 — Production: Update package name dan pindah MainActivity
**Risiko: MEDIUM**

**File yang dimodifikasi:**

`apps/production/android/app/build.gradle.kts`
- Ubah `namespace` dari `com.example.wash_wallet_production` ke `com.washwallet.production`
- Ubah `applicationId` dari `com.example.wash_wallet_production` ke `com.washwallet.production`

`apps/production/android/app/src/main/kotlin/com/example/wash_wallet_produksi/MainActivity.kt`
- Ubah package declaration baris 1: `package com.example.wash_wallet_production` ke `package com.washwallet.production`

**Aksi file:**
- Buat direktori baru: `apps/production/android/app/src/main/kotlin/com/washwallet/production/`
- Pindahkan `MainActivity.kt` ke direktori baru tersebut
- Hapus direktori lama `com/example/wash_wallet_produksi/` (perhatikan typo: `produksi` bukan `production`)

> [!NOTE]
> Direktori lama `wash_wallet_produksi` adalah typo (seharusnya `production`) yang terjadi saat project dibuat. Penghapusan direktori kosong ini setelah pindah adalah tindakan cleanup yang aman.

---

### Phase 2: Firebase Setup

#### Step 2.1 — Production: Tambahkan Google Services Gradle Plugin
**Risiko: LOW** — Hanya penambahan plugin, tidak mengubah logic app

**File yang dimodifikasi:**

`apps/production/android/settings.gradle.kts`
- Tambahkan di blok `plugins`:
  ```kotlin
  id("com.google.gms.google-services") version "4.4.4" apply false
  ```

`apps/production/android/app/build.gradle.kts`
- Tambahkan di blok `plugins`:
  ```kotlin
  id("com.google.gms.google-services")
  ```
- Tambahkan Firebase BoM dependencies:
  ```kotlin
  dependencies {
      coreLibraryDesugaring("com.android.tools:desugar_jdk_libs:2.1.4")
      implementation(platform("com.google.firebase:firebase-bom:34.12.0"))
      implementation("com.google.firebase:firebase-analytics")
      implementation("com.google.firebase:firebase-messaging")
  }
  ```

**File baru yang dibuat:**

`apps/production/android/app/google-services.json.placeholder`
- Berisi instruksi cara mendapatkan `google-services.json` dari Firebase Console
- Jangan buat file `google-services.json` palsu

> [!CAUTION]
> Jika `google-services.json` tidak ada, build AKAN gagal dengan error Gradle. Ini adalah behavior yang DIINGINKAN. Jangan commit file JSON palsu/fake.

#### Step 2.2 — Cashier: Update google-services.json
**Risiko: LOW**

File `apps/cashier/android/app/google-services.json` saat ini masih menggunakan `package_name: com.example.app_new`.

**Yang harus dilakukan:**
- Tambahkan komentar di `google-services.json.placeholder` bahwa file ini harus di-regenerate dari Firebase Console dengan package name `com.washwallet.cashier`
- Jika developer sudah punya akses Firebase Console, minta mereka download `google-services.json` yang baru

> [!WARNING]
> File `google-services.json` yang ada saat ini di cashier masih menggunakan package name lama. Jika dibiarkan, Firebase tidak akan berfungsi dengan benar setelah package name diubah.

---

### Phase 3: Release Signing Config

**Risiko: LOW (konfigurasi) / HIGH (jika keystore salah dikonfigurasi)**

#### Step 3.1 — Buat template key.properties untuk setiap app

**File baru yang dibuat:**

`apps/customer/android/key.properties.example`
`apps/cashier/android/key.properties.example`
`apps/production/android/key.properties.example`

Isi setiap template:
```properties
# Copy file ini ke key.properties dan isi dengan nilai yang sebenarnya
# JANGAN commit key.properties ke Git
storePassword=<your-store-password>
keyPassword=<your-key-password>
keyAlias=<your-key-alias>
storeFile=<path-to-upload-keystore.jks>
```

#### Step 3.2 — Update .gitignore

**File yang dimodifikasi:**

`.gitignore` (root monorepo)
- Tambahkan:
  ```
  *.jks
  *.keystore
  apps/*/android/key.properties
  ```

Setiap `apps/*/android/.gitignore` (buat jika belum ada):
- Tambahkan:
  ```
  key.properties
  ```

#### Step 3.3 — Update build.gradle.kts untuk ketiga app

**File yang dimodifikasi:**
- `apps/customer/android/app/build.gradle.kts`
- `apps/cashier/android/app/build.gradle.kts`
- `apps/production/android/app/build.gradle.kts`

Pattern yang ditambahkan (di bagian atas file, sebelum blok `android {}`):
```kotlin
import java.util.Properties

val keyPropertiesFile = rootProject.file("key.properties")
val keyProperties = Properties()
if (keyPropertiesFile.exists()) {
    keyProperties.load(keyPropertiesFile.inputStream())
}
```

Modifikasi blok `android {}`:
```kotlin
android {
    // ...existing config...

    signingConfigs {
        create("release") {
            if (keyPropertiesFile.exists()) {
                keyAlias = keyProperties["keyAlias"] as String
                keyPassword = keyProperties["keyPassword"] as String
                storeFile = file(keyProperties["storeFile"] as String)
                storePassword = keyProperties["storePassword"] as String
            }
        }
    }

    buildTypes {
        release {
            // Gunakan release signing jika key.properties ada, fallback ke debug untuk dev
            signingConfig = if (keyPropertiesFile.exists()) {
                signingConfigs.getByName("release")
            } else {
                signingConfigs.getByName("debug")
            }
        }
    }
}
```

---

### Phase 4: AndroidManifest Fixes

#### Step 4.1 — Customer App: Perbaiki AndroidManifest.xml
**Risiko: MEDIUM** — Perubahan manifest mempengaruhi permission dan network behavior

**File yang dimodifikasi:**

`apps/customer/android/app/src/main/AndroidManifest.xml`

Perubahan:
1. **Tambahkan** sebelum tag `<application>`:
   ```xml
   <uses-permission android:name="android.permission.INTERNET"/>
   <uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
   ```
2. **Hapus** atribut dari tag `<application>`:
   ```xml
   android:usesCleartextTraffic="true"
   ```
3. **Update** nilai `android:label`:
   ```xml
   android:label="@string/app_name"
   ```

> [!CAUTION]
> Menghapus `usesCleartextTraffic="true"` berarti app tidak bisa mengakses HTTP endpoint (hanya HTTPS). Pastikan production API menggunakan HTTPS sebelum rilis. Untuk development lokal yang masih butuh HTTP, developer perlu menambahkan `network_security_config.xml` yang hanya aktif di debug build.

#### Step 4.2 — Production App: Tambahkan POST_NOTIFICATIONS permission
**Risiko: LOW**

**File yang dimodifikasi:**

`apps/production/android/app/src/main/AndroidManifest.xml`
- Tambahkan:
  ```xml
  <uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
  ```
- Update `android:label` ke `@string/app_name`

#### Step 4.3 — Cashier App: Update label
**Risiko: LOW**

**File yang dimodifikasi:**

`apps/cashier/android/app/src/main/AndroidManifest.xml`
- Update `android:label="Wash Wallet"` ke `android:label="@string/app_name"`

---

### Phase 5: App Label Fix

**Risiko: LOW**

#### Step 5.1 — Buat strings.xml untuk setiap app

**File baru yang dibuat:**

`apps/customer/android/app/src/main/res/values/strings.xml`
```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">WashWallet Customer</string>
</resources>
```

`apps/cashier/android/app/src/main/res/values/strings.xml`
```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">WashWallet Cashier</string>
</resources>
```

`apps/production/android/app/src/main/res/values/strings.xml`
```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">WashWallet Production</string>
</resources>
```

#### Step 5.2 — Update app title di main.dart
**Risiko: LOW**

**File yang dimodifikasi:**

`apps/cashier/lib/main.dart`
- Baris `title: 'WashWallet POS'` → `title: 'WashWallet Cashier'`

`apps/production/lib/main.dart`
- Baris `title: 'WashWallet Produksi'` → `title: 'WashWallet Production'`

---

### Phase 6: Launcher Icon Preparation

**Risiko: LOW** — Hanya dokumentasi, tidak mengubah kode yang ada

#### Step 6.1 — Buat instruksi penggantian icon

**File baru yang dibuat:**

`docs/ICON_REPLACEMENT_GUIDE.md`

Konten:
- Resolusi yang dibutuhkan: mipmap-mdpi (48x48), mipmap-hdpi (72x72), mipmap-xhdpi (96x96), mipmap-xxhdpi (144x144), mipmap-xxxhdpi (192x192)
- Play Store icon: 512x512 PNG
- Format: PNG (24-bit dengan alpha channel)
- Nama file: `ic_launcher.png` untuk setiap resolusi
- Lokasi: `apps/{app}/android/app/src/main/res/mipmap-{density}/`
- Tool yang bisa digunakan: `flutter_launcher_icons` package atau manual replacement
- Adaptive icon: pertimbangkan untuk Android 8.0+ menggunakan `ic_launcher_foreground.png` dan `ic_launcher_background.png`

> [!NOTE]
> Saat ini ketiga app menggunakan default Flutter `ic_launcher.png` (file sangat kecil: 544 bytes, kemungkinan icon default Flutter). Icon harus diganti sebelum rilis produksi.

---

### Phase 7: Backend Legal Pages

**Risiko: LOW**

#### Step 7.1 — Tambahkan routes public di web.php

**File yang dimodifikasi:**

`webapp/wash_wallet_be/routes/web.php`
- Tambahkan group route tanpa middleware auth:
  ```php
  // Public legal pages - accessible without authentication
  Route::get('/privacy', function () {
      return view('public.privacy');
  })->name('privacy');

  Route::get('/terms', function () {
      return view('public.terms');
  })->name('terms');

  Route::get('/account-deletion', function () {
      return view('public.account-deletion');
  })->name('account-deletion');
  ```

#### Step 7.2 — Buat view Blade untuk setiap halaman

**File baru yang dibuat:**

`webapp/wash_wallet_be/resources/views/public/privacy.blade.php`
- Halaman Privacy Policy dengan placeholder content
- Menyebutkan bahwa konten harus direview secara legal sebelum rilis
- Berisi contact/support email placeholder
- Accessible tanpa login

`webapp/wash_wallet_be/resources/views/public/terms.blade.php`
- Halaman Terms of Service dengan placeholder content
- Menyebutkan bahwa konten harus direview secara legal sebelum rilis

`webapp/wash_wallet_be/resources/views/public/account-deletion.blade.php`
- Halaman Account Deletion Request
- Berisi form atau instruksi cara request penghapusan akun
- Dapat diakses tanpa login

---

### Phase 8: Reviewer/Demo Setup

**Risiko: LOW**

#### Step 8.1 — Buat ReviewerSeeder

**File baru yang dibuat:**

`webapp/wash_wallet_be/database/seeders/ReviewerSeeder.php`

Seeder ini harus membuat:
- 1 user customer demo (email: `reviewer.customer@washwallet.com`, password: bisa di-set via env)
- 1 user cashier demo
- 1 user production/produksi demo
- Sample outlet (jika belum ada dari seeder lain)
- Sample services/laundry items
- Sample order dengan status berbeda
- Static/bypass OTP untuk reviewer (jika sistem menggunakan OTP — dokumentasikan cara enable-nya via env variable, contoh: `REVIEWER_STATIC_OTP=123456`)

> [!IMPORTANT]
> Jangan hardcode reviewer credential di source code mobile app. Credential hanya ada di backend seeder. Mobile app tidak boleh memiliki "backdoor" credential.

---

### Phase 9: Build Documentation

**Risiko: NONE** — Hanya dokumentasi

#### Step 9.1 — Buat mobile-release.md

**File baru yang dibuat:**

`docs/mobile-release.md`

Konten:
1. Prerequisites (Flutter version, Java version, Android SDK)
2. Cara setup keystore untuk setiap app
3. Cara setup `key.properties`
4. Build commands lengkap untuk setiap app
5. Required `--dart-define` variables dan penjelasannya
6. Cara verifikasi build berhasil menggunakan release signing

#### Step 9.2 — Buat playstore-release-checklist.md

**File baru yang dibuat:**

`docs/playstore-release-checklist.md`

Checklist yang mencakup:
- [ ] App icon 512x512 PNG
- [ ] Feature graphic 1024x500 PNG
- [ ] Screenshots (min 2, max 8 per device type)
- [ ] Short description (max 80 karakter)
- [ ] Full description (max 4000 karakter)
- [ ] Privacy policy URL (`https://<domain>/privacy`)
- [ ] Terms of Service URL (`https://<domain>/terms`)
- [ ] Account deletion URL (`https://<domain>/account-deletion`)
- [ ] Reviewer credentials (email/password untuk Google reviewer)
- [ ] Data Safety form sudah diisi
- [ ] Internal testing track sudah diupload
- [ ] Target audience sudah diset
- [ ] Content rating sudah diisi
- [ ] Pricing & distribution sudah diset

#### Step 9.3 — Buat backend-production-checklist.md

**File baru yang dibuat:**

`docs/backend-production-checklist.md`

Berisi environment variables yang diperlukan (hanya nama, bukan nilai asli):
- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_URL=https://<domain>`
- Database connection settings
- `SANCTUM_STATEFUL_DOMAINS`
- Firebase server credential path
- Midtrans production keys
- Fonnte token
- Pusher/Reverb server credentials
- Mail configuration
- Queue worker setup instructions
- Storage public link setup
- SSL/HTTPS setup

---

## Daftar Lengkap File yang Diubah/Dibuat/Dipindahkan

### File yang Dimodifikasi (MODIFY)

| File | Perubahan | Risiko |
|------|-----------|--------|
| `apps/customer/android/app/build.gradle.kts` | Tambah release signing config | LOW |
| `apps/customer/android/app/src/main/AndroidManifest.xml` | Tambah INTERNET + POST_NOTIFICATIONS; hapus cleartext; update label | MEDIUM |
| `apps/cashier/android/app/build.gradle.kts` | Update namespace, applicationId, Java version, Firebase deps, release signing | MEDIUM |
| `apps/cashier/android/app/src/main/AndroidManifest.xml` | Update android:label ke @string/app_name | LOW |
| `apps/cashier/android/app/src/main/kotlin/com/example/app_new/MainActivity.kt` | Update package declaration ke `com.washwallet.cashier` | LOW |
| `apps/production/android/app/build.gradle.kts` | Update namespace, applicationId, tambah Google Services plugin + Firebase deps, release signing | MEDIUM |
| `apps/production/android/settings.gradle.kts` | Tambah Google Services plugin declaration | LOW |
| `apps/production/android/app/src/main/AndroidManifest.xml` | Tambah POST_NOTIFICATIONS; update label | LOW |
| `apps/production/android/app/src/main/kotlin/com/example/wash_wallet_produksi/MainActivity.kt` | Update package declaration ke `com.washwallet.production` | LOW |
| `apps/cashier/lib/main.dart` | Update app title dari `WashWallet POS` ke `WashWallet Cashier` | LOW |
| `apps/production/lib/main.dart` | Update app title dari `WashWallet Produksi` ke `WashWallet Production` | LOW |
| `webapp/wash_wallet_be/routes/web.php` | Tambah 3 route publik | LOW |
| `.gitignore` (root monorepo) | Tambah rules untuk keystore dan key.properties | LOW |

### File yang Dipindahkan (MOVE)

| Dari | Ke |
|------|----|
| `apps/cashier/android/app/src/main/kotlin/com/example/app_new/MainActivity.kt` | `apps/cashier/android/app/src/main/kotlin/com/washwallet/cashier/MainActivity.kt` |
| `apps/production/android/app/src/main/kotlin/com/example/wash_wallet_produksi/MainActivity.kt` | `apps/production/android/app/src/main/kotlin/com/washwallet/production/MainActivity.kt` |

### File Baru yang Dibuat (NEW)

| File | Keterangan |
|------|------------|
| `apps/customer/android/key.properties.example` | Template keystore config customer |
| `apps/cashier/android/key.properties.example` | Template keystore config cashier |
| `apps/production/android/key.properties.example` | Template keystore config production |
| `apps/customer/android/app/src/main/res/values/strings.xml` | App label resource customer |
| `apps/cashier/android/app/src/main/res/values/strings.xml` | App label resource cashier |
| `apps/production/android/app/src/main/res/values/strings.xml` | App label resource production |
| `apps/production/android/app/google-services.json.placeholder` | Instruksi cara mendapatkan google-services.json untuk production |
| `webapp/wash_wallet_be/resources/views/public/privacy.blade.php` | Halaman Privacy Policy |
| `webapp/wash_wallet_be/resources/views/public/terms.blade.php` | Halaman Terms of Service |
| `webapp/wash_wallet_be/resources/views/public/account-deletion.blade.php` | Halaman Account Deletion |
| `webapp/wash_wallet_be/database/seeders/ReviewerSeeder.php` | Seeder untuk data demo reviewer |
| `docs/mobile-release.md` | Dokumentasi release build commands |
| `docs/playstore-release-checklist.md` | Checklist Play Store submission |
| `docs/backend-production-checklist.md` | Checklist backend production readiness |
| `docs/ICON_REPLACEMENT_GUIDE.md` | Panduan penggantian launcher icon |

---

## Verification Commands

Setelah semua perubahan selesai, lakukan verifikasi berikut:

### 1. Verifikasi Dart/Flutter Analysis

```bash
# Dari root monorepo (jika menggunakan Melos)
melos bootstrap
melos run analyze

# Atau per app
cd apps/customer && flutter pub get && flutter analyze
cd apps/cashier && flutter pub get && flutter analyze
cd apps/production && flutter pub get && flutter analyze
```

### 2. Verifikasi Tidak Ada com.example di Config

```bash
# Dari root monorepo
grep -r "com.example" apps/customer/android/app/build.gradle.kts   # Harus kosong
grep -r "com.example" apps/cashier/android/app/build.gradle.kts    # Harus kosong
grep -r "com.example" apps/production/android/app/build.gradle.kts # Harus kosong
grep -r "com.example" apps/cashier/android/app/src/main/kotlin      # Harus kosong
grep -r "com.example" apps/production/android/app/src/main/kotlin   # Harus kosong
```

### 3. Verifikasi Release Build (Dev mode, tanpa keystore nyata)

Build akan fallback ke debug signing jika `key.properties` tidak ditemukan:

```bash
# Customer
cd apps/customer
flutter clean && flutter pub get
flutter build appbundle --release \
  --build-name=1.0.0 \
  --build-number=1 \
  --dart-define=API_BASE_URL=https://<production-domain>/api

# Cashier
cd apps/cashier
flutter clean && flutter pub get
flutter build appbundle --release \
  --build-name=1.0.0 \
  --build-number=1 \
  --dart-define=API_BASE_URL=https://<production-domain>/api \
  --dart-define=PUSHER_APP_KEY=<key> \
  --dart-define=PUSHER_CLUSTER=<cluster> \
  --dart-define=BROADCASTING_AUTH_URL=https://<production-domain>/broadcasting/auth

# Production
cd apps/production
flutter clean && flutter pub get
flutter build appbundle --release \
  --build-name=1.0.0 \
  --build-number=1 \
  --dart-define=API_BASE_URL=https://<production-domain>/api \
  --dart-define=PUSHER_APP_KEY=<key> \
  --dart-define=PUSHER_CLUSTER=<cluster> \
  --dart-define=BROADCASTING_AUTH_URL=https://<production-domain>/broadcasting/auth
```

> [!NOTE]
> Build production app akan **gagal** jika `google-services.json` tidak tersedia. Ini adalah behavior yang DIHARAPKAN.

### 4. Verifikasi Backend Routes

```bash
cd webapp/wash_wallet_be
php artisan route:list | grep -E "privacy|terms|account-deletion"
```

---

## Rollback Notes

| Phase | Cara Rollback |
|-------|--------------|
| Package name Cashier | Revert `build.gradle.kts`, kembalikan `MainActivity.kt` ke path lama, revert package declaration |
| Package name Production | Revert `build.gradle.kts`, kembalikan `MainActivity.kt` ke path lama, revert package declaration |
| Firebase Production | Hapus plugin dari `settings.gradle.kts` dan `build.gradle.kts` |
| Release signing | Hapus blok `signingConfigs` dan revert blok `release` di `buildTypes` |
| AndroidManifest customer | `git checkout apps/customer/android/app/src/main/AndroidManifest.xml` |
| AndroidManifest production | `git checkout apps/production/android/app/src/main/AndroidManifest.xml` |
| Backend routes | `git checkout webapp/wash_wallet_be/routes/web.php` dan hapus file view baru |
| Semua perubahan | `git stash` atau `git reset --hard <commit-hash>` |

---

## Acceptance Criteria Checklist

### Android Identity
- [ ] `apps/customer` menggunakan `com.washwallet.customer` di `build.gradle.kts` dan `MainActivity.kt`
- [ ] `apps/cashier` menggunakan `com.washwallet.cashier` di `build.gradle.kts` dan `MainActivity.kt`
- [ ] `apps/production` menggunakan `com.washwallet.production` di `build.gradle.kts` dan `MainActivity.kt`
- [ ] Tidak ada app yang menggunakan `com.example...`

### Release Signing
- [ ] Release build tidak menggunakan debug signing (ketika `key.properties` tersedia)
- [ ] `key.properties` diabaikan oleh Git
- [ ] `key.properties.example` tersedia sebagai template
- [ ] File keystore (`*.jks`) diabaikan oleh Git

### Manifest
- [ ] Customer app memiliki `INTERNET` permission
- [ ] Customer app tidak memiliki `usesCleartextTraffic="true"`
- [ ] Semua app yang menggunakan Firebase Messaging memiliki `POST_NOTIFICATIONS` (customer, cashier, production)
- [ ] Semua app memiliki `android:label` yang mengacu ke `@string/app_name`

### Firebase
- [ ] Customer `google-services.json` valid untuk `com.washwallet.customer`
- [ ] Cashier `google-services.json` diperbarui untuk `com.washwallet.cashier`
- [ ] Production Google Services plugin sudah ditambahkan ke Gradle
- [ ] Missing `google-services.json` untuk production sudah didokumentasikan dengan jelas

### App Labels & Titles
- [ ] Customer: label `WashWallet Customer`, title `WashWallet Customer`
- [ ] Cashier: label `WashWallet Cashier`, title `WashWallet Cashier`
- [ ] Production: label `WashWallet Production`, title `WashWallet Production`

### Build
- [ ] `flutter analyze` tidak error untuk ketiga app
- [ ] Release build dapat berjalan (minimal dengan debug signing fallback)
- [ ] Build commands terdokumentasi dengan `--dart-define` yang diperlukan

### Documentation
- [ ] `docs/mobile-release.md` tersedia
- [ ] `docs/playstore-release-checklist.md` tersedia
- [ ] `docs/backend-production-checklist.md` tersedia

### Legal Pages
- [ ] Route `/privacy` accessible tanpa login
- [ ] Route `/terms` accessible tanpa login
- [ ] Route `/account-deletion` accessible tanpa login

### Security
- [ ] Tidak ada credential asli yang di-commit
- [ ] Tidak ada `google-services.json` palsu yang di-commit
- [ ] Tidak ada keystore atau password di-commit
