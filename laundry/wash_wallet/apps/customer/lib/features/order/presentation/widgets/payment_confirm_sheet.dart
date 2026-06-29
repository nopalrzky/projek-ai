import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class PaymentConfirmSheet extends StatelessWidget {
  final String paymentMethod;
  final double totalAmount;
  final double balance;
  final NumberFormat formatter;
  final VoidCallback onConfirm;

  const PaymentConfirmSheet({
    super.key,
    required this.paymentMethod,
    required this.totalAmount,
    required this.balance,
    required this.formatter,
    required this.onConfirm,
  });

  @override
  Widget build(BuildContext context) {
    String message = '';
    String confirmLabel = 'Bayar';
    IconData icon = Icons.payment;

    if (paymentMethod == 'wallet_balance') {
      message =
          'Saldo Wallet Anda akan dipotong sebesar ${formatter.format(totalAmount)}.';
      confirmLabel = 'Bayar dengan Wallet';
      icon = Icons.account_balance_wallet;
    } else if (paymentMethod == 'transfer') {
      message =
          'Anda akan dialihkan ke halaman Midtrans untuk menyelesaikan transfer.';
      confirmLabel = 'Lanjut ke Pembayaran';
      icon = Icons.account_balance;
    } else {
      message =
          'Pesanan akan dicatat sebagai pembayaran offline (Bayar di Kasir).';
      confirmLabel = 'Konfirmasi';
      icon = Icons.point_of_sale;
    }

    return SafeArea(
      child: Padding(
        padding: EdgeInsets.fromLTRB(
          context.space.lg,
          context.space.md,
          context.space.lg,
          context.space.lg,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: context.colors.border,
                  borderRadius: BorderRadius.circular(context.radius.sm),
                ),
              ),
            ),
            SizedBox(height: context.space.md),
            Row(
              children: [
                Icon(
                  icon,
                  color: context.colors.primary,
                  size: 28,
                ),
                SizedBox(width: context.space.sm),
                Text(
                  'Konfirmasi Pembayaran',
                  style: context.typography.headlineSmall.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            SizedBox(height: context.space.md),
            Text(
              message,
              style: context.typography.bodyMedium.copyWith(
                color: context.colors.textSecondary,
              ),
            ),
            SizedBox(height: context.space.lg),
            Container(
              padding: EdgeInsets.all(context.space.md),
              decoration: BoxDecoration(
                color: context.colors.surfaceElevated,
                borderRadius: BorderRadius.circular(context.radius.md),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Total Pembayaran',
                    style: context.typography.bodyMedium.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(
                    formatter.format(totalAmount),
                    style: context.typography.headlineSmall.copyWith(
                      color: context.colors.primary,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
            SizedBox(height: context.space.xl),
            Row(
              children: [
                Expanded(
                  child: AppButton.outline(
                    onPressed: () => Navigator.pop(context),
                    label: 'Batal',
                  ),
                ),
                SizedBox(width: context.space.md),
                Expanded(
                  child: AppButton.primary(
                    onPressed: () {
                      Navigator.pop(context);
                      onConfirm();
                    },
                    label: confirmLabel,
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
