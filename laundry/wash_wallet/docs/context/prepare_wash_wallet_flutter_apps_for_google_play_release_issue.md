# Issue: Prepare WashWallet Flutter Apps for Google Play Release

Tanggal review codebase: 2026-06-23

Dokumen ini adalah issue/context untuk AI model lain yang akan membahas atau melanjutkan persiapan rilis tiga aplikasi Flutter WashWallet ke Google Play. Dokumen ini sudah diperbarui berdasarkan kondisi codebase saat ini, bukan kondisi awal sebelum sebagian perbaikan Android release dilakukan.

## Tujuan

Siapkan tiga aplikasi Android Flutter berikut agar siap diupload ke Google Play sebagai `.aab` release build:

- `apps/customer` -> `WashWallet Customer`
- `apps/cashier` -> `WashWallet Cashier`
- `apps/production` -> `WashWallet Production`

Model lain yang menerima issue ini harus:

1. Membaca kondisi codebase saat ini lebih dulu.
2. Tidak mengulang pekerjaan yang sudah selesai.
3. Tidak menghapus perubahan existing di working tree.
4. Membuat plan sebelum implementasi.
5. Memisahkan item yang bisa dikodekan dari item yang butuh input manual developer.

## Sumber Resmi Yang Harus Dipakai

Kebijakan Google Play dapat berubah, jadi verifikasi lagi sebelum submission final. Saat dokumen ini ditulis, sumber resmi yang relevan:

- Target API level Google Play: https://support.google.com/googleplay/android-developer/answer/11926878
- Android App Bundle: https://developer.android.com/guide/app-bundle
- Play App Signing: https://support.google.com/googleplay/android-developer/answer/9842756
- Prepare app for review: https://support.google.com/googleplay/android-developer/answer/9859455
- Data Safety: https://support.google.com/googleplay/android-developer/answer/10787469
- Store listing preview assets: https://support.google.com/googleplay/android-developer/answer/9866151
- Testing requirements for new personal developer accounts: https://support.google.com/googleplay/android-developer/answer/14151465
- Account deletion requirements: https://support.google.com/googleplay/android-developer/answer/13327111

Kebijakan penting:

- New apps dan updates Android mobile harus target Android 15/API 35 atau lebih tinggi mulai 2025-08-31.
- New apps di Play Store harus dipublish sebagai Android App Bundle (`.aab`).
- Play App Signing membedakan upload key yang dipegang developer dan app signing key yang dipegang Google.
- Jika account Play Console adalah personal developer account baru setelah 2023-11-13, closed test minimal 12 tester opt-in selama 14 hari diperlukan sebelum production access.
- App dengan login/restricted access harus menyediakan reviewer credentials/sign-in instructions.
- App yang mengumpulkan user data atau memakai sensitive permissions harus punya privacy policy dan Data Safety form.
- App dengan account creation/login harus menyediakan account deletion path.

## Current Git/Workspace Notes

Saat audit ini dilakukan, working tree sudah tidak bersih. Jangan revert perubahan ini tanpa instruksi eksplisit developer.

Observed `git status --short`:

```text
 M .gitignore
 m webapp/wash_wallet_be
?? apps/customer/docs/plan/implementation_plan.md
?? docs/context/prepare_wash_wallet_flutter_apps_for_google_play_release_issue.md
?? docs/plan/google_play_release_preparation_plan.md
?? docs/plan/implementation_plan.md
?? docs/plan/implementation_plan_new.md
```

Catatan:

- `webapp/wash_wallet_be` muncul sebagai modified nested repo/submodule entry dari root.
- Legal routes/pages terlihat sudah ditambahkan di backend nested project.
- Issue file ini sendiri masih untracked dari sudut pandang root git.
- Jangan memakai dokumen lama `docs/plan/google_play_release_preparation_plan.md` sebagai source of truth tanpa audit ulang karena isinya sudah tertinggal dari kondisi repo saat ini.

## Ringkasan Status Saat Ini

