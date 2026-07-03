import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class InvoiceAmountRow extends StatelessWidget {
  final String label;
  final num amount;
  final NumberFormat formatter;
  final Color? color;
  final bool isBold;

  const InvoiceAmountRow({
    super.key,
    required this.label,
    required this.amount,
    required this.formatter,
    this.color,
    this.isBold = false,
  });

  @override
  Widget build(BuildContext context) {
    final style = context.typography.bodyMedium.copyWith(
      color: color,
      fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
    );

    return Padding(
      padding: EdgeInsets.only(bottom: context.space.xs),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: style),
          Text(formatter.format(amount), style: style),
        ],
      ),
    );
  }
}
