import 'package:flutter/material.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import 'pickup_maps_button.dart';

class PickupAddressSection extends StatelessWidget {
  final Order order;

  const PickupAddressSection({super.key, required this.order});

  @override
  Widget build(BuildContext context) {
    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Alamat Customer',
            style: context.typography.headlineSmall.copyWith(
              fontWeight: FontWeight.bold,
              color: context.colors.textSecondary,
            ),
          ),
          SizedBox(height: context.space.md),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(
                Icons.location_on_outlined,
                size: context.space.lg,
                color: context.colors.textSecondary,
              ),
              SizedBox(width: context.space.sm),
              Expanded(
                child: Text(
                  order.pickupAddress ?? 'Alamat tidak tersedia',
                  style: context.typography.bodyMedium,
                ),
              ),
            ],
          ),
          SizedBox(height: context.space.md),
          PickupMapsButton(
            order: order,
            size: AppButtonSize.md,
            isFullWidth: true,
          ),
        ],
      ),
    );
  }
}