| Area | Customer | Cashier | Production |
| --- | --- | --- | --- |
| Android `applicationId` | `com.washwallet.customer` done | `com.washwallet.cashier` done | `com.washwallet.production` done |
| Android `namespace` | `com.washwallet.customer` done | `com.washwallet.cashier` done | `com.washwallet.production` done |
| MainActivity package | `com.washwallet.customer` done, path folder masih lama | `com.washwallet.cashier` done | `com.washwallet.production` done |
| App label Android | `WashWallet Customer` done | `WashWallet Cashier` done | `WashWallet Production` done |
| `INTERNET` permission | done | done | done |
| `POST_NOTIFICATIONS` permission | done | done | done |
| `usesCleartextTraffic=true` | removed/not present | not present | not present |
| Firebase Gradle plugin | applied | applied | applied |
| Firebase config | `google-services.json` package matches | mismatch: still `com.example.app_new` | missing real JSON, placeholder exists |
| Release signing | configured but falls back to debug | configured but falls back to debug | configured but falls back to debug |
| Launcher icon | likely default Flutter | changed size, still needs final confirmation | likely default Flutter |
| Build docs | missing | missing | missing |
| Store listing docs/assets | missing | missing | missing |
| Public legal URLs | backend routes exist as placeholders | backend routes exist as placeholders | backend routes exist as placeholders |

## Codebase Findings

### 1. Android Identity Mostly Fixed

Current files:

- `apps/customer/android/app/build.gradle.kts`
- `apps/cashier/android/app/build.gradle.kts`
- `apps/production/android/app/build.gradle.kts`

Current values:

```text
customer:   namespace/applicationId = com.washwallet.customer
cashier:    namespace/applicationId = com.washwallet.cashier
production: namespace/applicationId = com.washwallet.production
```

MainActivity packages:

```text
apps/cashier/android/app/src/main/kotlin/com/washwallet/cashier/MainActivity.kt
  package com.washwallet.cashier

apps/customer/android/app/src/main/kotlin/com/example/wash_wallet_customer/MainActivity.kt
  package com.washwallet.customer

apps/production/android/app/src/main/kotlin/com/washwallet/production/MainActivity.kt
  package com.washwallet.production
```

Remaining issue:

- Customer `MainActivity.kt` package declaration is correct, but the file path still lives under `com/example/wash_wallet_customer`.
- Kotlin does not require source folder path to match package for compilation, but this is confusing and should be cleaned up for maintainability.
- Risk: low for runtime, medium for future maintainers.

Recommended follow-up:

- Move customer MainActivity to `apps/customer/android/app/src/main/kotlin/com/washwallet/customer/MainActivity.kt`.
- Remove empty old `com/example/wash_wallet_customer` directories if safe.

### 2. Release Signing Is Only Partially Fixed

Current pattern in all three apps:

```kotlin
val keyPropertiesFile = rootProject.file("../../../key.properties")
...
release {
    signingConfig = if (keyPropertiesFile.exists()) {
        signingConfigs.getByName("release")
    } else {
        signingConfigs.getByName("debug")
    }
}
```

What is good:

- Release signing config exists.
- Secrets are read from local `key.properties`.
- `.gitignore` now ignores `*.jks`, `*.keystore`, root `key.properties`, and `apps/*/android/key.properties`.

Remaining blocker:

- Release build silently falls back to debug signing when root `key.properties` is missing.
- This can accidentally produce a debug-signed `release` bundle that is not acceptable for Play Store.
- There is no `key.properties.example` template found.
- Current Gradle config uses a shared root-level `key.properties`, not per-app key files.

Decision needed:

- Use one shared upload keystore for all three apps, or one upload keystore per app?

Recommended safer implementation:

- Keep debug fallback only for local non-Play testing if explicitly desired, but make Play release build fail loudly when signing config is missing.
- Add `key.properties.example` with placeholders.
- Add clear docs for root shared key strategy or per-app key strategy.

Suggested example template:

