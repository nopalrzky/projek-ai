import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../../../../core/utils/currency_formatter.dart';
import '../../domain/entities/discovery_service.dart';
import 'discovery_service_offer_strip_widget.dart';
import 'discovery_service_outlet_info_widget.dart';

class DiscoveryServiceCardWidget extends StatelessWidget {
  final DiscoveryService service;
  final VoidCallback? onTap;

  const DiscoveryServiceCardWidget({
    super.key,
    required this.service,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return AppCard.outlined(
      onTap: onTap,
      size: AppCardSize.sm,
      borderColor: context.colors.border.withValues(alpha: 0.8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(width: context.space.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (service.categoryName != null) ...[
                  Text(
                    service.categoryName!,
                    style: context.typography.labelSmall.copyWith(
                      color: context.colors.textTertiary,
                      fontWeight: FontWeight.w600,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  SizedBox(height: context.space.xxs),
                ],
                Text(
                  service.name,
                  style: context.typography.titleMedium.copyWith(
                    color: context.colors.textPrimary,
                    fontWeight: FontWeight.w700,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                SizedBox(height: context.space.xxs),
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        '${formatRupiah(service.price)} / ${service.unitName ?? service.unitSymbol ?? 'unit'}',
                        style: context.typography.bodyMedium.copyWith(
                          color: context.colors.primary,
                          fontWeight: FontWeight.w800,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    SizedBox(width: context.space.sm),
                    Text(
                      'Pilih outlet',
                      style: context.typography.labelSmall.copyWith(
                        color: context.colors.primary,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
                SizedBox(height: context.space.sm),
                DiscoveryServiceOutletInfoWidget(
                  outletName: service.outletName,
                  distance: service.outletDistance,
                  isOpen: service.outletIsCurrentlyOpen,
                ),
                SizedBox(height: context.space.sm),
                DiscoveryServiceOfferStripWidget(service: service),
              ],
            ),
          ),
          Icon(Icons.chevron_right_rounded, color: context.colors.textTertiary),
        ],
      ),
    );
  }
}
