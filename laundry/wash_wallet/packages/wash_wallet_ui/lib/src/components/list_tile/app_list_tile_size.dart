enum AppListTileSize { sm, md, lg }

extension AppListTileSizeExtension on AppListTileSize {
  String get verticalPaddingKey {
    switch (this) {
      case AppListTileSize.sm:
        return 'sm';
      case AppListTileSize.md:
        return 'md';
      case AppListTileSize.lg:
        return 'lg';
    }
  }

  String get horizontalPaddingKey {
    switch (this) {
      case AppListTileSize.sm:
        return 'md';
      case AppListTileSize.md:
        return 'lg';
      case AppListTileSize.lg:
        return 'lg';
    }
  }

  String get leadingGapKey {
    switch (this) {
      case AppListTileSize.sm:
        return 'sm';
      case AppListTileSize.md:
        return 'md';
      case AppListTileSize.lg:
        return 'md';
    }
  }

  String get titleSubtitleGapKey {
    switch (this) {
      case AppListTileSize.sm:
        return 'xs';
      case AppListTileSize.md:
        return 'xs';
      case AppListTileSize.lg:
        return 'sm';
    }
  }

  String get trailingGapKey {
    switch (this) {
      case AppListTileSize.sm:
        return 'sm';
      case AppListTileSize.md:
        return 'md';
      case AppListTileSize.lg:
        return 'md';
    }
  }

  double get minHeight {
    switch (this) {
      case AppListTileSize.sm:
        return 48.0;
      case AppListTileSize.md:
        return 56.0;
      case AppListTileSize.lg:
        return 72.0;
    }
  }
}
