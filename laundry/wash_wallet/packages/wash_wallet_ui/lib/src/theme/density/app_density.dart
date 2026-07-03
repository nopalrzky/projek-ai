import '../responsive/app_breakpoints.dart';

/// Guidance density untuk komponen shared.
/// Gunakan [standard] untuk customer app.
/// Gunakan [compact] untuk cashier dan production app.
enum AppDensityMode { standard, compact }

class AppDensity {
  AppDensity._();

  static AppDensityMode modeForSizeClass(WindowSizeClass sizeClass) {
    switch (sizeClass) {
      case WindowSizeClass.compact:
      case WindowSizeClass.medium:
        return AppDensityMode.compact;
      case WindowSizeClass.expanded:
      case WindowSizeClass.large:
        return AppDensityMode.standard;
    }
  }

  static double listItemHeight(AppDensityMode mode) =>
      mode == AppDensityMode.compact ? 52 : 64;

  static double cardVerticalPadding(AppDensityMode mode) =>
      mode == AppDensityMode.compact ? 12 : 16;

  static double buttonHeight(AppDensityMode mode) =>
      mode == AppDensityMode.compact ? 40 : 48;

  static double tableColumnGap(AppDensityMode mode) =>
      mode == AppDensityMode.compact ? 8.0 : 12.0;

  static double tableRowHeight(AppDensityMode mode) =>
      mode == AppDensityMode.compact ? 52.0 : 64.0;

  static double tableTwoLineRowHeight(AppDensityMode mode) =>
      mode == AppDensityMode.compact ? 72.0 : 88.0;

  static double tableRowActionSize(AppDensityMode mode) =>
      mode == AppDensityMode.compact ? 44.0 : 48.0;

  static double tableRowActionGap(AppDensityMode mode) =>
      mode == AppDensityMode.compact ? 4.0 : 8.0;

  static double tableRichRowHeight(
    AppDensityMode mode, {
    required bool condensed,
  }) {
    if (mode == AppDensityMode.compact) {
      return condensed ? 108.0 : 96.0;
    }
    return condensed ? 116.0 : 104.0;
  }
}
