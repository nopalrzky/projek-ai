import 'package:flutter/material.dart';
import '../../theme/extensions/theme_context_extension.dart';
import 'app_bottom_sheet_variant.dart';

@immutable
class AppBottomSheetStyle {
  final AppBottomSheetVariant variant;
  final BuildContext context;

  const AppBottomSheetStyle({required this.variant, required this.context});

  Color get backgroundColor {
    return context.colors.surface;
  }

  Color get dragHandleColor {
    return context.colors.border;
  }

  Color get barrierColor {
    return context.colors.overlay;
  }

  Color get dividerColor {
    return context.colors.border;
  }

  Color get actionBarBackgroundColor {
    return context.colors.surface;
  }

  Color get accentColor {
    switch (variant) {
      case AppBottomSheetVariant.standard:
        return context.colors.primary;
      case AppBottomSheetVariant.action:
        return context.colors.primary;
      case AppBottomSheetVariant.payment:
        return context.colors.success;
      case AppBottomSheetVariant.filter:
        return context.colors.primary;
    }
  }

  TextStyle get titleTextStyle {
    return context.typography.displayLarge.copyWith(
      color: context.colors.textPrimary,
    );
  }

  TextStyle get subtitleTextStyle {
    return context.typography.bodyMedium.copyWith(
      color: context.colors.textSecondary,
    );
  }

  TextStyle get selectItemTextStyle {
    return context.typography.bodyLarge.copyWith(
      color: context.colors.textPrimary,
    );
  }

  TextStyle get selectedItemTextStyle {
    return context.typography.labelLarge.copyWith(
      color: context.colors.primary,
    );
  }

  ShapeBorder get shape {
    return const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
    );
  }

  BorderRadius get dragHandleBorderRadius {
    return context.radius.all.full;
  }

  double get elevation {
    switch (variant) {
      case AppBottomSheetVariant.standard:
        return 8.0;
      case AppBottomSheetVariant.action:
        return 12.0;
      case AppBottomSheetVariant.payment:
        return 16.0;
      case AppBottomSheetVariant.filter:
        return 8.0;
    }
  }

  bool get isDismissible {
    return variant != AppBottomSheetVariant.payment;
  }

  bool get enableDrag {
    return variant != AppBottomSheetVariant.payment;
  }

  Color selectItemBackgroundColor(bool isSelected) {
    if (isSelected) {
      return context.colors.primaryLight;
    }
    return Colors.transparent;
  }

  Color? selectItemBorderColor(bool isSelected) {
    if (isSelected) {
      return context.colors.primary;
    }
    return null;
  }

  double get selectItemBorderWidth {
    return 1.5;
  }

  BorderRadius get selectItemBorderRadius {
    return context.radius.all.md;
  }

  Color get selectedItemIconColor {
    return context.colors.primary;
  }

  double get selectedItemIconSize {
    return context.space.lg;
  }
}
