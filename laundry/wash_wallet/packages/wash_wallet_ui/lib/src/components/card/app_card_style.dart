import 'package:flutter/material.dart';
import '../../theme/extensions/theme_context_extension.dart';
import 'app_card_variant.dart';
import 'app_card_size.dart';

@immutable
class AppCardStyle {
  final AppCardVariant variant;
  final AppCardSize size;
  final bool isEnabled;
  final bool isSelected;
  final BuildContext context;
  final List<BoxShadow>? customShadow;

  const AppCardStyle({
    required this.variant,
    required this.size,
    required this.isEnabled,
    required this.isSelected,
    required this.context,
    this.customShadow,
  });

  Color get backgroundColor {
    if (!isEnabled) {
      return context.colors.disabled;
    }

    if (isSelected) {
      return context.colors.surfaceSelected;
    }

    switch (variant) {
      case AppCardVariant.surface:
        return context.colors.surface;
      case AppCardVariant.outlined:
        return context.colors.surface;
      case AppCardVariant.elevated:
        return context.colors.surface;
      case AppCardVariant.filled:
        return context.colors.surfaceVariant;
      case AppCardVariant.info:
        return context.colors.infoSurface;
      case AppCardVariant.danger:
        return context.colors.errorSurface;
      case AppCardVariant.success:
        return context.colors.successSurface;
    }
  }

  Color? get borderColor {
    if (!isEnabled) {
      return context.colors.disabledBorder;
    }

    if (isSelected) {
      return context.colors.primary;
    }

    switch (variant) {
      case AppCardVariant.outlined:
        return context.colors.border;
      case AppCardVariant.info:
        return context.colors.info;
      case AppCardVariant.danger:
        return context.colors.error;
      case AppCardVariant.success:
        return context.colors.success;
      case AppCardVariant.surface:
      case AppCardVariant.elevated:
      case AppCardVariant.filled:
        return null;
    }
  }

  Color get shadowColor {
    return context.colors.textPrimary.withValues(alpha: 0.1);
  }

  double get elevation {
    if (!isEnabled) {
      return 0;
    }

    switch (variant) {
      case AppCardVariant.elevated:
        return 4.0;
      case AppCardVariant.surface:
        return 0;
      case AppCardVariant.outlined:
      case AppCardVariant.filled:
      case AppCardVariant.info:
      case AppCardVariant.danger:
      case AppCardVariant.success:
        return 0;
    }
  }

  double get shadowBlurRadius {
    return elevation * 2;
  }

  Offset get shadowOffset {
    return Offset(0, elevation / 2);
  }

  BorderRadius get borderRadius {
    switch (size) {
      case AppCardSize.sm:
        return context.radius.all.sm;
      case AppCardSize.md:
        return context.radius.all.md;
      case AppCardSize.lg:
        return context.radius.all.lg;
    }
  }

  EdgeInsets get padding {
    switch (size) {
      case AppCardSize.sm:
        return context.space.insetsAll.md;
      case AppCardSize.md:
        return context.space.insetsAll.lg;
      case AppCardSize.lg:
        return context.space.insetsAll.xl;
    }
  }

  double get borderWidth {
    if (variant == AppCardVariant.outlined ||
        variant == AppCardVariant.info ||
        variant == AppCardVariant.danger ||
        variant == AppCardVariant.success) {
      return isSelected ? 2.0 : 1.0;
    }
    if (variant == AppCardVariant.surface) {
      return 1.0;
    }
    return 0;
  }

  BoxDecoration get decoration {
    final effectiveShadow = elevation > 0
        ? [
            BoxShadow(
              color: shadowColor,
              blurRadius: shadowBlurRadius,
              offset: shadowOffset,
            ),
          ]
        : null;
    final customShadow = this.customShadow;

    return BoxDecoration(
      color: backgroundColor,
      borderRadius: borderRadius,
      border: borderColor != null
          ? Border.all(color: borderColor!, width: borderWidth)
          : null,
      boxShadow: customShadow ?? effectiveShadow,
    );
  }
}
