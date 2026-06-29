import 'package:flutter/material.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../../../../core/utils/outlet_distance_formatter.dart';
import 'outlet_free_shipping_badge_widget.dart';
import 'outlet_status_badge_widget.dart';
import 'outlet_operational_info_widget.dart';

class OutletBannerHeader extends StatelessWidget {
  final Outlet outlet;
  final VoidCallback onTap;

  const OutletBannerHeader({
    super.key,
    required this.outlet,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: EdgeInsets.symmetric(
          horizontal: context.space.lg,
          vertical: context.space.md,
        ),
        padding: EdgeInsets.all(context.space.md),
        decoration: BoxDecoration(
          color: context.colors.surface,
          borderRadius: BorderRadius.circular(context.radius.lg),
          border: Border.all(
            color: context.colors.border.withValues(alpha: 0.5),
          ),
          boxShadow: [
            BoxShadow(
              color: context.colors.textPrimary.withValues(alpha: 0.04),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          outlet.name,
                          style: context.typography.headlineMedium.copyWith(
                            fontWeight: FontWeight.bold,
                            color: context.colors.textPrimary,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      Icon(
                        Icons.chevron_right_rounded,
                        color: context.colors.textTertiary,
                      ),
                    ],
                  ),
                  SizedBox(height: context.space.xs),
                  Row(
                    children: [
                      const Icon(
                        Icons.star_rounded,
                        color: Colors.amber,
                        size: 18,
                      ),
                      SizedBox(width: context.space.xxs),
                      Text(
                        (outlet.averageRating ?? 0) > 0
                            ? (outlet.averageRating ?? 0.0).toStringAsFixed(1)
                            : '-',
                        style: context.typography.bodyMedium.copyWith(
                          fontWeight: FontWeight.bold,
                          color: context.colors.textPrimary,
                        ),
                      ),
                      if ((outlet.reviewsCount ?? 0) > 0) ...[
                        SizedBox(width: context.space.xxs),
                        Text(
                          '(${outlet.reviewsCount} ulasan)',
                          style: context.typography.labelSmall.copyWith(
                            color: context.colors.textSecondary,
                          ),
                        ),
                      ],
                      SizedBox(width: context.space.sm),
                      Container(
                        width: 4,
                        height: 4,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: context.colors.textTertiary,
                        ),
                      ),
                      SizedBox(width: context.space.sm),
                      _DistanceMeta(distanceKm: outlet.distance),
                      if (outlet.operationalStatus != null)
                        OutletStatusBadgeWidget(
                          operationalStatus:
                              outlet.operationalStatus!.operationalStatus,
                          operationalStatusLabel:
                              outlet.operationalStatus!.operationalStatusLabel,
                        )
                      else if (outlet.isActive)
                        AppBadge.success(
                          label: 'Buka',
                          size: AppBadgeSize.sm,
                          mode: AppBadgeMode.soft,
                        )
                      else
                        AppBadge.neutral(
                          label: 'Tutup',
                          size: AppBadgeSize.sm,
                          mode: AppBadgeMode.soft,
                        ),
                    ],
                  ),
                  if (outlet.operationalStatus?.operationalStatusMessage !=
                      null) ...[
                    SizedBox(height: context.space.xs),
                    OutletOperationalInfoWidget(
                      message:
                          outlet.operationalStatus!.operationalStatusMessage,
                    ),
                  ],
                  if (outlet.hasUnconditionalFreeShipping) ...[
                    SizedBox(height: context.space.sm),
                    OutletFreeShippingBadgeWidget(
                      isVisible: outlet.hasUnconditionalFreeShipping,
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _DistanceMeta extends StatelessWidget {
  final double? distanceKm;

  const _DistanceMeta({this.distanceKm});

  @override
  Widget build(BuildContext context) {
    final label = OutletDistanceFormatter.format(distanceKm);
    if (label == null) return const SizedBox.shrink();

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          label,
          style: context.typography.bodyMedium.copyWith(
            color: context.colors.textPrimary,
          ),
        ),
        SizedBox(width: context.space.sm),
        Container(
          width: 4,
          height: 4,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: context.colors.textTertiary,
          ),
        ),
        SizedBox(width: context.space.sm),
      ],
    );
  }
}
