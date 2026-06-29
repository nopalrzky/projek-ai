import 'package:flutter/material.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class PickupOutletSection extends StatelessWidget {
  final Order order;

  const PickupOutletSection({super.key, required this.order});

  @override
  Widget build(BuildContext context) {
    final outlet = order.outlet;
    if (outlet == null) return const SizedBox.shrink();

    return AppCard(
      child: Row(
        children: [
          Icon(Icons.store_outlined, color: context.colors.textSecondary),
          SizedBox(width: context.space.sm),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Outlet',
                  style: context.typography.bodySmall.copyWith(
                    color: context.colors.textSecondary,
                  ),
                ),
                SizedBox(height: context.space.xs),
                Text(
                  outlet.name,
                  style: context.typography.bodyMedium.copyWith(
                    fontWeight: FontWeight.w600,
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
