import 'package:flutter/material.dart';
import '../../theme/extensions/theme_context_extension.dart';
import 'app_card.dart';
import 'app_card_size.dart';

class AppCardTheme {
  AppCardTheme._();

  static Widget product({
    required BuildContext context,
    required Widget child,
    VoidCallback? onTap,
    bool isSelected = false,
  }) {
    return AppCard.outlined(
      size: AppCardSize.md,
      isSelected: isSelected,
      onTap: onTap,
      child: child,
    );
  }

  static Widget transactionSummary({
    required BuildContext context,
    required Widget child,
  }) {
    return AppCard.elevated(size: AppCardSize.lg, child: child);
  }

  static Widget stats({required BuildContext context, required Widget child}) {
    return AppCard.filled(size: AppCardSize.md, child: child);
  }

  static Widget info({
    required BuildContext context,
    required IconData icon,
    required String title,
    required String message,
  }) {
    return AppCard.outlined(
      size: AppCardSize.md,
      child: Row(
        children: [
          Icon(icon, color: context.colors.primary, size: 24),
          SizedBox(width: context.space.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: context.typography.labelLarge),
                SizedBox(height: context.space.xs),
                Text(
                  message,
                  style: context.typography.bodySmall.copyWith(
                    color: context.colors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  static Widget error({
    required BuildContext context,
    required String message,
  }) {
    return AppCard.danger(
      size: AppCardSize.md,
      child: Row(
        children: [
          Icon(Icons.error_outline, color: context.colors.error, size: 24),
          SizedBox(width: context.space.md),
          Expanded(
            child: Text(
              message,
              style: context.typography.bodyMedium.copyWith(
                color: context.colors.error,
              ),
            ),
          ),
        ],
      ),
    );
  }

  static Widget success({
    required BuildContext context,
    required String message,
  }) {
    return AppCard.success(
      size: AppCardSize.md,
      child: Row(
        children: [
          Icon(
            Icons.check_circle_outline,
            color: context.colors.success,
            size: 24,
          ),
          SizedBox(width: context.space.md),
          Expanded(
            child: Text(
              message,
              style: context.typography.bodyMedium.copyWith(
                color: context.colors.success,
              ),
            ),
          ),
        ],
      ),
    );
  }

  static Widget listTile({
    required BuildContext context,
    required String title,
    String? subtitle,
    Widget? leading,
    Widget? trailing,
    VoidCallback? onTap,
    bool isSelected = false,
  }) {
    return AppCard.outlined(
      size: AppCardSize.sm,
      isSelected: isSelected,
      onTap: onTap,
      margin: EdgeInsets.only(bottom: context.space.sm),
      child: Row(
        children: [
          if (leading != null) ...[leading, SizedBox(width: context.space.md)],
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: context.typography.bodyMedium),
                if (subtitle != null) ...[
                  SizedBox(height: context.space.xs),
                  Text(
                    subtitle,
                    style: context.typography.bodySmall.copyWith(
                      color: context.colors.textSecondary,
                    ),
                  ),
                ],
              ],
            ),
          ),
          if (trailing != null) ...[
            SizedBox(width: context.space.md),
            trailing,
          ],
        ],
      ),
    );
  }
}
