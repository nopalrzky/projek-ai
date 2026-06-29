import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class OutletInfoRatingFilterBarWidget extends StatelessWidget {
  final int? activeFilter;
  final ValueChanged<int?> onFilterSelected;

  const OutletInfoRatingFilterBarWidget({
    super.key,
    required this.activeFilter,
    required this.onFilterSelected,
  });

  @override
  Widget build(BuildContext context) {
    final ratings = [null, 5, 4, 3, 2, 1];

    return SizedBox(
      height: 40,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: ratings.length,
        separatorBuilder: (context, index) => SizedBox(width: context.space.xs),
        itemBuilder: (context, index) {
          final rating = ratings[index];
          final isSelected = activeFilter == rating;

          return AppChip.primary(
            label: rating == null ? 'Semua' : '$rating Bintang',
            selected: isSelected,
            onTap: () => onFilterSelected(rating),
          );
        },
      ),
    );
  }
}
