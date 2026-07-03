import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

class OrderDetailHeader extends StatelessWidget {
  final Order order;

  const OrderDetailHeader({super.key, required this.order});

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
          // Order Number
          Row(
            children: [
              Icon(Icons.receipt_long, color: context.colors.primary, size: 20),
              SizedBox(width: context.space.sm),
              Expanded(
                child: Text(
                  order.orderNumber,
                  style: context.typography.headlineMedium.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          SizedBox(height: context.space.md),

          Wrap(
            spacing: context.space.sm,
            runSpacing: context.space.sm,
            children: [
              OrderStatusBadge(status: order.status),
              PaymentStatusBadge(status: order.paymentStatus),
            ],
          ),

          SizedBox(height: context.space.sm),
          Row(
            children: [
              Icon(Icons.calendar_today, size: 14, color: Colors.grey[600]),
              SizedBox(width: context.space.xs),
              Text(
                order.formattedOrderDate ?? '',
                style: context.typography.bodySmall.copyWith(
                  color: Colors.grey[600],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
