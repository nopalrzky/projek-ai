import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../../../../core/utils/outlet_distance_formatter.dart';

class DiscoveryServiceOutletInfoWidget extends StatelessWidget {
  final String outletName;
  final double? distance;
  final bool isOpen;

  const DiscoveryServiceOutletInfoWidget({
    super.key,
    required this.outletName,
    this.distance,
    required this.isOpen,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(
          Icons.storefront_rounded,
          size: 14,
          color: context.colors.textTertiary,
        ),
        SizedBox(width: context.space.xxs),
        Expanded(
          child: Text(
            outletName,
            style: context.typography.labelSmall.copyWith(
              color: context.colors.textSecondary,
              fontWeight: FontWeight.w600,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
        _DistanceLabel(distance: distance),
        SizedBox(width: context.space.xs),
        AppBadge.soft(
          label: isOpen ? 'Buka' : 'Tutup',
          variant: isOpen ? AppBadgeVariant.success : AppBadgeVariant.neutral,
          size: AppBadgeSize.sm,
        ),
      ],
    );
  }
}

class _DistanceLabel extends StatelessWidget {
  final double? distance;

  const _DistanceLabel({this.distance});

  @override
  Widget build(BuildContext context) {
    final label = OutletDistanceFormatter.format(distance);
    if (label == null) return const SizedBox.shrink();

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        SizedBox(width: context.space.xs),
        Text(
          label,
          style: context.typography.labelSmall.copyWith(
            color: context.colors.textTertiary,
          ),
        ),
      ],
    );
  }
}
