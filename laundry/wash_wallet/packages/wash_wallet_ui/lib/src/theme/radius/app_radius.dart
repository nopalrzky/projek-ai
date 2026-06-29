import 'package:flutter/material.dart';
import 'radius_values.dart';

@immutable
class AppRadius {
  const AppRadius();

  double get none => RadiusValues.none;

  double get xs => RadiusValues.xs;

  double get sm => RadiusValues.sm;

  double get md => RadiusValues.md;

  double get lg => RadiusValues.lg;

  double get xl => RadiusValues.xl;

  double get xxl => RadiusValues.xxl;

  double get full => RadiusValues.full;

  _RadiusAll get all => const _RadiusAll();

  _RadiusTop get top => const _RadiusTop();

  _RadiusBottom get bottom => const _RadiusBottom();

  _RadiusLeft get left => const _RadiusLeft();

  _RadiusRight get right => const _RadiusRight();

  BorderRadius only({
    double? topLeft,
    double? topRight,
    double? bottomLeft,
    double? bottomRight,
  }) {
    return BorderRadius.only(
      topLeft: Radius.circular(topLeft ?? 0),
      topRight: Radius.circular(topRight ?? 0),
      bottomLeft: Radius.circular(bottomLeft ?? 0),
      bottomRight: Radius.circular(bottomRight ?? 0),
    );
  }
}

@immutable
class _RadiusAll {
  const _RadiusAll();

  BorderRadius get none => BorderRadius.circular(RadiusValues.none);
  BorderRadius get xs => BorderRadius.circular(RadiusValues.xs);
  BorderRadius get sm => BorderRadius.circular(RadiusValues.sm);
  BorderRadius get md => BorderRadius.circular(RadiusValues.md);
  BorderRadius get lg => BorderRadius.circular(RadiusValues.lg);
  BorderRadius get xl => BorderRadius.circular(RadiusValues.xl);
  BorderRadius get xxl => BorderRadius.circular(RadiusValues.xxl);
  BorderRadius get full => BorderRadius.circular(RadiusValues.full);
}

@immutable
class _RadiusTop {
  const _RadiusTop();

  BorderRadius get none =>
      const BorderRadius.vertical(top: Radius.circular(RadiusValues.none));
  BorderRadius get xs =>
      const BorderRadius.vertical(top: Radius.circular(RadiusValues.xs));
  BorderRadius get sm =>
      const BorderRadius.vertical(top: Radius.circular(RadiusValues.sm));
  BorderRadius get md =>
      const BorderRadius.vertical(top: Radius.circular(RadiusValues.md));
  BorderRadius get lg =>
      const BorderRadius.vertical(top: Radius.circular(RadiusValues.lg));
  BorderRadius get xl =>
      const BorderRadius.vertical(top: Radius.circular(RadiusValues.xl));
  BorderRadius get xxl =>
      const BorderRadius.vertical(top: Radius.circular(RadiusValues.xxl));
  BorderRadius get full =>
      const BorderRadius.vertical(top: Radius.circular(RadiusValues.full));
}

@immutable
class _RadiusBottom {
  const _RadiusBottom();

  BorderRadius get none =>
      const BorderRadius.vertical(bottom: Radius.circular(RadiusValues.none));
  BorderRadius get xs =>
      const BorderRadius.vertical(bottom: Radius.circular(RadiusValues.xs));
  BorderRadius get sm =>
      const BorderRadius.vertical(bottom: Radius.circular(RadiusValues.sm));
  BorderRadius get md =>
      const BorderRadius.vertical(bottom: Radius.circular(RadiusValues.md));
  BorderRadius get lg =>
      const BorderRadius.vertical(bottom: Radius.circular(RadiusValues.lg));
  BorderRadius get xl =>
      const BorderRadius.vertical(bottom: Radius.circular(RadiusValues.xl));
  BorderRadius get xxl =>
      const BorderRadius.vertical(bottom: Radius.circular(RadiusValues.xxl));
  BorderRadius get full =>
      const BorderRadius.vertical(bottom: Radius.circular(RadiusValues.full));
}

@immutable
class _RadiusLeft {
  const _RadiusLeft();

  BorderRadius get none =>
      const BorderRadius.horizontal(left: Radius.circular(RadiusValues.none));
  BorderRadius get xs =>
      const BorderRadius.horizontal(left: Radius.circular(RadiusValues.xs));
  BorderRadius get sm =>
      const BorderRadius.horizontal(left: Radius.circular(RadiusValues.sm));
  BorderRadius get md =>
      const BorderRadius.horizontal(left: Radius.circular(RadiusValues.md));
  BorderRadius get lg =>
      const BorderRadius.horizontal(left: Radius.circular(RadiusValues.lg));
  BorderRadius get xl =>
      const BorderRadius.horizontal(left: Radius.circular(RadiusValues.xl));
  BorderRadius get xxl =>
      const BorderRadius.horizontal(left: Radius.circular(RadiusValues.xxl));
  BorderRadius get full =>
      const BorderRadius.horizontal(left: Radius.circular(RadiusValues.full));
}

@immutable
class _RadiusRight {
  const _RadiusRight();

  BorderRadius get none =>
      const BorderRadius.horizontal(right: Radius.circular(RadiusValues.none));
  BorderRadius get xs =>
      const BorderRadius.horizontal(right: Radius.circular(RadiusValues.xs));
  BorderRadius get sm =>
      const BorderRadius.horizontal(right: Radius.circular(RadiusValues.sm));
  BorderRadius get md =>
      const BorderRadius.horizontal(right: Radius.circular(RadiusValues.md));
  BorderRadius get lg =>
      const BorderRadius.horizontal(right: Radius.circular(RadiusValues.lg));
  BorderRadius get xl =>
      const BorderRadius.horizontal(right: Radius.circular(RadiusValues.xl));
  BorderRadius get xxl =>
      const BorderRadius.horizontal(right: Radius.circular(RadiusValues.xxl));
  BorderRadius get full =>
      const BorderRadius.horizontal(right: Radius.circular(RadiusValues.full));
}
