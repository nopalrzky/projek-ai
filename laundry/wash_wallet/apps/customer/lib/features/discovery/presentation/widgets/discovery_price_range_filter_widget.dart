import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class DiscoveryPriceRangeFilterWidget extends StatelessWidget {
  final TextEditingController minController;
  final TextEditingController maxController;
  final void Function(double? min, double? max) onChanged;

  const DiscoveryPriceRangeFilterWidget({
    super.key,
    required this.minController,
    required this.maxController,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: AppTextField.outlined(
            label: 'Harga Min',
            hint: '0',
            controller: minController,
            keyboardType: TextInputType.number,
            prefixIcon: const Icon(Icons.payments_outlined),
            onChanged: (_) => _notify(),
          ),
        ),
        SizedBox(width: context.space.md),
        Expanded(
          child: AppTextField.outlined(
            label: 'Harga Max',
            hint: 'Tidak dibatasi',
            controller: maxController,
            keyboardType: TextInputType.number,
            prefixIcon: const Icon(Icons.payments_rounded),
            onChanged: (_) => _notify(),
          ),
        ),
      ],
    );
  }

  void _notify() {
    onChanged(_parse(minController.text), _parse(maxController.text));
  }

  double? _parse(String value) {
    final normalized = value.replaceAll('.', '').replaceAll(',', '').trim();
    if (normalized.isEmpty) return null;
    return double.tryParse(normalized);
  }
}
