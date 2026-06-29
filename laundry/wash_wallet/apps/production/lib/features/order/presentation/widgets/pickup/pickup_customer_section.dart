import 'package:flutter/material.dart';
import 'package:wash_wallet_domain/wash_wallet_domain.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class PickupCustomerSection extends StatelessWidget {
  final Order order;

  const PickupCustomerSection({super.key, required this.order});

  @override
  Widget build(BuildContext context) {
    final phone = order.customer?.phone?.trim();

    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Informasi Customer',
            style: context.typography.headlineSmall.copyWith(
              fontWeight: FontWeight.bold,
              color: context.colors.textSecondary,
            ),
          ),
          SizedBox(height: context.space.md),
          _InfoRow(
            icon: Icons.person_outline,
            value: order.customer?.name ?? 'Customer Umum',
          ),
          SizedBox(height: context.space.sm),
          _InfoRow(
            icon: Icons.phone_outlined,
            value: phone == null || phone.isEmpty
                ? 'Nomor WA tidak tersedia'
                : phone,
            color: phone == null || phone.isEmpty
                ? context.colors.textTertiary
                : context.colors.textPrimary,
          ),
          SizedBox(height: context.space.sm),
          _InfoRow(
            icon: Icons.info_outline,
            value: order.statusLabel ?? order.status,
            color: context.colors.primary,
          ),
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String value;
  final Color? color;

  const _InfoRow({required this.icon, required this.value, this.color});

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: context.space.lg, color: context.colors.textSecondary),
        SizedBox(width: context.space.sm),
        Expanded(
          child: Text(
            value,
            style: context.typography.bodyMedium.copyWith(
              color: color ?? context.colors.textPrimary,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
      ],
    );
  }
}
