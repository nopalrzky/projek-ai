import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class OutletFreeShippingBadgeWidget extends StatelessWidget {
  final bool isVisible;

  const OutletFreeShippingBadgeWidget({super.key, required this.isVisible});

  @override
  Widget build(BuildContext context) {
    if (!isVisible) {
      return const SizedBox.shrink();
    }

    return const AppBadge.success(
      label: 'Gratis Ongkir',
      icon: Icons.local_shipping_outlined,
      size: AppBadgeSize.sm,
      mode: AppBadgeMode.soft,
    );
  }
}
