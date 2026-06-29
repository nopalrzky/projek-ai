import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class ScheduleDaySelectorWidget extends StatelessWidget {
  final DateTime? selectedDate;
  final List<String> disabledDays;
  final Function(DateTime) onDateSelected;

  const ScheduleDaySelectorWidget({
    super.key,
    this.selectedDate,
    required this.disabledDays,
    required this.onDateSelected,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 85,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: 14,
        padding: EdgeInsets.symmetric(vertical: context.space.xs),
        itemBuilder: (context, index) {
          final date = DateTime.now().add(Duration(days: index));
          final dayName = DateFormat('EEEE').format(date).toLowerCase();
          final isDisabled = disabledDays.contains(dayName);

          final isSelected =
              selectedDate != null &&
              DateFormat('yyyy-MM-dd').format(selectedDate!) ==
                  DateFormat('yyyy-MM-dd').format(date);

          return Padding(
            padding: EdgeInsets.only(right: context.space.sm),
            child: InkWell(
              onTap: isDisabled ? null : () => onDateSelected(date),
              borderRadius: BorderRadius.circular(context.radius.md),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                width: 65,
                decoration: BoxDecoration(
                  color: isSelected
                      ? context.colors.primary
                      : isDisabled
                      ? context.colors.disabled.withValues(alpha: 0.5)
                      : context.colors.surface,
                  borderRadius: BorderRadius.circular(context.radius.md),
                  border: Border.all(
                    color: isSelected
                        ? context.colors.primary
                        : isDisabled
                        ? context.colors.disabled
                        : context.colors.border,
                  ),
                  boxShadow: isSelected
                      ? [
                          BoxShadow(
                            color: context.colors.primary.withValues(
                              alpha: 0.3,
                            ),
                            blurRadius: 8,
                            offset: const Offset(0, 4),
                          ),
                        ]
                      : null,
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      DateFormat('EEE').format(date),
                      style: context.typography.bodySmall.copyWith(
                        color: isSelected
                            ? context.colors.onPrimary
                            : isDisabled
                            ? context.colors.textDisabled
                            : context.colors.textSecondary,
                        fontWeight: isSelected ? FontWeight.bold : null,
                      ),
                    ),
                    SizedBox(height: context.space.xs),
                    Text(
                      DateFormat('dd').format(date),
                      style: context.typography.headlineSmall.copyWith(
                        color: isSelected
                            ? context.colors.onPrimary
                            : isDisabled
                            ? context.colors.textDisabled
                            : context.colors.textPrimary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    if (isDisabled) ...[
                      SizedBox(height: context.space.xxs),
                      Text(
                        'Libur',
                        style: context.typography.labelSmall.copyWith(
                          color: context.colors.textDisabled,
                          fontSize: 8,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
