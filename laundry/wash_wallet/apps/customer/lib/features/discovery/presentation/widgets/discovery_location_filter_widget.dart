import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class DiscoveryLocationFilterWidget extends StatelessWidget {
  final String? selectedOption;
  final ValueChanged<String> onChanged;

  const DiscoveryLocationFilterWidget({
    super.key,
    required this.selectedOption,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Lokasi',
          style: context.typography.titleMedium.copyWith(
            fontWeight: FontWeight.w700,
          ),
        ),
        SizedBox(height: context.space.sm),
        AppListTile.compact(
          title: 'Gunakan alamat utama',
          leading: Icon(
            selectedOption == 'primary_address'
                ? Icons.radio_button_checked
                : Icons.radio_button_unchecked,
            color: selectedOption == 'primary_address'
                ? context.colors.primary
                : context.colors.textSecondary,
          ),
          onTap: () => onChanged('primary_address'),
        ),
        AppListTile.compact(
          title: 'Pilih alamat lain',
          leading: Icon(
            selectedOption == 'other_address'
                ? Icons.radio_button_checked
                : Icons.radio_button_unchecked,
            color: selectedOption == 'other_address'
                ? context.colors.primary
                : context.colors.textSecondary,
          ),
          onTap: () => onChanged('other_address'),
        ),
        AppListTile.compact(
          title: 'Sekitar lokasi saya',
          leading: Icon(
            selectedOption == 'current_location'
                ? Icons.radio_button_checked
                : Icons.radio_button_unchecked,
            color: selectedOption == 'current_location'
                ? context.colors.primary
                : context.colors.textSecondary,
          ),
          onTap: () => onChanged('current_location'),
        ),
      ],
    );
  }
}
