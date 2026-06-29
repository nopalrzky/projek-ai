import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class PriceSummaryCard extends StatelessWidget {
  final double quantity;
  final String unitName;
  final double unitPrice;
  final double subtotal;

  const PriceSummaryCard({
    super.key,
    required this.quantity,
    required this.unitName,
    required this.unitPrice,
    required this.subtotal,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: EdgeInsets.all(context.space.md),
      padding: EdgeInsets.all(context.space.md),
      decoration: BoxDecoration(
        color: context.colors.primary.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(context.radius.md),
        border: Border.all(color: context.colors.primary.withValues(alpha: 0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Ringkasan Harga',
            style: context.typography.labelMedium.copyWith(
              fontWeight: FontWeight.w600,
              color: context.colors.textPrimary,
            ),
          ),

          SizedBox(height: context.space.md),

          _buildRow(
            context,
            label: 'Jumlah',
            value: '${quantity.toStringAsFixed(2)} $unitName',
          ),

          SizedBox(height: context.space.sm),

          _buildRow(
            context,
            label: 'Harga per $unitName',
            value: 'Rp ${unitPrice.toStringAsFixed(0)}',
          ),

          Divider(height: context.space.lg),

          _buildRow(
            context,
            label: 'Subtotal',
            value: 'Rp ${subtotal.toStringAsFixed(0)}',
            isBold: true,
            valueColor: context.colors.primary,
          ),
        ],
      ),
    );
  }

  Widget _buildRow(
    BuildContext context, {
    required String label,
    required String value,
    bool isBold = false,
    Color? valueColor,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: context.typography.bodyMedium.copyWith(
            color: context.colors.textSecondary,
            fontWeight: isBold ? FontWeight.w600 : FontWeight.normal,
          ),
        ),
        Text(
          value,
          style: context.typography.bodyMedium.copyWith(
            color: valueColor ?? context.colors.textPrimary,
            fontWeight: isBold ? FontWeight.w600 : FontWeight.normal,
          ),
        ),
      ],
    );
  }
}

