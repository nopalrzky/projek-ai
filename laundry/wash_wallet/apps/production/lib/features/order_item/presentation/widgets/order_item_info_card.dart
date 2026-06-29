import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class OrderItemInfoCard extends StatelessWidget {
  final OrderItem orderItem;

  const OrderItemInfoCard({super.key, required this.orderItem});

  @override
  Widget build(BuildContext context) {
    final formatter = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );

    return Container(
      margin: EdgeInsets.all(context.space.md),
      padding: EdgeInsets.all(context.space.md),
      decoration: BoxDecoration(
        color: context.colors.surface,
        borderRadius: context.radius.all.lg,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.local_laundry_service,
                color: context.colors.primary,
                size: 28,
              ),
              SizedBox(width: context.space.sm),
              Expanded(
                child: Text(
                  orderItem.laundryServiceName ?? '-',
                  style: context.typography.headlineLarge.copyWith(
                    fontWeight: FontWeight.bold,
                    color: context.colors.textPrimary,
                  ),
                ),
              ),
            ],
          ),
          SizedBox(height: context.space.xs),
          Text(
            orderItem.categoryName ?? '-',
            style: context.typography.bodyLarge.copyWith(
              color: context.colors.textSecondary,
            ),
          ),
          SizedBox(height: context.space.md),
          const AppDivider(),
          SizedBox(height: context.space.md),
          _buildInfoRow(
            context,
            'Jumlah',
            '${orderItem.quantity.toInt()} ${orderItem.unitName}',
            Icons.fitness_center,
          ),
          SizedBox(height: context.space.sm),
          _buildInfoRow(
            context,
            'Harga Total',
            formatter.format(orderItem.totalAmount),
            Icons.payments,
          ),
          if (orderItem.itemNotes != null) ...[
            SizedBox(height: context.space.sm),
            _buildInfoRow(context, 'Catatan', orderItem.itemNotes!, Icons.note),
          ],
        ],
      ),
    );
  }

  Widget _buildInfoRow(
    BuildContext context,
    String label,
    String value,
    IconData icon,
  ) {
    return Row(
      children: [
        Icon(icon, size: 18, color: context.colors.textTertiary),
        SizedBox(width: context.space.sm),
        Text(
          '$label: ',
          style: context.typography.bodyMedium.copyWith(
            color: context.colors.textTertiary,
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: context.typography.bodyMedium.copyWith(
              color: context.colors.textPrimary,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ],
    );
  }
}
