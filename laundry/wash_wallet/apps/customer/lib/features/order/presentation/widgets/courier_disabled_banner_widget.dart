import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class CourierDisabledBannerWidget extends StatelessWidget {
  const CourierDisabledBannerWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: EdgeInsets.only(bottom: context.space.md),
      padding: EdgeInsets.all(context.space.md),
      decoration: BoxDecoration(
        color: context.colors.warning.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(context.radius.lg),
        border: Border.all(
          color: context.colors.warning.withValues(alpha: 0.3),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            Icons.info_outline,
            color: context.colors.warning,
          ),
          SizedBox(width: context.space.sm),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Fitur Kurir Dinonaktifkan',
                  style: context.typography.titleMedium.copyWith(
                    fontWeight: FontWeight.bold,
                    color: context.colors.warning,
                  ),
                ),
                SizedBox(height: context.space.xs),
                Text(
                  'Outlet ini tidak mengaktifkan fitur kurir. Anda hanya dapat menggunakan metode ambil dan antar sendiri.',
                  style: context.typography.bodySmall.copyWith(
                    color: context.colors.textSecondary,
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
