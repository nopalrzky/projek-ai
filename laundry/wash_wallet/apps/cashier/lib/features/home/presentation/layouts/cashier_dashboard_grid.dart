import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class CashierDashboardGrid extends StatelessWidget {
  const CashierDashboardGrid({
    super.key,
    required this.children,
    this.maxWidth = 1400,
    this.columnGap = 16,
    this.rowGap = 16,
  });

  final List<Widget> children;
  final double maxWidth;
  final double columnGap;
  final double rowGap;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final sizeClass = AppBreakpoints.of(context);

        // Pada phone (compact), tampilkan sebagai single column biasa
        if (sizeClass == WindowSizeClass.compact) {
          return Padding(
            padding: EdgeInsets.all(context.space.md),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                for (int i = 0; i < children.length; i++) ...[
                  children[i],
                  if (i < children.length - 1) SizedBox(height: rowGap),
                ],
              ],
            ),
          );
        }

        // Tentukan jumlah kolom
        int crossAxisCount = 2; // medium / expanded
        if (sizeClass == WindowSizeClass.large) {
          crossAxisCount = 3;
        }

        // Terapkan max width
        return Center(
          child: ConstrainedBox(
            constraints: BoxConstraints(maxWidth: maxWidth),
            child: Padding(
              padding: const EdgeInsets.all(24.0), // Padding luar grid
              child: _buildGrid(crossAxisCount),
            ),
          ),
        );
      },
    );
  }

  Widget _buildGrid(int crossAxisCount) {
    // Kita buat grid manual menggunakan Column dan Row agar tinggi row mengikuti konten
    final List<Widget> rows = [];

    for (int i = 0; i < children.length; i += crossAxisCount) {
      final List<Widget> rowChildren = [];

      for (int j = 0; j < crossAxisCount; j++) {
        final int index = i + j;

        if (index < children.length) {
          rowChildren.add(Expanded(child: children[index]));
        } else {
          // Isi dengan Spacer jika item di baris terakhir kurang dari crossAxisCount
          rowChildren.add(const Spacer());
        }

        // Tambahkan gap antar kolom
        if (j < crossAxisCount - 1) {
          rowChildren.add(SizedBox(width: columnGap));
        }
      }

      rows.add(
        IntrinsicHeight(
          // Agar semua card dalam satu baris punya tinggi yang sama
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: rowChildren,
          ),
        ),
      );

      // Tambahkan gap antar baris
      if (i + crossAxisCount < children.length) {
        rows.add(SizedBox(height: rowGap));
      }
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: rows,
    );
  }
}
