import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

import '../../../courier_schedule/domain/entities/courier_schedule.dart';
import 'schedule_day_selector_widget.dart';
import 'schedule_time_slot_card_widget.dart';

class ScheduleSelectorWidget extends StatelessWidget {
  final DateTime? selectedDate;
  final CourierSchedule? selectedSchedule;
  final CourierScheduleData? scheduleData;
  final List<String> disabledDays;
  final bool isLoading;
  final Function(DateTime) onDateSelected;
  final Function(CourierSchedule) onScheduleSelected;

  const ScheduleSelectorWidget({
    super.key,
    this.selectedDate,
    this.selectedSchedule,
    this.scheduleData,
    this.disabledDays = const [],
    this.isLoading = false,
    required this.onDateSelected,
    required this.onScheduleSelected,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Pilih Jadwal Pengambilan',
          style: context.typography.titleMedium.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        SizedBox(height: context.space.sm),

        if (scheduleData?.defaultDate != null && selectedDate == null)
          Padding(
            padding: EdgeInsets.only(bottom: context.space.md),
            child: AppCard(
              child: Padding(
                padding: EdgeInsets.all(context.space.sm),
                child: Row(
                  children: [
                    Icon(Icons.info_outline, color: context.colors.primary, size: 20),
                    SizedBox(width: context.space.sm),
                    Expanded(
                      child: Text(
                        'Menampilkan jadwal untuk ${scheduleData!.defaultDayLabel ?? scheduleData!.defaultDate}',
                        style: context.typography.bodySmall,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

        // Date Selection
        ScheduleDaySelectorWidget(
          selectedDate: selectedDate,
          disabledDays: disabledDays,
          onDateSelected: onDateSelected,
        ),

        SizedBox(height: context.space.md),

        // Time Slot Selection
        if (isLoading)
          const Center(child: AppLoadingIndicator())
        else if (selectedDate == null)
          Center(
            child: Text(
              'Silakan pilih tanggal terlebih dahulu',
              style: context.typography.bodyMedium.copyWith(
                color: context.colors.textSecondary,
                fontStyle: FontStyle.italic,
              ),
            ),
          )
        else if (scheduleData == null || scheduleData!.schedules.isEmpty)
          Center(
            child: Text(
              'Tidak ada jadwal tersedia untuk tanggal ini',
              style: context.typography.bodyMedium.copyWith(
                color: context.colors.textSecondary,
                fontStyle: FontStyle.italic,
              ),
            ),
          )
        else
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: scheduleData!.schedules.where((s) => s.type == 'pickup').length,
            separatorBuilder: (context, index) => SizedBox(height: context.space.sm),
            itemBuilder: (context, index) {
              final schedule = scheduleData!.schedules.where((s) => s.type == 'pickup').elementAt(index);
              final isSelected = selectedSchedule?.id == schedule.id;

              return ScheduleTimeSlotCardWidget(
                schedule: schedule,
                isSelected: isSelected,
                onSelect: () => onScheduleSelected(schedule),
              );
            },
          ),
      ],
    );
  }
}
