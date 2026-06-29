import 'package:flutter/material.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class WaNotificationRecipientCard extends StatelessWidget {
  final WaNotificationPreview preview;

  const WaNotificationRecipientCard({super.key, required this.preview});

  @override
  Widget build(BuildContext context) {
    return AppCard(
      child: Row(
        children: [
          Icon(Icons.person_outline, color: context.colors.primary),
          SizedBox(width: context.space.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(preview.customerName, style: context.typography.bodyLarge),
                SizedBox(height: context.space.xs),
                Text(
                  preview.customerPhone ?? 'Nomor WA tidak tersedia',
                  style: context.typography.bodySmall.copyWith(
                    color: preview.hasPhone
                        ? context.colors.textSecondary
                        : context.colors.error,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
