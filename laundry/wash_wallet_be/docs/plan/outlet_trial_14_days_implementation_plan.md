# Implementation Plan: Trial Outlet Gratis 14 Hari

**Berdasarkan:** [outlet_trial_14_days_user_need.md](../user_need/outlet_trial_14_days_user_need.md)  
**Tanggal:** 2026-06-17  
**Status:** Siap Dikerjakan

---

## 1. Ringkasan

Plan ini menguraikan perubahan teknis yang diperlukan agar fitur **trial gratis 14 hari** untuk outlet berfungsi secara lengkap dan konsisten — dari database, backend service, controller, resource, hingga frontend (TypeScript types + React components).

Gap utama yang perlu ditutup:
1. Kolom `trial_duration_days` belum ada di tabel `features`.
2. `FeatureSeeder` belum menyimpan nilai `trial_duration_days = 14` untuk `outlet_activation`.
3. `Activate.tsx` masih memanggil route `outlets.start-trial` yang tidak aktif.
4. `OutletActivationOverlay.tsx` membaca field `trial_remaining` (snake_case), sementara `OutletResource` mengirim `trialRemainingDays` (camelCase).
5. TypeScript type `OutletActivationOverlayProps.activationStatus` memakai `trial_remaining` dan `trial_expires_at` (snake_case) — tidak konsisten dengan resource.
6. `OutletFeatureService::startTrial()` mengubah `outlets.status` menjadi `active`, yang dapat menyebabkan ambiguitas bisnis antara outlet trial dan outlet aktif berbayar.
7. Command `features:check-expiry` hanya mengubah trial expired, tetapi tidak mengubah `outlets.status` kembali ke `inactive`.

---

## 2. Keputusan Desain

| # | Topik | Keputusan |
|---|-------|-----------|
| 1 | Sumber durasi trial | Kolom `features.trial_duration_days` ditambah via migration baru |
| 2 | Route frontend start trial | Gunakan `outlets.features.trial` (sudah aktif). Hapus referensi ke `outlets.start-trial` di `Activate.tsx` |
| 3 | Format payload `activationStatus` | Selaraskan ke **camelCase** (`trialRemainingDays`, `trialExpiresAt`) di semua tempat |
| 4 | `outlets.status` selama trial | **Tidak** diubah menjadi `active` saat trial dimulai. `outlets.status` tetap `inactive`. Akses ditentukan oleh `outlet_features.status` |
| 5 | Tampilan sisa hari trial | Pembulatan ke bawah (`diffInDays`). Jika < 1 hari, tampilkan label `< 1 Hari` |
| 6 | Validasi `featureId` di controller | Controller memvalidasi bahwa `featureId` yang diterima adalah fitur `outlet_activation` |
| 7 | `trialStartedAt` di resource | Tambahkan `trialStartedAt` ke `activationStatus` agar frontend bisa menampilkan kapan trial dimulai |
| 8 | `trialEligible` di resource | Tambahkan `trialEligible` dan `trialEligibilityMessage` ke `activationStatus` |

---

## 3. Perubahan yang Diperlukan

---

### Layer 1: Database

#### [NEW] Migration — Tambah `trial_duration_days` ke tabel `features`

**File:** `database/migrations/YYYY_MM_DD_000001_add_trial_duration_days_to_features_table.php`

```php
Schema::table('features', function (Blueprint $table) {
    $table->unsignedInteger('trial_duration_days')->default(0)->after('duration_days');
});
```

> **Catatan:** Default `0` berarti fitur tidak memiliki trial. Hanya `outlet_activation` yang akan diset ke `14`.

---

### Layer 2: Model

#### [MODIFY] `app/Models/Feature.php`

**Perubahan:**
- Tambah `'trial_duration_days'` ke `$fillable`.
- Tambah cast `'trial_duration_days' => 'integer'` ke method `casts()`.

```php
// $fillable — tambahkan:
'trial_duration_days',

// casts() — tambahkan:
'trial_duration_days' => 'integer',
```

---

### Layer 3: Seeder

#### [MODIFY] `database/seeders/FeatureSeeder.php`

**Perubahan:** Tambah `'trial_duration_days' => 14` pada entry `outlet_activation`. Semua fitur lain memakai default `0` (tidak ada trial).

```php
[
    'key'                => 'outlet_activation',
    'name'               => 'Aktivasi Outlet',
    'description'        => 'Aktifkan outlet Anda untuk mulai menggunakan layanan WashWallet secara penuh.',
    'coin_price'         => 500,
    'duration_days'      => 0,
    'trial_duration_days'=> 14,   // ← TAMBAH INI
    'is_paid'            => true,
    'is_active'          => true,
    'sort_order'         => 0,
],
```

