import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class DiscoveryTypoCorrectionBannerWidget extends StatelessWidget {
  final String correctedQuery;
  final VoidCallback? onTap;

  const DiscoveryTypoCorrectionBannerWidget({
    super.key,
    required this.correctedQuery,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return AppCard.filled(
      onTap: onTap,
      size: AppCardSize.sm,
      backgroundColor: context.colors.infoSurface,
      child: Row(
        children: [
          Icon(Icons.auto_fix_high_rounded, color: context.colors.info),
          SizedBox(width: context.space.sm),
          Expanded(
            child: Text(
              'Menampilkan hasil untuk "$correctedQuery"',
              style: context.typography.bodySmall.copyWith(
                color: context.colors.infoDark,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
