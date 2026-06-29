import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

class OrderCompleteButton extends StatelessWidget {
  final Order order;
  final VoidCallback onComplete;

  const OrderCompleteButton({
    super.key,
    required this.order,
    required this.onComplete,
  });

  @override
  Widget build(BuildContext context) {
    final canComplete = order.completionPercentage == 100;

    return Container(
      padding: EdgeInsets.all(context.space.md),
      decoration: BoxDecoration(
        color: context.colors.surface,
        border: Border(top: BorderSide(color: context.colors.border)),
      ),
      child: SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Progress Produksi',
                            style: context.typography.bodySmall.copyWith(
                              color: context.colors.textSecondary,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          Text(
                            '${order.completionPercentage}%',
                            style: context.typography.bodySmall.copyWith(
                              color: context.colors.primary,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      SizedBox(height: context.space.xs),
                      ClipRRect(
                        borderRadius: context.radius.all.full,
                        child: LinearProgressIndicator(
                          value: order.completionPercentage / 100,
                          backgroundColor: context.colors.primarySurface,
                          valueColor: AlwaysStoppedAnimation<Color>(
                            canComplete
                                ? context.colors.success
                                : context.colors.primary,
                          ),
                          minHeight: 8,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            SizedBox(height: context.space.md),
            AppButton.primary(
              label: 'Selesaikan Order',
              icon: Icon(Icons.check_circle_rounded),
              onPressed: canComplete ? () => _showConfirmDialog(context) : null,
              isFullWidth: true,
            ),
            if (!canComplete) ...[
              SizedBox(height: context.space.sm),
              Text(
                'Selesaikan semua proses item terlebih dahulu (${order.completionPercentage}%)',
                style: context.typography.bodySmall.copyWith(
                  color: context.colors.error,
                  fontStyle: FontStyle.italic,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ],
        ),
      ),
    );
  }

  void _showConfirmDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: context.colors.surface,
        title: Text(
          'Selesaikan Order?',
          style: context.typography.headlineMedium.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        content: Text(
          'Pastikan semua proses produksi telah selesai. Order tidak dapat dibatalkan setelah ini.',
          style: context.typography.bodyMedium,
        ),
        actions: [
          AppButton.outline(
            label: 'Batal',
            onPressed: () => Navigator.pop(context),
            size: AppButtonSize.sm,
          ),
          AppButton.primary(
            label: 'Selesaikan',
            onPressed: () {
              Navigator.pop(context);
              onComplete();
            },
            size: AppButtonSize.sm,
          ),
        ],
      ),
    );
  }
}
