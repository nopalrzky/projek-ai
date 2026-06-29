import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../utils/outlet_distance_formatter.dart';

class OutletDistanceBadgeWidget extends StatelessWidget {
  final double? distanceKm;

  const OutletDistanceBadgeWidget({super.key, this.distanceKm});

  @override
  Widget build(BuildContext context) {
    final label = OutletDistanceFormatter.format(distanceKm);
    if (label == null) return const SizedBox.shrink();

    return AppBadge.soft(
      label: label,
      icon: Icons.near_me_rounded,
      size: AppBadgeSize.sm,
    );
  }
}
