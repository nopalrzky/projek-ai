import 'package:flutter/material.dart';

enum WindowSizeClass { compact, medium, expanded, large }

class AppBreakpoints {
  const AppBreakpoints._();

  static const double compact = 600.0;
  static const double medium = 840.0;
  static const double expanded = 1200.0;

  static WindowSizeClass of(BuildContext context) {
    final width = MediaQuery.sizeOf(context).width;
    if (width < compact) {
      return WindowSizeClass.compact;
    } else if (width < medium) {
      return WindowSizeClass.medium;
    } else if (width < expanded) {
      return WindowSizeClass.expanded;
    } else {
      return WindowSizeClass.large;
    }
  }

  static bool isCompact(BuildContext context) =>
      of(context) == WindowSizeClass.compact;
  static bool isMedium(BuildContext context) =>
      of(context) == WindowSizeClass.medium;
  static bool isExpanded(BuildContext context) =>
      of(context) == WindowSizeClass.expanded;
  static bool isLarge(BuildContext context) =>
      of(context) == WindowSizeClass.large;
}
