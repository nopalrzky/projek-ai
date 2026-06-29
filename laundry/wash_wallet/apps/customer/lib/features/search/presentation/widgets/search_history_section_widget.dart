import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class SearchHistorySectionWidget extends StatelessWidget {
  final List<String> history;
  final ValueChanged<String> onSelect;
  final VoidCallback onClearAll;

  const SearchHistorySectionWidget({
    super.key,
    required this.history,
    required this.onSelect,
    required this.onClearAll,
  });

  @override
  Widget build(BuildContext context) {
    if (history.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Riwayat pencarian',
              style: context.typography.titleMedium.copyWith(
                fontWeight: FontWeight.w700,
              ),
            ),
            TextButton(
              onPressed: onClearAll,
              child: Text(
                'Hapus',
                style: context.typography.labelMedium.copyWith(
                  color: context.colors.textSecondary,
                ),
              ),
            ),
          ],
        ),
        SizedBox(height: context.space.sm),
        Wrap(
          spacing: context.space.sm,
          runSpacing: context.space.sm,
          children: history.map((item) {
            return AppChip.primary(
              label: item,
              selected: false,
              onTap: () => onSelect(item),
            );
          }).toList(),
        ),
      ],
    );
  }
}
