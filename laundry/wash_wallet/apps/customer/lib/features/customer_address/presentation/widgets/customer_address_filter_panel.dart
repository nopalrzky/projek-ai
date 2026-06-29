import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class CustomerAddressFilterPanel extends StatelessWidget {
  final bool? selectedIsPrimary;
  final ValueChanged<bool?> onFilterChanged;

  const CustomerAddressFilterPanel({
    super.key,
    required this.selectedIsPrimary,
    required this.onFilterChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(context.space.md),
      decoration: BoxDecoration(
        color: context.colors.surface,
        border: Border.all(color: context.colors.border),
        borderRadius: BorderRadius.circular(context.radius.lg),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Tampilkan:',
            style: context.typography.labelSmall.copyWith(
              color: context.colors.textSecondary,
              fontWeight: FontWeight.w600,
            ),
          ),
          SizedBox(height: context.space.sm),
          Wrap(
            spacing: context.space.sm,
            runSpacing: context.space.sm,
            children: [
              FilterChip(
                label: const Text('Semua'),
                selected: selectedIsPrimary == null,
                onSelected: (_) => onFilterChanged(null),
                selectedColor: context.colors.primarySurface,
                checkmarkColor: context.colors.primary,
                labelStyle: context.typography.labelMedium.copyWith(
                  color: selectedIsPrimary == null
                      ? context.colors.primary
                      : context.colors.textSecondary,
                  fontWeight: selectedIsPrimary == null
                      ? FontWeight.w700
                      : FontWeight.w500,
                ),
              ),
              FilterChip(
                label: const Text('Alamat Utama'),
                selected: selectedIsPrimary == true,
                onSelected: (_) => onFilterChanged(true),
                selectedColor: context.colors.primarySurface,
                checkmarkColor: context.colors.primary,
                labelStyle: context.typography.labelMedium.copyWith(
                  color: selectedIsPrimary == true
                      ? context.colors.primary
                      : context.colors.textSecondary,
                  fontWeight: selectedIsPrimary == true
                      ? FontWeight.w700
                      : FontWeight.w500,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
