import 'package:flutter/material.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class LocationPickerActionTileWidget extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback? onTap;
  final bool isLoading;

  const LocationPickerActionTileWidget({
    super.key,
    required this.icon,
    required this.label,
    required this.onTap,
    this.isLoading = false,
  });

  @override
  Widget build(BuildContext context) {
    return AppListTile.compact(
      title: label,
      leading: Icon(icon, color: context.colors.primary),
      trailing: isLoading
          ? SizedBox(
              width: 18,
              height: 18,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                color: context.colors.primary,
              ),
            )
          : Icon(
              Icons.chevron_right_rounded,
              color: context.colors.textTertiary,
            ),
      isDisabled: isLoading,
      onTap: isLoading ? null : onTap,
    );
  }
}
