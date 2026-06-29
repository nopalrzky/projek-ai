import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class PaymentMethodSummaryWidget extends StatelessWidget {
  final String paymentMethod;

  const PaymentMethodSummaryWidget({super.key, required this.paymentMethod});

  @override
  Widget build(BuildContext context) {
    String title = '';
    String subtitle = '';
    IconData icon = Icons.payment;

    if (paymentMethod == 'wallet_balance') {
      title = 'Saldo Wallet';
      subtitle = 'Membayar menggunakan saldo deposit Anda';
      icon = Icons.account_balance_wallet;
    } else if (paymentMethod == 'transfer') {
      title = 'Transfer Online';
      subtitle = 'Instruksi pembayaran akan tersedia setelah pesanan dibuat';
      icon = Icons.account_balance;
    } else {
      title = 'Bayar di Kasir (COD)';
      subtitle = 'Bayar langsung secara tunai/debit di kasir';
      icon = Icons.point_of_sale;
    }

    return AppCard(
      child: Padding(
        padding: EdgeInsets.all(context.space.md),
        child: Row(
          children: [
            Container(
              padding: EdgeInsets.all(context.space.sm),
              decoration: BoxDecoration(
                color: context.colors.primary.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                icon,
                color: context.colors.primary,
              ),
            ),
            SizedBox(width: context.space.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Metode Pembayaran',
                    style: context.typography.bodySmall.copyWith(
                      color: context.colors.textSecondary,
                    ),
                  ),
                  SizedBox(height: context.space.xs),
                  Text(
                    title,
                    style: context.typography.bodyMedium.copyWith(
                      fontWeight: FontWeight.bold,
                      color: context.colors.textPrimary,
                    ),
                  ),
                  SizedBox(height: context.space.xs),
                  Text(
                    subtitle,
                    style: context.typography.bodySmall.copyWith(
                      color: context.colors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
