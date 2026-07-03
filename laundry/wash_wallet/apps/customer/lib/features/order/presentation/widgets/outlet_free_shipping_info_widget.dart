import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class OutletFreeShippingInfoWidget extends StatelessWidget {
  final bool isVisible;

  const OutletFreeShippingInfoWidget({super.key, required this.isVisible});

  @override
  Widget build(BuildContext context) {
    if (!isVisible) {
      return const SizedBox.shrink();
    }

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: context.space.md,
        vertical: context.space.sm,
      ),
      decoration: BoxDecoration(
        color: context.colors.successSurface,
        border: Border.all(color: context.colors.success.withValues(alpha: 0.3)),
        borderRadius: BorderRadius.circular(context.radius.md),
      ),
      child: Row(
        children: [
          Icon(
            Icons.local_shipping_outlined,
            color: context.colors.success,
            size: 20,
          ),
          SizedBox(width: context.space.sm),
          Expanded(
            child: Text(
              'Outlet ini menanggung ongkir untuk semua order kurir',
              style: context.typography.bodySmall.copyWith(
                color: context.colors.success,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
