import 'package:flutter/material.dart';
import '../../theme/extensions/theme_context_extension.dart';
import 'app_badge_variant.dart';
import 'app_badge_size.dart';
import 'app_badge_mode.dart';

@immutable
class AppBadgeStyle {
  final AppBadgeVariant variant;
  final AppBadgeSize size;
  final AppBadgeMode mode;
  final BuildContext context;

  const AppBadgeStyle({
    required this.variant,
    required this.size,
    required this.mode,
    required this.context,
  });

  Color get baseColor {
    switch (variant) {
      case AppBadgeVariant.defaultVariant:
        return context.colors.textPrimary;
      case AppBadgeVariant.primary:
        return context.colors.primary;
      case AppBadgeVariant.success:
        return context.colors.success;
      case AppBadgeVariant.warning:
        return context.colors.warning;
      case AppBadgeVariant.danger:
        return context.colors.error;
      case AppBadgeVariant.info:
        return context.colors.info;
      case AppBadgeVariant.neutral:
        return context.colors.textSecondary;
    }
  }

  Color get backgroundColor {
    switch (mode) {
      case AppBadgeMode.solid:
        return baseColor;
      case AppBadgeMode.soft:
        return _softBackground;
      case AppBadgeMode.outline:
        return Colors.transparent;
    }
  }

  Color get _softBackground {
    switch (variant) {
      case AppBadgeVariant.defaultVariant:
        return context.colors.surfaceVariant;
      case AppBadgeVariant.primary:
        return context.colors.primarySurface;
      case AppBadgeVariant.success:
        return context.colors.successSurface;
      case AppBadgeVariant.warning:
        return context.colors.warningSurface;
      case AppBadgeVariant.danger:
        return context.colors.errorSurface;
      case AppBadgeVariant.info:
        return context.colors.infoSurface;
      case AppBadgeVariant.neutral:
        return context.colors.surfaceVariant;
    }
  }

  Color get _softForeground {
    switch (variant) {
      case AppBadgeVariant.defaultVariant:
        return context.colors.textPrimary;
      case AppBadgeVariant.primary:
        return context.colors.primaryDark;
      case AppBadgeVariant.success:
        return context.colors.successDark;
      case AppBadgeVariant.warning:
        return context.colors.warningDark;
      case AppBadgeVariant.danger:
        return context.colors.errorDark;
      case AppBadgeVariant.info:
        return context.colors.infoDark;
      case AppBadgeVariant.neutral:
        return context.colors.textSecondary;
    }
  }

  Color get textColor {
    switch (mode) {
      case AppBadgeMode.solid:
        switch (variant) {
          case AppBadgeVariant.defaultVariant:
            return context.colors.surface;
          case AppBadgeVariant.primary:
            return context.colors.onPrimary;
          case AppBadgeVariant.success:
            return context.colors.onSuccess;
          case AppBadgeVariant.warning:
            return context.colors.onWarning;
          case AppBadgeVariant.danger:
            return context.colors.onError;
          case AppBadgeVariant.info:
            return context.colors.onInfo;
          case AppBadgeVariant.neutral:
            return context.colors.surface;
        }
      case AppBadgeMode.soft:
      case AppBadgeMode.outline:
        return mode == AppBadgeMode.soft ? _softForeground : baseColor;
    }
  }

  Color? get borderColor {
    if (mode == AppBadgeMode.outline) {
      return baseColor;
    }
    return null;
  }

  Color get iconColor => textColor;

  TextStyle get textStyle {
    final baseStyle = switch (size) {
      AppBadgeSize.sm => context.typography.caption,
      AppBadgeSize.md => context.typography.labelSmall,
      AppBadgeSize.lg => context.typography.labelMedium,
    };

    return baseStyle.copyWith(color: textColor, fontWeight: FontWeight.w600);
  }

  BorderRadius get borderRadius => context.radius.all.full;

  EdgeInsets get padding {
    switch (size) {
      case AppBadgeSize.sm:
        return context.space.insetsHorizontal.sm;
      case AppBadgeSize.md:
        return context.space.insetsHorizontal.md;
      case AppBadgeSize.lg:
        return context.space.insetsHorizontal.md;
    }
  }

  double get borderWidth {
    return mode == AppBadgeMode.outline ? 1.0 : 0;
  }

  double get height => size.height;

  double get iconSize => size.iconSize;

  double get iconGap => size.iconGap;

  BoxDecoration get decoration {
    return BoxDecoration(
      color: backgroundColor,
      borderRadius: borderRadius,
      border: borderColor != null
          ? Border.all(color: borderColor!, width: borderWidth)
          : null,
    );
  }
}
