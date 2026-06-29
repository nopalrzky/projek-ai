import 'package:flutter/material.dart';
import '../typography/semantic_typography.dart';
import '../typography/dark_typography.dart';

@immutable
class AppTypographyExtension extends ThemeExtension<AppTypographyExtension> {
  final AppTypography typography;

  const AppTypographyExtension._({required this.typography});

  factory AppTypographyExtension.light() {
    return const AppTypographyExtension._(typography: AppTypography());
  }

  factory AppTypographyExtension.dark() {
    return const AppTypographyExtension._(typography: DarkTypography());
  }

  TextStyle get displayLarge => typography.displayLarge;

  TextStyle get displaySmall => typography.headlineMedium;

  TextStyle get headlineLarge => typography.headlineLarge;

  TextStyle get headlineMedium => typography.headlineMedium;

  TextStyle get headlineSmall => typography.headlineSmall;

  TextStyle get bodyLarge => typography.bodyLarge;

  TextStyle get titleMedium => typography.bodyLarge;

  TextStyle get bodyMedium => typography.bodyMedium;

  TextStyle get bodySmall => typography.bodySmall;

  TextStyle get labelLarge => typography.labelLarge;

  TextStyle get labelMedium => typography.labelMedium;

  TextStyle get labelSmall => typography.labelSmall;

  TextStyle get caption => typography.caption;

  TextStyle get priceDisplay => typography.priceDisplay;

  TextStyle get priceRegular => typography.priceRegular;

  TextStyle get priceSmall => typography.priceSmall;

  TextStyle get numberDisplay => typography.numberDisplay;

  @override
  ThemeExtension<AppTypographyExtension> copyWith({AppTypography? typography}) {
    return AppTypographyExtension._(typography: typography ?? this.typography);
  }

  @override
  ThemeExtension<AppTypographyExtension> lerp(
    covariant ThemeExtension<AppTypographyExtension>? other,
    double t,
  ) {
    if (other is! AppTypographyExtension) {
      return this;
    }

    return t < 0.5 ? this : other;
  }
}
