import 'package:flutter/material.dart';
import '../../theme/extensions/theme_context_extension.dart';
import 'app_button_variant.dart';
import 'app_button_size.dart';

@immutable
class AppButtonStyle {
  final AppButtonVariant variant;
  final AppButtonSize size;
  final bool isEnabled;
  final BuildContext context;

  const AppButtonStyle({
    required this.variant,
    required this.size,
    required this.isEnabled,
    required this.context,
  });

  Color get backgroundColor {
    if (!isEnabled) {
      return context.colors.disabled;
    }

    switch (variant) {
      case AppButtonVariant.primary:
        return context.colors.primary;
      case AppButtonVariant.secondary:
        return context.colors.primaryLight;
      case AppButtonVariant.tonal:
        return context.colors.primarySurface;
      case AppButtonVariant.outline:
        return Colors.transparent;
      case AppButtonVariant.ghost:
        return Colors.transparent;
      case AppButtonVariant.danger:
        return context.colors.error;
      case AppButtonVariant.success:
        return context.colors.success;
    }
  }

  Color get foregroundColor {
    if (!isEnabled) {
      return context.colors.textDisabled;
    }

    switch (variant) {
      case AppButtonVariant.primary:
        return context.colors.onPrimary;
      case AppButtonVariant.secondary:
        return context.colors.primary;
      case AppButtonVariant.tonal:
        return context.colors.primary;
      case AppButtonVariant.outline:
        return context.colors.textPrimary;
      case AppButtonVariant.ghost:
        return context.colors.primary;
      case AppButtonVariant.danger:
        return context.colors.onError;
      case AppButtonVariant.success:
        return context.colors.onSuccess;
    }
  }

  Color? get borderColor {
    if (variant == AppButtonVariant.outline) {
      return isEnabled ? context.colors.border : context.colors.disabledBorder;
    }
    return null;
  }

  Color get overlayColor {
    if (!isEnabled) {
      return Colors.transparent;
    }

    switch (variant) {
      case AppButtonVariant.primary:
      case AppButtonVariant.danger:
      case AppButtonVariant.success:
        return context.colors.onPrimary.withValues(alpha: 0.1);
      case AppButtonVariant.secondary:
      case AppButtonVariant.tonal:
      case AppButtonVariant.outline:
      case AppButtonVariant.ghost:
        return context.colors.primary.withValues(alpha: 0.1);
    }
  }

  TextStyle get textStyle {
    final baseStyle = size == AppButtonSize.sm
        ? context.typography.labelMedium
        : context.typography.labelLarge;

    return baseStyle.copyWith(color: foregroundColor);
  }

  BorderRadius get borderRadius {
    switch (size) {
      case AppButtonSize.sm:
        return context.radius.all.sm;
      case AppButtonSize.md:
        return context.radius.all.md;
      case AppButtonSize.lg:
        return context.radius.all.md;
      case AppButtonSize.xl:
        return context.radius.all.lg;
    }
  }

  EdgeInsets get padding {
    switch (size) {
      case AppButtonSize.sm:
        return context.space.insetsHorizontal.md;
      case AppButtonSize.md:
        return context.space.insetsHorizontal.lg;
      case AppButtonSize.lg:
        return context.space.insetsHorizontal.xl;
      case AppButtonSize.xl:
        return context.space.insetsHorizontal.xl;
    }
  }

  BorderSide? get border {
    if (variant == AppButtonVariant.outline && borderColor != null) {
      return BorderSide(color: borderColor!, width: 1.5);
    }
    return null;
  }

  double get loadingIndicatorSize {
    switch (size) {
      case AppButtonSize.sm:
        return 16.0;
      case AppButtonSize.md:
        return 20.0;
      case AppButtonSize.lg:
        return 24.0;
      case AppButtonSize.xl:
        return 24.0;
    }
  }

  double get loadingIndicatorStrokeWidth {
    switch (size) {
      case AppButtonSize.sm:
        return 2.0;
      case AppButtonSize.md:
      case AppButtonSize.lg:
      case AppButtonSize.xl:
        return 2.5;
    }
  }
}
