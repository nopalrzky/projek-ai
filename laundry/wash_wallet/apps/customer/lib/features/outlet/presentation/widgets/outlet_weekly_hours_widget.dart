import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

class OutletWeeklyHoursWidget extends StatelessWidget {
  final List<WeeklyHours> weeklyHours;

  const OutletWeeklyHoursWidget({
    super.key,
    required this.weeklyHours,
  });

  @override
  Widget build(BuildContext context) {
    if (weeklyHours.isEmpty) {
      return Text(
        'Jadwal operasional belum diatur.',
        style: context.typography.bodyMedium.copyWith(
          color: context.colors.textSecondary,
        ),
      );
    }

    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: weeklyHours.map((dayHour) {
        return Padding(
          padding: EdgeInsets.symmetric(vertical: context.space.xs),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(
                width: 100,
                child: Text(
                  dayHour.dayLabel,
                  style: context.typography.bodyMedium.copyWith(
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
              Expanded(
                child: _buildHoursText(context, dayHour),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  Widget _buildHoursText(BuildContext context, WeeklyHours dayHour) {
    if (dayHour.isClosed || dayHour.timeRanges.isEmpty) {
      return Text(
        'Tutup',
        style: context.typography.bodyMedium.copyWith(
          color: context.colors.error,
          fontWeight: FontWeight.w500,
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: dayHour.timeRanges.map((range) {
        return Text(
          '${range.open} - ${range.close}',
          style: context.typography.bodyMedium.copyWith(
            color: context.colors.textPrimary,
          ),
        );
      }).toList(),
    );
  }
}
