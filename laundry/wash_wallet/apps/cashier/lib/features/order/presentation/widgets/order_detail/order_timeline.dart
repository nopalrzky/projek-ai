import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

class OrderTimeline extends StatelessWidget {
  final Order order;

  const OrderTimeline({super.key, required this.order});

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
              Icon(Icons.timeline, color: context.colors.primary, size: 20),
              SizedBox(width: context.space.sm),
              Text(
                'Timeline',
                style: context.typography.headlineSmall.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          SizedBox(height: context.space.md),

          _buildTimelineItem(
            context,
            'Order Created',
            order.formattedOrderDate ?? '-',
            Icons.event_available,
            Colors.blue,
            true,
          ),

          if (order.estimatedCompletion != null) ...[
            SizedBox(height: context.space.md),
            _buildTimelineItem(
              context,
              'Estimated Completion',
              order.formattedEstimatedCompletion ?? '-',
              Icons.schedule,
              Colors.orange,
              false,
            ),
          ],

          if (order.actualCompletion != null) ...[
            SizedBox(height: context.space.md),
            _buildTimelineItem(
              context,
              'Actual Completion',
              order.formattedActualCompletion ?? '-',
              Icons.done_all,
              Colors.green,
              true,
            ),
          ],

          if (order.pickupDate != null) ...[
            SizedBox(height: context.space.md),
            _buildTimelineItem(
              context,
              'Pickup',
              order.formattedPickupDate ?? '-',
              Icons.local_shipping,
              Colors.purple,
              true,
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildTimelineItem(
    BuildContext context,
    String label,
    String date,
    IconData icon,
    Color color,
    bool isCompleted,
  ) {
    return Row(
      children: [
        // Icon
        Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            color: isCompleted ? color : color.withValues(alpha: 0.1),
            shape: BoxShape.circle,
            border: Border.all(color: color, width: 2),
          ),
          child: Icon(
            icon,
            size: 16,
            color: isCompleted ? Colors.white : color,
          ),
        ),
        SizedBox(width: context.space.md),

        // Label and Date
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: context.typography.bodyMedium.copyWith(
                  fontWeight: FontWeight.w600,
                  color: isCompleted ? Colors.black87 : Colors.grey[600],
                ),
              ),
              Text(
                date,
                style: context.typography.bodySmall.copyWith(
                  color: Colors.grey[600],
                ),
              ),
            ],
          ),
        ),

        // Status
        if (isCompleted) Icon(Icons.check_circle, color: color, size: 20),
      ],
    );
  }
}
