import 'package:flutter/material.dart';
import '../../../theme/extensions/theme_context_extension.dart';
import '../variants/app_drawer_variant.dart';

@immutable
class AppDrawerStyle {
  final AppDrawerVariant variant;
  final BuildContext context;

  const AppDrawerStyle({required this.variant, required this.context});

  Color get backgroundColor => context.colors.surface;

  Color get surfaceColor => context.colors.surfaceVariant;

  Color get dividerColor => context.colors.border;

  Color get selectedItemColor => context.colors.primary;

  Color get unselectedItemColor => context.colors.textSecondary;

  Color get activeTextColor => context.colors.primary;

  Color get inactiveTextColor => context.colors.textPrimary;

  Color get selectedBackgroundColor => context.colors.primaryLight;

  Color get hoverBackgroundColor =>
      context.colors.surfaceVariant.withValues(alpha: 0.5);

  TextStyle get itemTitleStyle =>
      context.typography.bodyMedium.copyWith(fontWeight: FontWeight.w500);

  TextStyle get itemActiveTextStyle => context.typography.bodyMedium.copyWith(
    fontWeight: FontWeight.w600,
    color: activeTextColor,
  );

  TextStyle get sectionTitleStyle => context.typography.caption.copyWith(
    fontWeight: FontWeight.w600,
    color: context.colors.textTertiary,
    letterSpacing: 0.5,
  );

  TextStyle get headerTitleStyle =>
      context.typography.headlineMedium.copyWith(fontWeight: FontWeight.w600);

  TextStyle get headerSubtitleStyle => context.typography.bodySmall.copyWith(
    color: context.colors.textSecondary,
  );

  TextStyle get footerTextStyle =>
      context.typography.caption.copyWith(color: context.colors.textTertiary);

  double get width {
    return switch (variant) {
      AppDrawerVariant.standard => 280.0,
      AppDrawerVariant.compact => 72.0,
    };
  }

  double get itemHeight => 48.0;

  double get headerHeight => 120.0;

  EdgeInsets get itemPadding => variant == AppDrawerVariant.compact
      ? const EdgeInsets.symmetric(horizontal: 12.0, vertical: 12.0)
      : const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0);

  EdgeInsets get contentPadding =>
      const EdgeInsets.symmetric(horizontal: 8.0, vertical: 8.0);

  EdgeInsets get sectionPadding =>
      const EdgeInsets.only(left: 16.0, right: 16.0, top: 16.0, bottom: 8.0);

  BorderRadius get itemBorderRadius => BorderRadius.circular(8.0);

  double get iconSize => 24.0;

  double get avatarSize => 48.0;
}
