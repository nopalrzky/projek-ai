# Issue: Dialog Production Pakai `maxWidth` Pixel Tetap, Tidak Mengikuti Breakpoint Tablet

Tanggal: 2026-07-02

Dokumen ini adalah hasil review awal untuk masalah layout dialog pada layar tablet Production App. Dokumen ini dibuat sebagai acuan untuk AI model lain saat menyusun implementation plan, bukan sebagai implementasi fix.

## Ringkasan

Tiga dialog/layar modal di Production membatasi lebarnya dengan angka pixel tetap yang tidak berskala mengikuti breakpoint tablet: `OrderDetailDialog` (500px), `LoginScreen` (420px), dan `PinSetupPromptScreen` (480px). Semua sudah diverifikasi langsung. Karena breakpoint tablet mencakup rentang lebar yang jauh (600px hingga >1400px), satu angka tetap membuat dialog terlihat proporsional hanya di satu titik lebar tertentu — cenderung terlalu sempit dibanding ruang kosong di sekitarnya pada tablet `expanded`/`large`.

## Area yang Direview

- `apps/production/lib/features/order/presentation/widgets/order_detail_dialog.dart`
- `apps/production/lib/features/auth/presentation/screens/login_screen.dart`
- `apps/production/lib/features/auth/presentation/screens/pin_setup_prompt_screen.dart`

## Analisis Teknis

`order_detail_dialog.dart` baris ~41-47:

```dart
return Dialog(
  backgroundColor: context.colors.surface,
  insetPadding: EdgeInsets.all(context.space.lg),
  shape: RoundedRectangleBorder(borderRadius: context.radius.all.lg),
  child: ConstrainedBox(
    constraints: const BoxConstraints(maxWidth: 500),
    child: SingleChildScrollView(...),
  ),
);
```

`login_screen.dart` baris ~106-107:

```dart
child: ConstrainedBox(
  constraints: const BoxConstraints(maxWidth: 420),
  child: Column(...),
),
```

`pin_setup_prompt_screen.dart` baris ~17-18:

```dart
child: ContentConstraint(
  maxWidth: 480,
  child: Padding(...),
),
```

Ketiganya memakai angka literal berbeda-beda (500, 420, 480) tanpa keterkaitan satu sama lain maupun dengan `AppBreakpoints` (`compact` 600 / `medium` 840 / `expanded` 1200 / `large` >=1200).

## Akar Masalah

Setiap dialog menentukan lebar maksimumnya sendiri-sendiri dengan angka tetap, tanpa skala berdasarkan breakpoint layar — padahal `ContentConstraint` (dipakai salah satunya) sudah menerima parameter `maxWidth` yang bisa dibuat dinamis.

## Dampak

1. Pada tablet `expanded`/`large` (>=840-1200px+), dialog-dialog ini terlihat kecil terjepit di tengah layar yang jauh lebih lebar, menyisakan ruang kosong besar di kedua sisi.
2. Pada tablet `medium` (600-840px), lebar tetap ini kadang pas-pasan, kadang longgar, tergantung dialog mana — tidak ada rasio yang konsisten antar dialog.
3. Tiga angka berbeda (500, 420, 480) untuk kasus yang secara konsep mirip (dialog/form modal singkat) menunjukkan tidak ada standar bersama, berisiko bertambah jadi angka ke-4, ke-5 di fitur mendatang.

## Arah Perbaikan yang Disarankan

1. Tentukan lebar maksimum dialog berdasarkan `WindowSizeClass`/`AppBreakpoints`, misalnya nilai lebih kecil untuk `medium` dan nilai lebih besar untuk `expanded`/`large`, alih-alih satu angka tetap untuk semua ukuran.
2. Konsolidasikan ketiga dialog ini ke satu pendekatan yang sama (idealnya lewat `ContentConstraint` yang sudah dipakai `PinSetupPromptScreen`, diperluas agar `maxWidth`-nya breakpoint-aware) supaya tidak ada lagi tiga angka literal berbeda untuk kasus yang mirip.
3. Setelah perubahan, cek ulang bahwa konten masing-masing dialog (form login, form PIN, detail order dengan daftar item) tetap terbaca baik di lebar baru yang lebih besar — terutama `OrderDetailDialog` yang berisi daftar item order, bukan cuma form pendek seperti dua lainnya.

## Acceptance Criteria untuk Fix

1. Ketiga dialog (`OrderDetailDialog`, `LoginScreen`, `PinSetupPromptScreen`) memiliki lebar maksimum yang berskala mengikuti breakpoint tablet, bukan lagi satu angka pixel tetap.
2. Tidak ada lagi tiga angka literal berbeda (500/420/480) tanpa keterkaitan — nilai baru berasal dari skala/token yang konsisten.
3. Tampilan dialog tetap proporsional (tidak terlalu sempit maupun terlalu lebar) pada breakpoint `medium`, `expanded`, dan `large`.
4. Tidak ada regresi pada breakpoint `compact` (mobile), yang perilakunya kemungkinan sudah berbeda/tidak terpengaruh oleh `ConstrainedBox` ini.

## Catatan Design System / Anti-Hardcode

Jangan mengganti tiga angka lama dengan tiga angka literal baru yang juga tidak saling terhubung. Nilai lebar dialog per breakpoint sebaiknya didefinisikan sekali (mis. sebagai konstanta/token bersama) dan dipakai ulang oleh ketiga dialog ini maupun dialog serupa yang mungkin ditambahkan di masa depan.