---

### Layer 4: Service

#### [MODIFY] `app/Services/OutletFeatureService::startTrial()`

**Masalah saat ini:** Method mengubah `outlets.status` menjadi `active`, sehingga outlet trial tidak dapat dibedakan dari outlet aktif berbayar.

**Perubahan:**
1. **Hapus** baris `$this->outlet->findOrFail($outletId)->update(['status' => 'active']);`
2. Akses trial ditentukan **hanya** melalui `outlet_features.status = trial` dan `hasActiveAccess()`.

```php
public function startTrial(int $outletId): OutletFeature
{
    return DB::transaction(function () use ($outletId) {
        $trialEligibility = $this->getTrialEligibility($outletId);
        if (!$trialEligibility['eligible']) {
            throw ValidationException::withMessages([
                'trial' => [$trialEligibility['message']],
            ]);
        }

        $feature = $this->feature->byKey('outlet_activation')->firstOrFail();
        $currentStatus = $this->outletFeature->byOutletId($outletId)
            ->byFeatureId($feature->id)
            ->first();

        $trialStart  = now();
        $trialExpiry = $trialStart->copy()->addDays((int) $feature->trial_duration_days);

        return $this->outletFeature->updateOrCreate(
            ['outlet_id' => $outletId, 'feature_id' => $feature->id],
            [
                'status'           => OutletFeature::STATUS_TRIAL,
                'trial_started_at' => $trialStart,
                'trial_expires_at' => $trialExpiry,
                'unlocked_at'      => $trialStart,
                'expires_at'       => $trialExpiry,
                'coin_spent'       => $currentStatus?->coin_spent ?? 0,
            ]
        );
        // TIDAK ada update ke outlets.status
    });
}
```

---

### Layer 5: Controller

#### [MODIFY] `app/Http/Controllers/Web/OutletFeatureController::startTrial()`

**Masalah saat ini:** Controller menerima `featureId` tetapi tidak memvalidasinya — service langsung hardcode ke `outlet_activation`.

**Perubahan:** Tambah validasi bahwa `featureId` yang diterima memang fitur `outlet_activation`.

```php
public function startTrial(int $outletId, int $featureId): RedirectResponse
{
    try {
        // Validasi featureId adalah outlet_activation
        $feature = Feature::byKey('outlet_activation')->firstOrFail();
        if ($feature->id !== $featureId) {
            return back()->with('error', 'Trial hanya tersedia untuk fitur aktivasi outlet.');
        }

        $this->outletFeatureService->startTrial($outletId);

        return back()->with('success', 'Masa trial berhasil diaktifkan.');
    } catch (Throwable $e) {
        // ... log & return back with error
    }
}
```

---

### Layer 6: Resource

#### [MODIFY] `app/Http/Resources/Outlet/OutletResource.php`

**Masalah saat ini:** `activationStatus` mengirim `trialRemainingDays` tapi tidak mengirim `trialStartedAt`, `trialEligible`, dan `trialEligibilityMessage`.

**Perubahan:** Perluas shape `activationStatus` dengan field tambahan yang dibutuhkan frontend.

```php
'activationStatus' => $this->whenLoaded('outletFeatures', function () {
    $feature = $this->outletFeatures->firstWhere(fn($f) => $f->feature?->key === 'outlet_activation');

    if (!$feature) {
        // Cek eligibility dari service meski belum ada row
        $eligibility = app(OutletFeatureService::class)->getTrialEligibility($this->id);
        return [
            'status'                  => 'inactive',
            'trialStartedAt'          => null,
            'trialExpiresAt'          => null,
            'unlockedAt'              => null,
            'expiresAt'               => null,
            'trialRemainingDays'      => 0,
            'trialEligible'           => $eligibility['eligible'],
            'trialEligibilityCode'    => $eligibility['code'],
            'trialEligibilityMessage' => $eligibility['message'],
            'trialDurationDays'       => $eligibility['trialDurationDays'],
        ];
    }

    $eligibility = app(OutletFeatureService::class)->getTrialEligibility($this->id);

    return [
        'status'                  => (string) $feature->status,
        'trialStartedAt'          => $feature->trial_started_at?->toISOString(),
        'trialExpiresAt'          => $feature->trial_expires_at?->toISOString(),
        'unlockedAt'              => $feature->unlocked_at?->toISOString(),
        'expiresAt'               => $feature->expires_at?->toISOString(),
        'trialRemainingDays'      => (int) $feature->getTrialRemainingDays(),
        'trialEligible'           => $eligibility['eligible'],
        'trialEligibilityCode'    => $eligibility['code'],
        'trialEligibilityMessage' => $eligibility['message'],
        'trialDurationDays'       => $eligibility['trialDurationDays'],
    ];
}),
```

