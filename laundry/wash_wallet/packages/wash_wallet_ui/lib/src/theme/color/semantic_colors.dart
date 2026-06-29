import 'package:flutter/material.dart';
import 'app_colors.dart';

class SemanticColors {
  const SemanticColors();

  Color get primary => AppColors.teal600;
  Color get onPrimary => AppColors.neutral0;
  Color get primaryDark => AppColors.teal800;
  Color get primaryLight => AppColors.teal200;
  Color get primarySurface => AppColors.teal50;

  Color get secondary => AppColors.teal500;
  Color get onSecondary => AppColors.neutral0;
  Color get secondaryDark => AppColors.teal700;
  Color get secondaryLight => AppColors.teal300;
  Color get secondarySurface => AppColors.teal100;

  Color get background => AppColors.neutral50;
  Color get surface => AppColors.neutral0;
  Color get surfaceElevated => AppColors.neutral0;
  Color get surfaceVariant => AppColors.neutral100;
  Color get overlay => AppColors.neutral900.withValues(alpha: 0.5);

  Color get border => AppColors.neutral200;
  Color get borderStrong => AppColors.neutral300;
  Color get outline => AppColors.neutral200;
  Color get divider => AppColors.neutral200;

  Color get textPrimary => AppColors.neutral900;
  Color get textSecondary => AppColors.neutral600;
  Color get textTertiary => AppColors.neutral500;
  Color get textDisabled => AppColors.neutral400;
  Color get textOnPrimary => AppColors.neutral0;

  Color get neutralMuted => AppColors.neutral300;
  Color get neutralForeground => AppColors.neutral700;

  Color get disabled => AppColors.neutral200;
  Color get disabledBorder => AppColors.neutral300;
  Color get hover => AppColors.neutral900.withValues(alpha: 0.04);
  Color get pressed => AppColors.neutral900.withValues(alpha: 0.08);
  Color get focus => AppColors.teal500;

  Color get success => AppColors.success500;
  Color get successLight => AppColors.success100;
  Color get successDark => AppColors.success700;
  Color get successSurface => AppColors.success50;
  Color get onSuccess => AppColors.neutral0;

  Color get warning => AppColors.warning500;
  Color get warningLight => AppColors.warning100;
  Color get warningDark => AppColors.warning700;
  Color get warningSurface => AppColors.warning50;
  Color get onWarning => AppColors.neutral900;

  Color get error => AppColors.error500;
  Color get errorLight => AppColors.error100;
  Color get errorDark => AppColors.error700;
  Color get errorSurface => AppColors.error50;
  Color get onError => AppColors.neutral0;

  Color get info => AppColors.info500;
  Color get infoLight => AppColors.info100;
  Color get infoDark => AppColors.info700;
  Color get infoSurface => AppColors.info50;
  Color get onInfo => AppColors.neutral0;

  Color get danger => error;
  Color get dangerLight => errorLight;
  Color get dangerDark => errorDark;
  Color get dangerSurface => errorSurface;
  Color get onDanger => onError;

  Color get revenue => AppColors.success500;
  Color get expense => AppColors.error500;
  Color get pending => AppColors.warning500;
  Color get completed => AppColors.success50;
  Color get cancelled => AppColors.neutral300;
  Color get lowStock => AppColors.warning500;
  Color get outOfStock => AppColors.error500;

  // Surface tiers — untuk membedakan kedalaman layer
  Color get surfaceSubtle => AppColors.neutral50;
  Color get surfaceSelected => AppColors.teal50;
  Color get surfaceDeep => AppColors.neutral100;

  // Icon container
  Color get iconContainerPrimary => AppColors.teal50;
  Color get iconContainerNeutral => AppColors.neutral100;
  Color get iconContainerSuccess => AppColors.success50;
  Color get iconContainerWarning => AppColors.warning50;
  Color get iconContainerError => AppColors.error50;
  Color get iconContainerInfo => AppColors.info50;

  // Focus ring
  Color get focusRing => AppColors.teal500.withValues(alpha: 0.3);
}
