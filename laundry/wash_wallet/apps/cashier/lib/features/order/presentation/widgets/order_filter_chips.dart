import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class OrderFilterChips extends StatelessWidget {
  final String? selectedStatus;
  final Function(String?) onStatusChanged;
  final List<Map<String, String?>> statusFilters;

  const OrderFilterChips({
    super.key,
    required this.selectedStatus,
    required this.onStatusChanged,
    required this.statusFilters,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 50,
      decoration: BoxDecoration(
        color: context.colors.surface,
        border: Border(bottom: BorderSide(color: context.colors.border)),
      ),
      child: ListView.separated(
        padding: EdgeInsets.symmetric(horizontal: context.space.md),
        scrollDirection: Axis.horizontal,
        itemCount: statusFilters.length,
        separatorBuilder: (_, _) => SizedBox(width: context.space.sm),
        itemBuilder: (context, index) {
          final filter = statusFilters[index];
          final isSelected = selectedStatus == filter['value'];

          return Center(
            child: FilterChip(
              label: Text(filter['label']!),
              selected: isSelected,
              onSelected: (_) => onStatusChanged(filter['value']),
              backgroundColor: context.colors.background,
              selectedColor: context.colors.primary.withValues(alpha: 0.15),
              labelStyle: TextStyle(
                color: isSelected
                    ? context.colors.primary
                    : context.colors.textSecondary,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              ),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
                side: BorderSide(
                  color: isSelected
                      ? context.colors.primary
                      : context.colors.border,
                ),
              ),
              showCheckmark: false,
            ),
          );
        },
      ),
    );
  }
}