```properties
# Copy this file to key.properties at repository root.
# Do not commit key.properties or keystore files.
storePassword=<your-store-password>
keyPassword=<your-key-password>
keyAlias=<your-key-alias>
storeFile=<relative-path-to-upload-keystore.jks>
```

### 3. Firebase Is Still Blocking Cashier and Production

Current Firebase config:

```text
apps/customer/android/app/google-services.json
  package_name = com.washwallet.customer

apps/cashier/android/app/google-services.json
  package_name = com.example.app_new

apps/production/android/app/google-services.json
  missing

apps/production/android/app/google-services.json.placeholder
  exists
```

Current Gradle plugin status:

- Customer applies `com.google.gms.google-services`.
- Cashier applies `com.google.gms.google-services`.
- Production now applies `com.google.gms.google-services`.

Remaining blockers:

- Cashier Firebase Android app config must be regenerated for `com.washwallet.cashier`.
- Production needs real `google-services.json` for `com.washwallet.production`.
- Do not invent or commit fake Firebase config.
- Decide whether real `google-services.json` files are allowed in repo. If yes, ensure package names are correct and API keys are restricted where relevant. If no, document local placement and ignore policy.

Risk:

- Cashier may fail Firebase setup at build/runtime because package name in JSON does not match final `applicationId`.
- Production build will likely fail with Google Services plugin until real JSON is supplied.

### 4. Customer Google Maps API Key Is Hardcoded

Current file:

```text
apps/customer/android/app/src/main/AndroidManifest.xml
```

Current pattern:

```xml
<meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="AIzaSy..." />
```

Risk:

- The key is committed directly in the manifest.
- Android API keys are not secret in the same way backend credentials are, but they must be restricted in Google Cloud Console.
- For Play release, restrictions should use final package name and SHA-1/SHA-256 fingerprints from Play App Signing, not only local upload key.

Recommended follow-up:

- Move key to Gradle manifest placeholder or local properties if desired.
- At minimum, restrict the existing key to:
  - package `com.washwallet.customer`
  - Play app signing SHA fingerprint
  - upload key SHA fingerprint for local/internal testing if needed
  - allowed Google Maps/Places APIs only
- Document this in release checklist.

### 5. Android Manifest Permissions Mostly Fixed

Current status:

Customer:

- `ACCESS_FINE_LOCATION`
- `ACCESS_COARSE_LOCATION`
- `INTERNET`
- `POST_NOTIFICATIONS`
- no `usesCleartextTraffic=true`
- Google Maps API key metadata present

Cashier:

- Bluetooth permissions for printer
- `INTERNET`
- `POST_NOTIFICATIONS`
- `CAMERA`
- storage/media image permissions
- `BLUETOOTH_SCAN` uses `neverForLocation`

Production:

- Bluetooth permissions for printer
- `INTERNET`
- `POST_NOTIFICATIONS`
- `CAMERA`
- storage/media image permissions
- `BLUETOOTH_SCAN` uses `neverForLocation`

Remaining considerations:

- Verify Android 13+ notification permission flow in runtime for customer/cashier/production.
- Verify Android 12+ Bluetooth permission prompt flow for printer features.
- Make sure Play Console permissions declaration and privacy policy explain location, camera, photos/media, notification, and nearby devices/Bluetooth usage.

### 6. App Labels and Flutter Titles Are Fixed

Current labels:

```text
apps/customer/android/app/src/main/res/values/strings.xml
  WashWallet Customer

apps/cashier/android/app/src/main/res/values/strings.xml
  WashWallet Cashier

apps/production/android/app/src/main/res/values/strings.xml
  WashWallet Production
```

Current Flutter app titles:

```text
apps/customer/lib/main.dart
  title: WashWallet Customer

apps/cashier/lib/main.dart
  title: WashWallet Cashier

apps/production/lib/main.dart
  title: WashWallet Production
```

Not a Play blocker but still present:

