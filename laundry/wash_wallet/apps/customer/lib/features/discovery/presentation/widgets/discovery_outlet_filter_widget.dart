import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class DiscoveryOutletFilterWidget extends StatelessWidget {
  final List<MapEntry<int, String>> outlets;
  final int? selectedId;
  final ValueChanged<MapEntry<int, String>?> onChanged;

  const DiscoveryOutletFilterWidget({
    super.key,
    required this.outlets,
    required this.selectedId,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final selected = _selectedEntry();

    return AppTextField.outlined(
      label: 'Outlet',
      hint: 'Semua outlet',
      controller: TextEditingController(text: selected?.value ?? ''),
      readOnly: true,
      suffixIcon: selected == null
          ? const Icon(Icons.keyboard_arrow_down_rounded)
          : IconButton(
              tooltip: 'Hapus outlet',
              icon: const Icon(Icons.close_rounded),
              onPressed: () => onChanged(null),
            ),
      onTap: outlets.isEmpty
          ? null
          : () async {
              final result = await AppBottomSheet.select<MapEntry<int, String>>(
                context,
                title: 'Pilih Outlet',
                items: outlets,
                selectedItem: selected,
                itemBuilder: (item) => Text(item.value),
              );
              if (result != null) onChanged(result);
            },
    );
  }

  MapEntry<int, String>? _selectedEntry() {
    for (final outlet in outlets) {
      if (outlet.key == selectedId) return outlet;
    }
    return null;
  }
}
