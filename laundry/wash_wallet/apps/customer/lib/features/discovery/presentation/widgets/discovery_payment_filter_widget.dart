import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class DiscoveryPaymentFilterWidget extends StatelessWidget {
  final String? selectedMethod;
  final ValueChanged<String?> onChanged;

  const DiscoveryPaymentFilterWidget({
    super.key,
    required this.selectedMethod,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Metode Pembayaran',
          style: context.typography.titleMedium.copyWith(
            fontWeight: FontWeight.w700,
          ),
        ),
        SizedBox(height: context.space.sm),
        Wrap(
          spacing: context.space.sm,
          runSpacing: context.space.sm,
          children: [
            AppChip.primary(
              label: 'Wallet',
              selected: selectedMethod == 'wallet',
              onTap: () =>
                  onChanged(selectedMethod == 'wallet' ? null : 'wallet'),
            ),
            AppChip.primary(
              label: 'Transfer',
              selected: selectedMethod == 'transfer',
              onTap: () =>
                  onChanged(selectedMethod == 'transfer' ? null : 'transfer'),
            ),
            AppChip.primary(
              label: 'Bayar di outlet',
              selected: selectedMethod == 'pay_at_outlet',
              onTap: () => onChanged(
                selectedMethod == 'pay_at_outlet' ? null : 'pay_at_outlet',
              ),
            ),
          ],
        ),
      ],
    );
  }
}
