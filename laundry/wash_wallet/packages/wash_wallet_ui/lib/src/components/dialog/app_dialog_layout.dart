import 'package:flutter/material.dart';
import '../../theme/extensions/app_spacing_extension.dart';
import '../../theme/responsive/app_breakpoints.dart';

class AppDialogLayout {
  AppDialogLayout._();

  static EdgeInsets insetPadding(BuildContext context) => EdgeInsets.symmetric(
    horizontal: context.space.xl,
    vertical: context.space.lg,
  );

  static EdgeInsets contentPadding(BuildContext context) =>
      EdgeInsets.symmetric(
        horizontal: context.space.xl,
        vertical: context.space.lg,
      );

  static double maxWidth(BuildContext context) => confirmationMaxWidth(context);

  static double confirmationMaxWidth(BuildContext context) {
    final targetWidth = switch (AppBreakpoints.of(context)) {
      WindowSizeClass.compact => context.space.xl * 14,
      WindowSizeClass.medium => context.space.xl * 16,
      WindowSizeClass.expanded => context.space.xl * 18,
      WindowSizeClass.large => context.space.xl * 18,
    };
    return _constrainToViewport(context, targetWidth);
  }

  static double formMaxWidth(BuildContext context) {
    final targetWidth = switch (AppBreakpoints.of(context)) {
      WindowSizeClass.compact => context.space.xl * 17,
      WindowSizeClass.medium => context.space.xl * 18,
      WindowSizeClass.expanded => context.space.xl * 20,
      WindowSizeClass.large => context.space.xl * 20,
    };
    return _constrainToViewport(context, targetWidth);
  }

  static double detailMaxWidth(BuildContext context) {
    final targetWidth = switch (AppBreakpoints.of(context)) {
      WindowSizeClass.compact => context.space.xl * 20,
      WindowSizeClass.medium => context.space.xl * 24,
      WindowSizeClass.expanded => context.space.xl * 28,
      WindowSizeClass.large => context.space.xl * 32,
    };
    return _constrainToViewport(context, targetWidth);
  }

  static double iconContainerSize(BuildContext context) => context.space.xxl;

  static double sectionSpacing(BuildContext context) => context.space.lg;

  static double titleSpacing(BuildContext context) => context.space.sm;

  static double actionsTopSpacing(BuildContext context) => context.space.xl;

  static double buttonGap(BuildContext context) => context.space.sm;

  static double _constrainToViewport(BuildContext context, double targetWidth) {
    final availableWidth =
        MediaQuery.sizeOf(context).width - insetPadding(context).horizontal;
    return availableWidth < targetWidth ? availableWidth : targetWidth;
  }
}