> **Catatan:** Pertimbangkan meng-inject `OutletFeatureService` ke resource untuk menghindari `app()` manual, atau pisahkan eligibility menjadi prop terpisah pada page controller yang membutuhkannya.

---

### Layer 7: Console Command

#### [MODIFY] `app/Console/Commands/CheckFeatureExpiry.php`

**Masalah saat ini:** Command mengubah trial expired menjadi `expired`, tetapi tidak mengubah `outlets.status` kembali — sebelumnya `startTrial()` memaksa `outlets.status = active`, sehingga outlet yang sudah expired trial-nya masih punya `status = active`.

**Setelah perbaikan `startTrial()`** (yang tidak lagi mengubah `outlets.status`), command ini tidak perlu mengubah `outlets.status`. Cukup pastikan command mengubah status fitur trial yang kedaluwarsa menjadi `expired` — yang sudah benar.

**Tidak ada perubahan tambahan** selain memastikan query sudah mencakup trial:

```php
// Sudah ada di baris 44-47 — verifikasi tetap ada:
$expiredTrialCount = OutletFeature::where('status', OutletFeature::STATUS_TRIAL)
    ->whereNotNull('trial_expires_at')
    ->where('trial_expires_at', '<', now())
    ->update(['status' => OutletFeature::STATUS_EXPIRED]);
```

---

### Layer 8: TypeScript Types (Frontend)

#### [MODIFY] `resources/js/Pages/Dashboard/Outlets/types.ts`

**Masalah saat ini:** `OutletActivationOverlayProps.activationStatus` memakai `trial_remaining` dan `trial_expires_at` (snake_case). Perlu diselaraskan ke camelCase.

**Perubahan:** Ganti shape `activationStatus` pada `OutletActivationOverlayProps`:

```typescript
// SEBELUM (snake_case, tidak konsisten):
activationStatus: {
    status: "inactive" | "trial" | "active" | "expired";
    trial_remaining?: number;
    trial_expires_at?: string;
} | null;

// SESUDAH (camelCase, konsisten dengan resource):
activationStatus: {
    status: "inactive" | "trial" | "active" | "expired";
    trialStartedAt?: string | null;
    trialExpiresAt?: string | null;
    unlockedAt?: string | null;
    expiresAt?: string | null;
    trialRemainingDays: number;
    trialEligible?: boolean;
    trialEligibilityCode?: string | null;
    trialEligibilityMessage?: string | null;
    trialDurationDays?: number;
} | null;
```

Tambahkan juga type `OutletActivationStatus` sebagai standalone untuk reuse:

```typescript
export type OutletActivationStatus = {
    status: "inactive" | "trial" | "active" | "expired";
    trialStartedAt?: string | null;
    trialExpiresAt?: string | null;
    unlockedAt?: string | null;
    expiresAt?: string | null;
    trialRemainingDays: number;
    trialEligible?: boolean;
    trialEligibilityCode?: string | null;
    trialEligibilityMessage?: string | null;
    trialDurationDays?: number;
};
```

Periksa juga `resources/js/types/outlet.ts` — selaraskan shape yang ada di sana dengan format yang sama.

---

### Layer 9: Frontend Components

#### [MODIFY] `resources/js/Pages/Dashboard/Outlets/Partials/OutletActivationOverlay.tsx`

**Masalah saat ini:**
- Baris 69: `activationStatus?.trial_remaining` → field ini tidak ada, harus `trialRemainingDays`.
- Perlu tampilkan tanggal berakhir trial (`trialExpiresAt`).
- Perlu sembunyikan tombol "Coba Gratis 14 Hari" jika `trialEligible === false`.

**Perubahan:**

```tsx
// Ganti:
title: `Masa Trial Aktif - Sisa ${activationStatus?.trial_remaining} Hari`,

// Menjadi:
title: `Masa Trial Aktif - Sisa ${
    activationStatus?.trialRemainingDays === 0
        ? '< 1'
        : activationStatus?.trialRemainingDays
} Hari`,
```

Tambah tampilan tanggal berakhir saat status `trial`:
```tsx
{status === "trial" && activationStatus?.trialExpiresAt && (
    <p className="text-xs text-tertiary mt-1">
        Berakhir pada:{" "}
        {new Date(activationStatus.trialExpiresAt).toLocaleDateString("id-ID", {
            day: "numeric", month: "long", year: "numeric",
        })}
    </p>
)}
```

