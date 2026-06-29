import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import '../../domain/entities/print_info.dart';

class PrintOrderInfoCard extends StatelessWidget {
  final PrintInfo info;

  const PrintOrderInfoCard({super.key, required this.info});

  @override
  Widget build(BuildContext context) {
    return AppCard.outlined(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            info.outletName,
            style: context.typography.bodyMedium.copyWith(
              fontWeight: FontWeight.bold,
              color: context.colors.textPrimary,
            ),
          ),
          if (info.outletAddress.isNotEmpty) ...[
            SizedBox(height: context.space.xs),
            Text(
              info.outletAddress,
              style: context.typography.bodySmall.copyWith(
                color: context.colors.textSecondary,
              ),
            ),
          ],
          SizedBox(height: context.space.md),
          const AppDivider(),
          SizedBox(height: context.space.md),
          _InfoRow(label: 'No. Order', value: info.orderNumber),
          SizedBox(height: context.space.xs),
          _InfoRow(label: 'Pelanggan', value: info.customerName),
          SizedBox(height: context.space.xs),
          _InfoRow(label: 'Kasir', value: info.cashierName),
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;

  const _InfoRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: context.typography.bodySmall.copyWith(
            color: context.colors.textSecondary,
          ),
        ),
        Flexible(
          child: Text(
            value,
            style: context.typography.bodySmall.copyWith(
              fontWeight: FontWeight.w600,
              color: context.colors.textPrimary,
            ),
            textAlign: TextAlign.right,
          ),
        ),
      ],
    );
  }
}
