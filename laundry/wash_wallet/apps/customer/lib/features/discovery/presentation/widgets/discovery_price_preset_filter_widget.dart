import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class DiscoveryPricePresetFilterWidget extends StatelessWidget {
  final int? selectedPreset;
  final ValueChanged<({double? min, double? max})> onChanged;

  const DiscoveryPricePresetFilterWidget({
    super.key,
    required this.selectedPreset,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Rentang Harga Cepat',
          style: context.typography.titleMedium.copyWith(
            fontWeight: FontWeight.w700,
          ),
        ),
        SizedBox(height: context.space.sm),
        Wrap(
          spacing: context.space.sm,
          runSpacing: context.space.sm,
          children: [
            AppChip.primary(
              label: '0 - 25rb',
              selected: selectedPreset == 0,
              onTap: () => onChanged((min: 0, max: 25000)),
            ),
            AppChip.primary(
              label: '25rb - 50rb',
              selected: selectedPreset == 1,
              onTap: () => onChanged((min: 25000, max: 50000)),
            ),
            AppChip.primary(
              label: '50rb - 75rb',
              selected: selectedPreset == 2,
              onTap: () => onChanged((min: 50000, max: 75000)),
            ),
            AppChip.primary(
              label: '75rb - 100rb',
              selected: selectedPreset == 3,
              onTap: () => onChanged((min: 75000, max: 100000)),
            ),
            AppChip.primary(
              label: '100rb+',
              selected: selectedPreset == 4,
              onTap: () => onChanged((min: 100000, max: null)),
            ),
          ],
        ),
      ],
    );
  }
}
