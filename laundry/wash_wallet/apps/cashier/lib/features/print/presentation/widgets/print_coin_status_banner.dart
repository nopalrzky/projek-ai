import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import '../../domain/entities/print_coin_info.dart';

class PrintCoinStatusBanner extends StatelessWidget {
  final PrintCoinInfo coinInfo;
  final String printTitle;

  const PrintCoinStatusBanner({
    super.key,
    required this.coinInfo,
    required this.printTitle,
  });

  @override
  Widget build(BuildContext context) {
    final status = _resolveStatus(context);

    return Container(
      padding: EdgeInsets.all(context.space.sm),
      decoration: BoxDecoration(
        color: status.backgroundColor,
        borderRadius: context.radius.all.sm,
        border: Border.all(
          color: status.foregroundColor.withValues(alpha: 0.3),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(status.icon, color: status.foregroundColor, size: 16),
          SizedBox(width: context.space.xs),
          Expanded(
            child: Text(
              status.text,
              style: context.typography.bodySmall.copyWith(
                color: status.foregroundColor,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }

  _PrintStatus _resolveStatus(BuildContext context) {
    if (!coinInfo.featureActive) {
      return _PrintStatus(
        text: 'Fitur $printTitle tidak aktif',
        icon: Icons.block_outlined,
        foregroundColor: context.colors.textSecondary,
        backgroundColor: context.colors.surfaceVariant,
      );
    }

    if (!coinInfo.hasEnoughCoin) {
      return _PrintStatus(
        text:
            'Coin tidak cukup. Butuh ${coinInfo.coinPrice} coin, outlet ${coinInfo.outletCoinBalance} coin, owner ${coinInfo.ownerCoinBalance} coin.',
        icon: Icons.warning_amber_rounded,
        foregroundColor: context.colors.error,
        backgroundColor: context.colors.errorSurface,
      );
    }

    if (coinInfo.coinSource == 'owner') {
      return _PrintStatus(
        text:
            'Biaya ${coinInfo.coinPrice} coin dari Owner. Sisa setelah cetak: ${coinInfo.ownerCoinBalance - coinInfo.coinPrice} coin.',
        icon: Icons.info_outline,
        foregroundColor: context.colors.warning,
        backgroundColor: context.colors.warningSurface,
      );
    }

    return _PrintStatus(
      text:
          'Biaya ${coinInfo.coinPrice} coin dari Outlet. Sisa setelah cetak: ${coinInfo.outletCoinBalance - coinInfo.coinPrice} coin.',
      icon: Icons.check_circle_outline,
      foregroundColor: context.colors.success,
      backgroundColor: context.colors.successSurface,
    );
  }
}

class _PrintStatus {
  final String text;
  final IconData icon;
  final Color foregroundColor;
  final Color backgroundColor;

  const _PrintStatus({
    required this.text,
    required this.icon,
    required this.foregroundColor,
    required this.backgroundColor,
  });
}
