import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class DiscoverySearchTypoEmptyStateWidget extends StatelessWidget {
  final String query;
  final VoidCallback onClear;

  const DiscoverySearchTypoEmptyStateWidget({
    super.key,
    required this.query,
    required this.onClear,
  });

  @override
  Widget build(BuildContext context) {
    return AppEmptyState.search(
      icon: Icons.search_off_rounded,
      title: 'Tidak Ada Hasil untuk "$query"',
      description: 'Coba perbaiki ejaan atau gunakan kata lain.',
      action: AppButton.outline(label: 'Hapus Pencarian', onPressed: onClear),
    );
  }
}
