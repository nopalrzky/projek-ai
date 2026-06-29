import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class OrderDetailHeaderWidget extends StatelessWidget {
  final Order order;

  const OrderDetailHeaderWidget({super.key, required this.order});

  @override
  Widget build(BuildContext context) {
    final createdAt = order.createdAt != null
        ? DateFormat('dd MMM yyyy, HH:mm').format(order.createdAt!.toLocal())
        : '-';

    return AppCard(
      child: Padding(
        padding: EdgeInsets.all(context.space.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    order.orderNumber,
                    style: context.typography.headlineMedium.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                SizedBox(width: context.space.sm),
                OrderStatusBadge(
                  status: order.status,
                  label: _customerStatusLabel,
                ),
              ],
            ),
            SizedBox(height: context.space.sm),
            Divider(height: 1, color: context.colors.border),
            SizedBox(height: context.space.sm),
            Row(
              children: [
                Icon(
                  Icons.calendar_today_outlined,
                  size: 16,
                  color: context.colors.textSecondary,
                ),
                SizedBox(width: context.space.xs),
                Text(
                  createdAt,
                  style: context.typography.bodyMedium.copyWith(
                    color: context.colors.textSecondary,
                  ),
                ),
              ],
            ),
            if (order.outlet?.name != null) ...[
              SizedBox(height: context.space.xs),
              Row(
                children: [
                  Icon(
                    Icons.storefront_outlined,
                    size: 16,
                    color: context.colors.textSecondary,
                  ),
                  SizedBox(width: context.space.xs),
                  Expanded(
                    child: Text(
                      order.outlet!.name,
                      style: context.typography.bodyMedium.copyWith(
                        color: context.colors.textSecondary,
                        fontWeight: FontWeight.w500,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  String? get _customerStatusLabel {
    return switch (order.status) {
      'accepted' => 'Siap Dijemput',
      'picking_up' => 'Dalam Perjalanan',
      'picked_up' => 'Sudah Diambil',
      'received' => 'Cucian di Outlet',
      _ => order.statusLabel,
    };
  }
}
