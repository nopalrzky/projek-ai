import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class GreetingWalletCard extends StatelessWidget {
  final String customerName;
  final String membershipTier;
  final int depositBalance;
  final int coinBalance;
  final VoidCallback? onTopupTap;
  // final VoidCallback? onHistoryTap; // Removed

  const GreetingWalletCard({
    super.key,
    required this.customerName,
    required this.membershipTier,
    required this.depositBalance,
    required this.coinBalance,
    this.onTopupTap,
  });

  @override
  Widget build(BuildContext context) {
    return AppCard.elevated(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Halo, $customerName',
                      style: context.typography.headlineSmall.copyWith(
                        color: context.colors.textPrimary,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    SizedBox(height: context.space.xs),
                    Text(
                      'Selamat datang kembali, laundry kamu siap dipantau.',
                      style: context.typography.bodySmall.copyWith(
                        color: context.colors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
              AppBadge.success(label: membershipTier),
            ],
          ),
          SizedBox(height: context.space.md),
          Divider(color: context.colors.divider, height: context.space.md),
          SizedBox(height: context.space.sm),
          Row(
            children: [
              Expanded(
                child: _WalletMetricTile(
                  title: 'Saldo Deposit',
                  value: _formatRupiah(depositBalance),
                  icon: Icons.account_balance_wallet_outlined,
                  backgroundColor: context.colors.primarySurface,
                  actionLabel: 'Lihat Detail',
                  onActionTap: onTopupTap,
                  onTap: onTopupTap,
                ),
              ),
              SizedBox(width: context.space.sm),
              Expanded(
                child: _WalletMetricTile(
                  title: 'Koin Loyalty',
                  value: _formatCoin(coinBalance),
                  icon: Icons.stars_rounded,
                  backgroundColor: context.colors.warningSurface,
                ),
              ),
            ],
          ),
        ],
      ),
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

  String _formatCoin(int amount) {
    final amountString = amount.toString();
    final buffer = StringBuffer();

    for (var index = 0; index < amountString.length; index++) {
      final reverseIndex = amountString.length - index;
      buffer.write(amountString[index]);
      if (reverseIndex > 1 && reverseIndex % 3 == 1) {
        buffer.write('.');
      }
    }

    return '$buffer koin';
  }
}

class _WalletMetricTile extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color backgroundColor;
  final String? actionLabel;
  final VoidCallback? onActionTap;
  final VoidCallback? onTap;

  const _WalletMetricTile({
    required this.title,
    required this.value,
    required this.icon,
    required this.backgroundColor,
    this.actionLabel,
    this.onActionTap,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(context.radius.md),
        child: DecoratedBox(
          decoration: BoxDecoration(
            color: backgroundColor,
            borderRadius: BorderRadius.circular(context.radius.md),
          ),
          child: Padding(
            padding: EdgeInsets.all(context.space.md),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Icon(
                      icon,
                      color: context.colors.primary,
                      size: context.space.xl,
                    ),
                    if (actionLabel != null)
                      InkWell(
                        onTap: onActionTap,
                        child: Container(
                          padding: EdgeInsets.symmetric(
                            horizontal: context.space.sm,
                            vertical: context.space.xs,
                          ),
                          decoration: BoxDecoration(
                            color: context.colors.primary,
                            borderRadius: BorderRadius.circular(
                              context.radius.sm,
                            ),
                          ),
                          child: Text(
                            actionLabel!,
                            style: context.typography.labelSmall.copyWith(
                              color: Colors.white,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                  ],
                ),
                SizedBox(height: context.space.sm),
                Text(
                  title,
                  style: context.typography.labelSmall.copyWith(
                    color: context.colors.textSecondary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                SizedBox(height: context.space.xs),
                Text(
                  value,
                  style: context.typography.titleMedium.copyWith(
                    color: context.colors.textPrimary,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
