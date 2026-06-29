import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class PaymentMethodSelector extends StatelessWidget {
  final String? selectedMethod;
  final String? selectedBank;
  final Function(String, String?) onSelected;

  const PaymentMethodSelector({
    super.key,
    this.selectedMethod,
    this.selectedBank,
    required this.onSelected,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Pilih Metode Pembayaran',
          style: context.typography.titleMedium.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        SizedBox(height: context.space.md),
        _buildMethodTile(
          context,
          'Virtual Account',
          'bank_transfer',
          Icons.account_balance_rounded,
          isExpanded: selectedMethod == 'bank_transfer',
          content: _buildBankList(context),
        ),
        SizedBox(height: context.space.sm),
        _buildMethodTile(
          context,
          'QRIS',
          'qris',
          Icons.qr_code_scanner_rounded,
        ),
        SizedBox(height: context.space.sm),
        _buildMethodTile(
          context,
          'GoPay',
          'gopay',
          Icons.account_balance_wallet_rounded,
        ),
        SizedBox(height: context.space.sm),
        _buildMethodTile(
          context,
          'ShopeePay',
          'shopeepay',
          Icons.shopping_bag_rounded,
        ),
      ],
    );
  }

  Widget _buildMethodTile(
    BuildContext context,
    String title,
    String method,
    IconData icon, {
    bool isExpanded = false,
    Widget? content,
  }) {
    return AppCard.elevated(
      child: Column(
        children: [
          ListTile(
            leading: Icon(icon, color: context.colors.primary),
            title: Text(
              title,
              style: context.typography.bodyLarge.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            trailing: Radio<String>(
              value: method,
              groupValue: selectedMethod,
              onChanged: (val) => onSelected(val!, null),
              activeColor: context.colors.primary,
            ),
            onTap: () => onSelected(method, null),
          ),
          if (isExpanded && content != null) content,
        ],
      ),
    );
  }

  Widget _buildBankList(BuildContext context) {
    final banks = [
      {'code': 'bca', 'name': 'BCA'},
      {'code': 'bni', 'name': 'BNI'},
      {'code': 'bri', 'name': 'BRI'},
      {'code': 'mandiri', 'name': 'Mandiri'},
      {'code': 'permata', 'name': 'Permata'},
    ];

    return Padding(
      padding: EdgeInsets.fromLTRB(
        context.space.xl * 2,
        0,
        context.space.md,
        context.space.md,
      ),
      child: Wrap(
        spacing: context.space.sm,
        runSpacing: context.space.sm,
        children: banks.map((bank) {
          final isSelected = selectedBank == bank['code'];
          return ChoiceChip(
            label: Text(bank['name']!),
            selected: isSelected,
            onSelected: (val) => onSelected('bank_transfer', bank['code']),
            selectedColor: context.colors.primary,
            labelStyle: context.typography.bodySmall.copyWith(
              color: isSelected ? Colors.white : context.colors.textPrimary,
              fontWeight: FontWeight.bold,
            ),
          );
        }).toList(),
      ),
    );
  }
}
