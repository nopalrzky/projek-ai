import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class ProfileWalletCardWidget extends StatelessWidget {
  final CustomerAccount customer;

  const ProfileWalletCardWidget({super.key, required this.customer});

  @override
  Widget build(BuildContext context) {
    final formatter = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );

    return Padding(
      padding: EdgeInsets.symmetric(
        horizontal: context.space.lg,
        vertical: context.space.sm,
      ),
      child: AppCard.filled(
        backgroundColor: context.colors.primarySurface,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    'Saldo Deposit',
                    style: context.typography.bodyMedium.copyWith(
                      color: context.colors.textSecondary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                Icon(
                  Icons.account_balance_wallet_outlined,
                  color: context.colors.primary,
                ),
              ],
            ),
            SizedBox(height: context.space.xs),
            Text(
              formatter.format(customer.depositBalance),
              style: context.typography.headlineMedium.copyWith(
                color: context.colors.textPrimary,
                fontWeight: FontWeight.w800,
              ),
            ),
            SizedBox(height: context.space.md),
            Row(
              children: [
                Expanded(
                  child: AppButton.primary(
                    label: 'Topup',
                    icon: const Icon(Icons.add_rounded),
                    onPressed: () => context.push('/topup/create'),
                  ),
                ),
                SizedBox(width: context.space.sm),
                Expanded(
                  child: AppButton.outline(
                    label: 'Riwayat',
                    icon: const Icon(Icons.history_rounded),
                    onPressed: () => context.push('/topup'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
