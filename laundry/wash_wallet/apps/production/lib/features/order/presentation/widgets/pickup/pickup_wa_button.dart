import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../../../../wa_notification/presentation/widgets/wa_notification_modal.dart';

class PickupWaButton extends StatelessWidget {
  final int orderId;

  const PickupWaButton({super.key, required this.orderId});

  @override
  Widget build(BuildContext context) {
    return AppButton.secondary(
      label: 'Kirim Notif WA',
      isFullWidth: true,
      icon: const Icon(Icons.send_rounded),
      onPressed: () => showWaNotificationModal(context, orderId: orderId),
    );
  }
}
