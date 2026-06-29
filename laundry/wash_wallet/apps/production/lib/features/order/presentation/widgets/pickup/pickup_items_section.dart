import 'package:flutter/material.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class PickupItemsSection extends StatelessWidget {
  final Order order;

  const PickupItemsSection({super.key, required this.order});

  @override
  Widget build(BuildContext context) {
    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Item Pesanan',
            style: context.typography.headlineSmall.copyWith(
              fontWeight: FontWeight.bold,
              color: context.colors.textSecondary,
            ),
          ),
          SizedBox(height: context.space.md),
          Row(
            children: [
              Icon(
                Icons.inventory_2_outlined,
                size: context.space.lg,
                color: context.colors.textSecondary,
              ),
              SizedBox(width: context.space.sm),
              Text(
                '${order.orderItemsCount} Item',
                style: context.typography.bodyMedium.copyWith(
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
