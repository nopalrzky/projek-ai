# Issue: Slot `secondaryBody` (Two-Pane) di `OperationalTabletShell` Tidak Pernah Dipakai; Production Tidak Punya Pola Master-Detail untuk Order

Tanggal: 2026-07-02

Dokumen ini adalah hasil review awal untuk kesempatan perbaikan pola tablet pada Production App, dibandingkan dengan pola yang sudah ada di Cashier App. Dokumen ini dibuat sebagai acuan untuk AI model lain saat menyusun implementation plan, bukan sebagai implementasi fix — dan sengaja memuat pertanyaan terbuka (lihat bagian Dampak/Arah Perbaikan) karena ini menyentuh keputusan desain, bukan sekadar bug.

## Ringkasan

`OperationalTabletShell` (komponen shared) sudah menyediakan slot `secondaryBody`/`showSecondaryBody` untuk pola two-pane (list di kiri, panel detail di kanan pada level shell). Setelah ditelusuri, **slot ini ternyata tidak dipakai oleh Production maupun Cashier** — Cashier memang sudah punya tampilan dua-panel di Order & Customer, tapi itu diimplementasikan manual di dalam masing-masing screen (lewat `Row`/`Expanded` sendiri), bukan lewat slot `secondaryBody` milik shell. Production App sama sekali tidak punya pola dua-panel untuk order — detail order selalu berupa dialog modal penuh (`OrderDetailDialog`, lihat issue terpisah soal lebar dialog).

## Area yang Direview

- `packages/wash_wallet_ui/lib/src/components/layout/operational_tablet_shell/operational_tablet_shell.dart` (verified: slot `secondaryBody`/`showSecondaryBody` ada di baris ~38-40 dan ~141-148, tapi tidak ada satu pun caller yang mengisinya)
- `apps/production/lib/core/navigation/production_shell_screen.dart` (verified: memanggil `OperationalTabletShell` tanpa `secondaryBody`)
- `apps/cashier/lib/core/navigation/main_shell_screen.dart` (verified: juga memanggil `OperationalTabletShell` tanpa `secondaryBody`)
- `apps/cashier/lib/features/order/presentation/screens/index_orders_screen.dart`, `apps/cashier/lib/features/customer/presentation/screens/index_customers_screen.dart` (pola two-pane manual di dalam screen, bukan lewat shell)
- `apps/production/lib/features/order/presentation/widgets/order_detail_dialog.dart`, `order_queued_tab.dart`, `order_in_progress_tab.dart` (Production — tidak ada pola dua-panel)

## Analisis Teknis

Slot yang tersedia di shell tapi tidak terpakai:

```dart
// operational_tablet_shell.dart
final Widget? secondaryBody;
final bool showSecondaryBody;

...
Expanded(
  child: Row(
    children: [
      Expanded(child: widget.body),
      if (widget.showSecondaryBody && widget.secondaryBody != null) ...[
        const VerticalDivider(width: 1, thickness: 1),
        SizedBox(
          width: widget.config.secondaryBodyWidth, // 320.0
          child: widget.secondaryBody!,
        ),
      ],
    ],
  ),
),
```

Cashier `MainShellScreen` memanggil shell ini hanya dengan `body: widget.navigationShell` — tidak ada `secondaryBody`. Pola dua-panel yang terlihat di Order/Customer Cashier sebenarnya dibangun independen di dalam `index_orders_screen.dart`/`index_customers_screen.dart` sendiri (`Row(children: [Expanded(flex: 2, child: AppDataView(...)), if (_selectedOrderId != null) Expanded(flex: 1, child: ShowOrderScreen(...))])`), bukan lewat slot shell ini.

Production `ProductionShellScreen` juga memanggil shell yang sama tanpa `secondaryBody`, dan order queue (`order_queued_tab.dart`, `order_in_progress_tab.dart`) tidak punya varian tampilan detail-inline sama sekali — detail order selalu lewat `OrderDetailDialog.show(...)` yang membuka dialog modal.

## Akar Masalah

1. Fitur `secondaryBody` di komponen shared shell adalah kapabilitas yang belum diadopsi oleh siapa pun — bisa jadi memang belum sempat dipakai, atau screen yang butuh pola ini (Order/Customer Cashier) sudah lebih dulu membangun solusinya sendiri secara manual sebelum slot ini ada.
2. Production tidak punya pola master-detail untuk order sama sekali, sehingga workflow tablet-nya (menandai/memproses order) selalu berpindah ke dialog modal, bukan melihat daftar dan detail berdampingan.

## Dampak (termasuk pertanyaan terbuka)

1. Ada duplikasi potensi: dua cara membangun tampilan dua-panel di codebase (slot shell yang belum dipakai vs implementasi manual per-screen di Cashier) — berisiko membingungkan kontributor baru soal mana pola yang "benar" untuk diikuti.
2. Production kehilangan kesempatan pola tablet yang lebih efisien untuk workflow order (melihat daftar dan memproses/melihat detail tanpa modal yang menutup seluruh layar) — lihat juga issue lebar dialog order Production yang menjadi lebih relevan karena dialog adalah satu-satunya cara melihat detail saat ini.
3. **Pertanyaan produk yang belum terjawab dan perlu diputuskan sebelum implementasi:** apakah Production sebaiknya mengadopsi pola dua-panel untuk order (baik lewat slot `secondaryBody` shell, atau pola manual seperti Cashier), atau apakah dialog modal memang pilihan yang disengaja untuk workflow produksi (mis. karena order perlu ditandai/diproses dengan fokus penuh)? Dokumen ini tidak mengasumsikan jawabannya.

## Arah Perbaikan yang Disarankan

1. Jika keputusan produk mengarah ke "ya, Production butuh pola dua-panel untuk order": evaluasi apakah lebih baik memakai slot `secondaryBody` milik shell (supaya konsisten dan dipakai sebagaimana mestinya) dibanding meniru pola manual Cashier — ini akan jadi adopter pertama untuk fitur shell tersebut.
2. Jika keputusan produk mengarah ke "dialog modal memang disengaja": pertimbangkan menghapus/menandai slot `secondaryBody` di shell sebagai belum-terpakai secara eksplisit (atau menghapusnya bila memang tidak relevan) supaya tidak ada dead code yang membingungkan.
3. Terlepas dari arah yang dipilih, selaraskan juga dengan issue lebar dialog Production (`production_tablet_dialog_fixed_pixel_maxwidth_issue.md`) — jika modal tetap dipertahankan, minimal perbaiki lebar dialognya agar layak di semua breakpoint tablet.
4. Jangan mengimplementasikan pola dua-panel di Production secara sepihak tanpa konfirmasi arah produk — dokumentasikan opsi ini sebagai open question ke pemangku kepentingan produk.

## Acceptance Criteria untuk Fix

1. Ada keputusan eksplisit (didokumentasikan) soal apakah Production akan mengadopsi pola dua-panel untuk order atau mempertahankan dialog modal dengan alasan yang jelas.
2. Jika memilih adopsi dua-panel: implementasi konsisten dengan salah satu pola yang sudah ada di codebase (baik slot shell `secondaryBody` atau pola manual Cashier), bukan pola ketiga yang baru tanpa alasan.
3. Jika memilih mempertahankan dialog modal: pastikan setidaknya masalah lebar dialog (issue terpisah) diperbaiki agar pengalamannya tetap layak di semua breakpoint tablet.
4. Tidak ada dead code baru yang ditambahkan (mis. slot shell yang di-extend tapi tetap tidak dipakai di kedua aplikasi).
