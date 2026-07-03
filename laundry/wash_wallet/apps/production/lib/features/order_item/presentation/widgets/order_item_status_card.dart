import 'package:flutter/material.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class OrderItemStatusCard extends StatelessWidget {
  final OrderItem orderItem;

  const OrderItemStatusCard({super.key, required this.orderItem});

  @override
  Widget build(BuildContext context) {
    final status = orderItem.status.toLowerCase();
    final isInProgress = status == 'processing';
    final isCompleted = status == 'done';

    Color statusColor;
    String statusText;
    IconData statusIcon;

    if (isCompleted) {
      statusColor = context.colors.success;
      statusText = 'Selesai';
      statusIcon = Icons.check_circle;
    } else if (isInProgress) {
      statusColor = context.colors.info;
      statusText = 'Sedang Dikerjakan';
      statusIcon = Icons.hourglass_empty;
    } else {
      statusColor = context.colors.warning;
      statusText = 'Belum Dimulai';
      statusIcon = Icons.pending;
    }

    return Container(
      margin: EdgeInsets.symmetric(horizontal: context.space.md),
      padding: EdgeInsets.all(context.space.md),
      decoration: BoxDecoration(
        color: statusColor.withValues(alpha: 0.1),
        borderRadius: context.radius.all.lg,
        border: Border.all(color: statusColor, width: 2),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Icon(statusIcon, color: statusColor, size: 24),
              SizedBox(width: context.space.sm),
              Expanded(
                child: Text(
                  statusText,
                  style: context.typography.headlineMedium.copyWith(
                    fontWeight: FontWeight.bold,
                    color: statusColor,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
