import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class DiscoveryCategoryFilterWidget extends StatelessWidget {
  final List<MapEntry<int, String>> categories;
  final int? selectedId;
  final ValueChanged<MapEntry<int, String>?> onChanged;

  const DiscoveryCategoryFilterWidget({
    super.key,
    required this.categories,
    required this.selectedId,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final selected = _selectedEntry();

    return AppTextField.outlined(
      label: 'Kategori',
      hint: 'Semua kategori',
      controller: TextEditingController(text: selected?.value ?? ''),
      readOnly: true,
      suffixIcon: selected == null
          ? const Icon(Icons.keyboard_arrow_down_rounded)
          : IconButton(
              tooltip: 'Hapus kategori',
              icon: const Icon(Icons.close_rounded),
              onPressed: () => onChanged(null),
            ),
      onTap: categories.isEmpty
          ? null
          : () async {
              final result = await AppBottomSheet.select<MapEntry<int, String>>(
                context,
                title: 'Pilih Kategori',
                items: categories,
                selectedItem: selected,
                itemBuilder: (item) => Text(item.value),
              );
              if (result != null) onChanged(result);
            },
    );
  }

  MapEntry<int, String>? _selectedEntry() {
    for (final category in categories) {
      if (category.key == selectedId) return category;
    }
    return null;
  }
}
