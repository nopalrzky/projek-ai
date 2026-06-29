import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../../domain/entities/discovery_service.dart';

class DiscoveryServiceBadgesWidget extends StatelessWidget {
  final DiscoveryService service;

  const DiscoveryServiceBadgesWidget({super.key, required this.service});

  @override
  Widget build(BuildContext context) {
    final rating = service.averageRating ?? service.outletAverageRating;
    final reviews = service.reviewsCount ?? service.outletReviewsCount ?? 0;

    return Wrap(
      spacing: context.space.xs,
      runSpacing: context.space.xs,
      children: [
        AppBadge.soft(
          label: service.supportsCourier ? 'Bisa Kurir' : 'Outlet Saja',
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
            label: 'Diskon Ongkir',
            variant: AppBadgeVariant.success,
            icon: Icons.delivery_dining_rounded,
            size: AppBadgeSize.sm,
          ),
        if (rating != null && rating > 0)
          AppBadge.soft(
            label: '${rating.toStringAsFixed(1)} ($reviews)',
            variant: AppBadgeVariant.warning,
            icon: Icons.star_rounded,
            size: AppBadgeSize.sm,
          ),
      ],
    );
  }
}
