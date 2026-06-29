import 'package:flutter/widgets.dart';
import '../../theme/extensions/app_spacing_extension.dart';

class AppBottomSheetLayout {
  const AppBottomSheetLayout._();

  static const double maxHeightFactor = 0.9;

  static double minHeight(BuildContext context) {
    return MediaQuery.of(context).size.height * 0.3;
  }

  static double maxHeight(BuildContext context) {
    return MediaQuery.of(context).size.height * maxHeightFactor;
  }

  static const double dragHandleWidth = 40.0;

  static const double dragHandleHeight = 4.0;

  static double dragHandleTopPadding(BuildContext context) {
    return context.space.md;
  }

  static double dragHandleBottomPadding(BuildContext context) {
    return context.space.sm;
  }

  static double dragHandleAreaHeight(BuildContext context) {
    return dragHandleTopPadding(context) +
        dragHandleHeight +
        dragHandleBottomPadding(context);
  }

  static double contentHorizontalPadding(BuildContext context) {
    return context.space.xl;
  }

  static double contentTopPadding(BuildContext context) {
    return context.space.md;
  }

  static double contentBottomPadding(BuildContext context) {
    return context.space.xl;
  }

  static EdgeInsets contentPadding(BuildContext context) {
    return EdgeInsets.only(
      left: contentHorizontalPadding(context),
      right: contentHorizontalPadding(context),
      top: contentTopPadding(context),
      bottom: contentBottomPadding(context),
    );
  }

  static double titleSubtitleSpacing(BuildContext context) {
    return context.space.xs;
  }

  static double headerContentSpacing(BuildContext context) {
    return context.space.lg;
  }

  static double actionBarHeight(BuildContext context) {
    return 80.0;
  }

  static EdgeInsets actionBarPadding(BuildContext context) {
    return EdgeInsets.all(context.space.lg);
  }

  static double actionButtonSpacing(BuildContext context) {
    return context.space.md;
  }

  static BorderRadius borderRadius(BuildContext context) {
    return const BorderRadius.vertical(top: Radius.circular(20));
  }

  static const double selectItemHeight = 56.0;

  static EdgeInsets selectItemPadding(BuildContext context) {
    return EdgeInsets.symmetric(
      horizontal: contentHorizontalPadding(context),
      vertical: context.space.md,
    );
  }

  static double selectItemSpacing(BuildContext context) {
    return context.space.xs;
  }

  static const bool useBottomSafeArea = true;

  static double bottomSafeAreaPadding(BuildContext context) {
    if (!useBottomSafeArea) return 0;
    return MediaQuery.of(context).padding.bottom;
  }
}
