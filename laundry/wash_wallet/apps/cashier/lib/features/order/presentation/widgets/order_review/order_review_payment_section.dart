import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class OrderReviewPaymentSection extends StatelessWidget {
  final String paymentMethod;
  final String paymentStatus;
  final TextEditingController paidAmountController;
  final Function(String) onPaymentMethodChanged;
  final Function(String) onPaymentStatusChanged;
  final Widget? transferAccountField;

  const OrderReviewPaymentSection({
    super.key,
    required this.paymentMethod,
    required this.paymentStatus,
    required this.paidAmountController,
    required this.onPaymentMethodChanged,
    required this.onPaymentStatusChanged,
    this.transferAccountField,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Pembayaran',
          style: context.typography.labelSmall.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        SizedBox(height: context.space.sm),
        Row(
          children: [
            Expanded(
              child: DropdownButtonFormField<String>(
                initialValue: paymentMethod,
                decoration: InputDecoration(
                  labelText: 'Metode',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(context.radius.md),
                  ),
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 12,
                  ),
                ),
                items: const [
                  DropdownMenuItem(value: 'cash', child: Text('Tunai')),
                  DropdownMenuItem(value: 'transfer', child: Text('Transfer')),
                  DropdownMenuItem(value: 'qris', child: Text('QRIS')),
                ],
                onChanged: (val) {
                  if (val != null) onPaymentMethodChanged(val);
                },
              ),
            ),
            SizedBox(width: context.space.md),
            Expanded(
              child: DropdownButtonFormField<String>(
                initialValue: paymentStatus,
                decoration: InputDecoration(
                  labelText: 'Status Bayar',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(context.radius.md),
                  ),
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 12,
                  ),
                ),
                items: const [
                  DropdownMenuItem(value: 'unpaid', child: Text('Belum Bayar')),
                  DropdownMenuItem(value: 'paid', child: Text('Lunas')),
                  DropdownMenuItem(
                    value: 'partial',
                    child: Text('DP / Sebagian'),
                  ),
                ],
                onChanged: (val) {
                  if (val != null) onPaymentStatusChanged(val);
                },
              ),
            ),
          ],
        ),
        if (transferAccountField != null) ...[
          SizedBox(height: context.space.md),
          transferAccountField!,
        ],
        SizedBox(height: context.space.md),
        TextFormField(
          controller: paidAmountController,
          keyboardType: TextInputType.number,
          inputFormatters: [FilteringTextInputFormatter.digitsOnly],
          decoration: InputDecoration(
            labelText: 'Nominal Diterima (Rp)',
            prefixIcon: const Icon(Icons.attach_money),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(context.radius.md),
            ),
          ),
          validator: (value) {
            if (paymentStatus != 'unpaid' && (value == null || value.isEmpty)) {
              return 'Wajib diisi';
            }
            return null;
          },
        ),
      ],
    );
  }
}
