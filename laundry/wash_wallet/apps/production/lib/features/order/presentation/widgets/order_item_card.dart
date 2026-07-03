import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

class OrderItemCard extends StatelessWidget {
  final Order order;
  final VoidCallback? onDetail;
  final VoidCallback? onProcess;
  final bool showProcessButton;

  const OrderItemCard({
    super.key,
    required this.order,
    this.onDetail,
    this.onProcess,
    this.showProcessButton = false,
  });

  @override
  Widget build(BuildContext context) {
    return AppCard.outlined(
      onTap: onDetail,
      child: Padding(
        padding: EdgeInsets.all(context.space.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        order.orderNumber,
                        style: context.typography.headlineMedium.copyWith(
                          fontWeight: FontWeight.bold,
                          color: context.colors.textPrimary,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      SizedBox(height: context.space.xs),
                      Text(
                        'Customer #${order.customerId}',
                        style: context.typography.bodyMedium.copyWith(
                          color: context.colors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
                OrderStatusBadge(status: order.status),
              ],
            ),
            SizedBox(height: context.space.md),
            _buildInfoRow(
              context,
              icon: Icons.shopping_bag_outlined,
              label: '${order.orderItems?.length ?? 0} Item',
            ),
            SizedBox(height: context.space.xs),
            _buildInfoRow(
              context,
              icon: Icons.access_time,
              label: _formatDate(order.orderDate!),
            ),
            if (order.notes != null && order.notes!.isNotEmpty) ...[
              SizedBox(height: context.space.xs),
              _buildInfoRow(
                context,
                icon: Icons.note_outlined,
                label: order.notes!,
              ),
            ],
            SizedBox(height: context.space.md),
            Row(
              children: [
                Expanded(
                  child: Text(
                    _formatCurrency(order.totalAmount),
                    style: context.typography.headlineLarge.copyWith(
                      fontWeight: FontWeight.bold,
                      color: context.colors.primary,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                if (showProcessButton && onProcess != null) ...[
                  SizedBox(width: context.space.sm),
                  AppButton.primary(
                    label: 'Kerjakan',
                    onPressed: onProcess,
                    size: AppButtonSize.sm,
                  ),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(
    BuildContext context, {
    required IconData icon,
    required String label,
  }) {
    return Row(
      children: [
        Icon(icon, size: 16, color: context.colors.textTertiary),
        SizedBox(width: context.space.xs),
        Expanded(
          child: Text(
            label,
            style: context.typography.bodySmall.copyWith(
              color: context.colors.textSecondary,
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inDays == 0) {
      if (difference.inHours == 0) {
        return '${difference.inMinutes} menit lalu';
      }
      return '${difference.inHours} jam lalu';
    } else if (difference.inDays == 1) {
      return 'Kemarin';
    } else if (difference.inDays < 7) {
      return '${difference.inDays} hari lalu';
    }

    return DateFormat('dd MMM yyyy').format(date);
  }

  String _formatCurrency(double amount) {
    final formatter = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );
    return formatter.format(amount);
  }
}
