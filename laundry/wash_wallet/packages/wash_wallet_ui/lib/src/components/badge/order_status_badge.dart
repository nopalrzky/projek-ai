import 'package:flutter/material.dart';
import 'app_badge.dart';
import 'app_badge_size.dart';
import 'app_badge_variant.dart';

class OrderStatusBadge extends StatelessWidget {
  final String? status;
  final String? label;
  final AppBadgeVariant? variant;
  final IconData? icon;
  final AppBadgeSize size;

  const OrderStatusBadge({
    super.key,
    required this.status,
    this.label,
    this.variant,
    this.icon,
    this.size = AppBadgeSize.sm,
  });

  @override
  Widget build(BuildContext context) {
    final (defaultVariant, defaultLabel, defaultIcon) = switch (status
        ?.toLowerCase()) {
      'requested' => (
        AppBadgeVariant.warning,
        'Diajukan',
        Icons.hourglass_empty_rounded,
      ),
      'pending_dropoff' => (
        AppBadgeVariant.warning,
        'Menunggu Drop-off',
        Icons.store_outlined,
      ),
      'accepted' => (AppBadgeVariant.info, 'Diterima', Icons.thumb_up_outlined),
      'picking_up' => (
        AppBadgeVariant.warning,
        'Sedang Dijemput',
        Icons.delivery_dining_outlined,
      ),
      'picked_up' => (
        AppBadgeVariant.warning,
        'Sudah Diambil',
        Icons.directions_bike_outlined,
      ),
      'received' => (AppBadgeVariant.info, 'Di Outlet', Icons.store_outlined),
      'weighing' => (AppBadgeVariant.info, 'Ditimbang', Icons.scale_outlined),
      'queued' => (
        AppBadgeVariant.warning,
        'Siap Dikerjakan',
        Icons.play_circle_outlined,
      ),
      'in_progress' || 'processing' => (
        AppBadgeVariant.primary,
        'Sedang Dikerjakan',
        Icons.local_laundry_service_outlined,
      ),
      'ready' => (
        AppBadgeVariant.success,
        'Siap Diantar',
        Icons.check_circle_outline,
      ),
      'delivering' => (
        AppBadgeVariant.warning,
        'Sedang Diantar',
        Icons.local_shipping_outlined,
      ),
      'delivered' => (AppBadgeVariant.success, 'Terkirim', Icons.done_all),
      'completed' => (AppBadgeVariant.success, 'Selesai', Icons.verified),
      'cancelled' => (
        AppBadgeVariant.danger,
        'Dibatalkan',
        Icons.cancel_outlined,
      ),
      'on_hold' => (
        AppBadgeVariant.neutral,
        'Ditahan',
        Icons.pause_circle_outline,
      ),
      'pending' => (
        AppBadgeVariant.warning,
        'Menunggu',
        Icons.pending_outlined,
      ),
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
