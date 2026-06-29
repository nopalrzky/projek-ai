import 'package:flutter/material.dart';
import 'app_fonts.dart';
import 'text_styles.dart';

class AppTypography {
  const AppTypography();

  TextStyle get displayLarge => TextStyles.base(
    fontSize: 32,
    fontWeight: AppFonts.bold,
    height: 1.3,
    letterSpacing: -0.5,
  );

  TextStyle get headlineLarge => TextStyles.base(
    fontSize: 24,
    fontWeight: AppFonts.bold,
    height: 1.35,
    letterSpacing: -0.3,
  );

  TextStyle get headlineMedium => TextStyles.base(
    fontSize: 20,
    fontWeight: AppFonts.semibold,
    height: 1.4,
    letterSpacing: -0.2,
  );

  TextStyle get headlineSmall => TextStyles.base(
    fontSize: 16,
    fontWeight: AppFonts.semibold,
    height: 1.4,
    letterSpacing: -0.1,
  );

  TextStyle get bodyLarge =>
      TextStyles.base(fontSize: 16, fontWeight: AppFonts.regular, height: 1.5);

  TextStyle get bodyMedium =>
      TextStyles.base(fontSize: 14, fontWeight: AppFonts.regular, height: 1.5);

  TextStyle get bodySmall =>
      TextStyles.base(fontSize: 12, fontWeight: AppFonts.regular, height: 1.5);

  TextStyle get labelLarge => TextStyles.base(
    fontSize: 16,
    fontWeight: AppFonts.semibold,
    height: 1.3,
    letterSpacing: 0.3,
  );

  TextStyle get labelMedium => TextStyles.base(
    fontSize: 14,
    fontWeight: AppFonts.medium,
    height: 1.3,
    letterSpacing: 0.2,
  );

  TextStyle get labelSmall => TextStyles.base(
    fontSize: 12,
    fontWeight: AppFonts.medium,
    height: 1.3,
    letterSpacing: 0.2,
  );

  TextStyle get caption => TextStyles.base(
    fontSize: 11,
    fontWeight: AppFonts.regular,
    height: 1.4,
    letterSpacing: 0.1,
  );

  TextStyle get priceDisplay => TextStyles.base(
    fontSize: 28,
    fontWeight: AppFonts.bold,
    height: 1.2,
    letterSpacing: -0.3,
  );

  TextStyle get priceRegular => TextStyles.base(
    fontSize: 18,
    fontWeight: AppFonts.semibold,
    height: 1.3,
    letterSpacing: 0,
  );

  TextStyle get priceSmall =>
      TextStyles.base(fontSize: 14, fontWeight: AppFonts.medium, height: 1.3);

  TextStyle get numberDisplay => TextStyles.base(
    fontSize: 14,
    fontWeight: AppFonts.medium,
    height: 1.4,
    letterSpacing: 0.5,
  );
}
