import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class PickupScheduleSection extends StatelessWidget {
  final Order order;

  const PickupScheduleSection({super.key, required this.order});

  @override
  Widget build(BuildContext context) {
    final schedule = order.pickupSchedule;
    if (schedule == null) return const SizedBox.shrink();

    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Jadwal Penjemputan',
            style: context.typography.headlineSmall.copyWith(
              fontWeight: FontWeight.bold,
              color: context.colors.textSecondary,
            ),
          ),
          SizedBox(height: context.space.md),
          Row(
            children: [
              Icon(
                Icons.schedule_outlined,
                size: context.space.lg,
                color: context.colors.textSecondary,
              ),
              SizedBox(width: context.space.sm),
              Expanded(
                child: Text(
                  DateFormat('EEEE, d MMM yyyy HH:mm').format(schedule),
                  style: context.typography.bodyMedium.copyWith(
                    fontWeight: FontWeight.w500,
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
