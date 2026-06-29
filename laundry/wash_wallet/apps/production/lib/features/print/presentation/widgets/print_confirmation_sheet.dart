import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import '../../domain/entities/print_coin_info.dart';

class PrintConfirmationSheet extends StatelessWidget {
  final String title;
  final PrintCoinInfo coinInfo;
  final bool isProcessing;
  final VoidCallback onConfirm;
  final VoidCallback onCancel;

  const PrintConfirmationSheet({
    super.key,
    required this.title,
    required this.coinInfo,
    required this.isProcessing,
    required this.onConfirm,
    required this.onCancel,
  });

  @override
  Widget build(BuildContext context) {
    final remainingCoin = coinInfo.activeCoinBalance - coinInfo.coinPrice;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        _ConfirmationRow(label: 'Jenis cetak', value: title),
        SizedBox(height: context.space.sm),
        _ConfirmationRow(label: 'Biaya', value: '${coinInfo.coinPrice} coin'),
        SizedBox(height: context.space.sm),
        _ConfirmationRow(label: 'Sumber coin', value: coinInfo.coinSourceLabel),
        SizedBox(height: context.space.sm),
        _ConfirmationRow(label: 'Sisa saldo', value: '$remainingCoin coin'),
        SizedBox(height: context.space.lg),
        AppButton.primary(
          label: 'Konfirmasi Cetak',
          icon: const Icon(Icons.print),
          isLoading: isProcessing,
          isFullWidth: true,
          onPressed: isProcessing ? null : onConfirm,
        ),
        SizedBox(height: context.space.sm),
        AppButton.outline(
          label: 'Batal',
          isFullWidth: true,
          onPressed: isProcessing ? null : onCancel,
        ),
      ],
    );
  }
}

class _ConfirmationRow extends StatelessWidget {
  final String label;
  final String value;

  const _ConfirmationRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: context.typography.bodyMedium.copyWith(
            color: context.colors.textSecondary,
          ),
        ),
        Text(
          value,
          style: context.typography.bodyMedium.copyWith(
            color: context.colors.textPrimary,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}
