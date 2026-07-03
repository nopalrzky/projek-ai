import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class CategoryServiceCard extends StatelessWidget {
  final LaundryService service;

  const CategoryServiceCard({super.key, required this.service});

  @override
  Widget build(BuildContext context) {
    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );

    return Container(
      padding: EdgeInsets.all(context.space.md),
      decoration: BoxDecoration(
        color: context.colors.background.withValues(alpha: 0.5),
        borderRadius: BorderRadius.circular(context.radius.md),
        border: Border.all(color: context.colors.border.withValues(alpha: 0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            service.name,
                            style: context.typography.bodyLarge.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        if (!service.isActive)
                          Container(
                            margin: EdgeInsets.only(left: context.space.xs),
                            padding: EdgeInsets.symmetric(
                              horizontal: context.space.xs,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: context.colors.disabled.withValues(
                                alpha: 0.15,
                              ),
                              borderRadius: BorderRadius.circular(
                                context.radius.xs,
                              ),
                              border: Border.all(
                                color: context.colors.disabled.withValues(
                                  alpha: 0.3,
                                ),
                              ),
                            ),
                            child: Text(
                              'Non-Aktif',
                              style: context.typography.labelSmall.copyWith(
                                color: context.colors.textSecondary,
                                fontSize: 9,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                      ],
                    ),
                    SizedBox(height: context.space.xs),
                    Text(
                      currencyFormat.format(service.price),
                      style: context.typography.headlineSmall.copyWith(
                        color: context.colors.primary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          SizedBox(height: context.space.sm),
          Wrap(
            spacing: context.space.sm,
            runSpacing: context.space.xs,
            children: [
              _buildChip(
                context,
                icon: Icons.straighten_outlined,
                label: service.unit?.name ?? '-',
                color: context.colors.info,
              ),
              _buildChip(
                context,
                icon: Icons.access_time_outlined,
                label: '${service.durationHours} jam',
                color: context.colors.warning,
              ),
              _buildChip(
                context,
                icon: Icons.shopping_cart_outlined,
                label: 'Min: ${service.minQuantity}',
                color: context.colors.success,
              ),
            ],
          ),
          if (service.description != null &&
              service.description!.isNotEmpty) ...[
            SizedBox(height: context.space.sm),
            Text(
              service.description!,
              style: context.typography.bodySmall.copyWith(
                color: context.colors.textSecondary,
                height: 1.4,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildChip(
    BuildContext context, {
    required IconData icon,
    required String label,
    required Color color,
  }) {
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: context.space.sm,
        vertical: context.space.xs,
      ),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(context.radius.sm),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          SizedBox(width: context.space.xs),
          Text(
            label,
            style: context.typography.labelSmall.copyWith(
              color: color,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}
