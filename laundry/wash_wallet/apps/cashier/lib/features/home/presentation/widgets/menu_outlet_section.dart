import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

/// Menu outlet section displaying outlet management shortcuts
///
/// Shows 4-column grid:
/// - Statistik
/// - Dana & Keuangan
/// - Data Konsumen
/// - Rekap Pengambilan
class MenuOutletSection extends StatelessWidget {
  final VoidCallback onStatistics;
  final VoidCallback onFinance;
  final VoidCallback onCustomers;
  final VoidCallback onPickupRecap;
  final VoidCallback onSeeAllMenu;

  const MenuOutletSection({
    super.key,
    required this.onStatistics,
    required this.onFinance,
    required this.onCustomers,
    required this.onPickupRecap,
    required this.onSeeAllMenu,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Section Header
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                Icon(
                  Icons.menu_rounded,
                  size: 20,
                  color: context.colors.textSecondary,
                ),
                SizedBox(width: context.space.xs),
                Text(
                  'Menu Outlet',
                  style: context.typography.labelLarge.copyWith(
                    color: context.colors.textSecondary,
                  ),
                ),
              ],
            ),
            InkWell(
              onTap: onSeeAllMenu,
              borderRadius: context.radius.all.sm,
              child: Padding(
                padding: context.space.insetsAll.xs,
                child: Text(
                  'See all',
                  style: context.typography.labelSmall.copyWith(
                    color: context.colors.primary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
          ],
        ),

        SizedBox(height: context.space.md),

        // Menu Grid
        Row(
          children: [
            Expanded(
              child: _MenuCard(
                icon: Icons.bar_chart_outlined,
                label: 'Statistik\n',
                onTap: onStatistics,
              ),
            ),
            SizedBox(width: context.space.md),
            Expanded(
              child: _MenuCard(
                icon: Icons.account_balance_wallet_outlined,
                label: 'Dana &\nKeuangan',
                onTap: onFinance,
              ),
            ),
            SizedBox(width: context.space.md),
            Expanded(
              child: _MenuCard(
                icon: Icons.people_outline,
                label: 'Data\nKonsumen',
                onTap: onCustomers,
              ),
            ),
            SizedBox(width: context.space.md),
            Expanded(
              child: _MenuCard(
                icon: Icons.inventory_2_outlined,
                label: 'Rekap\nPengambilan',
                onTap: onPickupRecap,
              ),
            ),
          ],
        ),
      ],
    );
  }
}

/// Menu card widget
class _MenuCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _MenuCard({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: context.radius.all.md,
      child: Container(
        padding: EdgeInsets.symmetric(
          horizontal: context.space.sm,
          vertical: context.space.md,
        ),
        decoration: BoxDecoration(
          color: context.colors.surface,
          borderRadius: context.radius.all.md,
          border: Border.all(color: context.colors.border, width: 1),
        ),
        child: Column(
          mainAxisAlignment:
              MainAxisAlignment.center, // âœ… Center content vertically
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: context.colors.primary.withValues(alpha: 0.1),
                borderRadius: context.radius.all.sm,
              ),
              child: Icon(icon, size: 24, color: context.colors.primary),
            ),
            SizedBox(height: context.space.xs),
            Text(
              label,
              style: context.typography.labelSmall.copyWith(
                color: context.colors.textPrimary,
                fontWeight: FontWeight.w500,
              ),
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}
