import 'package:flutter/material.dart';
import '../../theme/extensions/theme_context_extension.dart';
import 'app_divider_variant.dart';
import 'app_divider_thickness.dart';
import 'app_divider_density.dart';

@immutable
class AppDividerStyle {
  final AppDividerVariant variant;
  final AppDividerThickness thickness;
  final AppDividerDensity density;
  final bool isVertical;
  final BuildContext context;

  const AppDividerStyle({
    required this.variant,
    required this.thickness,
    required this.density,
    required this.isVertical,
    required this.context,
  });

  Color get lineColor {
    switch (variant) {
      case AppDividerVariant.defaultVariant:
        return context.colors.border;
      case AppDividerVariant.soft:
        return context.colors.border.withValues(alpha: 0.3);
      case AppDividerVariant.strong:
        return context.colors.borderStrong;
      case AppDividerVariant.dashed:
        return context.colors.border;
      case AppDividerVariant.danger:
        return context.colors.error;
      case AppDividerVariant.success:
        return context.colors.success;
    }
  }

  double get lineThickness => thickness.value;

  double get spacingBefore {
    switch (density) {
      case AppDividerDensity.tight:
        return context.space.sm;
      case AppDividerDensity.normal:
        return context.space.md;
      case AppDividerDensity.loose:
        return context.space.lg;
    }
  }

  double get spacingAfter {
    switch (density) {
      case AppDividerDensity.tight:
        return context.space.sm;
      case AppDividerDensity.normal:
        return context.space.md;
      case AppDividerDensity.loose:
        return context.space.lg;
    }
  }

  bool get isDashed => variant == AppDividerVariant.dashed;

  double get dashWidth => 4.0;

  double get dashGap => 4.0;
}
