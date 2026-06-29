import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class DiscoverySearchEmptyStateWidget extends StatelessWidget {
  final VoidCallback onClear;
  final String? activeQuery;

  const DiscoverySearchEmptyStateWidget({
    super.key,
    required this.onClear,
    this.activeQuery,
  });

  @override
  Widget build(BuildContext context) {
    final hasQuery = activeQuery != null && activeQuery!.trim().isNotEmpty;
    final query = activeQuery?.trim() ?? '';

    return AppEmptyState.search(
      title: 'Layanan Tidak Ditemukan',
      description: hasQuery
          ? 'Tidak ada layanan untuk "$query". Coba perbaiki ejaan atau ubah filter.'
          : 'Coba ubah keyword, harga, kategori, atau filter outlet.',
      action: AppButton.outline(label: 'Hapus Filter', onPressed: onClear),
    );
  }
}
