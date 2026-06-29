import 'package:flutter/material.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class WaNotificationMessageCard extends StatelessWidget {
  final WaNotificationPreview preview;

  const WaNotificationMessageCard({super.key, required this.preview});

  @override
  Widget build(BuildContext context) {
    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Pratinjau Pesan',
            style: context.typography.bodySmall.copyWith(
              color: context.colors.textSecondary,
              fontWeight: FontWeight.w600,
            ),
          ),
          SizedBox(height: context.space.sm),
          Text(preview.messagePreview, style: context.typography.bodyMedium),
        ],
      ),
    );
  }
}
