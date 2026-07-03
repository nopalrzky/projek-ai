import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

/// Quick actions section for common POS workflows
///
/// Displays 2x2 grid of action cards:
/// - Buat Transaksi
/// - Daftar Transaksi
/// - Ambil & Pelunasan
/// - Antar Jemput
class QuickActionsSection extends StatelessWidget {
  final VoidCallback onCreateTransaction;
  final VoidCallback onViewTransactions;
  final VoidCallback onPickupPayment;
  final VoidCallback onDelivery;

  const QuickActionsSection({
    super.key,
    required this.onCreateTransaction,
    required this.onViewTransactions,
    required this.onPickupPayment,
    required this.onDelivery,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Section Header
        Row(
          children: [
            Icon(
              Icons.grid_view_rounded,
              size: 20,
              color: context.colors.textSecondary,
            ),
            SizedBox(width: context.space.xs),
            Text(
              'Quick Actions',
              style: context.typography.labelLarge.copyWith(
                color: context.colors.textSecondary,
              ),
            ),
          ],
        ),

        SizedBox(height: context.space.md),

        // Quick Action Buttons Grid
        Row(
          children: [
            Expanded(
              child: _QuickActionCard(
                icon: Icons.add_shopping_cart_outlined,
                label: 'Buat Transaksi',
                onTap: onCreateTransaction,
              ),
            ),
            SizedBox(width: context.space.md),
            Expanded(
              child: _QuickActionCard(
                icon: Icons.receipt_long_outlined,
                label: 'Daftar Transaksi',
                onTap: onViewTransactions,
              ),
            ),
          ],
        ),

        SizedBox(height: context.space.md),

        Row(
          children: [
            Expanded(
              child: _QuickActionCard(
                icon: Icons.shopping_basket_outlined,
                label: 'Ambil & Pelunasan',
                onTap: onPickupPayment,
              ),
            ),
            SizedBox(width: context.space.md),
            Expanded(
              child: _QuickActionCard(
                icon: Icons.local_shipping_outlined,
                label: 'Antar Jemput',
                onTap: onDelivery,
              ),
            ),
          ],
        ),
      ],
    );
  }
}

/// Quick action card widget
class _QuickActionCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _QuickActionCard({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: context.radius.all.lg,
      child: Container(
        padding: context.space.insetsAll.lg,
        decoration: BoxDecoration(
          color: context.colors.surface,
          borderRadius: context.radius.all.lg,
          border: Border.all(color: context.colors.border, width: 1),
        ),
        child: Column(
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: context.colors.primary.withValues(alpha: 0.1),
                borderRadius: context.radius.all.md,
              ),
              child: Icon(icon, size: 28, color: context.colors.primary),
            ),
            SizedBox(height: context.space.sm),
            Text(
              label,
              style: context.typography.labelMedium.copyWith(
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
    );
  }
}
