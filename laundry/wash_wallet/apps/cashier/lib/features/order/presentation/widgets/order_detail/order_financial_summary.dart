import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

class OrderFinancialSummary extends StatelessWidget {
  final Order order;

  const OrderFinancialSummary({super.key, required this.order});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(context.space.md),
      decoration: BoxDecoration(
        color: context.colors.surface,
        borderRadius: BorderRadius.circular(context.radius.md),
        border: Border.all(color: context.colors.outline.withValues(alpha: 0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Title
          Row(
            children: [
              Icon(
                Icons.account_balance_wallet,
                color: context.colors.primary,
                size: 20,
              ),
              SizedBox(width: context.space.sm),
              Text(
                'Payment Summary',
                style: context.typography.headlineMedium.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          SizedBox(height: context.space.md),

          // Subtotal
          _buildRow(context, 'Subtotal', order.formattedSubtotal ?? '-', false),
          SizedBox(height: context.space.sm),

          // Tax
          _buildRow(context, 'Tax', order.formattedTaxAmount ?? '-', false),
          SizedBox(height: context.space.sm),

          if (order.discountAmount > 0) ...[
            _buildRow(
              context,
              'Discount',
              '- ${order.formattedDiscountAmount ?? '-'}',
              false,
              color: Colors.red,
            ),
            SizedBox(height: context.space.sm),
          ],

          Divider(height: context.space.md * 2),

          _buildRow(context, 'Total', order.formattedTotalAmount ?? '-', true),
          SizedBox(height: context.space.md),

          _buildRow(
            context,
            'Paid Amount',
            order.formattedPaidAmount ?? '-',
            false,
            color: Colors.green,
          ),
          SizedBox(height: context.space.sm),

          if (order.remainingAmount > 0) ...[
            _buildRow(
              context,
              'Remaining',
              order.formattedRemainingAmount ?? '-',
              false,
              color: Colors.orange,
            ),
            SizedBox(height: context.space.sm),
          ],
        ],
      ),
    );
  }

  Widget _buildRow(
    BuildContext context,
    String label,
    String value,
    bool isTotal, {
    Color? color,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: isTotal
              ? context.typography.headlineMedium.copyWith(
                  fontWeight: FontWeight.bold,
                )
              : context.typography.bodyMedium.copyWith(
                  color: color ?? Colors.grey[700],
                ),
        ),
        Text(
          value,
          style: isTotal
              ? context.typography.headlineMedium.copyWith(
                  fontWeight: FontWeight.bold,
                  color: context.colors.primary,
                )
              : context.typography.bodyMedium.copyWith(
                  fontWeight: FontWeight.w600,
                  color: color ?? Colors.black87,
                ),
        ),
      ],
    );
  }
}

