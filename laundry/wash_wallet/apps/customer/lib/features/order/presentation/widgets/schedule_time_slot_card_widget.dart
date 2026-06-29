import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import '../../../courier_schedule/domain/entities/courier_schedule.dart';
import 'schedule_availability_badge_widget.dart';

class ScheduleTimeSlotCardWidget extends StatelessWidget {
  final CourierSchedule schedule;
  final bool isSelected;
  final VoidCallback onSelect;

  const ScheduleTimeSlotCardWidget({
    super.key,
    required this.schedule,
    required this.isSelected,
    required this.onSelect,
  });

  @override
  Widget build(BuildContext context) {
    final isBookable = schedule.isBookable ?? true;

    return Opacity(
      opacity: isBookable ? 1.0 : 0.5,
      child: InkWell(
        onTap: isBookable ? onSelect : null,
        borderRadius: BorderRadius.circular(8),
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(8),
            border: isSelected
                ? Border.all(color: context.colors.primary, width: 2)
                : Border.all(color: context.colors.border),
            color: context.colors.surface,
          ),
          padding: EdgeInsets.all(context.space.md),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    '${schedule.startTime} - ${schedule.endTime}',
                    style: context.typography.titleMedium.copyWith(
                      fontWeight: FontWeight.bold,
                      color: isSelected
                          ? context.colors.primary
                          : context.colors.textPrimary,
                    ),
                  ),
                  if (isSelected)
                    Icon(
                      Icons.check_circle,
                      color: context.colors.primary,
                      size: 20,
                    ),
                ],
              ),
              if (schedule.availabilityStatus != null) ...[
                SizedBox(height: context.space.sm),
                Row(
                  children: [
                    ScheduleAvailabilityBadgeWidget(schedule: schedule),
                  ],
                ),
                if (!isBookable && schedule.unavailableReason != null) ...[
                  SizedBox(height: context.space.xs),
                  Text(
                    schedule.unavailableReason!,
                    style: context.typography.bodySmall.copyWith(
                      color: context.colors.error,
                      fontStyle: FontStyle.italic,
                    ),
                  ),
                ],
              ],
            ],
          ),
        ),
      ),
    );
  }
}
