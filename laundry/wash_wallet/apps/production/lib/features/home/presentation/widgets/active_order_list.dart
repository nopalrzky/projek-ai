import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

class ActiveOrderList extends StatelessWidget {
  final List<ActiveOrder> activeOrders;

  const ActiveOrderList({super.key, required this.activeOrders});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Order Aktif',
              style: context.typography.headlineLarge.copyWith(
                fontWeight: FontWeight.bold,
                color: context.colors.textPrimary,
              ),
            ),
            if (activeOrders.isNotEmpty)
              TextButton(
                onPressed: () {
                  // TODO: Navigate to all orders
                },
                child: Text(
                  'Lihat Semua',
                  style: TextStyle(color: context.colors.primary),
                ),
              ),
          ],
        ),
        SizedBox(height: context.space.md),
        if (activeOrders.isEmpty)
          const AppEmptyState.order(
            title: 'Tidak Ada Order Aktif',
            description: 'Belum ada order yang sedang diproses',
          )
        else
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: activeOrders.length > 5 ? 5 : activeOrders.length,
            separatorBuilder: (context, index) =>
                SizedBox(height: context.space.sm),
            itemBuilder: (context, index) {
              final order = activeOrders[index];
              return _ActiveOrderItem(order: order);
            },
          ),
      ],
    );
  }
}

class _ActiveOrderItem extends StatelessWidget {
  final ActiveOrder order;

  const _ActiveOrderItem({required this.order});

  @override
  Widget build(BuildContext context) {
    return AppCard(
      onTap: () {
        // TODO: Navigate to order detail
      },
      child: Padding(
        padding: context.space.insetsAll.lg,
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
                        order.invoice,
                        style: context.typography.headlineMedium.copyWith(
                          fontWeight: FontWeight.bold,
                          color: context.colors.textPrimary,
                        ),
                      ),
                      SizedBox(height: context.space.xs),
                      Text(
                        order.customerName,
                        style: context.typography.bodyMedium.copyWith(
                          color: context.colors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: EdgeInsets.symmetric(
                    horizontal: context.space.md,
                    vertical: context.space.sm,
                  ),
                  decoration: BoxDecoration(
                    color: context.colors.primaryLight,
                    borderRadius: context.radius.all.sm,
                  ),
                  child: Text(
                    order.currentProcess,
                    style: context.typography.labelSmall.copyWith(
                      color: context.colors.primary,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            SizedBox(height: context.space.md),
            Row(
              children: [
                Icon(
                  Icons.local_laundry_service_rounded,
                  size: 16,
                  color: context.colors.textSecondary,
                ),
                SizedBox(width: context.space.sm),
                Expanded(
                  child: Text(
                    order.serviceName,
                    style: context.typography.bodySmall.copyWith(
                      color: context.colors.textPrimary,
                    ),
                  ),
                ),
                SizedBox(width: context.space.md),
                Icon(
                  Icons.scale_rounded,
                  size: 16,
                  color: context.colors.textSecondary,
                ),
                SizedBox(width: context.space.sm),
                Text(
                  order.quantity,
                  style: context.typography.bodySmall.copyWith(
                    color: context.colors.textPrimary,
                  ),
                ),
              ],
            ),
            if (order.startedAt != null) ...[
              SizedBox(height: context.space.sm),
              Row(
                children: [
                  Icon(
                    Icons.access_time_rounded,
                    size: 14,
                    color: context.colors.textTertiary,
                  ),
                  SizedBox(width: context.space.xs),
                  Text(
                    'Dimulai: ${order.startedAt}',
                    style: context.typography.bodySmall.copyWith(
                      color: context.colors.textTertiary,
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
}
