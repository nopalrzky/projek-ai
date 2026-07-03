import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import '../../../courier_schedule/domain/entities/courier_schedule.dart';

class ScheduleAvailabilityBadgeWidget extends StatelessWidget {
  final CourierSchedule schedule;

  const ScheduleAvailabilityBadgeWidget({super.key, required this.schedule});

  @override
  Widget build(BuildContext context) {
    if (schedule.availabilityStatus == null) {
      return const SizedBox.shrink();
    }

    final isAvailable = schedule.availabilityStatus == 'available';
    final color = isAvailable ? context.colors.success : context.colors.error;

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: context.space.sm,
        vertical: context.space.xs / 2,
      ),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: color.withValues(alpha: 0.5)),
      ),
      child: Text(
        schedule.availabilityLabel ?? '',
        style: context.typography.labelSmall.copyWith(
          color: color,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}
