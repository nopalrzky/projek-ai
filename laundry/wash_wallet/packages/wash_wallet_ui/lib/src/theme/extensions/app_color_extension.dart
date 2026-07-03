import 'package:flutter/material.dart';
import '../color/semantic_colors.dart';
import '../color/dark_semantic_colors.dart';

@immutable
class AppColorExtension extends ThemeExtension<AppColorExtension> {
  final SemanticColors colors;

  const AppColorExtension._({required this.colors});

  factory AppColorExtension.light() {
    return const AppColorExtension._(colors: SemanticColors());
  }

  factory AppColorExtension.dark() {
    return const AppColorExtension._(colors: DarkSemanticColors());
  }
  Color get primary => colors.primary;
  Color get onPrimary => colors.onPrimary;
  Color get primaryDark => colors.primaryDark;
  Color get primaryLight => colors.primaryLight;
  Color get primarySurface => colors.primarySurface;
  Color get secondary => colors.secondary;
  Color get onSecondary => colors.onSecondary;
  Color get secondaryDark => colors.secondaryDark;
  Color get secondaryLight => colors.secondaryLight;
  Color get secondarySurface => colors.secondarySurface;
  Color get background => colors.background;
  Color get onBackground => colors.textPrimary;
  Color get surface => colors.surface;
  Color get onSurface => colors.textPrimary;
  Color get surfaceElevated => colors.surfaceElevated;
  Color get surfaceVariant => colors.surfaceVariant;
  Color get surfaceMuted => colors.surfaceMuted;
  Color get surfaceContainerHighest => colors.surfaceVariant;
  Color get onSurfaceVariant => colors.textSecondary;
  Color get primaryContainer => colors.primaryLight;
  Color get tertiary => colors.secondary;
  Color get onTertiary => colors.onSecondary;
  Color get overlay => colors.overlay;
  Color get border => colors.border;
  Color get borderStrong => colors.borderStrong;
  Color get borderLight => colors.borderLight;
  Color get borderHover => colors.borderHover;
  Color get outline => colors.outline;
  Color get outlineVariant => colors.divider;
  Color get divider => colors.divider;
  Color get neutralMuted => colors.neutralMuted;
  Color get neutralForeground => colors.neutralForeground;
  Color get textPrimary => colors.textPrimary;
  Color get textSecondary => colors.textSecondary;
  Color get textTertiary => colors.textTertiary;
  Color get textDisabled => colors.textDisabled;
  Color get textOnPrimary => colors.textOnPrimary;
  Color get disabled => colors.disabled;
  Color get disabledBorder => colors.disabledBorder;
  Color get hover => colors.hover;
  Color get pressed => colors.pressed;
  Color get focus => colors.focus;
  Color get success => colors.success;
  Color get successLight => colors.successLight;
  Color get successDark => colors.successDark;
  Color get successSurface => colors.successSurface;
  Color get onSuccess => colors.onSuccess;
  Color get warning => colors.warning;
  Color get warningLight => colors.warningLight;
  Color get warningDark => colors.warningDark;
  Color get warningSurface => colors.warningSurface;
  Color get onWarning => colors.onWarning;
  Color get error => colors.error;
  Color get errorLight => colors.errorLight;
  Color get errorDark => colors.errorDark;
  Color get errorSurface => colors.errorSurface;
  Color get errorContainer => colors.errorSurface;
  Color get onErrorContainer => colors.error;
  Color get onError => colors.onError;
  Color get info => colors.info;
  Color get infoLight => colors.infoLight;
  Color get infoDark => colors.infoDark;
  Color get infoSurface => colors.infoSurface;
  Color get onInfo => colors.onInfo;
  Color get danger => colors.danger;
  Color get dangerLight => colors.dangerLight;
  Color get dangerDark => colors.dangerDark;
  Color get surfaceSubtle => colors.surfaceSubtle;
  Color get surfaceSelected => colors.surfaceSelected;
  Color get surfaceDeep => colors.surfaceDeep;
  Color get iconContainerNeutral => colors.iconContainerNeutral;
  Color get iconContainerPrimary => colors.iconContainerPrimary;
  Color get iconContainerSuccess => colors.iconContainerSuccess;
  Color get iconContainerWarning => colors.iconContainerWarning;
  Color get iconContainerError => colors.iconContainerError;
  Color get iconContainerInfo => colors.iconContainerInfo;
  Color get focusRing => colors.focusRing;
  Color get accent => colors.accent;
  Color get onAccent => colors.onAccent;
  Color get accentSurface => colors.accentSurface;
  Color get revenue => colors.revenue;
  Color get expense => colors.expense;
  Color get pending => colors.pending;
  Color get completed => colors.completed;
  Color get cancelled => colors.cancelled;
  Color get lowStock => colors.lowStock;
  Color get outOfStock => colors.outOfStock;

  @override
  ThemeExtension<AppColorExtension> copyWith({SemanticColors? colors}) {
    return AppColorExtension._(colors: colors ?? this.colors);
  }

  @override
  ThemeExtension<AppColorExtension> lerp(
    covariant ThemeExtension<AppColorExtension>? other,
    double t,
  ) {
    if (other is! AppColorExtension) {
      return this;
    }
    return t < 0.5 ? this : other;
  }
}
