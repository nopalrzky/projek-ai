import 'package:flutter_test/flutter_test.dart';
import 'package:wash_wallet_ui/src/theme/responsive/app_breakpoints.dart';
import 'package:wash_wallet_ui/src/theme/density/app_density.dart';

void main() {
  group('AppDensity', () {
    test('modeForSizeClass returns compact for compact', () {
      expect(
        AppDensity.modeForSizeClass(WindowSizeClass.compact),
        equals(AppDensityMode.compact),
      );
    });

    test('modeForSizeClass returns compact for medium', () {
      expect(
        AppDensity.modeForSizeClass(WindowSizeClass.medium),
        equals(AppDensityMode.compact),
      );
    });

    test('modeForSizeClass returns standard for expanded and large', () {
      expect(
        AppDensity.modeForSizeClass(WindowSizeClass.expanded),
        equals(AppDensityMode.standard),
      );
      expect(
        AppDensity.modeForSizeClass(WindowSizeClass.large),
        equals(AppDensityMode.standard),
      );
    });
  });
}
