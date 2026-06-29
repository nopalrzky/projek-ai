import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class SearchSuggestedSectionWidget extends StatelessWidget {
  final List<String> suggestions;
  final ValueChanged<String> onSelect;

  const SearchSuggestedSectionWidget({
    super.key,
    required this.suggestions,
    required this.onSelect,
  });

  @override
  Widget build(BuildContext context) {
    if (suggestions.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Pencarian pilihan',
          style: context.typography.titleMedium.copyWith(
            fontWeight: FontWeight.w700,
          ),
        ),
        SizedBox(height: context.space.md),
        Wrap(
          spacing: context.space.sm,
          runSpacing: context.space.sm,
          children: suggestions.map((item) {
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
