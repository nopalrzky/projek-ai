import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../../../../core/widgets/outlet_distance_badge_widget.dart';
import '../../domain/entities/discovery_outlet.dart';

class DiscoveryOutletInfoWidget extends StatelessWidget {
  final DiscoveryOutlet outlet;
  final VoidCallback onTap;

  const DiscoveryOutletInfoWidget({
    super.key,
    required this.outlet,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(context.radius.md),
        child: Padding(
          padding: EdgeInsets.all(context.space.xs),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _OutletAvatar(outlet: outlet),
              SizedBox(width: context.space.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      outlet.name,
                      style: context.typography.headlineSmall.copyWith(
                        color: context.colors.textPrimary,
                        fontWeight: FontWeight.w800,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    SizedBox(height: context.space.xs),
                    Text(
                      outlet.shortAddress ?? outlet.fullAddress ?? '-',
                      style: context.typography.bodySmall.copyWith(
                        color: context.colors.textSecondary,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    SizedBox(height: context.space.sm),
                    Wrap(
                      spacing: context.space.xs,
                      runSpacing: context.space.xs,
                      children: [
                        if (outlet.averageRating != null) _RatingMeta(outlet),
                        OutletDistanceBadgeWidget(
                          distanceKm: outlet.distanceKm,
                        ),
                        outlet.isCurrentlyOpen
                            ? const AppBadge.success(
                                label: 'Buka',
                                size: AppBadgeSize.sm,
                              )
                            : const AppBadge.neutral(
                                label: 'Tutup',
                                size: AppBadgeSize.sm,
                              ),
                        if (outlet.isCourierEnabled)
                          const AppBadge.info(
                            label: 'Pickup/delivery',
                            size: AppBadgeSize.sm,
                          ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _OutletAvatar extends StatelessWidget {
  final DiscoveryOutlet outlet;

  const _OutletAvatar({required this.outlet});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 56,
      height: 56,
      decoration: BoxDecoration(
        color: context.colors.primary.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(context.radius.lg),
      ),
      child: Icon(Icons.storefront_rounded, color: context.colors.primary),
    );
  }
}

class _RatingMeta extends StatelessWidget {
  final DiscoveryOutlet outlet;

  const _RatingMeta(this.outlet);

  @override
  Widget build(BuildContext context) {
    final reviews = outlet.reviewsCount ?? 0;
    return AppBadge.soft(
      label: '${outlet.averageRating!.toStringAsFixed(1)} ($reviews review)',
      icon: Icons.star_rounded,
      size: AppBadgeSize.sm,
    );
  }
}
