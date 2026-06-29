import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class WalletBalanceSummaryWidget extends StatelessWidget {
  final double balance;
  final double totalAmount;
  final NumberFormat formatter;

  const WalletBalanceSummaryWidget({
    super.key,
    required this.balance,
    required this.totalAmount,
    required this.formatter,
  });

  @override
  Widget build(BuildContext context) {
    final isSufficient = balance >= totalAmount;
    final backgroundColor = isSufficient
        ? context.colors.successSurface
        : context.colors.errorSurface;
    final textColor = isSufficient
        ? context.colors.success
        : context.colors.error;

    return Container(
      padding: EdgeInsets.all(context.space.md),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(context.radius.md),
        border: Border.all(
          color: textColor.withValues(alpha: 0.3),
        ),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Icon(
                    Icons.account_balance_wallet,
                    color: textColor,
                  ),
                  SizedBox(width: context.space.sm),
                  Text(
                    'Saldo Wallet Anda',
                    style: context.typography.bodyMedium.copyWith(
                      color: context.colors.textPrimary,
                    ),
                  ),
                ],
              ),
              Text(
                formatter.format(balance),
                style: context.typography.headlineSmall.copyWith(
                  fontWeight: FontWeight.bold,
                  color: context.colors.textPrimary,
                ),
              ),
            ],
          ),
          Divider(height: context.space.lg),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Total Tagihan',
                style: context.typography.bodyMedium.copyWith(
                  color: context.colors.textSecondary,
                ),
              ),
              Text(
                formatter.format(totalAmount),
                style: context.typography.bodyMedium.copyWith(
                  color: context.colors.textSecondary,
                ),
              ),
            ],
          ),
          SizedBox(height: context.space.sm),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              Icon(
                isSufficient ? Icons.check_circle : Icons.error,
                color: textColor,
                size: 16,
              ),
              SizedBox(width: context.space.xs),
              Text(
                isSufficient ? 'Saldo Cukup' : 'Saldo Kurang',
                style: context.typography.bodySmall.copyWith(
                  color: textColor,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
