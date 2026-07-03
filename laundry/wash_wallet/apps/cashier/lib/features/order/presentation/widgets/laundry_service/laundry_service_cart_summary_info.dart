import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class LaundryServiceCartSummaryInfo extends StatelessWidget {
  final int itemCount;
  final double subtotal;
  final double discount;
  final double total;

  const LaundryServiceCartSummaryInfo({
    super.key,
    required this.itemCount,
    required this.subtotal,
    required this.discount,
    required this.total,
  });

  @override
  Widget build(BuildContext context) {
    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );

    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          '$itemCount Layanan',
          style: context.typography.bodySmall.copyWith(
            color: context.colors.textSecondary,
          ),
        ),
        SizedBox(height: context.space.xs),
        Row(
          children: [
            Text(
              currencyFormat.format(total),
              style: context.typography.headlineMedium.copyWith(
                fontWeight: FontWeight.bold,
                color: context.colors.primary,
              ),
            ),
            if (discount > 0) ...[
              SizedBox(width: context.space.sm),
              Container(
                padding: EdgeInsets.symmetric(
                  horizontal: context.space.sm,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: Colors.green.shade50,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.green.shade200),
                ),
                child: Text(
                  'Hemat ${currencyFormat.format(discount)}',
                  style: context.typography.labelSmall.copyWith(
                    color: Colors.green.shade700,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ],
        ),
      ],
    );
  }
}
