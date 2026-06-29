import 'package:flutter/material.dart';
import '../../theme/extensions/app_spacing_extension.dart';

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

  static double maxWidth(BuildContext context) => context.space.xl * 18;

  static double iconContainerSize(BuildContext context) => context.space.xxl;

  static double sectionSpacing(BuildContext context) => context.space.lg;

  static double titleSpacing(BuildContext context) => context.space.sm;

  static double actionsTopSpacing(BuildContext context) => context.space.xl;

  static double buttonGap(BuildContext context) => context.space.sm;
}
