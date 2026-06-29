import 'package:flutter/material.dart';
import '../../theme/extensions/theme_context_extension.dart';
import 'app_snackbar_variant.dart';

@immutable
class AppSnackbarStyle {
  final BuildContext context;
  final AppSnackbarVariant variant;

  const AppSnackbarStyle({required this.context, required this.variant});

  Color get _baseColor {
    switch (variant) {
      case AppSnackbarVariant.success:
        return context.colors.success;
      case AppSnackbarVariant.info:
        return context.colors.info;
      case AppSnackbarVariant.warning:
        return context.colors.warning;
      case AppSnackbarVariant.error:
        return context.colors.error;
    }
  }

  Color get backgroundColor => _baseColor.withValues(alpha: 0.18);

  Color get titleColor => context.colors.textPrimary;

  Color get messageColor => context.colors.textSecondary;

  Color get iconColor => _baseColor;

  Color get actionColor => _baseColor;

  IconData get icon {
    switch (variant) {
      case AppSnackbarVariant.success:
        return Icons.check_circle;
      case AppSnackbarVariant.info:
        return Icons.info;
      case AppSnackbarVariant.warning:
        return Icons.warning_amber_rounded;
      case AppSnackbarVariant.error:
        return Icons.error_outline;
    }
  }

  TextStyle get titleTextStyle => context.typography.labelLarge.copyWith(
    color: titleColor,
    fontWeight: FontWeight.w700,
  );

  TextStyle get messageTextStyle =>
      context.typography.bodyMedium.copyWith(color: messageColor);

  TextStyle get actionTextStyle => context.typography.labelMedium.copyWith(
    color: actionColor,
    fontWeight: FontWeight.w700,
  );

  BorderRadius get borderRadius => context.radius.all.md;

  double get iconSize => context.space.lg;

  double get horizontalPadding => context.space.lg;

  double get verticalPadding => context.space.md;

  double get gap => context.space.sm;
}
