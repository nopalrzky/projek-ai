import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:intl/intl.dart';

import '../../domain/entities/home_dashboard.dart';

class PendingPaymentShortcut extends StatelessWidget {
  final RecentOrder pendingOrder;

  const PendingPaymentShortcut({super.key, required this.pendingOrder});

  @override
  Widget build(BuildContext context) {
    final formatter = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );

    return AppCard(
      child: Container(
        padding: EdgeInsets.all(context.space.md),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(context.radius.md),
          gradient: LinearGradient(
            colors: [
              context.colors.primaryLight.withValues(alpha: 0.15),
              context.colors.primaryLight.withValues(alpha: 0.05),
            ],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          border: Border.all(
            color: context.colors.primaryLight.withValues(alpha: 0.5),
            width: 1,
          ),
        ),
        child: Row(
          children: [
            Container(
              padding: EdgeInsets.all(context.space.sm),
              decoration: BoxDecoration(
                color: context.colors.primary.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.receipt_long_rounded,
                color: context.colors.primary,
                size: 28,
              ),
            ),
            SizedBox(width: context.space.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Menunggu Pembayaran',
                    style: context.typography.titleMedium.copyWith(
                      fontWeight: FontWeight.bold,
                      color: context.colors.primaryDark,
                    ),
                  ),
                  SizedBox(height: context.space.xs / 2),
                  Text(
                    'Order ${pendingOrder.orderNumber}',
                    style: context.typography.bodySmall.copyWith(
                      color: context.colors.textSecondary,
                    ),
                  ),
                  SizedBox(height: context.space.xs),
                  Text(
                    formatter.format(pendingOrder.totalAmount),
                    style: context.typography.bodyMedium.copyWith(
                      fontWeight: FontWeight.w600,
                      color: context.colors.textPrimary,
                    ),
                  ),
                ],
              ),
            ),
            SizedBox(width: context.space.sm),
            AppButton.primary(
              onPressed: () =>
                  context.push('/orders/${pendingOrder.id}/invoice'),
              label: 'Bayar',
              size: AppButtonSize.sm,
            ),
          ],
        ),
      ),
    );
  }
}
