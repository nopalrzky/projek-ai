import 'package:flutter/material.dart';
import 'spacing_values.dart';

@immutable
class AppSpacing {
  const AppSpacing();

  double get xxs => SpacingValues.xxs;

  double get xs => SpacingValues.xs;

  double get sm => SpacingValues.sm;

  double get md => SpacingValues.md;

  double get lg => SpacingValues.lg;

  double get xl => SpacingValues.xl;

  double get xxl => SpacingValues.xxl;

  double get xxxl => SpacingValues.xxl;

  _InsetsAll get insetsAll => const _InsetsAll();

  _InsetsHorizontal get insetsHorizontal => const _InsetsHorizontal();

  _InsetsVertical get insetsVertical => const _InsetsVertical();

  EdgeInsets only({double? left, double? top, double? right, double? bottom}) {
    return EdgeInsets.only(
      left: left ?? 0,
      top: top ?? 0,
      right: right ?? 0,
      bottom: bottom ?? 0,
    );
  }
}

@immutable
class _InsetsAll {
  const _InsetsAll();

  EdgeInsets get xxs => const EdgeInsets.all(SpacingValues.xxs);
  EdgeInsets get xs => const EdgeInsets.all(SpacingValues.xs);
  EdgeInsets get sm => const EdgeInsets.all(SpacingValues.sm);
  EdgeInsets get md => const EdgeInsets.all(SpacingValues.md);
  EdgeInsets get lg => const EdgeInsets.all(SpacingValues.lg);
  EdgeInsets get xl => const EdgeInsets.all(SpacingValues.xl);
  EdgeInsets get xxl => const EdgeInsets.all(SpacingValues.xxl);
}

@immutable
class _InsetsHorizontal {
  const _InsetsHorizontal();

  EdgeInsets get xxs =>
      const EdgeInsets.symmetric(horizontal: SpacingValues.xxs);
  EdgeInsets get xs => const EdgeInsets.symmetric(horizontal: SpacingValues.xs);
  EdgeInsets get sm => const EdgeInsets.symmetric(horizontal: SpacingValues.sm);
  EdgeInsets get md => const EdgeInsets.symmetric(horizontal: SpacingValues.md);
  EdgeInsets get lg => const EdgeInsets.symmetric(horizontal: SpacingValues.lg);
  EdgeInsets get xl => const EdgeInsets.symmetric(horizontal: SpacingValues.xl);
  EdgeInsets get xxl =>
      const EdgeInsets.symmetric(horizontal: SpacingValues.xxl);
}

@immutable
class _InsetsVertical {
  const _InsetsVertical();

  EdgeInsets get xxs => const EdgeInsets.symmetric(vertical: SpacingValues.xxs);
  EdgeInsets get xs => const EdgeInsets.symmetric(vertical: SpacingValues.xs);
  EdgeInsets get sm => const EdgeInsets.symmetric(vertical: SpacingValues.sm);
  EdgeInsets get md => const EdgeInsets.symmetric(vertical: SpacingValues.md);
  EdgeInsets get lg => const EdgeInsets.symmetric(vertical: SpacingValues.lg);
  EdgeInsets get xl => const EdgeInsets.symmetric(vertical: SpacingValues.xl);
  EdgeInsets get xxl => const EdgeInsets.symmetric(vertical: SpacingValues.xxl);
}