- Some web/desktop/iOS/macOS/Linux labels still use old names such as `wash_wallet_customer`, `wash_wallet_production`, `Wash Wallet Produksi`, or `WashWallet POS`.
- Since this issue is Google Play Android release, those are out of scope unless developer wants all platforms cleaned up.

### 7. Launcher Icons Are Not Final

Observed launcher icon file sizes:

```text
cashier mipmap icons: larger files, may have been changed, still needs visual confirmation
customer mipmap icons: very small default Flutter-style sizes
production mipmap icons: very small default Flutter-style sizes
```

Remaining blocker:

- Final launcher icons and Play Store icons are not confirmed.
- Customer and production likely still use default Flutter launcher icons.
- The Play Store listing needs a separate 512x512 icon per app.

Context already prepared:

```text
docs/context/play_store_icon_generation_context.md
```

Recommended follow-up:

- Generate final icon set per app.
- Replace Android launcher icons.
- Add adaptive icon assets if desired.
- Confirm Play icon spec: 512x512 PNG, sRGB, max 1024KB, no source rounded corners/drop shadow.

### 8. API Base URL and Realtime Env Vars Still Need Release Documentation

Current apps still use local emulator default:

```dart
String.fromEnvironment(
  'API_BASE_URL',
  defaultValue: 'http://10.0.2.2:8000/api',
)
```

This is acceptable for local dev, but release builds must pass production values.

Required release defines:

Customer:

```powershell
--dart-define=API_BASE_URL=https://<production-domain>/api
```

Cashier and Production:

```powershell
--dart-define=API_BASE_URL=https://<production-domain>/api
--dart-define=PUSHER_APP_KEY=<key>
--dart-define=PUSHER_CLUSTER=<cluster>
--dart-define=BROADCASTING_AUTH_URL=https://<production-domain>/broadcasting/auth
```

Remaining blocker:

- There is no dedicated `docs/mobile-release.md`, `docs/playstore-release-checklist.md`, or `docs/backend-production-checklist.md` found.
- Existing README examples still include HTTP/local examples for build commands.

### 9. Public Legal Routes Now Exist, But Content Is Placeholder

Current backend routes:

```text
GET /privacy
GET /terms
GET /account-deletion
```

Current files:

```text
webapp/wash_wallet_be/resources/views/public/privacy.blade.php
webapp/wash_wallet_be/resources/views/public/terms.blade.php
webapp/wash_wallet_be/resources/views/public/account-deletion.blade.php
```

What is good:

- Routes are outside dashboard auth section.
- Pages are accessible without login by route placement.
- Placeholder pages warn that legal review is required.

Remaining issues:

- Content is extremely minimal.
- Account deletion page is only email instructions; verify this satisfies intended account deletion policy flow and Play Console form.
- Privacy policy should mention actual data categories used by apps: account data, phone/email/name, location, address, order/payment/topup, FCM/device ID, camera/photos, printer/Bluetooth usage, logs, and third-party processors such as Firebase, Google Maps/Places, Midtrans via backend, Fonnte/WhatsApp via backend.
- Terms should be reviewed and expanded before production.
- In-app links to privacy/account deletion are not confirmed.

### 10. Reviewer/Demo Data Is Still Needed

No reviewer-specific seeder or documented demo credential workflow was confirmed during this audit.

Required for Play review:

- Customer reviewer account that can pass OTP/password login.
- Cashier employee account with outlet, services, customers, and permissions.
- Production staff account with production/courier permissions and sample tasks.
- Safe sample data: outlet, services, customer address, topup/payment state, orders in multiple statuses, pickup schedule.
- Clear Play Console "App access" instructions.

Rules:

- Do not hardcode reviewer credentials in mobile apps.
- If static OTP is used, it must be backend-controlled and environment-gated.
- Do not expose real customer data.

### 11. Target SDK Uses Flutter Defaults

Current Android files use:

```kotlin
compileSdk = flutter.compileSdkVersion
targetSdk = flutter.targetSdkVersion
minSdk = flutter.minSdkVersion
```

