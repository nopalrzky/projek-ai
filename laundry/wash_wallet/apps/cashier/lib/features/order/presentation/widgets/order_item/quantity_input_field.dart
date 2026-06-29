import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class QuantityInputField extends StatelessWidget {
  final TextEditingController controller;
  final String unitName;
  final ValueChanged<String>? onChanged;
  final VoidCallback? onIncrement;
  final VoidCallback? onDecrement;

  const QuantityInputField({
    super.key,
    required this.controller,
    required this.unitName,
    this.onChanged,
    this.onIncrement,
    this.onDecrement,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: context.space.md),
      child: Container(
        decoration: BoxDecoration(
          color: context.colors.surface,
          borderRadius: BorderRadius.circular(context.radius.md),
          border: Border.all(color: context.colors.border),
        ),
        child: Row(
          children: [
            IconButton(
              icon: const Icon(Icons.remove),
              onPressed: onDecrement,
              style: IconButton.styleFrom(
                foregroundColor: context.colors.textSecondary,
              ),
            ),

            Expanded(
              child: TextFormField(
                controller: controller,
                keyboardType: const TextInputType.numberWithOptions(
                  decimal: true,
                ),
                textAlign: TextAlign.center,
                style: context.typography.headlineMedium.copyWith(
                  fontWeight: FontWeight.w600,
                  color: context.colors.textPrimary,
                ),
                decoration: InputDecoration(
                  hintText: '0.00',
                  suffixText: unitName,
                  suffixStyle: context.typography.bodyMedium.copyWith(
                    color: context.colors.textSecondary,
                  ),
                  border: InputBorder.none,
                  contentPadding: EdgeInsets.symmetric(
                    horizontal: context.space.sm,
                    vertical: context.space.md,
                  ),
                ),
                inputFormatters: [
                  FilteringTextInputFormatter.allow(RegExp(r'^\d+\.?\d{0,2}')),
                ],
                onChanged: onChanged,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Jumlah harus diisi';
                  }

                  final number = double.tryParse(value.replaceAll(',', '.'));
                  if (number == null || number <= 0) {
                    return 'Jumlah harus lebih dari 0';
                  }

                  if (number > 9999.99) {
                    return 'Jumlah maksimal 9999.99';
                  }

                  return null;
                },
              ),
            ),

            IconButton(
              icon: const Icon(Icons.add),
              onPressed: onIncrement,
              style: IconButton.styleFrom(
                foregroundColor: context.colors.primary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

