import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../../../../core/utils/currency_formatter.dart';
import '../../domain/entities/discovery_top_service.dart';

class DiscoveryTopServiceCardWidget extends StatelessWidget {
  final DiscoveryTopService service;
  final VoidCallback onTap;

  const DiscoveryTopServiceCardWidget({
    super.key,
    required this.service,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 140,
      child: AppCard.outlined(
        onTap: onTap,
        padding: EdgeInsets.all(context.space.sm),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              height: 56,
              width: double.infinity,
              decoration: BoxDecoration(
                color: context.colors.primary.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(context.radius.md),
              ),
              child: Icon(
                Icons.local_laundry_service_rounded,
                color: context.colors.primary,
              ),
            ),
            SizedBox(height: context.space.sm),
            Text(
              service.name,
              style: context.typography.labelMedium.copyWith(
                fontWeight: FontWeight.w700,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            SizedBox(height: context.space.xxs),
            Text(
              _priceLabel,
              style: context.typography.bodySmall.copyWith(
                color: context.colors.textSecondary,
                fontWeight: FontWeight.w600,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }

  String get _priceLabel {
    final unit = service.unitSymbol?.trim();
    if (unit == null || unit.isEmpty) {
      return 'Mulai ${formatRupiah(service.priceStartsFrom)}';
    }

    return 'Mulai ${formatRupiah(service.priceStartsFrom)}/$unit';
  }
}