Sembunyikan tombol trial jika sudah pernah digunakan:
```tsx
// Ganti:
{status === "inactive" && (
    <Button variant="outline" ... onClick={handleTrial}>
        Coba Gratis 14 Hari
    </Button>
)}

// Menjadi:
{status === "inactive" && activationStatus?.trialEligible !== false && (
    <Button variant="outline" ... onClick={handleTrial}>
        Coba Gratis 14 Hari
    </Button>
)}
```

#### [MODIFY] `resources/js/Pages/Dashboard/Outlets/Activate.tsx`

**Masalah saat ini:** Baris 85 memanggil `route("outlets.start-trial", outlet.id)` yang tidak aktif.

**Perubahan:** Ganti dengan route `outlets.features.trial` menggunakan ID fitur dari props.

```tsx
// Perlu tambah activationFeatureCatalog.id ke params:
const handleStartTrial = () => {
    setIsTrialing(true);
    router.post(
        route("outlets.features.trial", [outlet.id, activationFeatureCatalog.id]),
        {},
        { onFinish: () => setIsTrialing(false) },
    );
};
```

> Pastikan `activationFeatureCatalog` memiliki field `id` pada TypeScript type `ActivateProps`.

---

## 4. Urutan Pengerjaan

Kerjakan sesuai urutan dependensi berikut:

```
1. Migration (trial_duration_days)
2. Model Feature (fillable + cast)
3. FeatureSeeder (trial_duration_days = 14)
4. OutletFeatureService::startTrial() (hapus outlets.status update)
5. OutletFeatureController::startTrial() (validasi featureId)
6. OutletResource (peruas activationStatus)
7. TypeScript types (selaraskan ke camelCase)
8. OutletActivationOverlay.tsx (perbaiki field name + logika eligibility)
9. Activate.tsx (ganti route outlets.start-trial)
10. Verifikasi CheckFeatureExpiry command
11. Jalankan test
```

---

## 5. Checklist Sebelum Selesai

### Backend
- [ ] Migration `trial_duration_days` berhasil dijalankan
- [ ] `Feature::$fillable` dan `casts()` sudah mencakup `trial_duration_days`
- [ ] `FeatureSeeder` menyimpan `trial_duration_days = 14` untuk `outlet_activation`
- [ ] `startTrial()` tidak lagi mengubah `outlets.status`
- [ ] `startTrial()` tidak membuat `coin_transactions`
- [ ] `startTrial()` tidak mengubah `outlet_features` fitur `outlet_exposure`
- [ ] `getTrialEligibility()` mengembalikan `eligible: false` jika `trial_duration_days <= 0`
- [ ] `getTrialEligibility()` mengembalikan `eligible: false` jika sudah pernah trial
- [ ] `hasActiveAccess()` pada `OutletFeature` mengembalikan `true` saat `status = trial` dan belum expired
- [ ] `CheckFeatureExpiry` mengubah trial yang `trial_expires_at < now()` menjadi `expired`
- [ ] `OutletResource.activationStatus` mengirim semua field camelCase yang didefinisikan

### Frontend
- [ ] TypeScript type `OutletActivationStatus` sudah camelCase
- [ ] Tidak ada penggunaan `trial_remaining` atau `trial_expires_at` (snake_case) di komponen manapun
- [ ] `OutletActivationOverlay` menampilkan sisa hari dari `trialRemainingDays`
- [ ] `OutletActivationOverlay` menampilkan tanggal berakhir dari `trialExpiresAt`
- [ ] `OutletActivationOverlay` menyembunyikan tombol trial jika `trialEligible === false`
- [ ] `Activate.tsx` memanggil `outlets.features.trial` dengan `[outlet.id, activationFeatureCatalog.id]`
- [ ] Tidak ada referensi ke `outlets.start-trial`

---

## 6. Skenario Test

### Backend (PHPUnit / Feature Test)

