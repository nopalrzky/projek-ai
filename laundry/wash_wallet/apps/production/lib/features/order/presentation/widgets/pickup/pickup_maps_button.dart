import 'package:flutter/material.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../../utils/maps_launcher_service.dart';

class PickupMapsButton extends StatelessWidget {
  final Order order;
  final AppButtonSize size;
  final bool isFullWidth;

  const PickupMapsButton({
    super.key,
    required this.order,
    this.size = AppButtonSize.md,
    this.isFullWidth = false,
  });

  @override
  Widget build(BuildContext context) {
    final canOpen = MapsLauncherService.hasNavigationTarget(order);

    if (!canOpen) {
      return AppButton.secondary(
        label: 'Alamat belum tersedia',
        onPressed: null,
        size: size,
        isFullWidth: isFullWidth,
        icon: const Icon(Icons.map_outlined),
      );
    }

    return AppButton.secondary(
      label: 'Buka Maps',
      onPressed: () => _handleOpen(context),
      size: size,
      isFullWidth: isFullWidth,
      icon: const Icon(Icons.navigation_outlined),
    );
  }

  Future<void> _handleOpen(BuildContext context) async {
    final success = await MapsLauncherService.openMaps(order);

    if (!success && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Gagal membuka Maps. Coba lagi nanti.')),
      );
    }
  }
}
