import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';

class ProductionSummaryCard extends StatelessWidget {
  final HomeSummary summary;

  const ProductionSummaryCard({super.key, required this.summary});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Container(
              padding: context.space.insetsAll.sm,
              decoration: BoxDecoration(
                color: context.colors.primary.withOpacity(0.1),
                borderRadius: context.radius.all.md,
              ),
              child: Icon(
                Icons.dashboard_customize_rounded,
                color: context.colors.primary,
                size: 20,
              ),
            ),
            SizedBox(width: context.space.md),
            Text(
              'Ringkasan Hari Ini',
              style: context.typography.headlineLarge.copyWith(
                fontWeight: FontWeight.bold,
                color: context.colors.textPrimary,
              ),
            ),
          ],
        ),
        SizedBox(height: context.space.lg),
        GridView.count(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisCount: 2,
          mainAxisSpacing: context.space.md,
          crossAxisSpacing: context.space.md,
          childAspectRatio: 1.65,
          children: [
            _SummaryItem(
              icon: Icons.receipt_long_rounded,
              label: 'Order Hari Ini',
              value: summary.ordersToday.toString(),
              gradientColors: [
                AppColors.info500,
                AppColors.info500.withOpacity(0.7),
              ],
            ),
            _SummaryItem(
              icon: Icons.autorenew_rounded,
              label: 'Dalam Proses',
              value: summary.ordersInProgress.toString(),
              gradientColors: [
                AppColors.warning500,
                AppColors.warning500.withOpacity(0.7),
              ],
            ),
            _SummaryItem(
              icon: Icons.check_circle_outline_rounded,
              label: 'Siap Diambil',
              value: summary.ordersReadyForPickup.toString(),
              gradientColors: [
                AppColors.success500,
                AppColors.success500.withOpacity(0.7),
              ],
            ),
            _SummaryItem(
              icon: Icons.verified_rounded,
              label: 'Selesai',
              value: summary.ordersCompleted.toString(),
              gradientColors: [
                AppColors.teal600,
                AppColors.teal600.withOpacity(0.7),
              ],
            ),
          ],
        ),
      ],
    );
  }
}

class _SummaryItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final List<Color> gradientColors;

  const _SummaryItem({
    required this.icon,
    required this.label,
    required this.value,
    required this.gradientColors,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: context.colors.surface,
        borderRadius: context.radius.all.lg,
        border: Border.all(color: gradientColors[0].withOpacity(0.1), width: 1),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Padding(
        padding: context.space.insetsAll.md,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            // Icon and Label Row
            Row(
              children: [
                Container(
                  padding: context.space.insetsAll.sm,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: gradientColors,
                    ),
                    borderRadius: context.radius.all.md,
                    boxShadow: [
                      BoxShadow(
                        color: gradientColors[0].withOpacity(0.3),
                        blurRadius: 8,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Icon(icon, color: Colors.white, size: 20),
                ),
                SizedBox(width: context.space.sm),
                Expanded(
                  child: Text(
                    label,
                    style: context.typography.bodySmall.copyWith(
                      color: context.colors.textSecondary,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
            // Value
            Text(
              value,
              style: context.typography.headlineLarge.copyWith(
                fontWeight: FontWeight.bold,
                color: context.colors.textPrimary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