This is generally fine if the build machine uses a modern Flutter SDK whose Android defaults target API 35+.

Risk:

- Target SDK can change depending on Flutter SDK/CI environment.
- If CI or developer machine uses older Flutter/Android SDK, Play target requirement may fail.

Recommended follow-up:

- Document required Flutter/Android SDK version.
- Consider pinning target/compile SDK explicitly if reproducible release builds are more important than following local Flutter defaults.

## Updated Prioritized Work

### P0: Do Not Lose Current Work

Before implementing:

- Run `git status --short`.
- Review current dirty files.
- Do not revert `.gitignore`, backend legal pages, Android identity changes, or any unrelated user work unless explicitly requested.

### P1: Fix Firebase Release Blockers

Files:

```text
apps/cashier/android/app/google-services.json
apps/production/android/app/google-services.json.placeholder
apps/production/android/app/build.gradle.kts
apps/production/android/settings.gradle.kts
```

Tasks:

- Replace cashier Firebase config with one generated for `com.washwallet.cashier`.
- Add real production Firebase config for `com.washwallet.production`, or document exactly where developer must place it.
- Keep fake configs out of repo.
- Confirm customer config remains valid for `com.washwallet.customer`.

Risk: high for release build/runtime notifications.

### P2: Harden Release Signing

Files:

```text
apps/customer/android/app/build.gradle.kts
apps/cashier/android/app/build.gradle.kts
apps/production/android/app/build.gradle.kts
.gitignore
key.properties.example
```

Tasks:

- Decide shared root upload key vs per-app upload key.
- Add `key.properties.example`.
- Avoid silent debug signing for Play release.
- Prefer failing with a clear Gradle error when building release without signing config intended for Play.
- Document keystore generation and Play App Signing flow.

Risk: high if debug-signed `.aab` is accidentally uploaded or generated.

### P3: Clean Customer MainActivity Path

Files:

```text
apps/customer/android/app/src/main/kotlin/com/example/wash_wallet_customer/MainActivity.kt
apps/customer/android/app/src/main/kotlin/com/washwallet/customer/MainActivity.kt
```

Tasks:

- Move file to path matching package.
- Remove old empty directories if safe.

Risk: low.

### P4: Handle Google Maps API Key Properly

Files:

```text
apps/customer/android/app/src/main/AndroidManifest.xml
apps/customer/android/app/build.gradle.kts
```

Tasks:

- Decide whether to keep hardcoded key or move to local/Gradle property.
- Restrict key in Google Cloud Console for final package and Play app signing SHA.
- Document required Maps/Places API setup.

Risk: medium/high if unrestricted key leaks quota or if restriction uses wrong certificate.

### P5: Add Missing Release Documentation

Suggested new files:

```text
docs/mobile-release.md
docs/playstore-release-checklist.md
docs/backend-production-checklist.md
docs/icon-replacement-guide.md
```

Content should include:

- Required Flutter/Java/Android SDK.
- `flutter build appbundle --release` commands per app.
- Required `--dart-define` values.
- Signing setup and keystore template.
- Firebase setup per app.
- Store listing assets.
- Data Safety categories.
- App access/reviewer credentials.
- Internal/closed testing steps.
- Backend production checklist.

Risk: low, high value.

### P6: Expand Legal Pages Before Production

Files:

```text
webapp/wash_wallet_be/routes/web.php
webapp/wash_wallet_be/resources/views/public/privacy.blade.php
webapp/wash_wallet_be/resources/views/public/terms.blade.php
webapp/wash_wallet_be/resources/views/public/account-deletion.blade.php
```

Tasks:

- Keep pages public.
- Expand content enough for Play review and legal review.
- Add account deletion details: what data is deleted, retained, retention period, how to request, contact, identity verification.
- Add privacy categories matching actual mobile permissions/data usage.
- Add links from app settings/profile if required.

Risk: medium for Play compliance, legal review still required.

### P7: Prepare Reviewer/Demo Accounts

Backend areas to inspect:

