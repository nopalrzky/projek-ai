import 'package:flutter/material.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../../../../core/utils/outlet_distance_formatter.dart';
import '../../../../core/widgets/outlet_distance_badge_widget.dart';
import 'outlet_free_shipping_badge_widget.dart';
import 'outlet_status_badge_widget.dart';
import 'outlet_operational_info_widget.dart';

class OutletCard extends StatelessWidget {
  final Outlet outlet;
  final VoidCallback? onTap;

  const OutletCard({super.key, required this.outlet, this.onTap});

  @override
  Widget build(BuildContext context) {
    final showDistance =
        OutletDistanceFormatter.format(outlet.distance) != null;

    return AppCard.elevated(
      onTap: onTap,
      size: AppCardSize.sm,
      child: Row(
        children: [
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: context.colors.primary.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(context.radius.lg),
            ),
            child: Icon(
              Icons.store_rounded,
              size: 40,
              color: context.colors.primary,
            ),
          ),
          SizedBox(width: context.space.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        outlet.name,
                        style: context.typography.headlineLarge.copyWith(
                          fontWeight: FontWeight.bold,
                          color: context.colors.textPrimary,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    SizedBox(width: context.space.xs),
                    if (showDistance) ...[
                      OutletDistanceBadgeWidget(distanceKm: outlet.distance),
                      SizedBox(width: context.space.xs),
                    ],
                    if (outlet.hasUnconditionalFreeShipping) ...[
                      OutletFreeShippingBadgeWidget(
                        isVisible: outlet.hasUnconditionalFreeShipping,
                      ),
                      SizedBox(width: context.space.xs),
                    ],
                    if (outlet.operationalStatus != null)
                      OutletStatusBadgeWidget(
                        operationalStatus:
                            outlet.operationalStatus!.operationalStatus,
                        operationalStatusLabel:
                            outlet.operationalStatus!.operationalStatusLabel,
                      )
                    else if (outlet.isActive)
                      AppBadge.success(label: 'Buka')
                    else
                      AppBadge.neutral(label: 'Tutup'),
                  ],
                ),
                if (outlet.operationalStatus?.operationalStatusMessage !=
                    null) ...[
                  SizedBox(height: context.space.xxs),
                  OutletOperationalInfoWidget(
                    message: outlet.operationalStatus!.operationalStatusMessage,
                  ),
                ],
                SizedBox(height: context.space.xxs),
                Row(
                  children: [
                    Icon(
                      Icons.phone_outlined,
                      size: 14,
                      color: context.colors.textTertiary,
                    ),
                    SizedBox(width: context.space.xxs),
                    Text(
                      outlet.phone ?? '-',
                      style: context.typography.labelSmall.copyWith(
                        color: context.colors.textSecondary,
                      ),
                    ),
                  ],
                ),
                if (outlet.fullAddress != null) ...[
                  SizedBox(height: context.space.xs),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Icon(
                        Icons.location_on_outlined,
                        size: 14,
                        color: context.colors.textTertiary,
                      ),
                      SizedBox(width: context.space.xxs),
                      Expanded(
                        child: Text(
                          outlet.fullAddress!,
                          style: context.typography.labelSmall.copyWith(
                            color: context.colors.textSecondary,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}
