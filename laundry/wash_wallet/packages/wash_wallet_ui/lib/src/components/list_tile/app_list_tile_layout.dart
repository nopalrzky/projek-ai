import 'app_list_tile_size.dart';

class AppListTileLayout {
  AppListTileLayout._();

  static const double leadingSizeSmall = 32.0;
  static const double leadingSizeMedium = 40.0;
  static const double leadingSizeLarge = 48.0;

  static double getLeadingSize(AppListTileSize size) {
    switch (size) {
      case AppListTileSize.sm:
        return leadingSizeSmall;
      case AppListTileSize.md:
        return leadingSizeMedium;
      case AppListTileSize.lg:
        return leadingSizeLarge;
    }
  }

  static const double borderRadiusSmall = 8.0;
  static const double borderRadiusMedium = 12.0;
  static const double borderRadiusLarge = 12.0;

  static double getBorderRadius(AppListTileSize size) {
    switch (size) {
      case AppListTileSize.sm:
        return borderRadiusSmall;
      case AppListTileSize.md:
        return borderRadiusMedium;
      case AppListTileSize.lg:
        return borderRadiusLarge;
    }
  }
}
