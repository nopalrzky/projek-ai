import 'package:flutter/material.dart';
import '../spacing/app_spacing.dart';

@immutable
class AppSpacingExtension extends ThemeExtension<AppSpacingExtension> {
  final AppSpacing spacing;

  const AppSpacingExtension._({required this.spacing});

  factory AppSpacingExtension.light() {
    return const AppSpacingExtension._(spacing: AppSpacing());
  }

  factory AppSpacingExtension.dark() {
    return const AppSpacingExtension._(spacing: AppSpacing());
  }

  double get xxs => spacing.xxs;

  double get xs => spacing.xs;

  double get sm => spacing.sm;

  double get md => spacing.md;

  double get lg => spacing.lg;

  double get xl => spacing.xl;

  double get xxl => spacing.xxl;

  double get xxxl => spacing.xxxl;

  get insetsAll => spacing.insetsAll;

  get insetsHorizontal => spacing.insetsHorizontal;

  get insetsVertical => spacing.insetsVertical;

  EdgeInsets only({double? left, double? top, double? right, double? bottom}) {
    return spacing.only(left: left, top: top, right: right, bottom: bottom);
  }

  @override
  ThemeExtension<AppSpacingExtension> copyWith({AppSpacing? spacing}) {
    return AppSpacingExtension._(spacing: spacing ?? this.spacing);
  }

  @override
  ThemeExtension<AppSpacingExtension> lerp(
    covariant ThemeExtension<AppSpacingExtension>? other,
    double t,
  ) {
    if (other is! AppSpacingExtension) {
      return this;
    }

    return t < 0.5 ? this : other;
  }
}

extension SpacingContext on BuildContext {
  AppSpacingExtension get space {
    final extension = Theme.of(this).extension<AppSpacingExtension>();
    assert(
      extension != null,
      'AppSpacingExtension is not registered in ThemeData. '
      'Add AppSpacingExtension.light() or AppSpacingExtension.dark() '
      'to ThemeData.extensions',
    );
    return extension!;
  }
}
