import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class LaundryServiceEmptyState extends StatelessWidget {
  final String searchQuery;

  const LaundryServiceEmptyState({super.key, required this.searchQuery});

  @override
  Widget build(BuildContext context) {
    if (searchQuery.isEmpty) {
      return const AppEmptyState(
        icon: Icons.local_laundry_service_rounded,
        title: 'Belum Ada Layanan',
        description: 'Layanan laundry belum tersedia untuk outlet ini.',
      );
    }

    return AppEmptyState(
      icon: Icons.search_off_rounded,
      title: 'Layanan Tidak Ditemukan',
      description:
          'Tidak ada hasil untuk "$searchQuery".\nCoba kata kunci lain.',
    );
  }
}
