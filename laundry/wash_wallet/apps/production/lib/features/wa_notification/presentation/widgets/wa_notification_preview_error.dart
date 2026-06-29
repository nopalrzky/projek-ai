import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../bloc/wa_notification_cubit.dart';

class WaNotificationPreviewError extends StatelessWidget {
  final String message;
  final int orderId;

  const WaNotificationPreviewError({
    super.key,
    required this.message,
    required this.orderId,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(Icons.error_outline, color: context.colors.error),
        SizedBox(height: context.space.md),
        Text(
          message,
          textAlign: TextAlign.center,
          style: context.typography.bodyMedium,
        ),
        SizedBox(height: context.space.lg),
        AppButton.primary(
          label: 'Coba Lagi',
          icon: const Icon(Icons.refresh_rounded),
          onPressed: () =>
              context.read<WaNotificationCubit>().getPreview(orderId),
        ),
      ],
    );
  }
}
