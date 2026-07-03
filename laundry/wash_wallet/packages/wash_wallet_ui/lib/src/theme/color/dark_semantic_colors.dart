import 'package:flutter/material.dart';

import 'app_dark_colors.dart';
import 'semantic_colors.dart';

class DarkSemanticColors extends SemanticColors {
  const DarkSemanticColors();

  @override
  Color get primary => AppDarkColors.primary500;

  @override
  Color get onPrimary => AppDarkColors.textPrimary;

  @override
  Color get primaryDark => AppDarkColors.primary300;

  @override
  Color get primaryLight => AppDarkColors.primary200;

  @override
  Color get primarySurface => AppDarkColors.primary200;

  @override
  Color get secondary => AppDarkColors.secondary500;

  @override
  Color get onSecondary => AppDarkColors.textPrimary;

  @override
  Color get secondaryDark => AppDarkColors.secondary300;

  @override
  Color get secondaryLight => AppDarkColors.secondary800;

  @override
  Color get secondarySurface => AppDarkColors.secondary100;

  @override
  Color get background => AppDarkColors.background;

  @override
  Color get surface => AppDarkColors.surface;

  @override
  Color get surfaceElevated => AppDarkColors.surfaceElevated;

  @override
  Color get surfaceVariant => AppDarkColors.surfaceMuted;

  @override
  Color get surfaceMuted => AppDarkColors.surfaceMuted;

  @override
  Color get overlay => AppDarkColors.gray50.withValues(alpha: 0.82);

  @override
  Color get border => AppDarkColors.border;

  @override
  Color get borderStrong => AppDarkColors.borderHover;

  @override
  Color get outline => AppDarkColors.border;

  @override
  Color get divider => AppDarkColors.borderLight;

  @override
  Color get borderLight => AppDarkColors.borderLight;

  @override
  Color get borderHover => AppDarkColors.borderHover;

  @override
  Color get textPrimary => AppDarkColors.textPrimary;

  @override
  Color get textSecondary => AppDarkColors.textSecondary;

  @override
  Color get textTertiary => AppDarkColors.textTertiary;

  @override
  Color get textDisabled => AppDarkColors.gray400;

  @override
  Color get textOnPrimary => AppDarkColors.textPrimary;

  @override
  Color get neutralMuted => AppDarkColors.gray500;

  @override
  Color get neutralForeground => AppDarkColors.gray800;

  @override
  Color get disabled => AppDarkColors.gray300;

  @override
  Color get disabledBorder => AppDarkColors.gray400;

  @override
  Color get hover => AppDarkColors.textPrimary.withValues(alpha: 0.08);

  @override
  Color get pressed => AppDarkColors.textPrimary.withValues(alpha: 0.12);

  @override
  Color get focus => AppDarkColors.primary600;

  @override
  Color get success => AppDarkColors.success500;

  @override
  Color get successLight => AppDarkColors.success700;

  @override
  Color get successDark => AppDarkColors.success300;

  @override
  Color get successSurface => AppDarkColors.success500.withValues(alpha: 0.12);

  @override
  Color get onSuccess => AppDarkColors.gray50;

  @override
  Color get warning => AppDarkColors.warning500;

  @override
  Color get warningLight => AppDarkColors.warning700;

  @override
  Color get warningDark => AppDarkColors.warning300;

  @override
  Color get warningSurface => AppDarkColors.warning500.withValues(alpha: 0.12);

  @override
  Color get onWarning => AppDarkColors.gray50;

  @override
  Color get error => AppDarkColors.error500;

  @override
  Color get errorLight => AppDarkColors.error700;

  @override
  Color get errorDark => AppDarkColors.error300;

  @override
  Color get errorSurface => AppDarkColors.error500.withValues(alpha: 0.12);

  @override
  Color get onError => AppDarkColors.textPrimary;

  @override
  Color get info => AppDarkColors.info500;

  @override
  Color get infoLight => AppDarkColors.info700;

  @override
  Color get infoDark => AppDarkColors.info300;

  @override
  Color get infoSurface => AppDarkColors.info500.withValues(alpha: 0.12);

  @override
  Color get onInfo => AppDarkColors.gray50;

  @override
  Color get revenue => AppDarkColors.success500;

  @override
  Color get expense => AppDarkColors.error500;

  @override
  Color get pending => AppDarkColors.warning500;

  @override
  Color get completed => AppDarkColors.success500.withValues(alpha: 0.16);

  @override
  Color get cancelled => AppDarkColors.gray500;

  @override
  Color get lowStock => AppDarkColors.warning500;

  @override
  Color get outOfStock => AppDarkColors.error500;

  @override
  Color get surfaceSubtle => AppDarkColors.surfaceMuted;

  @override
  Color get surfaceSelected => AppDarkColors.suggestionSelected;

  @override
  Color get surfaceDeep => AppDarkColors.background;

  @override
  Color get iconContainerPrimary =>
      AppDarkColors.primary500.withValues(alpha: 0.12);

  @override
  Color get iconContainerNeutral => AppDarkColors.gray300;

  @override
  Color get iconContainerSuccess =>
      AppDarkColors.success500.withValues(alpha: 0.12);

  @override
  Color get iconContainerWarning =>
      AppDarkColors.warning500.withValues(alpha: 0.12);

  @override
  Color get iconContainerError =>
      AppDarkColors.error500.withValues(alpha: 0.12);

  @override
  Color get iconContainerInfo => AppDarkColors.info500.withValues(alpha: 0.12);

  @override
  Color get focusRing => AppDarkColors.ring;

  @override
  Color get accent => AppDarkColors.accent500;

  @override
  Color get onAccent => AppDarkColors.gray50;

  @override
  Color get accentSurface => AppDarkColors.accent500.withValues(alpha: 0.12);
}
