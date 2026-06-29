import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

class OrderItemsList extends StatelessWidget {
  final List<OrderItem> items;

  const OrderItemsList({super.key, required this.items});

  Color _getStatusColor(String status) {
    return switch (status.toLowerCase()) {
      'pending' => Colors.blue,
      'in_progress' || 'processing' => Colors.blue,
      'completed' || 'done' => Colors.green,
      'cancelled' => Colors.red,
      _ => Colors.grey,
    };
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(context.space.md),
      decoration: BoxDecoration(
        color: context.colors.surface,
        borderRadius: BorderRadius.circular(context.radius.md),
        border: Border.all(
          color: context.colors.outline.withValues(alpha: 0.2),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Title
          Row(
            children: [
              Icon(Icons.list_alt, color: context.colors.primary, size: 20),
              SizedBox(width: context.space.sm),
              Text(
                'Order Items',
                style: context.typography.headlineSmall.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          SizedBox(height: context.space.md),

          // Items
          ...items.asMap().entries.map((entry) {
            final index = entry.key;
            final item = entry.value;
            return Column(
              children: [
                if (index > 0) Divider(height: context.space.md * 2),
                _buildOrderItem(context, item, index + 1),
              ],
            );
          }),
        ],
      ),
    );
  }

  Widget _buildOrderItem(BuildContext context, OrderItem item, int number) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 24,
              height: 24,
              decoration: BoxDecoration(
                color: context.colors.primary.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Center(
                child: Text(
                  '$number',
                  style: context.typography.bodySmall.copyWith(
                    color: context.colors.primary,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
            SizedBox(width: context.space.sm),
            Expanded(
              child: Text(
                item.laundryServiceName ?? '-',
                style: context.typography.bodyMedium.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ),
        SizedBox(height: context.space.sm),

        Padding(
          padding: EdgeInsets.only(left: 24 + context.space.sm),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Quantity',
                    style: context.typography.bodySmall.copyWith(
                      color: Colors.grey[600],
                    ),
                  ),
                  Text(
                    '${item.quantity} items',
                    style: context.typography.bodySmall,
                  ),
                ],
              ),
              SizedBox(height: context.space.xs),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Total',
                    style: context.typography.bodySmall.copyWith(
                      color: Colors.grey[600],
                    ),
                  ),
                  Text(
                    item.formattedTotalAmount ?? '-',
                    style: context.typography.bodyMedium.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),

              // Status
              if (item.status.isNotEmpty) ...[
                SizedBox(height: context.space.sm),
                Container(
                  padding: EdgeInsets.symmetric(
                    horizontal: context.space.sm,
                    vertical: context.space.xs,
                  ),
                  decoration: BoxDecoration(
                    color: _getStatusColor(item.status).withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(context.radius.sm),
                    border: Border.all(color: _getStatusColor(item.status)),
                  ),
                  child: Text(
                    item.statusLabel ?? item.status,
                    style: context.typography.bodySmall.copyWith(
                      color: _getStatusColor(item.status),
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ],
    );
  }
}

