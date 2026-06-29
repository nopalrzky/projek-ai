import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class AmountInputCard extends StatelessWidget {
  final TextEditingController controller;
  final Function(int) onAmountSelected;

  const AmountInputCard({
    super.key,
    required this.controller,
    required this.onAmountSelected,
  });

  static const List<int> presets = [50000, 100000, 200000, 500000, 1000000];

  @override
  Widget build(BuildContext context) {
    return AppCard.elevated(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Nominal Topup',
            style: context.typography.titleMedium.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          SizedBox(height: context.space.sm),
          TextField(
            controller: controller,
            keyboardType: TextInputType.number,
            style: context.typography.headlineMedium.copyWith(
              color: context.colors.primary,
              fontWeight: FontWeight.bold,
            ),
            decoration: InputDecoration(
              prefixText: 'Rp ',
              hintText: '0',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(context.radius.md),
                borderSide: BorderSide(color: context.colors.border),
              ),
            ),
          ),
          SizedBox(height: context.space.md),
          Wrap(
            spacing: context.space.sm,
            runSpacing: context.space.sm,
            children: presets.map((amount) {
              return ActionChip(
                label: Text('Rp ${amount ~/ 1000}rb'),
                onPressed: () {
                  controller.text = amount.toString();
                  onAmountSelected(amount);
                },
                backgroundColor: context.colors.primarySurface,
                labelStyle: context.typography.bodySmall.copyWith(
                  color: context.colors.primary,
                  fontWeight: FontWeight.w600,
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}
