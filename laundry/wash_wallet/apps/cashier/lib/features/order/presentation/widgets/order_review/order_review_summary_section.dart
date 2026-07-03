import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

class OrderReviewSummarySection extends StatelessWidget {
  final OrderPriceResult priceResult;

  const OrderReviewSummarySection({super.key, required this.priceResult});

  @override
  Widget build(BuildContext context) {
    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );

    return Container(
      padding: EdgeInsets.all(context.space.md),
      decoration: BoxDecoration(
        color: context.colors.primary.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(context.radius.md),
        border: Border.all(
          color: context.colors.primary.withValues(alpha: 0.2),
        ),
      ),
      child: Column(
        children: [
          _buildSummaryRow(
            context,
            'Subtotal',
            currencyFormat.format(priceResult.subtotal),
          ),
          if (priceResult.hasQuotaDiscount)
            _buildSummaryRow(
              context,
              'Diskon Quota',
              '- ${currencyFormat.format(priceResult.totalQuotaDiscount)}',
              color: Colors.green,
            ),
          if (priceResult.hasMembershipDiscount)
            _buildSummaryRow(
              context,
              'Diskon Member',
              '- ${currencyFormat.format(priceResult.totalMembershipDiscount)}',
              color: Colors.green,
            ),
          const Divider(),
          _buildSummaryRow(
            context,
            'Total Akhir',
            currencyFormat.format(priceResult.total),
            isTotal: true,
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryRow(
    BuildContext context,
    String label,
    String value, {
    bool isTotal = false,
    Color? color,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: isTotal
                ? context.typography.labelMedium.copyWith(
                    fontWeight: FontWeight.bold,
                  )
                : context.typography.bodyMedium.copyWith(color: color),
          ),
          Text(
            value,
            style: isTotal
                ? context.typography.labelMedium.copyWith(
                    fontWeight: FontWeight.bold,
                    color: context.colors.primary,
                  )
                : context.typography.bodyMedium.copyWith(
                    fontWeight: FontWeight.bold,
                    color: color,
                  ),
          ),
        ],
      ),
    );
  }
}
