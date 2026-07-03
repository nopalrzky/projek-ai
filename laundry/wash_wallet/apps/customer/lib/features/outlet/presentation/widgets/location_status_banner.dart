import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class LocationStatusBanner extends StatelessWidget {
  final bool isGpsActive;
  final VoidCallback? onActivate;

  const LocationStatusBanner({
    super.key,
    required this.isGpsActive,
    this.onActivate,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: context.space.lg,
        vertical: context.space.sm,
      ),
      color: isGpsActive
          ? context.colors.primary.withValues(alpha: 0.1)
          : context.colors.error.withValues(alpha: 0.1),
      child: Row(
        children: [
          Icon(
            isGpsActive
                ? Icons.location_on_rounded
                : Icons.location_off_rounded,
            size: 16,
            color: isGpsActive ? context.colors.primary : context.colors.error,
          ),
          SizedBox(width: context.space.sm),
          Expanded(
            child: Text(
              isGpsActive
                  ? 'Menampilkan outlet terdekat'
                  : 'Aktifkan lokasi untuk melihat outlet terdekat',
              style: context.typography.labelSmall.copyWith(
                color: isGpsActive
                    ? context.colors.primary
                    : context.colors.error,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          if (!isGpsActive && onActivate != null)
            AppButton.ghost(
              label: 'Aktifkan',
              size: AppButtonSize.sm,
              onPressed: onActivate,
            ),
        ],
      ),
    );
  }
}
