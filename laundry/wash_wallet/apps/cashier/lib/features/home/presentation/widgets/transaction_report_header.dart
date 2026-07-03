import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class TransactionReportHeader extends StatelessWidget {
  const TransactionReportHeader({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: context.space.md),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            'Laporan Transaksi',
            style: context.typography.bodyMedium.copyWith(
              fontWeight: FontWeight.bold,
              color: context.colors.textPrimary,
            ),
          ),
          Icon(
            Icons.info_outline,
            size: 20,
            color: context.colors.textSecondary,
          ),
        ],
      ),
    );
  }
}