| # | Skenario | Ekspektasi |
|---|----------|------------|
| 1 | Owner mulai trial pada outlet inactive yang belum pernah trial | `outlet_features.status = trial`, `trial_started_at` terisi, `trial_expires_at = now() + 14 hari` |
| 2 | Trial tidak mengurangi coin owner | `users.coin_balance` tidak berubah |
| 3 | Trial tidak mengurangi coin outlet | `outlets.coin_balance` tidak berubah |
| 4 | Trial tidak membuat `coin_transactions` | Count `coin_transactions` tidak bertambah |
| 5 | Owner tidak bisa trial kedua pada outlet yang sama | Validasi error: `Trial hanya dapat digunakan satu kali.` |
| 6 | Outlet aktif berbayar tidak bisa trial | Validasi error: `Fitur sudah aktif.` |
| 7 | Fitur tanpa `trial_duration_days` tidak bisa trial | Validasi error: `Fitur ini tidak memiliki masa trial.` |
| 8 | Trial tidak mengaktifkan `outlet_exposure` | Tidak ada baris `outlet_features` dengan key `outlet_exposure` setelah start trial |
| 9 | `outlets.status` tidak berubah saat trial dimulai | `outlets.status` tetap `inactive` |
| 10 | `hasActiveAccess()` = `true` saat status `trial` dan belum expired | Return `true` |
| 11 | `hasActiveAccess()` = `false` saat trial expired | Return `false` |
| 12 | Command `features:check-expiry` mengubah trial expired menjadi `expired` | `outlet_features.status = expired` |
| 13 | Aktivasi berbayar setelah trial expired berhasil | Status menjadi `active`, coin terpotong, `coin_transactions` terbuat |
| 14 | Controller menolak `featureId` bukan `outlet_activation` | Return error |

### Frontend (Manual / Component Test)

| # | Skenario | Ekspektasi |
|---|----------|------------|
| 15 | UI outlet inactive menampilkan tombol trial | Tombol "Coba Gratis 14 Hari" tampil |
| 16 | UI outlet trial aktif menampilkan sisa hari | Label `Sisa X Hari` tampil, tidak `undefined Hari` |
| 17 | UI outlet trial aktif menampilkan tanggal berakhir | Tanggal `trial_expires_at` tampil dalam format lokal |
| 18 | UI outlet expired menampilkan blocking state | Overlay dengan status "Masa Trial Berakhir" |
| 19 | UI outlet yang sudah pernah trial tidak menampilkan tombol trial | Tombol trial tidak ada atau disabled |
| 20 | `Activate.tsx` memanggil route yang benar | Network request ke `outlets.features.trial` |

---

## 7. File yang Dimodifikasi / Dibuat

| Aksi | File |
|------|------|
| **[NEW]** | `database/migrations/YYYY_MM_DD_000001_add_trial_duration_days_to_features_table.php` |
| **[MODIFY]** | `app/Models/Feature.php` |
| **[MODIFY]** | `database/seeders/FeatureSeeder.php` |
| **[MODIFY]** | `app/Services/OutletFeatureService.php` (method `startTrial`) |
| **[MODIFY]** | `app/Http/Controllers/Web/OutletFeatureController.php` (method `startTrial`) |
| **[MODIFY]** | `app/Http/Resources/Outlet/OutletResource.php` (field `activationStatus`) |
| **[VERIFY]** | `app/Console/Commands/CheckFeatureExpiry.php` (pastikan query trial sudah benar) |
| **[MODIFY]** | `resources/js/Pages/Dashboard/Outlets/types.ts` |
| **[MODIFY]** | `resources/js/types/outlet.ts` (jika ada duplikasi type) |
| **[MODIFY]** | `resources/js/Pages/Dashboard/Outlets/Partials/OutletActivationOverlay.tsx` |
| **[MODIFY]** | `resources/js/Pages/Dashboard/Outlets/Activate.tsx` |

---

## 8. Pertanyaan Terbuka (Perlu Dijawab Sebelum / Saat Implementasi)

> [!IMPORTANT]
> Pertanyaan berikut perlu dikonfirmasi ke owner/product sebelum dianggap final.

1. **`outlets.status` selama trial** — Plan ini memutuskan `outlets.status` **tidak** diubah saat trial. Apakah ada bagian lain dari sistem yang saat ini bergantung pada `outlets.status = active` untuk memberi akses operasional (bukan melalui `outlet_features`)?

2. **Suspended outlet** — Apakah outlet dengan `outlets.status = suspended` diizinkan memulai trial? Plan ini tidak membatasi, tetapi bisa ditambah validasi jika perlu.

3. **Employee saat trial expired** — Apakah employee masih bisa login dan melihat outlet, atau seluruh akses diblokir?

4. **Notifikasi sebelum trial habis** — H-3 atau H-1? Di luar scope plan ini, tetapi perlu dipertimbangkan untuk sprint berikutnya.

5. **Live countdown < 24 jam** — Apakah sisa hari perlu tampilkan jam/menit ketika kurang dari 1 hari? Plan ini memutuskan tampilkan `< 1 Hari` sebagai teks statis. Jika perlu live countdown, butuh implementasi tambahan di frontend.

6. **Admin reset trial** — Apakah admin perlu kemampuan reset trial untuk kasus support? Di luar scope plan ini.
