import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class ServiceInfoCard extends StatelessWidget {
  final String name;
  final String category;
  final String unit;
  final double price;
  final String? description;

  const ServiceInfoCard({
    super.key,
    required this.name,
    required this.category,
    required this.unit,
    required this.price,
    this.description,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: EdgeInsets.all(context.space.md),
      padding: EdgeInsets.all(context.space.md),
      decoration: BoxDecoration(
        color: context.colors.surface,
        borderRadius: BorderRadius.circular(context.radius.md),
        border: Border.all(color: context.colors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: EdgeInsets.all(context.space.sm),
                decoration: BoxDecoration(
                  color: context.colors.primary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(context.radius.sm),
                ),
                child: Icon(
                  Icons.local_laundry_service,
                  color: context.colors.primary,
                  size: 24,
                ),
              ),
              SizedBox(width: context.space.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      name,
                      style: context.typography.labelLarge.copyWith(
                        fontWeight: FontWeight.w600,
                        color: context.colors.textPrimary,
                      ),
                    ),
                    SizedBox(height: context.space.xs),
                    Text(
                      category,
                      style: context.typography.bodySmall.copyWith(
                        color: context.colors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),

          if (description != null && description!.isNotEmpty) ...[
            SizedBox(height: context.space.md),
            Text(
              description!,
              style: context.typography.bodyMedium.copyWith(
                color: context.colors.textSecondary,
              ),
            ),
          ],

          SizedBox(height: context.space.md),

          Container(
            padding: EdgeInsets.all(context.space.sm),
            decoration: BoxDecoration(
              color: context.colors.surface,
              borderRadius: BorderRadius.circular(context.radius.sm),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Harga per $unit',
                  style: context.typography.bodyMedium.copyWith(
                    color: context.colors.textSecondary,
                  ),
                ),
                Text(
                  'Rp ${price.toStringAsFixed(0)}',
                  style: context.typography.labelLarge.copyWith(
                    fontWeight: FontWeight.w600,
                    color: context.colors.primary,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
