import 'package:flutter/material.dart';
import 'app_color_extension.dart';
import 'app_typography_extension.dart';
import 'app_spacing_extension.dart';
import 'app_radius_extension.dart';

extension ThemeContextExtension on BuildContext {
  AppColorExtension get colors {
    final extension = Theme.of(this).extension<AppColorExtension>();
    assert(
      extension != null,
      'AppColorExtension is not registered in ThemeData. '
      'Add AppColorExtension.light() or AppColorExtension.dark() '
      'to ThemeData.extensions',
    );
    return extension!;
  }

  AppTypographyExtension get typography {
    final extension = Theme.of(this).extension<AppTypographyExtension>();
    assert(
      extension != null,
      'AppTypographyExtension is not registered in ThemeData. '
      'Add AppTypographyExtension.light() or AppTypographyExtension.dark() '
      'to ThemeData.extensions',
    );
    return extension!;
  }

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

  ThemeData get theme => Theme.of(this);

  bool get isDarkMode => theme.brightness == Brightness.dark;

  bool get isLightMode => theme.brightness == Brightness.light;
}
