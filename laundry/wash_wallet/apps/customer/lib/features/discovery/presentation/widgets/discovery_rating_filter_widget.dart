import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class DiscoveryRatingFilterWidget extends StatelessWidget {
  final double? selectedRating;
  final ValueChanged<double?> onChanged;

  const DiscoveryRatingFilterWidget({
    super.key,
    required this.selectedRating,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Rating Minimal',
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
              label: '⭐ 4.5+',
              selected: selectedRating == 4.5,
              onTap: () => onChanged(selectedRating == 4.5 ? null : 4.5),
            ),
            AppChip.primary(
              label: '⭐ 4.0+',
              selected: selectedRating == 4.0,
              onTap: () => onChanged(selectedRating == 4.0 ? null : 4.0),
            ),
            AppChip.primary(
              label: '⭐ 3.5+',
              selected: selectedRating == 3.5,
              onTap: () => onChanged(selectedRating == 3.5 ? null : 3.5),
            ),
          ],
        ),
      ],
    );
  }
}
