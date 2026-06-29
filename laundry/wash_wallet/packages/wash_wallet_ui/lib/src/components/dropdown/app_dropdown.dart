import 'package:flutter/material.dart';
import '../text_field/app_text_field.dart';
import '../bottom_sheet/app_bottom_sheet.dart';
import '../list_tile/app_list_tile.dart';
import '../empty_state/app_empty_state.dart';

class AppDropdown<T> extends StatelessWidget {
  final String label;
  final String hint;
  final T? value;
  final List<T> items;
  final String Function(T item) itemLabel;
  final ValueChanged<T> onChanged;
  final bool enabled;
  final String? errorText;
  final String? helperText;
  final Widget? prefixIcon;

  const AppDropdown({
    super.key,
    required this.label,
    required this.hint,
    this.value,
    required this.items,
    required this.itemLabel,
    required this.onChanged,
    this.enabled = true,
    this.errorText,
    this.helperText,
    this.prefixIcon,
  });

  @override
  Widget build(BuildContext context) {
    return AppTextField.outlined(
      label: label,
      hint: hint,
      controller: TextEditingController(
        text: value != null ? itemLabel(value as T) : '',
      ),
      readOnly: true,
      enabled: enabled,
      errorText: errorText,
      helperText: helperText,
      prefixIcon: prefixIcon,
      suffixIcon: Icon(
        enabled ? Icons.arrow_drop_down : Icons.arrow_drop_down,
        color: enabled ? null : Colors.grey,
      ),
      onTap: enabled ? () => _openBottomSheet(context) : null,
    );
  }

  Future<void> _openBottomSheet(BuildContext context) async {
    if (items.isEmpty) {
      await AppBottomSheet.show(
        context,
        title: label,
        child: const AppEmptyState(
          title: 'Data tidak tersedia',
          description: 'Belum ada data yang dapat dipilih',
        ),
      );
      return;
    }

    final selected = await AppBottomSheet.select<T>(
      context,
      title: label,
      items: items,
      itemBuilder: (item) => AppListTile(title: itemLabel(item)),
      selectedItem: value,
    );

    if (selected != null) {
      onChanged(selected);
    }
  }
}