```text
webapp/wash_wallet_be/database/seeders/**
webapp/wash_wallet_be/routes/api_mobile_customer.php
webapp/wash_wallet_be/routes/api_mobile_cashier.php
webapp/wash_wallet_be/routes/api_mobile_production.php
```

Tasks:

- Add/document reviewer seed data.
- Ensure customer can pass OTP/login in review.
- Ensure cashier and production users have required permissions.
- Provide Play Console reviewer instructions.

Risk: high for Play review if reviewer cannot access app.

### P8: Replace Launcher Icons and Prepare Store Assets

Inputs required from developer/designer:

- Android launcher icon sets.
- Adaptive icon layers if used.
- Play Store 512x512 icon.
- Feature graphic 1024x500.
- Screenshots.
- Short/full descriptions.

Existing context:

```text
docs/context/play_store_icon_generation_context.md
```

Risk: medium for release acceptance/presentation.

## Suggested Verification Commands

Run from repository root unless noted.

### Inspect release-critical config

```powershell
rg -n "com\.example" apps\cashier\android apps\customer\android apps\production\android
rg -n "usesCleartextTraffic" apps\cashier\android apps\customer\android apps\production\android
rg -n "package_name" apps\cashier\android\app\google-services.json apps\customer\android\app\google-services.json
Get-ChildItem apps\production\android\app -Filter google-services*
```

Expected current result:

- Only known `com.example` should be cashier `google-services.json` until replaced.
- No `usesCleartextTraffic=true`.
- Customer Firebase package should be `com.washwallet.customer`.
- Production should have real `google-services.json` before final build.

### Flutter/Dart validation

```powershell
flutter pub get
melos bootstrap
melos run analyze
melos run test
```

If Melos is not available, run per app:

```powershell
cd apps\customer
flutter pub get
flutter analyze

cd ..\cashier
flutter pub get
flutter analyze

cd ..\production
flutter pub get
flutter analyze
```

### Android release builds

Customer:

```powershell
cd apps\customer
flutter build appbundle --release --build-name=1.0.0 --build-number=1 --dart-define=API_BASE_URL=https://<production-domain>/api
```

Cashier:

```powershell
cd apps\cashier
flutter build appbundle --release --build-name=1.0.0 --build-number=1 --dart-define=API_BASE_URL=https://<production-domain>/api --dart-define=PUSHER_APP_KEY=<key> --dart-define=PUSHER_CLUSTER=<cluster> --dart-define=BROADCASTING_AUTH_URL=https://<production-domain>/broadcasting/auth
```

Production:

```powershell
cd apps\production
flutter build appbundle --release --build-name=1.0.0 --build-number=1 --dart-define=API_BASE_URL=https://<production-domain>/api --dart-define=PUSHER_APP_KEY=<key> --dart-define=PUSHER_CLUSTER=<cluster> --dart-define=BROADCASTING_AUTH_URL=https://<production-domain>/broadcasting/auth
```

Important:

- Do not treat a debug-signed fallback build as Play-ready.
- Production app build should not be considered complete until real Firebase config exists.

### Backend route validation

From `webapp/wash_wallet_be`:

```powershell
php artisan route:list | Select-String -Pattern "privacy|terms|account-deletion"
```

Expected:

- `/privacy`
- `/terms`
- `/account-deletion`

## Manual Inputs Required From Developer

The next model/assistant cannot safely invent these:

- Final production API domain.
- Upload keystore strategy: shared across apps or per app.
- Real upload keystore file(s), alias, passwords.
- Firebase Android configs for:
  - `com.washwallet.cashier`
  - `com.washwallet.production`
- Confirmation whether customer Firebase config can stay committed.
- Google Maps API key strategy and restrictions.
- Play Console developer account type: personal or organization.
- Distribution strategy for Cashier and Production: public, unlisted, private/managed.
- Final app icons and launcher icon assets.
- Feature graphics and screenshots.
- Reviewer credentials/demo data.
- Support/privacy contact email.
- Final privacy/terms/account deletion legal text.
- Midtrans/Fonnte/Reverb/Firebase production backend credentials.

