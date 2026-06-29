import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../../domain/entities/discovery_service.dart';

class DiscoveryServiceOfferStripWidget extends StatelessWidget {
  final DiscoveryService service;

  const DiscoveryServiceOfferStripWidget({super.key, required this.service});

  @override
  Widget build(BuildContext context) {
    final rating = service.averageRating ?? service.outletAverageRating;

    return Wrap(
      spacing: context.space.xs,
      runSpacing: context.space.xs,
      children: [
        AppBadge.soft(
          label: service.supportsCourier ? 'Pickup tersedia' : 'Outlet saja',
          variant: service.supportsCourier
              ? AppBadgeVariant.primary
              : AppBadgeVariant.neutral,
          icon: service.supportsCourier
              ? Icons.local_shipping_outlined
              : Icons.store_mall_directory_outlined,
          size: AppBadgeSize.sm,
        ),
        if (service.outletHasUnconditionalFreeShipping)
          const AppBadge.soft(
            label: 'Promo ongkir',
            variant: AppBadgeVariant.success,
            icon: Icons.delivery_dining_rounded,
            size: AppBadgeSize.sm,
          ),
        if (rating != null && rating > 0)
          AppBadge.soft(
            label: rating.toStringAsFixed(1),
            variant: AppBadgeVariant.warning,
            icon: Icons.star_rounded,
            size: AppBadgeSize.sm,
          ),
      ],
    );
  }
}
