import 'package:flutter/material.dart';
import 'semantic_typography.dart';
import 'dark_typography.dart';

class AppTextTheme {
  AppTextTheme._();

  static TextTheme light(AppTypography typography) {
    return TextTheme(
      displayLarge: typography.displayLarge,
      displayMedium: typography.headlineLarge,
      displaySmall: typography.headlineMedium,

      headlineLarge: typography.headlineLarge,
      headlineMedium: typography.headlineMedium,
      headlineSmall: typography.bodyLarge,

      titleLarge: typography.headlineMedium,
      titleMedium: typography.bodyLarge,
      titleSmall: typography.bodyMedium,

      bodyLarge: typography.bodyLarge,
      bodyMedium: typography.bodyMedium,
      bodySmall: typography.bodySmall,

      labelLarge: typography.labelLarge,
      labelMedium: typography.labelMedium,
      labelSmall: typography.labelSmall,
    );
  }

  static TextTheme dark(DarkTypography typography) {
    return TextTheme(
      displayLarge: typography.displayLarge,
      displayMedium: typography.headlineLarge,
      displaySmall: typography.headlineMedium,

      headlineLarge: typography.headlineLarge,
      headlineMedium: typography.headlineMedium,
      headlineSmall: typography.bodyLarge,

      titleLarge: typography.headlineMedium,
      titleMedium: typography.bodyLarge,
      titleSmall: typography.bodyMedium,

      bodyLarge: typography.bodyLarge,
      bodyMedium: typography.bodyMedium,
      bodySmall: typography.bodySmall,

      labelLarge: typography.labelLarge,
      labelMedium: typography.labelMedium,
      labelSmall: typography.labelSmall,
    );
  }
}
