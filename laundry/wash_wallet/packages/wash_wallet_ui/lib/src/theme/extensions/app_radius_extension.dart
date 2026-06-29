import 'package:flutter/material.dart';
import '../radius/app_radius.dart';


@immutable
class AppRadiusExtension extends ThemeExtension<AppRadiusExtension> {
  final AppRadius radius;

  const AppRadiusExtension._({required this.radius});

  factory AppRadiusExtension.light() {
    return const AppRadiusExtension._(radius: AppRadius());
  }

  factory AppRadiusExtension.dark() {
    return const AppRadiusExtension._(radius: AppRadius());
  }

  double get none => radius.none;

  double get xs => radius.xs;

  double get sm => radius.sm;

  double get md => radius.md;

  double get lg => radius.lg;

  double get xl => radius.xl;

  double get full => radius.full;

  get all => radius.all;

  get top => radius.top;

  get bottom => radius.bottom;

  get left => radius.left;

  get right => radius.right;

  BorderRadius only({
    double? topLeft,
    double? topRight,
    double? bottomLeft,
    double? bottomRight,
  }) {
    return radius.only(
      topLeft: topLeft,
      topRight: topRight,
      bottomLeft: bottomLeft,
      bottomRight: bottomRight,
    );
  }

  @override
  ThemeExtension<AppRadiusExtension> copyWith({AppRadius? radius}) {
    return AppRadiusExtension._(radius: radius ?? this.radius);
  }

  @override
  ThemeExtension<AppRadiusExtension> lerp(
    covariant ThemeExtension<AppRadiusExtension>? other,
    double t,
  ) {
    if (other is! AppRadiusExtension) {
      return this;
    }

    return t < 0.5 ? this : other;
  }
}
extension RadiusContext on BuildContext {
  AppRadiusExtension get radius {
    final extension = Theme.of(this).extension<AppRadiusExtension>();
    assert(
      extension != null,
      'AppRadiusExtension is not registered in ThemeData. '
      'Add AppRadiusExtension.light() or AppRadiusExtension.dark() '
      'to ThemeData.extensions',
    );
    return extension!;
  }
}
