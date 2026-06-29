import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class PromoSection extends StatelessWidget {
  const PromoSection({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Promo & Layanan Favorit',
          style: context.typography.headlineSmall.copyWith(
            color: context.colors.textPrimary,
            fontWeight: FontWeight.w700,
          ),
        ),
        SizedBox(height: context.space.sm),
        Text(
          'Nikmati promo mingguan dan layanan yang paling sering dipakai.',
          style: context.typography.bodySmall.copyWith(
            color: context.colors.textSecondary,
          ),
        ),
        SizedBox(height: context.space.md),
        AppCard.filled(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Diskon 20% Cuci Kilat',
                style: context.typography.titleMedium.copyWith(
                  color: context.colors.textPrimary,
                  fontWeight: FontWeight.w700,
                ),
              ),
              SizedBox(height: context.space.xs),
              Text(
                'Berlaku sampai 30 April untuk minimal transaksi Rp 50.000.',
                style: context.typography.bodySmall.copyWith(
                  color: context.colors.textSecondary,
                ),
              ),
              SizedBox(height: context.space.md),
              AppButton.primary(label: 'Pakai Promo', onPressed: () {}),
            ],
          ),
        ),
        SizedBox(height: context.space.md),
        Row(
          children: [
            const Expanded(
              child: _QuickActionCard(
                icon: Icons.local_offer_outlined,
                label: 'Voucher',
              ),
            ),
            SizedBox(width: context.space.sm),
            const Expanded(
              child: _QuickActionCard(
                icon: Icons.history_rounded,
                label: 'Riwayat',
              ),
            ),
            SizedBox(width: context.space.sm),
            const Expanded(
              child: _QuickActionCard(
                icon: Icons.support_agent_rounded,
                label: 'Bantuan',
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class _QuickActionCard extends StatelessWidget {
  final IconData icon;
  final String label;

  const _QuickActionCard({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return AppCard.outlined(
      child: Padding(
        padding: EdgeInsets.symmetric(vertical: context.space.sm),
        child: Column(
          children: [
            Icon(icon, color: context.colors.primary, size: context.space.xl),
            SizedBox(height: context.space.xs),
            Text(
              label,
              style: context.typography.labelSmall.copyWith(
                color: context.colors.textPrimary,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
