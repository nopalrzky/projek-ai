import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

class OrderCard extends StatelessWidget {
  final Order order;
  final VoidCallback onTap;

  const OrderCard({super.key, required this.order, required this.onTap});

  String _customerName(Customer? customer) {
    if (customer == null) return 'Guest';
    return customer.name.trim().isNotEmpty ? customer.name : 'Guest';
  }

  String? _customerPhone(Customer? customer) {
    if (customer == null) return null;
    final value = customer.phone?.trim();
    return value != null && value.isNotEmpty ? value : null;
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.only(bottom: context.space.md),
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(context.radius.md),
        side: BorderSide(color: context.colors.border.withValues(alpha: 0.5)),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(context.radius.md),
        child: Padding(
          padding: EdgeInsets.all(context.space.md),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    order.orderNumber,
                    style: context.typography.labelSmall.copyWith(
                      fontWeight: FontWeight.bold,
                      color: context.colors.primary,
                    ),
                  ),
                  Text(
                    order.formattedOrderDate ?? '',
                    style: context.typography.bodySmall.copyWith(
                      color: context.colors.textSecondary,
                      fontSize: 11,
                    ),
                  ),
                ],
              ),
              const Divider(height: 24),

              Row(
                children: [
                  CircleAvatar(
                    radius: 16,
                    backgroundColor: context.colors.primary.withValues(
                      alpha: 0.1,
                    ),
                    child: Icon(
                      Icons.person,
                      size: 16,
                      color: context.colors.primary,
                    ),
                  ),
                  SizedBox(width: context.space.sm),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _customerName(order.customer),
                          style: context.typography.bodyMedium.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        if (_customerPhone(order.customer) != null)
                          Text(
                            _customerPhone(order.customer)!,
                            style: context.typography.bodySmall.copyWith(
                              color: context.colors.textSecondary,
                            ),
                          ),
                      ],
                    ),
                  ),
                  Text(
                    order.formattedTotalAmount ?? '',
                    style: context.typography.labelMedium.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              SizedBox(height: context.space.md),

              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  OrderStatusBadge(status: order.status),
                  PaymentStatusBadge(status: order.paymentStatus),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
