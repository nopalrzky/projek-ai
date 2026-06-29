import 'package:flutter/material.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import 'outlet_free_shipping_badge_widget.dart';
import 'outlet_operational_info_widget.dart';
import 'outlet_status_badge_widget.dart';
import 'outlet_weekly_hours_widget.dart';

class OutletInfoDetailsCardWidget extends StatelessWidget {
  final Outlet outlet;

  const OutletInfoDetailsCardWidget({super.key, required this.outlet});

  @override
  Widget build(BuildContext context) {
    return AppCard.outlined(
      margin: EdgeInsets.zero,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: EdgeInsets.all(context.space.md),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    outlet.name,
                    style: context.typography.headlineMedium.copyWith(
                      fontWeight: FontWeight.bold,
                      color: context.colors.textPrimary,
                    ),
                  ),
                ),
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
          ),
          if (outlet.operationalStatus?.operationalStatusMessage != null)
            Padding(
              padding: EdgeInsets.only(
                left: context.space.md,
                right: context.space.md,
                bottom: context.space.md,
              ),
              child: OutletOperationalInfoWidget(
                message: outlet.operationalStatus!.operationalStatusMessage,
              ),
            ),
          if (outlet.hasUnconditionalFreeShipping)
            Padding(
              padding: EdgeInsets.only(
                left: context.space.md,
                right: context.space.md,
                bottom: context.space.md,
              ),
              child: OutletFreeShippingBadgeWidget(
                isVisible: outlet.hasUnconditionalFreeShipping,
              ),
            ),
          const AppDivider.soft(),
          if (outlet.fullAddress != null)
            AppListTile.compact(
              title: outlet.fullAddress!,
              leading: Icon(
                Icons.location_on_outlined,
                size: 20,
                color: context.colors.primary,
              ),
              showDivider:
                  outlet.phone != null ||
                  (outlet.operationalDays != null &&
                      outlet.operationalDays!.isNotEmpty),
            ),
          if (outlet.phone != null)
            AppListTile.compact(
              title: outlet.phone!,
              leading: Icon(
                Icons.phone_outlined,
                size: 20,
                color: context.colors.primary,
              ),
              showDivider: true,
            ),
          if (outlet.operationalStatus?.weeklyHours != null)
            Padding(
              padding: EdgeInsets.all(context.space.md),
              child: Container(
                padding: EdgeInsets.all(context.space.md),
                decoration: BoxDecoration(
                  color: context.colors.surfaceVariant.withValues(alpha: 0.5),
                  borderRadius: BorderRadius.circular(context.radius.md),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(
                          Icons.schedule_outlined,
                          size: 18,
                          color: context.colors.textPrimary,
                        ),
                        SizedBox(width: context.space.sm),
                        Text(
                          'Jam Operasional',
                          style: context.typography.bodyMedium.copyWith(
                            fontWeight: FontWeight.bold,
                            color: context.colors.textPrimary,
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: context.space.sm),
                    OutletWeeklyHoursWidget(
                      weeklyHours: outlet.operationalStatus!.weeklyHours,
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}
