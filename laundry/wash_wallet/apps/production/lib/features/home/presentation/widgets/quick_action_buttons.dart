import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class QuickActionButtons extends StatelessWidget {
  const QuickActionButtons({super.key});

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
                Icons.flash_on_rounded,
                color: context.colors.primary,
                size: 20,
              ),
            ),
            SizedBox(width: context.space.md),
            Text(
              'Aksi Cepat',
              style: context.typography.headlineLarge.copyWith(
                fontWeight: FontWeight.bold,
                color: context.colors.textPrimary,
              ),
            ),
          ],
        ),
        SizedBox(height: context.space.lg),
        Row(
          children: [
            Expanded(
              child: _QuickActionButton(
                icon: Icons.search_rounded,
                label: 'Cari Order',
                gradientColors: [
                  AppColors.info500,
                  AppColors.info500.withOpacity(0.8),
                ],
                onTap: () {
                  // TODO: Navigate to search
                },
              ),
            ),
            SizedBox(width: context.space.md),
            Expanded(
              child: _QuickActionButton(
                icon: Icons.qr_code_scanner_rounded,
                label: 'Scan Invoice',
                gradientColors: [
                  AppColors.teal600,
                  AppColors.teal600.withOpacity(0.8),
                ],
                onTap: () {},
              ),
            ),
          ],
        ),
        SizedBox(height: context.space.md),
        SizedBox(
          width: double.infinity,
          child: _QuickActionButton(
            icon: Icons.format_list_bulleted_rounded,
            label: 'Lihat Semua Order',
            gradientColors: [
              AppColors.success500,
              AppColors.success500.withOpacity(0.8),
            ],
            onTap: () {
              // TODO: Navigate to all orders
            },
          ),
        ),
      ],
    );
  }
}

class _QuickActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final List<Color> gradientColors;
  final VoidCallback onTap;

  const _QuickActionButton({
    required this.icon,
    required this.label,
    required this.gradientColors,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: context.radius.all.lg,
        child: Container(
          decoration: BoxDecoration(
            color: context.colors.surface,
            borderRadius: context.radius.all.lg,
            border: Border.all(
              color: gradientColors[0].withOpacity(0.2),
              width: 1.5,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.03),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Padding(
            padding: EdgeInsets.all(context.space.lg),
            child: Column(
              children: [
                // Icon with gradient background
                Container(
                  width: 56,
                  height: 56,
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
                        blurRadius: 12,
                        offset: const Offset(0, 6),
                      ),
                    ],
                  ),
                  child: Icon(icon, color: Colors.white, size: 28),
                ),
                SizedBox(height: context.space.md),
                // Label
                Text(
                  label,
                  style: context.typography.bodyMedium.copyWith(
                    color: context.colors.textPrimary,
                    fontWeight: FontWeight.w600,
                  ),
                  textAlign: TextAlign.center,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

