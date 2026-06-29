import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class LaundryFilterChips extends StatelessWidget {
  final int? selectedCategoryId;
  final int? selectedUnitId;
  final List<Map<String, dynamic>> categories;
  final List<Map<String, dynamic>> units;
  final Function(int?) onCategoryChanged;
  final Function(int?) onUnitChanged;

  const LaundryFilterChips({
    super.key,
    required this.selectedCategoryId,
    required this.selectedUnitId,
    required this.categories,
    required this.units,
    required this.onCategoryChanged,
    required this.onUnitChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 50,
      decoration: BoxDecoration(
        color: context.colors.surface,
        border: Border(bottom: BorderSide(color: context.colors.border)),
      ),
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: EdgeInsets.symmetric(horizontal: context.space.md),
        children: [
          _buildSection(
            context,
            'Kategori',
            categories,
            selectedCategoryId,
            onCategoryChanged,
          ),
          SizedBox(width: context.space.md),
          _buildSection(context, 'Unit', units, selectedUnitId, onUnitChanged),
        ],
      ),
    );
  }

  Widget _buildSection(
    BuildContext context,
    String label,
    List<Map<String, dynamic>> items,
    int? selectedId,
    Function(int?) onChanged,
  ) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          '$label:',
          style: context.typography.bodySmall.copyWith(
            color: context.colors.textSecondary,
            fontWeight: FontWeight.w600,
          ),
        ),
        SizedBox(width: context.space.xs),
        FilterChip(
          label: const Text('Semua'),
          selected: selectedId == null,
          onSelected: (_) => onChanged(null),
          backgroundColor: context.colors.background,
          selectedColor: context.colors.primary.withValues(alpha: 0.15),
          labelStyle: TextStyle(
            color: selectedId == null
                ? context.colors.primary
                : context.colors.textSecondary,
            fontWeight: selectedId == null
                ? FontWeight.bold
                : FontWeight.normal,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
            side: BorderSide(
              color: selectedId == null
                  ? context.colors.primary
                  : context.colors.border,
            ),
          ),
          showCheckmark: false,
        ),
        SizedBox(width: context.space.xs),
        ...items.map((item) {
          final isSelected = selectedId == item['id'];
          return Padding(
            padding: EdgeInsets.only(right: context.space.xs),
            child: FilterChip(
              label: Text(item['name']),
              selected: isSelected,
              onSelected: (_) => onChanged(item['id']),
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
        }),
      ],
    );
  }
}

