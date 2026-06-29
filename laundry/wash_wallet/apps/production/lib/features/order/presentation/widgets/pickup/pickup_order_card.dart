import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:intl/intl.dart';
import 'pickup_outlet_badge.dart';

class PickupOrderCard extends StatelessWidget {
  final Order order;
  final VoidCallback onAction;
  final bool isPickingUp;
  final bool isOverdue;

  const PickupOrderCard({
    super.key,
    required this.order,
    required this.onAction,
    this.isPickingUp = false,
    this.isOverdue = false,
  });

  @override
  Widget build(BuildContext context) {
    final actionLabel = switch (order.status.toLowerCase()) {
      'picked_up' => 'Tiba Outlet',
      'picking_up' => 'Konfirmasi',
      _ => 'Ambil Sekarang',
    };
    final actionIcon = switch (order.status.toLowerCase()) {
      'picked_up' => const Icon(Icons.store_outlined),
      'picking_up' => const Icon(Icons.check_circle),
      _ => const Icon(Icons.directions_bike),
    };

    return AppCard(
      size: AppCardSize.md,
      margin: EdgeInsets.only(bottom: context.space.md),
      borderColor: isOverdue ? context.colors.error : null,
      onTap: onAction,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (isOverdue) ...[
            Container(
              padding: EdgeInsets.symmetric(
                horizontal: context.space.sm,
                vertical: 4,
              ),
              decoration: BoxDecoration(
                color: context.colors.error.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(context.radius.sm),
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.warning_amber_rounded,
                    size: 14,
                    color: context.colors.error,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    'Terlambat dijemput',
                    style: context.typography.labelSmall.copyWith(
                      color: context.colors.error,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
            SizedBox(height: context.space.sm),
          ],
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: EdgeInsets.symmetric(
                  horizontal: context.space.sm,
                  vertical: 2,
                ),
                decoration: BoxDecoration(
                  color: isOverdue
                      ? context.colors.error
                      : context.colors.primaryContainer,
                  borderRadius: BorderRadius.circular(context.radius.sm),
                ),
                child: Text(
                  order.orderNumber,
                  style: context.typography.labelSmall.copyWith(
                    color: isOverdue
                        ? context.colors.onError
                        : context.colors.onPrimary,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              if (order.pickupSchedule != null)
                Text(
                  DateFormat('HH:mm').format(order.pickupSchedule!),
                  style: context.typography.titleMedium.copyWith(
                    color: isOverdue
                        ? context.colors.error
                        : context.colors.primary,
                    fontWeight: FontWeight.bold,
                  ),
                ),
            ],
          ),
          SizedBox(height: context.space.md),
          if (order.outlet != null) ...[
            PickupOutletBadge(outletName: order.outlet!.name),
            SizedBox(height: context.space.sm),
          ],

          Text(
            order.customer?.name ?? 'Customer Umum',
            style: context.typography.titleMedium.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 4),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(
                Icons.location_on_outlined,
                size: 16,
                color: context.colors.textSecondary,
              ),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  order.pickupAddress ?? 'Alamat tidak tersedia',
                  style: context.typography.bodySmall.copyWith(
                    color: context.colors.textSecondary,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          SizedBox(height: context.space.md),
          const AppDivider(),
          SizedBox(height: context.space.md),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Layanan',
                      style: context.typography.labelSmall.copyWith(
                        color: context.colors.textSecondary,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${order.orderItemsCount} Items',
                      style: context.typography.bodyMedium.copyWith(
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
              AppButton.primary(
                label: actionLabel,
                onPressed: onAction,
                size: AppButtonSize.sm,
                icon: actionIcon,
              ),
            ],
          ),
        ],
      ),
    );
  }
}
