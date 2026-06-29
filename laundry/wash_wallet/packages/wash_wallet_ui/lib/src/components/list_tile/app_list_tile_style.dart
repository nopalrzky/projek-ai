import 'package:flutter/material.dart';
import '../../theme/extensions/theme_context_extension.dart';
import 'app_list_tile_size.dart';
import 'app_list_tile_variant.dart';
import 'app_list_tile_layout.dart';

@immutable
class AppListTileStyle {
  final AppListTileVariant variant;
  final AppListTileSize size;
  final bool isSelected;
  final bool isDisabled;
  final bool isHovered;
  final BuildContext context;

  const AppListTileStyle({
    required this.variant,
    required this.size,
    required this.isSelected,
    required this.isDisabled,
    required this.isHovered,
    required this.context,
  });

  Color get backgroundColor {
    if (isDisabled) {
      return context.colors.disabled.withValues(alpha: 0.3);
    }

    if (isSelected) {
      return context.colors.surfaceSelected;
    }

    if (isHovered) {
      return context.colors.hover;
    }

    return Colors.transparent;
  }

  Color get titleColor {
    if (isDisabled) {
      return context.colors.textDisabled;
    }

    return context.colors.textPrimary;
  }

  Color get subtitleColor {
    if (isDisabled) {
      return context.colors.textDisabled;
    }

    return context.colors.textSecondary;
  }

  Color? get borderColor {
    if (isSelected && !isDisabled) {
      return context.colors.primary;
    }
    return null;
  }

  TextStyle get titleStyle {
    final baseStyle = switch (size) {
      AppListTileSize.sm => context.typography.bodySmall,
      AppListTileSize.md => context.typography.bodyMedium,
      AppListTileSize.lg => context.typography.bodyLarge,
    };

    return baseStyle.copyWith(color: titleColor, fontWeight: FontWeight.w600);
  }

  TextStyle get subtitleStyle {
    final baseStyle = switch (size) {
      AppListTileSize.sm => context.typography.caption,
      AppListTileSize.md => context.typography.bodySmall,
      AppListTileSize.lg => context.typography.bodyMedium,
    };

    return baseStyle.copyWith(color: subtitleColor);
  }

  TextStyle get priceStyle {
    return context.typography.labelMedium.copyWith(
      color: isDisabled ? context.colors.textDisabled : context.colors.primary,
      fontWeight: FontWeight.w700,
    );
  }

  BorderRadius get borderRadius {
    return BorderRadius.circular(AppListTileLayout.getBorderRadius(size));
  }

  EdgeInsets get padding {
    switch (size) {
      case AppListTileSize.sm:
        return EdgeInsets.symmetric(
          horizontal: context.space.md,
          vertical: context.space.sm,
        );
      case AppListTileSize.md:
        return EdgeInsets.symmetric(
          horizontal: context.space.lg,
          vertical: context.space.md,
        );
      case AppListTileSize.lg:
        return EdgeInsets.symmetric(
          horizontal: context.space.lg,
          vertical: context.space.lg,
        );
    }
  }

  double get leadingGap {
    switch (size) {
      case AppListTileSize.sm:
        return context.space.sm;
      case AppListTileSize.md:
        return context.space.md;
      case AppListTileSize.lg:
        return context.space.md;
    }
  }

  double get titleSubtitleGap {
    switch (size) {
      case AppListTileSize.sm:
        return context.space.xs;
      case AppListTileSize.md:
        return context.space.xs;
      case AppListTileSize.lg:
        return context.space.sm;
    }
  }

  double get trailingGap {
    switch (size) {
      case AppListTileSize.sm:
        return context.space.sm;
      case AppListTileSize.md:
        return context.space.md;
      case AppListTileSize.lg:
        return context.space.md;
    }
  }

  double get leadingSize => AppListTileLayout.getLeadingSize(size);

  double get minHeight => size.minHeight;

  double get borderWidth => isSelected ? 2.0 : 0;

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
