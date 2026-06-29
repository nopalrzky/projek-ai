import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class HomeQuickInfoWidget extends StatelessWidget {
  final int depositBalance;
  final int activeOrderCount;
  final VoidCallback onTopupTap;
  final VoidCallback onOrderHistoryTap;

  const HomeQuickInfoWidget({
    super.key,
    required this.depositBalance,
    required this.activeOrderCount,
    required this.onTopupTap,
    required this.onOrderHistoryTap,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: AppCard.filled(
            onTap: onTopupTap,
            child: Row(
              children: [
                Icon(
                  Icons.account_balance_wallet_rounded,
                  color: context.colors.primary,
                ),
                SizedBox(width: context.space.sm),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Saldo Wallet',
                        style: context.typography.labelSmall.copyWith(
                          color: context.colors.textSecondary,
                        ),
                      ),
                      Text(
                        _formatRupiah(depositBalance),
                        style: context.typography.titleMedium.copyWith(
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
        SizedBox(width: context.space.sm),
        Expanded(
          child: AppCard.filled(
            onTap: onOrderHistoryTap,
            child: Row(
              children: [
                Icon(
                  Icons.assignment_rounded,
                  color: context.colors.secondary,
                ),
                SizedBox(width: context.space.sm),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Riwayat Pesanan',
                        style: context.typography.labelSmall.copyWith(
                          color: context.colors.textSecondary,
                        ),
                      ),
                      Text(
                        '$activeOrderCount pesanan aktif',
                        style: context.typography.titleMedium.copyWith(
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  String _formatRupiah(int amount) {
    final amountString = amount.toString();
    final buffer = StringBuffer();

    for (var index = 0; index < amountString.length; index++) {
      final reverseIndex = amountString.length - index;
      buffer.write(amountString[index]);
      if (reverseIndex > 1 && reverseIndex % 3 == 1) {
        buffer.write('.');
      }
    }

    return 'Rp $buffer';
  }
}
