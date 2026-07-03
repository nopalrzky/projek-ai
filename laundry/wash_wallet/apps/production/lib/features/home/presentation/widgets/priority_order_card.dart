import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

class PriorityOrderCard extends StatelessWidget {
  final List<PriorityOrder> priorityOrders;

  const PriorityOrderCard({super.key, required this.priorityOrders});

  @override
  Widget build(BuildContext context) {
    if (priorityOrders.isEmpty) {
      return const SizedBox.shrink();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(
              Icons.priority_high_rounded,
              color: context.colors.error,
              size: 24,
            ),
            SizedBox(width: context.space.sm),
            Text(
              'Order Prioritas',
              style: context.typography.headlineLarge.copyWith(
                fontWeight: FontWeight.bold,
                color: context.colors.textPrimary,
              ),
            ),
          ],
        ),
        SizedBox(height: context.space.md),
        ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: priorityOrders.length,
          separatorBuilder: (context, index) =>
              SizedBox(height: context.space.sm),
          itemBuilder: (context, index) {
            final order = priorityOrders[index];
            return _PriorityOrderItem(order: order);
          },
        ),
      ],
    );
  }
}

class _PriorityOrderItem extends StatelessWidget {
  final PriorityOrder order;

  const _PriorityOrderItem({required this.order});

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'express':
        return AppColors.error500;
      case 'urgent':
        return AppColors.warning500;
      default:
        return AppColors.info500;
    }
  }

  IconData _getStatusIcon(String status) {
    switch (status.toLowerCase()) {
      case 'express':
        return Icons.bolt_rounded;
      case 'urgent':
        return Icons.warning_rounded;
      default:
        return Icons.flag_rounded;
    }
  }

  String _getStatusLabel(String status) {
    switch (status.toLowerCase()) {
      case 'express':
        return 'Express';
      case 'urgent':
        return 'Mendesak';
      default:
        return status;
    }
  }

  @override
  Widget build(BuildContext context) {
    final statusColor = _getStatusColor(order.status);

    return AppCard.outlined(
      onTap: () {
        // TODO: Navigate to order detail
      },
      child: Container(
        decoration: BoxDecoration(
          borderRadius: context.radius.all.md,
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              statusColor.withValues(alpha: 0.05),
              statusColor.withValues(alpha: 0.02),
            ],
          ),
        ),
        child: Padding(
          padding: context.space.insetsAll.lg,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: EdgeInsets.symmetric(
                      horizontal: context.space.sm,
                      vertical: context.space.xs,
                    ),
                    decoration: BoxDecoration(
                      color: statusColor,
                      borderRadius: context.radius.all.sm,
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          _getStatusIcon(order.status),
                          size: 14,
                          color: Colors.white,
                        ),
                        SizedBox(width: context.space.xs),
                        Text(
                          _getStatusLabel(order.status),
                          style: context.typography.labelSmall.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const Spacer(),
                  Text(
                    order.invoice,
                    style: context.typography.headlineSmall.copyWith(
                      fontWeight: FontWeight.bold,
                      color: context.colors.textPrimary,
                    ),
                  ),
                ],
              ),
              SizedBox(height: context.space.md),
              Row(
                children: [
                  Icon(
                    Icons.person_outline_rounded,
                    size: 16,
                    color: context.colors.textSecondary,
                  ),
                  SizedBox(width: context.space.sm),
                  Expanded(
                    child: Text(
                      order.customerName,
                      style: context.typography.bodyMedium.copyWith(
                        color: context.colors.textPrimary,
                      ),
                    ),
                  ),
                ],
              ),
              if (order.deadline != null) ...[
                SizedBox(height: context.space.sm),
                Row(
                  children: [
                    Icon(Icons.alarm_rounded, size: 16, color: statusColor),
                    SizedBox(width: context.space.sm),
                    Text(
                      'Deadline: ${order.deadline}',
                      style: context.typography.bodySmall.copyWith(
                        color: statusColor,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
