import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import '../../domain/entities/print_coin_info.dart';
import 'print_coin_status_banner.dart';

class PrintTypeCard extends StatelessWidget {
  final String title;
  final IconData icon;
  final PrintCoinInfo coinInfo;
  final bool isDisabled;
  final VoidCallback onPrint;

  const PrintTypeCard({
    super.key,
    required this.title,
    required this.icon,
    required this.coinInfo,
    required this.isDisabled,
    required this.onPrint,
  });

  @override
  Widget build(BuildContext context) {
    return AppCard.outlined(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: EdgeInsets.all(context.space.xs),
                decoration: BoxDecoration(
                  color: context.colors.primarySurface,
                  borderRadius: context.radius.all.sm,
                ),
                child: Icon(icon, color: context.colors.primary, size: 20),
              ),
              SizedBox(width: context.space.sm),
              Expanded(
                child: Text(
                  title,
                  style: context.typography.bodyMedium.copyWith(
                    fontWeight: FontWeight.bold,
                    color: context.colors.textPrimary,
                  ),
                ),
              ),
            ],
          ),
          SizedBox(height: context.space.sm),
          PrintCoinStatusBanner(coinInfo: coinInfo, printTitle: title),
          SizedBox(height: context.space.sm),
          AppButton.primary(
            label: 'Cetak',
            icon: Icon(icon),
            isFullWidth: true,
            onPressed: coinInfo.canPrint && !isDisabled ? onPrint : null,
          ),
        ],
      ),
    );
  }
}
