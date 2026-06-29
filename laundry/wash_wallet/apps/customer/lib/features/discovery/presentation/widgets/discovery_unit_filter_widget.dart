import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class DiscoveryUnitFilterWidget extends StatelessWidget {
  final List<MapEntry<int, String>> units;
  final int? selectedId;
  final ValueChanged<MapEntry<int, String>?> onChanged;

  const DiscoveryUnitFilterWidget({
    super.key,
    required this.units,
    required this.selectedId,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final selected = _selectedEntry();

    return AppTextField.outlined(
      label: 'Unit',
      hint: 'Semua unit',
      controller: TextEditingController(text: selected?.value ?? ''),
      readOnly: true,
      suffixIcon: selected == null
          ? const Icon(Icons.keyboard_arrow_down_rounded)
          : IconButton(
              tooltip: 'Hapus unit',
              icon: const Icon(Icons.close_rounded),
              onPressed: () => onChanged(null),
            ),
      onTap: units.isEmpty
          ? null
          : () async {
              final result = await AppBottomSheet.select<MapEntry<int, String>>(
                context,
                title: 'Pilih Unit',
                items: units,
                selectedItem: selected,
                itemBuilder: (item) => Text(item.value),
              );
              if (result != null) onChanged(result);
            },
    );
  }

  MapEntry<int, String>? _selectedEntry() {
    for (final unit in units) {
      if (unit.key == selectedId) return unit;
    }
    return null;
  }
}
