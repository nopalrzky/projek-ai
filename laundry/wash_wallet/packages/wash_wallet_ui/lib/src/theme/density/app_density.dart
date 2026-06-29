/// Guidance density untuk komponen shared.
/// Gunakan [standard] untuk customer app.
/// Gunakan [compact] untuk cashier dan production app.
enum AppDensityMode { standard, compact }

class AppDensity {
  AppDensity._();

  /// Tinggi minimum item list/tile
  static double listItemHeight(AppDensityMode mode) =>
      mode == AppDensityMode.compact ? 52 : 64;

  /// Padding vertikal konten card
  static double cardVerticalPadding(AppDensityMode mode) =>
      mode == AppDensityMode.compact ? 12 : 16;

  /// Tinggi button standard
  static double buttonHeight(AppDensityMode mode) =>
      mode == AppDensityMode.compact ? 40 : 48;
}
