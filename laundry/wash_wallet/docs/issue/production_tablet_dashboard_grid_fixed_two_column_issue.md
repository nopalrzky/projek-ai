# Issue: Grid Ringkasan Dashboard Production Selalu 2 Kolom, Tidak Merespons Breakpoint

Tanggal: 2026-07-02

Dokumen ini adalah hasil review awal untuk masalah layout dashboard tablet Production App. Dokumen ini dibuat sebagai acuan untuk AI model lain saat menyusun implementation plan, bukan sebagai implementasi fix.

## Ringkasan

Kartu ringkasan di dashboard Production (`ProductionSummaryCard`) menampilkan grid statistik (Order Hari Ini, Dalam Proses, Siap Diambil, Selesai) memakai `GridView.count(crossAxisCount: 2)` yang di-hardcode, tidak membaca `WindowSizeClass` sama sekali. Komponen `ResponsiveGrid` yang sudah tersedia di `wash_wallet_ui` (otomatis 2/3/4/6 kolom mengikuti breakpoint) tidak dipakai di sini, sehingga dashboard tetap terlihat 2 kolom baik di tablet kecil maupun tablet/desktop lebar.

## Area yang Direview

- `apps/production/lib/features/home/presentation/widgets/production_summary_card.dart`
- `packages/wash_wallet_ui/lib/src/components/layout/responsive_grid.dart` (komponen yang tersedia tapi tidak dipakai)

## Analisis Teknis

`production_summary_card.dart` baris ~40-47:

```dart
GridView.count(
  shrinkWrap: true,
  physics: const NeverScrollableScrollPhysics(),
  crossAxisCount: 2,   // <-- hardcoded, tidak peduli WindowSizeClass
  mainAxisSpacing: context.space.md,
  crossAxisSpacing: context.space.md,
  childAspectRatio: 1.65,
  children: [
    _SummaryItem(...), // Order Hari Ini
    _SummaryItem(...), // Dalam Proses
    _SummaryItem(...), // Siap Diambil
    _SummaryItem(...), // Selesai
  ],
)
```

Sebagai pembanding, `ResponsiveGrid` (verified, `packages/wash_wallet_ui/lib/src/components/layout/responsive_grid.dart`) sudah punya logic pemetaan breakpoint ke jumlah kolom:

```dart
final sizeClass = AppBreakpoints.of(context);
int crossAxisCount;
switch (sizeClass) {
  case WindowSizeClass.compact:  crossAxisCount = 2; break;
  case WindowSizeClass.medium:   crossAxisCount = 3; break;
  case WindowSizeClass.expanded: crossAxisCount = 4; break;
  case WindowSizeClass.large:    crossAxisCount = 6; break;
}
```

`ProductionSummaryCard` tidak memakai komponen ini — ia membangun `GridView.count` sendiri dengan jumlah kolom tetap.

## Akar Masalah

`ProductionSummaryCard` dibangun sebelum (atau tanpa menyadari) `ResponsiveGrid` tersedia, sehingga menulis grid statis sendiri alih-alih memakai komponen shared yang sudah menangani breakpoint.

## Dampak

1. Di tablet besar (`expanded`/`large`, >=840px), dashboard hanya menampilkan 2 kartu per baris padahal `ResponsiveGrid` akan memberi 4 atau 6 kolom pada breakpoint yang sama — ruang horizontal terbuang percuma.
2. Empat kartu ringkasan pada layar lebar terlihat kosong/renggang secara tidak proporsional dibanding ruang yang tersedia.
3. Tidak konsisten dengan semangat `ResponsiveGrid` yang sudah dibangun sebagai komponen shared untuk kasus persis seperti ini.

## Arah Perbaikan yang Disarankan

1. Ganti `GridView.count(crossAxisCount: 2)` dengan `ResponsiveGrid` yang sudah tersedia, sesuaikan `childAspectRatio`/spacing agar tetap match dengan desain kartu ringkasan yang sudah ada.
2. Jika 4 item saat ini terasa terlalu sedikit untuk mengisi 4-6 kolom secara proporsional di layar besar, pertimbangkan apakah perlu penyesuaian ukuran kartu (mis. `childAspectRatio` berbeda per breakpoint) alih-alih memaksakan jumlah kolom yang sama untuk 4 item saja.
3. Terapkan perubahan ini secara konsisten jika ada tempat lain di Production yang memakai pola grid statis serupa (perlu pengecekan tambahan di luar scope dokumen ini).

## Acceptance Criteria untuk Fix

1. Dashboard Production menampilkan lebih dari 2 kolom kartu ringkasan pada breakpoint `medium` ke atas, mengikuti pola `ResponsiveGrid` yang sudah ada di aplikasi.
2. Tidak ada regresi tampilan pada breakpoint `compact` (mobile) — tetap 2 kolom seperti sebelumnya.
3. Kartu ringkasan tetap proporsional (tidak terlalu gepeng/tinggi) di semua breakpoint setelah perubahan jumlah kolom.
4. Implementasi memakai komponen shared (`ResponsiveGrid`) alih-alih menulis ulang logic breakpoint-ke-kolom secara manual.
