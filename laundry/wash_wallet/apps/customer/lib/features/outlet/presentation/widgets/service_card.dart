import 'package:flutter/material.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../../../../core/utils/currency_formatter.dart';
import 'service_non_courier_badge_widget.dart';

class ServiceCard extends StatelessWidget {
  final LaundryService service;
  final VoidCallback onTap;
  final VoidCallback? onRemove;
  final bool isSelected;

  const ServiceCard({
    super.key,
    required this.service,
    required this.onTap,
    this.onRemove,
    this.isSelected = false,
  });

  @override
  Widget build(BuildContext context) {
    return AppCard.elevated(
      onTap: onTap,
      size: AppCardSize.sm,
      isSelected: isSelected,
      child: Row(
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: isSelected
                  ? context.colors.primary.withValues(alpha: 0.12)
                  : context.colors.primary.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(context.radius.md),
            ),
            child: Icon(
              isSelected
                  ? Icons.check_circle_rounded
                  : Icons.local_laundry_service_rounded,
              color: context.colors.primary,
              size: 28,
            ),
          ),
          SizedBox(width: context.space.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  service.name,
                  style: context.typography.titleMedium.copyWith(
                    fontWeight: FontWeight.bold,
                    color: context.colors.textPrimary,
                  ),
                ),
                SizedBox(height: context.space.xxs),
                Text(
                  '${formatRupiah(service.price)} / ${service.unit?.name ?? 'unit'}',
                  style: context.typography.bodyMedium.copyWith(
                    color: context.colors.primary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                if (isSelected) ...[
                  SizedBox(height: context.space.xxs),
                  Text(
                    'Sudah ditambahkan',
                    style: context.typography.labelSmall.copyWith(
                      color: context.colors.primary,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ] else ...[
                  if (!service.supportsCourier) ...[
                    SizedBox(height: context.space.xxs),
                    ServiceNonCourierBadgeWidget(label: service.courierSupportLabel),
                  ],
                  SizedBox(height: context.space.xxs),
                  Wrap(
                    spacing: context.space.sm,
                    runSpacing: context.space.xxs,
                    crossAxisAlignment: WrapCrossAlignment.center,
                    children: [
                      if ((service.averageRating ?? 0) > 0)
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(
                              Icons.star_rounded,
                              size: 14,
                              color: Colors.amber,
                            ),
                            SizedBox(width: context.space.xxs),
                            Text(
                              '${(service.averageRating ?? 0.0).toStringAsFixed(1)} (${service.reviewsCount ?? 0})',
                              style: context.typography.labelSmall.copyWith(
                                color: context.colors.textSecondary,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.access_time_rounded,
                            size: 14,
                            color: context.colors.textTertiary,
                          ),
                          SizedBox(width: context.space.xxs),
                          Text(
                            '±${service.durationHours} jam',
                            style: context.typography.labelSmall.copyWith(
                              color: context.colors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                      if (service.minQuantity > 1)
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              Icons.info_outline_rounded,
                              size: 14,
                              color: context.colors.textTertiary,
                            ),
                            SizedBox(width: context.space.xxs),
                            Text(
                              'Min. ${service.minQuantity} ${service.unit?.name ?? 'unit'}',
                              style: context.typography.labelSmall.copyWith(
                                color: context.colors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                    ],
                  ),
                ],
              ],
            ),
          ),
          if (isSelected)
            IconButton(
              icon: Icon(Icons.delete_outline_rounded, color: context.colors.error),
              onPressed: onRemove,
            )
          else
            Icon(Icons.add_circle_outline_rounded, color: context.colors.primary),
        ],
      ),
    );
  }
}
