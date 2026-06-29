import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

class OutletOrderButtonWidget extends StatelessWidget {
  final Outlet outlet;
  final VoidCallback? onPressed;
  final bool isLoading;

  const OutletOrderButtonWidget({
    super.key,
    required this.outlet,
    this.onPressed,
    this.isLoading = false,
  });

  @override
  Widget build(BuildContext context) {
    final status = outlet.operationalStatus;
    
    // Fallback if status is not available yet (e.g. older API response)
    if (status == null) {
      return AppButton.primary(
        label: 'Buat Order',
        onPressed: isLoading ? null : onPressed,
        isLoading: isLoading,
      );
    }

    final canOrder = status.canCreateOrderNow;
    
    String buttonLabel = 'Buat Order';
    if (!canOrder) {
      switch (status.operationalStatus) {
        case 'closed':
        case 'closed_today':
          buttonLabel = 'Outlet Sedang Tutup';
          break;
        case 'temporary_closed':
          buttonLabel = 'Tutup Sementara';
          break;
        case 'hours_not_set':
          buttonLabel = 'Order Belum Tersedia';
          break;
        default:
          buttonLabel = 'Tidak Dapat Order';
      }
    }

    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        AppButton.primary(
          label: buttonLabel,
          onPressed: canOrder && !isLoading ? onPressed : null,
          isLoading: isLoading,
        ),
        if (!canOrder && status.orderDisabledReason != null && status.orderDisabledReason!.isNotEmpty)
          Padding(
            padding: EdgeInsets.only(top: context.space.sm),
            child: Text(
              status.orderDisabledReason!,
              style: context.typography.labelSmall.copyWith(
                color: context.colors.error,
              ),
              textAlign: TextAlign.center,
            ),
          ),
      ],
    );
  }
}
