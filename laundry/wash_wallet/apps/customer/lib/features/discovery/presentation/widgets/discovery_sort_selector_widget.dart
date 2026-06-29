import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class DiscoverySortSelectorWidget extends StatelessWidget {
  final String selectedSort;

  const DiscoverySortSelectorWidget({super.key, required this.selectedSort});

  static const options = <String, String>{
    'relevant': 'Terkait',
    'popular': 'Terlaris',
    'cheapest': 'Harga terendah',
    'best': 'Rating terbaik',
    'nearest': 'Terdekat',
  };

  static String labelOf(String value) => options[value] ?? 'Terkait';

  static Future<String?> show(
    BuildContext context, {
    required String currentSort,
  }) {
    return AppBottomSheet.show<String>(
      context,
      title: 'Urutkan',
      child: DiscoverySortSelectorWidget(selectedSort: currentSort),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: options.entries.map((entry) {
        final isSelected = selectedSort == entry.key;
        return AppListTile.compact(
          title: entry.value,
          leading: Icon(
            isSelected
                ? Icons.check_circle_rounded
                : Icons.radio_button_unchecked,
            color: isSelected
                ? context.colors.primary
                : context.colors.textSecondary,
          ),
          onTap: () => Navigator.of(context).pop(entry.key),
        );
      }).toList(),
    );
  }
}
