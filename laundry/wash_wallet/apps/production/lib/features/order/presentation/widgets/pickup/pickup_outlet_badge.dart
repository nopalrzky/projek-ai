import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class PickupOutletBadge extends StatelessWidget {
  final String outletName;

  const PickupOutletBadge({super.key, required this.outletName});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: context.space.sm,
        vertical: 2,
      ),
      decoration: BoxDecoration(
        color: context.colors.secondarySurface,
        borderRadius: BorderRadius.circular(context.radius.sm),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.store_outlined,
            size: 12,
            color: context.colors.secondary,
          ),
          SizedBox(width: context.space.xs),
          Text(
            outletName,
            style: context.typography.labelSmall.copyWith(
              color: context.colors.secondary,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}
