import 'package:flutter/material.dart';
import 'app_fonts.dart';
import 'semantic_typography.dart';
import 'text_styles.dart';

class DarkTypography extends AppTypography {
  const DarkTypography();

  @override
  TextStyle get displayLarge => TextStyles.base(
    fontSize: 32,
    fontWeight: AppFonts.bold,
    height: 1.35,
    letterSpacing: -0.5,
  );

  @override
  TextStyle get headlineLarge => TextStyles.base(
    fontSize: 24,
    fontWeight: AppFonts.bold,
    height: 1.4,
    letterSpacing: -0.3,
  );

  @override
  TextStyle get headlineMedium => TextStyles.base(
    fontSize: 20,
    fontWeight: AppFonts.semibold,
    height: 1.45,
    letterSpacing: -0.2,
  );

  @override
  TextStyle get bodyLarge => TextStyles.base(
    fontSize: 16,
    fontWeight: AppFonts.regular,
    height: 1.55,
    letterSpacing: 0.1,
  );

  @override
  TextStyle get bodyMedium => TextStyles.base(
    fontSize: 14,
    fontWeight: AppFonts.regular,
    height: 1.55,
    letterSpacing: 0.1,
  );

  @override
  TextStyle get bodySmall => TextStyles.base(
    fontSize: 12,
    fontWeight: AppFonts.regular,
    height: 1.55,
    letterSpacing: 0.15,
  );

  @override
  TextStyle get caption => TextStyles.base(
    fontSize: 11,
    fontWeight: AppFonts.regular,
    height: 1.45,
    letterSpacing: 0.2,
  );

  @override
  TextStyle get priceDisplay => TextStyles.base(
    fontSize: 28,
    fontWeight: AppFonts.bold,
    height: 1.25,
    letterSpacing: -0.3,
  );

  @override
  TextStyle get priceRegular => TextStyles.base(
    fontSize: 18,
    fontWeight: AppFonts.semibold,
    height: 1.35,
    letterSpacing: 0.05,
  );
}