## Acceptance Criteria

### Android Identity

- [ ] Customer uses `com.washwallet.customer`.
- [ ] Cashier uses `com.washwallet.cashier`.
- [ ] Production uses `com.washwallet.production`.
- [ ] No Android release-critical config uses `com.example`.
- [ ] Customer MainActivity path is cleaned up or explicitly accepted as non-blocking.

### Signing

- [ ] Release builds for Play cannot silently fall back to debug signing.
- [ ] `key.properties.example` exists.
- [ ] Real `key.properties` and keystores are ignored.
- [ ] Play App Signing upload key/app signing key flow is documented.

### Firebase

- [ ] Customer Firebase config matches `com.washwallet.customer`.
- [ ] Cashier Firebase config matches `com.washwallet.cashier`.
- [ ] Production has real Firebase config for `com.washwallet.production`.
- [ ] No fake Firebase config is committed.
- [ ] FCM token registration is manually verified per app.

### Manifest and Permissions

- [ ] Customer has `INTERNET`, `POST_NOTIFICATIONS`, and location permissions.
- [ ] Cashier has notification, camera/media, Bluetooth, and internet permissions required by features.
- [ ] Production has notification, camera/media, Bluetooth, and internet permissions required by features.
- [ ] No production release manifest enables broad cleartext traffic.
- [ ] Google Maps key is restricted/documented.

### App Assets

- [ ] Installed app labels are final.
- [ ] Android launcher icons are final per app.
- [ ] Play Store 512x512 icons are final per app.
- [ ] Feature graphics and screenshots are ready.

### Documentation

- [ ] `docs/mobile-release.md` exists.
- [ ] `docs/playstore-release-checklist.md` exists.
- [ ] `docs/backend-production-checklist.md` exists.
- [ ] Build commands include all required `--dart-define` values.
- [ ] Store listing and Data Safety guidance are documented.

### Legal and Review Access

- [ ] `/privacy` is public and production-ready enough for legal review.
- [ ] `/terms` is public and production-ready enough for legal review.
- [ ] `/account-deletion` is public and includes deletion/retention/request instructions.
- [ ] Play Console App access/reviewer credentials are prepared.
- [ ] Reviewer seed/demo data exists or is documented.

### Build Verification

- [ ] `flutter analyze` or `melos run analyze` passes.
- [ ] Customer release `.aab` builds with production `API_BASE_URL`.
- [ ] Cashier release `.aab` builds with production API and realtime defines.
- [ ] Production release `.aab` builds with production API, realtime defines, and real Firebase config.
- [ ] Internal testing install works on Android 13+ and Android 14/15 devices.

## Out of Scope Unless Explicitly Requested

- Redesigning mobile UI.
- Changing auth/business logic.
- Replacing Firebase, Midtrans, Fonnte, Reverb/Pusher, Sanctum, or Dio.
- Creating fake Firebase configs.
- Committing real secrets.
- Implementing full legal policy text without legal review.
- Cleaning iOS/macOS/Windows/Linux labels unless cross-platform release is requested.

## Security Rules

Never commit:

```text
*.jks
*.keystore
key.properties with real password
Firebase service account JSON
Midtrans production keys
Fonnte token
Pusher/Reverb secrets
.env production secrets
real customer data
```

For Android `google-services.json`:

- It is often committed in Android projects, but decide repo policy explicitly.
- If committed, ensure package name is correct and API keys are restricted.
- If not committed, add clear local setup docs and ignore rule.

## Expected Final Response From The Implementing AI

After implementation, report:

1. Current state before changes.
2. Files changed.
3. Manual inputs still required.
4. Commands run and command results.
5. Builds that passed/failed.
6. Remaining blockers per app:
   - Customer
   - Cashier
   - Production
7. Whether the apps are ready for:
   - local release build
   - Play internal testing
   - Play production submission

