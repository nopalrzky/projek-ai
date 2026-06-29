import 'package:flutter/material.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../../screens/pickup_confirmation_screen.dart';

class PickupConfirmButton extends StatelessWidget {
  final Order order;

  const PickupConfirmButton({super.key, required this.order});

  @override
  Widget build(BuildContext context) {
    final status = order.status.toLowerCase();

    if (status == 'picking_up') {
      return AppButton.primary(
        label: 'Konfirmasi Pengambilan',
        isFullWidth: true,
        icon: const Icon(Icons.check_circle_outline),
        onPressed: () =>
            _openConfirmation(context, PickupConfirmationMode.pickup),
      );
    }

    if (status == 'picked_up') {
      return AppButton.primary(
        label: 'Konfirmasi Tiba di Outlet',
        isFullWidth: true,
        icon: const Icon(Icons.store_outlined),
        onPressed: () =>
            _openConfirmation(context, PickupConfirmationMode.arrived),
      );
    }

    return const SizedBox.shrink();
  }

  void _openConfirmation(BuildContext context, PickupConfirmationMode mode) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => PickupConfirmationScreen(order: order, mode: mode),
      ),
    ).then((confirmed) {
      if (confirmed == true && context.mounted) {
        Navigator.pop(context, true);
      }
    });
  }
}
