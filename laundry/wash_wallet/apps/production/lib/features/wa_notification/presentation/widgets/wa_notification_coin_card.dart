import 'package:flutter/material.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class WaNotificationCoinCard extends StatelessWidget {
  final WaNotificationPreview preview;

  const WaNotificationCoinCard({super.key, required this.preview});

  @override
  Widget build(BuildContext context) {
    final isReady = preview.hasPhone && preview.hasEnoughCoin;
    final color = isReady ? context.colors.success : context.colors.warning;
    final background = isReady
        ? context.colors.successSurface
        : context.colors.warningSurface;

    return AppCard(
      backgroundColor: background,
      borderColor: color.withValues(alpha: 0.4),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _CoinRow(
            label: 'Biaya pengiriman',
            value: '${preview.coinPrice} coin',
          ),
          SizedBox(height: context.space.xs),
          _CoinRow(label: 'Sumber saldo', value: preview.coinSourceLabel),
          SizedBox(height: context.space.xs),
          _CoinRow(
            label: 'Saldo outlet',
            value: '${preview.outletCoinBalance} coin',
          ),
          SizedBox(height: context.space.xs),
          _CoinRow(
            label: 'Saldo owner',
            value: '${preview.ownerCoinBalance} coin',
          ),
          SizedBox(height: context.space.md),
          Row(
            children: [
              Icon(
                isReady
                    ? Icons.check_circle_outline
                    : Icons.warning_amber_rounded,
                color: color,
              ),
              SizedBox(width: context.space.sm),
              Expanded(
                child: Text(
                  _statusText(preview),
                  style: context.typography.bodySmall.copyWith(color: color),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  String _statusText(WaNotificationPreview preview) {
    if (!preview.hasPhone) {
      return 'Customer belum memiliki nomor WhatsApp.';
    }
    if (!preview.hasEnoughCoin) {
      return 'Coin tidak cukup untuk mengirim notifikasi.';
    }
    return 'Coin akan dipotong setelah notifikasi dikirim.';
  }
}

class _CoinRow extends StatelessWidget {
  final String label;
  final String value;

  const _CoinRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: context.typography.bodySmall.copyWith(
            color: context.colors.textSecondary,
          ),
        ),
        Text(
          value,
          style: context.typography.bodySmall.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}
