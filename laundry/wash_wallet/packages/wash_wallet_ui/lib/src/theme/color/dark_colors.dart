import 'package:flutter/material.dart';
import 'app_colors.dart';
import 'semantic_colors.dart';

class DarkSemanticColors extends SemanticColors {
  const DarkSemanticColors();

  @override
  Color get primary => AppColors.teal400;

  @override
  Color get onPrimary => AppColors.neutral900;

  @override
  Color get primaryDark => AppColors.teal600;

  @override
  Color get primaryLight => AppColors.teal800;

  @override
  Color get primarySurface => AppColors.teal900.withValues(alpha: 0.2);

  @override
  Color get background => AppColors.neutral900;

  @override
  Color get surface => AppColors.neutral800;

  @override
  Color get surfaceElevated => AppColors.neutral700;

  @override
  Color get surfaceVariant => AppColors.neutral800.withValues(alpha: 0.6);

  @override
  Color get overlay => AppColors.neutral900.withValues(alpha: 0.8);

  @override
  Color get border => AppColors.neutral600;

  @override
  Color get borderStrong => AppColors.neutral500;

  @override
  Color get divider => AppColors.neutral700;

  @override
  Color get textPrimary => AppColors.neutral50;

  @override
  Color get textSecondary => AppColors.neutral300;

  @override
  Color get textTertiary => AppColors.neutral400;

  @override
  Color get textDisabled => AppColors.neutral600;

  @override
  Color get textOnPrimary => AppColors.neutral900;

  @override
  Color get disabled => AppColors.neutral700;

  @override
  Color get disabledBorder => AppColors.neutral600;

  @override
  Color get hover => AppColors.neutral0.withValues(alpha: 0.08);

  @override
  Color get pressed => AppColors.neutral0.withValues(alpha: 0.12);

  @override
  Color get focus => AppColors.teal400;

  @override
  Color get success => AppColors.success500;

  @override
  Color get successLight => AppColors.success900;

  @override
  Color get successDark => AppColors.success600;

  @override
  Color get successSurface => AppColors.success900.withValues(alpha: 0.2);

  @override
  Color get onSuccess => AppColors.neutral900;

  @override
  Color get warning => AppColors.warning500;

  @override
  Color get warningLight => AppColors.warning900;

  @override
  Color get warningDark => AppColors.warning600;

  @override
  Color get warningSurface => AppColors.warning900.withValues(alpha: 0.2);

  @override
  Color get onWarning => AppColors.neutral900;

  @override
  Color get error => AppColors.error500;

  @override
  Color get errorLight => AppColors.error900;

  @override
  Color get errorDark => AppColors.error600;

  @override
  Color get errorSurface => AppColors.error900.withValues(alpha: 0.2);

  @override
  Color get onError => AppColors.neutral900;

  @override
  Color get info => AppColors.info500;

  @override
  Color get infoLight => AppColors.info900;

  @override
  Color get infoDark => AppColors.info600;

  @override
  Color get infoSurface => AppColors.info900.withValues(alpha: 0.2);

  @override
  Color get onInfo => AppColors.neutral900;

  @override
  Color get revenue => AppColors.success500;

  @override
  Color get expense => AppColors.error500;

  @override
  Color get pending => AppColors.warning500;

  @override
  Color get completed => AppColors.success900.withValues(alpha: 0.3);

  @override
  Color get cancelled => AppColors.neutral600;

  @override
  Color get lowStock => AppColors.warning500;

  @override
  Color get outOfStock => AppColors.error500;
}
