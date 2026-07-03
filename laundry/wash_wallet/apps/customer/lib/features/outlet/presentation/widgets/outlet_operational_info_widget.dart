import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class OutletOperationalInfoWidget extends StatelessWidget {
  final String? message;

  const OutletOperationalInfoWidget({super.key, this.message});

  @override
  Widget build(BuildContext context) {
    if (message == null || message!.isEmpty) {
      return const SizedBox.shrink();
    }

    return Row(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Icon(
          Icons.access_time_rounded,
          size: 14,
          color: context.colors.textSecondary,
        ),
        SizedBox(width: context.space.xs),
        Flexible(
          child: Text(
            message!,
            style: context.typography.labelSmall.copyWith(
              color: context.colors.textSecondary,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }
}
