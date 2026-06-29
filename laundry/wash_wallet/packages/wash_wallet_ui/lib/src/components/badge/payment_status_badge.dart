import 'package:flutter/material.dart';
import 'app_badge.dart';
import 'app_badge_size.dart';
import 'app_badge_variant.dart';

class PaymentStatusBadge extends StatelessWidget {
  final String? status;
  final String? label;
  final AppBadgeVariant? variant;
  final IconData? icon;
  final AppBadgeSize size;

  const PaymentStatusBadge({
    super.key,
    required this.status,
    this.label,
    this.variant,
    this.icon,
    this.size = AppBadgeSize.sm,
  });

  @override
  Widget build(BuildContext context) {
    final (defaultVariant, defaultLabel, defaultIcon) = switch (status?.toLowerCase()) {
      'not_yet_priced' => (AppBadgeVariant.neutral, 'Belum Dihargai', Icons.timer_outlined),
      'unpaid' => (AppBadgeVariant.danger, 'Belum Bayar', Icons.money_off_outlined),
      'partial' => (AppBadgeVariant.warning, 'Sebagian', Icons.payments_outlined),
      'paid' => (AppBadgeVariant.success, 'Lunas', Icons.check_circle_outlined),
      'refunded' => (AppBadgeVariant.info, 'Refund', Icons.replay_outlined),
      'paid_by_package' => (AppBadgeVariant.primary, 'Paket', Icons.card_membership_outlined),
      'cod' => (AppBadgeVariant.warning, 'Bayar di Tempat', Icons.handshake_outlined),
      _ => (AppBadgeVariant.neutral, status ?? 'Unknown', Icons.help_outline),
    };

    return AppBadge.soft(
      label: label ?? defaultLabel,
      icon: icon ?? defaultIcon,
      variant: variant ?? defaultVariant,
      size: size,
    );
  }
}
