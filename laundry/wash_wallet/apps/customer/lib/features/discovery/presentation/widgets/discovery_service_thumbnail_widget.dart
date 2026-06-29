import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class DiscoveryServiceThumbnailWidget extends StatelessWidget {
  final String? categoryName;

  const DiscoveryServiceThumbnailWidget({super.key, this.categoryName});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 64,
      height: 64,
      decoration: BoxDecoration(
        color: context.colors.primary.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(context.radius.lg),
        border: Border.all(
          color: context.colors.primary.withValues(alpha: 0.12),
        ),
      ),
      child: Stack(
        children: [
          Positioned(
            right: -10,
            bottom: -10,
            child: Icon(
              Icons.bubble_chart_rounded,
              color: context.colors.primary.withValues(alpha: 0.10),
              size: 48,
            ),
          ),
          Center(
            child: Icon(
              _iconForCategory,
              color: context.colors.primary,
              size: 30,
            ),
          ),
        ],
      ),
    );
  }

  IconData get _iconForCategory {
    final normalized = categoryName?.toLowerCase() ?? '';
    if (normalized.contains('sepatu')) return Icons.roller_skating_rounded;
    if (normalized.contains('karpet')) return Icons.layers_rounded;
    if (normalized.contains('setrika')) return Icons.iron_rounded;
    return Icons.local_laundry_service_rounded;
  }
}
